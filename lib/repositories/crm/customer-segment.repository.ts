import { createClient } from "@/lib/supabase/server";

export class CustomerSegmentRepository {
  static async getSegments() {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("customer_segments")
        .select("*")
        .order("name", { ascending: true });

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching customer segments:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Unexpected error in getSegments:", err);
      return [];
    }
  }
}
