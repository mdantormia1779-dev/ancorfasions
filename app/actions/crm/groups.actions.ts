"use server";

import { createAdminClient } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";

export async function createGroupAction(data: {
  name: string;
  description?: string;
  isDynamic?: boolean;
}): Promise<{ success?: boolean; data?: any; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("customer_segments")
      .select("id")
      .eq("name", data.name)
      .maybeSingle();

    if (existing) {
      return { error: "A group with this name already exists" };
    }

    const { data: newGroup, error } = await supabase
      .from("customer_segments")
      .insert({
        name: data.name,
        description: data.description || null,
        is_dynamic: data.isDynamic ?? false,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/customers/groups");
    return { success: true, data: newGroup };
  } catch (error: any) {
    console.error("[createGroupAction]", error);
    return { error: error.message || "Failed to create group" };
  }
}

export async function deleteGroupAction(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("customer_segments")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/customers/groups");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteGroupAction]", error);
    return { error: error.message || "Failed to delete group" };
  }
}
