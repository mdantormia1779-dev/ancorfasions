"use server";

import { cmsService } from "@/services/cms.service";
import { CMSPage, CMSSection, CMSNavigation, CMSPageBlock, CMSMediaItem } from "@/types/cms.types";
import { revalidatePath } from "next/cache";
import { invalidateHomepageCache } from "@/lib/cache/invalidate-catalog";

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

export async function getPageBlocks(pageId: string): Promise<CMSPageBlock[]> {
  return await cmsService.getPageBlocks(pageId);
}

export async function savePageBlocks(pageId: string, blocks: Partial<CMSPageBlock>[]): Promise<void> {
  await cmsService.savePageBlocks(pageId, blocks);
  revalidatePath("/admin/cms");
  // Might want to revalidate the exact public page here if we know the slug
}

export async function getGlobalSections(): Promise<CMSSection[]> {
  return await cmsService.getGlobalSections();
}

export async function getNavigation(
  location: string
): Promise<CMSNavigation | null> {
  return await cmsService.getNavigation(location);
}

export async function getAllNavigations(): Promise<CMSNavigation[]> {
  return await cmsService.getAllNavigations();
}

export async function saveNavigation(
  location: string,
  name: string,
  items: any[]
): Promise<CMSNavigation> {
  try {
    const nav = await cmsService.saveNavigation(location, name, items);
    revalidatePath("/admin/cms/menus");
    return nav;
  } catch (err: any) {
    console.error("Error in saveNavigation:", err);
    throw new Error(err.message || "Failed to save navigation");
  }
}

export async function deleteNavigation(id: string): Promise<void> {
  try {
    await cmsService.deleteNavigation(id);
    revalidatePath("/admin/cms/menus");
  } catch (err: any) {
    console.error("Error in deleteNavigation:", err);
    throw new Error(err.message || "Failed to delete navigation");
  }
}

// Media
export async function getMedia(): Promise<CMSMediaItem[]> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("cms_media")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error in getMedia:", error.message);
      return [];
    }
    return (data || []) as CMSMediaItem[];
  } catch (err) {
    console.error("Failed to fetch media:", err);
    return [];
  }
}

