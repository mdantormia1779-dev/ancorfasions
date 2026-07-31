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
