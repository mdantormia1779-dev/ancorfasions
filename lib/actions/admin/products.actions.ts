"use server";

import { z } from "zod";
import { createAdminAction } from "../safe-action";
import { ProductRepository } from "@/lib/repositories/catalog/product.repository";
import { CreateProductSchema } from "@/types/catalog.types";
import { revalidatePath } from "next/cache";

// ============================================================================
// SCHEMAS
// ============================================================================

const GetAdminProductsSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  status: z.string().optional(),
});

const ProductIdSchema = z.object({
  id: z.string().uuid(),
});

const BulkUpdateStatusSchema = z.object({
  ids: z.array(z.string().uuid()),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
});

const BulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()),
});

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Fetch all products for the admin table with filtering/pagination.
 */
export const getAdminProductsAction = createAdminAction(
  GetAdminProductsSchema,
  async (input) => {
    return await ProductRepository.getProducts(input);
  }
);

/**
 * Fetch a single product by ID for the edit form.
 */
export const getAdminProductByIdAction = createAdminAction(
  ProductIdSchema,
  async ({ id }) => {
    return await ProductRepository.getProductById(id);
  }
);

/**
 * Create a new product.
 */
export const createAdminProductAction = createAdminAction(
  CreateProductSchema,
  async (input) => {
    const newProduct = await ProductRepository.createProduct(input);
    revalidatePath("/admin/products");
    revalidatePath("/(shop)", "layout"); // Bust cache on frontend
    return newProduct;
  }
);

/**
 * Update an existing product.
 */
export const updateAdminProductAction = createAdminAction(
  z.object({ id: z.string().uuid(), data: CreateProductSchema.partial() }),
  async ({ id, data }) => {
    const updatedProduct = await ProductRepository.updateProduct(id, data);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);
    revalidatePath("/(shop)", "layout");
    return updatedProduct;
  }
);

/**
 * Soft delete a product.
 */
export const deleteAdminProductAction = createAdminAction(
  ProductIdSchema,
  async ({ id }) => {
    await ProductRepository.deleteProduct(id);
    revalidatePath("/admin/products");
    revalidatePath("/(shop)", "layout");
    return { success: true };
  }
);

/**
 * Duplicate a product (Creates a copy).
 */
export const duplicateAdminProductAction = createAdminAction(
  ProductIdSchema,
  async ({ id }) => {
    const original = await ProductRepository.getProductById(id);
    if (!original) throw new Error("Product not found");

    const copyData = {
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${Date.now()}`,
      shortDescription: original.short_description || "",
      description: original.description || "",
      categoryId: original.category_id,
      brandId: original.brand_id || undefined,
      basePrice: original.base_price,
      sku: original.sku ? `${original.sku}-COPY` : undefined,
      status: "DRAFT" as const, // Always draft on copy
      // ... we could copy SEO and Media too, but keeping it simple for now
    };

    const newProduct = await ProductRepository.createProduct(copyData);
    revalidatePath("/admin/products");
    return newProduct;
  }
);

/**
 * Bulk publish or archive products.
 */
export const bulkUpdateProductStatusAction = createAdminAction(
  BulkUpdateStatusSchema,
  async ({ ids, status }) => {
    // Ideally ProductRepository should have a bulkUpdate method.
    // For now we do it sequentially.
    for (const id of ids) {
      await ProductRepository.updateProduct(id, { status });
    }
    revalidatePath("/admin/products");
    revalidatePath("/(shop)", "layout");
    return { success: true, count: ids.length };
  }
);

/**
 * Bulk delete products.
 */
export const bulkDeleteProductsAction = createAdminAction(
  BulkDeleteSchema,
  async ({ ids }) => {
    for (const id of ids) {
      await ProductRepository.deleteProduct(id);
    }
    revalidatePath("/admin/products");
    revalidatePath("/(shop)", "layout");
    return { success: true, count: ids.length };
  }
);
