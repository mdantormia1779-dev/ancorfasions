import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Clock, User, CheckCircle, Reply } from "lucide-react";
import Link from "next/link";
import { getTicketDetailsAction } from "@/app/actions/support/ticket.actions";

export default async function SupportTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: ticket, error } = await getTicketDetailsAction(id);

  if (error || !ticket) {
    return (
      <div className="p-8 text-red-500">
        Failed to load ticket details: {error || "Ticket not found"}
      </div>
    );
  }

  const customer = ticket.customer_profiles || {};
  const messages = ticket.ticket_messages || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Ticket {ticket.id.substring(0, 8)}
            </h1>
            <Badge variant="default" className="capitalize">
              {ticket.status.replace(/_/g, " ")}
            </Badge>
            <Badge
              variant={
                ticket.priority === "critical" ? "destructive" : "secondary"
              }
              className="capitalize"
            >
              {ticket.priority} Priority
            </Badge>
          </div>
          <p className="mt-1 text-lg text-muted-foreground">{ticket.subject}</p>
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {/* Conversation Thread */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {messages.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No messages yet.
                </div>
              ) : (
                messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex gap-4 ${msg.sender_type === "AGENT" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar>
                      {msg.sender_type === "AGENT" ? (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          A
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback>
                          {customer.first_name?.charAt(0) || "C"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div
                        className={`flex items-center justify-between ${msg.sender_type === "AGENT" ? "flex-row-reverse" : ""}`}
                      >
                        <span className="text-sm font-semibold">
                          {msg.sender_type === "AGENT"
                            ? "Support Agent"
                            : `${customer.first_name || "Customer"}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div
                        className={`rounded-lg p-4 text-sm ${msg.sender_type === "AGENT" ? "rounded-tr-none bg-primary text-primary-foreground" : "rounded-tl-none bg-slate-100 text-slate-800"}`}
                      >
                        {msg.body}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <Separator />
            <CardFooter className="pt-6">
              <div className="w-full space-y-4">
                <Textarea
                  placeholder="Type your reply to Michael..."
                  className="min-h-[100px]"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Add Internal Note
                    </Button>
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
                <span className="font-medium">
                  {ticket.assigned_agent_id ? "Assigned" : "Unassigned"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SLA Target</span>
                <span className="font-medium text-rose-500">
                  {ticket.sla_breach_at
                    ? new Date(ticket.sla_breach_at).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium capitalize">
                  {ticket.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="mb-2 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {customer.first_name?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {customer.email}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 pt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{customer.phone || "N/A"}</span>
                </div>
              </div>
              <Link href={`/admin/customers/${ticket.profile_id}`}>
                <Button variant="outline" className="mt-2 w-full" size="sm">
                  View Full Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {ticket.order_id ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="cursor-pointer font-medium text-blue-600 hover:underline">
                      Order {ticket.order_id}
                    </span>
                  </div>
                  <Button variant="secondary" className="mt-2 w-full" size="sm">
                    Open Order Details
                  </Button>
                </>
              ) : (
                <div className="text-muted-foreground">No related order.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
