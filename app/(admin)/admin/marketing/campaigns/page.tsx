"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bot,
  Send,
  CalendarIcon,
  Wand2,
  Loader2,
  Mail,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  createAndSendCampaignAction,
  createAndScheduleCampaignAction,
  getCampaignsAction,
} from "@/actions/marketing.actions";
import { Campaign } from "@/types/marketing.types";
import { ScheduleCampaignDialog } from "@/features/marketing/components/ScheduleCampaignDialog";

export default function CampaignBuilderPage() {
  const router = useRouter();

  // Form State
  const [campaignName, setCampaignName] = useState("");
  const [targetSegment, setTargetSegment] = useState("all");
  const [channelType, setChannelType] = useState<"email" | "push">("email");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [pushTitle, setPushTitle] = useState("");
  const [pushMessage, setPushMessage] = useState("");

  // Action State
  const [isSending, setIsSending] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Campaign History
  const [campaignHistory, setCampaignHistory] = useState<Campaign[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch campaign history
  const fetchCampaigns = async () => {
    setLoadingHistory(true);
    try {
      const res = await getCampaignsAction();
      if (res.success && res.data) {
        setCampaignHistory(res.data);
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Validate form
  const validateForm = () => {
    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return false;
    }

    if (channelType === "email") {
      if (!subject.trim()) {
        toast.error("Please enter an email subject line");
        return false;
      }
      if (!emailBody.trim()) {
        toast.error("Please write the email body content");
        return false;
      }
    } else {
      if (!pushTitle.trim()) {
        toast.error("Please enter a push notification title");
        return false;
      }
      if (!pushMessage.trim()) {
        toast.error("Please enter a push notification message");
        return false;
      }
    }

    return true;
  };

  // Handle Immediate Send
  const handleSendNow = async () => {
    if (!validateForm()) return;

    setIsSending(true);
    try {
      const content = channelType === "email" ? emailBody : pushMessage;
      const sub = channelType === "email" ? subject : pushTitle;

      const res = await createAndSendCampaignAction({
        name: campaignName,
        type: channelType,
        subject: sub,
        content,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to dispatch campaign");
        return;
      }

      toast.success(
        `Campaign dispatched successfully to ${res.sentCount || 1} recipient(s)!`
      );

      // Reset form
      setCampaignName("");
      setSubject("");
      setEmailBody("");
      setPushTitle("");
      setPushMessage("");

      // Refresh list
      fetchCampaigns();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred sending campaign");
    } finally {
      setIsSending(false);
    }
  };

  // Handle Schedule Confirm
  const handleConfirmSchedule = async (scheduleTimeIso: string) => {
    setIsScheduling(true);
    try {
      const content = channelType === "email" ? emailBody : pushMessage;
      const sub = channelType === "email" ? subject : pushTitle;

      const res = await createAndScheduleCampaignAction({
        name: campaignName,
        type: channelType,
        subject: sub,
        content,
        scheduleTime: scheduleTimeIso,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to schedule campaign");
        return;
      }

      toast.success(
        `Campaign scheduled for ${new Date(scheduleTimeIso).toLocaleString()}`
      );
      setIsScheduleModalOpen(false);

      // Reset form
      setCampaignName("");
      setSubject("");
      setEmailBody("");
      setPushTitle("");
      setPushMessage("");

      fetchCampaigns();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred scheduling campaign");
    } finally {
      setIsScheduling(false);
    }
  };

  // AI Copy Generation
  const handleAiGenerate = (promptType: string = "general") => {
    setAiGenerating(true);
    setTimeout(() => {
      const nameRef = campaignName.trim() || "Festive Summer Collection";

      if (promptType === "fomo") {
        setSubject(`⚡ FINAL HOURS: Exclusive 25% Off ${nameRef}`);
        setEmailBody(
          `<h2>Don't Miss Out!</h2>\n<p>Our most anticipated styles from the <strong>${nameRef}</strong> are almost gone.</p>\n<p>Enjoy an exclusive <strong>25% markdown</strong> on checkout with code <strong>FESTIVE25</strong>.</p>\n<p><a href="https://anchorfashion.com.bd/catalog" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;">Shop The Sale Now</a></p>`
        );
        setPushTitle(`⚡ 25% Off ${nameRef} Ends Tonight!`);
        setPushMessage(
          `Last chance to claim your exclusive seasonal markdown before stocks deplete.`
        );
      } else if (promptType === "vip") {
        setSubject(`✨ VIP Exclusive Access: ${nameRef} Pre-Launch`);
        setEmailBody(
          `<h2>Dear Preferred Member,</h2>\n<p>As one of Anchor Fashion's most valued patrons, you receive <strong>24-hour early access</strong> to the <em>${nameRef}</em>.</p>\n<p>Hand-crafted textiles, tailored silhouettes, and timeless luxury await you.</p>\n<p><a href="https://anchorfashion.com.bd/catalog?vip=true" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;">Enter VIP Showroom</a></p>`
        );
        setPushTitle(`✨ VIP Early Access Live!`);
        setPushMessage(`Shop the ${nameRef} 24 hours before public release.`);
      } else {
        setSubject(`Discover the New ${nameRef} | Anchor Fashion`);
        setEmailBody(
          `<h2>Elevate Your Wardrobe</h2>\n<p>We are thrilled to unveil our latest collection: <strong>${nameRef}</strong>.</p>\n<p>Featuring lightweight breathable fabrics, contemporary cuts, and sustainable craftmanship.</p>\n<p><a href="https://anchorfashion.com.bd/catalog" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;">Explore New Arrivals</a></p>`
        );
        setPushTitle(`${nameRef} is Now Live!`);
        setPushMessage(
          `Explore our latest curated seasonal arrivals designed for everyday elegance.`
        );
      }
      setAiGenerating(false);
      toast.success("AI generated campaign copy loaded into builder!");
    }, 600);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8 pt-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campaign Builder</h1>
        <p className="mt-1 text-muted-foreground">
          Create, schedule, and send targeted marketing campaigns via Resend Email and Push channels.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Editor */}
        <div className="space-y-6 md:col-span-2">
          {/* Campaign Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Define your campaign objective and target audience segment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">
                  Campaign Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g. Fall Collection Launch 2026"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-segment">Target Audience Segment</Label>
                <select
                  id="target-segment"
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">All Customers & Subscribers</option>
                  <option value="vip">VIP Customers (LTV &gt; $10k)</option>
                  <option value="abandoned">Cart Abandoners (Last 7 Days)</option>
                  <option value="inactive">Inactive Customers (6+ Months)</option>
                  <option value="newsletter">Newsletter Subscribers Only</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Content Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Content & Copy</CardTitle>
                <CardDescription>
                  Draft your rich email template or instant push notification.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAiGenerate("general")}
                disabled={aiGenerating}
                className="border-primary/20 bg-primary/5 text-primary gap-1.5"
              >
                {aiGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                AI Generate
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs
                value={channelType}
                onValueChange={(val) => setChannelType(val as "email" | "push")}
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="email" className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    Email Campaign
                  </TabsTrigger>
                  <TabsTrigger value="push" className="flex items-center gap-1.5">
                    <Bell className="h-4 w-4" />
                    Push Notification
                  </TabsTrigger>
                </TabsList>

                {/* Email Tab Content */}
                <TabsContent value="email" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">
                      Subject Line <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email-subject"
                      placeholder="Discover the new Fall Collection..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-body">
                      Email Body (HTML supported) <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="email-body"
                      placeholder="Write your email content here (HTML supported)..."
                      className="min-h-[260px] font-mono text-sm resize-y"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                    />
                  </div>
                </TabsContent>

                {/* Push Tab Content */}
                <TabsContent value="push" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="push-title">
                      Push Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="push-title"
                      placeholder="Fall Collection is Live!"
                      value={pushTitle}
                      onChange={(e) => setPushTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="push-msg">
                      Push Message <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="push-msg"
                      placeholder="Tap to shop our exclusive new arrivals before they sell out."
                      className="min-h-[120px] resize-y"
                      value={pushMessage}
                      onChange={(e) => setPushMessage(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          {/* Dispatch Control */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Dispatch</CardTitle>
              <CardDescription>
                Send instantly through Resend or schedule for future automation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full gap-2"
                onClick={handleSendNow}
                disabled={isSending || isScheduling}
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Dispatching Email...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Now
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  if (validateForm()) setIsScheduleModalOpen(true);
                }}
                disabled={isSending || isScheduling}
              >
                <CalendarIcon className="h-4 w-4" />
                Schedule for Later
              </Button>
            </CardContent>
          </Card>

          {/* AI Suggestions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bot className="h-4 w-4 text-primary" />
                AI Copy Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <p className="text-xs text-muted-foreground">
                One-click prompt templates tailored to high conversion e-commerce marketing:
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAiGenerate("vip")}
                disabled={aiGenerating}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                VIP Early Access Invitation
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAiGenerate("fomo")}
                disabled={aiGenerating}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-rose-500" />
                Urgency & Flash Sale Markdown
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => handleAiGenerate("general")}
                disabled={aiGenerating}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                New Collection Arrival Notice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Campaign Activity History */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Execution History</CardTitle>
          <CardDescription>
            Live register of all sent, scheduled, and draft marketing campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Campaign Name</TableHead>
                  <TableHead className="w-[100px]">Channel</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[180px]">Execution / Schedule</TableHead>
                  <TableHead className="w-[140px]">Created Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingHistory ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Loading campaign history...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : campaignHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                      No campaigns recorded yet. Use the builder above to send or schedule your first campaign.
                    </TableCell>
                  </TableRow>
                ) : (
                  campaignHistory.map((c) => {
                    const isSent =
                      c.status === "sent" || c.status === "completed";
                    const isScheduled = c.status === "scheduled";
                    const isSending =
                      c.status === "sending" || c.status === "running";
                    const isFailed = c.status === "failed";

                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-foreground">
                          <div>{c.name}</div>
                          {c.subject && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {c.subject}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-xs">
                            {c.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isSent ? (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-xs font-normal">
                              Sent
                            </Badge>
                          ) : isScheduled ? (
                            <Badge className="bg-amber-600 hover:bg-amber-700 text-xs font-normal">
                              Scheduled
                            </Badge>
                          ) : isSending ? (
                            <Badge className="bg-blue-600 hover:bg-blue-700 text-xs font-normal animate-pulse">
                              Sending...
                            </Badge>
                          ) : isFailed ? (
                            <Badge variant="destructive" className="text-xs font-normal">
                              Failed
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs font-normal capitalize">
                              {c.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {c.schedule_time ? (
                            <div className="flex items-center gap-1 text-amber-600 font-medium">
                              <Clock className="h-3 w-3" />
                              {new Date(c.schedule_time).toLocaleString()}
                            </div>
                          ) : isSent ? (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 className="h-3 w-3" />
                              Delivered
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(c.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Modal */}
      <ScheduleCampaignDialog
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        campaignName={campaignName}
        onConfirmSchedule={handleConfirmSchedule}
        isScheduling={isScheduling}
      />
    </div>
  );
}
