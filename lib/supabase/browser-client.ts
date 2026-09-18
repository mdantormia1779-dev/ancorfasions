import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase"; // Assuming Supabase types are generated here

/**
 * Enterprise Browser Client
 * Strictly for use in Client Components.
 * Uses the NEXT_PUBLIC environment variables.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key";

  return createBrowserClient<Database>(url, key);
}
