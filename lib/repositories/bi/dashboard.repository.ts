import { createClient } from '@/lib/supabase/server';

export class DashboardRepository {
  async getDailyRevenue(days = 7) {
    const supabase = await createClient();
    
    // Fetch last X days of data
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);
    
    const { data, error } = await supabase
      .from('bi_daily_revenue_rollup')
      .select('*')
      .gte('date', dateLimit.toISOString().split('T')[0])
      .order('date', { ascending: true });
      
    if (error) {
      console.error('Error fetching bi_daily_revenue_rollup:', error);
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
        isPositive: diff >= 0
      };
    };

    return {
      revenue: {
        value: today?.total_revenue || 0,
        trend: calcTrend(today?.total_revenue || 0, yesterday?.total_revenue || 0)
      },
      orders: {
        value: today?.total_orders || 0,
        trend: calcTrend(today?.total_orders || 0, yesterday?.total_orders || 0)
      },
      aov: {
        value: today?.aov || 0,
        trend: calcTrend(today?.aov || 0, yesterday?.aov || 0)
      },
      newCustomers: {
        value: today?.new_customers || 0,
        trend: calcTrend(today?.new_customers || 0, yesterday?.new_customers || 0)
      },
      returningCustomers: {
        value: today?.returning_customers || 0,
        trend: calcTrend(today?.returning_customers || 0, yesterday?.returning_customers || 0)
      }
    };
  }

  async getOperationalMetrics() {
    const supabase = await createClient();
    
    // In a real scenario, this would aggregate from orders table
    // Since we don't have a specific view for this, we'll return zeroes or placeholders if no data
    const { data: orderCounts, error } = await supabase
      .from('orders')
      .select('status');
      
    if (error) {
      console.error('Error fetching order statuses:', error);
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

    const statusCounts = orderCounts.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      pendingOrders: (statusCounts['pending_payment'] || 0) + (statusCounts['preparing'] || 0),
      completedOrders: (statusCounts['delivered'] || 0) + (statusCounts['shipped'] || 0),
      cancelledOrders: statusCounts['cancelled'] || 0,
      refundRequests: statusCounts['refunded'] || 0,
      
      // Placeholders for inventory & CRM since they require joins or other tables
      lowStock: 0,
      outOfStock: 0,
      supportTickets: 0,
    };
  }
}
