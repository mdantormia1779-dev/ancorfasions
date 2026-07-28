import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export type LoyaltyTier = 'SILVER' | 'GOLD' | 'PLATINUM' | 'VIP';

interface LoyaltyAccountsStat {
  tier: LoyaltyTier;
  benefits: string[];
  customerCount: number;
  minPoints: number;
  color: string;
}

interface LoyaltyTiersProps {
  tiers?: LoyaltyAccountsStat[];
}

export const LoyaltyTiers = ({ tiers = [] }: LoyaltyTiersProps) => {
  const totalCustomers = tiers.reduce((acc, tier) => acc + tier.customerCount, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {tiers.map((tier) => (
        <Card key={tier.tier} className="flex flex-col">
          <CardHeader className={`${tier.color} rounded-t-lg py-4`}>
            <CardTitle className="flex justify-between items-center text-lg">
              {tier.tier}
            </CardTitle>
            <CardDescription className="opacity-90 font-medium">
              {tier.minPoints.toLocaleString()}+ Points
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium mb-2">Benefits:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1 mb-6">
                {tier.benefits.map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2 mt-auto">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Members</span>
                <span className="font-medium">{tier.customerCount.toLocaleString()}</span>
              </div>
              <Progress value={totalCustomers === 0 ? 0 : (tier.customerCount / totalCustomers) * 100} className="h-2" />
              <p className="text-xs text-right text-muted-foreground">
                {totalCustomers === 0 ? "0.0" : ((tier.customerCount / totalCustomers) * 100).toFixed(1)}% of total
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
