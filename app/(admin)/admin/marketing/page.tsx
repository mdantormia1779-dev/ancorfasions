'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Mail, 
  Smartphone, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  Plus,
  Play
} from 'lucide-react';
import Link from 'next/link';

export default function MarketingDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Automation</h1>
          <p className="text-muted-foreground mt-1">
            Drive growth with targeted campaigns and automated workflows.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Link href="/admin/marketing/automations">Manage Automations</Link>
          </Button>
          <Button>
            <Link href="/admin/marketing/campaigns">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marketing Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$124,592.00</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +14.5% attributed revenue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42.8%</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +2.1% from industry avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4%</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +0.8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              3 running, 9 scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Performance of your latest marketing pushes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Summer Clearance Final Call</p>
                  <p className="text-xs text-muted-foreground">Sent 2 days ago to VIP Segment</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">$14,500</div>
                  <div className="text-xs text-muted-foreground">48% Open</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Smartphone className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Flash Sale Push Notification</p>
                  <p className="text-xs text-muted-foreground">Sent 4 days ago to All App Users</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">$8,230</div>
                  <div className="text-xs text-muted-foreground">12% Click</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">New Fall Collection Preview</p>
                  <p className="text-xs text-muted-foreground">Sent 1 week ago to All Subscribers</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">$32,100</div>
                  <div className="text-xs text-muted-foreground">52% Open</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automation Triggers</CardTitle>
            <CardDescription>Always-on revenue drivers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <p className="text-sm font-medium">Abandoned Cart</p>
                  <p className="text-xs text-muted-foreground">Recovers ~15% of carts</p>
                </div>
                <Button variant="ghost" size="icon" className="text-emerald-500">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <p className="text-sm font-medium">Welcome Series</p>
                  <p className="text-xs text-muted-foreground">Onboards new signups</p>
                </div>
                <Button variant="ghost" size="icon" className="text-emerald-500">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <p className="text-sm font-medium">Post-Purchase Review</p>
                  <p className="text-xs text-muted-foreground">Drives UGC</p>
                </div>
                <Button variant="ghost" size="icon" className="text-emerald-500">
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
