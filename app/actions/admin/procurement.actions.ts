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
    .select("id, name, code, is_active")
    .order("name", { ascending: true });
    
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data || []).filter((w) => w.is_active !== false) };
}

export async function getVariants() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("variants")
    .select("id, sku, name, price_override, cost_price, product:products(name, base_price)")
    .limit(200);
    
  if (error) {
    const { data: fallback, error: fbErr } = await supabase
      .from("variants")
      .select("id, sku, name, price_override, cost_price")
      .limit(200);
    if (fbErr) return { success: false, error: fbErr.message };
    return {
      success: true,
      data: (fallback || []).map((v: any) => ({
        id: v.id,
        sku: v.sku,
        name: `${v.sku} — ${v.name || "Item"}`,
        price: v.price_override || v.cost_price || 0,
        cost_price: v.cost_price || 0,
      })),
    };
  }
  return {
    success: true,
    data: (data || []).map((v: any) => ({
      id: v.id,
      sku: v.sku,
      name: `${v.sku} — ${v.name || v.product?.name || "Standard"}`,
      price: v.price_override || v.cost_price || v.product?.base_price || 0,
      cost_price: v.cost_price || (v.price_override ? v.price_override * 0.6 : 0),
    })),
  };
}

export async function createProcurementOrder(
  poData: {
    po_number?: string;
    supplier_id: string;
    destination_warehouse_id: string;
    expected_delivery_date?: string;
    tax_rate?: number;
    notes?: string;
  },
  items: Array<{
    variant_id: string;
    quantity_ordered: number;
    unit_cost: number;
  }>
) {
  try {
    const supabase = createAdminClient();

    const validItems = (items || []).filter(
      (i) => i.variant_id && Number(i.quantity_ordered) > 0 && Number(i.unit_cost) >= 0
    );

    if (validItems.length === 0) {
      return { success: false, error: "At least one item with a valid quantity and cost is required." };
    }

    // 1. Authoritative server-side calculation of line item totals
    const processedItems = validItems.map((item) => {
      const qty = Math.max(1, Math.floor(Number(item.quantity_ordered) || 1));
      const cost = Math.max(0, Number(item.unit_cost) || 0);
      const lineTotal = Number((qty * cost).toFixed(2));
      return {
        variant_id: item.variant_id,
        quantity_ordered: qty,
        unit_cost: cost,
        total_cost: lineTotal,
      };
    });

    // 2. Authoritative server-side calculation of subtotal, tax, and grand total
    const subtotal = processedItems.reduce((acc, item) => acc + item.total_cost, 0);
    const taxRate = typeof poData.tax_rate === "number" && poData.tax_rate >= 0 ? poData.tax_rate : 0.05;
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const grandTotal = Number((subtotal + taxAmount).toFixed(2));

    const poNumber = poData.po_number || `PO-${Date.now().toString().slice(-6)}`;

    // 3. Insert Procurement Order with authoritative grand total
    const { data: po, error: poError } = await supabase
      .from("procurement_orders")
      .insert({
        po_number: poNumber,
        supplier_id: poData.supplier_id,
        destination_warehouse_id: poData.destination_warehouse_id,
        expected_delivery_date: poData.expected_delivery_date || null,
        total_amount: grandTotal,
        notes: poData.notes || `Subtotal: BDT ${subtotal.toFixed(2)}, Tax (${(taxRate * 100).toFixed(0)}%): BDT ${taxAmount.toFixed(2)}, Grand Total: BDT ${grandTotal.toFixed(2)}`,
        status: "DRAFT",
      })
      .select()
      .single();

    if (poError) return { success: false, error: poError.message };

    // 4. Insert Items with line totals
    const itemsToInsert = processedItems.map((item) => ({
      po_id: po.id,
      variant_id: item.variant_id,
      quantity_ordered: item.quantity_ordered,
      unit_cost: item.unit_cost,
      total_cost: item.total_cost,
    }));

    const { error: itemsError } = await supabase
      .from("procurement_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.warn("Could not insert with total_cost column, retrying with base columns:", itemsError);
      await supabase.from("procurement_items").insert(
        processedItems.map((item) => ({
          po_id: po.id,
          variant_id: item.variant_id,
          quantity_ordered: item.quantity_ordered,
          unit_cost: item.unit_cost,
        }))
      );
    }

    revalidatePath("/admin/inventory/purchases");
    revalidatePath("/admin/operations/procurement/purchase-orders");
    return {
      success: true,
      data: {
        id: po.id,
        po_number: poNumber,
        subtotal,
        taxAmount,
        grandTotal,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create procurement order" };
  }
}
