import { createClient } from "@/lib/supabase/server";

export class StockMovementRepository {
  static async getMovements() {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("stock_movements")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching stock movements:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Unexpected error in getMovements:", err);
      return [];
    }
  }
}
