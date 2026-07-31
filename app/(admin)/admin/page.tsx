import { Metadata } from "next";
import {
  DollarSign,
  ShoppingBag,
  Activity,
  CreditCard,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { DataCard } from "@/features/admin/components/DataCard";
import { DataChart } from "@/features/admin/components/DataChart";
import { RecentOrders } from "@/features/admin/components/RecentOrders";
import { LowStockAlerts } from "@/features/admin/components/LowStockAlerts";
import { Button } from "@/components/ui/button";
import {
  fetchDashboardRevenueAction,
  fetchDashboardKPIsAction,
} from "@/app/actions/bi/dashboard.actions";

export const metadata: Metadata = {
  title: "Dashboard | Anchor Fashion",
  description: "Enterprise Dashboard",
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    val
  );

export default async function AdminDashboardPage() {
  const [revenueRes, kpisRes] = await Promise.all([
    fetchDashboardRevenueAction(7),
    fetchDashboardKPIsAction(),
  ]);

  const revenueData = revenueRes.data || [];

  const kpis = kpisRes.data || {
    revenue: { value: 0, trend: { value: 0, isPositive: true } },
    orders: { value: 0, trend: { value: 0, isPositive: true } },
    aov: { value: 0, trend: { value: 0, isPositive: true } },
    newCustomers: { value: 0, trend: { value: 0, isPositive: true } },
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your store's performance and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-white">
            Export Report
          </Button>
          <Button className="bg-slate-900 text-white hover:bg-slate-800">
            Add Product
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="Total Revenue"
          value={formatCurrency(kpis.revenue.value)}
          trend={kpis.revenue.trend}
          description="vs last 7 days"
          icon={<DollarSign className="h-4 w-4 text-slate-700" />}
        />
        <DataCard
          title="Total Orders"
          value={kpis.orders.value.toLocaleString()}
          trend={kpis.orders.trend}
          description="vs last 7 days"
          icon={<ShoppingBag className="h-4 w-4 text-slate-700" />}
        />
        <DataCard
          title="Average Order Value"
          value={formatCurrency(kpis.aov.value)}
          trend={kpis.aov.trend}
          description="vs last 7 days"
          icon={<CreditCard className="h-4 w-4 text-slate-700" />}
        />
        <DataCard
          title="New Customers"
          value={kpis.newCustomers.value.toLocaleString()}
          trend={kpis.newCustomers.trend}
          description="vs last 7 days"
          icon={<UserPlus className="h-4 w-4 text-slate-700" />}
        />
      </div>

      {/* Main Grid: Charts & Tables */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Left Column (Wider) */}
        <div className="space-y-6 lg:col-span-4">
          <DataChart
            title="Revenue Over Time"
            description="Daily revenue performance for the current week."
            data={revenueData}
            type="area"
            xKey="name"
            yKey="revenue"
            height={350}
          />
          <RecentOrders />
        </div>

        {/* Right Column (Narrower) */}
        <div className="space-y-6 lg:col-span-3">
          <LowStockAlerts />

          {/* Example of a secondary stat card in the right column */}
          <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-sm">
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <Activity className="h-4 w-4" />
              Store Conversion Rate
            </h3>
            <div className="mb-2 text-3xl font-bold tracking-tight">3.24%</div>
            <p className="flex items-center gap-1 text-sm text-indigo-100">
              <ArrowUpRight className="h-4 w-4" />
              +0.5% from last week
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
