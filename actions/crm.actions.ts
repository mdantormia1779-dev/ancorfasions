"use server";

import { revalidatePath } from "next/cache";
import { crmService } from "@/services/crm.service";
import { CRMLead, CRMNote } from "@/types/crm.types";

export async function getCustomersAction() {
  try {
    const customers = await crmService.getCustomers();
    return { data: customers };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getCustomerTimelineAction(profileId: string) {
  try {
    const timeline = await crmService.getCustomerTimeline(profileId);
    return { data: timeline };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getLeadsAction() {
  try {
    const leads = await crmService.getLeads();
    return { data: leads };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getLeadByIdAction(id: string) {
  try {
    const lead = await crmService.getLeadById(id);
    return { data: lead };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteLeadAction(id: string) {
  try {
    await crmService.deleteLead(id);
    revalidatePath("/admin/crm/leads");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createLeadAction(data: unknown) {
  try {
    const lead = await crmService.createLead(data);
    revalidatePath("/admin/crm/leads");
    return { data: lead };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateLeadAction(id: string, data: unknown) {
  try {
    const lead = await crmService.updateLead(id, data);
    revalidatePath("/admin/crm/leads");
    return { data: lead };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function convertLeadAction(id: string, profileId?: string) {
  try {
    const lead = await crmService.convertLead(id, profileId);
    revalidatePath("/admin/crm/leads");
    revalidatePath("/admin/crm/customers");
    return { data: lead };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getLeadNotesAction(leadId: string) {
  try {
    const notes = await crmService.getLeadNotes(leadId);
    return { data: notes };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addLeadNoteAction(leadId: string, content: string) {
  try {
    const note = await crmService.addNoteToLead(leadId, content);
    revalidatePath("/admin/crm/leads");
    return { data: note };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getLeadCommunicationLogsAction(leadId: string) {
  try {
    const logs = await crmService.getLeadCommunicationLogs(leadId);
    return { data: logs };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function addCustomerNoteAction(profileId: string, data: unknown) {
  try {
    const note = await crmService.addNoteToCustomer(profileId, data);
    revalidatePath(`/admin/crm/customers/${profileId}`);
    return { data: note };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getCommunicationLogsAction() {
  try {
    const logs = await crmService.getCommunicationLogs();
    return { data: logs };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function logCommunicationAction(data: {
  type: "EMAIL" | "SMS" | "IN_APP" | "PUSH" | "CALL" | "MEETING";
  direction: "INBOUND" | "OUTBOUND";
  subject?: string;
  content: string;
  lead_id?: string;
  profile_id?: string;
}) {
  try {
    const log = await crmService.logCommunication(data);
    revalidatePath("/admin/crm/messages");
    return { data: log };
  } catch (error: any) {
    return { error: error.message };
  }
}

