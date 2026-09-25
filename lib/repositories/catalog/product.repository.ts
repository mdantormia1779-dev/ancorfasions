import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
        variants:variants(*, inventory_levels(quantity_available)),
        media:product_media(*),
        seo:product_seo(*),
        tags:product_tags(tag:tags(*))
      `,
      { count: "exact" }
    );

    // Only return active, non-deleted products
    query = query.is("deleted_at", null);

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

    const mappedProducts = data?.map((p: any) => {
      let totalStock = 0;
      const variants = (p.variants || []).map((v: any) => {
        const vStock = (v.inventory_levels || []).reduce(
          (sum: number, lvl: any) => sum + (lvl.quantity_available || 0),
          0
        );
        totalStock += vStock;
        return {
          ...v,
          stockQuantity: vStock,
        };
      });

      return {
        ...p,
        basePrice: p.base_price,
        costPrice: p.cost_price,
        salePrice: p.sale_price,
        shortDescription: p.short_description,
        categoryId: p.category_id,
        brandId: p.brand_id,
        isFeatured: p.is_featured,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        variants,
        stockQuantity: totalStock,
      };
    }) || [];

    return {
      products: mappedProducts as unknown as Product[],
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
        variants(*, inventory_levels(quantity_available, warehouse_id)),
        media:product_media(*),
        seo:product_seo(*),
        tags:product_tags(tag:tags(*))
      `
      )
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // not found
      throw error;
    }

    // Calculate variant stock & overall stock
    let totalStock = 0;
    const variantsWithStock = (data.variants || []).map((v: any) => {
      const stock = (v.inventory_levels || []).reduce(
        (acc: number, lvl: any) => acc + (lvl.quantity_available || 0),
        0
      );
      totalStock += stock;
      return {
        ...v,
        stockQuantity: stock,
      };
    });

    // Normalize data
    const product = { 
      ...data,
      basePrice: data.base_price,
      costPrice: data.cost_price,
      salePrice: data.sale_price,
      shortDescription: data.short_description,
      categoryId: data.category_id,
      brandId: data.brand_id,
      isFeatured: data.is_featured,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      stockQuantity: totalStock,
      variants: variantsWithStock,
    };
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
    const supabase = createAdminClient();

    const { seo, tags, media, variants, ...productData } = input;

    // Check duplicate main SKU
    if (productData.sku) {
      const { data: existingSku } = await supabase
        .from("products")
        .select("id")
        .ilike("sku", productData.sku.trim())
        .maybeSingle();

      if (existingSku) {
        throw new Error(`A product with SKU "${productData.sku}" already exists.`);
      }
    }

    // Check duplicate slug
    if (productData.slug) {
      const { data: existingSlug } = await supabase
        .from("products")
        .select("id")
        .eq("slug", productData.slug.trim())
        .maybeSingle();

      if (existingSlug) {
        throw new Error(`A product with URL slug "${productData.slug}" already exists.`);
      }
    }

    // Check duplicate variant SKUs
    if (variants && variants.length > 0) {
      const variantSkus = variants.map((v) => v.sku?.trim()).filter(Boolean);
      const duplicates = variantSkus.filter((item, idx) => variantSkus.indexOf(item) !== idx);
      if (duplicates.length > 0) {
        throw new Error(`Duplicate variant SKU found in form: "${duplicates[0]}"`);
      }
    }

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
        cost_price: productData.costPrice ?? null,
        sale_price: productData.salePrice ?? null,
        sku: productData.sku && productData.sku.trim() ? productData.sku.trim() : null,
        barcode: productData.barcode && productData.barcode.trim() ? productData.barcode.trim() : null,
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

    // 5. Create Variants & Inventory Levels
    let defaultWarehouseId: string | null = null;
    const { data: warehouse } = await supabase
      .from("warehouses")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    if (warehouse) {
      defaultWarehouseId = warehouse.id;
    }

    if (variants && variants.length > 0) {
      const productSlugPrefix = (productData.slug || "PROD").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
      const baseSkuPrefix = (productData.sku?.trim() || productSlugPrefix).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);

      const candidateSkus = variants.map((v, idx) => {
        let sku = v.sku?.trim();
        if (!sku) {
          const attrVal = v.attributes ? Object.values(v.attributes)[0] : null;
          const attrClean = attrVal ? String(attrVal).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) : `V${idx + 1}`;
          sku = `${baseSkuPrefix}-${attrClean}`;
        }
        return sku;
      });

      // Check against existing SKUs in DB
      const { data: existingDbVariants } = await supabase
        .from("variants")
        .select("sku")
        .in("sku", candidateSkus);
      const existingSet = new Set((existingDbVariants || []).map((r: any) => r.sku));

      const usedInBatch = new Set<string>();
      const finalVariants = variants.map((v, idx) => {
        let sku = candidateSkus[idx];
        let disambiguator = 1;
        while (usedInBatch.has(sku) || existingSet.has(sku)) {
          sku = `${candidateSkus[idx]}-${Date.now().toString().slice(-3)}${disambiguator++}`;
        }
        usedInBatch.add(sku);

        return {
          product_id: productId,
          sku,
          barcode: v.barcode && v.barcode.trim() ? v.barcode.trim() : null,
          price_override: v.priceOverride,
          sale_price: v.salePrice,
          weight: v.weight,
          dimensions: v.dimensions,
          is_active: v.isActive,
          attributes: v.attributes,
        };
      });

      const { data: createdVariants, error: variantsError } = await supabase
        .from("variants")
        .insert(finalVariants)
        .select("id, sku");

      if (variantsError) {
        await supabase.from("products").update({ deleted_at: new Date().toISOString(), status: "ARCHIVED" }).eq("id", productId);
        throw new Error(`Failed to create product variants: ${variantsError.message}`);
      }

      if (createdVariants && createdVariants.length > 0 && defaultWarehouseId) {
        const inventoryInserts = createdVariants.map((cv, idx) => ({
          variant_id: cv.id,
          warehouse_id: defaultWarehouseId,
          quantity_available: Number(variants[idx]?.stockQuantity ?? 0),
          quantity_reserved: 0,
          reorder_point: 10,
        }));
        await supabase.from("inventory_levels").insert(inventoryInserts);
      }
    } else {
      // Simple product without variants: create a default variant linked to inventory_levels
      const productSlugPrefix = (productData.slug || "PROD").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
      let defaultSku = productData.sku?.trim()
        ? `${productData.sku.trim().toUpperCase()}-DEF`
        : `${productSlugPrefix}-DEF-${Date.now().toString().slice(-4)}`;

      const { data: existingDef } = await supabase.from("variants").select("id").eq("sku", defaultSku).maybeSingle();
      if (existingDef) {
        defaultSku = `${defaultSku}-${Date.now().toString().slice(-3)}`;
      }

      const { data: defaultVariant, error: defaultVariantErr } = await supabase
        .from("variants")
        .insert({
          product_id: productId,
          sku: defaultSku,
          barcode: productData.barcode && productData.barcode.trim() ? productData.barcode.trim() : null,
          price_override: productData.basePrice,
          sale_price: productData.salePrice ?? null,
          is_active: true,
          attributes: { Standard: "Default" },
        })
        .select("id")
        .single();

      if (defaultVariantErr) {
        await supabase.from("products").update({ deleted_at: new Date().toISOString(), status: "ARCHIVED" }).eq("id", productId);
        throw new Error(`Failed to initialize default variant: ${defaultVariantErr.message}`);
      }

      if (defaultVariant && defaultWarehouseId) {
        await supabase.from("inventory_levels").insert({
          variant_id: defaultVariant.id,
          warehouse_id: defaultWarehouseId,
          quantity_available: Number(productData.stockQuantity ?? 0),
          quantity_reserved: 0,
          reorder_point: 10,
        });
      }
    }

    return this.getProductById(productId);
  }

  /**
   * Updates a product
   */
  static async updateProduct(id: string, input: Partial<CreateProductInput>) {
    const supabase = createAdminClient();
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
        cost_price: productData.costPrice,
        sale_price: productData.salePrice,
        sku:
          productData.sku !== undefined
            ? productData.sku && productData.sku.trim()
              ? productData.sku.trim()
              : null
            : undefined,
        barcode:
          productData.barcode !== undefined
            ? productData.barcode && productData.barcode.trim()
              ? productData.barcode.trim()
              : null
            : undefined,
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

    // 5. Update Variants & Inventory Levels
    if (variants !== undefined || productData.stockQuantity !== undefined) {
      let defaultWarehouseId: string | null = null;
      const { data: warehouse } = await supabase
        .from("warehouses")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (warehouse) {
        defaultWarehouseId = warehouse.id;
      }

      // Delete old inventory levels and variants for this product
      const { data: oldVariants } = await supabase
        .from("variants")
        .select("id")
        .eq("product_id", id);
      if (oldVariants && oldVariants.length > 0) {
        const oldIds = oldVariants.map((v) => v.id);
        await supabase.from("inventory_levels").delete().in("variant_id", oldIds);
        await supabase.from("variants").delete().eq("product_id", id);
      }

      if (variants && variants.length > 0) {
        const { data: currentProduct } = await supabase
          .from("products")
          .select("sku, slug, base_price, sale_price, barcode")
          .eq("id", id)
          .single();

        const productSlugPrefix = (productData.slug || currentProduct?.slug || "PROD").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
        const baseSkuPrefix = (productData.sku?.trim() || currentProduct?.sku || productSlugPrefix).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);

        const candidateSkus = variants.map((v, idx) => {
          let sku = v.sku?.trim();
          if (!sku) {
            const attrVal = v.attributes ? Object.values(v.attributes)[0] : null;
            const attrClean = attrVal ? String(attrVal).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) : `V${idx + 1}`;
            sku = `${baseSkuPrefix}-${attrClean}`;
          }
          return sku;
        });

        // Check against existing SKUs in DB
        const { data: existingDbVariants } = await supabase
          .from("variants")
          .select("sku")
          .in("sku", candidateSkus);
        const existingSet = new Set((existingDbVariants || []).map((r: any) => r.sku));

        const usedInBatch = new Set<string>();
        const finalVariants = variants.map((v, idx) => {
          let sku = candidateSkus[idx];
          let disambiguator = 1;
          while (usedInBatch.has(sku) || existingSet.has(sku)) {
            sku = `${candidateSkus[idx]}-${Date.now().toString().slice(-3)}${disambiguator++}`;
          }
          usedInBatch.add(sku);

          return {
            product_id: id,
            sku,
            barcode: v.barcode && v.barcode.trim() ? v.barcode.trim() : null,
            price_override: v.priceOverride,
            sale_price: v.salePrice,
            weight: v.weight,
            dimensions: v.dimensions,
            is_active: v.isActive,
            attributes: v.attributes,
          };
        });

        const { data: createdVariants, error: insertVariantsError } = await supabase
          .from("variants")
          .insert(finalVariants)
          .select("id, sku");
        if (insertVariantsError) throw new Error(`Failed to insert new product variants: ${insertVariantsError.message}`);

        if (createdVariants && createdVariants.length > 0 && defaultWarehouseId) {
          const inventoryInserts = createdVariants.map((cv, idx) => ({
            variant_id: cv.id,
            warehouse_id: defaultWarehouseId,
            quantity_available: Number(variants[idx]?.stockQuantity ?? 0),
            quantity_reserved: 0,
            reorder_point: 10,
          }));
          await supabase.from("inventory_levels").insert(inventoryInserts);
        }
      } else if (productData.stockQuantity !== undefined || variants !== undefined) {
        // Simple product: ensure default variant exists with updated stockQuantity
        const { data: currentProduct } = await supabase
          .from("products")
          .select("sku, slug, base_price, sale_price, barcode")
          .eq("id", id)
          .single();

        const productSlugPrefix = (productData.slug || currentProduct?.slug || "PROD").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
        let defaultSku = productData.sku?.trim()
          ? `${productData.sku.trim().toUpperCase()}-DEF`
          : currentProduct?.sku
            ? `${currentProduct.sku.trim().toUpperCase()}-DEF`
            : `${productSlugPrefix}-DEF-${Date.now().toString().slice(-4)}`;

        const { data: existingDef } = await supabase.from("variants").select("id").eq("sku", defaultSku).maybeSingle();
        if (existingDef) {
          defaultSku = `${defaultSku}-${Date.now().toString().slice(-3)}`;
        }

        const { data: defaultVariant, error: defaultVariantErr } = await supabase
          .from("variants")
          .insert({
            product_id: id,
            sku: defaultSku,
            barcode: productData.barcode ?? currentProduct?.barcode ?? null,
            price_override: productData.basePrice ?? currentProduct?.base_price ?? 0,
            sale_price: productData.salePrice ?? currentProduct?.sale_price ?? null,
            is_active: true,
            attributes: { Standard: "Default" },
          })
          .select("id")
          .single();

        if (defaultVariantErr) {
          throw new Error(`Failed to initialize default variant on update: ${defaultVariantErr.message}`);
        }

        if (defaultVariant && defaultWarehouseId) {
          await supabase.from("inventory_levels").insert({
            variant_id: defaultVariant.id,
            warehouse_id: defaultWarehouseId,
            quantity_available: Number(productData.stockQuantity ?? 0),
            quantity_reserved: 0,
            reorder_point: 10,
          });
        }
      }
    }

    return this.getProductById(id);
  }

  /**
   * Soft deletes a product
   */
  static async deleteProduct(id: string) {
    const supabase = createAdminClient();
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
    const supabase = createAdminClient();
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
    const supabase = createAdminClient();
    const { error, count } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString(), status: "ARCHIVED" })
      .in("id", ids);
    if (error) throw error;
    return count ?? ids.length;
  }

  /**
   * Bulk soft-delete all products matching optional filter criteria, or all non-deleted products.
   */
  static async deleteAllProducts(filters?: { status?: string; search?: string }): Promise<number> {
    const supabase = createAdminClient();
    let query = supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString(), status: "ARCHIVED" })
      .is("deleted_at", null);

    if (filters?.status && filters.status !== "ALL") {
      query = query.eq("status", filters.status);
    }
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%`
      );
    }

    const { error, count } = await query;
    if (error) throw error;
    return count ?? 0;
  }
}
