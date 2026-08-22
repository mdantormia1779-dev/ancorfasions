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
import { ADMIN_ROLES } from "@/lib/constants/auth";

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
      if (ADMIN_ROLES.includes(role)) {
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
    
    let clientToUse = supabase;
    if (user) {
      const role = user.user_metadata?.role || user.app_metadata?.role || "CUSTOMER";
      if (ADMIN_ROLES.includes(role)) {
        clientToUse = await createAdminClient();
      } else {
        // Enforce customer can only query their own orders
        params.customerId = user.id;
      }
    }

    const orders = await orderRepo.getOrders(params, clientToUse);
    return { success: true, data: orders };
  } catch (error: any) {
    return { success: false, error: error.message };
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
