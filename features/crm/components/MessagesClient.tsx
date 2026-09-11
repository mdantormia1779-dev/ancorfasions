"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, MessageSquare, Mail, Phone, Video, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CommunicationLog } from "@/types/crm.types";
import { logCommunicationAction } from "@/actions/crm.actions";

interface MessagesClientProps {
  initialLogs: CommunicationLog[];
}

const getChannelIcon = (channel: string) => {
  switch (channel?.toLowerCase()) {
    case "email":
      return <Mail className="h-4 w-4" />;
    case "phone":
    case "call":
      return <Phone className="h-4 w-4" />;
    case "meeting":
      return <Video className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

export function MessagesClient({ initialLogs }: MessagesClientProps) {
  const router = useRouter();
  const [logs, setLogs] = useState<CommunicationLog[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");

  // Log Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commType, setCommType] = useState<"EMAIL" | "CALL" | "MEETING" | "SMS">("CALL");
  const [direction, setDirection] = useState<"OUTBOUND" | "INBOUND">("OUTBOUND");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  React.useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        !search.trim() ||
        (log.content || "").toLowerCase().includes(search.toLowerCase()) ||
        (log.subject || "").toLowerCase().includes(search.toLowerCase());

      const matchChannel =
        channelFilter === "all" ||
        log.type.toLowerCase() === channelFilter.toLowerCase();

      return matchSearch && matchChannel;
    });
  }, [logs, search, channelFilter]);

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please enter the discussion content or notes");
      return;
    }

    setSubmitting(true);
    try {
      const res = await logCommunicationAction({
        type: commType,
        direction,
        subject: subject.trim() || undefined,
        content: content.trim(),
      });

      if (res.error) {
        toast.error(res.error || "Failed to record communication log");
        return;
      }

      toast.success("Communication logged successfully");
      if (res.data) {
        setLogs((prev) => [res.data as any, ...prev]);
      }
      setIsDialogOpen(false);
      setSubject("");
      setContent("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-8 pt-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages & Communication Logs</h1>
          <p className="mt-1 text-muted-foreground">
            Review and record telephone calls, emails, and meetings across wholesale and retail contacts.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Log Communication
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search message notes or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-card"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "all", label: "All Logs" },
            { id: "call", label: "Calls" },
            { id: "email", label: "Emails" },
            { id: "meeting", label: "Meetings" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={channelFilter === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setChannelFilter(tab.id)}
              className="text-xs h-8"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Communication Register</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} logged touchpoints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Channel</TableHead>
                  <TableHead className="w-[110px]">Direction</TableHead>
                  <TableHead>Summary / Discussion Notes</TableHead>
                  <TableHead className="w-[120px]">Contact Type</TableHead>
                  <TableHead className="w-[130px]">Recorded Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <MessageSquare className="h-6 w-6 text-muted-foreground/40 mb-1" />
                        <p className="font-semibold text-foreground">No communications found</p>
                        <p className="text-xs">
                          {logs.length === 0
                            ? "Use 'Log Communication' to record interactions."
                            : "No logs match your filter criteria."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 capitalize text-xs font-medium">
                          {getChannelIcon(log.type)}
                          <span>{log.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={log.direction === "INBOUND" ? "secondary" : "outline"}
                          className="capitalize text-xs font-normal"
                        >
                          {log.direction.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.subject && (
                          <div className="font-medium text-xs text-foreground mb-0.5">
                            {log.subject}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {log.content || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        {log.profile_id ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-normal">
                            Customer
                          </Badge>
                        ) : log.lead_id ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-normal">
                            Lead
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(log.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Log Communication Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Log Client Communication
            </DialogTitle>
            <DialogDescription>
              Record details from phone calls, client meetings, or written messages.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLog} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Channel</Label>
                <Select value={commType} onValueChange={(val: any) => setCommType(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CALL">Phone Call</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="SMS">SMS / WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Direction</Label>
                <Select value={direction} onValueChange={(val: any) => setDirection(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OUTBOUND">Outbound</SelectItem>
                    <SelectItem value="INBOUND">Inbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comm-subject">Subject / Purpose</Label>
              <Input
                id="comm-subject"
                placeholder="e.g., Bulk order terms negotiation"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comm-notes">
                Discussion Notes <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="comm-notes"
                placeholder="Summary of what was discussed, outcomes, and next action items..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Save Communication"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
