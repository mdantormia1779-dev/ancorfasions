import { Metadata } from 'next';
import { AnalyticsService } from '@/services/analytics.service';
import { StatCard } from '@/features/analytics/components/StatCard';
import { AnalyticsFilters } from '@/features/analytics/components/AnalyticsFilters';
import { SalesTrendChart } from '@/features/analytics/components/Charts';
import { subDays } from 'date-fns';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sales Analytics | Anchor Fashion',
};

export const dynamic = 'force-dynamic';

export default async function SalesAnalyticsPage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const from = searchParams.from ? new Date(searchParams.from) : subDays(new Date(), 30);
  const to = searchParams.to ? new Date(searchParams.to) : new Date();
  
  const salesAnalytics = await AnalyticsService.getSalesAnalytics({ from, to });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
        <p className="text-muted-foreground">
          Detailed breakdown of revenue and sales trends.
        </p>
      </div>
      
      <AnalyticsFilters />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Total Sales" 
          value={`$${salesAnalytics.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard 
          title="Average Daily Sales" 
          value={`$${(salesAnalytics.totalSales / (salesAnalytics.dailySales.length || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<BarChart3 className="w-4 h-4" />}
        />
        <StatCard 
          title="Growth Rate" 
          value={`+12.5%`}
          icon={<TrendingUp className="w-4 h-4" />}
          trend={12.5}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <SalesTrendChart 
          title="Sales Trend" 
          description="Revenue over the selected time period"
          data={salesAnalytics.dailySales}
        />
      </div>
    </div>
  );
}
