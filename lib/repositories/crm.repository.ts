import { createClient } from "@/lib/supabase/server";
import {
  CRMCustomer,
  CRMLead,
  CRMNote,
  CommunicationLog,
} from "@/types/crm.types";

export class CRMRepository {
  async getCustomers(): Promise<CRMCustomer[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("crm_customers").select("*");
    if (error) throw error;
    return data as CRMCustomer[];
  }

  async getCustomerById(id: string): Promise<CRMCustomer> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("crm_customers")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as CRMCustomer;
  }

  async updateCustomer(
    id: string,
    updates: Partial<CRMCustomer>
  ): Promise<CRMCustomer> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("crm_customers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as CRMCustomer;
  }

  async getLeads(): Promise<CRMLead[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("crm_leads").select("*");
    if (error) throw error;
    return data as CRMLead[];
  }

  async getNotes(profileId: string): Promise<CRMNote[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("crm_notes")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as CRMNote[];
  }

  async createNote(note: Partial<CRMNote>): Promise<CRMNote> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("crm_notes")
      .insert(note)
      .select()
      .single();
    if (error) throw error;
    return data as CRMNote;
  }

  async getCommunicationLogs(profileId: string): Promise<CommunicationLog[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("communication_logs")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as CommunicationLog[];
  }
}
