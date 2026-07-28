import { Metadata } from 'next';
import { AnalyticsService } from '@/services/analytics.service';
import { StatCard } from '@/features/analytics/components/StatCard';
import { AnalyticsFilters } from '@/features/analytics/components/AnalyticsFilters';
import { SalesTrendChart } from '@/features/analytics/components/Charts';
import { subDays } from 'date-fns';
import { Users, UserPlus, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Customer Analytics | Anchor Fashion',
};

export const dynamic = 'force-dynamic';

export default async function CustomerAnalyticsPage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const from = searchParams.from ? new Date(searchParams.from) : subDays(new Date(), 30);
  const to = searchParams.to ? new Date(searchParams.to) : new Date();
  
  const customerAnalytics = await AnalyticsService.getCustomerAnalytics({ from, to });
  
  const newCustomers = customerAnalytics.customerGrowth.reduce((acc, curr) => acc + curr.customers, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Analytics</h1>
        <p className="text-muted-foreground">
          Analyze customer growth, retention, and lifetime value.
        </p>
      </div>
      
      <AnalyticsFilters />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Total Customers" 
          value={customerAnalytics.totalCustomers.toLocaleString()}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard 
          title="New Customers" 
          value={newCustomers.toLocaleString()}
          icon={<UserPlus className="w-4 h-4" />}
          trend={8.4}
        />
        <StatCard 
          title="Returning Rate" 
          value="42.5%"
          icon={<HeartHandshake className="w-4 h-4" />}
          trend={1.2} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <SalesTrendChart 
          title="Customer Growth" 
          description="New customer acquisitions over time"
          data={customerAnalytics.customerGrowth.map(c => ({ date: c.date, revenue: c.customers }))}
        />
      </div>
    </div>
  );
}
