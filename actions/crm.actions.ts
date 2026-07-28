'use server';

import { revalidatePath } from 'next/cache';
import { crmService } from '@/services/crm.service';
import { CRMLead, CRMNote } from '@/types/crm.types';

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

export async function createLeadAction(data: unknown) {
  try {
    const lead = await crmService.createLead(data);
    revalidatePath('/admin/crm/leads');
    return { data: lead };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateLeadAction(id: string, data: unknown) {
  try {
    const lead = await crmService.updateLead(id, data);
    revalidatePath('/admin/crm/leads');
    return { data: lead };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function convertLeadAction(id: string, profileId: string) {
  try {
    const lead = await crmService.convertLead(id, profileId);
    revalidatePath('/admin/crm/leads');
    revalidatePath('/admin/crm/customers');
    return { data: lead };
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
