import { createClient } from "@/lib/supabase/server";
import { OrderItem } from "@/types/oms";

export class OrderItemsRepository {
  async getOrderItems(orderId: string, supabaseClient?: any): Promise<OrderItem[]> {
    let supabase = supabaseClient;
    if (!supabase) {
      try {
        supabase = await createClient();
      } catch {
        const { createAdminClient } = await import("@/lib/supabase/server");
        supabase = await createAdminClient();
      }
    }
    let { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (error && (error.code === "42501" || error.message?.includes("permission denied") || error.message?.includes("users"))) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const adminClient = await createAdminClient();
        const retry = await adminClient
          .from("order_items")
          .select("*")
          .eq("order_id", orderId)
          .order("created_at", { ascending: true });
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      } catch (retryCatch) {
        console.warn("[getOrderItems] Admin client retry error:", retryCatch);
      }
    }

    if (error) {
      console.error("Error fetching order items:", error);
      return [];
    }
    return data as OrderItem[];
  }

  async createOrderItems(
    items: Omit<OrderItem, "id" | "created_at">[]
  ): Promise<OrderItem[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("order_items")
      .insert(items)
      .select();

    if (error) {
      throw new Error(`Failed to create order items: ${error.message}`);
    }
    return data as OrderItem[];
  }
}
