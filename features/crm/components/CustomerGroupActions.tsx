"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function CustomerGroupActions() {
  const handleCreateGroup = () => {
    toast.info("Create Group functionality is coming soon");
  };

  return (
    <Button onClick={handleCreateGroup}>
      <Plus className="mr-2 h-4 w-4" /> Create Group
    </Button>
  );
}
