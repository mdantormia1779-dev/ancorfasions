import { createClient } from "@/lib/supabase/server";
import {
  SupportTicket,
  TicketMessage,
  TicketAttachment,
} from "@/types/support.types";

export class SupportRepository {
  async getTickets(): Promise<SupportTicket[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as SupportTicket[];
  }

  async getTicketById(id: string): Promise<SupportTicket> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as SupportTicket;
  }

  async createTicket(ticket: Partial<SupportTicket>): Promise<SupportTicket> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("support_tickets")
      .insert(ticket)
      .select()
      .single();
    if (error) throw error;
    return data as SupportTicket;
  }

  async updateTicket(
    id: string,
    updates: Partial<SupportTicket>
  ): Promise<SupportTicket> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("support_tickets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as SupportTicket;
  }

  async getMessages(ticketId: string): Promise<TicketMessage[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data as TicketMessage[];
  }

  async addMessage(message: Partial<TicketMessage>): Promise<TicketMessage> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ticket_messages")
      .insert(message)
      .select()
      .single();
    if (error) throw error;
    return data as TicketMessage;
  }
}
