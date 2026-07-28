import { createClient } from '@/lib/supabase/server';

export interface ManagerTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'archived';
  due_date?: string;
  assigned_to?: string;
  created_by?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export class TaskRepository {
  async getTasks(status?: ManagerTask['status']) {
    const supabase = await createClient();
    
    let query = supabase
      .from('manager_tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false });
      
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching manager tasks:', error);
      return [];
    }
    
    return data as ManagerTask[];
  }
}
