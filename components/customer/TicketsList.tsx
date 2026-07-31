'use client';

import { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createTicketAction } from '@/app/actions/customer.actions';
import { MessageSquare } from 'lucide-react';

export function TicketsList({ initialTickets }: { initialTickets: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await createTicketAction(formData);
        toast.success('Support ticket created successfully');
        setIsOpen(false);
      } catch (error) {
        toast.error('Failed to create ticket');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button>Open New Ticket</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Open Support Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" required placeholder="Brief description of the issue" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" required placeholder="Provide details about your issue..." rows={5} />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {initialTickets.length === 0 ? (
          <div className="text-center py-12 border rounded-xl border-dashed">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">You don't have any support tickets yet.</p>
          </div>
        ) : (
          initialTickets.map(ticket => (
            <Card key={ticket.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3 flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                  <CardDescription>Ticket #{ticket.id.split('-')[0]}</CardDescription>
                </div>
                <Badge variant={ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'secondary' : 'default'}>
                  {ticket.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Opened on {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="pt-0 justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/account/support/${ticket.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
