import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { StockTransfersClient } from "@/features/inventory/components/StockTransfersClient";

export const metadata: Metadata = {
  title: "Stock Transfers | Anchor Fashion",
  description: "Manage internal inventory movements and transfers between warehouses.",
};

export default async function TransfersPage() {
  const supabase = await createClient();

  const [
    { data: transfers },
    { data: allWarehouses },
    { data: allVariants },
  ] = await Promise.all([
    supabase
      .from("stock_movements")
      .select("*, variants(sku, name), warehouses(name)")
      .eq("movement_type", "TRANSFER")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("warehouses")
      .select("id, name, code, is_active")
      .order("name", { ascending: true }),
    supabase
      .from("variants")
      .select("id, sku, name, product:products(name)")
      .order("sku", { ascending: true }),
  ]);

  return (
    <StockTransfersClient
      transfers={transfers || []}
      allWarehouses={allWarehouses || []}
      allVariants={allVariants || []}
    />
  );
}
