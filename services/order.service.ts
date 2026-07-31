import { OrderRepository } from "@/repositories/order.repository";
import { CartService } from "./cart.service";
import { CheckoutService } from "./checkout.service";
import { InventoryService } from "./inventory.service";
import { WarehouseService } from "./warehouse.service";
import {
  Order,
  OrderAddress,
  OrderItem,
  PaymentPayload,
} from "@/types/checkout.types";

export class OrderService {
  private orderRepository: OrderRepository;
  private cartService: CartService;
  private checkoutService: CheckoutService;
  private inventoryService: InventoryService;
  private warehouseService: WarehouseService;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.cartService = new CartService();
    this.checkoutService = new CheckoutService();
    this.inventoryService = new InventoryService();
    this.warehouseService = new WarehouseService();
  }

  /**
   * Generate an order number
   */
  private generateOrderNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `AF-${date}-${random}`;
  }

  /**
   * Place an order
   */
  async placeOrder(sessionId: string, userId?: string): Promise<Order> {
    const session = await this.checkoutService.getSession(sessionId);
    if (!session) throw new Error("Invalid session");
    if (
      !session.shipping_address_snapshot ||
      !session.billing_address_snapshot ||
      !session.payment_method
    ) {
      throw new Error("Incomplete checkout session");
    }

    const cart = await this.cartService.getCart(session.cart_id);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error("Cart is empty or not found");
    }

    // 1. Calculate Totals
    let subtotal = 0;
    const orderItems: Partial<OrderItem>[] = [];

    for (const item of cart.items) {
      if (!item.product) continue;

      const price =
        item.variant?.sale_price ||
        item.variant?.price ||
        item.product.sale_price ||
        item.product.price ||
        0;
      const itemTotal = price * item.quantity;

      subtotal += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: price,
        total_price: itemTotal,
      });
    }

    const shippingFee =
      session.shipping_method === "home_delivery_outside" ? 150 : 100;
    const discountAmount = 0; // Coupon logic
    const taxAmount = subtotal * 0.15;
    const totalAmount = subtotal + shippingFee + taxAmount - discountAmount;

    const orderNumber = this.generateOrderNumber();
    const idempotencyKey = `order-${sessionId}`;

    const orderData: Partial<Order> = {
      user_id: userId,
      session_id: sessionId,
      order_number: orderNumber,
      status: "PENDING_PAYMENT",
      idempotency_key: idempotencyKey,
      subtotal,
      shipping_fee: shippingFee,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      payment_method: session.payment_method,
      risk_level: "LOW",
    };

    const shippingAddress: Partial<OrderAddress> = {
      ...session.shipping_address_snapshot,
      address_type: "SHIPPING",
    };

    const billingAddress: Partial<OrderAddress> = {
      ...session.billing_address_snapshot,
      address_type: "BILLING",
    };

    // 2. Create Order
    const order = await this.orderRepository.createOrder(
      orderData,
      orderItems,
      shippingAddress,
      billingAddress
    );

    // 3. Reserve Stock
    const defaultWarehouse = await this.warehouseService.getDefaultWarehouse();
    const warehouseId =
      defaultWarehouse?.id || "00000000-0000-0000-0000-000000000001";

    for (const item of cart.items) {
      if (!item.product) continue;
      try {
        await this.inventoryService.reserveStock(
          item.variant_id || item.product_id || "",
          warehouseId,
          item.quantity
        );
      } catch (error) {
        console.error(
          `Failed to reserve stock for variant ${item.variant_id}`,
          error
        );
      }
    }

    // 4. Clear Cart & Delete Session
    await this.cartService.clearCart(cart.id);
    await this.checkoutService.deleteSession(sessionId);

    return order;
  }

  /**
   * Prepare Payment Payload
   * Generates a secure payload object depending on provider
   */
  preparePaymentPayload(
    order: Order,
    successUrl: string,
    failUrl: string,
    cancelUrl: string
  ): PaymentPayload {
    // In a real application, you would sign this payload or generate a token using the provider's SDK
    const customerName = order.shipping_address
      ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
      : "Guest";

    const customerEmail =
      order.shipping_address?.email || "customer@example.com";
    const customerPhone = order.shipping_address?.phone || "01XXXXXXXXX";

    return {
      order_id: order.id,
      order_number: order.order_number,
      amount: order.total_amount,
      currency: "BDT",
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
    };
  }
}
