import { createClient } from '@/lib/supabase/server';
import { 
  SupportTicket, 
  TicketMessage, 
  TicketAttachment, 
  KnowledgeBaseArticle, 
  SupportAgent 
} from '@/types/support.types';

export class SupportRepository {
  async getTickets(): Promise<SupportTicket[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, customer_profiles(*)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getTicketById(id: string): Promise<SupportTicket | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, customer_profiles(*), ticket_messages(*), ticket_attachments(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      throw new Error(error.message);
    }
    return data;
  }

  async createTicket(ticketData: Partial<SupportTicket>): Promise<SupportTicket> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('support_tickets')
      .insert(ticketData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateTicket(id: string, updateData: Partial<SupportTicket>): Promise<SupportTicket> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async createTicketMessage(messageData: Partial<TicketMessage>): Promise<TicketMessage> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*, auth_users(*)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async createTicketAttachment(attachmentData: Partial<TicketAttachment>): Promise<TicketAttachment> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ticket_attachments')
      .insert(attachmentData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getKnowledgeBaseArticles(): Promise<KnowledgeBaseArticle[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getAgents(): Promise<SupportAgent[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('support_agents')
      .select('*, auth_users(*), support_departments(*)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }
}

export const supportRepository = new SupportRepository();
