import { createClient } from "@/lib/supabase/server";

export class PurchaseOrderRepository {
  static async getPurchaseOrders() {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("purchase_orders")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching purchase orders:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Unexpected error in getPurchaseOrders:", err);
      return [];
    }
  }
}
