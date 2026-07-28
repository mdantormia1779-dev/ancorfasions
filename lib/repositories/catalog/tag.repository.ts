import { createClient } from '@/lib/supabase/server';

export class TagRepository {
  static async getTags() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('tags').select('*').order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  }
}
