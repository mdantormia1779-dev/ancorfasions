import { Metadata } from 'next';
import { AnalyticsService } from '@/services/analytics.service';
import { StatCard } from '@/features/analytics/components/StatCard';
import { AnalyticsFilters } from '@/features/analytics/components/AnalyticsFilters';
import { StatusDistributionChart } from '@/features/analytics/components/Charts';
import { subDays } from 'date-fns';
import { ShoppingCart, PackageCheck, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Order Analytics | Anchor Fashion',
};

export const dynamic = 'force-dynamic';

export default async function OrderAnalyticsPage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const from = searchParams.from ? new Date(searchParams.from) : subDays(new Date(), 30);
  const to = searchParams.to ? new Date(searchParams.to) : new Date();
  
  const orderAnalytics = await AnalyticsService.getOrderAnalytics({ from, to });
  
  const delivered = orderAnalytics.statuses.find(s => s.name === 'DELIVERED')?.value || 0;
  const fulfillmentRate = orderAnalytics.total > 0 ? (delivered / orderAnalytics.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Analytics</h1>
        <p className="text-muted-foreground">
          Track order volume, fulfillment rates, and statuses.
        </p>
      </div>
      
      <AnalyticsFilters />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Total Orders" 
          value={orderAnalytics.total.toLocaleString()}
          icon={<ShoppingCart className="w-4 h-4" />}
        />
        <StatCard 
          title="Fulfillment Rate" 
          value={`${fulfillmentRate.toFixed(1)}%`}
          icon={<PackageCheck className="w-4 h-4" />}
          trend={2.4}
        />
        <StatCard 
          title="Avg. Processing Time" 
          value="1.2 Days"
          icon={<Clock className="w-4 h-4" />}
          trend={-5.0} // Negative processing time is good, but usually we map green to good. 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <StatusDistributionChart 
          title="Orders by Status" 
          description="Distribution of orders across fulfillment stages"
          data={orderAnalytics.statuses}
        />
      </div>
    </div>
  );
}
