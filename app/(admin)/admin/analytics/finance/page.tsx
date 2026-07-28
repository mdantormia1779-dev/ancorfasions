import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveKpiCard } from "@/components/admin/analytics/kpi/LiveKpiCard";
import { AreaChartVariant } from "@/components/admin/analytics/charts/AreaChartVariant";
import { DollarSign, Percent, TrendingDown, Wallet } from "lucide-react";
import { getSalesTrends } from "@/lib/analytics/queries";

export const revalidate = 60;

export default async function FinanceAnalyticsPage() {
  const trends = await getSalesTrends();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <LiveKpiCard
          title="Gross Profit"
          value="$85,240"
          icon={<DollarSign />}
          trend={14.1}
        />
        <LiveKpiCard
          title="Profit Margin"
          value="68.5%"
          icon={<Percent />}
          trend={1.2}
        />
        <LiveKpiCard
          title="Operating Expenses"
          value="$24,500"
          icon={<TrendingDown />}
          trend={-5.4}
          invertColors
        />
        <LiveKpiCard
          title="Net Cash Flow"
          value="$60,740"
          icon={<Wallet />}
          trend={8.9}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Profit vs Revenue</CardTitle>
            <CardDescription>Margin analysis over time.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Reusing salesTrends to show profit trend, in a real scenario this might be a composed chart */}
            <AreaChartVariant 
              data={trends} 
              xDataKey="date" 
              yDataKey="profit" 
              valueFormatter="currency"
              color="#059669"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
