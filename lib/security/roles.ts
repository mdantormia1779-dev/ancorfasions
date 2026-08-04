import { createClient } from "@/lib/supabase/server";
import { AUTH_ROLES, ADMIN_ROLES } from "@/lib/constants/auth";

export async function verifySuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const role = user.user_metadata?.role || user.app_metadata?.role;
  
  if (role !== AUTH_ROLES.SUPERADMIN) {
    throw new Error("Forbidden: Superadmin access required");
  }

  return user;
}

export async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const role = user.user_metadata?.role || user.app_metadata?.role;
  
  if (!ADMIN_ROLES.includes(role)) {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
}
