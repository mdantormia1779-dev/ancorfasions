import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "Purchase Orders | Anchor Fashion",
};

export default async function PurchasesPage() {
  const supabase = await createClient();
  const { data: pos } = await supabase
    .from("procurement_orders")
    .select("*, supplier_profiles(company_name), warehouses(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
          <p className="text-muted-foreground">
            Manage procurement and receiving.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create PO
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pos?.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.po_number}</TableCell>
                  <TableCell>
                    {po.supplier_profiles?.company_name || "N/A"}
                  </TableCell>
                  <TableCell>{po.warehouses?.name || "N/A"}</TableCell>
                  <TableCell>
                    {po.expected_delivery_date
                      ? format(new Date(po.expected_delivery_date), "PP")
                      : "TBD"}
                  </TableCell>
                  <TableCell>
                    {po.currency} {po.total_amount?.toLocaleString()}
                  </TableCell>
                  <TableCell>{po.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!pos || pos.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No purchase orders found.
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
