"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";

export interface AdminNotification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string;
  read_at: string | null;
  created_at: string;
}

/**
 * Fetches the most recent notifications for display in the admin header dropdown.
 */
export async function getAdminHeaderNotificationsAction(): Promise<{
  data: AdminNotification[];
  unreadCount: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (user) {
      query = query.or(`user_id.is.null,user_id.eq.${user.id}`);
    } else {
      query = query.is("user_id", null);
    }

    const { data, error } = await query;

    if (error) {
      const admin = createAdminClient();
      const { data: adminData } = await admin
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (adminData) {
        const notifications: AdminNotification[] = adminData;
        const unreadCount = notifications.filter((n) => !n.read_at).length;
        return { data: notifications, unreadCount };
      }
      return { data: [], unreadCount: 0, error: error.message };
    }

    const notifications: AdminNotification[] = data || [];
    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return { data: notifications, unreadCount };
  } catch (err: any) {
    return { data: [], unreadCount: 0, error: err.message };
  }
}

/**
 * Fetches all notifications with optional search and type filtering for the Notifications management page.
 */
export async function getAllAdminNotificationsAction(filters?: {
  search?: string;
  type?: string;
  limit?: number;
}): Promise<{
  data: AdminNotification[];
  total: number;
  unreadCount: number;
  error?: string;
}> {
  try {
    const admin = createAdminClient();
    let query = admin
      .from("notifications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (filters?.type && filters.type !== "all") {
      query = query.eq("type", filters.type.toLowerCase());
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      query = query.or(`title.ilike.%${q}%,message.ilike.%${q}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(100);
    }

    const { data, count, error } = await query;

    if (error) {
      return { data: [], total: 0, unreadCount: 0, error: error.message };
    }

    const notifications: AdminNotification[] = data || [];
    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return {
      data: notifications,
      total: count ?? notifications.length,
      unreadCount,
    };
  } catch (err: any) {
    return { data: [], total: 0, unreadCount: 0, error: err.message };
  }
}

/**
 * Creates a new notification (broadcast to all users or specific user).
 */
export async function createAdminNotificationAction(payload: {
  title: string;
  message: string;
  type?: string;
  user_id?: string | null;
}): Promise<{ success: boolean; data?: AdminNotification; error?: string }> {
  try {
    if (!payload.title?.trim() || !payload.message?.trim()) {
      return { success: false, error: "Title and message are required" };
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("notifications")
      .insert({
        title: payload.title.trim(),
        message: payload.message.trim(),
        type: (payload.type || "system").toLowerCase(),
        user_id: payload.user_id || null,
        read_at: null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/notifications");
    revalidatePath("/admin", "layout");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates an existing notification.
 */
export async function updateAdminNotificationAction(
  id: string,
  payload: {
    title: string;
    message: string;
    type?: string;
  }
): Promise<{ success: boolean; data?: AdminNotification; error?: string }> {
  try {
    if (!id) return { success: false, error: "Notification ID is required" };
    if (!payload.title?.trim() || !payload.message?.trim()) {
      return { success: false, error: "Title and message cannot be empty" };
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("notifications")
      .update({
        title: payload.title.trim(),
        message: payload.message.trim(),
        type: (payload.type || "system").toLowerCase(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/notifications");
    revalidatePath("/admin", "layout");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a notification by ID.
 */
export async function deleteAdminNotificationAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) return { success: false, error: "Notification ID is required" };

    const admin = createAdminClient();
    const { error } = await admin.from("notifications").delete().eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/notifications");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Toggles a notification between read and unread.
 */
export async function toggleNotificationStatusAction(
  id: string,
  currentlyRead: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("notifications")
      .update({
        read_at: currentlyRead ? null : new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/notifications");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Marks a single notification as read by setting read_at to NOW().
 */
export async function markNotificationAsReadAction(id: string): Promise<{ error?: string }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin", "layout");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * Marks ALL unread notifications as read.
 */
export async function markAllNotificationsAsReadAction(): Promise<{ error?: string }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);

    if (error) return { error: error.message };
    revalidatePath("/admin", "layout");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * Seeds realistic operational notifications if the table is empty.
 */
export async function seedInitialNotificationsIfEmptyAction(): Promise<void> {
  try {
    const admin = createAdminClient();
    const { count } = await admin
      .from("notifications")
      .select("*", { count: "exact", head: true });

    if (count && count > 0) return;

    const seedData = [
      {
        title: "New Order Received",
        message: "Order #ORD-8921 has been placed by Sarah Johnson for ৳4,250.",
        type: "order",
      },
      {
        title: "Low Stock Alert",
        message:
          'Product "Premium Silk Evening Gown" (SKU: SEG-001) is running low — only 3 units left.',
        type: "inventory",
      },
      {
        title: "New Customer Registration",
        message: "Ahmed Raza just signed up. Total customers: 1,247.",
        type: "customer",
      },
      {
        title: "Payment Failed",
        message: "Order #ORD-8920 payment failed. Customer notified automatically.",
        type: "payment",
      },
      {
        title: "System Maintenance Scheduled",
        message: "Scheduled maintenance tonight at 12:00 AM BDT. Expected downtime: 30 minutes.",
        type: "system",
      },
      {
        title: "Campaign Performance Update",
        message: '"Eid Special" campaign achieved 320% ROI. 1,450 clicks, 143 conversions.',
        type: "marketing",
      },
    ];

    await admin.from("notifications").insert(seedData);
  } catch {
    // Silently fail
  }
}
