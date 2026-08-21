import { createAdminClient } from "@/lib/supabase/admin-client";
import { InventoryLevel, InventoryMovement } from "@/types/inventory.types";

export class InventoryRepository {
  private getAdminClient() {
    return createAdminClient();
  }

  /**
   * Get stock level for a variant across all warehouses or a specific one.
   */
  async getStockLevel(
    variantId: string,
    warehouseId?: string
  ): Promise<InventoryLevel[]> {
    const supabase = this.getAdminClient();
    let query = supabase
      .from("inventory_levels")
      .select("*")
      .eq("variant_id", variantId);

    if (warehouseId) {
      query = query.eq("warehouse_id", warehouseId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to get stock level: ${error.message}`);
    return data as InventoryLevel[];
  }

  /**
   * Adjust stock via an RPC function or a standard update (since we need atomic operations).
   */
  async reserveStock(
    variantId: string,
    warehouseId: string,
    quantity: number
  ): Promise<void> {
    const supabase = this.getAdminClient();
    
    if (quantity <= 0) {
      throw new Error(`Quantity must be greater than zero`);
    }

    const { error } = await supabase.rpc("atomic_reserve_stock", {
      p_variant_id: variantId,
      p_warehouse_id: warehouseId,
      p_quantity: quantity,
    });

    if (error) {
      throw new Error(`Failed to reserve stock: ${error.message}`);
    }
  }

  async releaseStock(
    variantId: string,
    warehouseId: string,
    quantity: number
  ): Promise<void> {
    const supabase = this.getAdminClient();

    if (quantity <= 0) {
      throw new Error(`Quantity must be greater than zero`);
    }

    const { error } = await supabase.rpc("atomic_release_stock", {
      p_variant_id: variantId,
      p_warehouse_id: warehouseId,
      p_quantity: quantity,
    });

    if (error) {
      throw new Error(`Failed to release stock: ${error.message}`);
    }
  }

  async reduceStock(
    variantId: string,
    warehouseId: string,
    quantity: number,
    fromReserved = true
  ): Promise<void> {
    const supabase = this.getAdminClient();

    if (quantity <= 0) {
      throw new Error(`Quantity must be greater than zero`);
    }

    const { error } = await supabase.rpc("atomic_reduce_stock", {
      p_variant_id: variantId,
      p_warehouse_id: warehouseId,
      p_quantity: quantity,
      p_from_reserved: fromReserved,
    });

    if (error) {
      throw new Error(`Failed to reduce stock: ${error.message}`);
    }
  }

  /**
   * Record an inventory movement (audit log).
   */
  async recordMovement(
    movement: Omit<InventoryMovement, "id" | "created_at">
  ): Promise<void> {
    const supabase = this.getAdminClient();
    const { error } = await supabase
      .from("stock_movements")
      .insert(movement as any);
    if (error) throw new Error(`Failed to record movement: ${error.message}`);
  }

  /**
   * Get all inventory levels (paginated)
   */
  async getAllInventoryLevels(
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: InventoryLevel[]; total: number }> {
    const supabase = this.getAdminClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("inventory_levels")
      .select("*", { count: "exact" })
      .range(from, to);

    if (error)
      throw new Error(`Failed to fetch inventory levels: ${error.message}`);

    return {
      data: (data ?? []) as InventoryLevel[],
      total: count ?? 0,
    };
  }

  /**
   * Get inventory dashboard data (with SKU, Product Name, and Warehouse Name)
   */
  async getInventoryDashboard(limit = 20, search?: string) {
    const supabase = this.getAdminClient();

    let query = supabase
      .from("inventory_levels")
      .select(`
        id,
        quantity_available,
        quantity_reserved,
        reorder_point,
        variant:variants(sku, product:products(name)),
        warehouse:warehouses(name)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(limit);

    // Note: Filtering heavily nested relations in postgREST might be limited without an RPC,
    // but we can try basic filtering or skip filtering at db level if it errors.
    // Assuming we want a basic list for the dashboard.
    
    // In a real enterprise app, an RPC or dedicated View should be used to allow efficient searching
    // across joined tables. Since this is an MVP fix, we'll fetch without deep search or let PostgREST
    // do its best.
    
    const { data, error, count } = await query;
    if (error) {
      console.error("Error fetching inventory dashboard:", error);
      throw error;
    }

    // Process data to match flat dashboard needs
    const processed = (data || []).map((item: any) => ({
      id: item.id,
      sku: item.variant?.sku || "Unknown SKU",
      name: item.variant?.product?.name || "Unknown Product",
      warehouse: item.warehouse?.name || "Unknown Warehouse",
      available: item.quantity_available,
      reserved: item.quantity_reserved,
      status: item.quantity_available <= 0 ? "Out of Stock" : item.quantity_available <= (item.reorder_point || 0) ? "Low Stock" : "In Stock"
    }));

    // If search is provided, filter in memory for MVP since nested PostgREST OR filtering is complex
    let filtered = processed;
    if (search) {
      const s = search.toLowerCase();
      filtered = processed.filter(p => p.sku.toLowerCase().includes(s) || p.name.toLowerCase().includes(s));
    }

    const totalInStock = processed.reduce((acc, curr) => acc + curr.available, 0);
    const lowStockCount = processed.filter(p => p.status === "Low Stock").length;
    const outOfStockCount = processed.filter(p => p.status === "Out of Stock").length;

    return {
      items: filtered,
      stats: {
        totalItems: totalInStock,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
      }
    };
  }

  /**
   * Adjust stock manually
   */
  async adjustStock(
    inventoryId: string,
    newAvailable: number,
    newReserved: number,
    reason: string
  ): Promise<void> {
    const supabase = this.getAdminClient();

    const { data: inv, error: fetchError } = await supabase
      .from("inventory_levels")
      .select("*")
      .eq("id", inventoryId)
      .single();

    if (fetchError || !inv) throw new Error("Inventory not found");

    const { error } = await supabase
      .from("inventory_levels")
      .update({
        quantity_available: newAvailable,
        quantity_reserved: newReserved,
      })
      .eq("id", inventoryId);

    if (error) throw new Error(`Failed to adjust stock: ${error.message}`);

    // Record movement
    await this.recordMovement({
      variant_id: inv.variant_id,
      warehouse_id: inv.warehouse_id,
      movement_type: "ADJUST",
      quantity: newAvailable - inv.quantity_available, // Net change
      reason_code: reason,
      notes: `Adjusted from ${inv.quantity_available} to ${newAvailable}`,
    });
  }

  /**
   * Get stock movements (paginated)
   */
  async getMovements(
    page: number = 1,
    limit: number = 20,
    warehouseId?: string,
    variantId?: string
  ): Promise<{ data: InventoryMovement[]; total: number }> {
    const supabase = this.getAdminClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("stock_movements")
      .select("*", { count: "exact" });
    if (warehouseId) query = query.eq("warehouse_id", warehouseId);
    if (variantId) query = query.eq("variant_id", variantId);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw new Error(`Failed to fetch movements: ${error.message}`);

    return {
      data: (data ?? []) as InventoryMovement[],
      total: count ?? 0,
    };
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
    const supabase = this.getAdminClient();

    if (quantity <= 0) {
      throw new Error(`Quantity must be greater than zero`);
    }

    if (fromWarehouseId === toWarehouseId) {
      throw new Error(`Source and destination warehouse must be different`);
    }

    const { error } = await supabase.rpc("atomic_transfer_stock", {
      p_variant_id: variantId,
      p_from_warehouse_id: fromWarehouseId,
      p_to_warehouse_id: toWarehouseId,
      p_quantity: quantity,
    });

    if (error) {
      throw new Error(`Failed to transfer stock: ${error.message}`);
    }

    // Record movement out
    await this.recordMovement({
      variant_id: variantId,
      warehouse_id: fromWarehouseId,
      movement_type: "TRANSFER",
      quantity: -quantity,
      to_warehouse_id: toWarehouseId,
      reason_code: reason,
      notes: notes || `Transferred to warehouse ${toWarehouseId}`,
    });

    // Record movement in
    await this.recordMovement({
      variant_id: variantId,
      warehouse_id: toWarehouseId,
      movement_type: "TRANSFER",
      quantity: quantity,
      reason_code: reason,
      notes: notes || `Received from warehouse ${fromWarehouseId}`,
    });
  }
}
