import { createClient } from '@/lib/supabase/server';
import { CMSPage, CMSSection, CMSNavigation } from '@/types/cms.types';
import { BlogPost, BlogCategory, BlogTag } from '@/types/blog.types';

export class CMSRepository {
  // CMS Pages
  async getPages(): Promise<CMSPage[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('cms_pages').select('*');
    if (error) throw error;
    return data as CMSPage[];
  }

  async getPageById(id: string): Promise<CMSPage> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('cms_pages').select('*').eq('id', id).single();
    if (error) throw error;
    return data as CMSPage;
  }

  async createPage(page: Partial<CMSPage>): Promise<CMSPage> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('cms_pages').insert(page).select().single();
    if (error) throw error;
    return data as CMSPage;
  }

  async updatePage(id: string, page: Partial<CMSPage>): Promise<CMSPage> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('cms_pages').update(page).eq('id', id).select().single();
    if (error) throw error;
    return data as CMSPage;
  }

  // Navigation
  async getNavigation(): Promise<CMSNavigation[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('cms_navigations').select('*');
    if (error) throw error;
    return data as CMSNavigation[];
  }

  // Blog Posts
  async getBlogPosts(): Promise<BlogPost[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as BlogPost[];
  }

  async getBlogPostById(id: string): Promise<BlogPost> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
    if (error) throw error;
    return data as BlogPost;
  }

  async createBlogPost(post: Partial<BlogPost>): Promise<BlogPost> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('blog_posts').insert(post).select().single();
    if (error) throw error;
    return data as BlogPost;
  }

  async updateBlogPost(id: string, post: Partial<BlogPost>): Promise<BlogPost> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('blog_posts').update(post).eq('id', id).select().single();
    if (error) throw error;
    return data as BlogPost;
  }

  async deleteBlogPost(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
  }
}
