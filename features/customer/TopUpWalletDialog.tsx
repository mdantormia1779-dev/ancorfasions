"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Wallet, Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { topUpWalletAction } from "@/app/actions/customer.actions";

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export function TopUpWalletDialog() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("1000");
  const [paymentMethod, setPaymentMethod] = useState<string>("bKash");
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setAmount(num);
    }
  };

  const handleGenerateTestRef = () => {
    const prefix = paymentMethod.substring(0, 3).toUpperCase();
    const rand = Math.floor(10000000 + Math.random() * 90000000);
    setPaymentRef(`${prefix}-${rand}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || amount < 50) {
      toast.error("Minimum top-up amount is ৳50 BDT");
      return;
    }

    if (!paymentRef.trim()) {
      toast.error("Please enter the payment transaction reference ID or TrxID");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await topUpWalletAction({
        amount,
        paymentMethod,
        paymentRef: paymentRef.trim(),
      });

      if (res.success) {
        toast.success(`Successfully added ৳${amount.toLocaleString()} to your wallet!`);
        setOpen(false);
        setPaymentRef("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to process wallet top-up");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow"
      >
        <PlusCircle className="h-4 w-4" />
        Top Up Balance
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Top Up Customer Wallet</DialogTitle>
                  <DialogDescription className="text-xs">
                    Add funds instantly to your digital store balance.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-5 py-5">
              {/* Presets */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Select Amount (BDT)
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AMOUNTS.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant={amount === preset ? "default" : "outline"}
                      size="sm"
                      className={`text-xs font-semibold ${
                        amount === preset
                          ? "bg-primary text-primary-foreground shadow"
                          : "border-muted hover:bg-muted"
                      }`}
                      onClick={() => handleSelectPreset(preset)}
                    >
                      ৳{preset}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Top Up Amount (৳ BDT)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">
                    ৳
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    min="50"
                    step="10"
                    value={customAmount}
                    onChange={handleCustomChange}
                    className="pl-8 font-semibold text-lg"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Minimum top-up: ৳50. Maximum per transaction: ৳25,000.
                </p>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Payment Channel
                </Label>
                <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val || "bKash")}>
                  <SelectTrigger id="paymentMethod" className="h-10">
                    <SelectValue placeholder="Select payment channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bKash">bKash (Merchant / Personal)</SelectItem>
                    <SelectItem value="Nagad">Nagad Mobile Banking</SelectItem>
                    <SelectItem value="Rocket">Rocket (DBBL)</SelectItem>
                    <SelectItem value="Credit Card">Visa / Mastercard / AMEX</SelectItem>
                    <SelectItem value="Bank Transfer">Direct Bank Wire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            {/* Payment Reference ID */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="paymentRef" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  TrxID / Reference Code
                </Label>
                <button
                  type="button"
                  onClick={handleGenerateTestRef}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Generate TrxID
                </button>
              </div>
              <Input
                id="paymentRef"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. BK78291039 or TXN-4928"
                className="font-mono text-sm tracking-wide uppercase"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Enter the transaction ID received from your mobile banking or payment gateway confirmation SMS.
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-start gap-2 text-xs">
              <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Protected with atomic duplicate-credit prevention. Funds are credited securely and immediately available for checkout.
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !amount || amount < 50}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Crediting Wallet...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirm ৳{amount.toLocaleString()} Top-Up
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </>
);
}
