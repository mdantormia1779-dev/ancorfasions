import { createClient } from "@supabase/supabase-js";

// Note: This client uses the service role key and bypasses RLS.
// It should ONLY be used in secure server environments (e.g., Server Actions, API routes)
// and NEVER exposed to the client.
export const createAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "dummy_key";

  return createClient(
    url,
    key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
