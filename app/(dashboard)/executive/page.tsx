import { Metadata } from 'next';
import { getDashboardSnapshot } from '@/actions/analytics.actions';

export const metadata: Metadata = {
  title: 'Executive Dashboard | Anchor Fashion',
  description: 'Enterprise Executive Analytics and BI',
};

export default async function ExecutiveDashboardPage() {
  const { data, error } = await getDashboardSnapshot('executive', 'daily');

  const stats = data?.snapshot_data || {
    totalRevenue: '$2.4M',
    growth: '+12%',
    activeUsers: '14,200',
    salesVolume: '8,430',
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Executive Dashboard</h2>
      </div>
      
      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-md border border-red-200">
          Failed to load live data: {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Revenue</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">{stats.growth} from last month</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Sales Volume</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.salesVolume}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Active Users</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">AI Forecast</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold text-green-600">Stable Growth</div>
            <p className="text-xs text-muted-foreground">Confidence: 94%</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Revenue Trend (30 Days)</h3>
          <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
            {/* Placeholder for Recharts or Chart.js */}
            <span className="text-muted-foreground">Revenue Chart Visualization</span>
          </div>
        </div>
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Top Regions</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">North America</p>
                <p className="text-sm text-muted-foreground">45% of total sales</p>
              </div>
              <div className="ml-auto font-medium">+$1.1M</div>
            </div>
            <div className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">Europe</p>
                <p className="text-sm text-muted-foreground">30% of total sales</p>
              </div>
              <div className="ml-auto font-medium">+$720K</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
