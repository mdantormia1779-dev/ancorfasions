import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { fetchTicketDetailsAction } from '@/app/actions/customer.actions';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Paperclip, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export const metadata: Metadata = {
  title: 'Ticket Details | Anchor Fashion',
};

export default async function SupportTicketDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const res = await fetchTicketDetailsAction(id);
  if (!res.success || !res.data) {
    notFound();
  }

  const ticket = res.data;

  // Mock replies for now as they are not fully wired in DB schema in this context
  const replies = [
    {
      id: 'r1',
      message: ticket.description,
      is_staff: false,
      created_at: ticket.created_at,
    }
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/account/support"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight line-clamp-1">{ticket.subject}</h1>
        <Badge variant={ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'secondary' : 'default'} className="text-sm">
          {ticket.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {replies.map((reply) => (
            <div key={reply.id} className={`flex ${reply.is_staff ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-xl p-4 ${reply.is_staff ? 'bg-slate-100 dark:bg-slate-800' : 'bg-primary text-primary-foreground'}`}>
                <p className="text-sm">{reply.message}</p>
                <p className={`text-xs mt-2 ${reply.is_staff ? 'text-slate-500' : 'text-primary-foreground/70'}`}>
                  {new Date(reply.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
        {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
          <CardFooter className="flex-col gap-4 border-t pt-6">
            <Textarea placeholder="Type your reply here..." className="min-h-[100px]" />
            <div className="flex justify-between w-full">
              <Button variant="outline" type="button">
                <Paperclip className="w-4 h-4 mr-2" />
                Attach File
              </Button>
              <Button type="button">
                <Send className="w-4 h-4 mr-2" />
                Send Reply
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
