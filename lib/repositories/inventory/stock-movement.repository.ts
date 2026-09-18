import { createClient } from "@/lib/supabase/server";

export class StockMovementRepository {
  static async getMovements() {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("stock_movements")
        .select("*, variants(sku, name), warehouses(name)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data;
      }

      // Fallback query if relation syntax fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("stock_movements")
        .select("*")
        .order("created_at", { ascending: false });

      if (fallbackError) {
        console.error("Error fetching stock movements:", fallbackError);
        return [];
      }
      return fallbackData || [];
    } catch (err) {
      console.error("Unexpected error in getMovements:", err);
      return [];
    }
  }
}
