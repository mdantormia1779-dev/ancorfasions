import { getPublicSupabaseClient } from "@/lib/supabase/public";

export interface ProductListParams {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "rating";
  limit?: number;
  offset?: number;
}

export const CatalogRepository = {
  async getCategories() {
    const supabase = getPublicSupabaseClient();
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error(
          "Error fetching categories — code:",
          error.code,
          "| message:",
          error.message,
          "| details:",
          error.details,
          "| hint:",
          error.hint
        );
        return [];
      }
      return data ?? [];
    } catch (e) {
      console.error("Network or unexpected error fetching categories:", e);
      return [];
    }
  },

  async getFeaturedProducts(limit = 4) {
    const supabase = getPublicSupabaseClient();
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories (name, slug),
          brands (name),
          product_media (url, alt_text, is_primary)
        `
        )
        .eq("status", "ACTIVE")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching featured products:", error);
        return [];
      }
      return data;
    } catch (e) {
      console.error(
        "Network or unexpected error fetching featured products:",
        e
      );
      return [];
    }
  },

  async getNewArrivals(limit = 4) {
    const supabase = getPublicSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (name, slug),
        brands (name),
        product_media (url, alt_text, is_primary)
      `
      )
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching new arrivals:", error);
      return [];
    }
    return data;
  },

  async getProducts(params: ProductListParams) {
    const supabase = getPublicSupabaseClient();
    let query = supabase
      .from("products")
      .select(
        `
        *,
        categories!inner (name, slug),
        brands!inner (name, slug),
        product_media (url, alt_text, is_primary)
      `,
        { count: "exact" }
      )
      .eq("status", "ACTIVE");

    if (params.category) {
      query = query.eq("categories.slug", params.category);
    }
    if (params.brand) {
      query = query.eq("brands.slug", params.brand);
    }
    if (params.minPrice !== undefined) {
      query = query.gte("base_price", params.minPrice);
    }
    if (params.maxPrice !== undefined) {
      query = query.lte("base_price", params.maxPrice);
    }
    if (params.search) {
      // Using search vector
      query = query.textSearch("search_vector", params.search);
    }

    if (params.sortBy) {
      switch (params.sortBy) {
        case "price_asc":
          query = query.order("base_price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("base_price", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "rating":
          query = query.order("average_rating", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const limit = params.limit || 12;
    const offset = params.offset || 0;

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return { data: [], count: 0 };
    }
    return { data, count };
  },

  async getProductBySlug(slug: string): Promise<any> {
    const supabase = getPublicSupabaseClient();
    const { data, error } = await (supabase.from("products") as any)
      .select(
        `
        *,
        categories (id, name, slug),
        brands (id, name, slug),
        product_media (*),
        variants (
          *,
          inventory_levels (quantity_available, reorder_point),
          variant_attribute_values (
            attribute_values (
              id, value,
              attributes (id, name)
            )
          )
        ),
        size_charts (*)
      `
      )
      .eq("slug", slug)
      .eq("status", "ACTIVE")
      .single();

    if (error) {
      console.error("Error fetching product by slug:", error);
      return null;
    }

    if (data) {
      const hasVariants = ((data as any).variants || []).length > 0;
      if (hasVariants) {
        // Compute total available stock across all variants and warehouses
        const totalAvailable = ((data as any).variants || []).reduce(
          (sum: number, variant: any) => {
            const variantStock = (variant.inventory_levels || []).reduce(
              (vSum: number, level: any) =>
                vSum + (level.quantity_available || 0),
              0
            );
            return sum + variantStock;
          },
          0
        );
        (data as any).is_in_stock = totalAvailable > 0;
        (data as any).total_available_stock = totalAvailable;
      } else {
        // Simple product without variants: active in catalog
        (data as any).is_in_stock = true;
        (data as any).total_available_stock = 100;
      }
    }

    return data;
  },
};
