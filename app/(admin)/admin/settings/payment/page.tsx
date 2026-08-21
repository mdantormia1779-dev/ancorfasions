import { Metadata } from "next";
import { PaymentClient } from "./payment-client";
import { getPaymentConfig } from "@/lib/actions/payment.actions";

export const metadata: Metadata = {
  title: "Payment Settings | Admin",
};

export default async function PaymentSettingsPage() {
  const sslcommerz = await getPaymentConfig("sslcommerz");
  const cod = await getPaymentConfig("cod");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Gateways</h1>
        <p className="mt-1 text-muted-foreground">
          Manage how your customers pay for their orders.
        </p>
      </div>

      <PaymentClient initialSslcommerz={sslcommerz} initialCod={cod} />
    </div>
  );
}
