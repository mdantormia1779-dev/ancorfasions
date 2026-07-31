"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { CreateProductSchema, Product } from "@/types/catalog.types";
import {
  createAdminProductAction,
  updateAdminProductAction,
  getCategoriesAction,
  getBrandsAction,
  getTagsAction,
} from "@/lib/actions/admin/products.actions";

type ProductFormValues = z.infer<typeof CreateProductSchema>;

interface ProductFormProps {
  initialData?: Product;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const [catsRes, brandsRes, tagsRes] = await Promise.all([
        getCategoriesAction({}),
        getBrandsAction({}),
        getTagsAction({}),
      ]);
      if (catsRes.success && catsRes.data) setCategories(catsRes.data);
      if (brandsRes.success && brandsRes.data) setBrands(brandsRes.data);
      if (tagsRes.success && tagsRes.data) setTags(tagsRes.data);
    }
    loadData();
  }, []);

  const defaultValues: Partial<ProductFormValues> = {
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    shortDescription: initialData?.shortDescription || "",
    description: initialData?.description || "",
    basePrice: initialData?.basePrice || 0,
    sku: initialData?.sku || "",
    barcode: initialData?.barcode || "",
    status: initialData?.status || "DRAFT",
    categoryId: initialData?.categoryId || "",
    brandId: initialData?.brandId || "",
    isFeatured: initialData?.isFeatured || false,
    variants: initialData?.variants || [],
    media: initialData?.media || [],
    seo: initialData?.seo || {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
    },
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues,
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const {
    fields: mediaFields,
    append: appendMedia,
    remove: removeMedia,
  } = useFieldArray({
    control: form.control,
    name: "media",
  });

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    try {
      if (initialData) {
        const res = await updateAdminProductAction({
          id: initialData.id,
          data,
        });
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
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/admin/products")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 text-white hover:bg-slate-800"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info Column */}
          <div className="space-y-6 md:col-span-2">
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
                        <Input
                          placeholder="E.g. Navy Blue Silk Tie"
                          {...field}
                        />
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
                          <Input
                            placeholder="TIE-NVY-SLK"
                            {...field}
                            value={field.value || ""}
                          />
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
                        <Textarea
                          placeholder="A brief summary for cards and listings..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[120px]"
                          placeholder="Detailed product description..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  Product Media (Images)
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendMedia({
                      url: "",
                      displayOrder: mediaFields.length,
                      isPrimary: mediaFields.length === 0,
                      mediaType: "IMAGE",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Image URL
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {mediaFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative flex items-end gap-4 rounded-md border p-4"
                  >
                    <FormField
                      control={form.control}
                      name={`media.${index}.url`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`media.${index}.altText`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Alt Text</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Front view of tie"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`media.${index}.isPrimary`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center justify-center pb-2">
                          <FormLabel>Primary?</FormLabel>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMedia(index)}
                      className="mb-0.5 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {mediaFields.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-500">
                    No media added yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Product Variants</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendVariant({ sku: "", isActive: true })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Variant
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {variantFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative grid grid-cols-2 items-end gap-4 rounded-md border p-4 md:grid-cols-4"
                  >
                    <FormField
                      control={form.control}
                      name={`variants.${index}.sku`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variant SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="SKU-RED-M" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.priceOverride`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price Override</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.salePrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-end pb-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        className="text-red-500"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                {variantFields.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-500">
                    No variants added yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  Search Engine Optimization (SEO)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="seo.metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SEO Title"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seo.metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="SEO Description"
                          {...field}
                          value={field.value || ""}
                        />
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
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Featured</FormLabel>
                        <FormDescription>Show on homepage</FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
