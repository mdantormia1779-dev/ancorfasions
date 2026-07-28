import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  Package, 
  Megaphone, 
  DollarSign, 
  ShoppingCart, 
  Tag, 
  Briefcase, 
  Building2, 
  Warehouse,
  TrendingUp,
  Percent
} from 'lucide-react';
import { AnalyticsService } from '@/services/analytics.service';
import { StatCard } from '@/features/analytics/components/StatCard';
import { AnalyticsFilters } from '@/features/analytics/components/AnalyticsFilters';
import { SalesTrendChart } from '@/features/analytics/components/Charts';
import { subDays } from 'date-fns';

export const metadata: Metadata = {
  title: 'Executive Dashboard | Anchor Fashion Analytics',
  description: 'Enterprise Analytics and Business Intelligence',
};

export const dynamic = 'force-dynamic';

const analyticsModules = [
  { id: 'sales', name: 'Sales Analytics', icon: BarChart3, description: 'Revenue, conversion rates, and sales trends', href: '/admin/analytics/sales' },
  { id: 'customer', name: 'Customer Analytics', icon: Users, description: 'LTV, segmentation, and retention metrics', href: '/admin/analytics/customers' },
  { id: 'inventory', name: 'Inventory Analytics', icon: Package, description: 'Stock levels, turnover, and forecasting', href: '/admin/analytics/inventory' },
  { id: 'marketing', name: 'Marketing Analytics', icon: Megaphone, description: 'Campaign performance and ROI tracking', href: '/admin/analytics/marketing' },
  { id: 'finance', name: 'Finance Analytics', icon: DollarSign, description: 'Expenses, profitability, and taxation', href: '/admin/analytics/finance' },
  { id: 'order', name: 'Order Analytics', icon: ShoppingCart, description: 'Fulfillment rates and return analysis', href: '/admin/analytics/orders' },
  { id: 'reports', name: 'Custom Reports', icon: Tag, description: 'Generate custom business reports', href: '/admin/analytics/reports' },
];

export default async function AnalyticsHubPage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const from = searchParams.from ? new Date(searchParams.from) : subDays(new Date(), 30);
  const to = searchParams.to ? new Date(searchParams.to) : new Date();
  
  const [executiveSummary, salesAnalytics] = await Promise.all([
    AnalyticsService.getExecutiveSummary({ from, to }),
    AnalyticsService.getSalesAnalytics({ from, to })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">
            Centralized business intelligence and key performance indicators.
          </p>
        </div>
      </div>
      
      <AnalyticsFilters />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`$${executiveSummary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-4 h-4" />}
          trend={12.5}
        />
        <StatCard 
          title="Total Orders" 
          value={executiveSummary.totalOrders.toLocaleString()}
          icon={<ShoppingCart className="w-4 h-4" />}
          trend={8.2}
        />
        <StatCard 
          title="Avg. Order Value" 
          value={`$${executiveSummary.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrendingUp className="w-4 h-4" />}
          trend={-2.1}
        />
        <StatCard 
          title="Total Customers" 
          value={executiveSummary.totalCustomers.toLocaleString()}
          icon={<Users className="w-4 h-4" />}
          trend={15.4}
        />
        <StatCard 
          title="Conversion Rate" 
          value={`3.2%`}
          icon={<Percent className="w-4 h-4" />}
          trend={0.5}
        />
        <StatCard 
          title="Products Count" 
          value={executiveSummary.productsCount.toLocaleString()}
          icon={<Tag className="w-4 h-4" />}
        />
        <StatCard 
          title="Inventory Items" 
          value={executiveSummary.inventoryValue.toLocaleString()}
          icon={<Package className="w-4 h-4" />}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <SalesTrendChart 
          title="Revenue Trend" 
          description="Daily revenue performance for the selected period"
          data={salesAnalytics.dailySales}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight mt-8 mb-4">Analytics Modules</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {analyticsModules.map((module) => (
            <Link key={module.id} href={module.href}>
              <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer group border-primary/10 hover:border-primary/30">
                <CardHeader>
                  <div className="p-2 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <module.icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">{module.name}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
