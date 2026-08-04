import { createClient } from "@/lib/supabase/server";

export class BrandRepository {
  static async getBrands(activeOnly: boolean = true) {
    try {
      const supabase = await createClient();
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
      return data || [];
    } catch (err) {
      console.error("Unexpected error in getBrands:", err);
      return [];
    }
  }
}
