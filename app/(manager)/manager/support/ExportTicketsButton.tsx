"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function ExportTicketsButton({ tickets = [] }: { tickets?: any[] }) {
  const handleExport = () => {
    try {
      if (!tickets || tickets.length === 0) {
        toast.error("No tickets to export");
        return;
      }

      const headers = ["Ticket ID", "Subject", "Customer", "Priority", "Status", "Created At"];
      const csvData = tickets.map((t) => [
        `"${(t.ticket_number || t.id || "").replace(/"/g, '""')}"`,
        `"${(t.subject || "").replace(/"/g, '""')}"`,
        `"${(t.customer_name || t.customer || "Guest").replace(/"/g, '""')}"`,
        `"${(t.priority || "MEDIUM").toUpperCase()}"`,
        `"${(t.status || "OPEN").toUpperCase()}"`,
        `"${new Date(t.created_at || Date.now()).toLocaleDateString()}"`,
      ]);

      const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `tickets_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Tickets exported successfully");
    } catch {
      toast.error("Failed to export tickets");
    }
  };

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export Data
    </Button>
  );
}
