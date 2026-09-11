import React from "react";
import { Metadata } from "next";
import { getCommunicationLogsAction } from "@/actions/crm.actions";
import { MessagesClient } from "@/features/crm/components/MessagesClient";

export const metadata: Metadata = {
  title: "Messages & Communications | CRM | Anchor Fashion Enterprise",
  description: "Review and record call, meeting, and message logs with leads and customers",
};

export const dynamic = "force-dynamic";

export default async function MessagesManagementPage() {
  const { data: logs, error } = await getCommunicationLogsAction();

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <p className="font-semibold">Failed to load communications</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return <MessagesClient initialLogs={logs || []} />;
}
