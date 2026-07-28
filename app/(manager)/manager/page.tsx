import { Metadata } from "next";
import { StatCards } from "@/components/manager/dashboard/StatCards";
import { RecentOrdersTable } from "@/components/manager/dashboard/RecentOrdersTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RevenueChart } from "@/components/manager/dashboard/RevenueChart";
import { InventoryAlerts } from "@/components/manager/dashboard/InventoryAlerts";
import { fetchDashboardKPIsAction, fetchDashboardRevenueAction, fetchOperationalMetricsAction } from "@/app/actions/bi/dashboard.actions";
import { fetchOrdersAction } from "@/app/actions/oms/order.actions";

export const metadata: Metadata = {
  title: "Manager Dashboard Overview | Anchor Fashion",
  description: "Overview of today's business operations.",
};

export default async function ManagerDashboardPage() {
  const [kpisRes, revenueRes, ordersRes, opsRes] = await Promise.all([
    fetchDashboardKPIsAction(),
    fetchDashboardRevenueAction(7),
    fetchOrdersAction({ limit: 5 }),
    fetchOperationalMetricsAction()
  ]);

  const rawKpis = kpisRes.data || {
    revenue: { value: 0, trend: { value: 0, isPositive: true } },
    orders: { value: 0, trend: { value: 0, isPositive: true } }
  };
  
  const ops = opsRes.data || {
    pendingOrders: 0,
    supportTickets: 0
  };

  const kpis = {
    revenue: rawKpis.revenue,
    orders: rawKpis.orders,
    processing: { value: ops.pendingOrders, trend: { value: 0, isPositive: true } }, // Dummy trend for ops
    alerts: { value: ops.supportTickets }
  };

  // Map revenue to expected format for Recharts
  const revenueData = (revenueRes.data || []).map((d: any) => ({
    name: d.name,
    total: d.revenue
  }));

  // Orders pagination returns { data, count } or just array depending on the repo
  const rawOrders = ordersRes.data;
  const ordersList = Array.isArray(rawOrders) ? rawOrders : (rawOrders?.data || []);

  const orders = ordersList.map((o: any) => ({
    id: o.id,
    customer: o.user_id, // In a real setup, we'd join user profile to get name
    status: o.status,
    date: new Date(o.created_at).toLocaleDateString(),
    amount: o.total_amount
  }));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back. Here is what is happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <StatCards kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts & Analytics */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <RevenueChart data={revenueData} />
          <RecentOrdersTable orders={orders} />
        </div>
        
        {/* Alerts & Tasks */}
        <div className="col-span-1 flex flex-col gap-6">
          <InventoryAlerts />
          {/* We can add a simple Tasks widget here later */}
        </div>
      </div>
    </div>
  );
}
