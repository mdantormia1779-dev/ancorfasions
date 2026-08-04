import { createClient } from "@/lib/supabase/server";

export class PromotionRepository {
  static async getPromotions() {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching promotions:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Unexpected error in getPromotions:", err);
      return [];
    }
  }
}
