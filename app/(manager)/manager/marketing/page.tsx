import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Tag, Zap, Mail, BellRing } from "lucide-react";

export const metadata: Metadata = {
  title: "Marketing | Manager Dashboard",
};

export default function MarketingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
          <p className="text-muted-foreground mt-1">
            Manage campaigns, discounts, and customer communications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Coupons</CardTitle>
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Tag className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Manage discount codes and auto-applied discounts.</p>
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Active: 5</span>
              <span className="text-indigo-600">Manage &rarr;</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Flash Sales</CardTitle>
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Zap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Schedule limited-time sales and countdowns.</p>
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Upcoming: 1</span>
              <span className="text-orange-600">Manage &rarr;</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Email Campaigns</CardTitle>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Mail className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Draft and schedule newsletters and promo emails.</p>
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Drafts: 2</span>
              <span className="text-blue-600">Manage &rarr;</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Push Notifications</CardTitle>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <BellRing className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Send alerts to customers with the mobile app/PWA.</p>
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Sent today: 0</span>
              <span className="text-green-600">Manage &rarr;</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-4">Active Campaigns</h2>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">Summer Clearance Sale</h3>
                <p className="text-sm text-muted-foreground">Up to 50% off on summer collections</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>
                <span className="text-sm text-muted-foreground">Ends in 2 days</span>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">Welcome Series - New Subscribers</h3>
                <p className="text-sm text-muted-foreground">Automated email drip campaign</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">Automated</Badge>
                <span className="text-sm text-muted-foreground">Ongoing</span>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
