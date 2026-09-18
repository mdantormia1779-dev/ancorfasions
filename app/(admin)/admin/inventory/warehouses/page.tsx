import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllWarehouses } from "@/actions/warehouse.actions";
import Link from "next/link";
import {
  AddWarehouseButton,
  ManageWarehouseSettingsButton,
} from "@/features/warehouse/components/WarehousePageActions";

export const metadata: Metadata = {
  title: "Warehouse Management | Anchor Fashion",
};

export default async function WarehousesPage() {
  const { data: warehouses } = await getAllWarehouses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Warehouses</h2>
          <p className="text-muted-foreground">
            Manage physical locations and zones.
          </p>
        </div>
        <AddWarehouseButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warehouse Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses?.map((wh) => (
                <TableRow key={wh.id}>
                  <TableCell className="font-mono text-xs font-semibold">{wh.code || "—"}</TableCell>
                  <TableCell className="font-medium">{wh.name}</TableCell>
                  <TableCell>{wh.type || "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        wh.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {wh.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ManageWarehouseSettingsButton
                        warehouseId={wh.id}
                        warehouseName={wh.name}
                        warehouseType={wh.type}
                        isActive={wh.is_active}
                      />
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/inventory/warehouses/${wh.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!warehouses || warehouses.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No warehouses found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
