import { OrderRepository } from '../repositories/order.repository';
import { CheckoutRepository } from '../repositories/checkout.repository';
import { CartService } from './cart.service';
import { CheckoutFormValues } from '@/schemas/checkout.schema';
import { Order, OrderItem, PaymentPayload } from '@/types/checkout.types';

export class OrderService {
  /**
   * Calculate Order Summary
   */
  static async calculateSummary(cartId: string, userId?: string | null): Promise<{
    subtotal: number;
    shipping_fee: number;
    discount_amount: number;
    total_amount: number;
  }> {
    const cart = await CartService.getOrCreateCart(userId, cartId);
    
    if (!cart || !cart.items) {
      return { subtotal: 0, shipping_fee: 0, discount_amount: 0, total_amount: 0 };
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.variant?.sale_price || item.variant?.price || item.product?.sale_price || item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    // Hardcoded shipping for now. Could be fetched from database zones.
    const shipping_fee = subtotal > 0 ? 100 : 0; 
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

    const summary = await this.calculateSummary(cartId, userId);

    // Generate Order Number
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `AF-${dateStr}-${randomStr}`;

    const orderData: Partial<Order> = {
      user_id: userId,
      session_id: guestEmail ? sessionId : null,
      order_number: orderNumber,
      status: checkoutData.payment.payment_method === 'COD' ? 'PROCESSING' : 'PENDING_PAYMENT',
      subtotal: summary.subtotal,
      shipping_fee: summary.shipping_fee,
      discount_amount: summary.discount_amount,
      total_amount: summary.total_amount,
      payment_method: checkoutData.payment.payment_method,
      notes: checkoutData.notes,
    };

    const orderItems: Partial<OrderItem>[] = cart.items.map(item => {
      const price = item.variant?.sale_price || item.variant?.price || item.product?.sale_price || item.product?.price || 0;
      return {
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: price,
        total_price: price * item.quantity,
        product_name: item.product?.title || 'Unknown Product',
        variant_name: item.variant?.sku ? `SKU: ${item.variant.sku}` : null,
        sku: item.variant?.sku || null,
      } as any;
    });

    const shippingAddress = checkoutData.information.shipping_address;
    const billingAddress = checkoutData.payment.billing_address_same_as_shipping 
      ? shippingAddress 
      : checkoutData.payment.billing_address!;

    // Create the order via repository
    const order = await OrderRepository.createOrder(orderData, orderItems, shippingAddress, billingAddress);

    // Clear the cart
    await CartService.clearCart(cart.id);

    // Delete the checkout session
    await CheckoutRepository.deleteSession(sessionId);

    return order;
  }

  /**
   * Prepare Payment Payload
   */
  static generatePaymentPayload(order: Order, customerName: string, customerEmail: string, customerPhone: string): PaymentPayload {
    return {
      order_id: order.id,
      order_number: order.order_number,
      amount: order.total_amount,
      currency: 'BDT',
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/success`,
      fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/fail`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/cancel`,
    };
  }
}
