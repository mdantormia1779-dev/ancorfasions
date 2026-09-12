"use server";

import { OrderService } from "@/lib/services/oms/order.service";
import { OrderRepository } from "@/lib/repositories/oms/order.repository";
import {
  CreateOrderInput,
  UpdateOrderStatusInput,
  updateOrderStatusSchema,
  createOrderSchema,
} from "@/lib/validations/oms";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ADMIN_ROLES, MANAGER_ROLES, STAFF_ROLES } from "@/lib/constants/auth";
import { InventoryService } from "@/services/inventory.service";
import { PaymentService } from "@/services/payment/payment.service";

const orderService = new OrderService();
const orderRepo = new OrderRepository();

export async function createOrderAction(input: CreateOrderInput) {
  try {
    const validatedData = createOrderSchema.parse(input);
    const newOrder = await orderService.createOrder(validatedData);
    revalidatePath("/admin/orders");
    return { success: true, data: newOrder };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatusAction(input: UpdateOrderStatusInput) {
  try {
    const validatedData = updateOrderStatusSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Use session role or default to 'admin' if they reached this admin action
    const role = user?.user_metadata?.role || "admin";
    const userId = user?.id;

    const updatedOrder = await orderService.updateOrderStatus(
      validatedData.order_id,
      validatedData.new_status,
      userId,
      role
    );

    revalidatePath(`/admin/orders/${validatedData.order_id}`);
    revalidatePath("/admin/orders");
    return { success: true, data: updatedOrder };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getOrderDetailsAction(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let clientToUse = supabase;
    if (user) {
      const role = user.user_metadata?.role || user.app_metadata?.role || "CUSTOMER";
      if (MANAGER_ROLES.includes(role)) {
        clientToUse = await createAdminClient();
      }
    }

    const details = await orderService.getOrderDetails(id, clientToUse);
    return { success: true, data: details };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchOrdersAction(params: {
  customerId?: string;
  status?: any;
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let isStaffOrManager = false;
    if (user) {
      const role = String(user.user_metadata?.role || user.app_metadata?.role || "").toUpperCase();
      if (
        (ADMIN_ROLES as readonly string[]).includes(role) ||
        (MANAGER_ROLES as readonly string[]).includes(role) ||
        (STAFF_ROLES as readonly string[]).includes(role)
      ) {
        isStaffOrManager = true;
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("roles(name)")
          .eq("id", user.id)
          .maybeSingle();
        const pRole = String(
          Array.isArray(profile?.roles)
            ? profile?.roles[0]?.name
            : (profile?.roles as any)?.name || ""
        ).toUpperCase();
        if (
          (ADMIN_ROLES as readonly string[]).includes(pRole) ||
          (MANAGER_ROLES as readonly string[]).includes(pRole) ||
          (STAFF_ROLES as readonly string[]).includes(pRole)
        ) {
          isStaffOrManager = true;
        }
      }
    }

    const clientToUse = isStaffOrManager ? await createAdminClient() : supabase;
    if (!isStaffOrManager && user) {
      params.customerId = user.id;
    }

    const orders = await orderRepo.getOrders(params, clientToUse);
    return { success: true, data: orders };
  } catch (error: any) {
    console.error("[fetchOrdersAction Error]:", error);
    return { success: false, error: error.message || "Failed to fetch orders" };
  }
}

export async function fetchOrdersForFulfillmentAction() {
  try {
    const orders = await orderRepo.getOrdersForFulfillment();
    return { success: true, data: orders };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function cancelCustomerOrderAction(
  orderId: string,
  reason: string,
  note?: string
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Fetch Authoritative Order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return { success: false, error: "Order not found" };
    }

    // 2. Verify Ownership
    if (order.customer_id && order.customer_id !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // 3. Verify Cancellation Eligibility
    const currentStatusLower = (order.status || "").toLowerCase();
    const cancellableStatuses = ["pending", "pending_payment", "processing", "confirmed"];
    if (!cancellableStatuses.includes(currentStatusLower)) {
      return {
        success: false,
        error: `This order can no longer be cancelled because its status is ${order.status}.`,
      };
    }

    const adminSupabase = await createAdminClient();

    // 3.5 Check Shipment Dispatch Status (Fulfillment Guard)
    try {
      const { data: shipments } = await adminSupabase
        .from("shipments")
        .select("id, status")
        .eq("order_id", order.id)
        .not("status", "eq", "cancelled");

      if (shipments && shipments.length > 0) {
        const isDispatched = shipments.some((s: any) =>
          ["pickup_requested", "in_transit", "out_for_delivery", "delivered"].includes(
            (s.status || "").toLowerCase()
          )
        );
        if (isDispatched) {
          return {
            success: false,
            error: "Order cannot be cancelled because fulfillment/shipping has already started.",
          };
        }
      }
    } catch (shipErr) {
      console.warn("[cancelCustomerOrderAction] Shipment status check skipped/warn:", shipErr);
    }

    // 4. Lock/Revalidate and Update Order State (Optimistic Concurrency)
    // Uses service role to ensure bypass RLS and perform conditional update safely
    const { data: updatedOrder, error: updateError } = await adminSupabase
      .from("orders")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("status", order.status) // Concurrency check
      .select()
      .maybeSingle();

    if (updateError || !updatedOrder) {
      return {
        success: false,
        error: "Failed to cancel order. It may have been updated by another process.",
      };
    }

    // 5. Release Inventory (Idempotent RPC)
    try {
      const inventoryService = new InventoryService();
      await inventoryService.releaseOrderInventory(order.id);
    } catch (invError) {
      console.error(`[cancelCustomerOrderAction] Failed to release inventory for order ${order.id}`, invError);
    }

    // 6. Handle Payment/Refund State Safely & Idempotently
    let refundStatus = "none";
    try {
      // Ignore unpaid / COD checkouts that have no captured payment
      if ((order.payment_method || "").toUpperCase() !== "COD") {
        const { data: transactions } = await adminSupabase
          .from("payment_transactions")
          .select("*")
          .eq("order_id", order.id)
          .eq("status", "completed");

        if (transactions && transactions.length > 0) {
          const capturedTxn = transactions[0];

          // Check if a refund has already been initiated/completed for this transaction (Refund Idempotency)
          const { data: existingRefund } = await adminSupabase
            .from("payment_refunds")
            .select("*")
            .eq("transaction_id", capturedTxn.id)
            .in("status", ["completed", "processing", "pending"])
            .maybeSingle();

          if (existingRefund) {
            refundStatus = existingRefund.status === "completed" ? "completed" : "pending";
          } else {
            const paymentService = new PaymentService();
            const refundResult = await paymentService.processRefund(user.id, {
              transactionId: capturedTxn.id,
              amount: Number(capturedTxn.amount),
              reason: `Customer cancelled order: ${reason}${note ? ` (${note})` : ""}`,
            });
            refundStatus = refundResult.status === "completed" ? "completed" : "pending";
          }
        }
      }
    } catch (refundError) {
      console.error(`[cancelCustomerOrderAction] Failed to process refund for order ${order.id}`, refundError);
      refundStatus = "failed/pending";
    }

    // 7. Write Order Status History (Audit Idempotency via single winner update)
    try {
      await adminSupabase.from("order_status_history").insert({
        order_id: order.id,
        previous_status: order.status,
        new_status: "cancelled",
        reason: note ? `${reason}: ${note}` : reason,
        changed_by: user.id,
      });
    } catch (histErr) {
      console.error("[cancelCustomerOrderAction] Failed to write status history", histErr);
    }

    // 8. Customer Notification (Notification Idempotency via single winner update)
    try {
      await adminSupabase.from("customer_notifications").insert({
        customer_id: user.id,
        title: `Order ${order.order_number} Cancelled`,
        message: `Your order has been cancelled successfully.${
          refundStatus !== "none" ? ` Refund status: ${refundStatus}.` : ""
        }`,
        type: "ORDER",
        read: false,
      });
    } catch (notifErr) {
      console.error("[cancelCustomerOrderAction] Failed to create notification", notifErr);
    }

    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${order.order_number}`);
    if (order.id) revalidatePath(`/account/orders/${order.id}`);

    return { success: true, data: updatedOrder };
  } catch (error: any) {
    console.error("[cancelCustomerOrderAction Error]:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

