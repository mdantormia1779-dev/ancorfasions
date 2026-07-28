import { z } from 'zod';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================
export const ProductStatus = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);
export const Gender = z.enum(['MEN', 'WOMEN', 'UNISEX', 'KIDS']);
export const MediaType = z.enum(['IMAGE', 'VIDEO', '360_VIEW']);

// ============================================================================
// BASE SCHEMAS
// ============================================================================
export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ProductSeoSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  canonicalUrl: z.string().url().max(1024).optional().nullable(),
  ogTitle: z.string().max(255).optional().nullable(),
  ogDescription: z.string().optional().nullable(),
  ogImageUrl: z.string().url().max(1024).optional().nullable(),
  twitterCardType: z.string().max(50).optional().nullable(),
  structuredData: z.any().optional().nullable(), // JSON-LD
  keywords: z.array(z.string()).optional().nullable(),
});

export const ProductVariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sku: z.string().max(100),
  barcode: z.string().max(100).optional().nullable(),
  priceOverride: z.number().min(0).optional().nullable(),
  salePrice: z.number().min(0).optional().nullable(),
  weight: z.number().min(0).optional().nullable(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional().nullable(),
  isActive: z.boolean().default(true),
  attributes: z.record(z.string()).optional(), // { Color: 'Red', Size: 'M' }
});

export const ProductMediaSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  url: z.string().url().max(1024),
  urlWebp: z.string().url().max(1024).optional().nullable(),
  altText: z.string().max(255).optional().nullable(),
  displayOrder: z.number().default(0),
  isPrimary: z.boolean().default(false),
  mediaType: MediaType.default('IMAGE'),
});

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Product name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255),
  shortDescription: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional().nullable(),
  basePrice: z.number().min(0),
  sku: z.string().max(100).optional().nullable(),
  barcode: z.string().max(100).optional().nullable(),
  status: ProductStatus.default('DRAFT'),
  gender: Gender.optional().nullable(),
  season: z.string().max(50).optional().nullable(),
  careInstructions: z.string().optional().nullable(),
  countryOfOrigin: z.string().max(100).optional().nullable(),
  warranty: z.string().max(255).optional().nullable(),
  material: z.string().max(255).optional().nullable(),
  isFeatured: z.boolean().default(false),
  averageRating: z.number().min(0).max(5).default(0),
  publishedAt: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  
  // Relations
  variants: z.array(ProductVariantSchema).optional(),
  media: z.array(ProductMediaSchema).optional(),
  product_media: z.array(ProductMediaSchema).optional().nullable(),
  seo: ProductSeoSchema.optional().nullable(),
  tags: z.array(TagSchema).optional(),
});

// ============================================================================
// TYPES
// ============================================================================
export type Tag = z.infer<typeof TagSchema>;
export type ProductSeo = z.infer<typeof ProductSeoSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type ProductMedia = z.infer<typeof ProductMediaSchema>;
export type Product = z.infer<typeof ProductSchema>;

export type ProductStatusType = z.infer<typeof ProductStatus>;
export type GenderType = z.infer<typeof Gender>;
export type MediaTypeType = z.infer<typeof MediaType>;

// ============================================================================
// MUTATION SCHEMAS (Create/Update)
// ============================================================================
export const CreateProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  averageRating: true,
  variants: true,
  media: true,
  seo: true,
  tags: true,
}).extend({
  seo: ProductSeoSchema.omit({ id: true, productId: true }).optional().nullable(),
  tags: z.array(z.string().uuid()).optional(), // Tag IDs
  media: z.array(ProductMediaSchema.omit({ id: true, productId: true })).optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
