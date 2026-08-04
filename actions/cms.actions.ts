"use server";

import { cmsService } from "@/services/cms.service";
import { CMSPage, CMSSection, CMSNavigation } from "@/types/cms.types";
import { revalidatePath } from "next/cache";

export async function getPages(): Promise<CMSPage[]> {
  return await cmsService.getPages();
}

export async function getPageBySlug(slug: string): Promise<CMSPage | null> {
  return await cmsService.getPageBySlug(slug);
}

export async function createPage(data: unknown): Promise<CMSPage> {
  const page = await cmsService.createPage(data);
  revalidatePath("/admin/cms");
  return page;
}

export async function updatePage(id: string, data: unknown): Promise<CMSPage> {
  const page = await cmsService.updatePage(id, data);
  revalidatePath("/admin/cms");
  if (page.slug) {
    revalidatePath(`/${page.slug}`);
  }
  return page;
}

export async function deletePage(id: string): Promise<void> {
  await cmsService.deletePage(id);
  revalidatePath("/admin/cms");
}

export async function getGlobalSections(): Promise<CMSSection[]> {
  return await cmsService.getGlobalSections();
}

export async function getNavigation(
  location: string
): Promise<CMSNavigation | null> {
  return await cmsService.getNavigation(location);
}

// Media
export async function getMedia() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_media")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// Banners
export async function getBanners() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_banners")
    .select("*")
    .order("created_at", { ascending: false });
  if (error && error.code !== "42P01") throw new Error(error.message);
  return data || [];
}

// SEO
export async function getSeoSettings() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cms_seo_redirects")
    .select("*")
    .limit(10);
  if (error && error.code !== "42P01") throw new Error(error.message);
  return data || [];
}

export type HeroSlide = {
  id: string;
  image_url: string;
  link_url?: string | null;
  display_order: number;
};

export type PromoBanner = {
  id: string;
  title: string | null;
  description: string | null;
  image_desktop: string;
  cta_text: string | null;
  cta_url: string | null;
  bg_color: string | null;
};

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "default-1",
    image_url: "/images/home/hero-banner.png",
    link_url: "/products?sort=newest",
    display_order: 0,
  },
  {
    id: "default-2",
    image_url: "/images/home/hero-slide-2.png",
    link_url: "/categories/ethnic",
    display_order: 1,
  },
  {
    id: "default-3",
    image_url: "/images/home/hero-slide-3.png",
    link_url: "/categories/summer",
    display_order: 2,
  },
];

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  try {
    const { data: banners } = await supabase
      .from("banners")
      .select("*")
      .eq("placement", "HERO")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!banners || banners.length === 0) return DEFAULT_SLIDES;

    return banners.map((b, i) => ({
      id: b.id,
      image_url: b.image_url,
      link_url: b.link_url || "/products",
      display_order: i,
    }));
  } catch {
    return DEFAULT_SLIDES;
  }
}

export async function getPromoSections(): Promise<PromoBanner[]> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  try {
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("homepage_promotions")
      .select("*")
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order("id");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function upsertHeroSlide(
  slide: Partial<HeroSlide> & { image_url: string; link_url: string }
) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const payload = {
      image_url: slide.image_url,
      link_url: slide.link_url,
      placement: "HERO",
      is_active: true,
    };

    const { error } = slide.id
      ? await supabase.from("banners").update(payload).eq("id", slide.id)
      : await supabase.from("banners").insert(payload);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteHeroSlide(id: string) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase
      .from("banners")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSeoSettings(data: any) {
  // Mock saving global SEO settings since there isn't a dedicated table structure for global SEO fields
  console.log("Saving global SEO settings", data);
  return { success: true };
}
