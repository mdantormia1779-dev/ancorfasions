'use server';

import { CustomerRepository } from '@/lib/repositories/crm/customer.repository';

const customerRepo = new CustomerRepository();

export async function fetchCustomersAction(limit?: number) {
  try {
    const data = await customerRepo.getCustomerProfiles(limit);
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchCustomersAction error:", error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function fetchCustomerSegmentsAction() {
  try {
    const data = await customerRepo.getCustomerSegments();
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchCustomerSegmentsAction error:", error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function fetchLoyaltyStatsAction() {
  try {
    const data = await customerRepo.getLoyaltyStats();
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchLoyaltyStatsAction error:", error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function fetchCRMSummaryAction() {
  try {
    const data = await customerRepo.getCRMSummary();
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchCRMSummaryAction error:", error);
    // Return safe fallback
    return { success: false, error: error.message, data: {
      totalCustomers: 0,
      newCustomers: 0,
      avgLifetimeValue: 0,
      loyaltyMembers: 0
    }};
  }
}
