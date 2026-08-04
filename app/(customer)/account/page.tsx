"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Wallet, Award, Clock, Heart, TrendingUp, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLoyaltyStore } from "@/stores/use-loyalty-store";
import { TierBadge } from "@/components/customer/loyalty/tier-badges";

export default function AccountOverviewPage() {
  const { tier, points } = useLoyaltyStore();

  const summary = {
    recentOrders: 2,
    walletBalance: 12500,
    currency: "BDT",
    supportTickets: 0,
    savedItems: 14,
    monthlySpending: 24500,
    savingsThisYear: 3200,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-[#1A1A1A]">Welcome back, Alex!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Here is a quick overview of your account, orders, and loyalty status.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
          <Award className="h-4 w-4 text-[#C9A86A]" />
          <span className="text-sm font-medium text-[#1A1A1A]">{points.toLocaleString()} Points</span>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <TierBadge tier={tier} showIcon={false} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <InsightCard 
          title="Recent Orders" 
          value={summary.recentOrders} 
          subtitle="In the last 30 days" 
          icon={Package} 
        />
        <InsightCard 
          title="Monthly Spending" 
          value={summary.monthlySpending.toLocaleString("en-US", { style: "currency", currency: summary.currency })} 
          subtitle="+12% from last month" 
          icon={TrendingUp} 
        />
        <InsightCard 
          title="Wishlist" 
          value={summary.savedItems} 
          subtitle="Items saved for later" 
          icon={Heart} 
        />
        <InsightCard 
          title="Total Savings" 
          value={summary.savingsThisYear.toLocaleString("en-US", { style: "currency", currency: summary.currency })} 
          subtitle="Saved this year" 
          icon={Wallet} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium text-[#1A1A1A]">Recent Activity</CardTitle>
              <Link href="/account/orders" className="text-sm font-semibold uppercase tracking-widest text-gray-400 hover:text-[#1A1A1A] flex items-center">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <ActivityItem 
                title="Order #ORD-8821" 
                subtitle="Delivered on Oct 12, 2026" 
                amount="BDT 12,500.00" 
                status="Delivered" 
              />
              <ActivityItem 
                title="Loyalty Reward Redeemed" 
                subtitle="10% Off Order — Oct 10, 2026" 
                amount="-1,000 pts" 
                status="Redeemed" 
              />
              <ActivityItem 
                title="Wallet Refund" 
                subtitle="Credit applied — Oct 05, 2026" 
                amount="BDT 1,200.00" 
                status="Completed" 
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-[#1A1A1A] text-white border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-widest text-gray-400">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-lg border border-white/20">
                <CreditCard className="h-6 w-6 text-gray-300" />
                <div>
                  <p className="font-medium tracking-wider">•••• •••• •••• 4242</p>
                  <p className="text-xs text-gray-400">Expires 12/28</p>
                </div>
              </div>
              <Button variant="link" className="text-[#C9A86A] mt-4 px-0 h-auto font-medium">
                Manage Payment Methods
              </Button>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-[#1A1A1A]">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <QuickLink href="/account/loyalty" label="Loyalty & Rewards" />
              <QuickLink href="/account/referrals" label="Invite Friends" />
              <QuickLink href="/account/wishlist" label="My Collections" />
              <QuickLink href="/account/profile" label="Profile Settings" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ title, value, subtitle, icon: Icon }: any) {
  return (
    <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-widest text-gray-500">{title}</CardTitle>
        <Icon className="h-4 w-4 text-[#1A1A1A]/40" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-light tracking-tight text-[#1A1A1A]">{value}</div>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ title, subtitle, amount, status }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div>
        <p className="font-medium text-[#1A1A1A] group-hover:text-[#C9A86A] transition-colors">{title}</p>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="text-right">
        <p className="font-medium text-[#1A1A1A]">{amount}</p>
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mt-1">{status}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, label }: any) {
  return (
    <Link href={href} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
      <span className="text-sm font-medium text-gray-600 group-hover:text-[#1A1A1A]">{label}</span>
      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#1A1A1A]" />
    </Link>
  );
}
