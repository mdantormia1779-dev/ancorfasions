import { crmRepository } from '@/repositories/crm.repository';
import { createCRMLeadSchema, updateCRMLeadSchema, createCRMNoteSchema } from '@/schemas/crm.schema';
import { CRMLead, CRMNote, CommunicationLog } from '@/types/crm.types';

export class CRMService {
  async getCustomers() {
    return await crmRepository.getCustomers();
  }

  async getCustomerTimeline(profileId: string) {
    const [notes, logs] = await Promise.all([
      crmRepository.getNotes(profileId),
      crmRepository.getCommunicationLogs(profileId)
    ]);

    // Merge and sort notes and logs by created_at descending
    const timeline = [
      ...notes.map(n => ({ ...n, timeline_type: 'NOTE' })),
      ...logs.map(l => ({ ...l, timeline_type: 'COMMUNICATION' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return timeline;
  }

  async getLeads() {
    return await crmRepository.getLeads();
  }

  async createLead(data: unknown): Promise<CRMLead> {
    const validData = createCRMLeadSchema.parse(data);
    return await crmRepository.createLead(validData);
  }

  async updateLead(id: string, data: unknown): Promise<CRMLead> {
    const validData = updateCRMLeadSchema.parse(data);
    return await crmRepository.updateLead(id, validData);
  }

  async convertLead(id: string, profileId: string): Promise<CRMLead> {
    return await crmRepository.updateLead(id, {
      status: 'converted',
      converted_to_profile_id: profileId,
    });
  }

  async addNoteToCustomer(profileId: string, data: unknown): Promise<CRMNote> {
    const validData = createCRMNoteSchema.parse({ ...data as any, profile_id: profileId });
    return await crmRepository.createNote(validData);
  }

  async logCommunication(data: unknown): Promise<CommunicationLog> {
    // Basic validation could be added here
    return await crmRepository.createCommunicationLog(data as any);
  }
}

export const crmService = new CRMService();
