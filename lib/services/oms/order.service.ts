import { OrderRepository } from "@/lib/repositories/oms/order.repository";
import { OrderItemsRepository } from "@/lib/repositories/oms/order-items.repository";
import { OrderStatusService } from "./order-status.service";
import { Order, OrderStatus, OrderItem } from "@/types/oms";
import { CreateOrderInput } from "@/lib/validations/oms";

export class OrderService {
  private orderRepo = new OrderRepository();
  private orderItemsRepo = new OrderItemsRepository();
  private statusService = new OrderStatusService();

  async createOrder(data: CreateOrderInput): Promise<Order> {
    // Generate a secure, sequential order number in a real app,
    // for now using a timestamp-based mock
    const orderNumber = `ORD-${Date.now()}`;

    const orderData: Partial<Order> = {
      order_number: orderNumber,
      customer_id: data.customer_id || null,
      status: "draft", // Initial state
      subtotal: data.subtotal,
      tax_total: data.tax_total,
      shipping_total: data.shipping_total,
      discount_total: data.discount_total,
      grand_total: data.grand_total,
      currency: data.currency,
      shipping_address_id: data.shipping_address_id || null,
      billing_address_id: data.billing_address_id || null,
      payment_intent_id: data.payment_intent_id || null,
    };

    const newOrder = await this.orderRepo.createOrder(orderData as any);

    const itemsToInsert = data.items.map((item) => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      sku: item.sku,
      product_name: item.product_name,
      variant_name: item.variant_name || null,
      unit_price: item.unit_price,
      quantity: item.quantity,
      discount: item.discount,
      tax: item.tax,
      line_total: item.line_total,
      inventory_reserved: false,
      allocated_warehouse_id: null,
    }));

    await this.orderItemsRepo.createOrderItems(itemsToInsert);
    return newOrder;
  }

  async updateOrderStatus(
    id: string,
    newStatus: OrderStatus,
    updatedBy?: string,
    role?: string
  ): Promise<Order> {
    const order = await this.orderRepo.getOrderById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    if (!this.statusService.canTransition(order.status, newStatus, role)) {
      throw new Error(
        `Invalid status transition from ${order.status} to ${newStatus}`
      );
    }

    return this.orderRepo.updateOrderStatus(id, newStatus, updatedBy);
  }

  async getOrderDetails(id: string, supabaseClient?: any) {
    const order = await this.orderRepo.getOrderById(id, supabaseClient);
    if (!order) return null;

    const items = await this.orderItemsRepo.getOrderItems(id);
    return { ...order, items };
  }
}
