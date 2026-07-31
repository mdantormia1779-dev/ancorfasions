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

export default function CheckoutFailedPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <StoreHeader />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="mb-16 mt-8 w-full max-w-md border-none shadow-lg">
          <CardHeader className="pt-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Payment Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-slate-600">
              We couldn't process your payment. This could be due to a declined
              card, insufficient funds, or a network error.
            </p>
            <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-left text-sm text-red-800">
              <strong>Common reasons for failure:</strong>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Incorrect card details or OTP.</li>
                <li>Your bank has blocked the transaction.</li>
                <li>Session timeout during authentication.</li>
              </ul>
            </div>
            <p className="text-sm text-slate-500">
              Don't worry! No money has been deducted from your account. Your
              items are still saved in your cart.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pb-8">
            <Button className="flex w-full items-center gap-2" size="lg">
              <RefreshCcw className="h-4 w-4" /> Try Payment Again
            </Button>
            <Link href="/cart" className="w-full">
              <Button
                variant="outline"
                className="flex w-full items-center gap-2"
                size="lg"
              >
                <ArrowLeft className="h-4 w-4" /> Return to Cart
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
      <StoreFooter />
    </div>
  );
}
