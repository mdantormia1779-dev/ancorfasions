import { createClient } from "@/lib/supabase/server";

export class CategoryRepository {
  /**
   * Retrieves all categories, optionally filtered by active status.
   */
  static async getCategories(activeOnly: boolean = true) {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Unexpected error in getCategories:", err);
      return [];
    }
  }
}
