"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateProductSchema, Product } from "@/types/catalog.types";
import { createAdminProductAction, updateAdminProductAction } from "@/lib/actions/admin/products.actions";

type ProductFormValues = z.infer<typeof CreateProductSchema>;

interface ProductFormProps {
  initialData?: Product;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: Partial<ProductFormValues> = {
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    shortDescription: initialData?.shortDescription || "",
    description: initialData?.description || "",
    basePrice: initialData?.basePrice || 0,
    sku: initialData?.sku || "",
    barcode: initialData?.barcode || "",
    status: initialData?.status || "DRAFT",
    categoryId: initialData?.categoryId || "00000000-0000-0000-0000-000000000000", // Need a real ID
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    try {
      if (initialData) {
        const res = await updateAdminProductAction({ id: initialData.id, data });
        if (res.success) {
          toast.success("Product updated successfully");
          router.push("/admin/products");
        } else {
          toast.error(res.error || "Failed to update product");
        }
      } else {
        const res = await createAdminProductAction(data);
        if (res.success) {
          toast.success("Product created successfully");
          router.push("/admin/products");
        } else {
          toast.error(res.error || "Failed to create product");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {initialData ? "Edit Product" : "Create Product"}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" type="button" onClick={() => router.push("/admin/products")} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info Column */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">General Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Navy Blue Silk Tie" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="navy-blue-silk-tie" {...field} />
                        </FormControl>
                        <FormDescription>The URL friendly name</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="TIE-NVY-SLK" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="A brief summary for cards and listings..." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Status & Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category ID</FormLabel>
                      <FormControl>
                        <Input placeholder="UUID" {...field} />
                      </FormControl>
                      <FormDescription>Temporarily manual until category select is built</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

      </form>
    </Form>
  );
}
