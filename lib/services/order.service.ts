import { OrderRepository } from "../repositories/order.repository";
import { CheckoutRepository } from "../repositories/checkout.repository";
import { CartService } from "./cart.service";
import { CheckoutFormValues } from "@/schemas/checkout.schema";
import { Order, OrderItem, PaymentPayload, OrderStatus } from "@/types/checkout.types";

export class OrderService {
  /**
   * Calculate Order Summary
   */
  /**
   * Shipping fee lookup by method slug.
   * Keys must match the RadioGroup values in checkout-form.tsx.
   */
  private static readonly SHIPPING_FEES: Record<string, number> = {
    home_delivery: 100,          // Inside Dhaka
    home_delivery_outside: 150,  // Outside Dhaka
  };

  static async calculateSummary(
    cartId: string,
    userId?: string | null,
    shippingMethod?: string
  ): Promise<{
    subtotal: number;
    shipping_fee: number;
    discount_amount: number;
    total_amount: number;
  }> {
    const cart = await CartService.getOrCreateCart(userId, cartId);

    if (!cart || !cart.items) {
      return {
        subtotal: 0,
        shipping_fee: 0,
        discount_amount: 0,
        total_amount: 0,
      };
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price =
        item.variant?.sale_price ||
        item.variant?.price ||
        item.product?.sale_price ||
        item.product?.price ||
        0;
      return sum + price * item.quantity;
    }, 0);

    // Derive shipping fee from selected method; default to inside-Dhaka rate.
    const shipping_fee =
      subtotal > 0
        ? (this.SHIPPING_FEES[shippingMethod ?? "home_delivery"] ?? 100)
        : 0;
    const discount_amount = 0; // Coupon logic goes here

    const total_amount = subtotal + shipping_fee - discount_amount;

    return { subtotal, shipping_fee, discount_amount, total_amount };
  }

  /**
   * Place Order from Checkout Session
   */
  static async placeOrder(
    cartId: string,
    userId: string | null,
    guestEmail: string | null,
    checkoutData: CheckoutFormValues,
    sessionId: string
  ): Promise<Order> {
    const cart = await CartService.getOrCreateCart(userId, cartId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    const summary = await this.calculateSummary(
      cartId,
      userId,
      checkoutData.shipping.shipping_method
    );

    // Generate Order Number
    const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `AF-${dateStr}-${randomStr}`;

    const shippingAddr = checkoutData.information.shipping_address;
    const customerName = `${shippingAddr.first_name} ${shippingAddr.last_name}`.trim();
    const customerPhone = shippingAddr.phone || null;

    const orderData: Partial<Order> = {
      user_id: userId,
      // Store the checkout session ID so it can be cleaned up after payment.
      session_id: sessionId,
      order_number: orderNumber,
      // Use lowercase statuses to match the DB enum and dashboard queries.
      status: (checkoutData.payment.payment_method === "COD"
        ? "processing"
        : "pending_payment") as OrderStatus,
      subtotal: summary.subtotal,
      shipping_fee: summary.shipping_fee,
      discount_amount: summary.discount_amount,
      total_amount: summary.total_amount,
      payment_method: checkoutData.payment.payment_method,
      notes: checkoutData.notes,
    };

    const orderItems: Partial<OrderItem>[] = cart.items.map((item) => {
      const price =
        item.variant?.sale_price ||
        item.variant?.price ||
        item.product?.sale_price ||
        item.product?.price ||
        0;
      return {
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: price,
        total_price: price * item.quantity,
        product_name: item.product?.title || "Unknown Product",
        variant_name: item.variant?.sku ? `SKU: ${item.variant.sku}` : null,
        sku: item.variant?.sku || null,
      } as any;
    });

    const shippingAddress = checkoutData.information.shipping_address;
    const billingAddress = checkoutData.payment.billing_address_same_as_shipping
      ? shippingAddress
      : checkoutData.payment.billing_address!;

    // Create the order via repository
    const order = await OrderRepository.createOrder(
      orderData,
      orderItems,
      shippingAddress,
      billingAddress
    );

    // For COD orders, payment is confirmed at delivery — clear the cart immediately.
    // For digital payment methods (SSLCommerz, bKash, etc.) we leave the cart
    // intact until a payment webhook confirms the transaction, so customers can
    // retry if they abandon the payment gateway.
    if (checkoutData.payment.payment_method === "COD") {
      await CartService.clearCart(cart.id);
      await CheckoutRepository.deleteSession(sessionId);
    }

    return order;
  }

  /**
   * Prepare Payment Payload
   */
  static generatePaymentPayload(
    order: Order,
    customerName: string,
    customerEmail: string,
    customerPhone: string
  ): PaymentPayload {
    return {
      order_id: order.id,
      order_number: order.order_number,
      amount: order.total_amount,
      currency: "BDT",
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/success`,
      fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/fail`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/cancel`,
    };
  }
}
