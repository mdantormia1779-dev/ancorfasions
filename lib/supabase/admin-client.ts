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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_key";

  return createSupabaseClient<Database>(
    url,
    key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
