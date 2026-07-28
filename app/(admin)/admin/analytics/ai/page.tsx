import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveKpiCard } from "@/components/admin/analytics/kpi/LiveKpiCard";
import { Bot, Zap, Cpu, CheckCircle2 } from "lucide-react";
import { AreaChartVariant } from "@/components/admin/analytics/charts/AreaChartVariant";

export default function AiAnalyticsPage() {
  const tokenUsage = [
    { date: "Jan", tokens: 450000 },
    { date: "Feb", tokens: 520000 },
    { date: "Mar", tokens: 480000 },
    { date: "Apr", tokens: 610000 },
    { date: "May", tokens: 590000 },
    { date: "Jun", tokens: 720000 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <LiveKpiCard
          title="Total AI Requests"
          value="45,231"
          icon={<Bot />}
          trend={12.4}
        />
        <LiveKpiCard
          title="Tokens Used (M)"
          value="3.37"
          icon={<Cpu />}
          trend={15.2}
          invertColors
        />
        <LiveKpiCard
          title="Avg Latency"
          value="452ms"
          icon={<Zap />}
          trend={-5.1}
          invertColors
        />
        <LiveKpiCard
          title="Automation Success"
          value="98.2%"
          icon={<CheckCircle2 />}
          trend={0.4}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token Usage Trends</CardTitle>
          <CardDescription>Monthly Gemini API token consumption.</CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChartVariant 
            data={tokenUsage} 
            xDataKey="date" 
            yDataKey="tokens" 
            valueFormatter="number"
            color="#8b5cf6"
          />
        </CardContent>
      </Card>
    </div>
  );
}
