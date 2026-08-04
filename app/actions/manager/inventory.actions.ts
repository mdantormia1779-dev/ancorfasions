"use server";

import { InventoryRepository } from "@/repositories/inventory.repository";

const inventoryRepo = new InventoryRepository();

export async function fetchInventoryAction(limit?: number, search?: string) {
  try {
    const data = await inventoryRepo.getInventoryDashboard(limit, search);
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchInventoryAction error:", error);
    return { success: false, error: error.message };
  }
}
