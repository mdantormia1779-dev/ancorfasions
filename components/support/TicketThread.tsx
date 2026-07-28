'use client';

import { TicketMessage } from '@/types/support.types';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function TicketThread({ messages }: { messages: TicketMessage[] }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-4 ${m.sender_type === 'AGENT' ? 'flex-row-reverse' : ''}`}>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">
                {m.sender_type === 'AGENT' ? 'AG' : m.sender_type === 'CUSTOMER' ? 'CU' : 'SY'}
              </AvatarFallback>
            </Avatar>
            <Card className={`max-w-[80%] ${m.is_internal_note ? 'bg-yellow-50 border-yellow-200' : ''}`}>
              <CardContent className="p-3 text-sm whitespace-pre-wrap">
                {m.message}
                <div className="mt-2 text-xs text-muted-foreground opacity-70 flex justify-between items-center">
                  <span>{new Date(m.created_at).toLocaleString()}</span>
                  {m.is_internal_note && <span className="font-semibold text-yellow-700">Internal Note</span>}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t space-y-4">
        <Textarea placeholder="Type your reply here..." className="min-h-[100px]" />
        <div className="flex justify-end gap-2">
          <Button variant="outline">Add Internal Note</Button>
          <Button>Send Reply</Button>
        </div>
      </div>
    </div>
  );
}
