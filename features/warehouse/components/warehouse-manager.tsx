"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Warehouse, WarehouseZone, WarehouseBin } from "@/types/inventory.types";
import { toast } from "sonner";
import { 
  updateWarehouseAction, 
  createZoneAction, 
  deleteZoneAction,
  createBinAction,
  deleteBinAction
} from "@/app/actions/manager/warehouse.actions";
import { Trash2, Plus } from "lucide-react";

export function WarehouseManager({
  warehouse,
  zones,
  bins,
}: {
  warehouse: Warehouse;
  zones: WarehouseZone[];
  bins: WarehouseBin[];
}) {
  const [loading, setLoading] = useState(false);

  // General Update
  async function handleUpdateWarehouse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await updateWarehouseAction(warehouse.id, {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
    });
    
    setLoading(false);
    if (res.success) toast.success("Warehouse updated");
    else toast.error(res.error || "Failed to update warehouse");
  }

  // Zones Update
  async function handleAddZone(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    
    const res = await createZoneAction({
      warehouse_id: warehouse.id,
      name,
      type: "STORAGE",
      is_active: true
    });
    
    if (res.success) {
      toast.success("Zone added");
      (e.target as HTMLFormElement).reset();
    } else toast.error(res.error || "Failed to add zone");
  }

  async function handleDeleteZone(id: string) {
    if (!confirm("Are you sure?")) return;
    const res = await deleteZoneAction(id, warehouse.id);
    if (res.success) toast.success("Zone deleted");
    else toast.error(res.error || "Failed to delete zone");
  }

  // Bins Update
  async function handleAddBin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const res = await createBinAction({
      zone_id: formData.get("zone_id") as string,
      code: formData.get("code") as string,
      barcode: formData.get("code") as string, // Default barcode to code
      capacity_volume: 0,
      capacity_weight: 0,
    }, warehouse.id);
    
    if (res.success) {
      toast.success("Bin added");
      (e.target as HTMLFormElement).reset();
    } else toast.error(res.error || "Failed to add bin");
  }

  async function handleDeleteBin(id: string) {
    if (!confirm("Are you sure?")) return;
    const res = await deleteBinAction(id, warehouse.id);
    if (res.success) toast.success("Bin deleted");
    else toast.error(res.error || "Failed to delete bin");
  }

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="zones">Zones</TabsTrigger>
        <TabsTrigger value="bins">Bins</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Details</CardTitle>
            <CardDescription>Update the basic information of this warehouse.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateWarehouse} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="name">Warehouse Name</Label>
                <Input id="name" name="name" defaultValue={warehouse.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Warehouse Type</Label>
                <Input id="type" name="type" defaultValue={warehouse.type} required />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="zones">
        <Card>
          <CardHeader>
            <CardTitle>Zones</CardTitle>
            <CardDescription>Zones represent distinct areas in a warehouse (e.g. Aisle A, Cold Storage).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {zones.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <h4 className="font-medium">{zone.name}</h4>
                    <p className="text-sm text-muted-foreground">{zone.type}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteZone(zone.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {zones.length === 0 && <p className="text-muted-foreground">No zones configured yet.</p>}
            </div>

            <form onSubmit={handleAddZone} className="flex items-end gap-4 border-t pt-6">
              <div className="space-y-2 flex-1 max-w-xs">
                <Label htmlFor="zone_name">New Zone Name</Label>
                <Input id="zone_name" name="name" placeholder="e.g. Aisle A" required />
              </div>
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" /> Add Zone
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="bins">
        <Card>
          <CardHeader>
            <CardTitle>Bins</CardTitle>
            <CardDescription>Bins represent specific shelf locations within a zone.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {bins.map((bin) => {
                const zone = zones.find(z => z.id === bin.zone_id);
                return (
                  <div key={bin.id} className="flex flex-col p-4 border rounded-md relative">
                    <h4 className="font-medium">{bin.code}</h4>
                    <p className="text-sm text-muted-foreground">Zone: {zone?.name || "Unknown"}</p>
                    <Button variant="ghost" size="icon" className="text-destructive absolute top-2 right-2" onClick={() => handleDeleteBin(bin.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
              {bins.length === 0 && <p className="text-muted-foreground">No bins configured yet.</p>}
            </div>

            <form onSubmit={handleAddBin} className="flex items-end gap-4 border-t pt-6">
              <div className="space-y-2 flex-1 max-w-xs">
                <Label htmlFor="zone_id">Select Zone</Label>
                <select name="zone_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
                  <option value="">Select a zone...</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 flex-1 max-w-xs">
                <Label htmlFor="bin_code">Bin Code</Label>
                <Input id="bin_code" name="code" placeholder="e.g. A-12-3" required />
              </div>
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" /> Add Bin
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
