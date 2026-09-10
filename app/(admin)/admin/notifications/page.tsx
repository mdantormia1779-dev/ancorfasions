"use client";

import { useState, useEffect } from "react";
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
import { Bell, Mail, Smartphone, Plus, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  type: string;
  channels: string[];
  active: boolean;
}

const defaultTemplates: Template[] = [
  {
    id: "tpl-1",
    name: "welcome_customer",
    type: "TRANSACTIONAL",
    channels: ["email"],
    active: true,
  },
  {
    id: "tpl-2",
    name: "order_confirmation",
    type: "TRANSACTIONAL",
    channels: ["email", "in_app"],
    active: true,
  },
  {
    id: "tpl-3",
    name: "marketing_newsletter",
    type: "MARKETING",
    channels: ["email"],
    active: true,
  },
  {
    id: "tpl-4",
    name: "password_reset_request",
    type: "SECURITY",
    channels: ["email"],
    active: true,
  },
];

export default function NotificationsPage() {
  const [totalNotifications, setTotalNotifications] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotificationStats = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const { count: total, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true });

      const { count: unread } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .is("read_at", null);

      if (!error && total !== null) {
        setTotalNotifications(total);
      }
      if (unread !== null) {
        setUnreadNotifications(unread);
      }

      // Try fetching active templates if table exists
      const { data: dbTemplates } = await supabase
        .from("notification_templates")
        .select("*");

      if (dbTemplates && dbTemplates.length > 0) {
        setTemplates(
          dbTemplates.map((t: any) => ({
            id: t.id,
            name: t.name,
            type: t.type || "TRANSACTIONAL",
            channels: Array.isArray(t.channels) ? t.channels : ["email"],
            active: t.is_active ?? true,
          }))
        );
      }
    } catch {
      // Graceful fallback to default templates and 0 counts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationStats();
  }, []);

  return (
    <div className="space-y-6 duration-500 animate-in fade-in zoom-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Notification Center
          </h1>
          <p className="mt-1 text-muted-foreground">
            Omnichannel customer alerts, email dispatch, and communication templates.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotificationStats}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button 
            onClick={() => toast.info("Template builder will open for customizing message variables.")}
            className="bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" /> New Template
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-orange-500/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total In-App Alerts
            </CardTitle>
            <Bell className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotifications}</div>
            <p className="text-xs text-muted-foreground">
              {unreadNotifications} unread by customers
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Registered Channels
            </CardTitle>
            <Smartphone className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Transactional Email & In-App UI</p>
          </CardContent>
        </Card>
        <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
            <Mail className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.filter((t) => t.active).length}</div>
            <p className="text-xs text-muted-foreground">Ready for automated dispatch</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-card/50 shadow-lg backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Communication Templates</CardTitle>
          <CardDescription>
            Configure how transactional and marketing notifications are presented across channels.
          </CardDescription>
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
                {templates.map((template) => (
                  <TableRow
                    key={template.id}
                    className="transition-colors hover:bg-accent/50"
                  >
                    <TableCell className="font-medium">
                      {template.name}
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-2 py-1 text-xs font-medium">
                        {template.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {template.channels.map((c) => (
                          <span
                            key={c}
                            className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-primary"
                          >
                            {c.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${template.active ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}
                      >
                        {template.active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.info(`Viewing template: ${template.name}`)}
                        className="hover:text-primary"
                      >
                        Configure
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
