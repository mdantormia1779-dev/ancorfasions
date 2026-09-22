import { createAdminClient } from "@/lib/supabase/admin-client";

export class StockMovementRepository {
  static async getMovements() {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("stock_movements")
        .select(`
          *,
          variants(sku, attributes, product:products(name)),
          warehouses!warehouse_id(id, name, warehouse_code)
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((m: any) => {
          const pName = m.variants?.product?.name || "Product";
          const sku = m.variants?.sku || "";
          const attr = m.variants?.attributes
            ? Object.values(m.variants.attributes).filter(Boolean).join(" / ")
            : "";
          const friendlyName = attr
            ? `${pName} (${sku} - ${attr})`
            : sku
            ? `${pName} (${sku})`
            : pName;

          return {
            ...m,
            quantity: m.quantity_change !== undefined ? m.quantity_change : m.quantity || 0,
            movement_type: m.reason_code || m.reason || "MOVEMENT",
            variants: {
              ...m.variants,
              name: friendlyName,
            },
          };
        });
      }

      // Fallback query
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
