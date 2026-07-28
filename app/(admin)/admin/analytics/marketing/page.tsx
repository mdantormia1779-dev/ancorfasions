import { Metadata } from 'next';
import { AnalyticsService } from '@/services/analytics.service';
import { StatCard } from '@/features/analytics/components/StatCard';
import { AnalyticsFilters } from '@/features/analytics/components/AnalyticsFilters';
import { subDays } from 'date-fns';
import { Megaphone, TicketPercent, Coins } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Marketing Analytics | Anchor Fashion',
};

export const dynamic = 'force-dynamic';

export default async function MarketingAnalyticsPage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const from = searchParams.from ? new Date(searchParams.from) : subDays(new Date(), 30);
  const to = searchParams.to ? new Date(searchParams.to) : new Date();
  
  const marketingAnalytics = await AnalyticsService.getMarketingAnalytics({ from, to });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketing Analytics</h1>
        <p className="text-muted-foreground">
          Track campaign performance and coupon usage.
        </p>
      </div>
      
      <AnalyticsFilters />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Active Campaigns" 
          value="4"
          icon={<Megaphone className="w-4 h-4" />}
          description="Currently running marketing campaigns"
        />
        <StatCard 
          title="Coupons Redeemed" 
          value={marketingAnalytics.couponsUsed.toLocaleString()}
          icon={<TicketPercent className="w-4 h-4" />}
          trend={5.2}
        />
        <StatCard 
          title="Total Discount Given" 
          value={`$${marketingAnalytics.totalDiscountGiven.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<Coins className="w-4 h-4" />}
        />
      </div>

      <div className="mt-8 p-8 border rounded-lg bg-muted/20 text-center">
        <h3 className="text-lg font-medium mb-2">Campaign Performance Chart</h3>
        <p className="text-muted-foreground text-sm">More detailed campaign metrics will be available in the next sprint.</p>
      </div>
    </div>
  );
}
