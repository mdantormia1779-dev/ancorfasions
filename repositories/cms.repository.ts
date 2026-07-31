import { createClient } from "@/lib/supabase/server";
import { CMSPage, CMSSection, CMSNavigation } from "@/types/cms.types";

export class CMSRepository {
  async getPages(): Promise<CMSPage[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cms_pages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getPageBySlug(slug: string): Promise<CMSPage | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cms_pages")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return data;
  }

  async createPage(page: Partial<CMSPage>): Promise<CMSPage> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cms_pages")
      .insert(page)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updatePage(id: string, updates: Partial<CMSPage>): Promise<CMSPage> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cms_pages")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deletePage(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("cms_pages").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async getGlobalSections(): Promise<CMSSection[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cms_sections")
      .select("*")
      .eq("is_global", true);

    if (error) throw new Error(error.message);
    return data;
  }

  async getNavigationByLocation(
    location: string
  ): Promise<CMSNavigation | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cms_navigation")
      .select("*")
      .eq("location", location)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return data;
  }
}
