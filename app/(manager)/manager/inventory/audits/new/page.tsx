"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getWarehousesAction, getZonesByWarehouseAction } from "@/app/actions/manager/warehouse.actions";
import { createAuditAction } from "@/app/actions/manager/inventory.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Warehouse, WarehouseZone } from "@/types/inventory.types";

export default function ScheduleAuditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [zones, setZones] = useState<WarehouseZone[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");

  useEffect(() => {
    async function fetchWarehouses() {
      const res = await getWarehousesAction();
      if (res.success && res.data) setWarehouses(res.data);
    }
    fetchWarehouses();
  }, []);

  useEffect(() => {
    async function fetchZones() {
      if (!selectedWarehouseId) {
        setZones([]);
        return;
      }
      const res = await getZonesByWarehouseAction(selectedWarehouseId);
      if (res.success && res.data) setZones(res.data);
    }
    fetchZones();
  }, [selectedWarehouseId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const warehouse_id = formData.get("warehouse_id") as string;
    const zone_id = formData.get("zone_id") as string;
    const scheduled_date = formData.get("scheduled_date") as string;

    if (!warehouse_id) {
      toast.error("Please select a warehouse.");
      setLoading(false);
      return;
    }

    const res = await createAuditAction({
      warehouse_id,
      zone_id: zone_id || undefined,
      scheduled_date: scheduled_date || undefined,
      status: "PLANNED",
    });

    setLoading(false);

    if (res.success) {
      toast.success("Audit scheduled successfully");
      router.push("/manager/inventory/audits");
    } else {
      toast.error(res.error || "Failed to schedule audit");
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/manager/inventory/audits">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Audit</h1>
          <p className="text-muted-foreground">Plan a new inventory count.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse_id">Target Warehouse <span className="text-destructive">*</span></Label>
              <Select name="warehouse_id" required onValueChange={setSelectedWarehouseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse..." />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zone_id">Specific Zone (Optional)</Label>
              <Select name="zone_id" disabled={!selectedWarehouseId || zones.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="All Zones (or select specific zone)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Zones</SelectItem>
                  {zones.map(z => (
                    <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Select a zone to limit the scope of the count.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Scheduled Date</Label>
              <Input id="scheduled_date" name="scheduled_date" type="date" required />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/manager/inventory/audits">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Scheduling..." : "Schedule Audit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
