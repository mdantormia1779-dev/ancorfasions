"use client";

import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StockMovementActions } from "@/features/inventory/components/InventoryPageActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getReasonBadge = (reason: string) => {
  switch (reason?.toUpperCase()) {
    case "SALE":
      return <Badge variant="secondary">SALE</Badge>;
    case "RESTOCK":
      return (
        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
          RESTOCK
        </Badge>
      );
    case "RETURN":
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-600">
          RETURN
        </Badge>
      );
    case "DAMAGE":
      return <Badge variant="destructive">DAMAGE</Badge>;
    case "MANUAL_ADJUSTMENT":
    case "CYCLE_COUNT":
      return (
        <Badge variant="outline" className="text-slate-600">
          {reason?.replace(/_/g, " ")}
        </Badge>
      );
    default:
      return <Badge variant="outline">{reason || "—"}</Badge>;
  }
};

interface StockMovementClientProps {
  movements: any[];
}

export function StockMovementClient({ movements }: StockMovementClientProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        !search ||
        m.variant_id?.toLowerCase().includes(search.toLowerCase()) ||
        m.reason?.toLowerCase().includes(search.toLowerCase()) ||
        m.reason_code?.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "ALL" ||
        m.movement_type === typeFilter ||
        m.reason?.toUpperCase() === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [movements, search, typeFilter]);

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
          <StockMovementActions />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search variant, reason..."
            className="pl-8 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val ?? "ALL")}>
          <SelectTrigger className="w-40 bg-card">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="RECEIVE">Receive</SelectItem>
            <SelectItem value="ADJUST">Adjust</SelectItem>
            <SelectItem value="DAMAGE">Damage</SelectItem>
            <SelectItem value="RETURN">Return</SelectItem>
            <SelectItem value="SALE">Sale</SelectItem>
          </SelectContent>
        </Select>
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p>
                      {search || typeFilter !== "ALL"
                        ? "No movements match your filters."
                        : "No stock movements recorded yet."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((movement: any) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium text-xs max-w-[100px] truncate">
                    {movement.id}
                  </TableCell>
                  <TableCell className="text-xs max-w-[100px] truncate">
                    {movement.variant_id}
                  </TableCell>
                  <TableCell className="text-xs max-w-[100px] truncate">
                    {movement.user_id || "SYSTEM"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span
                      className={
                        movement.quantity_change > 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }
                    >
                      {movement.quantity_change > 0 ? "+" : ""}
                      {movement.quantity_change}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getReasonBadge(movement.reason || movement.reason_code)}
                  </TableCell>
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
