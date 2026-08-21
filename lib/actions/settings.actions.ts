"use server";

import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin-client";
import { verifySuperAdmin } from "../security/roles";
import { revalidatePath } from "next/cache";

export type StoreInfo = {
  store_name: string;
  store_description: string;
  phone: string;
  email: string;
  address: string;
  announcement_bar: string;
  free_shipping_threshold: string;
};

export type SocialLinks = {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
};

export type StoreConfig = {
  store_name: string;
  currency: string;
  timezone: string;
  weight_unit: string;
};

const DEFAULTS: { store_info: StoreInfo; social_links: SocialLinks; store_config: StoreConfig } = {
  store_info: {
    store_name: "Anchor Fashion Enterprise",
    store_description:
      "Premium apparel for the modern professional. Elevate your wardrobe with our carefully curated collections.",
    phone: "+880 1234-567890",
    email: "support@anchorfashion.com",
    address: "Dhaka, Bangladesh",
    announcement_bar:
      "🚚 Free Shipping On Orders Over ৳999 | Easy Returns & Exchanges",
    free_shipping_threshold: "999",
  },
  social_links: {
    facebook: "#",
    instagram: "#",
    twitter: "#",
    youtube: "#",
    tiktok: "#",
  },
  store_config: {
    store_name: "Anchor Fashion",
    currency: "BDT (৳)",
    timezone: "Asia/Dhaka (GMT+6)",
    weight_unit: "kg",
  }
};

export async function getStoreInfo(): Promise<StoreInfo> {
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "store_info")
      .single();
    return (data?.value as StoreInfo) ?? DEFAULTS.store_info;
  } catch {
    return DEFAULTS.store_info;
  }
}

export async function getSocialLinks(): Promise<SocialLinks> {
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "social_links")
      .single();
    return (data?.value as SocialLinks) ?? DEFAULTS.social_links;
  } catch {
    return DEFAULTS.social_links;
  }
}

export async function updateStoreInfo(info: StoreInfo) {
  try {
    await verifySuperAdmin(); // Enforce strict role-based access
    const supabase = createAdminClient(); // Bypass RLS securely for writing settings

    const { error } = await supabase
      .from("settings")
      .upsert(
        {
          key: "store_info",
          value: info as any,
          description: "Global store contact and branding info",
        },
        { onConflict: "key" }
      );
      
    if (error) throw error;
    
    revalidatePath("/", "layout"); // Revalidate entire app to update announcement bar and footers
    return { success: true };
  } catch (error: any) {
    console.error("[updateStoreInfo]", error);
    return { success: false, error: error.message };
  }
}

export async function updateSocialLinks(links: SocialLinks) {
  try {
    await verifySuperAdmin(); // Enforce strict role-based access
    const supabase = createAdminClient(); // Bypass RLS securely for writing settings

    const { error } = await supabase
      .from("settings")
      .upsert(
        {
          key: "social_links",
          value: links as any,
          description: "Store social media profile URLs",
        },
        { onConflict: "key" }
      );
      
    if (error) throw error;
    
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("[updateSocialLinks]", error);
    return { success: false, error: error.message };
  }
}

export async function getStoreConfig(): Promise<StoreConfig> {
  const supabase = await createClient();
  try {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "store_config")
      .single();
    return (data?.value as StoreConfig) ?? DEFAULTS.store_config;
  } catch {
    return DEFAULTS.store_config;
  }
}

export async function updateStoreConfig(config: StoreConfig) {
  try {
    await verifySuperAdmin();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("settings")
      .upsert(
        {
          key: "store_config",
          value: config as any,
          description: "Global store configuration",
        },
        { onConflict: "key" }
      );
      
    if (error) throw error;
    
    revalidatePath("/admin/settings/store");
    return { success: true };
  } catch (error: any) {
    console.error("[updateStoreConfig]", error);
    return { success: false, error: error.message };
  }
}
