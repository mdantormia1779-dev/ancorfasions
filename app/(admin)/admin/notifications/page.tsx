'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Mail, Smartphone, Plus } from 'lucide-react';

const mockTemplates = [
  { id: '1', name: 'welcome_email', type: 'TRANSACTIONAL', channels: ['email'], active: true },
  { id: '2', name: 'abandoned_cart_reminder', type: 'MARKETING', channels: ['email', 'push'], active: true },
  { id: '3', name: 'system_outage_alert', type: 'SYSTEM', channels: ['in_app', 'email'], active: false },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Notification Center</h1>
          <p className="text-muted-foreground mt-1">Manage omnichannel communication templates and routing.</p>
        </div>
        <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-transform hover:scale-105">
          <Plus className="mr-2 h-4 w-4" /> New Template
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent (30d)</CardTitle>
            <Mail className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231</div>
            <p className="text-xs text-muted-foreground">98.2% Delivery Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Push Notifications</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,045</div>
            <p className="text-xs text-muted-foreground">14% Click-through</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In-App Alerts</CardTitle>
            <Bell className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89,400</div>
            <p className="text-xs text-muted-foreground">45% Read Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
          <CardDescription>Configure how notifications are presented across channels.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Channels</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTemplates.map((template) => (
                  <TableRow key={template.id} className="hover:bg-accent/50 transition-colors">
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <span className="text-xs font-medium px-2 py-1 rounded bg-muted">
                        {template.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {template.channels.map(c => (
                          <span key={c} className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            {c.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${template.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                        {template.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="hover:text-primary">
                        Edit
                      </Button>
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
