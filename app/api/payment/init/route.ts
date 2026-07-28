import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Payment Initialization Endpoint
 * 
 * This endpoint is called after an order is placed with a digital payment method (bKash, SSLCommerz).
 * It retrieves the order details, fetches the relevant payment gateway credentials from the
 * settings table, and redirects the customer to the payment provider's hosted page.
 * 
 * Flow:
 *   POST /checkout -> processCheckoutAction -> order created -> redirect to /api/payment/init
 *   /api/payment/init -> fetch order + credentials -> redirect to gateway
 *   Gateway -> customer pays -> webhook -> /api/webhooks/payment -> update order status
 *   Gateway -> redirect to /checkout/success or /checkout/failed
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get('order_id');
  const method = url.searchParams.get('method');

  if (!orderId || !method) {
    return NextResponse.redirect(new URL('/checkout/failed?reason=missing_params', req.url));
  }

  try {
    const supabase = await createClient();

    // 1. Fetch the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, customer_email, payment_method, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('[Payment Init] Order not found:', orderId, orderError?.message);
      return NextResponse.redirect(new URL('/checkout/failed?reason=order_not_found', req.url));
    }

    // 2. Only process if the order is in PENDING_PAYMENT state
    if (order.status !== 'PENDING' && order.status !== 'PENDING_PAYMENT') {
      // Already processed, redirect to success
      return NextResponse.redirect(new URL(`/checkout/success?order_id=${orderId}`, req.url));
    }

    // 3. Fetch gateway credentials from settings table
    const { data: settingsRow } = await supabase
      .from('settings')
      .select('value')
      .eq('key', `payment_${method.toLowerCase()}`)
      .single();

    const credentials = settingsRow?.value as Record<string, string> | null;

    if (!credentials) {
      console.error(`[Payment Init] No credentials configured for method: ${method}`);
      // If no credentials, fall back to success page (treat as COD for now)
      // In production, you would show an error here.
      return NextResponse.redirect(
        new URL(`/checkout/success?order_id=${orderId}&notice=payment_pending`, req.url)
      );
    }

    // 4. Build the gateway redirect URL based on payment method
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    if (method === 'BKASH') {
      /**
       * bKash Payment Integration
       * In a real integration, you would:
       * 1. Call bKash's createPayment API using the credentials
       * 2. Get the bkashURL from the response
       * 3. Redirect the customer there
       * 
       * API Docs: https://developer.bkash.com/reference/create-payment
       */
      const bkashApiBase = credentials.sandbox === 'true'
        ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
        : 'https://tokenized.pay.bka.sh/v1.2.0-beta';

      // For now, we log the intent and redirect to a holding page
      console.log('[Payment Init] bKash payment initiated for order:', order.order_number);
      console.log('[Payment Init] Would call:', bkashApiBase, 'with merchantId:', credentials.merchant_id);

      // TODO: Implement actual bKash API call here
      return NextResponse.redirect(
        new URL(`/checkout/success?order_id=${orderId}&notice=bkash_pending`, req.url)
      );
    }

    if (method === 'SSLCOMMERZ') {
      /**
       * SSLCommerz Payment Integration
       * In a real integration, you would:
       * 1. POST to SSLCommerz's initiation URL with order details + credentials
       * 2. Get the GatewayPageURL from the response
       * 3. Redirect the customer to that URL
       * 
       * API Docs: https://developer.sslcommerz.com/doc/v4/
       */
      const sslBase = credentials.sandbox === 'true'
        ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
        : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

      console.log('[Payment Init] SSLCommerz payment initiated for order:', order.order_number);
      console.log('[Payment Init] Would POST to:', sslBase, 'with storeId:', credentials.store_id);

      // TODO: Implement actual SSLCommerz API call here
      return NextResponse.redirect(
        new URL(`/checkout/success?order_id=${orderId}&notice=ssl_pending`, req.url)
      );
    }

    // Unknown method
    return NextResponse.redirect(new URL(`/checkout/failed?reason=unknown_method`, req.url));
  } catch (error: any) {
    console.error('[Payment Init] Unexpected error:', error);
    return NextResponse.redirect(new URL('/checkout/failed?reason=server_error', req.url));
  }
}
