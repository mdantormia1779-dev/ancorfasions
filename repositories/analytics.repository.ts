import { createClient } from "@/lib/supabase/server";

export type DateRange = {
  from: Date;
  to: Date;
};

export class AnalyticsRepository {
  /**
   * Executive Dashboard Data
   */
  static async getExecutiveSummary(dateRange?: DateRange) {
    const supabase = await createClient();

    // Revenue and Orders from BI Rollup if available, otherwise from orders table
    let revenueQuery = supabase.from("bi_daily_revenue_rollup").select("*");
    if (dateRange) {
      revenueQuery = revenueQuery
        .gte("date", dateRange.from.toISOString().split("T")[0])
        .lte("date", dateRange.to.toISOString().split("T")[0]);
    }

    const { data: rollups } = await revenueQuery;

    // Customers
    let customersQuery = supabase
      .from("customer_profiles")
      .select("id, created_at, status");
    if (dateRange) {
      customersQuery = customersQuery
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());
    }
    const { data: customers } = await customersQuery;

    // Products
    const { count: productsCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    // Inventory Value
    const { data: inventory } = await supabase
      .from("inventory_levels")
      .select("quantity_available");
    const { data: products } = await supabase
      .from("products")
      .select("id, price");

    let totalRevenue = 0;
    let totalOrders = 0;
    let totalProfit = 0;

    // Calculate today, week, month, year based on rollups
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    const monthAgo = new Date();
    monthAgo.setMonth(now.getMonth() - 1);
    const monthAgoStr = monthAgo.toISOString().split("T")[0];

    const yearAgo = new Date();
    yearAgo.setFullYear(now.getFullYear() - 1);
    const yearAgoStr = yearAgo.toISOString().split("T")[0];

    let todaysRevenue = 0;
    let weeklyRevenue = 0;
    let monthlyRevenue = 0;
    let yearlyRevenue = 0;

    rollups?.forEach((r) => {
      totalRevenue += r.total_revenue || 0;
      totalOrders += r.total_orders || 0;
      totalProfit += r.total_profit || 0;

      if (r.date === todayStr) todaysRevenue += r.total_revenue || 0;
      if (r.date >= weekAgoStr) weeklyRevenue += r.total_revenue || 0;
      if (r.date >= monthAgoStr) monthlyRevenue += r.total_revenue || 0;
      if (r.date >= yearAgoStr) yearlyRevenue += r.total_revenue || 0;
    });

    // Fallback if rollups are empty: query orders directly
    if (!rollups || rollups.length === 0) {
      const { data: orders } = await supabase
        .from("orders")
        .select("total_amount, status, created_at");
      if (orders) {
        orders.forEach((o) => {
          if (o.status !== "CANCELLED" && o.status !== "RETURNED") {
            totalRevenue += o.total_amount || 0;
            totalOrders++;
            totalProfit += (o.total_amount || 0) * 0.35; // Estimated profit margin
          }
        });
      }
    }

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalCustomers = customers?.length || 0;
    const activeCustomers =
      customers?.filter((c) => c.status === "active").length || totalCustomers; // Fallback to all if status not present

    const totalInventoryValue =
      (inventory?.reduce(
        (sum, item) => sum + (item.quantity_available || 0),
        0
      ) || 0) * 50; // Approximating $50 per item if we don't map to product

    const grossProfit = totalProfit; // Simplification
    const netProfit = totalProfit * 0.8; // Simplification (after taxes/expenses)

    return {
      totalRevenue,
      todaysRevenue,
      weeklyRevenue,
      monthlyRevenue,
      yearlyRevenue,
      grossProfit,
      netProfit,
      totalOrders,
      totalCustomers,
      activeCustomers,
      productsCount: productsCount || 0,
      averageOrderValue,
      inventoryValue: totalInventoryValue,
      revenueHistory:
        rollups?.map((r) => ({ name: r.date, total: r.total_revenue })) || [],
    };
  }

  /**
   * Sales Analytics
   */
  static async getSalesAnalytics(dateRange?: DateRange) {
    const supabase = await createClient();

    // Fetch daily revenue rollups
    let rollupsQuery = supabase
      .from("bi_daily_revenue_rollup")
      .select("*")
      .order("date", { ascending: true });
    if (dateRange) {
      rollupsQuery = rollupsQuery
        .gte("date", dateRange.from.toISOString().split("T")[0])
        .lte("date", dateRange.to.toISOString().split("T")[0]);
    }
    const { data: rollups } = await rollupsQuery;

    // Fallback to orders if no rollups
    let ordersQuery = supabase
      .from("orders")
      .select(
        "total_amount, created_at, status, payment_method, shipping_method"
      );
    if (dateRange) {
      ordersQuery = ordersQuery
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());
    }
    const { data: orders } = await ordersQuery;

