import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchWalletAction } from "@/app/actions/customer.actions";
import { TopUpWalletDialog } from "@/features/customer/TopUpWalletDialog";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";

export const metadata = {
  title: "Customer Wallet | Anchor Fashion",
};

export default async function WalletPage() {
  const { data } = await fetchWalletAction();
  const wallet = data || { balance: 0, currency: "BDT" };
  const transactions = data?.transactions || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Wallet</h1>
          <p className="mt-2 text-muted-foreground">
            View your store credit, top up balance, and track transaction history. Use your wallet
            balance for instant checkout.
          </p>
        </div>
        <div>
          <TopUpWalletDialog />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80 uppercase tracking-wider">
              Available Store Balance
            </CardTitle>
            <Wallet className="h-5 w-5 text-primary-foreground/80" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              ৳{Number(wallet.balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xl font-normal ml-2 opacity-80">{wallet.currency || "BDT"}</span>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none text-xs">
                Active & Verified
              </Badge>
              <span className="text-xs text-primary-foreground/75">
                Eligible for instant discounts & checkout
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between p-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Quick Action</h3>
            <p className="text-sm text-muted-foreground">
              Add credit to your account anytime via bKash, Nagad, Rocket or Card.
            </p>
          </div>
          <div className="pt-4">
            <TopUpWalletDialog />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All wallet top-ups, purchases, and reward conversions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No transactions recorded yet. Top up your balance to get started.
              </p>
            ) : (
              transactions.map((tx: any) => {
                const isCredit = (tx.type || "").toUpperCase() === "CREDIT";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full mt-0.5 ${isCredit ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"}`}>
                        {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {tx.description || (isCredit ? "Wallet Credit" : "Wallet Debit")}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleString()}
                          </span>
                          {tx.reference_type && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                              {tx.reference_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-sm ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                        {isCredit ? "+" : "-"}৳{Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                      {tx.balance_after != null && (
                        <p className="text-[11px] text-muted-foreground">
                          Bal: ৳{Number(tx.balance_after).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
