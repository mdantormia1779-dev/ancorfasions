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
