import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Tag, 
  Package,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { StatCard } from '@/features/analytics/components/StatCard';
import { AnalyticsFilters } from '@/features/analytics/components/AnalyticsFilters';
import { SalesTrendChart } from '@/features/analytics/components/Charts';
import { getExecutiveSummaryAction } from '@/app/actions/analytics/dashboard.actions';
import { subDays } from 'date-fns';

export const metadata: Metadata = {
  title: 'Executive Dashboard | Anchor Fashion Analytics',
  description: 'High-level business intelligence metrics',
};

export const dynamic = 'force-dynamic';

export default async function ExecutiveDashboardPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const from = resolvedSearchParams.from ? new Date(resolvedSearchParams.from) : subDays(new Date(), 30);
  const to = resolvedSearchParams.to ? new Date(resolvedSearchParams.to) : new Date();
  
  const { data: summary, error } = await getExecutiveSummaryAction({ from, to });

  if (error || !summary) {
    return <div className="p-8 text-red-500">Failed to load executive summary: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">
            Core performance indicators and financial health.
          </p>
        </div>
      </div>
      
      <AnalyticsFilters />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Today's Revenue" 
          value={`$${summary.todaysRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard 
          title="Weekly Revenue" 
          value={`$${summary.weeklyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard 
          title="Monthly Revenue" 
          value={`$${summary.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard 
          title="Yearly Revenue" 
          value={`$${summary.yearlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard 
          title="Gross Profit" 
          value={`$${summary.grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard 
          title="Net Profit" 
          value={`$${summary.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard 
          title="Avg. Order Value" 
          value={`$${summary.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<CreditCard className="w-4 h-4" />}
        />
        <StatCard 
          title="Total Orders" 
          value={summary.totalOrders.toLocaleString()}
          icon={<ShoppingCart className="w-4 h-4" />}
        />
        <StatCard 
          title="Total Customers" 
          value={summary.totalCustomers.toLocaleString()}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard 
          title="Active Customers" 
          value={summary.activeCustomers.toLocaleString()}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard 
          title="Products Catalog" 
          value={summary.productsCount.toLocaleString()}
          icon={<Tag className="w-4 h-4" />}
        />
        <StatCard 
          title="Inventory Value" 
          value={`$${summary.inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<Package className="w-4 h-4" />}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 mt-6">
        <SalesTrendChart 
          title="Revenue Trend" 
          description="Daily revenue performance for the selected period"
          data={summary.revenueHistory}
        />
      </div>
    </div>
  );
}
