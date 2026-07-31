import { InventoryRepository } from "@/repositories/inventory.repository";
import { InventoryLevel } from "@/types/inventory.types";

export class InventoryService {
  private repository: InventoryRepository;

  constructor() {
    this.repository = new InventoryRepository();
  }

  /**
   * Get stock availability for a variant.
   */
  async getStockAvailability(
    variantId: string,
    warehouseId?: string
  ): Promise<{
    available: number;
    reserved: number;
    status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  }> {
    const levels = await this.repository.getStockLevel(variantId, warehouseId);

    if (!levels || levels.length === 0) {
      return { available: 0, reserved: 0, status: "OUT_OF_STOCK" };
    }

    const available = levels.reduce((sum, l) => sum + l.quantity_available, 0);
    const reserved = levels.reduce((sum, l) => sum + l.quantity_reserved, 0);
    const lowStockThreshold = Math.max(
      ...levels.map((l) => l.reorder_point || 0)
    );

    let status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" = "IN_STOCK";
    if (available === 0) {
      status = "OUT_OF_STOCK";
    } else if (available <= lowStockThreshold) {
      status = "LOW_STOCK";
    }

    return { available, reserved, status };
  }

  /**
   * Reserve stock (called when order is placed).
   */
  async reserveStock(
    variantId: string,
    warehouseId: string,
    quantity: number
  ): Promise<void> {
    await this.repository.reserveStock(variantId, warehouseId, quantity);
    await this.repository.recordMovement({
      variant_id: variantId,
      warehouse_id: warehouseId,
      movement_type: "RESERVE",
      quantity,
      notes: `Reserved ${quantity} units`,
    });
  }

  /**
   * Release reserved stock (called on order cancellation).
   */
  async releaseStock(
    variantId: string,
    warehouseId: string,
    quantity: number
  ): Promise<void> {
    await this.repository.releaseStock(variantId, warehouseId, quantity);
    await this.repository.recordMovement({
      variant_id: variantId,
      warehouse_id: warehouseId,
      movement_type: "RELEASE",
      quantity,
      notes: `Released ${quantity} units`,
    });
  }

  /**
   * Reduce stock permanently (called when order is shipped).
   */
  async reduceStock(
    variantId: string,
    warehouseId: string,
    quantity: number
  ): Promise<void> {
    // Usually shipped from reserved stock
    await this.repository.reduceStock(variantId, warehouseId, quantity, true);
    await this.repository.recordMovement({
      variant_id: variantId,
      warehouse_id: warehouseId,
      movement_type: "SHIP",
      quantity,
      notes: `Shipped ${quantity} units`,
    });
  }

  /**
   * Manually adjust stock.
   */
  async adjustStock(
    inventoryId: string,
    newAvailable: number,
    newReserved: number,
    reason: string
  ): Promise<void> {
    await this.repository.adjustStock(
      inventoryId,
      newAvailable,
      newReserved,
      reason
    );
  }

  /**
   * Get all inventory paginated
   */
  async getAllInventory(
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: InventoryLevel[]; total: number }> {
    return await this.repository.getAllInventoryLevels(page, limit);
  }

  /**
   * Transfer stock between warehouses
   */
  async transferStock(
    variantId: string,
    fromWarehouseId: string,
    toWarehouseId: string,
    quantity: number,
    reason: string,
    notes?: string
  ): Promise<void> {
    await this.repository.transferStock(
      variantId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      reason,
      notes
    );
    await this.checkStockAlerts(variantId, fromWarehouseId);
    await this.checkStockAlerts(variantId, toWarehouseId);
  }

  /**
   * Get paginated movements
   */
  async getMovements(
    page: number = 1,
    limit: number = 20,
    warehouseId?: string,
    variantId?: string
  ) {
    return await this.repository.getMovements(
      page,
      limit,
      warehouseId,
      variantId
    );
  }

  /**
   * Check stock levels and create alerts if needed
   */
  async checkStockAlerts(
    variantId: string,
    warehouseId: string
  ): Promise<void> {
    const levels = await this.repository.getStockLevel(variantId, warehouseId);
    if (!levels || levels.length === 0) return;

    const level = levels[0];
    const { createAdminClient } = require("@/lib/supabase/admin-client");
    const supabase = createAdminClient();

    let alertType = null;
    let severity = null;
    let title = "";

    if (level.quantity_available < 0) {
      alertType = "NEGATIVE_STOCK";
      severity = "CRITICAL";
      title = `Negative Stock Alert for Variant ${variantId}`;
    } else if (level.quantity_available === 0) {
      alertType = "OUT_OF_STOCK";
      severity = "WARNING";
      title = `Out of Stock Alert for Variant ${variantId}`;
    } else if (level.quantity_available <= (level.reorder_point || 0)) {
      alertType = "LOW_STOCK";
      severity = "INFO";
      title = `Low Stock Alert for Variant ${variantId}`;
    }

    if (alertType) {
      // Check if active alert already exists
      const { data: existing } = await supabase
        .from("system_alerts")
        .select("id")
        .eq("alert_type", alertType)
        .eq("status", "ACTIVE")
        .contains("metadata", {
          variant_id: variantId,
          warehouse_id: warehouseId,
        })
        .limit(1)
        .maybeSingle();

      if (!existing) {
        await supabase.from("system_alerts").insert({
          alert_type: alertType,
          severity,
          title,
          description: `Stock level for variant ${variantId} at warehouse ${warehouseId} has triggered a ${alertType} alert. Current available: ${level.quantity_available}.`,
          status: "ACTIVE",
          metadata: {
            variant_id: variantId,
            warehouse_id: warehouseId,
            current_stock: level.quantity_available,
            reorder_point: level.reorder_point,
          },
        });
      }
    }
  }
}
