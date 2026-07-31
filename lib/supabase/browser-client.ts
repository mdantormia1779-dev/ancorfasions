import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase"; // Assuming Supabase types are generated here

/**
 * Enterprise Browser Client
 * Strictly for use in Client Components.
 * Uses the NEXT_PUBLIC environment variables.
 */
export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined");
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
