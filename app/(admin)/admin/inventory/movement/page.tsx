import { Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StockMovementRepository } from "@/lib/repositories/inventory/stock-movement.repository";

export const metadata = {
  title: "Stock Movement | Inventory | Anchor Fashion Enterprise",
};

const getReasonBadge = (reason: string) => {
  switch (reason?.toUpperCase()) {
    case "SALE":
      return <Badge variant="secondary">SALE</Badge>;
    case "RESTOCK":
      return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">RESTOCK</Badge>;
    case "RETURN":
      return <Badge variant="outline" className="text-amber-600 border-amber-600">RETURN</Badge>;
    case "DAMAGE":
      return <Badge variant="destructive">DAMAGE</Badge>;
    default:
      return <Badge variant="outline">{reason}</Badge>;
  }
};

export default async function AdminStockMovementPage() {
  const movements = await StockMovementRepository.getMovements();

  return (
    <div className="flex flex-col gap-6 p-8 pt-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Movement</h1>
          <p className="text-muted-foreground">
            Track inventory additions, deductions, and adjustments.
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Record Movement
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search variant ID..."
            className="pl-8 bg-card"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Movement ID</TableHead>
              <TableHead>Variant ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead className="text-right">Qty Change</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p>No stock movements recorded yet.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              movements.map((movement: any) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium text-xs max-w-[100px] truncate">{movement.id}</TableCell>
                  <TableCell className="text-xs max-w-[100px] truncate">{movement.variant_id}</TableCell>
                  <TableCell className="text-xs max-w-[100px] truncate">{movement.user_id || "SYSTEM"}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={movement.quantity_change > 0 ? "text-emerald-600" : "text-red-600"}>
                      {movement.quantity_change > 0 ? "+" : ""}{movement.quantity_change}
                    </span>
                  </TableCell>
                  <TableCell>{getReasonBadge(movement.reason)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(movement.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
