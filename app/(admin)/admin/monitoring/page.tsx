"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Database,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Mock interfaces for demonstration
interface SystemService {
  name: string;
  status: "operational" | "degraded" | "down";
  latency: string;
  uptime: string;
}

const mockServices: SystemService[] = [
  {
    name: "Frontend Edge Servers",
    status: "operational",
    latency: "42ms",
    uptime: "99.99%",
  },
  {
    name: "Supabase Primary DB",
    status: "operational",
    latency: "12ms",
    uptime: "99.98%",
  },
  {
    name: "Payments Gateway API",
    status: "operational",
    latency: "115ms",
    uptime: "99.99%",
  },
  {
    name: "Courier Integration API",
    status: "degraded",
    latency: "850ms",
    uptime: "98.50%",
  },
  {
    name: "Background Job Queue",
    status: "operational",
    latency: "2ms",
    uptime: "100%",
  },
];

export default function MonitoringDashboard() {
  const [services, setServices] = useState<SystemService[]>(mockServices);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "down":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Operational</Badge>
        );
      case "degraded":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600">Degraded</Badge>
        );
      case "down":
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            System Reliability & Monitoring
          </h2>
          <p className="text-muted-foreground">
            Real-time observability of enterprise infrastructure
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Uptime
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.99%</div>
            <p className="text-xs text-muted-foreground">
              Across all critical paths
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Global Error Rate
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.02%</div>
            <p className="text-xs text-muted-foreground">
              -0.01% from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P99 Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124ms</div>
            <p className="text-xs text-muted-foreground">Edge + DB Roundtrip</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Database Conns
            </CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">482 / 1000</div>
            <p className="text-xs text-muted-foreground">
              PgBouncer Pool Utilization
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Service Health</CardTitle>
            <CardDescription>
              Current status of all enterprise microservices and integrations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead className="text-right">30d Uptime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service, i) => (
                  <TableRow key={i}>
                    <TableCell>{getStatusIcon(service.status)}</TableCell>
                    <TableCell className="font-medium">
                      {service.name}
                    </TableCell>
                    <TableCell>{getStatusBadge(service.status)}</TableCell>
                    <TableCell>{service.latency}</TableCell>
                    <TableCell className="text-right">
                      {service.uptime}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Circuit Breaker Status</CardTitle>
            <CardDescription>
              Resilience patterns actively protecting downstream dependencies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center rounded-lg border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Courier API</p>
                <p className="text-sm text-muted-foreground">
                  Failed 3/5 times.
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-orange-500 text-orange-500"
              >
                HALF_OPEN
              </Badge>
            </div>

            <div className="flex items-center rounded-lg border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Payment Gateway
                </p>
                <p className="text-sm text-muted-foreground">
                  Normal operation.
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-green-500 text-green-500"
              >
                CLOSED
              </Badge>
            </div>

            <div className="flex items-center rounded-lg border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  AI Recommendation Engine
                </p>
                <p className="text-sm text-muted-foreground">
                  Normal operation.
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-green-500 text-green-500"
              >
                CLOSED
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
