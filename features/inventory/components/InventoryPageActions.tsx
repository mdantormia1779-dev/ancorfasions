"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Plus, Download, ArrowLeftRight, Package } from "lucide-react";
import { toast } from "sonner";
import { exportToCsv } from "@/lib/utils/export";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addStockAction,
  transferStock,
  recordManualMovementAction,
} from "@/actions/inventory.actions";
import { Loader2 } from "lucide-react";

// ─── Add Stock ────────────────────────────────────────────────────────────────

const addStockSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  quantity: z.coerce
    .number()
    .int("Must be a whole number")
    .positive("Quantity must be positive"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

type AddStockForm = z.infer<typeof addStockSchema>;

function AddStockDialog({ inventory }: { inventory: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<AddStockForm>({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      variantId: "",
      warehouseId: "",
      quantity: 1,
      reason: "RESTOCK",
      notes: "",
    },
  });

  const onSubmit = async (values: AddStockForm) => {
    setLoading(true);
    const res = await addStockAction(values);
    setLoading(false);
    if (res.error) {
      toast.error("Failed to add stock", { description: res.error });
    } else {
      toast.success("Stock added successfully");
      setOpen(false);
      form.reset();
      router.refresh();
    }
  };

  // Build unique warehouse list from inventory prop
  const warehouses = Array.from(
    new Map(
      inventory
        .filter((i) => i.warehouses)
        .map((i) => [i.warehouse_id, { id: i.warehouse_id, name: i.warehouses?.name }])
    ).values()
  );

  const variants = Array.from(
    new Map(
      inventory
        .filter((i) => i.variants)
        .map((i) => [i.variant_id, { id: i.variant_id, name: `${i.variants?.sku} — ${i.variants?.name}` }])
    ).values()
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add Stock
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
            <DialogDescription>
              Increase inventory quantity for a product variant in a warehouse.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {variants.length > 0 ? (
                <FormField
                  control={form.control}
                  name="variantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Variant</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select variant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {variants.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="variantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variant ID</FormLabel>
                      <FormControl>
                        <Input placeholder="uuid-of-variant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {warehouses.length > 0 ? (
                <FormField
                  control={form.control}
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses.map((w) => (
                            <SelectItem key={w.id} value={w.id}>
                              {w.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse ID</FormLabel>
                      <FormControl>
                        <Input placeholder="uuid-of-warehouse" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity to Add</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="RESTOCK">Restock</SelectItem>
                        <SelectItem value="PURCHASE_RECEIPT">Purchase Receipt</SelectItem>
                        <SelectItem value="RETURN">Customer Return</SelectItem>
                        <SelectItem value="CORRECTION">Inventory Correction</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional details about this stock addition..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Stock
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Transfer Stock ───────────────────────────────────────────────────────────

const transferSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  fromWarehouseId: z.string().min(1, "Source warehouse is required"),
  toWarehouseId: z.string().min(1, "Destination warehouse is required"),
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
}).refine((d) => d.fromWarehouseId !== d.toWarehouseId, {
  message: "Source and destination warehouses must be different",
  path: ["toWarehouseId"],
});

type TransferForm = z.infer<typeof transferSchema>;

function TransferStockDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      variantId: "",
      fromWarehouseId: "",
      toWarehouseId: "",
      quantity: 1,
      reason: "TRANSFER",
      notes: "",
    },
  });

  const onSubmit = async (values: TransferForm) => {
    setLoading(true);
    const res = await transferStock(
      values.variantId,
      values.fromWarehouseId,
      values.toWarehouseId,
      values.quantity,
      values.reason,
      values.notes
    );
    setLoading(false);
    if (res.error) {
      toast.error("Transfer failed", { description: res.error });
    } else {
      toast.success("Stock transferred successfully");
      setOpen(false);
      form.reset();
      router.refresh();
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <ArrowLeftRight className="mr-2 h-4 w-4" /> Transfer
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Transfer Stock</DialogTitle>
            <DialogDescription>
              Move inventory between warehouses. Enter the variant and warehouse IDs.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="variantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant ID</FormLabel>
                    <FormControl>
                      <Input placeholder="uuid-of-variant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fromWarehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Warehouse ID</FormLabel>
                      <FormControl>
                        <Input placeholder="source uuid" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toWarehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Warehouse ID</FormLabel>
                      <FormControl>
                        <Input placeholder="destination uuid" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TRANSFER">Internal Transfer</SelectItem>
                        <SelectItem value="REBALANCE">Stock Rebalancing</SelectItem>
                        <SelectItem value="FULFILLMENT_PREP">Fulfillment Preparation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Transfer Stock
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Record Movement ──────────────────────────────────────────────────────────

const movementSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  warehouseId: z.string().min(1, "Warehouse ID is required"),
  movementType: z.enum(["RECEIVE", "ADJUST", "DAMAGE", "RETURN"]),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

type MovementForm = z.infer<typeof movementSchema>;

function RecordMovementDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<MovementForm>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      variantId: "",
      warehouseId: "",
      movementType: "ADJUST",
      quantity: 1,
      reason: "MANUAL_ADJUSTMENT",
      notes: "",
    },
  });

  const onSubmit = async (values: MovementForm) => {
    setLoading(true);
    const res = await recordManualMovementAction(values);
    setLoading(false);
    if (res.error) {
      toast.error("Failed to record movement", { description: res.error });
    } else {
      toast.success("Movement recorded successfully");
      setOpen(false);
      form.reset();
      router.refresh();
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Package className="mr-2 h-4 w-4" /> Record Movement
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Record Stock Movement</DialogTitle>
            <DialogDescription>
              Manually record a stock change (damage, return, adjustment, receipt).
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="variantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant ID</FormLabel>
                    <FormControl>
                      <Input placeholder="uuid-of-variant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse ID</FormLabel>
                    <FormControl>
                      <Input placeholder="uuid-of-warehouse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="movementType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Movement Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RECEIVE">Receive</SelectItem>
                          <SelectItem value="ADJUST">Adjust</SelectItem>
                          <SelectItem value="DAMAGE">Damage</SelectItem>
                          <SelectItem value="RETURN">Return</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason Code</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MANUAL_ADJUSTMENT">Manual Adjustment</SelectItem>
                        <SelectItem value="DAMAGE">Damage Write-off</SelectItem>
                        <SelectItem value="RETURN">Customer Return</SelectItem>
                        <SelectItem value="CYCLE_COUNT">Cycle Count Correction</SelectItem>
                        <SelectItem value="THEFT">Theft / Shrinkage</SelectItem>
                        <SelectItem value="SUPPLIER_RETURN">Supplier Return</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Record Movement
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export function StockControlActions({ inventory = [] }: { inventory: any[] }) {
  const handleExport = () => {
    if (!inventory || inventory.length === 0) {
      toast.error("No inventory data to export.");
      return;
    }
    const exportData = inventory.map((item) => ({
      SKU: item.variants?.sku,
      Name: item.variants?.name,
      Warehouse: item.warehouses?.name,
      Available: item.quantity_available,
      Reserved: item.quantity_reserved,
      Incoming: item.quantity_incoming,
    }));
    exportToCsv(
      `inventory_export_${new Date().toISOString().split("T")[0]}.csv`,
      exportData
    );
    toast.success("Inventory data exported successfully.");
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" /> Export
      </Button>
      <AddStockDialog inventory={inventory} />
    </div>
  );
}

export function StockTransferActions() {
  return <TransferStockDialog />;
}

export function StockMovementActions() {
  return <RecordMovementDialog />;
}
