import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { CMSPage, CMSSection, CMSNavigation } from "@/types/cms.types";
import { BlogPost, BlogCategory, BlogTag } from "@/types/blog.types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveCmsFeaturedImage(
  featuredImage: string | null | undefined,
  title?: string
): Promise<string | null> {
  if (!featuredImage) return null;
  const trimmed = featuredImage.trim();
  if (!trimmed) return null;
  if (UUID_REGEX.test(trimmed)) return trimmed;

  try {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("cms_media")
      .select("id")
      .eq("file_url", trimmed)
      .limit(1)
      .maybeSingle();

    if (existing?.id) return existing.id;

    const fileName = title
      ? `${title.slice(0, 40).replace(/[^a-zA-Z0-9_-]/g, "_")}.avif`
      : "cover.avif";

    const { data: created, error: insertError } = await admin
      .from("cms_media")
      .insert({
        file_name: fileName,
        file_url: trimmed,
        file_type: "image/avif",
        file_size_bytes: 0,
      })
      .select("id")
      .single();

    if (created?.id) return created.id;
    if (insertError) {
      console.error("[resolveCmsFeaturedImage insert error]:", insertError);
    }
  } catch (err) {
    console.error("[resolveCmsFeaturedImage error]:", err);
  }

  return trimmed;
}

async function populateCmsMediaUrls(posts: any[]): Promise<void> {
  if (!posts || posts.length === 0) return;
  const uuidMap = new Map<string, string>();
  const uuidsToFetch: string[] = [];

  for (const p of posts) {
    if (p.featured_image && UUID_REGEX.test(p.featured_image)) {
      uuidsToFetch.push(p.featured_image);
    }
  }

  if (uuidsToFetch.length > 0) {
    const uniqueUuids = Array.from(new Set(uuidsToFetch));
    try {
      const admin = createAdminClient();
      const { data: mediaItems } = await admin
        .from("cms_media")
        .select("id, file_url")
        .in("id", uniqueUuids);

      if (mediaItems) {
        for (const m of mediaItems) {
          if (m.file_url) uuidMap.set(m.id, m.file_url);
        }
      }
    } catch (err) {
      console.error("[populateCmsMediaUrls error]:", err);
    }

    for (const p of posts) {
      if (p.featured_image && uuidMap.has(p.featured_image)) {
        p.featured_image = uuidMap.get(p.featured_image);
      }
    }
  }
}

export class CMSRepository {
  // CMS Pages
  async getPages(): Promise<CMSPage[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("cms_pages").select("*");
    if (error) throw error;
    return data as CMSPage[];
  }

  async getPageById(id: string): Promise<CMSPage> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cms_pages")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as CMSPage;
  }

  async createPage(page: Partial<CMSPage>): Promise<CMSPage> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cms_pages")
      .insert(page)
      .select()
      .single();
    if (error) throw error;
    return data as CMSPage;
  }

  async updatePage(id: string, page: Partial<CMSPage>): Promise<CMSPage> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cms_pages")
      .update(page)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as CMSPage;
  }

  // Navigation
  async getNavigation(): Promise<CMSNavigation[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("cms_navigations").select("*");
    if (error) throw error;
    return data as CMSNavigation[];
  }

  // Blog Posts
  async getBlogPosts(): Promise<BlogPost[]> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (data && data.length > 0) {
      await populateCmsMediaUrls(data);
    }
    return (data || []) as BlogPost[];
  }

  async getBlogPostById(id: string): Promise<BlogPost> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    if (data) {
      await populateCmsMediaUrls([data]);
    }
    return data as BlogPost;
  }

  async createBlogPost(post: Partial<BlogPost>): Promise<BlogPost> {
    const admin = createAdminClient();
    const cleaned: any = { ...post };
    if (cleaned.category_id !== undefined) {
      if (!cleaned.category_id || !UUID_REGEX.test(cleaned.category_id)) {
        cleaned.category_id = null;
      }
    }

    if (cleaned.featured_image) {
      const resolvedMediaId = await resolveCmsFeaturedImage(
        cleaned.featured_image,
        cleaned.title
      );
      if (resolvedMediaId) {
        cleaned.featured_image = resolvedMediaId;
      }
    } else {
      cleaned.featured_image = null;
    }

    const { data, error } = await admin
      .from("blog_posts")
      .insert(cleaned)
      .select()
      .single();

    if (error) throw error;
    if (data) await populateCmsMediaUrls([data]);
    return data as BlogPost;
  }

  async updateBlogPost(id: string, post: Partial<BlogPost>): Promise<BlogPost> {
    const admin = createAdminClient();
    const cleaned: any = { ...post };
    if (cleaned.category_id !== undefined) {
      if (!cleaned.category_id || !UUID_REGEX.test(cleaned.category_id)) {
        cleaned.category_id = null;
      }
    }

    if (cleaned.featured_image !== undefined) {
      if (cleaned.featured_image) {
        const resolvedMediaId = await resolveCmsFeaturedImage(
          cleaned.featured_image,
          cleaned.title
        );
        if (resolvedMediaId) {
          cleaned.featured_image = resolvedMediaId;
        }
      } else {
        cleaned.featured_image = null;
      }
    }

    const { data, error } = await admin
      .from("blog_posts")
      .update(cleaned)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (data) await populateCmsMediaUrls([data]);
    return data as BlogPost;
  }

  async deleteBlogPost(id: string): Promise<void> {
    const admin = createAdminClient();
    const { error } = await admin.from("blog_posts").delete().eq("id", id);
    if (error) throw error;
  }
}
