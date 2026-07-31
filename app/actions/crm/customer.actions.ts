"use server";

import { CustomerRepository } from "@/lib/repositories/crm/customer.repository";

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
    return {
      success: false,
      error: error.message,
      data: {
        totalCustomers: 0,
        newCustomers: 0,
        avgLifetimeValue: 0,
        loyaltyMembers: 0,
      },
    };
  }
}

export async function fetchCustomerDetailsAction(id: string) {
  try {
    const profile = await customerRepo.getProfile(id);
    if (!profile) return { success: false, error: "Customer not found" };

    // In a real app we'd fetch actual LTV, tickets count, etc.
    // For now we'll augment the profile with some stats
    const [tickets, loginHistory] = await Promise.all([
      customerRepo.getTickets(id),
      customerRepo.getLoginHistory(id),
    ]);

    return {
      success: true,
      data: {
        profile,
        ticketsCount: tickets?.length || 0,
        tickets: tickets || [],
        loginHistory: loginHistory || [],
        // Mocking some CRM specific data for the UI
        tier: "Gold",
        points: 5400,
        ltv: "$3,200.00",
        segments: ["Active", "Summer Campaign"],
      },
    };
  } catch (error: any) {
    console.error("fetchCustomerDetailsAction error:", error);
    return { success: false, error: error.message };
  }
}
