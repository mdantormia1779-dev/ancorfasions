"use server";

import { createAdminClient } from "@/lib/supabase/admin-client";
import { revalidatePath } from "next/cache";

export async function createCustomerAction(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  lifecycleStage?: string;
}): Promise<{ success?: boolean; data?: any; error?: string }> {
  try {
    const supabase = createAdminClient();

    const cleanEmail = data.email.trim().toLowerCase();

    // Check if email already exists
    const { data: existing } = await supabase
      .from("customer_profiles")
      .select("id")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (existing) {
      return { error: `A customer with email "${data.email.trim()}" already exists.` };
    }

    const { data: newCustomer, error } = await supabase
      .from("customer_profiles")
      .insert({
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        email: cleanEmail,
        phone: data.phone?.trim() || null,
        customer_lifecycle_stage: data.lifecycleStage || "PROSPECT",
        is_vip: false,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/customers");
    return { success: true, data: newCustomer };
  } catch (error: any) {
    console.error("[createCustomerAction]", error);
    return { error: error.message || "Failed to create customer" };
  }
}
