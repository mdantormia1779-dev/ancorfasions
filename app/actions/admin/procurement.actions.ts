"use server";

import { createAdminClient } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";

export async function getSupplierProfiles() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("supplier_profiles")
    .select("id, company_name")
    .eq("status", "ACTIVE")
    .order("company_name", { ascending: true });
    
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getWarehouses() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("warehouses")
    .select("id, name")
    .eq("status", "active")
    .order("name", { ascending: true });
    
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getVariants() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("variants")
    .select("id, sku, name, price")
    .limit(100); // For demo purposes, should be searchable in real app
    
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createProcurementOrder(
  poData: any,
  items: any[]
) {
  const supabase = createAdminClient();
  
  // 1. Insert Procurement Order
  const { data: po, error: poError } = await supabase
    .from("procurement_orders")
    .insert({
      po_number: poData.po_number,
      supplier_id: poData.supplier_id,
      destination_warehouse_id: poData.destination_warehouse_id,
      expected_delivery_date: poData.expected_delivery_date,
      total_amount: poData.total_amount,
      status: "DRAFT"
    })
    .select()
    .single();
    
  if (poError) return { success: false, error: poError.message };
  
  // 2. Insert Items
  const itemsToInsert = items.map(item => ({
    po_id: po.id,
    variant_id: item.variant_id,
    quantity_ordered: item.quantity_ordered,
    unit_cost: item.unit_cost
  }));
  
  const { error: itemsError } = await supabase
    .from("procurement_items")
    .insert(itemsToInsert);
    
  if (itemsError) return { success: false, error: itemsError.message };
  
  revalidatePath("/admin/inventory/purchases");
  return { success: true };
}
