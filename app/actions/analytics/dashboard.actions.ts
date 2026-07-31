"use server";

import { AnalyticsService } from "@/services/analytics.service";
import { DateRange } from "@/repositories/analytics.repository";

export async function getExecutiveSummaryAction(dateRange?: DateRange) {
  try {
    const data = await AnalyticsService.getExecutiveSummary(dateRange);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSalesAnalyticsAction(dateRange?: DateRange) {
  try {
    const data = await AnalyticsService.getSalesAnalytics(dateRange);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getOrderAnalyticsAction(dateRange?: DateRange) {
  try {
    const data = await AnalyticsService.getOrderAnalytics(dateRange);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCustomerAnalyticsAction(dateRange?: DateRange) {
  try {
    const data = await AnalyticsService.getCustomerAnalytics(dateRange);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getProductAnalyticsAction() {
  try {
    const data = await AnalyticsService.getProductAnalytics();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getInventoryAnalyticsAction() {
  try {
    const data = await AnalyticsService.getInventoryAnalytics();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMarketingAnalyticsAction(dateRange?: DateRange) {
  try {
    const data = await AnalyticsService.getMarketingAnalytics(dateRange);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
