import { createClient, createAdminClient } from "@/lib/supabase/server";

export interface SupportTicketRecord {
  id: string;
  ticket_number: number;
  profile_id: string | null;
  subject: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    full_name: string;
    phone?: string | null;
  } | null;
  last_message?: string | null;
  unread_count?: number;
}

export interface TicketMessageRecord {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  sender_type: "CUSTOMER" | "AGENT" | "SYSTEM" | "AI";
  message: string;
  is_internal_note: boolean;
  read_at: string | null;
  created_at: string;
}

export class SupportRepository {
  private static async getClient() {
    try {
      return await createAdminClient();
    } catch {
      return await createClient();
    }
  }

  static async getTickets(): Promise<SupportTicketRecord[]> {
    const supabase = await this.getClient();
    const { data: tickets, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error || !tickets) {
      console.error("Error fetching support tickets:", error);
      return [];
    }

    // Collect profile IDs
    const profileIds = Array.from(
      new Set(tickets.map((t) => t.profile_id).filter(Boolean))
    ) as string[];

    let profilesMap: Record<string, { full_name: string; phone?: string | null }> = {};
    if (profileIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, phone")
        .in("id", profileIds);

      if (profiles) {
        profilesMap = profiles.reduce((acc, p) => {
          const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || "Customer";
          acc[p.id] = { full_name: name, phone: p.phone };
          return acc;
        }, {} as Record<string, { full_name: string; phone?: string | null }>);
      }
    }

    // Attach customer and message stats
    const enriched: SupportTicketRecord[] = await Promise.all(
      tickets.map(async (t) => {
        // Fetch last message
        const { data: lastMsg } = await supabase
          .from("ticket_messages")
          .select("message, created_at, sender_type, read_at")
          .eq("ticket_id", t.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Fetch unread count from customer
        const { count: unreadCount } = await supabase
          .from("ticket_messages")
          .select("id", { count: "exact", head: true })
          .eq("ticket_id", t.id)
          .eq("sender_type", "CUSTOMER")
          .is("read_at", null);

        const cust = t.profile_id && profilesMap[t.profile_id]
          ? { id: t.profile_id, ...profilesMap[t.profile_id] }
          : null;

        return {
          ...t,
          customer: cust,
          last_message: lastMsg?.message || t.description || "Ticket opened",
          unread_count: unreadCount || 0,
        };
      })
    );

    return enriched;
  }

  static async getTicketMessages(ticketId: string): Promise<TicketMessageRecord[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching ticket messages:", error);
      return [];
    }
    return data || [];
  }

  static async sendMessage(params: {
    ticketId: string;
    senderId?: string | null;
    message: string;
    isInternalNote?: boolean;
  }): Promise<TicketMessageRecord> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: params.ticketId,
        sender_id: params.senderId || null,
        sender_type: "AGENT",
        message: params.message.trim(),
        is_internal_note: !!params.isInternalNote,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }

    // Touch ticket updated_at
    await supabase
      .from("support_tickets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", params.ticketId);

    return data;
  }

  static async updateTicketStatus(ticketId: string, status: string): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from("support_tickets")
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(status === "resolved" ? { resolved_at: new Date().toISOString() } : {}),
        ...(status === "closed" ? { closed_at: new Date().toISOString() } : {}),
      })
      .eq("id", ticketId);

    if (error) {
      throw new Error(`Failed to update ticket status: ${error.message}`);
    }
  }

  static async markMessagesRead(ticketId: string): Promise<void> {
    const supabase = await this.getClient();
    await supabase
      .from("ticket_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("ticket_id", ticketId)
      .eq("sender_type", "CUSTOMER")
      .is("read_at", null);
  }

  // --- Instance methods for SupportService compatibility ---
  async getTickets(): Promise<any[]> {
    return SupportRepository.getTickets();
  }

  async getTicketById(id: string): Promise<any> {
    const supabase = await SupportRepository.getClient();
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .select("*, ticket_messages(*)")
      .eq("id", id)
      .maybeSingle();

    if (error || !ticket) {
      const { data: simpleTicket } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!simpleTicket) return null;

      const { data: messages } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", id)
        .order("created_at", { ascending: true });

      return {
        ...simpleTicket,
        ticket_messages: messages || [],
      };
    }
    return ticket;
  }

  async createTicket(data: any): Promise<any> {
    const supabase = await SupportRepository.getClient();
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return ticket;
  }

  async updateTicket(id: string, data: any): Promise<any> {
    const supabase = await SupportRepository.getClient();
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return ticket;
  }

  async createTicketMessage(data: any): Promise<any> {
    const supabase = await SupportRepository.getClient();
    const { data: msg, error } = await supabase
      .from("ticket_messages")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return msg;
  }

  async getKnowledgeBaseArticles(): Promise<any[]> {
    const supabase = await SupportRepository.getClient();
    const { data } = await supabase
      .from("knowledge_base_articles")
      .select("*")
      .order("created_at", { ascending: false });

    return data || [];
  }

  async getAgents(): Promise<any[]> {
    const supabase = await SupportRepository.getClient();
    const { data } = await supabase
      .from("support_agents")
      .select("*")
      .order("created_at", { ascending: false });

    return data || [];
  }

  async createTicketAttachment(data: any): Promise<any> {
    const supabase = await SupportRepository.getClient();
    const { data: att, error } = await supabase
      .from("ticket_attachments")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return att;
  }
}

export const supportRepository = new SupportRepository();

