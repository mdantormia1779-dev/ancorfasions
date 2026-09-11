import { StockMovementRepository } from "@/lib/repositories/inventory/stock-movement.repository";
import { StockMovementClient } from "@/features/inventory/components/StockMovementClient";

export const metadata = {
  title: "Stock Movement | Inventory | Anchor Fashion Enterprise",
};

export default async function AdminStockMovementPage() {
  const movements = await StockMovementRepository.getMovements();

  return <StockMovementClient movements={movements} />;
}
