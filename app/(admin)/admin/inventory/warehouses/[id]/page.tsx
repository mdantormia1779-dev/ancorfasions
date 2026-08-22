import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export const metadata: Metadata = {
  title: "Warehouse Details | Anchor Fashion",
};

export default async function WarehouseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: warehouse, error } = await getWarehouseById((await params).id);

  if (error || !warehouse) {
    notFound();
  }

  const { data: zones } = await getWarehouseZones(warehouse.id);

  // Calculate total capacity across all bins in all zones
  let totalVolume = 0;
  let totalZones = zones?.length || 0;
  let totalBins = 0;

  const zonesWithBins = await Promise.all(
    (zones || []).map(async (zone) => {
      const { data: bins } = await getZoneBins(zone.id);
      totalBins += bins?.length || 0;
      bins?.forEach((bin) => {
        totalVolume += bin.capacity_volume || 0;
      });
      return { ...zone, bins: bins || [] };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{warehouse.name}</h2>
        <p className="text-muted-foreground">Warehouse Details and Capacity</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {warehouse.is_active ? (
                <Badge className="bg-green-500">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehouse.type}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Capacity (Vol)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalVolume.toFixed(2)} m³
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Zones / Bins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalZones} / {totalBins}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zones and Storage Bins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {zonesWithBins.map((zone) => (
              <div key={zone.id} className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-semibold">{zone.name}</h3>
                  <Badge variant="outline">{zone.type}</Badge>
                </div>

                {zone.bins.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bin Code</TableHead>
                        <TableHead>Barcode</TableHead>
                        <TableHead>Volume (m³)</TableHead>
                        <TableHead>Max Weight (kg)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zone.bins.map((bin) => (
                        <TableRow key={bin.id}>
                          <TableCell className="font-medium">
                            {bin.code}
                          </TableCell>
                          <TableCell>{bin.barcode || "-"}</TableCell>
                          <TableCell>{bin.capacity_volume || "-"}</TableCell>
                          <TableCell>{bin.capacity_weight || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="py-2 text-sm text-muted-foreground">
                    No bins configured in this zone.
                  </p>
                )}
              </div>
            ))}
            {zonesWithBins.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No storage zones configured for this warehouse.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
