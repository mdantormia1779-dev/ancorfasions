import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AuditsClient } from "@/features/inventory/components/AuditsClient";

export const metadata: Metadata = {
  title: "Inventory Audits | Anchor Fashion",
  description: "Manage cycle counts, blind verifications, and physical inventory reconciliation.",
};

export default async function AuditsPage() {
  const supabase = await createClient();

  const [{ data: audits }, { data: allWarehouses }] = await Promise.all([
    supabase
      .from("inventory_audits")
      .select("*, warehouses(id, name, code)")
      .order("created_at", { ascending: false }),
    supabase
      .from("warehouses")
      .select("id, name, code, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  return <AuditsClient audits={audits || []} allWarehouses={allWarehouses || []} />;
}
