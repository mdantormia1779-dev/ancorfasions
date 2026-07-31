"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity, Plus, Settings2, Zap } from "lucide-react";

const mockWorkflows = [
  {
    id: "1",
    name: "Welcome Email Sequence",
    trigger: "user.registered",
    status: "active",
    lastRun: "2 mins ago",
  },
  {
    id: "2",
    name: "Low Stock Alert Manager",
    trigger: "stock.low",
    status: "active",
    lastRun: "1 hour ago",
  },
  {
    id: "3",
    name: "Abandoned Cart Recovery",
    trigger: "cart.abandoned",
    status: "paused",
    lastRun: "1 day ago",
  },
];

export default function WorkflowsPage() {
  return (
    <div className="space-y-6 duration-500 animate-in fade-in zoom-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Workflow Engine
          </h1>
          <p className="mt-1 text-muted-foreground">
            Design, monitor, and manage enterprise automation rules.
          </p>
        </div>
        <Button className="bg-indigo-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> Create Workflow
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Workflows
            </CardTitle>
            <Zap className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Across 12 trigger types
            </p>
          </CardContent>
        </Card>
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Executions Today
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,204</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-card/50 shadow-lg backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Automation Rules</CardTitle>
          <CardDescription>
            Manage triggers and execution paths.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workflow Name</TableHead>
                  <TableHead>Trigger Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead className="text-right">Configure</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockWorkflows.map((workflow) => (
                  <TableRow
                    key={workflow.id}
                    className="transition-colors hover:bg-accent/50"
                  >
                    <TableCell className="font-medium">
                      {workflow.name}
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        {workflow.trigger}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${workflow.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`}
                      >
                        {workflow.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {workflow.lastRun}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-primary"
                      >
                        <Settings2 className="h-4 w-4" />
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
