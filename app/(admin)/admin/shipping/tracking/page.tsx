"use client";

import { useState } from "react";
import { useShipments } from "@/hooks/shipping/use-shipments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCcw,
  TrendingUp,
  Truck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useSyncTracking } from "@/hooks/shipping/use-shipments";
import { toast } from "sonner";

const ACTIVE_STATUSES = [
  "pickup_requested",
  "pickup_confirmed",
  "picked_up",
  "in_transit",
  "hub_received",
  "out_for_delivery",
];

export default function AdminTrackingDashboard() {
  const syncTracking = useSyncTracking();

  const { data: allData, isLoading } = useShipments({ limit: 50, page: 1 });
  const active = (allData?.data ?? []).filter((s: any) =>
    ACTIVE_STATUSES.includes(s.status)
  );

  const handleSyncAll = async () => {
    let synced = 0;
    for (const s of active.slice(0, 10)) {
      try {
        await syncTracking.mutateAsync(s.id);
        synced++;
      } catch (_) {}
    }
    toast.success(`Synced tracking for ${synced} shipments`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Live Tracking Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Monitor all in-transit shipments in real time
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSyncAll}
            disabled={syncTracking.isPending}
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-4 w-4" /> Sync All
          </Button>
          <Link href="/admin/shipping">
            <Button variant="outline" size="sm">
              ← Shipments
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: "Active Shipments",
            value: active.length,
            icon: Truck,
            color: "blue",
          },
          {
            label: "Out for Delivery",
            value: active.filter((s: any) => s.status === "out_for_delivery")
              .length,
            icon: TrendingUp,
            color: "purple",
          },
          {
            label: "In Transit",
            value: active.filter((s: any) => s.status === "in_transit").length,
            icon: CheckCircle2,
            color: "yellow",
          },
          {
            label: "Pickup Pending",
            value: active.filter((s: any) => s.status === "pickup_requested")
              .length,
            icon: AlertTriangle,
            color: "orange",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${color}-100 rounded-lg`}>
                  <Icon className={`h-5 w-5 text-${color}-600`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>In-Transit Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">
              Loading…
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment #</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Delivery</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No active shipments.
                    </TableCell>
                  </TableRow>
                )}
                {active.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm">
                      <Link
                        href={`/admin/shipping/${s.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {s.shipment_number}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {s.courier_provider_code ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {s.tracking_number ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {s.recipient_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {s.status?.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.estimated_delivery_date ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          syncTracking
                            .mutateAsync(s.id)
                            .then(() => toast.success("Synced"))
                            .catch((e) => toast.error(e.message))
                        }
                        disabled={syncTracking.isPending}
                      >
                        <RefreshCcw className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
