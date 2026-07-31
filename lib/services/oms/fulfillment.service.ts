import { createClient } from "@/lib/supabase/server";
import { OrderService } from "./order.service";
import { FulfillShipmentInput } from "@/lib/validations/oms";

export class FulfillmentService {
  private orderService = new OrderService();

  async reserveInventory(orderId: string): Promise<boolean> {
    // In a real system, this would integrate with the Inventory module
    // For OMS scope, we assume it updates the order_items table
    const supabase = await createClient();
    const { error } = await supabase
      .from("order_items")
      .update({ inventory_reserved: true })
      .eq("order_id", orderId);

    if (error) {
      console.error("Failed to reserve inventory:", error);
      return false;
    }
    return true;
  }

  async assignShipmentTracking(data: FulfillShipmentInput): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase.from("order_shipments").insert({
      order_id: data.order_id,
      tracking_number: data.tracking_number,
      courier: data.courier,
      status: "pending",
    });

    if (error) {
      throw new Error(`Failed to assign tracking: ${error.message}`);
    }

    // Automatically progress state if possible
    await this.orderService.updateOrderStatus(
      data.order_id,
      "ready_for_shipment",
      undefined,
      "system"
    );
    return true;
  }
}
