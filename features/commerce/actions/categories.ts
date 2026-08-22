import { createClient } from "@/lib/supabase/server";
import { Category } from "@/types/category";

export const getCategoryBySlug = async (
  slug: string
): Promise<Category | null> => {
  const supabase = await createClient();
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
  return data;
};

export const getCategories = async (): Promise<Category[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data ?? [];
};

export const getProducts = async (params?: {
  categoryId?: string;
  limit?: number;
  offset?: number;
}): Promise<any[]> => {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      `
      *,
      categories (name, slug),
      brands (name, slug),
      product_media (url, alt_text, is_primary)
    `
    )
    .eq("status", "ACTIVE");

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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
  return data ?? [];
};
