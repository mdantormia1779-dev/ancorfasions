import { Metadata } from "next";
import {
  DollarSign,
  ShoppingBag,
  Activity,
  CreditCard,
  UserPlus,
} from "lucide-react";
import { DataCard } from "@/features/admin/components/DataCard";
import { RecentOrders } from "@/features/admin/components/RecentOrders";
import { SalesOverviewChart } from "@/features/admin/components/SalesOverviewChart";
import { RevenueByCategoryChart } from "@/features/admin/components/RevenueByCategoryChart";
import { UserByContinent } from "@/features/admin/components/UserByContinent";
import { TopSellersTable } from "@/features/admin/components/TopSellersTable";
import { RecentCustomers } from "@/features/admin/components/RecentCustomers";
import { formatCurrency } from "@/lib/utils";
import {
  fetchDashboardRevenueAction,
  fetchDashboardKPIsAction,
  fetchTopSellersAction,
  fetchRevenueByCategoryAction,
  fetchRecentCustomersAction,
  fetchUserLocationsAction,
  fetchRecentOrdersAction,
} from "@/app/actions/bi/dashboard.actions";

export const metadata: Metadata = {
  title: "Dashboard | Anchor Fashion",
  description: "Enterprise Dashboard",
};


export default async function AdminDashboardPage() {
  const [
    revenueRes, 
    kpisRes, 
    topSellersRes,
    revenueByCatRes,
    recentCustomersRes,
    userLocationsRes,
    recentOrdersRes
  ] = await Promise.all([
    fetchDashboardRevenueAction(30),
    fetchDashboardKPIsAction(),
    fetchTopSellersAction(),
    fetchRevenueByCategoryAction(),
    fetchRecentCustomersAction(),
    fetchUserLocationsAction(),
    fetchRecentOrdersAction()
  ]);

  const kpis = kpisRes.data || {
    revenue: { value: 0, trend: { value: 0, isPositive: true } },
    orders: { value: 0, trend: { value: 0, isPositive: true } },
    aov: { value: 0, trend: { value: 0, isPositive: true } },
    newCustomers: { value: 0, trend: { value: 0, isPositive: true } },
  };

  const salesData = revenueRes.data || [];
  const topSellers = topSellersRes.data || [];
  const revenueByCategory = revenueByCatRes.data || [];
  const recentCustomers = recentCustomersRes.data || [];
  const userLocations = userLocationsRes.data || [];
  const recentOrders = recentOrdersRes.data || [];

  const aovSparkline = salesData.length > 0 ? salesData.map((d: any) => d.aov || 0) : [0];
  const newCustomersSparkline = salesData.length > 0 ? salesData.map((d: any) => d.newCustomers || 0) : [0];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* Row 1: KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="Total Revenue"
          value={formatCurrency(kpis.revenue.value)}
          description="Compared to yesterday"
          icon={<DollarSign className="h-6 w-6" />}
          iconBgColor="bg-[#E8F8F5]"
          iconTextColor="text-[#0D9488]"
          sparklineColor="#0D9488"
          sparklineData={salesData.map(d => d.revenue).slice(-10)} // last 10 days
        />
        <DataCard
          title="Total Orders"
          value={kpis.orders.value.toLocaleString()}
          description="Compared to yesterday"
          icon={<ShoppingBag className="h-6 w-6" />}
          iconBgColor="bg-[#F3E8FF]"
          iconTextColor="text-[#9333EA]"
          sparklineColor="#9333EA"
          sparklineData={salesData.map(d => d.orders).slice(-10)}
        />
        <DataCard
          title="Average Order Value"
          value={formatCurrency(kpis.aov.value)}
          description="Compared to yesterday"
          icon={<CreditCard className="h-6 w-6" />}
          iconBgColor="bg-[#FFF3E0]"
          iconTextColor="text-[#E65100]"
          sparklineColor="#E65100"
          sparklineData={aovSparkline}
        />
        <DataCard
          title="New Customers"
          value={kpis.newCustomers.value.toLocaleString()}
          description="Compared to yesterday"
          icon={<UserPlus className="h-6 w-6" />}
          iconBgColor="bg-[#FDF2F8]"
          iconTextColor="text-[#DB2777]"
          sparklineColor="#DB2777"
          sparklineData={newCustomersSparkline}
        />
      </div>

      {/* Row 2: Recent Orders & Sales Overview */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <RecentOrders data={recentOrders} />
        </div>
        <div className="lg:col-span-4">
          <SalesOverviewChart data={salesData} />
        </div>
      </div>

      {/* Row 3: Recent Customers, Revenue By Category, User By Continent */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <RecentCustomers data={recentCustomers} />
        </div>
        <div className="lg:col-span-4">
          <RevenueByCategoryChart data={revenueByCategory} />
        </div>
        <div className="lg:col-span-4">
          <UserByContinent data={userLocations} />
        </div>
      </div>

      {/* Row 4: Top Sellers */}
      <div className="grid gap-6 lg:grid-cols-12 pb-10">
        <div className="lg:col-span-12">
          <TopSellersTable data={topSellers} />
        </div>
      </div>
    </div>
  );
}
