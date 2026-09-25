"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";

export interface AdminMessage {
  id: string;
  profile_id: string | null;
  lead_id: string | null;
  type: string;
  direction: string;
  subject: string | null;
  content: string | null;
  status: string;
  sender_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

/**
 * Fetches recent inbound customer messages from communication_logs for the admin header dropdown.
 */
export async function getAdminHeaderMessagesAction(): Promise<{
  data: AdminMessage[];
  unreadCount: number;
  error?: string;
}> {
  try {
    const supabase = createAdminClient();

    const { data: logs, error } = await supabase
      .from("communication_logs")
      .select("*")
      .eq("direction", "INBOUND")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      return { data: [], unreadCount: 0, error: error.message };
    }

    const simpleLogs = logs || [];
    const profileIds = Array.from(new Set(simpleLogs.map((l: any) => l.profile_id).filter(Boolean)));
    const profileMap = new Map<string, { first_name: string | null; last_name: string | null }>();

    if (profileIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", profileIds);

      if (profiles) {
        profiles.forEach((p: any) => {
          profileMap.set(p.id, { first_name: p.first_name, last_name: p.last_name });
        });
      }
    }

    const messages: AdminMessage[] = simpleLogs.map((log: any) => ({
      ...log,
      profile: log.profile_id ? profileMap.get(log.profile_id) || null : null,
    }));
    const unreadCount = messages.filter((m) => m.status !== "READ").length;

    return { data: messages, unreadCount };
  } catch (err: any) {
    return { data: [], unreadCount: 0, error: err.message };
  }
}

/**
 * Marks a single message as READ.
 */
export async function markMessageAsReadAction(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("communication_logs")
      .update({ status: "READ" })
      .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/crm/messages");
    revalidatePath("/admin/messages");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * Creates a new communication message.
 */
export async function createMessageAction(payload: {
  profile_id?: string;
  lead_id?: string;
  type: string;
  direction?: string;
  subject?: string;
  content: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("communication_logs")
      .insert({
        ...payload,
        sender_id: user?.id || null,
        direction: payload.direction || "OUTBOUND",
        status: "SENT",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/crm/messages");
    revalidatePath("/admin/messages");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates an existing communication message/log.
 */
export async function updateMessageAction(
  id: string,
  payload: {
    subject?: string;
    content: string;
    type?: string;
    direction?: string;
    status?: string;
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("communication_logs")
      .update({
        subject: payload.subject?.trim() || null,
        content: payload.content.trim(),
        ...(payload.type ? { type: payload.type } : {}),
        ...(payload.direction ? { direction: payload.direction } : {}),
        ...(payload.status ? { status: payload.status } : {}),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/crm/messages");
    revalidatePath("/admin/messages");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a communication message/log by ID.
 */
export async function deleteMessageAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("communication_logs").delete().eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/crm/messages");
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Marks all recent unread inbound communications as READ.
 */
export async function markAllMessagesAsReadAction(): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("communication_logs")
      .update({ status: "READ" })
      .eq("direction", "INBOUND")
      .neq("status", "READ");

    if (error) return { error: error.message };
    revalidatePath("/admin", "layout");
    revalidatePath("/admin/crm/messages");
    revalidatePath("/admin/messages");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * Seeds sample inbound customer messages if the communication_logs table is empty.
 * (Permanently disabled so fake data never automatically reappears)
 */
export async function seedInitialMessagesIfEmptyAction(): Promise<void> {
  // Permanently disabled: do not seed fake messages
  return;
}

