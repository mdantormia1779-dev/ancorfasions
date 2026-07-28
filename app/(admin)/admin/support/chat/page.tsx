'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, Paperclip, CheckCircle, Search, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

const activeChats = [
  {
    id: 'chat-1',
    customer: 'Jessica Wong',
    status: 'Active',
    lastMessage: 'Is this available in size M?',
    time: 'Just now',
    unread: true,
  },
  {
    id: 'chat-2',
    customer: 'Guest_9921',
    status: 'Waiting',
    lastMessage: 'Where is my order?',
    time: '2 mins ago',
    unread: true,
  },
  {
    id: 'chat-3',
    customer: 'Michael Scott',
    status: 'Active',
    lastMessage: 'Thanks, I will wait for it.',
    time: '5 mins ago',
    unread: false,
  }
];

export default function LiveChatInterfacePage() {
  const [activeChat, setActiveChat] = useState(activeChats[0]);
  const [message, setMessage] = useState('');

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4">
      {/* Sidebar: Chat List */}
      <Card className="w-full md:w-80 flex flex-col h-full border-r md:rounded-r-none md:border-r-0 overflow-hidden">
        <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-bold">Conversations</CardTitle>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            You are Online
          </Badge>
        </CardHeader>
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-8 bg-background h-9" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {activeChats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors flex gap-3 items-start",
                  activeChat.id === chat.id ? "bg-accent" : "hover:bg-muted"
                )}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{chat.customer.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {chat.unread && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate text-sm">{chat.customer}</span>
                    <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className={cn(
                    "text-xs truncate mt-1",
                    chat.unread ? "font-medium text-foreground" : "text-muted-foreground"
                  )}>
                    {chat.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col h-full md:rounded-l-none overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-card">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{activeChat.customer.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold">{activeChat.customer}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Currently viewing: Fall Collection
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Resolve
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Create Ticket
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center my-4">
              <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                Chat Started at 10:42 AM
              </span>
            </div>

            <div className="flex gap-3">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback>{activeChat.customer.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="bg-muted p-3 rounded-lg rounded-tl-none max-w-[80%] text-sm">
                Hi, I'm looking at the Silk Evening Gown. Is it available in size M? The website says low stock.
              </div>
            </div>

            <div className="flex gap-3 flex-row-reverse">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback className="bg-primary text-primary-foreground">ME</AvatarFallback>
              </Avatar>
              <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-tr-none max-w-[80%] text-sm">
                Hello Jessica! Let me check the inventory for you right away.
              </div>
            </div>

            <div className="flex gap-3 flex-row-reverse">
              <Avatar className="h-8 w-8 mt-1 opacity-0">
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div className="bg-rose-500/10 text-rose-700 p-3 rounded-lg rounded-tr-none max-w-[80%] text-xs font-mono border border-rose-500/20">
                Internal Note: Customer is VIP. If out of stock, offer backorder with priority shipping.
              </div>
            </div>

          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-card">
          <div className="bg-muted/50 rounded-lg border p-2 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bot className="h-4 w-4 text-primary" />
              <span>AI Suggestion: "Yes, we have 2 left in size M in our main warehouse..."</span>
            </div>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-primary">Use</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message... (Use '/' for quick replies, '@' for internal notes)" 
              className="min-h-[44px] h-11 resize-none py-3"
            />
            <Button size="icon" className="shrink-0 h-11 w-11">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Context Panel (Optional/Collapsible) */}
      <Card className="hidden lg:flex flex-col w-80 h-full overflow-hidden">
        <CardHeader className="py-3 border-b bg-muted/20">
          <CardTitle className="text-sm">Customer Context</CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <User className="h-4 w-4" /> Profile Info
              </h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>Email: jessica@example.com</p>
                <p>Status: <Badge variant="secondary" className="text-[10px]">VIP</Badge></p>
                <p>Total Spent: $14,250</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2">Recent Orders</h4>
              <div className="space-y-2">
                <div className="text-xs p-2 border rounded bg-card">
                  <p className="font-bold">#ORD-9910</p>
                  <p className="text-muted-foreground">Delivered • $450.00</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
