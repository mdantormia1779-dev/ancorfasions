import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { fetchWalletAction } from '@/app/actions/customer.actions';

export const metadata = {
  title: 'Customer Wallet | Anchor Fashion',
};

export default async function WalletPage() {
  const { data } = await fetchWalletAction();
  const wallet = data || { balance: 0, currency: 'BDT' };
  const transactions = data?.transactions || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Wallet</h1>
        <p className="text-muted-foreground mt-2">
          View your store credit and transaction history. Use your wallet balance for faster checkout.
        </p>
      </div>

      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-primary-foreground/80 text-lg">Available Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold">
            {wallet.balance.toLocaleString('en-US', { style: 'currency', currency: wallet.currency })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent activity on your wallet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent transactions.</p>
            ) : (
              transactions.map((tx: any) => (
                <div key={tx.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{tx.description || tx.type}</p>
                    <p className="text-sm text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : ''}`}>
                    {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString('en-US', { style: 'currency', currency: wallet.currency })}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
