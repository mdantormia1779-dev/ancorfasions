'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Package, CheckCircle2, XCircle, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Analytics {
  period: { days: number; from: string };
  statusBreakdown: Record<string, number>;
  courierPerformance: {
    courier: string;
    total: number;
    delivered: number;
    failed: number;
    successRate: number | null;
  }[];
  dailyVolume: { date: string; count: number }[];
  deliveryRate: number | null;
  total: number;
}

const COURIER_LABELS: Record<string, string> = {
  steadfast: 'Steadfast',
  pathao: 'Pathao',
  redx: 'RedX',
  paperfly: 'Paperfly',
  sundarban: 'Sundarban',
  ecourier: 'eCourier',
  dhl: 'DHL',
  fedex: 'FedEx',
  ups: 'UPS',
  sandbox: 'Sandbox',
};

export default function ShippingAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/shipping/analytics?days=${days}`)
      .then((r) => r.json())
      .then((json) => {
        setAnalytics(json.data ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [days]);

  const maxVolume = Math.max(...(analytics?.dailyVolume.map((d) => d.count) ?? [1]), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping Analytics</h1>
          <p className="text-muted-foreground mt-1">Performance overview and courier insights</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/shipping"><Button variant="outline" size="sm">← Shipping</Button></Link>
          <div className="flex gap-1">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={days === d ? 'default' : 'outline'}
                onClick={() => setDays(d)}
              >
                {d}d
              </Button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">Loading analytics…</div>
      ) : analytics && (
        <>
          {/* KPI Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg"><Package className="h-5 w-5 text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Shipments</p>
                    <p className="text-2xl font-bold">{analytics.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Delivered</p>
                    <p className="text-2xl font-bold">{analytics.statusBreakdown['delivered'] ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery Rate</p>
                    <p className="text-2xl font-bold">
                      {analytics.deliveryRate !== null ? `${analytics.deliveryRate}%` : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg"><XCircle className="h-5 w-5 text-red-600" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Failed / RTO</p>
                    <p className="text-2xl font-bold">
                      {(analytics.statusBreakdown['delivery_failed'] ?? 0) + (analytics.statusBreakdown['returned_to_origin'] ?? 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Daily Shipment Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-32 overflow-x-auto pb-2">
                {analytics.dailyVolume.slice(-30).map(({ date, count }) => (
                  <div key={date} className="flex flex-col items-center gap-1 min-w-[20px]" title={`${date}: ${count}`}>
                    <div
                      className="w-4 bg-blue-400 rounded-t hover:bg-blue-500 transition-colors cursor-pointer"
                      style={{ height: `${Math.max(4, (count / maxVolume) * 112)}px` }}
                    />
                    <span className="text-[8px] text-muted-foreground transform -rotate-45 origin-top-right">
                      {date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Courier Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" /> Courier Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.courierPerformance
                  .sort((a, b) => b.total - a.total)
                  .map((cp) => (
                    <div key={cp.courier}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm capitalize">{COURIER_LABELS[cp.courier] ?? cp.courier}</span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{cp.total} total</span>
                          <span className="text-green-600">{cp.delivered} delivered</span>
                          <span className="text-red-500">{cp.failed} failed</span>
                          <span className="font-semibold text-slate-700">
                            {cp.successRate !== null ? `${cp.successRate}%` : '—'}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-green-400 rounded-full"
                          style={{ width: `${(cp.delivered / Math.max(cp.total, 1)) * 100}%` }}
                        />
                        <div
                          className="absolute h-full bg-red-300 rounded-full"
                          style={{
                            left: `${(cp.delivered / Math.max(cp.total, 1)) * 100}%`,
                            width: `${(cp.failed / Math.max(cp.total, 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}

                {analytics.courierPerformance.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">No courier data for this period.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card>
            <CardHeader><CardTitle>Status Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
                  <div key={status} className="bg-slate-50 rounded-xl p-3 border">
                    <p className="text-xs text-muted-foreground capitalize">{status.replace(/_/g, ' ')}</p>
                    <p className="text-xl font-bold mt-1">{count}</p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.total > 0 ? `${Math.round((count / analytics.total) * 100)}%` : '0%'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
