import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, CreditCard, Truck, ListFilter } from "lucide-react";
import { StatCard } from "@/features/analytics/components/StatCard";
import { AnalyticsFilters } from "@/features/analytics/components/AnalyticsFilters";
import {
  SalesTrendChart,
  SimplePieChart,
  StatusDistributionChart,
} from "@/features/analytics/components/Charts";
import { getSalesAnalyticsAction } from "@/app/actions/analytics/dashboard.actions";
import { subDays } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sales Analytics | Anchor Fashion Analytics",
  description: "Deep dive into sales performance",
};

export const dynamic = "force-dynamic";

export default async function SalesAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const from = resolvedSearchParams.from
    ? new Date(resolvedSearchParams.from)
    : subDays(new Date(), 30);
  const to = resolvedSearchParams.to
    ? new Date(resolvedSearchParams.to)
    : new Date();

  const { data: sales, error } = await getSalesAnalyticsAction({ from, to });

  if (error || !sales) {
    return (
      <div className="p-8 text-red-500">
        Failed to load sales analytics: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="text-muted-foreground">
            Revenue breakdowns, payment methods, and category trends.
          </p>
        </div>
      </div>

      <AnalyticsFilters />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={formatCurrency(sales.totalSales)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Daily Average"
          value={formatCurrency(sales.totalSales / (sales.dailySales.length || 1))}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Top Payment Method"
          value={
            sales.paymentMethodSales.length > 0
              ? sales.paymentMethodSales.sort((a, b) => b.value - a.value)[0]
                  .name
              : "N/A"
          }
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Top Shipping Method"
          value={
            sales.shippingMethodSales.length > 0
              ? sales.shippingMethodSales.sort((a, b) => b.value - a.value)[0]
                  .name
              : "N/A"
          }
          icon={<Truck className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <SalesTrendChart
          title="Sales Trend"
          description="Daily sales performance"
          data={sales.dailySales}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <SimplePieChart
          title="Sales by Payment Method"
          data={sales.paymentMethodSales}
        />
        <SimplePieChart
          title="Sales by Shipping Method"
          data={sales.shippingMethodSales}
        />
      </div>
    </div>
  );
}
