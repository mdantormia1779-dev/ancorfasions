import { createClient } from "@/lib/supabase/server";

export class ReviewRepository {
  static async getReviews() {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("customer_reviews")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching reviews:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Unexpected error in getReviews:", err);
      return [];
    }
  }
}
