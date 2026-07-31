import { createAdminClient } from '@/lib/supabase/admin-client';
import { InventoryLevel, InventoryMovement } from '@/types/inventory.types';

export class InventoryRepository {
  private getAdminClient() {
    return createAdminClient();
  }

  /**
   * Get stock level for a variant across all warehouses or a specific one.
   */
  async getStockLevel(variantId: string, warehouseId?: string): Promise<InventoryLevel[]> {
    const supabase = this.getAdminClient();
    let query = supabase.from('inventory_levels').select('*').eq('variant_id', variantId);
    
    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }
    
    const { data, error } = await query;
    if (error) throw new Error(`Failed to get stock level: ${error.message}`);
    return data as InventoryLevel[];
  }

  /**
   * Adjust stock via an RPC function or a standard update (since we need atomic operations).
   */
  async reserveStock(variantId: string, warehouseId: string, quantity: number): Promise<void> {
    const supabase = this.getAdminClient();
    // Using a remote RPC call if available for atomicity, otherwise fallback to basic update.
    // Assuming a simple update for this assignment.
    
    // Note: For true concurrency, an RPC like `reserve_stock(variant_id, qty)` should be used.
    // For now, we fetch and update.
    const { data, error: fetchError } = await supabase
      .from('inventory_levels')
      .select('id, quantity_available, quantity_reserved')
      .eq('variant_id', variantId)
      .eq('warehouse_id', warehouseId)
      .single();

    if (fetchError || !data) {
      throw new Error(`Inventory not found for variant ${variantId} at warehouse ${warehouseId}`);
    }

    if (data.quantity_available < quantity) {
      throw new Error(`Insufficient stock for variant ${variantId}`);
    }

    const { error: updateError } = await supabase
      .from('inventory_levels')
      .update({
        quantity_available: data.quantity_available - quantity,
        quantity_reserved: data.quantity_reserved + quantity
      })
      .eq('id', data.id);

    if (updateError) throw new Error(`Failed to reserve stock: ${updateError.message}`);
  }

  async releaseStock(variantId: string, warehouseId: string, quantity: number): Promise<void> {
    const supabase = this.getAdminClient();
    
    const { data, error: fetchError } = await supabase
      .from('inventory_levels')
      .select('id, quantity_available, quantity_reserved')
      .eq('variant_id', variantId)
      .eq('warehouse_id', warehouseId)
      .single();

    if (fetchError || !data) throw new Error(`Inventory not found for variant ${variantId}`);

    const { error: updateError } = await supabase
      .from('inventory_levels')
      .update({
        quantity_available: data.quantity_available + quantity,
        quantity_reserved: Math.max(0, data.quantity_reserved - quantity)
      })
      .eq('id', data.id);

    if (updateError) throw new Error(`Failed to release stock: ${updateError.message}`);
  }

  async reduceStock(variantId: string, warehouseId: string, quantity: number, fromReserved = true): Promise<void> {
    const supabase = this.getAdminClient();
    
    const { data, error: fetchError } = await supabase
      .from('inventory_levels')
      .select('id, quantity_available, quantity_reserved')
      .eq('variant_id', variantId)
      .eq('warehouse_id', warehouseId)
      .single();

    if (fetchError || !data) throw new Error(`Inventory not found for variant ${variantId}`);

    let updateData: any = {};
    if (fromReserved) {
      updateData = { quantity_reserved: Math.max(0, data.quantity_reserved - quantity) };
    } else {
      updateData = { quantity_available: Math.max(0, data.quantity_available - quantity) };
    }

    const { error: updateError } = await supabase
      .from('inventory_levels')
      .update(updateData)
      .eq('id', data.id);

    if (updateError) throw new Error(`Failed to reduce stock: ${updateError.message}`);
  }

  /**
   * Record an inventory movement (audit log).
   */
  async recordMovement(movement: Omit<InventoryMovement, 'id' | 'created_at'>): Promise<void> {
    const supabase = this.getAdminClient();
    const { error } = await supabase.from('stock_movements').insert(movement as any);
    if (error) throw new Error(`Failed to record movement: ${error.message}`);
  }

  /**
   * Get all inventory levels (paginated)
   */
  async getAllInventoryLevels(page: number = 1, limit: number = 20): Promise<{ data: InventoryLevel[], total: number }> {
    const supabase = this.getAdminClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('inventory_levels')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (error) throw new Error(`Failed to fetch inventory levels: ${error.message}`);

    return {
      data: (data ?? []) as InventoryLevel[],
      total: count ?? 0
    };
  }

  /**
   * Adjust stock manually
   */
  async adjustStock(inventoryId: string, newAvailable: number, newReserved: number, reason: string): Promise<void> {
    const supabase = this.getAdminClient();
    
    const { data: inv, error: fetchError } = await supabase
      .from('inventory_levels')
      .select('*')
      .eq('id', inventoryId)
      .single();
      
    if (fetchError || !inv) throw new Error('Inventory not found');

    const { error } = await supabase
      .from('inventory_levels')
      .update({
        quantity_available: newAvailable,
        quantity_reserved: newReserved
      })
      .eq('id', inventoryId);

    if (error) throw new Error(`Failed to adjust stock: ${error.message}`);

    // Record movement
    await this.recordMovement({
      variant_id: inv.variant_id,
      warehouse_id: inv.warehouse_id,
      movement_type: 'ADJUST',
      quantity: (newAvailable - inv.quantity_available), // Net change
      reason_code: reason,
      notes: `Adjusted from ${inv.quantity_available} to ${newAvailable}`
    });
  }

  /**
   * Get stock movements (paginated)
   */
  async getMovements(page: number = 1, limit: number = 20, warehouseId?: string, variantId?: string): Promise<{ data: InventoryMovement[], total: number }> {
    const supabase = this.getAdminClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('stock_movements').select('*', { count: 'exact' });
    if (warehouseId) query = query.eq('warehouse_id', warehouseId);
    if (variantId) query = query.eq('variant_id', variantId);

    const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) throw new Error(`Failed to fetch movements: ${error.message}`);

    return {
      data: (data ?? []) as InventoryMovement[],
      total: count ?? 0
    };
  }

  /**
   * Transfer stock between warehouses
   */
  async transferStock(variantId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number, reason: string, notes?: string): Promise<void> {
    const supabase = this.getAdminClient();
    
    // Check if sufficient stock in fromWarehouseId
    const { data: fromStock, error: fetchError } = await supabase
      .from('inventory_levels')
      .select('id, quantity_available')
      .eq('variant_id', variantId)
      .eq('warehouse_id', fromWarehouseId)
      .single();

    if (fetchError || !fromStock) throw new Error(`Inventory not found in source warehouse`);
    if (fromStock.quantity_available < quantity) throw new Error(`Insufficient stock in source warehouse`);

    // Check if toWarehouseId has inventory record, if not, create it
    const { data: toStock, error: fetchToError } = await supabase
      .from('inventory_levels')
      .select('id, quantity_available')
      .eq('variant_id', variantId)
      .eq('warehouse_id', toWarehouseId)
      .maybeSingle();

    if (fetchToError) throw new Error(`Error fetching destination inventory: ${fetchToError.message}`);

    // Update fromWarehouseId
    const { error: updateFromError } = await supabase
      .from('inventory_levels')
      .update({ quantity_available: fromStock.quantity_available - quantity })
      .eq('id', fromStock.id);

    if (updateFromError) throw new Error(`Failed to deduct from source: ${updateFromError.message}`);

    // Update or Insert toWarehouseId
    if (toStock) {
      const { error: updateToError } = await supabase
        .from('inventory_levels')
        .update({ quantity_available: toStock.quantity_available + quantity })
        .eq('id', toStock.id);
      if (updateToError) throw new Error(`Failed to add to destination: ${updateToError.message}`);
    } else {
      const { error: insertToError } = await supabase
        .from('inventory_levels')
        .insert({
          variant_id: variantId,
          warehouse_id: toWarehouseId,
          quantity_available: quantity
        });
      if (insertToError) throw new Error(`Failed to insert to destination: ${insertToError.message}`);
    }

    // Record movement out
    await this.recordMovement({
      variant_id: variantId,
      warehouse_id: fromWarehouseId,
      movement_type: 'TRANSFER',
      quantity: -quantity,
      to_warehouse_id: toWarehouseId,
      reason_code: reason,
      notes: notes || `Transferred to warehouse ${toWarehouseId}`
    });

    // Record movement in
    await this.recordMovement({
      variant_id: variantId,
      warehouse_id: toWarehouseId,
      movement_type: 'TRANSFER',
      quantity: quantity,
      reason_code: reason,
      notes: notes || `Received from warehouse ${fromWarehouseId}`
    });
  }
}
