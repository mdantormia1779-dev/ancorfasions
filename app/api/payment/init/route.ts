import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BKashService } from "@/lib/services/payment/bkash.service";

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
 *   Gateway -> customer pays -> callback/webhook -> verify & capture -> update order status
 *   Gateway -> redirect to /checkout/success or /checkout/failed
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");
  const method = url.searchParams.get("method");

  if (!orderId || !method) {
    return NextResponse.redirect(
      new URL("/checkout/failed?reason=missing_params", req.url)
    );
  }

  const supabase = await createClient();
  try {
    // 1. Fetch the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, order_number, total_amount, customer_email, customer_name, customer_phone, payment_method, status"
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error(
        "[Payment Init] Order not found:",
        orderId,
        orderError?.message
      );
      return NextResponse.redirect(
        new URL("/checkout/failed?reason=order_not_found", req.url)
      );
    }

    // 2. Only process if the order is in PENDING_PAYMENT state
    if (order.status !== "PENDING" && order.status !== "PENDING_PAYMENT" && order.status !== "pending_payment") {
      // Already processed, redirect to success
      return NextResponse.redirect(
        new URL(`/checkout/success?order_id=${orderId}`, req.url)
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // 3. Special handling for bKash Tokenized Checkout
    if (method.toUpperCase() === "BKASH") {
      const isConfigured = await BKashService.isConfigured();

      if (!isConfigured) {
        console.warn(
          "[Payment Init] bKash credentials not configured in environment or settings. Redirecting to success with notice."
        );
        return NextResponse.redirect(
          new URL(
            `/checkout/success?order_id=${orderId}&notice=payment_pending`,
            req.url
          )
        );
      }

      try {
        const paymentData = await BKashService.createPayment({
          orderId: order.id,
          orderNumber: order.order_number,
          amount: Number(order.total_amount),
          customerPhone: order.customer_phone,
          callbackUrl: `${appUrl}/api/payment/bkash/callback`,
        });

        // Store payment session & intent
        const { data: provider } = await supabase
          .from("payment_providers")
          .select("id")
          .eq("code", "bkash")
          .maybeSingle();

        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        await supabase.from("payment_sessions").insert({
          provider_id: provider?.id || null,
          order_id: order.id,
          amount: order.total_amount,
          currency: "BDT",
          status: "pending",
          gateway_url: paymentData.bkashURL,
          expires_at: expiresAt,
          metadata: {
            paymentID: paymentData.paymentID,
            orderNumber: order.order_number,
          },
        });

        await supabase
          .from("orders")
          .update({
            payment_intent_id: paymentData.paymentID,
            payment_method: "BKASH",
            payment_status: "PENDING",
          })
          .eq("id", order.id);

        return NextResponse.redirect(paymentData.bkashURL);
      } catch (bkashErr: any) {
        console.error("[Payment Init] bKash createPayment error:", bkashErr.message);
        return NextResponse.redirect(
          new URL(`/checkout/failed?order_id=${orderId}&reason=bkash_init_failed`, req.url)
        );
      }
    }

    // 4. Fetch gateway credentials for other methods (SSLCommerz, etc.)
    const { data: settingsRow } = await supabase
      .from("settings")
      .select("value")
      .eq("key", `payment_${method.toLowerCase()}`)
      .single();

    const credentials = settingsRow?.value as Record<string, string> | null;

    if (!credentials) {
      console.error(
        `[Payment Init] No credentials configured for method: ${method}`
      );
      return NextResponse.redirect(
        new URL(
          `/checkout/success?order_id=${orderId}&notice=payment_pending`,
          req.url
        )
      );
    }

    if (method === "SSLCOMMERZ") {
      /**
       * SSLCommerz Payment Integration
       * In a real integration, you would:
       * 1. POST to SSLCommerz's initiation URL with order details + credentials
       * 2. Get the GatewayPageURL from the response
       * 3. Redirect the customer to that URL
       *
       * API Docs: https://developer.sslcommerz.com/doc/v4/
       */
      const sslBase =
        credentials.sandbox === "true"
          ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
          : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

      const formData = new URLSearchParams();
      formData.append("store_id", credentials.store_id);
      formData.append("store_passwd", credentials.store_passwd);
      formData.append("total_amount", order.total_amount.toString());
      formData.append("currency", "BDT");
      formData.append("tran_id", order.order_number);
      formData.append(
        "success_url",
        `${appUrl}/api/webhooks/sslcommerz/success`
      );
      formData.append("fail_url", `${appUrl}/api/webhooks/sslcommerz/fail`);
      formData.append("cancel_url", `${appUrl}/api/webhooks/sslcommerz/cancel`);
      formData.append("cus_name", order.customer_name || order.customer_email || "Guest");
      formData.append("cus_email", order.customer_email || "guest@example.com");
      formData.append("cus_phone", order.customer_phone || "01700000000");
      formData.append("shipping_method", "NO");
      formData.append("product_name", "Clothing");
      formData.append("product_category", "Fashion");
      formData.append("product_profile", "general");

      const sslResponse = await fetch(sslBase, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const sslData = await sslResponse.json();
      if (sslData && sslData.GatewayPageURL) {
        return NextResponse.redirect(sslData.GatewayPageURL);
      }

      return NextResponse.redirect(
        new URL(`/checkout/failed?reason=ssl_init_failed`, req.url)
      );
    }

    if (method === "STRIPE") {
      const stripeRes = await fetch(
        "https://api.stripe.com/v1/checkout/sessions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${credentials.secret_key}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            "payment_method_types[0]": "card",
            "line_items[0][price_data][currency]": "bdt",
            "line_items[0][price_data][product_data][name]": `Order ${order.order_number}`,
            "line_items[0][price_data][unit_amount]": Math.round(
              order.total_amount * 100
            ).toString(),
            "line_items[0][quantity]": "1",
            mode: "payment",
            success_url: `${appUrl}/checkout/success?order_id=${order.id}`,
            cancel_url: `${appUrl}/checkout/failed?reason=cancelled`,
          }),
        }
      );

      const stripeData = await stripeRes.json();
      if (stripeData && stripeData.url) {
        return NextResponse.redirect(stripeData.url);
      }
      return NextResponse.redirect(
        new URL(`/checkout/failed?reason=stripe_init_failed`, req.url)
      );
    }

    if (method === "PAYPAL") {
      const paypalBase =
        credentials.sandbox === "true"
          ? "https://api-m.sandbox.paypal.com"
          : "https://api-m.paypal.com";
      const auth = Buffer.from(
        `${credentials.client_id}:${credentials.client_secret}`
      ).toString("base64");

      const tokenRes = await fetch(`${paypalBase}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });
      const { access_token } = await tokenRes.json();

      const orderRes = await fetch(`${paypalBase}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: (order.total_amount / 110).toFixed(2),
              },
            },
          ],
          application_context: {
            return_url: `${appUrl}/checkout/success?order_id=${order.id}`,
            cancel_url: `${appUrl}/checkout/failed?reason=cancelled`,
          },
        }),
      });
      const paypalData = await orderRes.json();
      const approveLink = paypalData.links?.find(
        (link: any) => link.rel === "approve"
      );
      if (approveLink) {
        return NextResponse.redirect(approveLink.href);
      }
      return NextResponse.redirect(
        new URL(`/checkout/failed?reason=paypal_init_failed`, req.url)
      );
    }

    if (method === "NAGAD") {
      // Nagad requires RSA signature for real implementation which requires a dedicated crypto module
      // This is a boilerplate redirect until the crypto utility is ready.
      return NextResponse.redirect(
        new URL(
          `/checkout/success?order_id=${orderId}&notice=nagad_pending_crypto`,
          req.url
        )
      );
    }

    // Unknown method
    return NextResponse.redirect(
      new URL(`/checkout/failed?reason=unknown_method`, req.url)
    );
  } catch (error: any) {
    console.error("[Payment Init] Unexpected error:", error);
    return NextResponse.redirect(
      new URL("/checkout/failed?reason=server_error", req.url)
    );
  }
}
