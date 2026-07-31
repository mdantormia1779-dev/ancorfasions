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
  title: "Inventory Audits | Anchor Fashion",
};

export default async function AuditsPage() {
  const supabase = await createClient();
  const { data: audits } = await supabase
    .from("inventory_audits")
    .select("*, warehouses(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Inventory Audits
          </h2>
          <p className="text-muted-foreground">
            Manage cycle counts and physical verification.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Schedule Audit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Scheduled</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Blind Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits?.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell>
                    {format(new Date(audit.created_at), "PP")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {audit.warehouses?.name || "N/A"}
                  </TableCell>
                  <TableCell>{audit.status}</TableCell>
                  <TableCell>{audit.blind_count ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!audits || audits.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No audits scheduled.
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
