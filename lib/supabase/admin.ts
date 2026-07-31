import { createClient } from "@supabase/supabase-js";

// Note: This client uses the service role key and bypasses RLS.
// It should ONLY be used in secure server environments (e.g., Server Actions, API routes)
// and NEVER exposed to the client.
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
