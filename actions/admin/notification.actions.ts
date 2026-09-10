"use server";

import { createClient } from "@/lib/supabase/server";
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
 * Returns system-wide notifications (user_id IS NULL) OR notifications for the current user.
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
 * Marks a single notification as read by setting read_at to NOW().
 */
export async function markNotificationAsReadAction(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);

    if (user) {
      query = query.or(`user_id.is.null,user_id.eq.${user.id}`);
    } else {
      query = query.is("user_id", null);
    }

    const { error } = await query;
    if (error) return { error: error.message };
    revalidatePath("/admin", "layout");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * Seeds realistic operational notifications if the table is empty.
 * This is safe to call on every app startup — it no-ops if data already exists.
 */
export async function seedInitialNotificationsIfEmptyAction(): Promise<void> {
  try {
    const supabase = await createClient();
    const { count } = await supabase
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

    await supabase.from("notifications").insert(seedData);
  } catch {
    // Silently fail — seeding is non-critical
  }
}
