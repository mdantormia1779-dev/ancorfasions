import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Operations Center | Anchor Fashion',
  description: 'Enterprise Operations, Monitoring, and SRE',
};

export default function OperationsDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Operations Center</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 border-green-500/20 bg-green-50/5">
          <h3 className="tracking-tight text-sm font-medium mb-2">System Status</h3>
          <div className="text-2xl font-bold text-green-600">All Systems Operational</div>
          <p className="text-xs text-muted-foreground mt-1">Uptime: 99.99%</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-sm font-medium mb-2">Active Jobs</h3>
          <div className="text-2xl font-bold">14</div>
          <p className="text-xs text-muted-foreground mt-1">2 Failed, 12 Running</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="tracking-tight text-sm font-medium mb-2">API Latency</h3>
          <div className="text-2xl font-bold">45ms</div>
          <p className="text-xs text-muted-foreground mt-1">p95: 120ms</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 border-orange-500/20">
          <h3 className="tracking-tight text-sm font-medium mb-2">Open Alerts</h3>
          <div className="text-2xl font-bold text-orange-600">3</div>
          <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Service Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">PostgreSQL Database</span>
              <span className="text-green-600 text-sm font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-600 inline-block"></span> Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Redis Cache</span>
              <span className="text-green-600 text-sm font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-600 inline-block"></span> Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Payment Gateway API</span>
              <span className="text-green-600 text-sm font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-600 inline-block"></span> Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Inventory Sync Worker</span>
              <span className="text-orange-500 text-sm font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-orange-500 inline-block animate-pulse"></span> Degraded
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Recent System Logs</h3>
          <div className="bg-muted/30 p-4 rounded-md font-mono text-xs space-y-2 h-[200px] overflow-y-auto">
            <div className="text-gray-500">[2026-07-27 12:40:01] <span className="text-blue-500">INFO</span> - Backup job started</div>
            <div className="text-gray-500">[2026-07-27 12:41:22] <span className="text-green-500">SUCCESS</span> - Backup job completed</div>
            <div className="text-gray-500">[2026-07-27 12:42:05] <span className="text-yellow-500">WARN</span> - High memory usage on instance i-0a8b9c</div>
            <div className="text-gray-500">[2026-07-27 12:43:10] <span className="text-red-500">ERROR</span> - Failed to sync inventory for SKU WC-890</div>
            <div className="text-gray-500">[2026-07-27 12:43:15] <span className="text-blue-500">INFO</span> - Retrying inventory sync (1/3)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
