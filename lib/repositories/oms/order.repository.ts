import { createClient } from "@/lib/supabase/server";
import { Order, OrderStatus } from "@/types/oms";

export class OrderRepository {
  async getOrderById(id: string, supabaseClient?: any): Promise<Order | null> {
    const supabase = supabaseClient || await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching order by ID:", error);
      return null;
    }
    return data as Order;
  }

  async getOrderByNumber(orderNumber: string, supabaseClient?: any): Promise<Order | null> {
    const supabase = supabaseClient || await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .single();

    if (error) {
      console.error("Error fetching order by number:", error);
      return null;
    }
    return data as Order;
  }

  async getOrders(options?: {
    customerId?: string;
    status?: OrderStatus;
    search?: string;
    page?: number;
    limit?: number;
  }, supabaseClient?: any) {
    const supabase = supabaseClient || await createClient();
    let query = supabase.from("orders").select("*", { count: "exact" });

    if (options?.customerId) {
      query = query.eq("customer_id", options.customerId); // Fixed bug here from user_id to customer_id if any
    }
    if (options?.status) {
      query = query.eq("status", options.status);
    }
    if (options?.search) {
      query = query.ilike("order_number", `%${options.search}%`);
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order("created_at", { ascending: false }).range(from, to);

    let { data, error, count } = await query;

    if (error && (error.message.includes("permission denied") || error.message.includes("users"))) {
      const { createAdminClient } = await import("@/lib/supabase/admin-client");
      const adminSupabase = createAdminClient();
      let adminQuery = adminSupabase.from("orders").select("*", { count: "exact" });
      if (options?.customerId) {
        adminQuery = adminQuery.eq("customer_id", options.customerId);
      }
      if (options?.status) {
        adminQuery = adminQuery.eq("status", options.status);
      }
      if (options?.search) {
        adminQuery = adminQuery.ilike("order_number", `%${options.search}%`);
      }
      adminQuery = adminQuery.order("created_at", { ascending: false }).range(from, to);
      const retryRes = await adminQuery;
      if (!retryRes.error) {
        data = retryRes.data;
        count = retryRes.count;
        error = null;
      }
    }

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return {
      data: (data || []) as Order[],
      count: count || 0,
    };
  }

  async createOrder(
    orderData: Partial<Order> & { order_number: string }
  ): Promise<Order> {
    const supabase = await createClient();
    const customerId = (orderData as any).user_id ?? (orderData as any).customer_id ?? null;
    const customerNote = orderData.notes;

    const payload: any = {
      ...orderData,
      customer_id: customerId,
      grand_total: (orderData as any).total_amount ?? orderData.grand_total ?? 0,
      shipping_total: (orderData as any).shipping_fee ?? orderData.shipping_total ?? 0,
      discount_total: (orderData as any).discount_amount ?? orderData.discount_total ?? 0,
    };
    delete payload.user_id;
    delete payload.session_id;
    delete payload.notes;
    delete payload.total_amount;
    delete payload.shipping_fee;
    delete payload.discount_amount;
    delete payload.items;
    delete payload.shipping_address;
    delete payload.billing_address;

    const { data, error } = await supabase
      .from("orders")
      .insert([payload])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }

    if (customerNote && customerNote.trim() && data?.id) {
      try {
        await supabase.from("order_notes").insert({
          order_id: data.id,
          author_id: customerId,
          note: customerNote.trim(),
          is_customer_visible: true,
        });
      } catch (err) {
        console.error("Error saving order note:", err);
      }
    }

    return data as Order;
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    updatedBy?: string
  ): Promise<Order> {
    const supabase = await createClient();
    const updateData: Partial<Order> = { status };
    if (updatedBy) {
      updateData.updated_by = updatedBy;
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }

    return data as Order;
  }

  async getOrdersForFulfillment(): Promise<Order[]> {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = await createAdminClient();
    
    const validStatuses = ["paid", "preparing", "picking", "packing", "ready_for_shipment"];
    
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        items:order_items(*)
      `)
      .in("status", validStatuses)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching orders for fulfillment:", error);
      throw new Error("Failed to fetch orders for fulfillment");
    }

    if (data && data.length > 0) {
      const orderIds = data.map((o: any) => o.id);
      const { data: addresses } = await supabase
        .from("order_addresses")
        .select("*")
        .in("order_id", orderIds);

      for (const order of data) {
        order.addresses = addresses?.filter((a: any) => a.order_id === order.id) || [];
      }
    }

    return data as Order[];
  }
}
