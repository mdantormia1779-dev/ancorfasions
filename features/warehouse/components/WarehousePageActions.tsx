"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createWarehouse, updateWarehouse } from "@/actions/warehouse.actions";

// ─── Add Warehouse Dialog ─────────────────────────────────────────────────────

const warehouseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be 20 characters or less")
    .regex(/^[A-Za-z0-9_-]+$/, "Code must contain only letters, numbers, hyphens, and underscores"),
  type: z.string().min(1, "Type is required"),
  is_active: z.boolean(),
});

type WarehouseForm = z.infer<typeof warehouseSchema>;

export function AddWarehouseButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<WarehouseForm>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: { name: "", code: "", type: "STANDARD", is_active: true },
  });

  const onSubmit = async (values: WarehouseForm) => {
    setLoading(true);
    const res = await createWarehouse({
      ...values,
      code: values.code.trim().toUpperCase(),
    });
    setLoading(false);
    if (res.error) {
      toast.error("Failed to create warehouse", { description: res.error });
    } else {
      toast.success(`Warehouse "${values.name}" created`);
      setOpen(false);
      form.reset();
      router.refresh();
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add Warehouse
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Add New Warehouse</DialogTitle>
            <DialogDescription>
              Create a new physical warehouse or fulfillment center.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Dhaka Central Warehouse"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!form.getValues("code")) {
                            const generated = e.target.value
                              .replace(/[^A-Za-z0-9]/g, "")
                              .slice(0, 6)
                              .toUpperCase();
                            form.setValue("code", generated ? `WH-${generated}` : "");
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. WH-DHK-01"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="FULFILLMENT_CENTER">Fulfillment Center</SelectItem>
                        <SelectItem value="DROPSHIP">Dropship</SelectItem>
                        <SelectItem value="VIRTUAL">Virtual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel className="mb-0">Active</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Warehouse
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Manage Warehouse Settings Sheet ─────────────────────────────────────────

interface ManageWarehouseSettingsButtonProps {
  warehouseId?: string;
  warehouseName?: string;
  warehouseType?: string;
  isActive?: boolean;
}

const settingsSchema = z.object({
  name: z.string().min(2, "Name is required"),
  type: z.string().min(1, "Type is required"),
  is_active: z.boolean(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export function ManageWarehouseSettingsButton({
  warehouseId,
  warehouseName = "",
  warehouseType = "STANDARD",
  isActive = true,
}: ManageWarehouseSettingsButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { name: warehouseName, type: warehouseType, is_active: isActive },
  });

  const onSubmit = async (values: SettingsForm) => {
    if (!warehouseId) {
      toast.error("No warehouse selected");
      return;
    }
    setLoading(true);
    const res = await updateWarehouse(warehouseId, values);
    setLoading(false);
    if (res.error) {
      toast.error("Failed to update warehouse", { description: res.error });
    } else {
      toast.success("Warehouse settings saved");
      setOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          form.reset({ name: warehouseName, type: warehouseType, is_active: isActive });
          setOpen(true);
        }}
        title="Warehouse Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Warehouse Settings</SheetTitle>
            <SheetDescription>
              Update configuration for this warehouse location.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="FULFILLMENT_CENTER">Fulfillment Center</SelectItem>
                        <SelectItem value="DROPSHIP">Dropship</SelectItem>
                        <SelectItem value="VIRTUAL">Virtual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel className="mb-0">Active</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <SheetFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Settings
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  );
}
