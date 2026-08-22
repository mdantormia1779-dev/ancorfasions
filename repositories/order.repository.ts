import { createClient } from "@/lib/supabase/server-client";
import {
  Order,
  OrderAddress,
  OrderItem,
  OrderStatusHistory,
} from "@/types/checkout.types";

export class OrderRepository {
  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*),
        addresses:order_addresses(*),
        status_history:order_status_history(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      console.error("Error fetching order:", error);
      throw new Error("Failed to fetch order");
    }

    return data as Order;
  }

  /**
   * Get orders by User ID
   */
  async getOrdersByUserId(userId: string): Promise<Order[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user orders:", error);
      throw new Error("Failed to fetch user orders");
    }

    return data as Order[];
  }

  /**
   * Create order and associated data
   * We do this sequentially as Supabase JS doesn't support generic transactions yet without an RPC
   */
  async createOrder(
    orderData: Partial<Order>,
    items: Partial<OrderItem>[],
    shippingAddress?: Partial<OrderAddress>,
    billingAddress?: Partial<OrderAddress>
  ): Promise<Order> {
    const supabase = await createClient();

    // 1. Create Order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Failed to create order");
    }

    // 2. Create Order Items
    const itemsWithOrderId = items.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Ideally we would rollback or use an RPC here.
      // For now, we log the error.
    }

    // 3. Create Addresses
    if (shippingAddress) {
      await supabase
        .from("order_addresses")
        .insert({
          ...shippingAddress,
          order_id: order.id,
          address_type: "SHIPPING",
        });
    }

    if (billingAddress) {
      await supabase
        .from("order_addresses")
        .insert({
          ...billingAddress,
          order_id: order.id,
          address_type: "BILLING",
        });
    }

    // 4. Create Initial Status History
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: order.status,
      notes: "Order placed",
      created_by: order.user_id || null,
    });

    return this.getOrderById(order.id) as Promise<Order>;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: string,
    status: string,
    notes?: string,
    adminId?: string
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Error updating order status:", error);
      throw new Error("Failed to update order status");
    }

    // Add history record
    await supabase.from("order_status_history").insert({
      order_id: id,
      status,
      notes: notes || null,
      created_by: adminId || null,
    });
  }

  /**
   * Track Coupon Usage
   */
  async recordCouponUsage(
    couponId: string,
    orderId: string,
    discountApplied: number,
    userId?: string
  ): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("coupon_usages").insert({
      coupon_id: couponId,
      order_id: orderId,
      discount_applied: discountApplied,
      user_id: userId || null,
    });

    if (error) {
      console.error("Error recording coupon usage:", error);
      // Non-critical, won't throw
    }
  }

  /**
   * Get orders for fulfillment board
   */
  async getOrdersForFulfillment(): Promise<Order[]> {
    const { createAdminClient } = await import("@/lib/supabase/admin-client");
    const supabase = createAdminClient();
    
    // We fetch orders that are paid or preparing or picking or packing or ready_for_shipment
    const validStatuses = ["paid", "preparing", "picking", "packing", "ready_for_shipment"];
    
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        items:order_items(*),
        addresses:order_addresses(*)
      `)
      .in("status", validStatuses)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching orders for fulfillment:", error);
      throw new Error("Failed to fetch orders for fulfillment");
    }

    return data as Order[];
  }
}
