import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Tag, Zap, Mail, BellRing } from "lucide-react";

export const metadata: Metadata = {
  title: "Marketing | Manager Dashboard",
};

export default function MarketingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
          <p className="mt-1 text-muted-foreground">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="cursor-pointer transition-colors hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Coupons</CardTitle>
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
              <Tag className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Manage discount codes and auto-applied discounts.
            </p>
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Active: 5</span>
              <span className="text-indigo-600">Manage &rarr;</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Flash Sales</CardTitle>
            <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
              <Zap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Schedule limited-time sales and countdowns.
            </p>
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Upcoming: 1</span>
              <span className="text-orange-600">Manage &rarr;</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Email Campaigns
            </CardTitle>
            <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
              <Mail className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Draft and schedule newsletters and promo emails.
            </p>
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Drafts: 2</span>
              <span className="text-blue-600">Manage &rarr;</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Push Notifications
            </CardTitle>
            <div className="rounded-lg bg-green-100 p-2 text-green-600">
              <BellRing className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Send alerts to customers with the mobile app/PWA.
            </p>
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Sent today: 0</span>
              <span className="text-green-600">Manage &rarr;</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-4 text-xl font-bold">Active Campaigns</h2>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            <div className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium">Summer Clearance Sale</h3>
                <p className="text-sm text-muted-foreground">
                  Up to 50% off on summer collections
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant="default"
                  className="bg-green-500 hover:bg-green-600"
                >
                  Active
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Ends in 2 days
                </span>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium">
                  Welcome Series - New Subscribers
                </h3>
                <p className="text-sm text-muted-foreground">
                  Automated email drip campaign
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">Automated</Badge>
                <span className="text-sm text-muted-foreground">Ongoing</span>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
