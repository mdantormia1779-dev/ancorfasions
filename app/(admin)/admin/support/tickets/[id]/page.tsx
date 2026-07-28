import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Clock, User, CheckCircle, Reply } from "lucide-react";
import Link from "next/link";

export default async function SupportTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Ticket {id}</h1>
            <Badge variant="default">Open</Badge>
            <Badge variant="destructive">High Priority</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Subject: Order missing items
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Link href="/admin/support/tickets">← Back to Tickets</Link>
          </Button>
          <Button variant="default">
            <CheckCircle className="mr-2 h-4 w-4" /> Resolve Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Conversation Thread */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Message */}
              <div className="flex gap-4">
                <Avatar>
                  <AvatarFallback>MS</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Michael Scott (Customer)</span>
                    <span className="text-xs text-muted-foreground">Oct 24, 10:42 AM</span>
                  </div>
                  <div className="p-4 bg-slate-100 rounded-lg rounded-tl-none text-sm text-slate-800">
                    Hello, I received my order #8832 today but the blue dress I ordered is completely missing from the package! Can you please look into this? I need it for an event this weekend.
                  </div>
                </div>
              </div>

              {/* Agent Reply */}
              <div className="flex gap-4 flex-row-reverse">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">SJ</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center flex-row-reverse">
                    <span className="font-semibold text-sm">Sarah Jenkins (Support Agent)</span>
                    <span className="text-xs text-muted-foreground">Oct 24, 11:15 AM</span>
                  </div>
                  <div className="p-4 bg-primary text-primary-foreground rounded-lg rounded-tr-none text-sm">
                    Hi Michael, I am so sorry about that! Let me check the fulfillment records right now. It is possible it was split into two shipments. I will get back to you in just a moment.
                  </div>
                </div>
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="pt-6">
              <div className="w-full space-y-4">
                <Textarea 
                  placeholder="Type your reply to Michael..." 
                  className="min-h-[100px]"
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Add Internal Note</Button>
                  </div>
                  <Button className="flex items-center gap-2">
                    <Send className="h-4 w-4" /> Send Reply
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned To</span>
                <span className="font-medium">Sarah Jenkins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SLA Target</span>
                <span className="font-medium text-rose-500">Breaches in 2h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Channel</span>
                <span className="font-medium">Email</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tags</span>
                <span className="font-medium">Fulfillment, Missing</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>MS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Michael Scott</p>
                  <p className="text-xs text-muted-foreground">VIP Customer</p>
                </div>
              </div>
              <Separator />
              <div className="pt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Orders</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lifetime Value</span>
                  <span className="font-medium">$4,520.00</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-2" size="sm">
                View Full Profile
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-600 hover:underline cursor-pointer">Order #8832</span>
                <Badge variant="outline">Delivered</Badge>
              </div>
              <div className="text-muted-foreground">
                Placed on Oct 20, 2024
              </div>
              <Button variant="secondary" className="w-full mt-2" size="sm">
                Open Order Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
