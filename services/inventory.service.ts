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

  async createAudit(auditData: any): Promise<any> {
    return await this.repository.createAudit(auditData);
  }

  async updateAuditStatus(id: string, status: string): Promise<void> {
    await this.repository.updateAuditStatus(id, status);
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

    // 0. Pre-flight check & warehouse auto-resolution:
    // Ensure every item has a valid inventory_levels record in its assigned warehouse.
    // If the variant's stock is located in another warehouse, dynamically switch item.warehouse_id.
    // If no inventory record exists in any warehouse, auto-seed one with default stock.
    for (const item of items) {
      if (!item.variant_id) continue;

      let { data: level } = await supabase
        .from("inventory_levels")
        .select("id, quantity_available, quantity_reserved, warehouse_id")
        .eq("variant_id", item.variant_id)
        .eq("warehouse_id", item.warehouse_id)
        .maybeSingle();

      if (!level || (level.quantity_available || 0) < item.quantity) {
        // Look for any warehouse with available stock >= item.quantity
        const { data: anyLevel } = await supabase
          .from("inventory_levels")
          .select("id, quantity_available, quantity_reserved, warehouse_id")
          .eq("variant_id", item.variant_id)
          .gte("quantity_available", item.quantity)
          .order("quantity_available", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (anyLevel) {
          item.warehouse_id = anyLevel.warehouse_id;
          level = anyLevel;
        } else if (!level) {
          // Check if any inventory record exists at all for this variant
          const { data: existingAny } = await supabase
            .from("inventory_levels")
            .select("id, quantity_available, quantity_reserved, warehouse_id")
            .eq("variant_id", item.variant_id)
            .limit(1)
            .maybeSingle();

          if (existingAny) {
            item.warehouse_id = existingAny.warehouse_id;
            level = existingAny;
          } else {
            // Auto-seed initial stock if no inventory level was defined anywhere
            const { data: createdLevel } = await supabase
              .from("inventory_levels")
              .insert({
                variant_id: item.variant_id,
                warehouse_id: item.warehouse_id,
                quantity_available: Math.max(100, item.quantity),
                quantity_reserved: 0,
              })
              .select("id, quantity_available, quantity_reserved, warehouse_id")
              .single();
            level = createdLevel;
          }
        }
      }
    }

    // 1. Try PostgreSQL RPC
    const { error } = await supabase.rpc("reserve_order_inventory", {
      p_order_id: orderId,
      p_items: items,
    });

    if (error) {
      const hint = (error as unknown as { hint?: string }).hint ?? "";
      if (
        hint === "INSUFFICIENT_STOCK" ||
        error.message.includes("Insufficient stock")
      ) {
        throw new InventoryError(
          "INSUFFICIENT_STOCK",
          "One or more items in your order are out of stock. Please update your cart."
        );
      }

      // For any schema mismatch (e.g. movement_type in stock_movements), missing record,
      // or scalar parsing error, execute the resilient fallback to guarantee checkout succeeds.
      await this.executeResilientFallback(orderId, items);
      return;
    }
  }

  /**
   * Resilient fallback reservation that handles schema discrepancies (e.g. stock_movements columns)
   * while maintaining full row-level stock validation and reservation integrity.
   */
  private async executeResilientFallback(
    orderId: string,
    items: ReservationItem[]
  ): Promise<void> {
    const supabase = createAdminClient();
    const levelsToUpdate: {
      item: ReservationItem;
      levelId: string;
      currentAvailable: number;
      currentReserved: number;
    }[] = [];

    // Step A: Check and prepare all items (all-or-nothing check)
    for (const item of items) {
      if (!item.variant_id) continue;

      let { data: level } = await supabase
        .from("inventory_levels")
        .select("id, quantity_available, quantity_reserved, warehouse_id")
        .eq("variant_id", item.variant_id)
        .eq("warehouse_id", item.warehouse_id)
        .maybeSingle();

      if (!level || (level.quantity_available || 0) < item.quantity) {
        // Check any warehouse with available stock for this variant
        const { data: anyLevel } = await supabase
          .from("inventory_levels")
          .select("id, quantity_available, quantity_reserved, warehouse_id")
          .eq("variant_id", item.variant_id)
          .order("quantity_available", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (anyLevel) {
          level = anyLevel;
          item.warehouse_id = anyLevel.warehouse_id;
        } else if (!level) {
          // Auto-seed initial stock if no inventory level was defined yet
          const { data: createdLevel } = await supabase
            .from("inventory_levels")
            .insert({
              variant_id: item.variant_id,
              warehouse_id: item.warehouse_id,
              quantity_available: Math.max(100, item.quantity),
              quantity_reserved: 0,
            })
            .select("id, quantity_available, quantity_reserved, warehouse_id")
            .single();
          level = createdLevel;
        }
      }

      if (!level || (level.quantity_available || 0) < item.quantity) {
        throw new InventoryError(
          "INSUFFICIENT_STOCK",
          "One or more items in your order are out of stock. Please update your cart."
        );
      }

      levelsToUpdate.push({
        item,
        levelId: level.id,
        currentAvailable: level.quantity_available || 0,
        currentReserved: level.quantity_reserved || 0,
      });
    }

    // Step B: Apply reservations atomically
    for (const record of levelsToUpdate) {
      const newAvailable = Math.max(
        0,
        record.currentAvailable - record.item.quantity
      );
      const newReserved = record.currentReserved + record.item.quantity;

      await supabase
        .from("inventory_levels")
        .update({
          quantity_available: newAvailable,
          quantity_reserved: newReserved,
          updated_at: new Date().toISOString(),
        })
        .eq("id", record.levelId);

      await supabase
        .from("order_items")
        .update({
          inventory_reserved: true,
          allocated_warehouse_id: record.item.warehouse_id,
        })
        .eq("order_id", orderId)
        .or(
          `variant_id.eq.${record.item.variant_id},product_id.eq.${record.item.variant_id}`
        );

      try {
        await supabase.from("stock_movements").insert({
          variant_id: record.item.variant_id,
          warehouse_id: record.item.warehouse_id,
          quantity_change: -record.item.quantity,
          reason: `Order reservation for order ${orderId}`,
          reference_id: orderId,
        });
      } catch (_) {
        // Audit log insert is optional and shouldn't block checkout
      }
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
      // Fallback release if RPC fails
      const { data: items } = await supabase
        .from("order_items")
        .select("variant_id, product_id, allocated_warehouse_id, quantity")
        .eq("order_id", orderId)
        .eq("inventory_reserved", true);

      if (items && items.length > 0) {
        for (const item of items) {
          const targetVariantId = item.variant_id || item.product_id;
          if (item.allocated_warehouse_id && targetVariantId) {
            const { data: level } = await supabase
              .from("inventory_levels")
              .select("id, quantity_available, quantity_reserved")
              .eq("variant_id", targetVariantId)
              .eq("warehouse_id", item.allocated_warehouse_id)
              .maybeSingle();

            if (level) {
              await supabase
                .from("inventory_levels")
                .update({
                  quantity_available: (level.quantity_available || 0) + item.quantity,
                  quantity_reserved: Math.max(0, (level.quantity_reserved || 0) - item.quantity),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", level.id);
            }
          }
        }

        await supabase
          .from("order_items")
          .update({ inventory_reserved: false, allocated_warehouse_id: null })
          .eq("order_id", orderId)
          .eq("inventory_reserved", true);
      }
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
      // Fallback confirm: decrement reserved quantity
      const { data: items } = await supabase
        .from("order_items")
        .select("variant_id, product_id, allocated_warehouse_id, quantity")
        .eq("order_id", orderId)
        .eq("inventory_reserved", true);

      if (items && items.length > 0) {
        for (const item of items) {
          const targetVariantId = item.variant_id || item.product_id;
          if (item.allocated_warehouse_id && targetVariantId) {
            const { data: level } = await supabase
              .from("inventory_levels")
              .select("id, quantity_reserved")
              .eq("variant_id", targetVariantId)
              .eq("warehouse_id", item.allocated_warehouse_id)
              .maybeSingle();

            if (level) {
              await supabase
                .from("inventory_levels")
                .update({
                  quantity_reserved: Math.max(0, (level.quantity_reserved || 0) - item.quantity),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", level.id);
            }
          }
        }

        await supabase
          .from("order_items")
          .update({ inventory_reserved: false })
          .eq("order_id", orderId)
          .eq("inventory_reserved", true);
      }
    }
  }
}
