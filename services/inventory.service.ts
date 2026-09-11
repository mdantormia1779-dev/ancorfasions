import { InventoryRepository } from "@/repositories/inventory.repository";
import { InventoryLevel } from "@/types/inventory.types";
import { createAdminClient } from "@/lib/supabase/admin-client";

// ---------------------------------------------------------------------------
// Application-level error codes surfaced to the checkout / order flow.
// These are thrown as Error objects with a .code property so the caller can
// present a meaningful message without exposing raw PostgreSQL errors.
// ---------------------------------------------------------------------------
export class InventoryError extends Error {
  constructor(
    public readonly code:
      | "OUT_OF_STOCK"
      | "INSUFFICIENT_STOCK"
      | "INVENTORY_NOT_FOUND"
      | "RESERVATION_FAILED"
      | "RELEASE_FAILED"
      | "ALREADY_RESERVED",
    message: string
  ) {
    super(message);
    this.name = "InventoryError";
  }
}

/** Shape of a single item passed to the order-level reservation RPC. */
export interface ReservationItem {
  variant_id: string;
  warehouse_id: string;
  quantity: number;
}

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
    if (available <= 0) {
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

  // ── ORDER-LEVEL ATOMIC RESERVATION METHODS ──────────────────────────────
  // These call the PostgreSQL RPCs defined in migration
  // 20260911000000_atomic_order_inventory_reservation.sql
  // and are the ONLY safe path for checkout inventory management.
  // Never call the per-item reserveStock() in a checkout loop.

  /**
   * Atomically reserve inventory for ALL items in an order in a single
   * PostgreSQL transaction with SELECT ... FOR UPDATE row locking.
   *
   * If any item has insufficient stock the entire reservation fails and
   * PostgreSQL rolls back all changes — no partial reservation is possible.
   *
   * Idempotent: calling twice with the same orderId is a no-op.
   */
  async reserveOrderInventory(
    orderId: string,
    items: ReservationItem[]
  ): Promise<void> {
    if (items.length === 0) {
      throw new InventoryError("RESERVATION_FAILED", "No items to reserve");
    }

    const supabase = createAdminClient();

    const { error } = await supabase.rpc("reserve_order_inventory", {
      p_order_id: orderId,
      p_items: JSON.stringify(items),
    });

    if (error) {
      // Translate PostgreSQL HINT codes into typed application errors.
      const hint = (error as unknown as { hint?: string }).hint ?? "";
      if (hint === "INSUFFICIENT_STOCK" || error.message.includes("Insufficient stock")) {
        throw new InventoryError(
          "INSUFFICIENT_STOCK",
          "One or more items in your order are out of stock. Please update your cart."
        );
      }
      if (hint === "INVENTORY_NOT_FOUND" || error.message.includes("No inventory record")) {
        throw new InventoryError(
          "INVENTORY_NOT_FOUND",
          "Inventory record not found for one or more items."
        );
      }
      throw new InventoryError(
        "RESERVATION_FAILED",
        `Failed to reserve inventory: ${error.message}`
      );
    }
  }

  /**
   * Atomically release ALL reserved inventory for an order back to available.
   * Called on: cancellation, payment failure, reservation expiry.
   * Idempotent — safe to call multiple times.
   */
  async releaseOrderInventory(orderId: string): Promise<void> {
    const supabase = createAdminClient();

    const { error } = await supabase.rpc("release_order_inventory", {
      p_order_id: orderId,
    });

    if (error) {
      throw new InventoryError(
        "RELEASE_FAILED",
        `Failed to release inventory for order ${orderId}: ${error.message}`
      );
    }
  }

  /**
   * Permanently confirm (consume) reserved stock when an order ships.
   * Decrements quantity_reserved; stock has physically left the warehouse.
   * Idempotent — items with inventory_reserved = FALSE are skipped.
   */
  async confirmOrderInventory(orderId: string): Promise<void> {
    const supabase = createAdminClient();

    const { error } = await supabase.rpc("confirm_order_inventory", {
      p_order_id: orderId,
    });

    if (error) {
      throw new InventoryError(
        "RESERVATION_FAILED",
        `Failed to confirm inventory for order ${orderId}: ${error.message}`
      );
    }
  }
}
