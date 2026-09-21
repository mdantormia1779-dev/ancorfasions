"use server";

import { createAdminClient } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";

export async function getPickListsAction() {
  try {
    const supabase = createAdminClient();
    const { data: lists, error } = await supabase
      .from("pick_lists")
      .select(`
        *,
        warehouses(id, name, warehouse_code),
        assigned_picker:profiles!assigned_picker_id(id, first_name, last_name, email),
        items:pick_list_items(id, quantity_required, quantity_picked, status)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback query if profiles foreign key differs
      const { data: fallbackLists, error: fbErr } = await supabase
        .from("pick_lists")
        .select("*, warehouses(id, name, warehouse_code)")
        .order("created_at", { ascending: false });

      if (fbErr) return { success: false, error: fbErr.message };
      return { success: true, data: fallbackLists || [] };
    }

    const processed = (lists || []).map((list: any) => {
      const items = list.items || [];
      const totalRequired = items.reduce((sum: number, i: any) => sum + (i.quantity_required || 1), 0);
      const totalPicked = items.reduce((sum: number, i: any) => sum + (i.quantity_picked || 0), 0);
      return {
        ...list,
        itemsTotal: totalRequired || 1,
        itemsPicked: totalPicked,
        assignedToName: list.assigned_picker
          ? `${list.assigned_picker.first_name || ""} ${list.assigned_picker.last_name || ""}`.trim() || list.assigned_picker.email
          : "Unassigned",
      };
    });

    return { success: true, data: processed };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch pick lists" };
  }
}

export async function getPickersAction() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .eq("is_active", true)
      .limit(50);

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: (data || []).map((p: any) => ({
        id: p.id,
        name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email,
        email: p.email,
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch pickers" };
  }
}

export async function generatePickListFromOrdersAction(warehouseId?: string) {
  try {
    const supabase = createAdminClient();

    // 1. Find eligible pending/paid orders
    let query = supabase
      .from("orders")
      .select("id, order_number, status, order_items(id, variant_id, quantity)")
      .in("status", ["pending", "processing", "PAID", "paid", "confirmed"])
      .limit(10);

    const { data: orders, error: ordersErr } = await query;
    if (ordersErr) throw ordersErr;

    // Determine warehouse
    let targetWarehouseId = warehouseId;
    if (!targetWarehouseId) {
      const { data: defaultWh } = await supabase
        .from("warehouses")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .single();
      targetWarehouseId = defaultWh?.id;
    }

    if (!targetWarehouseId) {
      return { success: false, error: "No active warehouse found to generate pick list." };
    }

    const pickListNumber = `PL-${Date.now().toString().slice(-6)}`;

    // 2. Create pick list record
    const { data: newPickList, error: plErr } = await supabase
      .from("pick_lists")
      .insert({
        pick_list_number: pickListNumber,
        warehouse_id: targetWarehouseId,
        order_id: orders && orders.length > 0 ? orders[0].id : null,
        status: "PENDING",
        notes: `Generated wave batch for ${orders?.length || 0} order(s).`,
      })
      .select()
      .single();

    if (plErr) throw plErr;

    // 3. Create pick list items from order items or active variants
    let itemsToInsert: any[] = [];
    if (orders && orders.length > 0) {
      for (const order of orders) {
        if (order.order_items && order.order_items.length > 0) {
          for (const item of order.order_items) {
            itemsToInsert.push({
              pick_list_id: newPickList.id,
              variant_id: item.variant_id,
              quantity_required: item.quantity || 1,
              quantity_picked: 0,
              status: "PENDING",
            });
          }
        }
      }
    }

    // Fallback: If no order items exist yet, link top variants
    if (itemsToInsert.length === 0) {
      const { data: sampleVariants } = await supabase.from("variants").select("id").limit(3);
      if (sampleVariants && sampleVariants.length > 0) {
        itemsToInsert = sampleVariants.map((v) => ({
          pick_list_id: newPickList.id,
          variant_id: v.id,
          quantity_required: 2,
          quantity_picked: 0,
          status: "PENDING",
        }));
      }
    }

    if (itemsToInsert.length > 0) {
      const { error: itemErr } = await supabase.from("pick_list_items").insert(itemsToInsert);
      if (itemErr) {
        console.warn("Error inserting pick list items:", itemErr);
      }
    }

    revalidatePath("/admin/operations/fulfillment/pick-lists");
    revalidatePath("/admin/inventory/fulfillment");
    return { success: true, data: newPickList };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to generate pick list" };
  }
}

export async function assignPickerAction(pickListId: string, pickerId: string) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("pick_lists")
      .update({
        assigned_picker_id: pickerId || null,
        status: "ASSIGNED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", pickListId);

    if (error) throw error;
    revalidatePath("/admin/operations/fulfillment/pick-lists");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to assign picker" };
  }
}

export async function updatePickListStatusAction(
  pickListId: string,
  status: "PENDING" | "ASSIGNED" | "PICKING" | "PARTIALLY_PICKED" | "COMPLETED" | "CANCELLED"
) {
  try {
    const supabase = createAdminClient();
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "PICKING") {
      updates.started_at = new Date().toISOString();
    } else if (status === "COMPLETED") {
      updates.completed_at = new Date().toISOString();
      // If completed, mark all items as picked
      await supabase
        .from("pick_list_items")
        .update({ status: "PICKED" })
        .eq("pick_list_id", pickListId);
    }

    const { error } = await supabase
      .from("pick_lists")
      .update(updates)
      .eq("id", pickListId);

    if (error) throw error;
    revalidatePath("/admin/operations/fulfillment/pick-lists");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update pick list status" };
  }
}
