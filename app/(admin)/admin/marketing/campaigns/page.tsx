'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, CalendarIcon, Wand2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CampaignBuilderPage() {
  const [aiGenerating, setAiGenerating] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campaign Builder</h1>
        <p className="text-muted-foreground mt-1">
          Create, schedule, and send targeted marketing campaigns.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input placeholder="e.g. Fall Collection Launch 2026" />
              </div>
              <div className="space-y-2">
                <Label>Target Segment</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option>All Customers</option>
                  <option>VIP Customers (LTV &gt; $10k)</option>
                  <option>Cart Abandoners (Last 7 Days)</option>
                  <option>Inactive (6+ Months)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Content</CardTitle>
                <CardDescription>Draft your email or push notification.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="bg-primary/5 text-primary border-primary/20">
                <Wand2 className="h-4 w-4 mr-2" />
                AI Generate
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email">
                <TabsList className="mb-4">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="push">Push Notification</TabsTrigger>
                </TabsList>
                <TabsContent value="email" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input placeholder="Discover the new Fall Collection..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Body</Label>
                    <Textarea 
                      placeholder="Write your email content here (HTML supported)..." 
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="push" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Push Title</Label>
                    <Input placeholder="Fall Collection is Live!" />
                  </div>
                  <div className="space-y-2">
                    <Label>Push Message</Label>
                    <Textarea 
                      placeholder="Tap to shop our exclusive new arrivals before they sell out." 
                      className="min-h-[100px]"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-sm">
                <div className="flex items-center gap-2 font-medium mb-2">
                  <Bot className="h-4 w-4" /> Gemini AI Suggestions
                </div>
                <p className="text-muted-foreground mb-4">
                  I can analyze your target segment and product catalog to write high-converting copy.
                </p>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full text-xs justify-start h-8">
                    Suggest subject lines for VIPs
                  </Button>
                  <Button variant="secondary" className="w-full text-xs justify-start h-8">
                    Draft a FOMO push notification
                  </Button>
                  <Button variant="secondary" className="w-full text-xs justify-start h-8">
                    Translate content to Spanish
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule & Send</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1">
                  <CalendarIcon className="mr-2 h-4 w-4" /> Schedule
                </Button>
                <Button className="flex-1">
                  <Send className="mr-2 h-4 w-4" /> Send Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
