"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface UserBookmarkItem {
  id: string;
  label: string;
  href: string;
  icon?: string | null;
  created_at: string;
}

/**
 * Fetches bookmarks for the currently authenticated user.
 */
export async function getUserBookmarksAction(): Promise<{
  data: UserBookmarkItem[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: [] };
    }

    const { data, error } = await supabase
      .from("user_bookmarks")
      .select("id, label, href, icon, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      // Table may not exist yet or have RLS, return empty gracefully
      return { data: [], error: error.message };
    }

    return { data: data || [] };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

/**
 * Creates or updates a bookmark for the current user.
 */
export async function addBookmarkAction(
  label: string,
  href: string,
  icon?: string
): Promise<{ success: boolean; data?: UserBookmarkItem; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    const { data, error } = await supabase
      .from("user_bookmarks")
      .upsert(
        {
          user_id: user.id,
          label,
          href,
          icon: icon || null,
        },
        { onConflict: "user_id,href" }
      )
      .select("id, label, href, icon, created_at")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin", "layout");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Removes a bookmark for the current user by href or id.
 */
export async function removeBookmarkAction(
  identifier: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required" };
    }

    const query = identifier.startsWith("/")
      ? supabase.from("user_bookmarks").delete().eq("user_id", user.id).eq("href", identifier)
      : supabase.from("user_bookmarks").delete().eq("user_id", user.id).eq("id", identifier);

    const { error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
