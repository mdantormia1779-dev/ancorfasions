"use server";

import { createClient } from "../supabase/server";

export type HeroSlide = {
  id: string;
  media_url: string;
  cta_url: string;
  headline?: string | null;
  subheadline?: string | null;
  cta_text?: string | null;
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
    media_url: "/images/home/hero-banner.png",
    cta_url: "/products?sort=newest",
    display_order: 0,
  },
  {
    id: "default-2",
    media_url: "/images/home/hero-slide-2.png",
    cta_url: "/categories/ethnic",
    display_order: 1,
  },
  {
    id: "default-3",
    media_url: "/images/home/hero-slide-3.png",
    cta_url: "/categories/summer",
    display_order: 2,
  },
];

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const supabase = await createClient();
  try {
    // Join homepage_sections with homepage_hero to get active hero slides
    const { data: sections } = await supabase
      .from("homepage_sections")
      .select("id")
      .eq("section_type", "HERO")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!sections || sections.length === 0) return DEFAULT_SLIDES;

    const sectionIds = sections.map((s) => s.id);
    const { data: heroData } = await supabase
      .from("homepage_hero")
      .select("*")
      .in("section_id", sectionIds)
      .order("id");

    if (!heroData || heroData.length === 0) return DEFAULT_SLIDES;

    return heroData.map((h, i) => ({
      id: h.id,
      media_url: h.media_url,
      cta_url: h.cta_url || "/products",
      headline: h.headline,
      subheadline: h.subheadline,
      cta_text: h.cta_text,
      display_order: i,
    }));
  } catch {
    return DEFAULT_SLIDES;
  }
}

export async function getPromoSections(): Promise<PromoBanner[]> {
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
  slide: Partial<HeroSlide> & { media_url: string; cta_url: string }
) {
  try {
    const supabase = await createClient();

    // Ensure there's a HERO section
    let sectionId: string;
    const { data: existing } = await supabase
      .from("homepage_sections")
      .select("id")
      .eq("section_type", "HERO")
      .order("display_order")
      .limit(1)
      .single();

    if (existing) {
      sectionId = existing.id;
    } else {
      const { data: newSection, error } = await supabase
        .from("homepage_sections")
        .insert({
          title: "Hero Banner",
          section_type: "HERO",
          is_active: true,
          display_order: 0,
        })
        .select("id")
        .single();
      if (error) throw error;
      sectionId = newSection.id;
    }

    const payload = {
      section_id: sectionId,
      media_url: slide.media_url,
      cta_url: slide.cta_url,
      headline: slide.headline ?? null,
      subheadline: slide.subheadline ?? null,
      cta_text: slide.cta_text ?? null,
    };

    const { error } = slide.id
      ? await supabase.from("homepage_hero").update(payload).eq("id", slide.id)
      : await supabase.from("homepage_hero").insert(payload);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteHeroSlide(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("homepage_hero")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
