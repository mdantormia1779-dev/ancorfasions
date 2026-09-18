import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getPickListsAction, getPickersAction } from "@/actions/admin/fulfillment.actions";
import { PickListsClient } from "@/features/fulfillment/components/PickListsClient";

export const metadata: Metadata = {
  title: "Order Picking & Fulfillment | Anchor Fashion Enterprise",
  description: "Manage Wave Picks, Batch Picks, and Order Fulfillment",
};

export default async function PickListsPage() {
  const supabase = await createClient();

  const [
    { count: pendingCount },
    pickListsRes,
    pickersRes,
    { data: warehouses },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "processing", "PAID", "paid", "confirmed"]),
    getPickListsAction(),
    getPickersAction(),
    supabase.from("warehouses").select("id, name, code").eq("is_active", true).order("name"),
  ]);

  return (
    <PickListsClient
      pickLists={pickListsRes.data || []}
      warehouses={warehouses || []}
      pickers={pickersRes.data || []}
      pendingCount={pendingCount || 0}
    />
  );
}

