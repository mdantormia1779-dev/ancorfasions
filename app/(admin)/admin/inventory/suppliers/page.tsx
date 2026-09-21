import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SuppliersClient } from "@/features/inventory/components/SuppliersClient";

export const metadata: Metadata = {
  title: "Suppliers | Anchor Fashion",
  description: "Manage supplier profiles, contact information, and performance ratings.",
};

export default async function SuppliersPage() {
  const supabase = await createClient();
  const { data: suppliers } = await supabase
    .from("supplier_profiles")
    .select("*")
    .order("company_name", { ascending: true });

  return <SuppliersClient suppliers={suppliers || []} />;
}
