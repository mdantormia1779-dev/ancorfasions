import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Public Supabase Client Singleton
 *
 * Dedicated to unauthenticated, public read-only catalog data (products, categories, brands, banners).
 * Does NOT access Next.js cookies() or headers(), allowing Next.js 16 unstable_cache and ISR
 * to safely cache results across requests without "dynamic-server-error" or cookie dependency.
 *
 * Enforces Row Level Security (RLS) policies with the public anon key.
 */
let publicClientInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function getPublicSupabaseClient() {
  if (!publicClientInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment"
      );
    }

    publicClientInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return publicClientInstance;
}
