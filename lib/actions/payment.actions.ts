"use server";

import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin-client";
import { verifySuperAdmin } from "../security/roles";
import { revalidatePath } from "next/cache";

export type PaymentGatewayConfig = {
  enabled: boolean;
  store_id?: string;
  store_password?: string;
  sandbox?: boolean;
};

const DEFAULTS = {
  sslcommerz: {
    enabled: true,
    store_id: "",
    store_password: "",
    sandbox: true,
  },
  cod: {
    enabled: true,
  }
};

export async function getPaymentConfig(gateway: "sslcommerz" | "cod"): Promise<PaymentGatewayConfig> {
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", `payment_${gateway}`)
      .single();
    
    return (data?.value as PaymentGatewayConfig) ?? DEFAULTS[gateway];
  } catch {
    return DEFAULTS[gateway];
  }
}

export async function updatePaymentConfig(gateway: "sslcommerz" | "cod", config: PaymentGatewayConfig) {
  try {
    await verifySuperAdmin(); // Enforce strict role-based access
    const supabase = createAdminClient(); // Bypass RLS securely for writing settings

    const { error } = await supabase
      .from("settings")
      .upsert(
        {
          key: `payment_${gateway}`,
          value: config as any,
          description: `${gateway.toUpperCase()} Configuration`,
        },
        { onConflict: "key" }
      );
      
    if (error) throw error;
    
    revalidatePath("/admin/settings/payment");
    return { success: true };
  } catch (error: any) {
    console.error(`[updatePaymentConfig] ${gateway}`, error);
    return { success: false, error: error.message };
  }
}
