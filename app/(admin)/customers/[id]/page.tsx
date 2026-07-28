import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  // Mock data for admin dashboard
  const customer = {
    id: params.id,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+8801712345678',
    status: 'Active',
    walletBalance: 12500,
    loyaltyTier: 'VIP',
    loyaltyPoints: 12500,
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer: {customer.name}</h1>
          <p className="text-muted-foreground mt-2">{customer.email}</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">Reset Password</Button>
          <Button variant="destructive">Suspend Account</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{customer.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="default">{customer.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer Since</p>
              <p className="font-medium">Jan 12, 2024</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-3xl font-bold">BDT {customer.walletBalance.toLocaleString()}</p>
            </div>
            <div className="pt-4 border-t space-y-4">
              <div className="space-y-2">
                <Label>Adjust Balance</Label>
                <div className="flex space-x-2">
                  <Input type="number" placeholder="Amount" className="w-full" />
                  <Button variant="secondary">Add</Button>
                  <Button variant="outline">Deduct</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loyalty Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Tier</p>
              <p className="text-2xl font-bold text-primary">{customer.loyaltyTier}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Points</p>
              <p className="font-medium">{customer.loyaltyPoints}</p>
            </div>
            <div className="pt-4 border-t space-y-2">
              <Button variant="outline" className="w-full">Assign Coupon</Button>
              <Button variant="outline" className="w-full">Adjust Points</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Timeline</CardTitle>
          <CardDescription>Recent activity and orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 mt-2 bg-primary rounded-full" />
              <div>
                <p className="font-medium">Order #ORD-8821 Delivered</p>
                <p className="text-sm text-muted-foreground">Oct 12, 2026 - 14:30 PM</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 mt-2 bg-primary rounded-full" />
              <div>
                <p className="font-medium">Upgraded to VIP Tier</p>
                <p className="text-sm text-muted-foreground">Sep 01, 2026 - 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 mt-2 bg-muted-foreground rounded-full" />
              <div>
                <p className="font-medium">Account Created</p>
                <p className="text-sm text-muted-foreground">Jan 12, 2024 - 09:15 AM</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
