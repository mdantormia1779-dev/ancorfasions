import { createClient } from "@/lib/supabase/server";
import { CreateProductInput, Product } from "@/types/catalog.types";
import { cache } from "react";

export class ProductRepository {
  /**
   * Retrieves a paginated list of products with optional filtering.
   */
  static getProducts = cache(async ({
    page = 1,
    limit = 20,
    search,
    categoryId,
    brandId,
    status,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    status?: string;
  }) => {
    const supabase = await createClient();
    const offset = (page - 1) * limit;

    let query = supabase.from("products").select(
      `
        *,
        category:categories(id, name),
        brand:brands(id, name),
        variants:variants(*),
        media:product_media(*),
        seo:product_seo(*),
        tags:product_tags(tag:tags(*))
      `,
      { count: "exact" }
    );

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`
      );
    }
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
    if (brandId) {
      query = query.eq("brand_id", brandId);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      products: data as unknown as Product[], // In a real app we might run through Zod parsing here
      total: count || 0,
      page,
      limit,
    };
  });

  /**
   * Retrieves a single product by ID with all relationships.
   */
  static getProductById = cache(async (id: string): Promise<Product | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        variants(*),
        media:product_media(*),
        seo:product_seo(*),
        tags:product_tags(tag:tags(*))
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // not found
      throw error;
    }

    // Normalize data
    const product = { ...data };
    if (product.seo && Array.isArray(product.seo)) {
      product.seo = product.seo[0] || null;
    }
    if (product.tags && Array.isArray(product.tags)) {
      product.tags = product.tags.map((t: any) => t.tag).filter(Boolean);
    }

    return product as unknown as Product;
  });

  /**
   * Creates a new product along with SEO and tags.
   */
  static async createProduct(input: CreateProductInput) {
    const supabase = await createClient();

    const { seo, tags, media, variants, ...productData } = input;

    // We need to use an RPC or just transaction equivalent if available.
    // Since Supabase JS doesn't have native multi-table transactions out of the box,
    // we do sequential inserts or use a stored procedure.
    // For Enterprise, we'll do sequential here, but ideally we'd use Postgres Functions.

    // 1. Create Product
    const { data: newProduct, error: productError } = await supabase
      .from("products")
      .insert({
        name: productData.name,
        slug: productData.slug,
        short_description: productData.shortDescription,
        description: productData.description,
        category_id: productData.categoryId,
        brand_id: productData.brandId,
        base_price: productData.basePrice,
        sku: productData.sku,
        barcode: productData.barcode,
        status: productData.status,
        gender: productData.gender,
        season: productData.season,
        care_instructions: productData.careInstructions,
        country_of_origin: productData.countryOfOrigin,
        warranty: productData.warranty,
        material: productData.material,
        is_featured: productData.isFeatured,
      })
      .select()
      .single();

    if (productError) throw productError;
    const productId = newProduct.id;

    // 2. Create SEO
    if (seo) {
      const { error: seoError } = await supabase.from("product_seo").insert({
        product_id: productId,
        meta_title: seo.metaTitle,
        meta_description: seo.metaDescription,
        canonical_url: seo.canonicalUrl,
        og_title: seo.ogTitle,
        og_description: seo.ogDescription,
        og_image_url: seo.ogImageUrl,
        twitter_card_type: seo.twitterCardType,
        structured_data: seo.structuredData,
        keywords: seo.keywords,
      });
      if (seoError) throw new Error(`Failed to create product SEO: ${seoError.message}`);
    }

    // 3. Link Tags
    if (tags && tags.length > 0) {
      const tagInserts = tags.map((tagId) => ({
        product_id: productId,
        tag_id: tagId,
      }));
      const { error: tagsError } = await supabase.from("product_tags").insert(tagInserts);
      if (tagsError) throw new Error(`Failed to link product tags: ${tagsError.message}`);
    }

    // 4. Create Media
    if (media && media.length > 0) {
      const mediaInserts = media.map((m) => ({
        product_id: productId,
        url: m.url,
        url_webp: m.urlWebp,
        alt_text: m.altText,
        display_order: m.displayOrder,
        is_primary: m.isPrimary,
        media_type: m.mediaType,
      }));
      const { error: mediaError } = await supabase.from("product_media").insert(mediaInserts);
      if (mediaError) throw new Error(`Failed to create product media: ${mediaError.message}`);
    }

    // 5. Create Variants
    if (variants && variants.length > 0) {
      const variantInserts = variants.map((v) => ({
        product_id: productId,
        sku: v.sku,
        barcode: v.barcode,
        price_override: v.priceOverride,
        sale_price: v.salePrice,
        weight: v.weight,
        dimensions: v.dimensions,
        is_active: v.isActive,
        attributes: v.attributes,
      }));
      const { error: variantsError } = await supabase.from("variants").insert(variantInserts);
      if (variantsError) throw new Error(`Failed to create product variants: ${variantsError.message}`);
    }

    return this.getProductById(productId);
  }

  /**
   * Updates a product
   */
  static async updateProduct(id: string, input: Partial<CreateProductInput>) {
    const supabase = await createClient();
    const { seo, tags, media, variants, ...productData } = input;

    // 1. Update Product — strip undefined so we don't NULL-out existing columns
    if (Object.keys(productData).length > 0) {
      const rawUpdate = {
        name: productData.name,
        slug: productData.slug,
        short_description: productData.shortDescription,
        description: productData.description,
        category_id: productData.categoryId,
        brand_id: productData.brandId,
        base_price: productData.basePrice,
        sku: productData.sku,
        barcode: productData.barcode,
        status: productData.status,
        gender: productData.gender,
        season: productData.season,
        care_instructions: productData.careInstructions,
        country_of_origin: productData.countryOfOrigin,
        warranty: productData.warranty,
        material: productData.material,
        is_featured: productData.isFeatured,
      };

      // Remove keys whose value is undefined — Supabase would overwrite with NULL otherwise
      const cleanUpdate = Object.fromEntries(
        Object.entries(rawUpdate).filter(([, v]) => v !== undefined)
      );

      if (Object.keys(cleanUpdate).length > 0) {
        const { error } = await supabase
          .from("products")
          .update(cleanUpdate)
          .eq("id", id);
        if (error) throw error;
      }
    }

    // 2. Update SEO (Upsert)
    if (seo) {
      const { data: existingSeo, error: existingSeoError } = await supabase
        .from("product_seo")
        .select("id")
        .eq("product_id", id)
        .single();
        
      if (existingSeoError && existingSeoError.code !== "PGRST116") {
        throw new Error(`Failed to check existing SEO: ${existingSeoError.message}`);
      }

      if (existingSeo) {
        const { error: seoUpdateError } = await supabase
          .from("product_seo")
          .update({
            meta_title: seo.metaTitle,
            meta_description: seo.metaDescription,
            canonical_url: seo.canonicalUrl,
            og_title: seo.ogTitle,
            og_description: seo.ogDescription,
            og_image_url: seo.ogImageUrl,
            twitter_card_type: seo.twitterCardType,
            structured_data: seo.structuredData,
            keywords: seo.keywords,
          })
          .eq("product_id", id);
        if (seoUpdateError) throw new Error(`Failed to update product SEO: ${seoUpdateError.message}`);
      } else {
        const { error: seoInsertError } = await supabase.from("product_seo").insert({
          product_id: id,
          meta_title: seo.metaTitle,
          meta_description: seo.metaDescription,
          canonical_url: seo.canonicalUrl,
          og_title: seo.ogTitle,
          og_description: seo.ogDescription,
          og_image_url: seo.ogImageUrl,
          twitter_card_type: seo.twitterCardType,
          structured_data: seo.structuredData,
          keywords: seo.keywords,
        });
        if (seoInsertError) throw new Error(`Failed to insert product SEO: ${seoInsertError.message}`);
      }
    }

    // 3. Update Tags
    if (tags !== undefined) {
      // Simple strategy: delete existing and re-insert
      const { error: deleteTagsError } = await supabase.from("product_tags").delete().eq("product_id", id);
      if (deleteTagsError) throw new Error(`Failed to delete old product tags: ${deleteTagsError.message}`);
      if (tags.length > 0) {
        const tagInserts = tags.map((tagId) => ({
          product_id: id,
          tag_id: tagId,
        }));
        const { error: insertTagsError } = await supabase.from("product_tags").insert(tagInserts);
        if (insertTagsError) throw new Error(`Failed to insert new product tags: ${insertTagsError.message}`);
      }
    }

    // 4. Update Media
    if (media !== undefined) {
      const { error: deleteMediaError } = await supabase.from("product_media").delete().eq("product_id", id);
      if (deleteMediaError) throw new Error(`Failed to delete old product media: ${deleteMediaError.message}`);
      if (media.length > 0) {
        const mediaInserts = media.map((m) => ({
          product_id: id,
          url: m.url,
          url_webp: m.urlWebp,
          alt_text: m.altText,
          display_order: m.displayOrder,
          is_primary: m.isPrimary,
          media_type: m.mediaType,
        }));
        const { error: insertMediaError } = await supabase.from("product_media").insert(mediaInserts);
        if (insertMediaError) throw new Error(`Failed to insert new product media: ${insertMediaError.message}`);
      }
    }

    // 5. Update Variants
    if (variants !== undefined) {
      const { error: deleteVariantsError } = await supabase.from("variants").delete().eq("product_id", id);
      if (deleteVariantsError) throw new Error(`Failed to delete old product variants: ${deleteVariantsError.message}`);
      if (variants.length > 0) {
        const variantInserts = variants.map((v) => ({
          product_id: id,
          sku: v.sku,
          barcode: v.barcode,
          price_override: v.priceOverride,
          sale_price: v.salePrice,
          weight: v.weight,
          dimensions: v.dimensions,
          is_active: v.isActive,
          attributes: v.attributes,
        }));
        const { error: insertVariantsError } = await supabase.from("variants").insert(variantInserts);
        if (insertVariantsError) throw new Error(`Failed to insert new product variants: ${insertVariantsError.message}`);
      }
    }

    return this.getProductById(id);
  }

  /**
   * Soft deletes a product
   */
  static async deleteProduct(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString(), status: "ARCHIVED" })
      .eq("id", id);

    if (error) throw error;
    return true;
  }

  /**
   * Bulk update the status of multiple products in a single DB query.
   */
  static async bulkUpdateStatus(
    ids: string[],
    status: "DRAFT" | "ACTIVE" | "ARCHIVED"
  ): Promise<number> {
    const supabase = await createClient();
    const { error, count } = await supabase
      .from("products")
      .update({ status })
      .in("id", ids);
    if (error) throw error;
    return count ?? ids.length;
  }

  /**
   * Bulk soft-delete multiple products in a single DB query.
   */
  static async bulkDelete(ids: string[]): Promise<number> {
    const supabase = await createClient();
    const { error, count } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString(), status: "ARCHIVED" })
      .in("id", ids);
    if (error) throw error;
    return count ?? ids.length;
  }
}
