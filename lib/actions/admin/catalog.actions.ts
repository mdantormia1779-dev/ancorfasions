"use server";

import { z } from "zod";
import { createAdminAction } from "../safe-action";
import { CategoryRepository } from "@/lib/repositories/catalog/category.repository";
import { BrandRepository } from "@/lib/repositories/catalog/brand.repository";
import { CollectionRepository } from "@/lib/repositories/catalog/collection.repository";
import { AttributeRepository } from "@/lib/repositories/catalog/attribute.repository";
import { ReviewRepository } from "@/lib/repositories/catalog/review.repository";
import { revalidatePath } from "next/cache";

// ============================================================================
// SCHEMAS
// ============================================================================

const IdSchema = z.object({ id: z.string().uuid() });

const CategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  parent_id: z.string().uuid().nullable().optional().or(z.literal("").transform(() => null)),
  icon_url: z.string().url().nullable().optional().or(z.literal("").transform(() => null)),
  is_active: z.boolean().optional().default(true),
  display_order: z.number().int().optional().default(0),
});

const BrandSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  logo_url: z.string().url().nullable().optional().or(z.literal("").transform(() => null)),
  is_active: z.boolean().optional().default(true),
});

const CollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  banner_url: z.string().url().nullable().optional().or(z.literal("").transform(() => null)),
  is_active: z.boolean().optional().default(true),
});

const AttributeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["TEXT", "COLOR", "SIZE", "NUMBER", "BOOLEAN"]),
});

const AttributeValueSchema = z.object({
  attributeId: z.string().uuid(),
  value: z.string().min(1, "Value is required").max(100),
});

const AttributeValueIdSchema = z.object({ valueId: z.string().uuid() });

// ============================================================================
// CATEGORY ACTIONS
// ============================================================================

export const createCategoryAction = createAdminAction(
  CategorySchema,
  async (input) => {
    const category = await CategoryRepository.createCategory(input);
    revalidatePath("/admin/catalog/categories");
    revalidatePath("/(shop)", "layout");
    return category;
  }
);

export const updateCategoryAction = createAdminAction(
  z.object({ id: z.string().uuid(), data: CategorySchema.partial() }),
  async ({ id, data }) => {
    const category = await CategoryRepository.updateCategory(id, data);
    revalidatePath("/admin/catalog/categories");
    revalidatePath("/(shop)", "layout");
    return category;
  }
);

export const deleteCategoryAction = createAdminAction(IdSchema, async ({ id }) => {
  await CategoryRepository.deleteCategory(id);
  revalidatePath("/admin/catalog/categories");
  revalidatePath("/(shop)", "layout");
  return { success: true };
});

// ============================================================================
// BRAND ACTIONS
// ============================================================================

export const createBrandAction = createAdminAction(BrandSchema, async (input) => {
  const brand = await BrandRepository.createBrand(input);
  revalidatePath("/admin/catalog/brands");
  revalidatePath("/(shop)", "layout");
  return brand;
});

export const updateBrandAction = createAdminAction(
  z.object({ id: z.string().uuid(), data: BrandSchema.partial() }),
  async ({ id, data }) => {
    const brand = await BrandRepository.updateBrand(id, data);
    revalidatePath("/admin/catalog/brands");
    revalidatePath("/(shop)", "layout");
    return brand;
  }
);

export const deleteBrandAction = createAdminAction(IdSchema, async ({ id }) => {
  await BrandRepository.deleteBrand(id);
  revalidatePath("/admin/catalog/brands");
  revalidatePath("/(shop)", "layout");
  return { success: true };
});

// ============================================================================
// COLLECTION ACTIONS
// ============================================================================

export const createCollectionAction = createAdminAction(
  CollectionSchema,
  async (input) => {
    const collection = await CollectionRepository.createCollection(input);
    revalidatePath("/admin/products/collections");
    revalidatePath("/(shop)", "layout");
    return collection;
  }
);

export const updateCollectionAction = createAdminAction(
  z.object({ id: z.string().uuid(), data: CollectionSchema.partial() }),
  async ({ id, data }) => {
    const collection = await CollectionRepository.updateCollection(id, data);
    revalidatePath("/admin/products/collections");
    revalidatePath("/(shop)", "layout");
    return collection;
  }
);

export const deleteCollectionAction = createAdminAction(
  IdSchema,
  async ({ id }) => {
    await CollectionRepository.deleteCollection(id);
    revalidatePath("/admin/products/collections");
    revalidatePath("/(shop)", "layout");
    return { success: true };
  }
);

// ============================================================================
// ATTRIBUTE ACTIONS
// ============================================================================

export const createAttributeAction = createAdminAction(
  AttributeSchema,
  async (input) => {
    const attribute = await AttributeRepository.createAttribute(input);
    revalidatePath("/admin/products/attributes");
    return attribute;
  }
);

export const updateAttributeAction = createAdminAction(
  z.object({ id: z.string().uuid(), data: AttributeSchema.partial() }),
  async ({ id, data }) => {
    const attribute = await AttributeRepository.updateAttribute(id, data);
    revalidatePath("/admin/products/attributes");
    return attribute;
  }
);

export const deleteAttributeAction = createAdminAction(
  IdSchema,
  async ({ id }) => {
    await AttributeRepository.deleteAttribute(id);
    revalidatePath("/admin/products/attributes");
    return { success: true };
  }
);

export const addAttributeValueAction = createAdminAction(
  AttributeValueSchema,
  async ({ attributeId, value }) => {
    await AttributeRepository.addAttributeValue(attributeId, value);
    revalidatePath("/admin/products/attributes");
    return { success: true };
  }
);

export const removeAttributeValueAction = createAdminAction(
  AttributeValueIdSchema,
  async ({ valueId }) => {
    await AttributeRepository.removeAttributeValue(valueId);
    revalidatePath("/admin/products/attributes");
    return { success: true };
  }
);

// ============================================================================
// REVIEW ACTIONS
// ============================================================================

export const approveReviewAction = createAdminAction(
  IdSchema,
  async ({ id }) => {
    await ReviewRepository.approveReview(id);
    revalidatePath("/admin/products/reviews");
    return { success: true };
  }
);

export const revokeReviewAction = createAdminAction(IdSchema, async ({ id }) => {
  await ReviewRepository.revokeReview(id);
  revalidatePath("/admin/products/reviews");
  return { success: true };
});

export const deleteReviewAction = createAdminAction(IdSchema, async ({ id }) => {
  await ReviewRepository.deleteReview(id);
  revalidatePath("/admin/products/reviews");
  return { success: true };
});
