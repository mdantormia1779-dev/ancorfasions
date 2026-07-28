import { Metadata } from 'next';
import { getSystemAlerts } from '@/actions/ops.actions';

export const metadata: Metadata = {
  title: 'AI Insights | Anchor Fashion',
  description: 'Enterprise AI Operations and Predictions',
};

export default async function AIOpsDashboardPage() {
  const { data: alerts } = await getSystemAlerts(5);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Insights Center</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 border-blue-500/20 bg-blue-50/5 dark:bg-blue-900/10">
          <h3 className="tracking-tight text-lg font-medium mb-4 flex items-center gap-2">
            ✨ Demand Forecasting
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Based on historical data and current market trends, we predict a 24% surge in demand for 'Summer Collection' in the next 14 days.
          </p>
          <div className="text-sm font-medium text-blue-600">Action: Increase warehouse staffing by 10%</div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 border-purple-500/20 bg-purple-50/5 dark:bg-purple-900/10">
          <h3 className="tracking-tight text-lg font-medium mb-4 flex items-center gap-2">
            ✨ Inventory Optimization
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            AI analysis shows that 'Winter Coats (SKU: WC-890)' are at risk of overstock. Recommend applying a 15% discount to clear inventory before season end.
          </p>
          <div className="text-sm font-medium text-purple-600">Action: Generate promotional campaign</div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Customer Lifetime Value (CLV) Predictions</h3>
          <div className="h-[250px] flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
            <span className="text-muted-foreground">CLV Distribution Chart</span>
          </div>
        </div>
        <div className="col-span-1 rounded-xl border bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold text-lg mb-4">System Alerts (AI Detected)</h3>
          <div className="space-y-4">
            {alerts && alerts.length > 0 ? alerts.map((alert, i) => (
              <div key={i} className="flex flex-col space-y-1">
                <span className={`text-sm font-medium ${alert.severity === 'CRITICAL' ? 'text-red-500' : 'text-orange-500'}`}>
                  {alert.title}
                </span>
                <span className="text-xs text-muted-foreground">{alert.description || 'Automated anomaly detection'}</span>
              </div>
            )) : (
              <div className="text-sm text-muted-foreground">No active AI alerts.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
