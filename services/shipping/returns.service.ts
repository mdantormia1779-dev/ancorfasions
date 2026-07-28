// ============================================================================
// Returns Service
// ============================================================================

import { ReturnRepository } from '@/repositories/return.repository';
import { ShipmentRepository } from '@/repositories/shipment.repository';
import {
  ReturnRequest,
  ReturnWithItems,
  CreateReturnInput,
  ReturnFilters,
  PaginatedResult,
  ReturnStatus,
} from '@/types/shipping.types';

export class ReturnsService {
  private returnRepo: ReturnRepository;
  private shipmentRepo: ShipmentRepository;

  constructor() {
    this.returnRepo = new ReturnRepository();
    this.shipmentRepo = new ShipmentRepository();
  }

  private generateReturnNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `RET-${date}-${rand}`;
  }

  /**
   * Create a new return request.
   */
  async createReturnRequest(
    input: CreateReturnInput,
    customerId?: string,
    createdBy?: string
  ): Promise<ReturnWithItems> {
    const returnNumber = this.generateReturnNumber();

    const returnRecord = await this.returnRepo.createReturn({
      return_number: returnNumber,
      order_id: input.orderId,
      customer_id: customerId ?? null,
      shipment_id: input.shipmentId ?? null,
      status: 'requested',
      reason: input.reason,
      notes: null,
    }, input.items.map((item) => ({
      order_item_id: item.orderItemId ?? null,
      sku: item.sku,
      product_name: item.productName,
      quantity: item.quantity,
      reason: item.reason ?? null,
      condition: item.condition ?? 'unknown',
      restocked: false,
    })));

    return returnRecord;
  }

  /**
   * Approve a return request.
   */
  async approveReturn(returnId: string, updatedBy?: string): Promise<ReturnRequest> {
    return this.returnRepo.updateReturn(returnId, { status: 'approved' });
  }

  /**
   * Reject a return request.
   */
  async rejectReturn(returnId: string, reason?: string, updatedBy?: string): Promise<ReturnRequest> {
    return this.returnRepo.updateReturn(returnId, {
      status: 'rejected',
      notes: reason ?? null,
    });
  }

  /**
   * Schedule return pickup by assigning a courier.
   */
  async scheduleReturnPickup(returnId: string, courierCode?: string): Promise<ReturnRequest> {
    return this.returnRepo.updateReturn(returnId, {
      status: 'pickup_scheduled',
    });
  }

  /**
   * Mark return as picked up.
   */
  async markReturnPickedUp(returnId: string): Promise<ReturnRequest> {
    return this.returnRepo.updateReturn(returnId, {
      status: 'picked_up',
      picked_up_at: new Date().toISOString(),
    });
  }

  /**
   * Mark return as received at warehouse.
   */
  async markReturnReceived(returnId: string): Promise<ReturnRequest> {
    return this.returnRepo.updateReturn(returnId, {
      status: 'received',
      received_at: new Date().toISOString(),
    });
  }

  /**
   * Sync returned inventory — marks items as restocked in return_items.
   * In production this would call the Inventory Management module.
   */
  async syncReturnInventory(returnId: string): Promise<ReturnRequest> {
    const returnRecord = await this.returnRepo.getReturnById(returnId);
    if (!returnRecord) throw new Error(`Return ${returnId} not found`);

    // Mark items as restocked
    const items = await this.returnRepo.getReturnItems(returnId);
    for (const item of items) {
      if (item.condition === 'good') {
        await this.returnRepo.markItemRestocked(item.id);
      }
    }

    return this.returnRepo.updateReturn(returnId, {
      status: 'inventory_synced',
      inventory_synced_at: new Date().toISOString(),
    });
  }

  /**
   * Complete the return process.
   */
  async completeReturn(returnId: string): Promise<ReturnRequest> {
    return this.returnRepo.updateReturn(returnId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  }

  /**
   * Cancel a return request.
   */
  async cancelReturn(returnId: string, reason?: string): Promise<ReturnRequest> {
    return this.returnRepo.updateReturn(returnId, {
      status: 'cancelled',
      notes: reason ?? null,
    });
  }

  /**
   * Get a return with all items.
   */
  async getReturnWithItems(returnId: string): Promise<ReturnWithItems | null> {
    return this.returnRepo.getReturnWithItems(returnId);
  }

  /**
   * List returns with filters and pagination.
   */
  async listReturns(filters: ReturnFilters): Promise<PaginatedResult<ReturnRequest>> {
    return this.returnRepo.listReturns(filters);
  }
}
