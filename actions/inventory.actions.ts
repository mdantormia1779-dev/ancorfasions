"use server";

import { InventoryService } from "@/services/inventory.service";
import { InventoryLevel, InventoryMovement } from "@/types/inventory.types";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";

export async function getAllInventory(
  page: number = 1,
  limit: number = 20
): Promise<{ data?: InventoryLevel[]; total?: number; error?: string }> {
  try {
    const service = new InventoryService();
    const result = await service.getAllInventory(page, limit);
    return { data: result.data, total: result.total };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getStockAvailability(
  variantId: string,
  warehouseId?: string
) {
  try {
    const service = new InventoryService();
    const data = await service.getStockAvailability(variantId, warehouseId);
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function adjustStock(
  inventoryId: string,
  newAvailable: number,
  newReserved: number,
  reason: string
) {
  try {
    const service = new InventoryService();
    await service.adjustStock(inventoryId, newAvailable, newReserved, reason);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function transferStock(
  variantId: string,
  fromWarehouseId: string,
  toWarehouseId: string,
  quantity: number,
  reason: string,
  notes?: string
) {
  try {
    const service = new InventoryService();
    await service.transferStock(
      variantId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      reason,
      notes
    );
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getInventoryMovements(
  page: number = 1,
  limit: number = 20,
  warehouseId?: string,
  variantId?: string
) {
  try {
    const service = new InventoryService();
    const result = await service.getMovements(
      page,
      limit,
      warehouseId,
      variantId
    );
    return { data: result.data, total: result.total };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function receivePurchase(
  poId: string,
  items: { variantId: string; warehouseId: string; quantity: number }[],
  notes?: string
) {
  try {
    // Basic implementation that just adjusts stock upwards for received items
    const service = new InventoryService();
    const { createAdminClient } = require("@/lib/supabase/admin-client");
    const supabase = createAdminClient();

    for (const item of items) {
      // Find current level or create
      const levels = await service.getStockAvailability(
        item.variantId,
        item.warehouseId
      );

      if (
        levels.status === "OUT_OF_STOCK" &&
        levels.available === 0 &&
        levels.reserved === 0
      ) {
        // Need to create a level first if it doesn't exist
        const { data: existing } = await supabase
          .from("inventory_levels")
          .select("id")
          .eq("variant_id", item.variantId)
          .eq("warehouse_id", item.warehouseId)
          .maybeSingle();

        if (existing) {
          await service.adjustStock(
            existing.id,
            item.quantity,
            0,
            "PURCHASE_RECEIPT"
          );
        } else {
          // It doesn't exist, this is complex for MVP, so we just use adjustStock assuming it exists or insert
          const { error: insertError } = await supabase
            .from("inventory_levels")
            .insert({
              variant_id: item.variantId,
              warehouse_id: item.warehouseId,
              quantity_available: item.quantity,
              quantity_reserved: 0,
            });
          if (insertError) throw insertError;

          await supabase.from("stock_movements").insert({
            variant_id: item.variantId,
            warehouse_id: item.warehouseId,
            movement_type: "RECEIPT",
            quantity: item.quantity,
            reference_type: "PO",
            reference_id: poId,
            notes: notes || "Received from PO",
          });
        }
      } else {
        // Get inventory_id and adjust
        const { data: existing } = await supabase
          .from("inventory_levels")
          .select("id, quantity_available, quantity_reserved")
          .eq("variant_id", item.variantId)
          .eq("warehouse_id", item.warehouseId)
          .maybeSingle();

        if (existing) {
          await service.adjustStock(
            existing.id,
            existing.quantity_available + item.quantity,
            existing.quantity_reserved,
            "PURCHASE_RECEIPT"
          );
        }
      }
    }

    // Update PO status to DELIVERED
    await supabase
      .from("procurement_orders")
      .update({ status: "DELIVERED" })
      .eq("id", poId);

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addStockAction(data: {
  variantId: string;
  warehouseId: string;
  quantity: number;
  reason: string;
  notes?: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    if (data.quantity <= 0) throw new Error("Quantity must be greater than zero");
    const supabase = createAdminClient();

    const { data: existing, error: fetchErr } = await supabase
      .from("inventory_levels")
      .select("id, quantity_available")
      .eq("variant_id", data.variantId)
      .eq("warehouse_id", data.warehouseId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (existing) {
      const { error: updateErr } = await supabase
        .from("inventory_levels")
        .update({ quantity_available: existing.quantity_available + data.quantity })
        .eq("id", existing.id);
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await supabase
        .from("inventory_levels")
        .insert({
          variant_id: data.variantId,
          warehouse_id: data.warehouseId,
          quantity_available: data.quantity,
          quantity_reserved: 0,
        });
      if (insertErr) throw insertErr;
    }

    const { error: movErr } = await supabase.from("stock_movements").insert({
      variant_id: data.variantId,
      warehouse_id: data.warehouseId,
      movement_type: "RECEIVE",
      quantity: data.quantity,
      reason_code: data.reason,
      notes: data.notes || `Stock added: ${data.reason}`,
    });
    if (movErr) throw movErr;

    revalidatePath("/admin/inventory/stock");
    revalidatePath("/admin/inventory/movement");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function recordManualMovementAction(data: {
  variantId: string;
  warehouseId: string;
  movementType: "RECEIVE" | "ADJUST" | "DAMAGE" | "RETURN";
  quantity: number;
  reason: string;
  notes?: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    if (data.quantity === 0) throw new Error("Quantity cannot be zero");
    const supabase = createAdminClient();
    const isPositive = ["RECEIVE", "RETURN"].includes(data.movementType);
    const delta = isPositive ? Math.abs(data.quantity) : -Math.abs(data.quantity);

    const { data: existing, error: fetchErr } = await supabase
      .from("inventory_levels")
      .select("id, quantity_available")
      .eq("variant_id", data.variantId)
      .eq("warehouse_id", data.warehouseId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (existing) {
      const newQty = existing.quantity_available + delta;
      if (newQty < 0) throw new Error("Insufficient stock for this adjustment");
      const { error: updateErr } = await supabase
        .from("inventory_levels")
        .update({ quantity_available: newQty })
        .eq("id", existing.id);
      if (updateErr) throw updateErr;
    } else {
      if (delta < 0) throw new Error("No inventory record found for this variant/warehouse");
      const { error: insertErr } = await supabase
        .from("inventory_levels")
        .insert({
          variant_id: data.variantId,
          warehouse_id: data.warehouseId,
          quantity_available: delta,
          quantity_reserved: 0,
        });
      if (insertErr) throw insertErr;
    }

    const { error: movErr } = await supabase.from("stock_movements").insert({
      variant_id: data.variantId,
      warehouse_id: data.warehouseId,
      movement_type: data.movementType,
      quantity: data.quantity,
      reason_code: data.reason,
      notes: data.notes || data.reason,
    });
    if (movErr) throw movErr;

    revalidatePath("/admin/inventory/movement");
    revalidatePath("/admin/inventory/stock");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
