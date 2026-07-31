import { createClient } from "@/lib/supabase/server";
import { OrderEvent, OrderStatusHistory } from "@/types/oms";

export class OrderEventsRepository {
  async getEventsByOrderId(orderId: string): Promise<OrderEvent[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("order_events")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching order events:", error);
      return [];
    }
    return data as OrderEvent[];
  }

  async getStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching status history:", error);
      return [];
    }
    return data as OrderStatusHistory[];
  }
}
