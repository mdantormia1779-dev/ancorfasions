import { createClient } from "@/lib/supabase/server";

export class CollectionRepository {
  static async getCollections(activeOnly: boolean = true) {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("collections")
        .select("*")
        .order("name", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching collections:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Unexpected error in getCollections:", err);
      return [];
    }
  }
}
