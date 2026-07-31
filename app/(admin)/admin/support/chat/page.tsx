"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Bot,
  Paperclip,
  CheckCircle,
  Search,
  User,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const activeChats = [
  {
    id: "chat-1",
    customer: "Jessica Wong",
    status: "Active",
    lastMessage: "Is this available in size M?",
    time: "Just now",
    unread: true,
  },
  {
    id: "chat-2",
    customer: "Guest_9921",
    status: "Waiting",
    lastMessage: "Where is my order?",
    time: "2 mins ago",
    unread: true,
  },
  {
    id: "chat-3",
    customer: "Michael Scott",
    status: "Active",
    lastMessage: "Thanks, I will wait for it.",
    time: "5 mins ago",
    unread: false,
  },
];

export default function LiveChatInterfacePage() {
  const [activeChat, setActiveChat] = useState(activeChats[0]);
  const [message, setMessage] = useState("");

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 md:flex-row">
      {/* Sidebar: Chat List */}
      <Card className="flex h-full w-full flex-col overflow-hidden border-r md:w-80 md:rounded-r-none md:border-r-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b px-4 py-3">
          <CardTitle className="text-lg font-bold">Conversations</CardTitle>
          <Badge
            variant="outline"
            className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
          >
            You are Online
          </Badge>
        </CardHeader>
        <div className="border-b p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="h-9 bg-background pl-8"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {activeChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors",
                  activeChat.id === chat.id ? "bg-accent" : "hover:bg-muted"
                )}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {chat.customer.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {chat.unread && (
                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium">
                      {chat.customer}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {chat.time}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-1 truncate text-xs",
                      chat.unread
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {chat.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex h-full flex-1 flex-col overflow-hidden md:rounded-l-none">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {activeChat.customer.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold">{activeChat.customer}</h2>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
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
            <div className="my-4 flex flex-col items-center justify-center">
              <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                Chat Started at 10:42 AM
              </span>
            </div>

            <div className="flex gap-3">
              <Avatar className="mt-1 h-8 w-8">
                <AvatarFallback>
                  {activeChat.customer.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="max-w-[80%] rounded-lg rounded-tl-none bg-muted p-3 text-sm">
                Hi, I'm looking at the Silk Evening Gown. Is it available in
                size M? The website says low stock.
              </div>
            </div>

            <div className="flex flex-row-reverse gap-3">
              <Avatar className="mt-1 h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  ME
                </AvatarFallback>
              </Avatar>
              <div className="max-w-[80%] rounded-lg rounded-tr-none bg-primary p-3 text-sm text-primary-foreground">
                Hello Jessica! Let me check the inventory for you right away.
              </div>
            </div>

            <div className="flex flex-row-reverse gap-3">
              <Avatar className="mt-1 h-8 w-8 opacity-0">
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div className="max-w-[80%] rounded-lg rounded-tr-none border border-rose-500/20 bg-rose-500/10 p-3 font-mono text-xs text-rose-700">
                Internal Note: Customer is VIP. If out of stock, offer backorder
                with priority shipping.
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-card p-4">
          <div className="mb-2 flex items-center justify-between rounded-lg border bg-muted/50 p-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bot className="h-4 w-4 text-primary" />
              <span>
                AI Suggestion: "Yes, we have 2 left in size M in our main
                warehouse..."
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs text-primary"
            >
              Use
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message... (Use '/' for quick replies, '@' for internal notes)"
              className="h-11 min-h-[44px] resize-none py-3"
            />
            <Button size="icon" className="h-11 w-11 shrink-0">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Context Panel (Optional/Collapsible) */}
      <Card className="hidden h-full w-80 flex-col overflow-hidden lg:flex">
        <CardHeader className="border-b bg-muted/20 py-3">
          <CardTitle className="text-sm">Customer Context</CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" /> Profile Info
              </h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Email: jessica@example.com</p>
                <p>
                  Status:{" "}
                  <Badge variant="secondary" className="text-[10px]">
                    VIP
                  </Badge>
                </p>
                <p>Total Spent: $14,250</p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium">Recent Orders</h4>
              <div className="space-y-2">
                <div className="rounded border bg-card p-2 text-xs">
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
