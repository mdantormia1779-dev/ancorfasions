"use client";

import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function AddWarehouseButton() {
  return (
    <Button
      onClick={() =>
        toast.info("Warehouse Creation", {
          description: "New warehouse setup flow will be integrated with the ERP system.",
        })
      }
    >
      <Plus className="mr-2 h-4 w-4" /> Add Warehouse
    </Button>
  );
}

export function ManageWarehouseSettingsButton() {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() =>
        toast.info("Warehouse Settings", {
          description: "Advanced warehouse configuration is coming soon.",
        })
      }
    >
      <Settings className="h-4 w-4" />
    </Button>
  );
}
