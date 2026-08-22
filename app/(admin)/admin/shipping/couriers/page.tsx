import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Check, X } from "lucide-react";
import { getCouriersAction } from "@/app/actions/manager/shipping.actions";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Courier Providers | Admin Dashboard",
};

export default async function CouriersPage() {
  const { data: couriers } = await getCouriersAction();

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courier Providers</h1>
          <p className="mt-1 text-muted-foreground">
            Manage delivery partners and courier API configurations.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Couriers</CardTitle>
          <CardDescription>
            These are the delivery partners available for order fulfillment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>COD Supported</TableHead>
                <TableHead>Max Weight (kg)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!couriers || couriers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground/50" />
                      <p>No courier providers found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                couriers.map((courier) => (
                  <TableRow key={courier.id}>
                    <TableCell>
                      <div className="font-medium">{courier.display_name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{courier.code}</div>
                    </TableCell>
                    <TableCell>{courier.priority}</TableCell>
                    <TableCell>
                      {courier.is_cod_supported ? (
                        <Badge variant="outline" className="text-green-600 bg-green-50"><Check className="h-3 w-3 mr-1"/> Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 bg-red-50"><X className="h-3 w-3 mr-1"/> No</Badge>
                      )}
                    </TableCell>
                    <TableCell>{courier.max_weight_kg || "No limit"}</TableCell>
                    <TableCell>
                      <Badge variant={courier.is_active ? "default" : "secondary"}>
                        {courier.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
