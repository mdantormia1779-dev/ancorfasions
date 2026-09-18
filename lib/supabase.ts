import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key";

// For backend admin tasks that bypass RLS, you'd use SUPABASE_SERVICE_ROLE_KEY
// But for standard server-side fetching we can use standard client
export const supabase = createClient(supabaseUrl, supabaseKey);
