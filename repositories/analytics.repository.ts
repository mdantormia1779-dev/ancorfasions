import { createClient } from '@/lib/supabase/server';

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
    
    // Revenue and Orders
    let ordersQuery = supabase.from('orders').select('total_amount, status, created_at');
    if (dateRange) {
      ordersQuery = ordersQuery.gte('created_at', dateRange.from.toISOString())
                               .lte('created_at', dateRange.to.toISOString());
    }
    
    const { data: orders } = await ordersQuery;
    
    // Customers
    let customersQuery = supabase.from('customer_profiles').select('id, created_at');
    if (dateRange) {
      customersQuery = customersQuery.gte('created_at', dateRange.from.toISOString())
                                     .lte('created_at', dateRange.to.toISOString());
    }
    const { data: customers } = await customersQuery;
    
    // Products
    const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    
    // Inventory Value (simplified - total quantity * unit_cost or just sum of quantities for now if cost is unavailable)
    const { data: inventory } = await supabase.from('inventory_levels').select('quantity_available');
    
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.filter(o => o.status !== 'CANCELLED' && o.status !== 'RETURNED')
                               .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
                               
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalCustomers = customers?.length || 0;
    const totalInventoryValue = inventory?.reduce((sum, item) => sum + (item.quantity_available || 0), 0) || 0;
    
    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      productsCount: productsCount || 0,
      averageOrderValue,
      inventoryValue: totalInventoryValue, // Using quantity as a proxy if value is complex
    };
  }

  /**
   * Sales Analytics
   */
  static async getSalesAnalytics(dateRange?: DateRange) {
    const supabase = await createClient();
    
    let ordersQuery = supabase.from('orders').select('total_amount, created_at, status');
    if (dateRange) {
      ordersQuery = ordersQuery.gte('created_at', dateRange.from.toISOString())
                               .lte('created_at', dateRange.to.toISOString());
    }
    
    const { data: orders } = await ordersQuery;
    
    // Group by date
    const salesByDate: Record<string, number> = {};
    orders?.forEach(order => {
      if (order.status === 'CANCELLED' || order.status === 'RETURNED') return;
      
      const date = new Date(order.created_at).toISOString().split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + (order.total_amount || 0);
    });
    
    const dailySales = Object.keys(salesByDate).map(date => ({
      date,
      revenue: salesByDate[date]
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      dailySales,
      totalSales: orders?.reduce((acc, o) => acc + (o.total_amount || 0), 0) || 0,
    };
  }

  /**
   * Order Analytics
   */
  static async getOrderAnalytics(dateRange?: DateRange) {
    const supabase = await createClient();
    let ordersQuery = supabase.from('orders').select('id, status, created_at');
    
    if (dateRange) {
      ordersQuery = ordersQuery.gte('created_at', dateRange.from.toISOString())
                               .lte('created_at', dateRange.to.toISOString());
    }
    
    const { data: orders } = await ordersQuery;
    
    const statusCounts: Record<string, number> = {
      PENDING: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, RETURNED: 0, CANCELLED: 0
    };
    
    orders?.forEach(order => {
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status]++;
      } else {
        statusCounts[order.status] = 1;
      }
    });
    
    const statuses = Object.keys(statusCounts).map(name => ({
      name,
      value: statusCounts[name]
    }));
    
    return {
      statuses,
      total: orders?.length || 0
    };
  }
  
  /**
   * Customer Analytics
   */
  static async getCustomerAnalytics(dateRange?: DateRange) {
    const supabase = await createClient();
    
    let customersQuery = supabase.from('customer_profiles').select('id, created_at');
    if (dateRange) {
      customersQuery = customersQuery.gte('created_at', dateRange.from.toISOString())
                                     .lte('created_at', dateRange.to.toISOString());
    }
    
    const { data: customers } = await customersQuery;
    
    const customerGrowthByDate: Record<string, number> = {};
    customers?.forEach(c => {
      const date = new Date(c.created_at).toISOString().split('T')[0];
      customerGrowthByDate[date] = (customerGrowthByDate[date] || 0) + 1;
    });
    
    const customerGrowth = Object.keys(customerGrowthByDate).map(date => ({
      date,
      customers: customerGrowthByDate[date]
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      totalCustomers: customers?.length || 0,
      customerGrowth
    };
  }
  
  /**
   * Inventory Analytics
   */
  static async getInventoryAnalytics() {
    const supabase = await createClient();
    const { data: inventory } = await supabase.from('inventory_levels').select('variant_id, quantity_available, reorder_point');
    
    let outOfStock = 0;
    let lowStock = 0;
    let inStock = 0;
    
    inventory?.forEach(item => {
      if (item.quantity_available <= 0) outOfStock++;
      else if (item.quantity_available <= (item.reorder_point || 5)) lowStock++;
      else inStock++;
    });
    
    return {
      stockLevels: [
        { name: 'In Stock', value: inStock },
        { name: 'Low Stock', value: lowStock },
        { name: 'Out of Stock', value: outOfStock },
      ],
      totalItems: inventory?.length || 0
    };
  }
  
  /**
   * Marketing Analytics
   */
  static async getMarketingAnalytics(dateRange?: DateRange) {
    const supabase = await createClient();
    
    let couponsQuery = supabase.from('coupon_usages').select('discount_applied, created_at');
    if (dateRange) {
      couponsQuery = couponsQuery.gte('created_at', dateRange.from.toISOString())
                                 .lte('created_at', dateRange.to.toISOString());
    }
    
    const { data: coupons } = await couponsQuery;
    
    const totalDiscountGiven = coupons?.reduce((acc, c) => acc + (c.discount_applied || 0), 0) || 0;
    
    return {
      couponsUsed: coupons?.length || 0,
      totalDiscountGiven
    };
  }
}
