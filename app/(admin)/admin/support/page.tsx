'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Users
} from 'lucide-react';
import Link from 'next/link';

export default function SupportCommandCenterPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Command Center</h1>
          <p className="text-muted-foreground mt-1">
            Manage live chats, support tickets, and agent performance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Link href="/admin/support/tickets">View All Tickets</Link>
          </Button>
          <Button>
            <Link href="/admin/support/chat">Open Live Chat Agent</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              4 in queue waiting
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84</div>
            <p className="text-xs text-rose-500 flex items-center mt-1">
              <AlertTriangle className="mr-1 h-3 w-3" />
              12 SLA breached
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4h 12m</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              -15m from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents Online</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 / 15</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently handling 1.5 chats/avg
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Critical Tickets</CardTitle>
            <CardDescription>Tickets requiring immediate attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-rose-500/5 border-rose-500/20">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-rose-600">Order #8832 Missing Items</p>
                  <p className="text-xs text-muted-foreground">VIP Customer • Opened 2h ago</p>
                </div>
                <Button size="sm" variant="outline">Assign</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Payment Failed Twice</p>
                  <p className="text-xs text-muted-foreground">New Customer • Opened 4h ago</p>
                </div>
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Performance (Today)</CardTitle>
            <CardDescription>CSAT and resolution metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs">SA</div>
                  <div>
                    <p className="text-sm font-medium leading-none">Sarah Jenkins</p>
                    <p className="text-xs text-muted-foreground">42 resolved</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  4.8 <span className="text-yellow-500">★</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs">MR</div>
                  <div>
                    <p className="text-sm font-medium leading-none">Mike Ross</p>
                    <p className="text-xs text-muted-foreground">38 resolved</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  4.5 <span className="text-yellow-500">★</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
