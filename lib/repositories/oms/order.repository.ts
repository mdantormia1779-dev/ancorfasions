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

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return {
      data: data as Order[],
      count: count || 0,
    };
  }

  async createOrder(
    orderData: Partial<Order> & { order_number: string }
  ): Promise<Order> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
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
