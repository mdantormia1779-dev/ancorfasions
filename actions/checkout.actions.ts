"use server";

import { CheckoutService } from "@/services/checkout.service";
import { OrderService } from "@/services/order.service";
import {
  CheckoutInformationFormValues,
  CheckoutPaymentFormValues,
  CheckoutShippingFormValues,
} from "@/schemas/checkout.schema";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id;
}

export async function initializeCheckoutSessionAction(
  cartId: string,
  guestEmail?: string
) {
  const userId = await getUserId();
  const checkoutService = new CheckoutService();
  return await checkoutService.initializeSession(cartId, userId, guestEmail);
}

export async function processInformationAction(
  sessionId: string,
  data: CheckoutInformationFormValues
) {
  const checkoutService = new CheckoutService();
  await checkoutService.processInformationStep(sessionId, data);
  revalidatePath("/checkout");
}

export async function processShippingAction(
  sessionId: string,
  data: CheckoutShippingFormValues
) {
  const checkoutService = new CheckoutService();
  await checkoutService.processShippingStep(sessionId, data);
  revalidatePath("/checkout");
}

export async function processPaymentAction(
  sessionId: string,
  data: CheckoutPaymentFormValues
) {
  const checkoutService = new CheckoutService();
  const session = await checkoutService.getSession(sessionId);
  if (!session) throw new Error("Session not found");

  await checkoutService.processPaymentStep(
    sessionId,
    data,
    session.shipping_address_snapshot
  );
  revalidatePath("/checkout");
}

export async function placeOrderAction(sessionId: string) {
  const userId = await getUserId();
  const orderService = new OrderService();

  try {
    const order = await orderService.placeOrder(sessionId, userId);

    // Prepare payment based on method (Mock)
    if (order.payment_method !== "COD") {
      // Return a prepared payload that the frontend could use to redirect to payment gateway
      const payload = orderService.preparePaymentPayload(
        order,
        `https://anchorfashion.com/checkout/success?order=${order.order_number}`,
        `https://anchorfashion.com/checkout?failed=true`,
        `https://anchorfashion.com/checkout`
      );
      // We can return this to the client
      return { success: true, order, paymentPayload: payload };
    }

    return { success: true, order };
  } catch (error) {
    console.error("Failed to place order:", error);
    return { success: false, error: "Failed to place order" };
  }
}

export async function processCheckoutAction(
  cartId: string,
  sessionId: string,
  data: any
) {
  const checkoutService = new CheckoutService();
  const userId = await getUserId();

  try {
    // 1. Initialize session if not exist (or just use existing)
    // 2. Process Information
    await checkoutService.processInformationStep(sessionId, data.information);

    // 3. Process Shipping
    await checkoutService.processShippingStep(sessionId, data.shipping);

    // 4. Process Payment
    const session = await checkoutService.getSession(sessionId);
    await checkoutService.processPaymentStep(
      sessionId,
      data.payment,
      session?.shipping_address_snapshot
    );

    // 5. Place Order
    const result = await placeOrderAction(sessionId);

    return {
      success: result.success,
      orderId: result.order?.id,
      orderNumber: result.order?.order_number,
      paymentPayload: result.paymentPayload,
      error: result.error,
    };
  } catch (error) {
    console.error("Checkout processing failed:", error);
    return { success: false, error: "Failed to process checkout" };
  }
}
