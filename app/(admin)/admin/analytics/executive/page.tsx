import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveKpiCard } from "@/components/admin/analytics/kpi/LiveKpiCard";
import { AreaChartVariant } from "@/components/admin/analytics/charts/AreaChartVariant";
import { BarChartVariant } from "@/components/admin/analytics/charts/BarChartVariant";
import { GeminiInsightBox } from "@/components/admin/analytics/ai-insights/GeminiInsightBox";
import { 
  getExecutiveKpis, 
  getSalesTrends, 
  getTopCategories 
} from "@/lib/analytics/queries";
import { DollarSign, ShoppingBag, TrendingUp, Activity } from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ExecutiveDashboardPage() {
  const kpis = await getExecutiveKpis();
  const salesTrends = await getSalesTrends();
  const topCategories = await getTopCategories();

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <LiveKpiCard
          title="Total Revenue"
          value={`$${kpis?.revenue.value.toLocaleString()}`}
          icon={<DollarSign />}
          trend={kpis?.revenue.trend}
          isLive
        />
        <LiveKpiCard
          title="Total Orders"
          value={kpis?.orders.value.toLocaleString() || '0'}
          icon={<ShoppingBag />}
          trend={kpis?.orders.trend}
          isLive
        />
        <LiveKpiCard
          title="Gross Profit"
          value={`$${kpis?.profit.value.toLocaleString()}`}
          icon={<TrendingUp />}
          trend={kpis?.profit.trend}
        />
        <LiveKpiCard
          title="Business Health"
          value="98.5"
          icon={<Activity />}
          description="Index Score"
          trend={1.2}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Trend */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>
              Daily revenue for the last 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <AreaChartVariant 
              data={salesTrends} 
              xDataKey="date" 
              yDataKey="sales" 
              valueFormatter="currency"
              color="#0ea5e9"
            />
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>
              Revenue by product category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartVariant 
              data={topCategories} 
              xDataKey="name" 
              yDataKey="value"
              valueFormatter="currency"
              color="#f43f5e"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <GeminiInsightBox context="executive" />
      </div>
    </div>
  );
}