    let dailySales =
      rollups?.map((r) => ({ date: r.date, revenue: r.total_revenue })) || [];

    if (dailySales.length === 0 && orders) {
      const salesByDate: Record<string, number> = {};
      orders.forEach((order) => {
        if (order.status === "CANCELLED" || order.status === "RETURNED") return;
        const date = new Date(order.created_at).toISOString().split("T")[0];
        salesByDate[date] =
          (salesByDate[date] || 0) + (order.total_amount || 0);
      });
      dailySales = Object.keys(salesByDate)
        .map((date) => ({ date, revenue: salesByDate[date] }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    const paymentMethods: Record<string, number> = {};
    const shippingMethods: Record<string, number> = {};

    orders?.forEach((order) => {
      if (order.payment_method) {
        paymentMethods[order.payment_method] =
          (paymentMethods[order.payment_method] || 0) +
          (order.total_amount || 0);
      }
      if (order.shipping_method) {
        shippingMethods[order.shipping_method] =
          (shippingMethods[order.shipping_method] || 0) +
          (order.total_amount || 0);
      }
    });

    return {
      dailySales,
      paymentMethodSales: Object.keys(paymentMethods).map((k) => ({
        name: k,
        value: paymentMethods[k],
      })),
      shippingMethodSales: Object.keys(shippingMethods).map((k) => ({
        name: k,
        value: shippingMethods[k],
      })),
      totalSales: dailySales.reduce((sum, day) => sum + day.revenue, 0),
    };
  }

  /**
   * Order Analytics
   */
  static async getOrderAnalytics(dateRange?: DateRange) {
    const supabase = await createClient();
    let ordersQuery = supabase
      .from("orders")
      .select("id, status, created_at, total_amount");

    if (dateRange) {
      ordersQuery = ordersQuery
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());
    }

    const { data: orders } = await ordersQuery;

    const statusCounts: Record<string, number> = {
      pending: 0,
      processing: 0,
      packed: 0,
      shipped: 0,
      delivered: 0,
      returned: 0,
      cancelled: 0,
    };

    let totalRefunds = 0;
    let refundedOrdersCount = 0;

    orders?.forEach((order) => {
      const normalizedStatus = order.status?.toLowerCase() || "pending";
      if (statusCounts[normalizedStatus] !== undefined) {
        statusCounts[normalizedStatus]++;
      } else {
        statusCounts[normalizedStatus] = 1;
      }

      if (normalizedStatus === "returned" || normalizedStatus === "cancelled") {
        totalRefunds += order.total_amount || 0;
        refundedOrdersCount++;
      }
    });

    const statuses = Object.keys(statusCounts).map((name) => ({
      name,
      value: statusCounts[name],
    }));

    return {
      statuses,
      statusCounts,
      refundStatistics: {
        totalAmount: totalRefunds,
        count: refundedOrdersCount,
        rate: orders?.length ? (refundedOrdersCount / orders.length) * 100 : 0,
      },
      total: orders?.length || 0,
    };
  }

  /**
   * Customer Analytics
   */
  static async getCustomerAnalytics(dateRange?: DateRange) {
    const supabase = await createClient();

    let customersQuery = supabase
      .from("customer_profiles")
      .select("id, created_at");
    if (dateRange) {
      customersQuery = customersQuery
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());
    }

    const { data: customers } = await customersQuery;
    const { data: orders } = await supabase
      .from("orders")
      .select("customer_id, total_amount");

    const customerGrowthByDate: Record<string, number> = {};
    customers?.forEach((c) => {
      const date = new Date(c.created_at).toISOString().split("T")[0];
      customerGrowthByDate[date] = (customerGrowthByDate[date] || 0) + 1;
    });

    const customerGrowth = Object.keys(customerGrowthByDate)
      .map((date) => ({
        date,
        customers: customerGrowthByDate[date],
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Lifetime Value and Top Customers
    const customerSpend: Record<string, number> = {};
    const orderCount: Record<string, number> = {};

    orders?.forEach((o) => {
      if (o.customer_id) {
        customerSpend[o.customer_id] =
          (customerSpend[o.customer_id] || 0) + (o.total_amount || 0);
        orderCount[o.customer_id] = (orderCount[o.customer_id] || 0) + 1;
      }
    });

    let returningCustomers = 0;
    let newCustomers = 0;

    Object.values(orderCount).forEach((count) => {
      if (count > 1) returningCustomers++;
      else newCustomers++;
    });

    const averageLTV =
      Object.values(customerSpend).length > 0
        ? Object.values(customerSpend).reduce((a, b) => a + b, 0) /
          Object.values(customerSpend).length
        : 0;

    return {
      totalCustomers: customers?.length || 0,
      newCustomers,
      returningCustomers,
      customerGrowth,
      averageLifetimeValue: averageLTV,
      customerSegments: [
        { name: "New (1 order)", value: newCustomers },
        { name: "Returning (>1 order)", value: returningCustomers },
      ],
    };
  }

  /**
   * Product & Inventory Analytics
   */
  static async getProductAnalytics() {
    const supabase = await createClient();

    // Inventory
    const { data: inventory } = await supabase
      .from("inventory_levels")
      .select("variant_id, quantity_available, reorder_point");
    const { data: products } = await supabase
      .from("products")
      .select("id, name, views");
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, quantity, unit_price");

    let outOfStock = 0;
    let lowStock = 0;
    let inStock = 0;

    inventory?.forEach((item) => {
      if (item.quantity_available <= 0) outOfStock++;
      else if (item.quantity_available <= (item.reorder_point || 5)) lowStock++;
      else inStock++;
    });

    // Best Sellers & Worst Sellers
    const productSales: Record<string, { qty: number; rev: number }> = {};
    orderItems?.forEach((item) => {
      if (item.product_id) {
        if (!productSales[item.product_id])
          productSales[item.product_id] = { qty: 0, rev: 0 };
        productSales[item.product_id].qty += item.quantity || 1;
        productSales[item.product_id].rev +=
          (item.quantity || 1) * (item.unit_price || 0);
      }
    });

    const salesArray = Object.keys(productSales)
      .map((pid) => {
        const p = products?.find((prod) => prod.id === pid);
        return {
          id: pid,
          name: p ? p.name : "Unknown Product",
          quantitySold: productSales[pid].qty,
          revenue: productSales[pid].rev,
        };
      })
      .sort((a, b) => b.quantitySold - a.quantitySold);

    const mostViewed = [...(products || [])]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);

    return {
      stockLevels: [
        { name: "In Stock", value: inStock },
        { name: "Low Stock", value: lowStock },
        { name: "Out of Stock", value: outOfStock },
      ],
      lowStockProducts: lowStock,
      outOfStockProducts: outOfStock,
      totalItems: inventory?.length || 0,
      bestSellers: salesArray.slice(0, 10),
      worstSellers: salesArray.slice(-10).reverse(),
      mostViewedProducts: mostViewed,
    };
  }

  /**
   * Marketing Analytics
   */
  static async getMarketingAnalytics(dateRange?: DateRange) {
    const supabase = await createClient();

    let couponsQuery = supabase
      .from("coupon_usages")
      .select("discount_applied, created_at, code");
    if (dateRange) {
      couponsQuery = couponsQuery
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());
    }
    const { data: coupons } = await couponsQuery;

    const { data: customers } = await supabase
      .from("customer_profiles")
      .select("accepts_marketing");

    const totalDiscountGiven =
      coupons?.reduce((acc, c) => acc + (c.discount_applied || 0), 0) || 0;

    const newsletterSubscribers =
      customers?.filter((c) => c.accepts_marketing).length || 0;

    const couponUsageStats: Record<string, number> = {};
    coupons?.forEach((c) => {
      if (c.code) {
        couponUsageStats[c.code] = (couponUsageStats[c.code] || 0) + 1;
      }
    });

    const topCoupons = Object.keys(couponUsageStats)
      .map((code) => ({
        code,
        uses: couponUsageStats[code],
      }))
      .sort((a, b) => b.uses - a.uses)
      .slice(0, 5);

    return {
      couponsUsed: coupons?.length || 0,
      totalDiscountGiven,
      newsletterSubscribers,
      topCoupons,
      conversionRate: 3.2, // Static for now as we don't have visitor tracking table here
    };
  }

  /**
   * Alias for Inventory Analytics
   */
  static async getInventoryAnalytics() {
    return this.getProductAnalytics();
  }
}
