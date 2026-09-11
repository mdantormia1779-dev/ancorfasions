import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicSupabaseClient } from "@/lib/supabase/public";
import { Brand, CreateBrandInput, UpdateBrandInput } from "@/types/catalog.types";

export class BrandRepository {
  /**
   * Retrieves all brands with optional active-only filter.
   */
  static async getBrands(activeOnly: boolean = true): Promise<Brand[]> {
    try {
      const supabase = getPublicSupabaseClient();
      let query = supabase
        .from("brands")
        .select("*")
        .order("name", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching brands:", error);
        return [];
      }
      return (data as Brand[]) || [];
    } catch (err) {
      console.error("Unexpected error in getBrands:", err);
      return [];
    }
  }

  /**
   * Creates a new brand.
   */
  static async createBrand(input: CreateBrandInput): Promise<Brand> {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("brands")
      .insert(input)
      .select("*")
      .single();
    if (error) throw error;
    return data as Brand;
  }

  /**
   * Updates an existing brand by ID.
   */
  static async updateBrand(id: string, input: UpdateBrandInput): Promise<Brand> {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("brands")
      .update(input)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as Brand;
  }

  /**
   * Soft-deletes a brand by setting is_active=false.
   * Preserves referential integrity with products that reference this brand.
   */
  static async deleteBrand(id: string): Promise<void> {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("brands")
      .update({ is_active: false })
      .eq("id", id);
    if (error) throw error;
  }
}
