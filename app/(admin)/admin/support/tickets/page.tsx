import Link from 'next/link';
import { getTicketsAction } from '@/app/actions/support/ticket.actions';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, MoreHorizontal, AlertCircle, Clock } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';



export default async function TicketManagementPage() {
  const { data: rawTickets, error } = await getTicketsAction();
  const tickets = rawTickets || [];

  if (error) {
    return <div className="p-8 text-red-500">Failed to load tickets: {error}</div>;
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer inquiries and technical issues.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="Search tickets by ID, subject, or customer..." className="max-w-md" />
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>
            Showing {tickets.length} open tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject / Customer</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium font-mono">{ticket.id.substring(0, 8)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{ticket.subject}</div>
                      <div className="text-xs text-muted-foreground">{ticket.customer_profiles?.first_name || 'Customer'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        ticket.priority === 'critical' ? 'destructive' :
                        ticket.priority === 'high' ? 'default' :
                        ticket.priority === 'medium' ? 'secondary' : 'outline'
                      } className="capitalize">
                        {ticket.priority}
                      </Badge>
                      {ticket.priority === 'critical' && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                        <div className="flex items-center text-[10px] text-rose-500 mt-1 font-bold">
                          <AlertCircle className="h-3 w-3 mr-1" /> SLA Risk
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{ticket.status.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {ticket.assigned_agent_id ? (
                          <>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px]">
                                {ticket.assigned_agent_id.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">Assigned</span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Unassigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(ticket.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/admin/support/tickets/${ticket.id}`}>
                            <DropdownMenuItem>View Ticket</DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem>Assign to me</DropdownMenuItem>
                          <DropdownMenuItem>Change Status</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Escalate</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
