import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FulfillmentClient } from "@/features/inventory/components/FulfillmentClient";
import { getPickListsAction, getPickersAction } from "@/actions/admin/fulfillment.actions";

export const metadata: Metadata = {
  title: "Warehouse Fulfillment | Anchor Fashion",
  description: "Manage wave batches, pick lists, packing, and dispatch operations.",
};

export default async function FulfillmentPage() {
  const supabase = await createClient();

  const [
    pickListsRes,
    pickersRes,
    { data: allWarehouses },
  ] = await Promise.all([
    getPickListsAction(),
    getPickersAction(),
    supabase
      .from("warehouses")
      .select("id, name, code, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  return (
    <FulfillmentClient
      initialPickLists={pickListsRes.success && pickListsRes.data ? pickListsRes.data : []}
      pickers={pickersRes.success && pickersRes.data ? pickersRes.data : []}
      allWarehouses={allWarehouses || []}
    />
  );
}
