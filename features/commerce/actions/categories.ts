import { getPublicSupabaseClient } from "@/lib/supabase/public";
import { CatalogService } from "@/lib/services/catalog.service";
import { Category } from "@/types/category";

export const getCategoryBySlug = async (
  slug: string
): Promise<Category | null> => {
  const categories = await CatalogService.getCategories();
  const matched = (categories as any[]).find((c) => c.slug === slug);
  if (matched) {
    return matched as Category;
  }

  const supabase = getPublicSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching category by slug:", error);
    return null;
  }
  return data as Category;
};

export const getCategories = async (): Promise<Category[]> => {
  const categories = await CatalogService.getCategories();
  return (categories || []) as Category[];
};

export const getProducts = async (params?: {
  categoryId?: string;
  limit?: number;
  offset?: number;
}): Promise<any[]> => {
  const supabase = getPublicSupabaseClient();
  let query = (supabase.from("products") as any)
    .select(
      `
      *,
      categories (name, slug),
      brands (name, slug),
      product_media (url, alt_text, is_primary)
    `
    )
    .eq("status", "ACTIVE")
    .is("deleted_at", null);

  if (params?.categoryId) {
    query = query.eq("category_id", params.categoryId);
  }

  query = query.order("created_at", { ascending: false });

  if (params?.limit) {
    const offset = params.offset ?? 0;
    query = query.range(offset, offset + params.limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products for category:", error);
    return [];
  }
  return data ?? [];
};

export const getBrands = async (): Promise<any[]> => {
  const brands = await CatalogService.getBrands();
  return (brands || []) as any[];
};
