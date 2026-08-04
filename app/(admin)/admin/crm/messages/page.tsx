import React from "react";
import { getCommunicationLogsAction } from "@/actions/crm.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, MoreHorizontal, MessageSquare, Mail, Phone, Video } from "lucide-react";
import { Input } from "@/components/ui/input";

export const metadata = {
  title: "Messages | CRM | Anchor Fashion Enterprise",
};

const getChannelIcon = (channel: string) => {
  switch (channel?.toLowerCase()) {
    case "email":
      return <Mail className="h-4 w-4" />;
    case "phone":
      return <Phone className="h-4 w-4" />;
    case "meeting":
      return <Video className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

export default async function MessagesManagementPage() {
  const { data: logs, error } = await getCommunicationLogsAction();

  if (error) {
    return <div className="p-8 text-red-500">Failed to load messages: {error}</div>;
  }

  return (
    <div className="space-y-6 p-8 pt-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages & Logs</h1>
          <p className="mt-1 text-muted-foreground">
            Review communication logs with leads and customers.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Log Communication
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search messages..."
          className="max-w-md bg-card"
        />
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Communication Logs</CardTitle>
          <CardDescription>
            Showing {logs?.length || 0} recent communications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead className="w-1/2">Message / Notes</TableHead>
                  <TableHead>Linked To</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!logs || logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No communications logged yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 capitalize">
                          {getChannelIcon(log.type)}
                          <span>{log.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={log.direction === "INBOUND" ? "secondary" : "outline"}
                          className="capitalize"
                        >
                          {log.direction}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm line-clamp-2">{log.content || "-"}</p>
                      </TableCell>
                      <TableCell>
                        {log.profile_id ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Customer
                          </Badge>
                        ) : log.lead_id ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            Lead
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
