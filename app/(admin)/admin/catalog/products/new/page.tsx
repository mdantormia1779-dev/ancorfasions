"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, Save, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateProductSchema, CreateProductInput } from "@/types/catalog.types";
import { createProductAction } from "@/app/actions/catalog/product.actions";
import {
  generateProductDescriptionAction,
  generateSeoMetadataAction,
} from "@/app/actions/catalog/ai.actions";
import { useToast } from "@/hooks/use-toast";

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      name: "",
      slug: "",
      basePrice: 0,
      status: "DRAFT",
      isFeatured: false,
    },
  });

  const onSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);
    const result = await createProductAction(data);
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: "Product created successfully" });
      router.push("/admin/catalog/products");
    } else {
      toast({
        title: "Failed to create product",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleGenerateDescription = async () => {
    const name = form.getValues("name");
    if (!name) {
      toast({
        title: "Product name required",
        description: "Please enter a product name first.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingDesc(true);
    const result = await generateProductDescriptionAction(name, {
      /* Pass real attributes here if implemented */
    });
    setIsGeneratingDesc(false);

    if (result.success) {
      form.setValue("description", result.data);
      toast({ title: "Description generated" });
    } else {
      toast({
        title: "Generation failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleGenerateSeo = async () => {
    const name = form.getValues("name");
    const desc = form.getValues("description");
    if (!name || !desc) {
      toast({
        title: "Name and description required",
        description: "Please enter name and description first.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingSeo(true);
    const result = await generateSeoMetadataAction(name, desc);
    setIsGeneratingSeo(false);

    if (result.success && result.data) {
      const seoData = result.data as any;
      form.setValue("seo.metaTitle", seoData.metaTitle);
      form.setValue("seo.metaDescription", seoData.metaDescription);
      // Keywords could be saved to tags or a specific seo.keywords field
      toast({ title: "SEO generated" });
    } else {
      toast({
        title: "Generation failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Create Product</h2>
        <div className="flex space-x-2">
          <Link href="/admin/catalog/products">
            <Button variant="outline">
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </Link>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" /> Save Product
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-8 md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
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
                            placeholder="Premium Cotton T-Shirt"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              const name = e.target.value;
                              const slug = name.toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
                              form.setValue("slug", slug, { shouldValidate: true, shouldDirty: true });
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="premium-cotton-t-shirt"
                            {...field}
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
                        <div className="flex items-center justify-between">
                          <FormLabel>Description</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleGenerateDescription}
                            disabled={isGeneratingDesc}
                          >
                            <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                            {isGeneratingDesc ? "Generating..." : "AI Generate"}
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea
                            className="min-h-[200px]"
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

              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Inventory (Base)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 space-y-4">
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
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base SKU</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="TSHIRT-001"
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

              <Card>
                <CardHeader>
                  <CardTitle>SEO & Metadata</CardTitle>
                  <CardDescription>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSeo}
                      disabled={isGeneratingSeo}
                    >
                      <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                      {isGeneratingSeo
                        ? "Generating SEO..."
                        : "AI Generate SEO"}
                    </Button>
                  </CardDescription>
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
                            placeholder="Max 60 chars"
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
                            placeholder="Max 160 chars"
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

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category ID</FormLabel>
                        <FormControl>
                          <Input placeholder="UUID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Select a category for this product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="UUID"
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="ACTIVE">Active</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        </FormControl>
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
    </div>
  );
}
