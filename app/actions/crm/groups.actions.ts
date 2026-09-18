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

export async function getGroupMembersAction(groupId: string): Promise<{
  success: boolean;
  data?: {
    group: any;
    members: any[];
    count: number;
  };
  error?: string;
}> {
  try {
    const supabase = createAdminClient();

    const { data: group, error: groupErr } = await supabase
      .from("customer_segments")
      .select("*")
      .eq("id", groupId)
      .single();

    if (groupErr || !group) {
      return { success: false, error: "Group not found" };
    }

    let members: any[] = [];
    const { data: directMembers, error: membersErr } = await supabase
      .from("customer_segment_members")
      .select("customer_profiles(id, first_name, last_name, email, phone, created_at)")
      .eq("segment_id", groupId);

    if (!membersErr && directMembers && directMembers.length > 0) {
      members = directMembers.map((m: any) => m.customer_profiles).filter(Boolean);
    } else {
      const name = (group.name || "").toUpperCase();
      let query = supabase
        .from("customer_profiles")
        .select("id, first_name, last_name, email, phone, created_at");

      if (name.includes("VIP")) {
        query = query.eq("is_vip", true);
      } else if (name.includes("PROSPECT")) {
        query = query.eq("customer_lifecycle_stage", "PROSPECT");
      } else if (name.includes("LOYAL")) {
        query = query.eq("customer_lifecycle_stage", "LOYAL");
      } else if (name.includes("RISK")) {
        query = query.eq("customer_lifecycle_stage", "AT_RISK");
      } else if (name.includes("FIRST")) {
        query = query.eq("customer_lifecycle_stage", "FIRST_TIME_BUYER");
      } else if (name.includes("REPEAT")) {
        query = query.eq("customer_lifecycle_stage", "REPEAT_CUSTOMER");
      }

      const { data: matched } = await query.limit(50);
      members = matched || [];
    }

    return {
      success: true,
      data: {
        group,
        members,
        count: members.length,
      },
    };
  } catch (error: any) {
    console.error("[getGroupMembersAction]", error);
    return { success: false, error: error.message || "Failed to fetch group members" };
  }
}

export async function updateGroupAction(
  id: string,
  data: { name: string; description?: string; isDynamic?: boolean }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { data: updated, error } = await supabase
      .from("customer_segments")
      .update({
        name: data.name.trim(),
        description: data.description?.trim() || null,
        is_dynamic: data.isDynamic ?? false,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/customers/groups");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("[updateGroupAction]", error);
    return { success: false, error: error.message || "Failed to update group" };
  }
}
