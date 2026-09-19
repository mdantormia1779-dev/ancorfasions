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
      })
      .select()
      .single();

    if (error) throw error;

    if (newCustomer?.id) {
      await supabase.from("crm_customers").insert({
        profile_id: newCustomer.id,
        customer_lifecycle_stage: data.lifecycleStage || "PROSPECT",
        is_vip: false,
        health_score: 80,
        total_support_tickets: 0,
        last_interaction_at: new Date().toISOString(),
      });
    }

    revalidatePath("/admin/customers");
    return { success: true, data: newCustomer };
  } catch (error: any) {
    console.error("[createCustomerAction]", error);
    return { error: error.message || "Failed to create customer" };
  }
}
