"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Package,
  Layers,
  User,
  Warehouse,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  generatePickListFromOrdersAction,
  assignPickerAction,
  updatePickListStatusAction,
} from "@/actions/admin/fulfillment.actions";
import { toast } from "sonner";

interface FulfillmentClientProps {
  initialPickLists: any[];
  allWarehouses: any[];
  pickers: any[];
}

export function FulfillmentClient({
  initialPickLists = [],
  allWarehouses = [],
  pickers = [],
}: FulfillmentClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create pick list dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Status transition loading
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const filteredLists = useMemo(() => {
    return initialPickLists.filter((list) => {
      const num = (list.pick_list_number || list.list_number || "").toLowerCase();
      const warehouse = (list.warehouses?.name || "").toLowerCase();
      const picker = (list.assignedToName || "").toLowerCase();
      const q = search.toLowerCase();

      const matchesSearch = !search || num.includes(q) || warehouse.includes(q) || picker.includes(q);
      const matchesStatus = statusFilter === "ALL" || list.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [initialPickLists, search, statusFilter]);

  const handleCreatePickList = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    const res = await generatePickListFromOrdersAction(selectedWarehouse || undefined);
    setCreateLoading(false);

    if (res.success) {
      toast.success("Pick list batch generated successfully");
      setIsCreateOpen(false);
      setSelectedWarehouse("");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to generate pick list");
    }
  };

  const handleStatusChange = async (
    listId: string,
    newStatus: "PENDING" | "ASSIGNED" | "PICKING" | "PARTIALLY_PICKED" | "COMPLETED" | "CANCELLED"
  ) => {
    setStatusLoading(listId);
    const res = await updatePickListStatusAction(listId, newStatus);
    setStatusLoading(null);

    if (res.success) {
      toast.success(`Pick list marked as ${newStatus}`);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update pick list status");
    }
  };

  const handleAssignPicker = async (listId: string, pickerId: string) => {
    setStatusLoading(listId);
    const res = await assignPickerAction(listId, pickerId);
    setStatusLoading(null);

    if (res.success) {
      toast.success("Picker assigned");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to assign picker");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      case "ASSIGNED":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Assigned</Badge>;
      case "PICKING":
        return <Badge variant="default" className="bg-amber-600 hover:bg-amber-700">Picking</Badge>;
      case "COMPLETED":
        return <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fulfillment Operations</h2>
          <p className="text-muted-foreground">
            Generate wave batches, assign warehouse pickers, and track order fulfillment.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Generate Pick List
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pick list number, warehouse, picker..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "ALL")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="PICKING">Picking</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {(search || statusFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Pick Lists Table */}
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>List Number</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Assigned Picker</TableHead>
              <TableHead>Items (Picked / Total)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLists.map((list) => {
              const listNumber = list.pick_list_number || list.list_number || "PL-000000";
              const warehouseName = list.warehouses?.name || "Warehouse";
              const itemsPicked = list.itemsPicked ?? list.picked_items ?? 0;
              const itemsTotal = list.itemsTotal ?? list.total_items ?? 1;

              return (
                <TableRow key={list.id}>
                  <TableCell className="font-mono font-semibold text-xs">
                    {listNumber}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1.5">
                      <Warehouse className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{warehouseName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {pickers.length > 0 && list.status !== "COMPLETED" && list.status !== "CANCELLED" ? (
                      <Select
                        value={list.assigned_picker_id || ""}
                        onValueChange={(val) => val && handleAssignPicker(list.id, val)}
                        disabled={statusLoading === list.id}
                      >
                        <SelectTrigger className="h-7 w-[150px] text-xs">
                          <SelectValue placeholder="Assign picker..." />
                        </SelectTrigger>
                        <SelectContent>
                          {pickers.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{list.assignedToName || "Unassigned"}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-semibold">
                    <span className={itemsPicked >= itemsTotal ? "text-emerald-600" : "text-foreground"}>
                      {itemsPicked} / {itemsTotal}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(list.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {list.created_at ? format(new Date(list.created_at), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {(list.status === "PENDING" || list.status === "ASSIGNED") && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={statusLoading === list.id}
                          onClick={() => handleStatusChange(list.id, "PICKING")}
                        >
                          <Play className="mr-1 h-3.5 w-3.5 text-blue-600" /> Start Picking
                        </Button>
                      )}

                      {list.status === "PICKING" && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={statusLoading === list.id}
                          onClick={() => handleStatusChange(list.id, "COMPLETED")}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Complete
                        </Button>
                      )}

                      {list.status !== "COMPLETED" && list.status !== "CANCELLED" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          disabled={statusLoading === list.id}
                          onClick={() => handleStatusChange(list.id, "CANCELLED")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredLists.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground/50" />
                    <p>No pick lists found.</p>
                    <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)}>
                      <Plus className="mr-1.5 h-4 w-4" /> Generate Wave Pick List
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Generate Pick List Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Generate Pick List
            </DialogTitle>
            <DialogDescription>
              Create a wave pick list batch from queued orders for warehouse fulfillment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePickList} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse">Fulfillment Warehouse</Label>
              <Select value={selectedWarehouse} onValueChange={(val) => setSelectedWarehouse(val || "")}>
                <SelectTrigger id="warehouse">
                  <SelectValue placeholder="Default active warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {allWarehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name} {wh.code ? `(${wh.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Wave Batching Automation</p>
              <p>
                The system will automatically identify pending orders and aggregate required product SKUs into an optimized picking path.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createLoading}>
                {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Batch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
