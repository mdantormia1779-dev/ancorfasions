import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Gift, TrendingUp } from 'lucide-react';
import { fetchLoyaltyAction } from '@/app/actions/customer.actions';

export const metadata = {
  title: 'Loyalty Program | Anchor Fashion',
};

export default async function LoyaltyPage() {
  const { data } = await fetchLoyaltyAction();
  
  const getNextTier = (tier: string) => {
    switch (tier) {
      case 'MEMBER': return { name: 'SILVER', threshold: 1000 };
      case 'SILVER': return { name: 'GOLD', threshold: 5000 };
      case 'GOLD': return { name: 'PLATINUM', threshold: 10000 };
      case 'PLATINUM': return { name: 'VIP', threshold: 20000 };
      default: return { name: 'SILVER', threshold: 1000 };
    }
  };

  const loyalty = {
    tier: data?.tier || 'MEMBER',
    points: data?.points_balance || 0,
    nextTierPoints: getNextTier(data?.tier || 'MEMBER').threshold,
    nextTier: getNextTier(data?.tier || 'MEMBER').name
  };

  const progress = Math.min((loyalty.points / loyalty.nextTierPoints) * 100, 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loyalty Program</h1>
        <p className="text-muted-foreground mt-2">
          Earn points on every purchase and unlock exclusive rewards and tiers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Tier: {loyalty.tier}</CardTitle>
            <CardDescription>You are {loyalty.nextTierPoints - loyalty.points} points away from {loyalty.nextTier}.</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-4 mb-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{loyalty.points} pts</span>
              <span>{loyalty.nextTierPoints} pts</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{loyalty.points}</div>
            <p className="text-xs text-muted-foreground mt-2">Equals BDT {(loyalty.points * 0.5).toFixed(2)} in rewards</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tier Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className={`p-4 border rounded-lg text-center ${loyalty.tier === 'SILVER' ? 'bg-muted border-primary' : 'bg-muted/50'}`}>
              <p className="font-bold">SILVER</p>
              <p className="text-xs text-muted-foreground">1,000 - 4,999 pts</p>
              <ul className="text-sm mt-4 space-y-2 text-left">
                <li>• 1 point per BDT 100</li>
                <li>• Birthday discount</li>
              </ul>
            </div>
            <div className={`p-4 border rounded-lg text-center ${loyalty.tier === 'GOLD' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-yellow-500/5 border-yellow-500/20'}`}>
              <p className="font-bold text-yellow-700">GOLD {loyalty.tier === 'GOLD' ? '(Current)' : ''}</p>
              <p className="text-xs text-muted-foreground">5,000 - 9,999 pts</p>
              <ul className="text-sm mt-4 space-y-2 text-left">
                <li>• 1.5 points per BDT 100</li>
                <li>• Free standard shipping</li>
                <li>• Early access to sales</li>
              </ul>
            </div>
            <div className={`p-4 border rounded-lg text-center ${loyalty.tier === 'PLATINUM' ? 'border-primary shadow-sm' : 'opacity-70'}`}>
              <p className="font-bold">PLATINUM</p>
              <p className="text-xs text-muted-foreground">10,000 - 19,999 pts</p>
              <ul className="text-sm mt-4 space-y-2 text-left">
                <li>• 2 points per BDT 100</li>
                <li>• Free express shipping</li>
                <li>• VIP Support</li>
              </ul>
            </div>
            <div className={`p-4 border rounded-lg text-center ${loyalty.tier === 'VIP' ? 'bg-primary text-primary-foreground' : 'opacity-70'}`}>
              <p className="font-bold">VIP</p>
              <p className="text-xs text-muted-foreground">20,000+ pts</p>
              <ul className="text-sm mt-4 space-y-2 text-left">
                <li>• 3 points per BDT 100</li>
                <li>• Personal Stylist</li>
                <li>• Exclusive events</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
