import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getWarehouseById,
  getWarehouseZones,
  getZoneBins,
} from "@/actions/warehouse.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Box, Layers } from "lucide-react";
import {
  AddZoneButton,
  AddBinButton,
  DeleteZoneButton,
  DeleteBinButton,
} from "@/features/warehouse/components/WarehouseZoneBinActions";

export const metadata: Metadata = {
  title: "Warehouse Details | Anchor Fashion",
};

export default async function WarehouseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  let warehouse: any = null;
  try {
    const res = await getWarehouseById(id);
    warehouse = res.data;
  } catch (e) {
    console.error("Error fetching warehouse by id:", e);
  }

  if (!warehouse) {
    notFound();
  }

  let zones: any[] = [];
  try {
    const zonesRes = await getWarehouseZones(warehouse.id);
    zones = zonesRes.data || [];
  } catch (e) {
    console.error("Error fetching warehouse zones:", e);
  }

  // Calculate total capacity across all bins in all zones
  let totalVolume = 0;
  let totalZones = zones.length;
  let totalBins = 0;

  let zonesWithBins: any[] = [];
  try {
    zonesWithBins = await Promise.all(
      zones.map(async (zone) => {
        try {
          const binsRes = await getZoneBins(zone.id);
          const bins = binsRes.data || [];
          totalBins += bins.length;
          bins.forEach((bin: any) => {
            totalVolume += Number(bin.capacity_volume) || 0;
          });
          return { ...zone, bins };
        } catch {
          return { ...zone, bins: [] };
        }
      })
    );
  } catch (e) {
    console.error("Error mapping warehouse zones with bins:", e);
    zonesWithBins = zones.map((z) => ({ ...z, bins: [] }));
  }


  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Top Bar / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/inventory/warehouses">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {warehouse.name}
              </h1>
              {warehouse.code && (
                <Badge variant="outline" className="font-mono text-xs uppercase">
                  {warehouse.code}
                </Badge>
              )}
              {warehouse.is_active ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Warehouse specifications, capacity, and zone architecture
            </p>
          </div>
        </div>

        <div>
          <AddZoneButton warehouseId={warehouse.id} />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Warehouse Type
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {warehouse.type || "STANDARD"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Total Capacity
            </CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {totalVolume.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">m³</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Storage Zones
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalZones}</div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Total Storage Bins
            </CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalBins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Zones & Bins Section */}
      <Card className="bg-card text-card-foreground">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg sm:text-xl">Zones and Storage Bins</CardTitle>
          <AddZoneButton warehouseId={warehouse.id} />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {zonesWithBins.map((zone) => (
              <div key={zone.id} className="space-y-3 rounded-lg border p-4 bg-muted/20">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base">{zone.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {zone.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ({zone.bins.length} {zone.bins.length === 1 ? "bin" : "bins"})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AddBinButton
                      zoneId={zone.id}
                      zoneName={zone.name}
                      warehouseId={warehouse.id}
                    />
                    <DeleteZoneButton
                      zoneId={zone.id}
                      zoneName={zone.name}
                      warehouseId={warehouse.id}
                    />
                  </div>
                </div>

                {zone.bins.length > 0 ? (
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[120px]">Bin Code</TableHead>
                          <TableHead className="min-w-[120px]">Barcode</TableHead>
                          <TableHead className="text-right min-w-[100px]">Volume (m³)</TableHead>
                          <TableHead className="text-right min-w-[100px]">Max Weight (kg)</TableHead>
                          <TableHead className="text-right w-[60px]">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {zone.bins.map((bin) => (
                          <TableRow key={bin.id}>
                            <TableCell className="font-medium font-mono text-xs">
                              {bin.code}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono">
                              {bin.barcode || "—"}
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {bin.capacity_volume ? `${bin.capacity_volume} m³` : "—"}
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {bin.capacity_weight ? `${bin.capacity_weight} kg` : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <DeleteBinButton
                                binId={bin.id}
                                binCode={bin.code}
                                warehouseId={warehouse.id}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="py-2 text-xs sm:text-sm text-muted-foreground">
                    No bins configured in this zone yet. Use &ldquo;Add Bin&rdquo; above to create one.
                  </p>
                )}
              </div>
            ))}
            {zonesWithBins.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
                <p>No storage zones configured for this warehouse location.</p>
                <AddZoneButton warehouseId={warehouse.id} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
