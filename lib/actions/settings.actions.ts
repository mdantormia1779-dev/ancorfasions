"use server";

import { createClient } from "../supabase/server";

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

const DEFAULTS: { store_info: StoreInfo; social_links: SocialLinks } = {
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
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from("settings")
      .upsert(
        {
          key: "store_info",
          value: info,
          description: "Global store contact and branding info",
        },
        { onConflict: "key" }
      );
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSocialLinks(links: SocialLinks) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from("settings")
      .upsert(
        {
          key: "social_links",
          value: links,
          description: "Store social media profile URLs",
        },
        { onConflict: "key" }
      );
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
