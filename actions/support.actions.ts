'use server';

import { revalidatePath } from 'next/cache';
import { supportService } from '@/services/support.service';
import { SupportTicket, TicketMessage } from '@/types/support.types';

export async function getTicketsAction() {
  try {
    const tickets = await supportService.getTickets();
    return { data: tickets };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getTicketDetailsAction(id: string) {
  try {
    const ticket = await supportService.getTicketDetails(id);
    return { data: ticket };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createTicketAction(data: unknown) {
  try {
    const ticket = await supportService.createTicket(data);
    revalidatePath('/admin/support/tickets');
    return { data: ticket };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateTicketAction(id: string, data: unknown) {
  try {
    const ticket = await supportService.updateTicket(id, data);
    revalidatePath(`/admin/support/tickets/${id}`);
    revalidatePath('/admin/support/tickets');
    return { data: ticket };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function assignTicketAction(ticketId: string, agentId: string) {
  try {
    const ticket = await supportService.assignTicket(ticketId, agentId);
    revalidatePath(`/admin/support/tickets/${ticketId}`);
    revalidatePath('/admin/support/tickets');
    return { data: ticket };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addTicketMessageAction(ticketId: string, data: unknown) {
  try {
    const message = await supportService.addMessageToTicket(ticketId, data);
    revalidatePath(`/admin/support/tickets/${ticketId}`);
    return { data: message };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getKnowledgeBaseAction() {
  try {
    const articles = await supportService.getKnowledgeBase();
    return { data: articles };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getAvailableAgentsAction() {
  try {
    const agents = await supportService.getAvailableAgents();
    return { data: agents };
  } catch (error: any) {
    return { error: error.message };
  }
}
