import { createClient } from '@/lib/supabase/server';
import { CRMCustomer, CRMLead, CRMNote, CommunicationLog } from '@/types/crm.types';

export class CRMRepository {
  async getCustomers(): Promise<CRMCustomer[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('crm_customers')
      .select('*, customer_profiles(*)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getCustomerById(id: string): Promise<CRMCustomer | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('crm_customers')
      .select('*, customer_profiles(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      throw new Error(error.message);
    }
    return data;
  }

  async getLeads(): Promise<CRMLead[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async createLead(leadData: Partial<CRMLead>): Promise<CRMLead> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('crm_leads')
      .insert(leadData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateLead(id: string, updateData: Partial<CRMLead>): Promise<CRMLead> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('crm_leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getNotes(profileId?: string, leadId?: string): Promise<CRMNote[]> {
    const supabase = await createClient();
    let query = supabase.from('crm_notes').select('*').order('created_at', { ascending: false });
    
    if (profileId) {
      query = query.eq('profile_id', profileId);
    } else if (leadId) {
      query = query.eq('lead_id', leadId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async createNote(noteData: Partial<CRMNote>): Promise<CRMNote> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('crm_notes')
      .insert(noteData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getCommunicationLogs(profileId?: string, leadId?: string): Promise<CommunicationLog[]> {
    const supabase = await createClient();
    let query = supabase.from('communication_logs').select('*').order('created_at', { ascending: false });
    
    if (profileId) {
      query = query.eq('profile_id', profileId);
    } else if (leadId) {
      query = query.eq('lead_id', leadId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async createCommunicationLog(logData: Partial<CommunicationLog>): Promise<CommunicationLog> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('communication_logs')
      .insert(logData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

export const crmRepository = new CRMRepository();
