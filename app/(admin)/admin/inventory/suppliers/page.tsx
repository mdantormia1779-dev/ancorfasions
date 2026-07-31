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

export const metadata: Metadata = {
  title: "Suppliers | Anchor Fashion",
};

export default async function SuppliersPage() {
  const supabase = await createClient();
  const { data: suppliers } = await supabase
    .from("supplier_profiles")
    .select("*")
    .order("company_name", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
          <p className="text-muted-foreground">
            Manage supplier profiles and performance.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers?.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">
                    {supplier.company_name}
                  </TableCell>
                  <TableCell>{supplier.contact_person || "N/A"}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.phone || "N/A"}</TableCell>
                  <TableCell>{supplier.performance_score} / 5.0</TableCell>
                  <TableCell>{supplier.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!suppliers || suppliers.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No suppliers found.
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
