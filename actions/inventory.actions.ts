"use server";

import { InventoryService } from "@/services/inventory.service";
import { InventoryLevel, InventoryMovement } from "@/types/inventory.types";

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
