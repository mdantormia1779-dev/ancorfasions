"use client";

import { useLoyaltyStore } from "@/stores/use-loyalty-store";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Lock, Unlock, CheckCircle2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function RewardsPage() {
  const { points, rewards, redeemReward } = useLoyaltyStore();

  const handleRedeem = (id: string, cost: number) => {
    if (points < cost) {
      toast.error("Not enough points to redeem this reward.");
      return;
    }
    redeemReward(id);
    toast.success("Reward redeemed successfully!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-[#1A1A1A]">Rewards Center</h1>
          <p className="mt-2 text-sm text-gray-500">
            Redeem your points for exclusive discounts and luxury gifts.
          </p>
        </div>
        <div className="bg-[#1A1A1A] text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest font-medium text-gray-400">Balance:</span>
          <span className="font-semibold text-lg text-[#C9A86A]">{points.toLocaleString()} pts</span>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium text-[#1A1A1A]">Available to Redeem</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rewards.filter(r => r.status === "available").map(reward => (
            <RewardCard 
              key={reward.id} 
              reward={reward} 
              canAfford={points >= reward.pointsCost} 
              onRedeem={() => handleRedeem(reward.id, reward.pointsCost)} 
            />
          ))}
          {rewards.filter(r => r.status === "available").length === 0 && (
            <p className="text-sm text-gray-500 italic col-span-full">No rewards currently available.</p>
          )}
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t border-gray-100">
        <h3 className="text-lg font-medium text-[#1A1A1A]">Locked Rewards</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rewards.filter(r => r.status === "locked").map(reward => (
            <RewardCard key={reward.id} reward={reward} canAfford={false} isLocked={true} />
          ))}
          {rewards.filter(r => r.status === "locked").length === 0 && (
            <p className="text-sm text-gray-500 italic col-span-full">No locked rewards.</p>
          )}
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t border-gray-100">
        <h3 className="text-lg font-medium text-[#1A1A1A]">Redeemed Rewards</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rewards.filter(r => r.status === "redeemed").map(reward => (
            <RewardCard key={reward.id} reward={reward} canAfford={false} isRedeemed={true} />
          ))}
          {rewards.filter(r => r.status === "redeemed").length === 0 && (
            <p className="text-sm text-gray-500 italic col-span-full">No rewards redeemed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RewardCard({ 
  reward, 
  canAfford, 
  isLocked = false, 
  isRedeemed = false,
  onRedeem
}: { 
  reward: any; 
  canAfford: boolean; 
  isLocked?: boolean; 
  isRedeemed?: boolean;
  onRedeem?: () => void;
}) {
  return (
    <Card className={cn(
      "flex flex-col transition-all duration-300 relative overflow-hidden",
      isLocked ? "opacity-60 bg-gray-50 border-gray-100 grayscale-[0.5]" : "border-gray-200 shadow-sm hover:shadow-md",
      isRedeemed ? "bg-[#fcfaf9] border-[#C9A86A]/20" : ""
    )}>
      <CardHeader className="pb-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold leading-tight text-[#1A1A1A] pr-4">{reward.title}</CardTitle>
          <div className="p-2 rounded-full bg-gray-100 text-gray-500">
            {isLocked ? <Lock className="h-4 w-4" /> : isRedeemed ? <CheckCircle2 className="h-4 w-4 text-[#C9A86A]" /> : <Gift className="h-4 w-4 text-[#1A1A1A]" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-4 flex-1">
        <p className="text-sm text-gray-500 leading-relaxed">{reward.description}</p>
      </CardContent>
      <CardFooter className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="font-semibold text-sm text-[#1A1A1A]">{reward.pointsCost.toLocaleString()} pts</span>
        {!isLocked && !isRedeemed && (
          <Button 
            size="sm" 
            disabled={!canAfford}
            onClick={onRedeem}
            className={cn(
              "text-xs uppercase tracking-widest font-bold",
              canAfford ? "bg-[#1A1A1A] text-white hover:bg-black" : "bg-gray-200 text-gray-400"
            )}
          >
            {canAfford ? "Redeem" : "Need Points"}
          </Button>
        )}
        {isLocked && <span className="text-xs uppercase tracking-widest font-semibold text-gray-400">Locked</span>}
        {isRedeemed && <span className="text-xs uppercase tracking-widest font-bold text-[#C9A86A]">Redeemed</span>}
      </CardFooter>
    </Card>
  );
}
