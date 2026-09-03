"use client";

import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { toast } from "sonner";
import { exportToCsv } from "@/lib/utils/export";

export function StockControlActions({ inventory = [] }: { inventory: any[] }) {
  const handleAddStock = () => {
    toast.info("Add Stock functionality is coming soon.");
  };

  const handleExport = () => {
    if (!inventory || inventory.length === 0) {
      toast.error("No inventory data to export.");
      return;
    }
    const exportData = inventory.map(item => ({
      SKU: item.variants?.sku,
      Name: item.variants?.name,
      Warehouse: item.warehouses?.name,
      Available: item.quantity_available,
      Reserved: item.quantity_reserved,
      Incoming: item.quantity_incoming
    }));
    exportToCsv(`inventory_export_${new Date().toISOString().split("T")[0]}.csv`, exportData);
    toast.success("Inventory data exported successfully.");
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" /> Export
      </Button>
      <Button onClick={handleAddStock}>
        <Plus className="mr-2 h-4 w-4" /> Add Stock
      </Button>
    </div>
  );
}

export function StockTransferActions() {
  const handleTransfer = () => {
    toast.info("Stock Transfer functionality is coming soon.");
  };

  return (
    <Button onClick={handleTransfer}>
      <Plus className="mr-2 h-4 w-4" /> Transfer
    </Button>
  );
}

export function StockMovementActions() {
  const handleRecordMovement = () => {
    toast.info("Record Movement functionality is coming soon.");
  };

  return (
    <Button onClick={handleRecordMovement}>
      <Plus className="mr-2 h-4 w-4" /> Record Movement
    </Button>
  );
}
