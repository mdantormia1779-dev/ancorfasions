import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, Search, Map, Warehouse as WarehouseIcon } from "lucide-react";
import Link from "next/link";
import { getAllWarehouses } from "@/actions/warehouse.actions";
import { AddWarehouseButton, ManageWarehouseSettingsButton } from "@/features/warehouse/components/WarehousePageActions";

export const metadata: Metadata = {
  title: "Warehouse Management | Anchor Fashion Enterprise",
  description: "Enterprise Warehouse and Location Management",
};

export default async function WarehouseDashboard() {
  const { data: realWarehouses } = await getAllWarehouses();
  const warehouses = realWarehouses || [];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Warehouse Management
          </h1>
          <p className="text-muted-foreground">
            Manage distribution centers, capacity, and staff allocation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Map className="mr-2 h-4 w-4" /> View Map
          </Button>
          <AddWarehouseButton />
        </div>
      </div>

      {warehouses.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <WarehouseIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No Warehouses Found</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            You don't have any warehouses configured yet. Add a warehouse to start managing inventory locations and bins.
          </p>
          <AddWarehouseButton />
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((warehouse) => (
            <Card key={warehouse.id} className="flex flex-col">
              <CardHeader className="pb-4">
                <div className="mb-2 flex items-start justify-between">
                  <Badge variant="outline">{(warehouse as any).code || `WH-${warehouse.id.substring(0, 4).toUpperCase()}`}</Badge>
                  <Badge
                    variant={
                      warehouse.is_active ? "default" : "destructive"
                    }
                  >
                    {warehouse.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{warehouse.name}</CardTitle>
                <CardDescription className="mt-1 flex items-center">
                  <MapPin className="mr-1 h-3 w-3" /> {(warehouse as any).location || "Location not set"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{warehouse.type || "Standard"}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-muted-foreground">Active Orders</span>
                    <span className="font-medium text-blue-600">
                      --
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Capacity Utilization
                    </span>
                    <span className="font-medium">
                      0%
                    </span>
                  </div>
                  <Progress
                    value={0}
                    className="h-2"
                  />
                </div>

                <div className="mt-auto flex items-center border-t pt-4 text-sm">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="mr-1 text-muted-foreground">Manager:</span>
                  <span className="font-medium">Unassigned</span>
                  <span className="ml-auto text-muted-foreground">
                    0 Staff
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/admin/inventory/warehouses/${warehouse.id}`}
                    className="w-full"
                  >
                    <Button variant="secondary" className="w-full">
                      Manage Zones & Bins
                    </Button>
                  </Link>
                  <ManageWarehouseSettingsButton />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
