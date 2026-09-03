import { createClient } from "@/lib/supabase/server";
import { CMSPage, CMSSection, CMSNavigation, CMSPageBlock } from "@/types/cms.types";

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

  async getPageBlocks(pageId: string): Promise<CMSPageBlock[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cms_page_blocks")
      .select("*")
      .eq("page_id", pageId)
      .order("display_order", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async savePageBlocks(pageId: string, blocks: Partial<CMSPageBlock>[]): Promise<void> {
    const supabase = await createClient();
    // Simple sync: delete existing blocks and insert new ones
    const { error: deleteError } = await supabase
      .from("cms_page_blocks")
      .delete()
      .eq("page_id", pageId);

    if (deleteError) throw new Error(deleteError.message);

    if (blocks.length > 0) {
      const inserts = blocks.map((b, idx) => ({
        page_id: pageId,
        section_type: b.section_type,
        content_json: b.content_json,
        display_order: idx,
        is_active: b.is_active ?? true,
      }));
      const { error: insertError } = await supabase
        .from("cms_page_blocks")
        .insert(inserts);

      if (insertError) throw new Error(insertError.message);
    }
  }

  async getNavigationByLocation(
    location: string
  ): Promise<CMSNavigation | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cms_menus")
      .select("*")
      .eq("location", location)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return {
      ...data,
      items: data.menu_structure || [],
    };
  }

  async saveNavigation(location: string, name: string, items: any[]): Promise<CMSNavigation> {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("cms_menus")
      .upsert({ location, name, menu_structure: items }, { onConflict: "location" })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return {
      ...data,
      items: data.menu_structure || [],
    };
  }
}
