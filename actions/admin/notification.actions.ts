"use server";

import { prisma } from "@/lib/prisma";
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
 * Fetches the most recent notifications for display in the admin header dropdown from Neon via Prisma.
 */
export async function getAdminHeaderNotificationsAction(): Promise<{
  data: AdminNotification[];
  unreadCount: number;
  error?: string;
}> {
  try {
    const list = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const notifications: AdminNotification[] = list.map((n: any) => ({
      id: n.id,
      user_id: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      read_at: n.readAt ? new Date(n.readAt).toISOString() : null,
      created_at: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
    }));

    const unreadCount = notifications.filter((n) => !n.read_at).length;
    return { data: notifications, unreadCount };
  } catch (err: any) {
    console.error("Error fetching notifications via Prisma:", err);
    return { data: [], unreadCount: 0, error: err.message };
  }
}

/**
 * Fetches all notifications for the Notifications management page.
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
    const where: any = {};
    if (filters?.type && filters.type !== "all") {
      where.type = filters.type.toLowerCase();
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { message: { contains: q, mode: "insensitive" } },
      ];
    }

    const [list, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit || 100,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, readAt: null } }),
    ]);

    const notifications: AdminNotification[] = list.map((n: any) => ({
      id: n.id,
      user_id: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      read_at: n.readAt ? new Date(n.readAt).toISOString() : null,
      created_at: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
    }));

    return {
      data: notifications,
      total,
      unreadCount: unread,
    };
  } catch (err: any) {
    return { data: [], total: 0, unreadCount: 0, error: err.message };
  }
}

/**
 * Creates a new notification in Neon.
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

    const data = await prisma.notification.create({
      data: {
        title: payload.title.trim(),
        message: payload.message.trim(),
        type: (payload.type || "system").toLowerCase(),
        userId: payload.user_id || null,
        readAt: null,
      },
    });

    revalidatePath("/admin/notifications");
    revalidatePath("/admin", "layout");
    return {
      success: true,
      data: {
        id: data.id,
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        read_at: null,
        created_at: data.createdAt.toISOString(),
      },
    };
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

    const data = await prisma.notification.update({
      where: { id },
      data: {
        title: payload.title.trim(),
        message: payload.message.trim(),
        type: (payload.type || "system").toLowerCase(),
      },
    });

    revalidatePath("/admin/notifications");
    revalidatePath("/admin", "layout");
    return {
      success: true,
      data: {
        id: data.id,
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        read_at: data.readAt ? data.readAt.toISOString() : null,
        created_at: data.createdAt.toISOString(),
      },
    };
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
    await prisma.notification.delete({ where: { id } });

    revalidatePath("/admin/notifications");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsReadAction(id: string): Promise<{ error?: string }> {
  try {
    await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

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
    await prisma.notification.updateMany({
      where: { readAt: null },
      data: { readAt: new Date() },
    });

    revalidatePath("/admin", "layout");
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * Toggles a notification's read status.
 */
export async function toggleNotificationStatusAction(
  id: string,
  currentlyRead: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.notification.update({
      where: { id },
      data: { readAt: currentlyRead ? null : new Date() },
    });
    revalidatePath("/admin/notifications");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes all notifications.
 */
export async function deleteAllAdminNotificationsAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await prisma.notification.deleteMany({});
    revalidatePath("/admin/notifications");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * No-op: Do not seed fake notifications. Only real system/user notifications are shown.
 */
export async function seedInitialNotificationsIfEmptyAction(): Promise<void> {
  // Intentionally empty — strictly real notifications only
}
