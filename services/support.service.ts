import { supportRepository } from '@/repositories/support.repository';
import { 
  createSupportTicketSchema, 
  updateSupportTicketSchema, 
  createTicketMessageSchema 
} from '@/schemas/support.schema';
import { SupportTicket, TicketMessage } from '@/types/support.types';

export class SupportService {
  async getTickets() {
    return await supportRepository.getTickets();
  }

  async getTicketDetails(id: string) {
    const ticket = await supportRepository.getTicketById(id);
    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  }

  async createTicket(data: unknown): Promise<SupportTicket> {
    const validData = createSupportTicketSchema.parse(data);
    
    // Evaluate SLAs here (simplified logic)
    let slaBreachAt = new Date();
    if (validData.priority === 'critical') slaBreachAt.setHours(slaBreachAt.getHours() + 1);
    else slaBreachAt.setHours(slaBreachAt.getHours() + 24);

    return await supportRepository.createTicket({
      ...validData,
      sla_breach_at: slaBreachAt.toISOString(),
      status: 'open'
    });
  }

  async updateTicket(id: string, data: unknown): Promise<SupportTicket> {
    const validData = updateSupportTicketSchema.parse(data);
    return await supportRepository.updateTicket(id, validData);
  }

  async addMessageToTicket(ticketId: string, data: unknown): Promise<TicketMessage> {
    const validData = createTicketMessageSchema.parse({ ...data as any, ticket_id: ticketId });
    
    // Automatically update ticket status when agent replies
    if (validData.sender_type === 'AGENT' && !validData.is_internal_note) {
      await supportRepository.updateTicket(ticketId, { status: 'waiting_for_customer' });
    }

    return await supportRepository.createTicketMessage(validData);
  }

  async getKnowledgeBase() {
    return await supportRepository.getKnowledgeBaseArticles();
  }

  async getAvailableAgents() {
    return await supportRepository.getAgents();
  }

  async assignTicket(ticketId: string, agentId: string) {
    return await supportRepository.updateTicket(ticketId, {
      assigned_agent_id: agentId,
      status: 'in_progress'
    });
  }
}

export const supportService = new SupportService();
