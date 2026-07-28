import { InventoryRepository } from '@/repositories/inventory.repository';
import { InventoryLevel } from '@/types/inventory.types';

export class InventoryService {
  private repository: InventoryRepository;

  constructor() {
    this.repository = new InventoryRepository();
  }

  /**
   * Get stock availability for a variant.
   */
  async getStockAvailability(variantId: string, warehouseId?: string): Promise<{ available: number; reserved: number; status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' }> {
    const levels = await this.repository.getStockLevel(variantId, warehouseId);
    
    if (!levels || levels.length === 0) {
      return { available: 0, reserved: 0, status: 'OUT_OF_STOCK' };
    }

    const available = levels.reduce((sum, l) => sum + l.quantity_available, 0);
    const reserved = levels.reduce((sum, l) => sum + l.quantity_reserved, 0);
    const lowStockThreshold = Math.max(...levels.map(l => l.reorder_point || 0));

    let status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
    if (available === 0) {
      status = 'OUT_OF_STOCK';
    } else if (available <= lowStockThreshold) {
      status = 'LOW_STOCK';
    }

    return { available, reserved, status };
  }

  /**
   * Reserve stock (called when order is placed).
   */
  async reserveStock(variantId: string, warehouseId: string, quantity: number): Promise<void> {
    await this.repository.reserveStock(variantId, warehouseId, quantity);
    await this.repository.recordMovement({
      variant_id: variantId,
      warehouse_id: warehouseId,
      movement_type: 'RESERVE',
      quantity,
      notes: `Reserved ${quantity} units`
    });
  }

  /**
   * Release reserved stock (called on order cancellation).
   */
  async releaseStock(variantId: string, warehouseId: string, quantity: number): Promise<void> {
    await this.repository.releaseStock(variantId, warehouseId, quantity);
    await this.repository.recordMovement({
      variant_id: variantId,
      warehouse_id: warehouseId,
      movement_type: 'RELEASE',
      quantity,
      notes: `Released ${quantity} units`
    });
  }

  /**
   * Reduce stock permanently (called when order is shipped).
   */
  async reduceStock(variantId: string, warehouseId: string, quantity: number): Promise<void> {
    // Usually shipped from reserved stock
    await this.repository.reduceStock(variantId, warehouseId, quantity, true);
    await this.repository.recordMovement({
      variant_id: variantId,
      warehouse_id: warehouseId,
      movement_type: 'SHIP',
      quantity,
      notes: `Shipped ${quantity} units`
    });
  }

  /**
   * Manually adjust stock.
   */
  async adjustStock(inventoryId: string, newAvailable: number, newReserved: number, reason: string): Promise<void> {
    await this.repository.adjustStock(inventoryId, newAvailable, newReserved, reason);
  }

  /**
   * Get all inventory paginated
   */
  async getAllInventory(page: number = 1, limit: number = 20): Promise<{ data: InventoryLevel[], total: number }> {
    return await this.repository.getAllInventoryLevels(page, limit);
  }
}
