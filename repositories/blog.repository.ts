import { createClient } from '@/lib/supabase/server';
import { BlogPost, BlogCategory, BlogTag } from '@/types/blog.types';

export class BlogRepository {
  async getPosts(status?: string): Promise<BlogPost[]> {
    const supabase = await createClient();
    let query = supabase.from('blog_posts').select('*, blog_categories(*)').order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, blog_categories(*), blog_post_tags(blog_tags(*))')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data;
  }

  async createPost(post: Partial<BlogPost>): Promise<BlogPost> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(post)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deletePost(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async getCategories(): Promise<BlogCategory[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('blog_categories').select('*').order('name');
    if (error) throw new Error(error.message);
    return data;
  }

  async getTags(): Promise<BlogTag[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('blog_tags').select('*').order('name');
    if (error) throw new Error(error.message);
    return data;
  }
}
