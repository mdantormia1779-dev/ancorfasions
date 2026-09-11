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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Gift, Sparkles, Loader2, CheckCircle2, Wallet, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { redeemLoyaltyPointsAction } from "@/app/actions/customer.actions";
import Link from "next/link";

interface RewardOption {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  creditWallet: boolean;
  walletCreditAmount?: number;
}

const REWARD_OPTIONS: RewardOption[] = [
  {
    id: "rw-wallet-50",
    title: "৳50 Store Credit (Instant Wallet Top-up)",
    description: "Convert points directly to ৳50 store balance credited to your customer wallet.",
    pointsCost: 500,
    creditWallet: true,
    walletCreditAmount: 50,
  },
  {
    id: "rw-wallet-120",
    title: "৳120 Store Credit (Instant Wallet Top-up)",
    description: "Convert points directly to ৳120 store balance credited to your customer wallet.",
    pointsCost: 1000,
    creditWallet: true,
    walletCreditAmount: 120,
  },
  {
    id: "rw-wallet-350",
    title: "৳350 Premium Credit (Instant Wallet Top-up)",
    description: "Exclusive bonus exchange: Convert points directly to ৳350 store balance.",
    pointsCost: 2500,
    creditWallet: true,
    walletCreditAmount: 350,
  },
  {
    id: "rw-shipping",
    title: "Free Express Delivery Voucher",
    description: "100% discount voucher code on premium express shipping across Bangladesh.",
    pointsCost: 300,
    creditWallet: false,
  },
  {
    id: "rw-discount-15",
    title: "15% Off Any Fashion Item",
    description: "A one-time 15% discount promotional code for your next online order.",
    pointsCost: 1500,
    creditWallet: false,
  },
];

export function RedeemRewardsDialog({
  userPoints = 0,
  triggerClassName,
}: {
  userPoints?: number;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<RewardOption>(REWARD_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voucherResult, setVoucherResult] = useState<{
    code: string;
    walletCredited?: boolean;
    rewardTitle: string;
  } | null>(null);
  const router = useRouter();

  const handleRedeem = async () => {
    if (userPoints < selectedOption.pointsCost) {
      toast.error(
        `Insufficient points! You need ${selectedOption.pointsCost.toLocaleString()} pts, but have ${userPoints.toLocaleString()} pts.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await redeemLoyaltyPointsAction({
        points: selectedOption.pointsCost,
        rewardTitle: selectedOption.title,
        creditWallet: selectedOption.creditWallet,
        walletCreditAmount: selectedOption.walletCreditAmount,
      });

      if (res.success && res.data) {
        setVoucherResult({
          code: res.data.voucherCode,
          walletCredited: res.data.walletCredited,
          rewardTitle: selectedOption.title,
        });
        toast.success("Points successfully redeemed!");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to redeem points");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Voucher code copied to clipboard!");
  };

  const handleReset = () => {
    setVoucherResult(null);
    setOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={
          triggerClassName ||
          "w-full bg-[#1A1A1A] hover:bg-black text-white font-semibold uppercase tracking-widest h-12"
        }
      >
        <Gift className="mr-2 h-4 w-4" /> Redeem Rewards
      </Button>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setVoucherResult(null);
        }}
      >
        <DialogContent className="sm:max-w-[540px]">
        {voucherResult ? (
          <div className="py-6 space-y-5 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <DialogTitle className="text-xl">Reward Redeemed Successfully!</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                {voucherResult.rewardTitle}
              </DialogDescription>
            </div>

            {voucherResult.walletCredited && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-center gap-2">
                <Wallet className="h-4 w-4" />
                <span>
                  Your customer wallet has been credited directly with store balance!
                </span>
              </div>
            )}

            <div className="p-4 bg-muted/60 border rounded-lg space-y-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Your Reward Voucher Code
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xl font-bold tracking-widest text-primary">
                  {voucherResult.code}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5"
                  onClick={() => handleCopy(voucherResult.code)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Apply this voucher code during checkout or view in your account.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" onClick={handleReset}>
                Done
              </Button>
              <Button asChild>
                <Link href="/account/wallet">
                  <Wallet className="mr-2 h-4 w-4" /> View Wallet
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-amber-500/10 text-amber-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">Redeem Loyalty Points</DialogTitle>
                    <DialogDescription className="text-xs">
                      Exchange your points for store credit vouchers and gifts.
                    </DialogDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {userPoints.toLocaleString()} PTS Available
                </Badge>
              </div>
            </DialogHeader>

            <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto pr-1">
              {REWARD_OPTIONS.map((opt) => {
                const canAfford = userPoints >= opt.pointsCost;
                const isSelected = selectedOption.id === opt.id;

                return (
                  <Card
                    key={opt.id}
                    onClick={() => setSelectedOption(opt)}
                    className={`p-3.5 cursor-pointer transition-all border ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm leading-tight">{opt.title}</h4>
                          {opt.creditWallet && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 py-0"
                            >
                              Wallet Credit
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {opt.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm font-bold block ${
                            canAfford ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {opt.pointsCost.toLocaleString()} PTS
                        </span>
                        <span
                          className={`text-[10px] uppercase font-semibold ${
                            canAfford ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                          }`}
                        >
                          {canAfford ? "Available" : "Need pts"}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleRedeem}
                disabled={isSubmitting || userPoints < selectedOption.pointsCost}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redeeming...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4" />
                    Redeem for {selectedOption.pointsCost.toLocaleString()} PTS
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </>
);
}
