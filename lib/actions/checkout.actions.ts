"use server";

import { CheckoutService } from "../services/checkout.service";
import { OrderService } from "../services/order.service";
import { createClient } from "../supabase/server";
import { cookies } from "next/headers";
import {
  CheckoutFormValues,
  checkoutFormSchema,
} from "@/schemas/checkout.schema";
import { CheckoutStep } from "@/types/checkout.types";

async function getSessionIdentifiers() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get("af_guest_session")?.value;

  return {
    userId: user?.id || null,
    sessionId: user ? null : guestSessionId || `guest_${Date.now()}`,
  };
}

export async function fetchCheckoutSessionAction(cartId: string) {
  try {
    const { userId, sessionId } = await getSessionIdentifiers();
    const guestEmail = null; // Maybe passed from frontend if known

    const session = await CheckoutService.getOrInitializeSession(
      cartId,
      userId,
      guestEmail
    );
    return { success: true, session };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCheckoutStepAction(
  sessionId: string,
  step: CheckoutStep,
  data: any
) {
  try {
    const session = await CheckoutService.updateSession(sessionId, step, data);
    return { success: true, session };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function calculateOrderSummaryAction(cartId: string) {
  try {
    const { userId } = await getSessionIdentifiers();
    const summary = await OrderService.calculateSummary(cartId, userId);
    return { success: true, summary };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function processCheckoutAction(
  cartId: string,
  checkoutSessionId: string,
  formData: CheckoutFormValues
) {
  try {
    // Validate form data
    const parsedData = checkoutFormSchema.parse(formData);

    const { userId, sessionId } = await getSessionIdentifiers();

    // Check if session ID exists for guest, if not use a fallback empty string or error
    if (!userId && !sessionId) {
      throw new Error("No valid session found for checkout.");
    }

    const guestEmail = parsedData.information.email;

    // Create Order
    // The OrderService uses the checkout session to retrieve all necessary data
    const order = await OrderService.placeOrder(
      cartId,
      userId || null,
      guestEmail || null,
      parsedData,
      checkoutSessionId
    );

    // Generate Payment Payload if necessary
    let paymentPayload = null;
    if (order.payment_method !== "COD") {
      const name = `${parsedData.information.shipping_address.first_name} ${parsedData.information.shipping_address.last_name}`;
      paymentPayload = OrderService.generatePaymentPayload(
        order,
        name,
        parsedData.information.email,
        parsedData.information.shipping_address.phone || ""
      );
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      paymentPayload,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
