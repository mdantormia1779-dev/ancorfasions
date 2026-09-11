import { crmRepository } from "@/repositories/crm.repository";
import {
  createCRMLeadSchema,
  updateCRMLeadSchema,
  createCRMNoteSchema,
} from "@/schemas/crm.schema";
import { CRMLead, CRMNote, CommunicationLog } from "@/types/crm.types";

export class CRMService {
  async getCustomers() {
    return await crmRepository.getCustomers();
  }

  async getCustomerTimeline(profileId: string) {
    const [notes, logs] = await Promise.all([
      crmRepository.getNotes(profileId),
      crmRepository.getCommunicationLogs(profileId),
    ]);

    // Merge and sort notes and logs by created_at descending
    const timeline = [
      ...notes.map((n) => ({ ...n, timeline_type: "NOTE" })),
      ...logs.map((l) => ({ ...l, timeline_type: "COMMUNICATION" })),
    ].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return timeline;
  }

  async getLeads() {
    return await crmRepository.getLeads();
  }

  async getLeadById(id: string): Promise<CRMLead | null> {
    return await crmRepository.getLeadById(id);
  }

  async deleteLead(id: string): Promise<void> {
    await crmRepository.deleteLead(id);
  }

  async createLead(data: unknown): Promise<CRMLead> {
    const validData = createCRMLeadSchema.parse(data);
    return await crmRepository.createLead(validData);
  }

  async updateLead(id: string, data: unknown): Promise<CRMLead> {
    const validData = updateCRMLeadSchema.parse(data);
    return await crmRepository.updateLead(id, validData);
  }

  async convertLead(id: string, profileId?: string): Promise<CRMLead> {
    const updateData: Partial<CRMLead> = {
      status: "converted",
    };
    if (profileId) {
      updateData.converted_to_profile_id = profileId;
    }
    return await crmRepository.updateLead(id, updateData);
  }

  async addNoteToCustomer(profileId: string, data: unknown): Promise<CRMNote> {
    const validData = createCRMNoteSchema.parse({
      ...(data as any),
      profile_id: profileId,
    });
    return await crmRepository.createNote(validData);
  }

  async getLeadNotes(leadId: string): Promise<CRMNote[]> {
    return await crmRepository.getNotes(undefined, leadId);
  }

  async addNoteToLead(leadId: string, content: string): Promise<CRMNote> {
    const validData = createCRMNoteSchema.parse({
      lead_id: leadId,
      content,
      is_pinned: false,
    });
    return await crmRepository.createNote(validData);
  }

  async getLeadCommunicationLogs(leadId: string): Promise<CommunicationLog[]> {
    return await crmRepository.getCommunicationLogs(undefined, leadId);
  }

  async logCommunication(data: unknown): Promise<CommunicationLog> {
    return await crmRepository.createCommunicationLog(data as any);
  }

  async getCommunicationLogs(): Promise<CommunicationLog[]> {
    return await crmRepository.getCommunicationLogs();
  }
}

export const crmService = new CRMService();
