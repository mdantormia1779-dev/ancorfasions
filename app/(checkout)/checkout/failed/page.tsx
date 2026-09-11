import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";

export default async function CheckoutFailedPage({
  searchParams,
}: {
  searchParams: { order_id?: string; reason?: string; message?: string };
}) {
  const { order_id, reason, message } = await searchParams;

  const isCancelled =
    reason === "payment_cancelled" ||
    reason === "cancel" ||
    message?.toLowerCase().includes("cancel");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <StoreHeader />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="mb-16 mt-8 w-full max-w-md border-none shadow-lg">
          <CardHeader className="pt-8 text-center">
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                isCancelled ? "bg-amber-100" : "bg-red-100"
              }`}
            >
              <AlertCircle
                className={`h-8 w-8 ${
                  isCancelled ? "text-amber-600" : "text-red-600"
                }`}
              />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {isCancelled ? "Payment Cancelled" : "Payment Incomplete"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-slate-600">
              {isCancelled
                ? "You cancelled the payment transaction. No amount was charged to your bKash wallet."
                : message ||
                  "We couldn't process your payment. This could be due to insufficient wallet balance, network timeout, or cancelled authorization."}
            </p>
            {reason && !isCancelled && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-left text-xs font-mono text-red-800">
                <strong>Error details:</strong> {reason}
              </div>
            )}
            <p className="text-sm text-slate-500">
              Don&apos;t worry! Your items are still safely saved in your shopping bag.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pb-8">
            {order_id ? (
              <Button asChild className="flex w-full items-center gap-2" size="lg">
                <Link href={`/api/payment/init?order_id=${order_id}&method=BKASH`}>
                  <RefreshCcw className="h-4 w-4" /> Retry bKash Payment
                </Link>
              </Button>
            ) : (
              <Button asChild className="flex w-full items-center gap-2" size="lg">
                <Link href="/checkout">
                  <RefreshCcw className="h-4 w-4" /> Return to Checkout
                </Link>
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              className="flex w-full items-center gap-2"
              size="lg"
            >
              <Link href="/cart">
                <ArrowLeft className="h-4 w-4" /> Return to Bag
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
      <StoreFooter />
    </div>
  );
}
