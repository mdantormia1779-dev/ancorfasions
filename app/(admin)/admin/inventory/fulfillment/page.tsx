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
  title: "Warehouse Fulfillment | Anchor Fashion",
};

export default async function FulfillmentPage() {
  const supabase = await createClient();
  const { data: pickLists } = await supabase
    .from("pick_lists")
    .select("*, warehouses(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Fulfillment Operations
          </h2>
          <p className="text-muted-foreground">
            Manage pick lists, packing, and dispatch.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Pick List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pick Lists</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>List Number</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total Items</TableHead>
                <TableHead>Picked</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pickLists?.map((list) => (
                <TableRow key={list.id}>
                  <TableCell className="font-medium">
                    {list.list_number}
                  </TableCell>
                  <TableCell>{list.warehouses?.name || "N/A"}</TableCell>
                  <TableCell>{list.pick_type}</TableCell>
                  <TableCell>{list.total_items}</TableCell>
                  <TableCell>{list.picked_items}</TableCell>
                  <TableCell>{list.status}</TableCell>
                  <TableCell>
                    {format(new Date(list.created_at), "PP")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Process
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!pickLists || pickLists.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No pick lists found.
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
