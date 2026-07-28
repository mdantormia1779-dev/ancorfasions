"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, UserX, Activity, Lock } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

// Mock interfaces
interface SecurityEvent {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  user: string;
  ip: string;
  timestamp: string;
}

const mockEvents: SecurityEvent[] = [
  { id: "1", type: "Failed Login Attempt", severity: "medium", user: "unknown@example.com", ip: "192.168.1.10", timestamp: "2 mins ago" },
  { id: "2", type: "Multiple Failed Logins", severity: "high", user: "admin@anchor.com", ip: "10.0.0.45", timestamp: "15 mins ago" },
  { id: "3", type: "Role Changed to Admin", severity: "critical", user: "system", ip: "127.0.0.1", timestamp: "1 hour ago" },
  { id: "4", type: "Suspicious API Access", severity: "high", user: "API_KEY_77X", ip: "203.0.113.5", timestamp: "3 hours ago" },
];

export default function SecurityDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>(mockEvents);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive">Critical</Badge>;
      case "high": return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">High</Badge>;
      case "medium": return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Medium</Badge>;
      default: return <Badge variant="secondary">Low</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Security Command Center</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Threats Blocked (24h)</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,432</div>
            <p className="text-xs text-muted-foreground">+19% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins (24h)</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">-4% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Requires immediate review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Firewall Status</CardTitle>
            <Lock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Active & Enforcing</div>
            <p className="text-xs text-muted-foreground">WAF and Rate Limiting Enabled</p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Recent Security Events & Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>User / Entity</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                  <TableCell className="font-medium">{event.type}</TableCell>
                  <TableCell>{event.user}</TableCell>
                  <TableCell className="font-mono text-sm">{event.ip}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{event.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
