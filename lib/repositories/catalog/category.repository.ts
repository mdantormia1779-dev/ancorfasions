import { createClient } from '@/lib/supabase/server';

export class CategoryRepository {
  /**
   * Retrieves all categories, optionally filtered by active status.
   */
  static async getCategories(activeOnly: boolean = true) {
    const supabase = await createClient();
    let query = supabase.from('categories').select('*').order('display_order', { ascending: true });
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}
