"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server-client";
import { CourierProviderRecord } from "@/types/shipping.types";
import { CourierRegistry } from "@/services/courier/courier-registry";

type ActionResponse<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

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

    return { success: true, data: data as CourierProviderRecord[] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateCourierProviderAction(
  id: string,
  updates: Partial<CourierProviderRecord>
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();

    // Prevent overwriting code or id
    const { id: _id, code: _code, created_at, updated_at, ...allowedUpdates } = updates;

    const { error } = await supabase
      .from("courier_providers")
      .update(allowedUpdates)
      .eq("id", id);

    if (error) throw error;

    // Invalidate registry cache
    CourierRegistry.getInstance().invalidate();

    revalidatePath("/admin/operations/logistics/couriers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
