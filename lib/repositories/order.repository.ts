import { createAdminClient } from "@/lib/supabase/server";
import { Order, OrderAddress, OrderItem } from "@/types/checkout.types";

export class OrderRepository {
  /**
   * Create an order with items and addresses in a transaction-like way using Supabase Admin
   */
  static async createOrder(
    orderData: Partial<Order>,
    items: Partial<OrderItem>[],
    shippingAddress: Partial<OrderAddress>,
    billingAddress?: Partial<OrderAddress>
  ): Promise<Order> {
    const supabase = await createAdminClient();

    // 1. Create Order with schema compatibility
    const customerId = orderData.user_id ?? (orderData as any).customer_id ?? null;
    const customerNote = orderData.notes;

    const finalOrderData: any = {
      ...orderData,
      currency: orderData.currency || "BDT",
      customer_id: customerId,
      grand_total: orderData.total_amount ?? orderData.grand_total ?? 0,
      shipping_total: orderData.shipping_fee ?? orderData.shipping_total ?? 0,
      discount_total: orderData.discount_amount ?? orderData.discount_total ?? 0,
    };

    // Strip fields not present in Supabase 'orders' table schema cache
    delete finalOrderData.user_id;
    delete finalOrderData.session_id;
    delete finalOrderData.notes;
    delete finalOrderData.total_amount;
    delete finalOrderData.shipping_fee;
    delete finalOrderData.discount_amount;
    delete finalOrderData.items;
    delete finalOrderData.shipping_address;
    delete finalOrderData.billing_address;

    let { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(finalOrderData)
      .select("*")
      .single();

    // Fallback if migration or schema cache reports any missing columns
    if (orderError && orderError.message && orderError.message.includes("column")) {
      const sanitized = { ...finalOrderData };
      const colMatch = orderError.message.match(/'([^']+)' column/);
      if (colMatch && colMatch[1]) {
        delete sanitized[colMatch[1]];
      }
      const retryRes = await supabase
        .from("orders")
        .insert(sanitized)
        .select("*")
        .single();
      order = retryRes.data;
      orderError = retryRes.error;
    }

    if (orderError)
      throw new Error(`Failed to create order: ${orderError.message}`);

    // If customer provided a note during checkout, save it in the order_notes audit table
    if (customerNote && customerNote.trim()) {
      try {
        await supabase.from("order_notes").insert({
          order_id: order.id,
          author_id: customerId,
          note: customerNote.trim(),
          is_customer_visible: true,
        });
      } catch (err: any) {
        console.error("Error saving customer note to order_notes:", err);
      }
    }

    // 2. Create Shipping Address
    const { error: shippingError } = await supabase
      .from("order_addresses")
      .insert({
        ...shippingAddress,
        order_id: order.id,
        address_type: "SHIPPING",
      });

    if (shippingError)
      throw new Error(
        `Failed to create shipping address: ${shippingError.message}`
      );

    // 3. Create Billing Address
    if (billingAddress) {
      const { error: billingError } = await supabase
        .from("order_addresses")
        .insert({
          ...billingAddress,
          order_id: order.id,
          address_type: "BILLING",
        });

      if (billingError)
        throw new Error(
          `Failed to create billing address: ${billingError.message}`
        );
    }

    // 4. Create Order Items
    const itemsData = items.map((item: any) => {
      const lineTotal = Number(
        item.line_total ??
          item.total_price ??
          Number(item.quantity || 1) * Number(item.unit_price || 0)
      );

      const sanitized: Record<string, any> = {
        order_id: order.id,
        product_id: item.product_id || null,
        variant_id: item.variant_id || null,
        sku: item.sku || "N/A",
        product_name: item.product_name || "Product",
        variant_name: item.variant_name || null,
        unit_price: Number(item.unit_price) || 0,
        quantity: Number(item.quantity) || 1,
        discount: Number(item.discount) || 0,
        tax: Number(item.tax) || 0,
        line_total: lineTotal,
        inventory_reserved: Boolean(item.inventory_reserved ?? false),
      };

      if (item.allocated_warehouse_id) {
        sanitized.allocated_warehouse_id = item.allocated_warehouse_id;
      }

      return sanitized;
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsData);

    if (itemsError)
      throw new Error(`Failed to create order items: ${itemsError.message}`);

    // 5. Create Order Status History
    const statusNote = customerNote
      ? `Order placed. Customer Note: ${customerNote.trim()}`
      : orderData.risk_level
      ? `Order placed successfully (COD Risk: ${orderData.risk_level}, Verification: ${orderData.verification_status || "EXEMPT"})`
      : "Order placed successfully";

    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: order.status,
      notes: statusNote,
      created_by: customerId,
    });

    // 6. Fetch complete order
    return (await this.getOrderById(order.id)) as Order;
  }

  /**
   * Get an order by ID
   */
  static async getOrderById(orderId: string): Promise<Order | null> {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*)
      `
      )
      .eq("id", orderId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    if (data) {
      const { data: addresses } = await supabase
        .from("order_addresses")
        .select("*")
        .eq("order_id", orderId);

      data.total_amount = data.total_amount ?? data.grand_total ?? 0;
      data.shipping_fee = data.shipping_fee ?? data.shipping_total ?? 0;
      data.discount_amount = data.discount_amount ?? data.discount_total ?? 0;
      data.user_id = data.user_id ?? data.customer_id;
      // Map addresses to shipping and billing
      data.shipping_address = addresses?.find(
        (a: any) => a.address_type === "SHIPPING"
      );
      data.billing_address = addresses?.find(
        (a: any) => a.address_type === "BILLING"
      );

      // Populate notes from order_notes if not on order record
      if (!data.notes) {
        const { data: noteRows } = await supabase
          .from("order_notes")
          .select("note")
          .eq("order_id", orderId)
          .eq("is_customer_visible", true)
          .order("created_at", { ascending: false })
          .limit(1);
        if (noteRows && noteRows.length > 0) {
          data.notes = noteRows[0].note;
        }
      }
    }

    return data as Order | null;
  }

  /**
   * Get an order by Order Number
   */
  static async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*)
      `
      )
      .eq("order_number", orderNumber)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    if (data) {
      const { data: addresses } = await supabase
        .from("order_addresses")
        .select("*")
        .eq("order_id", data.id);

      data.total_amount = data.total_amount ?? data.grand_total ?? 0;
      data.shipping_fee = data.shipping_fee ?? data.shipping_total ?? 0;
      data.discount_amount = data.discount_amount ?? data.discount_total ?? 0;
      data.user_id = data.user_id ?? data.customer_id;
      data.shipping_address = addresses?.find(
        (a: any) => a.address_type === "SHIPPING"
      );
      data.billing_address = addresses?.find(
        (a: any) => a.address_type === "BILLING"
      );

      if (!data.notes) {
        const { data: noteRows } = await supabase
          .from("order_notes")
          .select("note")
          .eq("order_id", data.id)
          .eq("is_customer_visible", true)
          .order("created_at", { ascending: false })
          .limit(1);
        if (noteRows && noteRows.length > 0) {
          data.notes = noteRows[0].note;
        }
      }
    }

    return data as Order | null;
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string,
    status: string,
    notes?: string
  ): Promise<void> {
    const supabase = await createAdminClient();
    await supabase.from("orders").update({ status }).eq("id", orderId);
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status,
      notes: notes || `Order status updated to ${status}`,
    });
  }
}
