import { Search, Mail, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NewsletterRepository } from "@/lib/repositories/marketing/newsletter.repository";
import { NewsletterExportButton } from "./NewsletterExportButton";
import Link from "next/link";

export const metadata = {
  title: "Newsletter Subscribers | Marketing | Anchor Fashion Enterprise",
};

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case "subscribed":
      return <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Subscribed</Badge>;
    case "unsubscribed":
      return <Badge variant="secondary">Unsubscribed</Badge>;
    case "bounced":
      return <Badge variant="destructive">Bounced</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default async function AdminNewsletterPage() {
  const subscribers = await NewsletterRepository.getSubscribers();

  return (
    <div className="flex flex-col gap-6 p-8 pt-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletter Subscribers</h1>
          <p className="text-muted-foreground">
            Manage your email list and subscriber statuses.
          </p>
        </div>
        <div className="flex gap-2">
          <NewsletterExportButton subscribers={subscribers} />
          <Button asChild>
            <Link href="/admin/marketing/campaigns">
              <Mail className="mr-2 h-4 w-4" /> Create Campaign
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search email..."
            className="pl-8 bg-card"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Subscribed At</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p>No subscribers found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((sub: any) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.email}</TableCell>
                  <TableCell>{sub.first_name || "-"}</TableCell>
                  <TableCell>{sub.last_name || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{sub.source || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
