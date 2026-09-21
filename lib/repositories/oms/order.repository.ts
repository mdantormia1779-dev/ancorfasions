import { createClient } from "@/lib/supabase/server";
import { Order, OrderStatus } from "@/types/oms";

export class OrderRepository {
  async getOrderById(id: string, supabaseClient?: any): Promise<Order | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let supabase = supabaseClient;
    if (!supabase) {
      try {
        supabase = await createClient();
      } catch {
        const { createAdminClient } = await import("@/lib/supabase/server");
        supabase = await createAdminClient();
      }
    }

    let query = supabase.from("orders").select("*");
    if (isUuid) {
      query = query.eq("id", id);
    } else {
      query = query.eq("order_number", id);
    }

    let { data, error } = await query.maybeSingle();

    if (error && (error.code === "42501" || error.message?.includes("permission denied") || error.message?.includes("users"))) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const adminClient = await createAdminClient();
        let retryQuery = adminClient.from("orders").select("*");
        if (isUuid) {
          retryQuery = retryQuery.eq("id", id);
        } else {
          retryQuery = retryQuery.eq("order_number", id);
        }
        const retry = await retryQuery.maybeSingle();
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      } catch (retryCatch) {
        console.warn("[getOrderById] Admin client retry error:", retryCatch);
      }
    }

    if (error) {
      console.error("Error fetching order by ID:", error);
      return null;
    }
    return data as Order;
  }

  async getOrderByNumber(orderNumber: string, supabaseClient?: any): Promise<Order | null> {
    let supabase = supabaseClient;
    if (!supabase) {
      try {
        supabase = await createClient();
      } catch {
        const { createAdminClient } = await import("@/lib/supabase/server");
        supabase = await createAdminClient();
      }
    }

    let { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (error && (error.code === "42501" || error.message?.includes("permission denied") || error.message?.includes("users"))) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const adminClient = await createAdminClient();
        const retry = await adminClient
          .from("orders")
          .select("*")
          .eq("order_number", orderNumber)
          .maybeSingle();
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      } catch (retryCatch) {
        console.warn("[getOrderByNumber] Admin client retry error:", retryCatch);
      }
    }

    if (error) {
      console.error("Error fetching order by number:", error);
      return null;
    }
    return data as Order;
  }

  async getOrders(options?: {
    customerId?: string;
    status?: OrderStatus | string;
    paymentMethod?: string;
    paymentStatus?: string;
    search?: string;
    page?: number;
    limit?: number;
  }, supabaseClient?: any) {
    let client = supabaseClient;
    if (!client) {
      try {
        client = await createClient();
      } catch {
        const { createAdminClient } = await import("@/lib/supabase/server");
        client = await createAdminClient();
      }
    }

    let query = client.from("orders").select("*", { count: "exact" });

    const applyStatusFilter = (q: any, statusVal: string) => {
      const s = String(statusVal).toLowerCase().trim();
      if (!s || s === "all") return q;
      if (s === "pending") {
        return q.in("status", ["pending_payment", "paid", "draft"]);
      }
      if (s === "processing") {
        return q.in("status", ["confirmed", "preparing", "processing", "picking", "packing", "ready_for_shipment", "shipped"]);
      }
      if (s === "completed") {
        return q.in("status", ["completed", "delivered"]);
      }
      if (s === "cancelled") {
        return q.in("status", ["cancelled", "refunded", "returned", "failed"]);
      }
      return q.eq("status", statusVal);
    };

    if (options?.customerId) {
      query = query.eq("customer_id", options.customerId);
    }
    if (options?.status && options.status !== "all") {
      query = applyStatusFilter(query, options.status);
    }
    if (options?.paymentMethod && options.paymentMethod !== "all") {
      query = query.ilike("payment_method", options.paymentMethod);
    }
    if (options?.paymentStatus && options.paymentStatus !== "all") {
      query = query.ilike("payment_status", options.paymentStatus);
    }

    if (options?.search) {
      const trimmedSearch = options.search.trim();
      if (trimmedSearch) {
        try {
          const { data: addrs } = await client
            .from("order_addresses")
            .select("order_id")
            .or(`phone.ilike.%${trimmedSearch}%,first_name.ilike.%${trimmedSearch}%,last_name.ilike.%${trimmedSearch}%`);
          
          const matchedIds = Array.from(new Set((addrs || []).map((a: any) => a.order_id).filter(Boolean)));
          if (matchedIds.length > 0) {
            query = query.or(`order_number.ilike.%${trimmedSearch}%,id.in.(${matchedIds.join(",")})`);
          } else {
            query = query.ilike("order_number", `%${trimmedSearch}%`);
          }
        } catch {
          query = query.ilike("order_number", `%${trimmedSearch}%`);
        }
      }
    }

    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(100, Math.max(1, options?.limit || 20));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order("created_at", { ascending: false }).range(from, to);

    let { data, error, count } = await query;

    if (error && (error.message.includes("permission denied") || error.message.includes("users"))) {
      const { createAdminClient } = await import("@/lib/supabase/server");
      client = await createAdminClient();
      let adminQuery = client.from("orders").select("*", { count: "exact" });
      if (options?.customerId) adminQuery = adminQuery.eq("customer_id", options.customerId);
      if (options?.status && options.status !== "all") adminQuery = applyStatusFilter(adminQuery, options.status);
      if (options?.paymentMethod && options.paymentMethod !== "all") adminQuery = adminQuery.ilike("payment_method", options.paymentMethod);
      if (options?.paymentStatus && options.paymentStatus !== "all") adminQuery = adminQuery.ilike("payment_status", options.paymentStatus);
      if (options?.search) {
        const trimmed = options.search.trim();
        try {
          const { data: addrs } = await client
            .from("order_addresses")
            .select("order_id")
            .or(`phone.ilike.%${trimmed}%,first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%`);
          const matchedIds = Array.from(new Set((addrs || []).map((a: any) => a.order_id).filter(Boolean)));
          if (matchedIds.length > 0) {
            adminQuery = adminQuery.or(`order_number.ilike.%${trimmed}%,id.in.(${matchedIds.join(",")})`);
          } else {
            adminQuery = adminQuery.ilike("order_number", `%${trimmed}%`);
          }
        } catch {
          adminQuery = adminQuery.ilike("order_number", `%${trimmed}%`);
        }
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

    const orderRows = data || [];
    const orderIds = orderRows.map((o: any) => o.id).filter(Boolean);

    let addresses: any[] = [];
    let items: any[] = [];

    if (orderIds.length > 0) {
      try {
        const [addrsRes, itemsRes] = await Promise.all([
          client.from("order_addresses").select("*").in("order_id", orderIds),
          client.from("order_items").select("id, order_id, product_name, variant_name, quantity, line_total").in("order_id", orderIds)
        ]);
        addresses = addrsRes.data || [];
        items = itemsRes.data || [];
      } catch (err) {
        console.warn("[getOrders] Warning fetching address/items join:", err);
      }
    }

    const enrichedOrders: Order[] = orderRows.map((o: any) => {
      const orderAddrs = addresses.filter((a: any) => a.order_id === o.id);
      const orderItems = items.filter((i: any) => i.order_id === o.id);
      const shippingAddr = orderAddrs.find((a: any) => a.address_type === "SHIPPING") || orderAddrs[0] || null;

      let customerName = "Guest Customer";
      if (shippingAddr?.first_name || shippingAddr?.last_name) {
        customerName = `${shippingAddr.first_name || ""} ${shippingAddr.last_name || ""}`.trim();
      } else if (o.customer) {
        customerName = `${o.customer.first_name || ""} ${o.customer.last_name || ""}`.trim() || o.customer.email;
      }

      return {
        ...o,
        customer_name: customerName,
        customer_phone: shippingAddr?.phone || null,
        customer_city: shippingAddr?.city || null,
        items_count: orderItems.reduce((sum: number, i: any) => sum + (Number(i.quantity) || 1), 0),
        items_preview: orderItems.map((i: any) => i.product_name).filter(Boolean).slice(0, 3).join(", "),
        shipping_address: shippingAddr,
      } as Order;
    });

    return {
      data: enrichedOrders,
      count: count || 0,
    };
  }

  async getOrderMetrics(supabaseClient?: any) {
    let client = supabaseClient;
    if (!client) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        client = await createAdminClient();
      } catch {
        client = await createClient();
      }
    }

    const { data: allOrders, error } = await client
      .from("orders")
      .select("status, grand_total, created_at");

    if (error || !allOrders) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
      };
    }

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders
      .filter((o: any) => o.status !== "cancelled")
      .reduce((sum: number, o: any) => sum + (Number(o.grand_total) || 0), 0);

    const pendingOrders = allOrders.filter((o: any) =>
      ["pending", "pending_payment", "draft"].includes(o.status)
    ).length;

    const processingOrders = allOrders.filter((o: any) =>
      ["confirmed", "preparing", "processing", "picking", "packing", "ready_for_shipment", "shipped"].includes(o.status)
    ).length;

    const completedOrders = allOrders.filter((o: any) =>
      ["completed", "delivered"].includes(o.status)
    ).length;

    const cancelledOrders = allOrders.filter((o: any) =>
      ["cancelled", "refunded", "returned", "failed"].includes(o.status)
    ).length;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
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

    let { data, error } = await supabase
      .from("orders")
      .insert([payload])
      .select()
      .single();

    if (
      error &&
      (error.code === "42501" ||
        error.message?.includes("permission denied") ||
        error.message?.includes("users"))
    ) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const adminClient = await createAdminClient();
        const retry = await adminClient
          .from("orders")
          .insert([payload])
          .select()
          .single();
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        } else if (retry.error) {
          error = retry.error;
        }
      } catch (retryCatch: any) {
        console.warn("[createOrder] Admin client retry error:", retryCatch);
      }
    }

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }

    if (customerNote && customerNote.trim() && data?.id) {
      try {
        let notesClient = supabase;
        const { error: noteErr } = await notesClient.from("order_notes").insert({
          order_id: data.id,
          author_id: customerId,
          note: customerNote.trim(),
          is_customer_visible: true,
        });
        if (noteErr) {
          const { createAdminClient } = await import("@/lib/supabase/server");
          const adminClient = await createAdminClient();
          await adminClient.from("order_notes").insert({
            order_id: data.id,
            author_id: customerId,
            note: customerNote.trim(),
            is_customer_visible: true,
          });
        }
      } catch (err) {
        console.error("Error saving order note:", err);
      }
    }

    return data as Order;
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    updatedBy?: string,
    supabaseClient?: any
  ): Promise<Order> {
    let supabase = supabaseClient;
    if (!supabase) {
      try {
        supabase = await createClient();
      } catch {
        const { createAdminClient } = await import("@/lib/supabase/server");
        supabase = await createAdminClient();
      }
    }

    const updateData: Partial<Order> = { status };
    if (updatedBy) {
      updateData.updated_by = updatedBy;
    }

    let { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (
      error &&
      (error.code === "42501" ||
        error.message?.includes("permission denied") ||
        error.message?.includes("users"))
    ) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const adminClient = await createAdminClient();
        const retry = await adminClient
          .from("orders")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        } else if (retry.error) {
          error = retry.error;
        }
      } catch (retryCatch: any) {
        console.warn("[updateOrderStatus] Admin client retry error:", retryCatch);
      }
    }

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
