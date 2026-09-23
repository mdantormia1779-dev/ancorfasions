"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server-client";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { CourierProviderRecord } from "@/types/shipping.types";
import { CourierRegistry } from "@/services/courier/courier-registry";
import { CourierFactory } from "@/lib/couriers/courier.factory";
import { HealthCheckResult } from "@/lib/couriers/types";
import {
  encryptCredentialsObject,
  maskCredentialsObject,
  isEncryptedValue,
} from "@/utils/encryption.util";

type ActionResponse<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export interface CourierMetrics {
  courierId: string;
  courierCode: string;
  activeShipments: number;
  pendingCOD: number;
  health?: HealthCheckResult;
}

/**
 * Fetch all courier providers with credentials securely masked
 */
export async function getCourierProvidersAction(): Promise<
  ActionResponse<CourierProviderRecord[]>
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courier_providers")
      .select("*")
      .order("priority", { ascending: true });

    if (error) throw error;

    // Mask sensitive fields so secrets never leak to the client
    const sanitized = (data || []).map((provider: any) => ({
      ...provider,
      credentials: maskCredentialsObject(provider.credentials || {}),
    }));

    return { success: true, data: sanitized as CourierProviderRecord[] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Update a courier provider configuration, securely encrypting credentials
 */
export async function updateCourierProviderAction(
  id: string,
  updates: Partial<CourierProviderRecord>
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Prevent overwriting code or id
    const { id: _id, code: _code, created_at, updated_at, credentials, ...allowedUpdates } =
      updates;

    const dbPayload: Record<string, any> = { ...allowedUpdates };

    // If updating credentials, merge with existing and encrypt
    if (credentials && typeof credentials === "object") {
      const { data: existing } = await adminSupabase
        .from("courier_providers")
        .select("credentials")
        .eq("id", id)
        .maybeSingle();

      const existingCreds = existing?.credentials || {};
      const mergedCreds: Record<string, any> = { ...existingCreds };

      for (const [key, val] of Object.entries(credentials)) {
        if (typeof val === "string") {
          // If value is masked (e.g. "••••••••9X21" or "••••••••"), leave existing unchanged
          if (val.startsWith("••••••••")) {
            continue;
          }
          if (val.trim() === "") {
            delete mergedCreds[key];
          } else {
            mergedCreds[key] = val;
          }
        } else {
          mergedCreds[key] = val;
        }
      }

      dbPayload.credentials = encryptCredentialsObject(mergedCreds);
    }

    const { error } = await supabase
      .from("courier_providers")
      .update(dbPayload)
      .eq("id", id);

    if (error) throw error;

    // Invalidate registry cache
    CourierRegistry.getInstance().invalidate();

    revalidatePath("/admin/operations/logistics/couriers");
    revalidatePath("/admin/shipping/couriers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Performs a live health check on a courier provider
 */
export async function testCourierConnectionAction(
  courierId: string
): Promise<ActionResponse<HealthCheckResult>> {
  try {
    const { provider } = await CourierFactory.getProviderFromDatabase(courierId);
    const health = await provider.healthCheck();
    return { success: true, data: health };
  } catch (err: any) {
    return {
      success: true,
      data: {
        status: "unhealthy",
        responseTime: 0,
        lastCheckedAt: new Date().toISOString(),
        message: err.message || "Failed to connect to courier API",
      },
    };
  }
}

/**
 * Calculate real active shipment counts and real pending COD from database
 */
export async function getCourierMetricsAction(): Promise<
  ActionResponse<Record<string, CourierMetrics>>
> {
  try {
    const supabase = createAdminClient();

    // 1. Fetch all providers
    const { data: providers, error: provError } = await supabase
      .from("courier_providers")
      .select("id, code");

    if (provError) throw provError;

    // 2. Fetch shipments
    const { data: shipments, error: shipError } = await supabase
      .from("shipments")
      .select("courier_provider_code, status, cod_amount, is_cod");

    if (shipError) {
      console.warn("Could not query shipments for metrics:", shipError.message);
    }

    const activeStatuses = new Set([
      "created",
      "pickup_requested",
      "pickup_confirmed",
      "picked_up",
      "in_transit",
      "hub_received",
      "out_for_delivery",
      "on_hold",
    ]);

    const metricsMap: Record<string, CourierMetrics> = {};

    for (const p of providers || []) {
      const code = p.code?.toLowerCase();
      let activeCount = 0;
      let pendingCOD = 0;

      for (const s of shipments || []) {
        if (s.courier_provider_code?.toLowerCase() === code) {
          const status = (s.status || "").toLowerCase();
          if (activeStatuses.has(status)) {
            activeCount++;
          }
          // Delivered COD orders awaiting settlement
          if (status === "delivered" && (s.is_cod || Number(s.cod_amount) > 0)) {
            pendingCOD += Number(s.cod_amount) || 0;
          }
        }
      }

      metricsMap[p.id] = {
        courierId: p.id,
        courierCode: p.code,
        activeShipments: activeCount,
        pendingCOD: Math.round(pendingCOD),
      };
    }

    return { success: true, data: metricsMap };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetches recent API logs for a given courier code
 */
export async function getCourierLogsAction(
  courierCode?: string,
  limit = 50
): Promise<ActionResponse<any[]>> {
  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("courier_api_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (courierCode) {
      query = query.eq("courier_code", courierCode);
    }

    const { data, error } = await query;
    if (error) {
      // Table may not exist yet in schema cache
      return { success: true, data: [] };
    }

    return { success: true, data: data || [] };
  } catch {
    return { success: true, data: [] };
  }
}
