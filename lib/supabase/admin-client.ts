import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

/**
 * Enterprise Admin Client (Service Role)
 *
 * DANGER: This client bypasses ALL Row Level Security (RLS) policies.
 * Only use this in strictly controlled backend environments (Server Actions,
 * Route Handlers, Edge Functions, Cron Jobs) where RLS bypass is absolutely required
 * (e.g., Webhooks, System-level aggregations, User Creation workflows).
 *
 * NEVER expose this client to the browser.
 */
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not defined");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not defined. Ensure this is only running securely on the server."
    );
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
