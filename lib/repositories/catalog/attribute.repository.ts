import { createClient } from "@/lib/supabase/server";

export class AttributeRepository {
  static async getAttributes() {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("attributes")
        .select("*")
        .order("name", { ascending: true });

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching attributes:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Unexpected error in getAttributes:", err);
      return [];
    }
  }
}
