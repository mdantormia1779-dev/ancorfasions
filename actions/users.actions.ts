"use server";

import { createAdminClient } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";

export type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
};

export async function getUsersByRoleAction(roleNames: string[]) {
  try {
    const supabase = createAdminClient();

    // 1. Get roles
    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select("*")
      .in("name", roleNames);

    if (rolesError) throw rolesError;
    if (!roles || roles.length === 0) return { success: true, data: [] };

    const roleIds = roles.map((r) => r.id);

    // 2. Get profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*, roles(*)")
      .in("role_id", roleIds);

    if (profilesError) throw profilesError;

    // 3. Get auth users (admin API) to get emails
    const {
      data: { users },
      error: authError,
    } = await supabase.auth.admin.listUsers();

    if (authError) throw authError;

    // Merge data
    const mappedUsers: UserData[] = profiles.map((profile) => {
      const authUser = users.find((u) => u.id === profile.id);
      
      const roleName = Array.isArray(profile.roles) 
        ? profile.roles[0]?.name 
        : (profile.roles as any)?.name || "Unknown";

      return {
        id: profile.id,
        name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unknown",
        email: authUser?.email || "No email",
        role: roleName,
        status: profile.is_active ? "Active" : "Inactive",
        lastActive: authUser?.last_sign_in_at
          ? new Date(authUser.last_sign_in_at).toLocaleDateString()
          : "Never",
      };
    });

    return { success: true, data: mappedUsers };
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return { success: false, error: error.message || "Failed to fetch users" };
  }
}

export async function createUserAction(data: {
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
}) {
  try {
    const supabase = createAdminClient();

    // 1. Find role
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", data.roleName)
      .single();

    if (roleError || !role) throw new Error("Role not found");

    // 2. Generate a secure temporary password
    const tempPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8).toUpperCase() +
      "1!A";

    // 3. Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true,
      });

    if (authError) throw authError;

    // 4. Create profile (sometimes it's created automatically by a trigger, so we upsert or update)
    // We will attempt to update it first, if no rows updated, we insert.
    // Let's try upsert.
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: authData.user.id,
      first_name: data.firstName,
      last_name: data.lastName,
      role_id: role.id,
      is_active: true,
    });

    if (profileError) throw profileError;

    revalidatePath("/admin/users/admins");
    revalidatePath("/admin/users/managers");
    revalidatePath("/admin/users/staff");

    return {
      success: true,
      data: {
        password: tempPassword,
      },
    };
  } catch (error: any) {
    console.error("Error creating user:", error);
    return { success: false, error: error.message || "Failed to create user" };
  }
}