export async function uploadMedia(formData: FormData) {
  const fileEntries = formData.getAll("files").concat(formData.getAll("file")) as File[];
  const validFiles = fileEntries.filter(
    (f): f is File => f && typeof f !== "string" && typeof f.size === "number" && f.size > 0
  );

  if (validFiles.length === 0) {
    throw new Error("No valid files uploaded");
  }

  const { createAdminClient, createClient } = await import("@/lib/supabase/server");
  const adminSupabase = await createAdminClient();

  // Safely get logged-in user without breaking if session is absent
  let userId: string | null = null;
  try {
    const userClient = await createClient();
    const { data } = await userClient.auth.getUser();
    userId = data?.user?.id || null;
  } catch {
    userId = null;
  }

  const uploadedRecords: CMSMediaItem[] = [];

  for (const file of validFiles) {
    const fileExt = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const sanitizedBase = file.name
      .substring(0, file.name.lastIndexOf(".") > 0 ? file.name.lastIndexOf(".") : file.name.length)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 30);
    const fileName = `${Date.now()}_${sanitizedBase}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = fileName;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await adminSupabase.storage
      .from("media")
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
    }

    const { data: publicUrlData } = adminSupabase.storage
      .from("media")
      .getPublicUrl(filePath);

    const { data: dbData, error: dbError } = await adminSupabase
      .from("cms_media")
      .insert({
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
        file_type: file.type || "application/octet-stream",
        file_size_bytes: file.size,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      throw new Error(`Database record creation failed for ${file.name}: ${dbError.message}`);
    }

    uploadedRecords.push(dbData as CMSMediaItem);
  }

  revalidatePath("/admin/cms/media");
  return { success: true, count: uploadedRecords.length, data: uploadedRecords };
}

export async function deleteMedia(id: string, fileUrl?: string) {
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = await createAdminClient();

    // Remove from storage bucket if fileUrl is provided
    if (fileUrl) {
      try {
        const url = new URL(fileUrl);
        const match = url.pathname.match(/\/media\/(.+)$/);
        if (match && match[1]) {
          const storagePath = decodeURIComponent(match[1]);
          await supabase.storage.from("media").remove([storagePath]);
        }
      } catch (storageErr) {
        console.warn("Storage removal non-fatal error:", storageErr);
      }
    }

    const { error } = await supabase.from("cms_media").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/admin/cms/media");
    return { success: true };
  } catch (err: any) {
    console.error("Delete media error:", err);
    return { success: false, error: err.message };
  }
}

export async function seedSampleMedia() {
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = await createAdminClient();

    const sampleAssets = [
      {
        file_name: "hero-summer-collection.jpg",
        file_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
        file_type: "image/jpeg",
        file_size_bytes: 1845200,
        alt_text: "Summer Luxury Fashion Collection",
      },
      {
        file_name: "fashion-autumn-coat.jpg",
        file_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop",
        file_type: "image/jpeg",
        file_size_bytes: 2154000,
        alt_text: "Autumn Winter Designer Overcoat",
      },
      {
        file_name: "lookbook-streetwear-hoodie.jpg",
        file_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop",
        file_type: "image/jpeg",
        file_size_bytes: 1420300,
        alt_text: "Urban Streetwear Premium Hoodie",
      },
      {
        file_name: "accessories-luxury-handbag.jpg",
        file_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop",
        file_type: "image/jpeg",
        file_size_bytes: 980400,
        alt_text: "Italian Leather Luxury Handbag",
      },
      {
        file_name: "footwear-minimalist-sneaker.jpg",
        file_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop",
        file_type: "image/jpeg",
        file_size_bytes: 1120000,
        alt_text: "Minimalist Leather Craft Sneaker",
      },
      {
        file_name: "brand-lookbook-2026.pdf",
        file_url: "https://example.com/assets/lookbook-2026.pdf",
        file_type: "application/pdf",
        file_size_bytes: 4500000,
        alt_text: "Anchor Fashion Official Lookbook 2026",
      },
    ];

    const { data, error } = await supabase
      .from("cms_media")
      .insert(sampleAssets)
      .select();

    if (error) throw new Error(error.message);

    revalidatePath("/admin/cms/media");
    return { success: true, count: data?.length || 0 };
  } catch (err: any) {
    console.error("Failed to seed sample media:", err);
    return { success: false, error: err.message };
  }
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
  try {
    const { getPublicSupabaseClient } = await import("@/lib/supabase/public");
    const supabase = getPublicSupabaseClient();
    const { data: banners } = await supabase
      .from("banners")
      .select("*")
      .eq("placement", "HERO")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!banners || banners.length === 0) return DEFAULT_SLIDES;

    return (banners as any[]).map((b: any, i: number) => ({
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
  try {
    const { getPublicSupabaseClient } = await import("@/lib/supabase/public");
    const supabase = getPublicSupabaseClient();
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("homepage_promotions")
      .select("*")
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order("id");
    return (data as any[]) ?? [];
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

export async function upsertHeroSlideWithUpload(formData: FormData) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const id = formData.get("id") as string | null;
    const link_url = formData.get("link_url") as string || "/products";
    const display_order = formData.get("display_order") as string || "0";
    let image_url = formData.get("image_url") as string || "";
    
    // For alt_text, we will save it by combining it with link_url in a small JSON or just append as query param?
    // Actually, since there's no alt_text column, we will just use the title column if we were using cms_banners.
    // For now, we will ignore saving it in the db because the 'banners' table has no alt_text column.
    const file = formData.get("file") as File | null;

    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { data, error } = await supabase.storage
        .from("banners")
        .upload(filePath, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("banners")
        .getPublicUrl(filePath);

      image_url = publicUrlData.publicUrl;
    }

    if (!image_url) {
      throw new Error("Image is required");
    }

    const payload = {
      image_url,
      link_url,
      placement: "HERO",
      is_active: true,
      display_order: parseInt(display_order, 10),
    };

    const { error } = id
      ? await supabase.from("banners").update(payload).eq("id", id)
      : await supabase.from("banners").insert(payload);

    if (error) throw error;
    invalidateHomepageCache();
    return { success: true, image_url };
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
    invalidateHomepageCache();
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
