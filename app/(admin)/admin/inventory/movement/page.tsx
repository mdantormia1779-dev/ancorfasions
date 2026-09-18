import { StockMovementRepository } from "@/lib/repositories/inventory/stock-movement.repository";
import { StockMovementClient } from "@/features/inventory/components/StockMovementClient";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Stock Movement | Inventory | Anchor Fashion Enterprise",
};

export default async function AdminStockMovementPage() {
  const supabase = await createClient();
  const [movements, { data: warehouses }, { data: variants }] = await Promise.all([
    StockMovementRepository.getMovements(),
    supabase.from("warehouses").select("id, name, code").order("name", { ascending: true }),
    supabase
      .from("variants")
      .select("id, sku, name, product:products(name)")
      .order("sku", { ascending: true }),
  ]);

  return (
    <StockMovementClient
      movements={movements || []}
      allWarehouses={warehouses || []}
      allVariants={variants || []}
    />
  );
}
