import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Wallet, Award, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { fetchAccountSummaryAction } from '@/app/actions/customer.actions';

export const metadata = {
  title: 'My Account | Anchor Fashion',
  description: 'Manage your enterprise customer account profile, orders, and wallet.',
};

export default async function AccountOverviewPage() {
  const response = await fetchAccountSummaryAction();
  const summary = response.data || {
    recentOrders: 0,
    walletBalance: 0,
    currency: 'BDT',
    loyaltyPoints: 0,
    loyaltyTier: 'MEMBER',
    supportTickets: 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">
          Here is a quick overview of your account, orders, and loyalty status.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.recentOrders}</div>
            <p className="text-xs text-muted-foreground">In the last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.walletBalance.toLocaleString('en-US', { style: 'currency', currency: summary.currency })}
            </div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Tier</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.loyaltyTier}</div>
            <p className="text-xs text-muted-foreground">{summary.loyaltyPoints} points available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.supportTickets}</div>
            <p className="text-xs text-muted-foreground">Active inquiries</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="font-medium">Order #ORD-8821</p>
                  <p className="text-sm text-muted-foreground">Delivered on Oct 12, 2026</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/account/orders">View</Link>
                </Button>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="font-medium">Wallet Refund</p>
                  <p className="text-sm text-muted-foreground">Credit of BDT 1,200.00</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/account/wallet">View</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="secondary" className="w-full justify-start">
              <Link href="/account/profile">Update Profile Information</Link>
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <Link href="/account/security">Change Password & Security</Link>
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <Link href="/account/loyalty">Redeem Loyalty Points</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
