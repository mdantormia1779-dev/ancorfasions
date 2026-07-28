import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";

export default function CheckoutFailedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <StoreHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-lg mt-8 mb-16">
          <CardHeader className="text-center pt-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">
              We couldn't process your payment. This could be due to a declined card, insufficient funds, or a network error.
            </p>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-800 text-left">
              <strong>Common reasons for failure:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Incorrect card details or OTP.</li>
                <li>Your bank has blocked the transaction.</li>
                <li>Session timeout during authentication.</li>
              </ul>
            </div>
            <p className="text-sm text-slate-500">
              Don't worry! No money has been deducted from your account. Your items are still saved in your cart.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pb-8">
            <Button className="w-full flex items-center gap-2" size="lg">
              <RefreshCcw className="h-4 w-4" /> Try Payment Again
            </Button>
            <Link href="/cart" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2" size="lg">
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
