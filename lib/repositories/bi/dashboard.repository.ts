import { createAdminClient } from "@/lib/supabase/server";

export class DashboardRepository {
  async getDailyRevenue(days = 7) {
    const supabase = await createAdminClient();

    // Fetch last X days of data
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const { data, error } = await supabase
      .from("bi_daily_revenue_rollup")
      .select("*")
      .gte("date", dateLimit.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching bi_daily_revenue_rollup:", error);
      return [];
    }

    return data;
  }

  async getDashboardKPIs() {
    const data = await this.getDailyRevenue(2); // Get today and yesterday

    const today = data.length > 0 ? data[data.length - 1] : null;
    const yesterday = data.length > 1 ? data[data.length - 2] : null;

    const calcTrend = (current: number, previous: number) => {
      if (!previous) return { value: 100, isPositive: true };
      const diff = current - previous;
      const percentage = (diff / previous) * 100;
      return {
        value: Math.abs(parseFloat(percentage.toFixed(1))),
        isPositive: diff >= 0,
      };
    };

    return {
      revenue: {
        value: today?.total_revenue || 0,
        trend: calcTrend(
          today?.total_revenue || 0,
          yesterday?.total_revenue || 0
        ),
      },
      orders: {
        value: today?.total_orders || 0,
        trend: calcTrend(
          today?.total_orders || 0,
          yesterday?.total_orders || 0
        ),
      },
      aov: {
        value: today?.aov || 0,
        trend: calcTrend(today?.aov || 0, yesterday?.aov || 0),
      },
      newCustomers: {
        value: today?.new_customers || 0,
        trend: calcTrend(
          today?.new_customers || 0,
          yesterday?.new_customers || 0
        ),
      },
      returningCustomers: {
        value: today?.returning_customers || 0,
        trend: calcTrend(
          today?.returning_customers || 0,
          yesterday?.returning_customers || 0
        ),
      },
    };
  }

  async getOperationalMetrics() {
    const supabase = await createAdminClient();
    const { data: orderCounts, error } = await supabase
      .from("orders")
      .select("status");

    if (error) {
      console.error("Error fetching order statuses:", error);
      return {
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        refundRequests: 0,
        lowStock: 0,
        outOfStock: 0,
        supportTickets: 0,
      };
    }

    const statusCounts = orderCounts.reduce(
      (acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      pendingOrders:
        (statusCounts["pending_payment"] || 0) +
        (statusCounts["preparing"] || 0),
      completedOrders:
        (statusCounts["delivered"] || 0) + (statusCounts["shipped"] || 0),
      cancelledOrders: statusCounts["cancelled"] || 0,
      refundRequests: statusCounts["refunded"] || 0,
      lowStock: 0,
      outOfStock: 0,
      supportTickets: 0,
    };
  }

  async getTopSellers() {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from("bi_top_sellers").select("*");
    if (error) {
      console.error("Error fetching top sellers:", error);
      return [];
    }
    return data;
  }

  async getRevenueByCategory() {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from("bi_revenue_by_category").select("*");
    if (error) {
      console.error("Error fetching revenue by category:", error);
      return [];
    }
    return data;
  }

  async getRecentCustomers() {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from("bi_recent_customers").select("*").limit(5);
    if (error) {
      console.error("Error fetching recent customers:", error);
      return [];
    }
    return data;
  }

  async getUserLocations() {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from("bi_user_locations").select("*");
    if (error) {
      console.error("Error fetching user locations:", error);
      return [];
    }
    return data;
  }

  async getDealOfTheDay() {
    const supabase = await createAdminClient();
    // Fetch a highly discounted product or a featured product
    const { data, error } = await supabase
      .from("products")
      .select("id, name, base_price, is_featured")
      .eq("is_featured", true)
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching deal of the day:", error);
      return null;
    }

    // Get image
    if (data) {
      const { data: media } = await supabase
        .from("product_media")
        .select("url_webp")
        .eq("product_id", data.id)
        .eq("media_type", "IMAGE")
        .limit(1)
        .single();
      
      return { ...data, image_url: media?.url_webp || null };
    }
    return null;
  }

  async getRecentOrders() {
    const adminSupabase = await createAdminClient();

    const { data, error } = await adminSupabase
      .from("orders")
      .select("id, order_number, grand_total, status, created_at, customer_id")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching recent orders:", error.message, error.details, error.hint);
      return [];
    }

    // Map customer details for these orders
    const enrichedData = await Promise.all(data.map(async (order) => {
        if (!order.customer_id) return { ...order, customer_name: "Guest", customer_avatar: null };
        const { data: userData } = await adminSupabase.auth.admin.getUserById(order.customer_id).catch(() => ({ data: null }));
        return {
            ...order,
            customer_name: userData?.user?.user_metadata?.full_name || "Guest",
            customer_avatar: userData?.user?.user_metadata?.avatar_url || null
        }
    }));

    return enrichedData;
  }
}
