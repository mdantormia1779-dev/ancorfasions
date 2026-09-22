"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  promotionSchema,
  PromotionFormValues,
} from "@/validators/marketing.schema";
import { PromotionRecord } from "@/lib/repositories/marketing/promotion.repository";
import {
  createPromotionAction,
  updatePromotionAction,
} from "@/actions/marketing.actions";

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  initialData?: PromotionRecord | null;
  onSuccess?: (promo: PromotionRecord) => void;
}

export function PromotionDialog({
  open,
  onOpenChange,
  mode = "create",
  initialData,
  onSuccess,
}: PromotionDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: "",
      discount_percentage: 10,
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      is_active: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        form.reset({
          name: initialData.name,
          discount_percentage: initialData.discount_percentage,
          start_date: new Date(initialData.start_date)
            .toISOString()
            .split("T")[0],
          end_date: new Date(initialData.end_date).toISOString().split("T")[0],
          is_active: initialData.is_active,
        });
      } else {
        form.reset({
          name: "",
          discount_percentage: 10,
          start_date: new Date().toISOString().split("T")[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          is_active: true,
        });
      }
    }
  }, [open, mode, initialData, form]);

  const onSubmit = async (values: PromotionFormValues) => {
    setSubmitting(true);
    try {
      if (mode === "edit" && initialData?.id) {
        const res = await updatePromotionAction(initialData.id, values);
        if (!res.success) {
          toast.error(res.error || "Failed to update promotion");
          return;
        }
        toast.success(`Promotion "${values.name}" updated successfully`);
        if (res.data) onSuccess?.(res.data);
      } else {
        const res = await createPromotionAction(values);
        if (!res.success) {
          toast.error(res.error || "Failed to create promotion");
          return;
        }
        toast.success(`Promotion "${values.name}" created successfully`);
        if (res.data) onSuccess?.(res.data);
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {mode === "edit" ? "Edit Promotion" : "Create New Promotion"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modify campaign dates, discount tier, or activation status."
              : "Set up a storewide or category promotional sales campaign with automatic discount application."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Promotion Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Promotion Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Eid Festive Mega Sale 2026"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discount Percentage */}
            <FormField
              control={form.control}
              name="discount_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Discount Percentage (%) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      placeholder="20"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Customer orders qualifying during this period will receive this discount.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates: Start and End */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Start Date <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      End Date <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Active Status Toggle */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">
                      Enable Promotion
                    </FormLabel>
                    <div className="text-xs text-muted-foreground">
                      When enabled, discounts apply automatically during valid dates.
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : mode === "edit" ? (
                  "Save Changes"
                ) : (
                  "Create Promotion"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
