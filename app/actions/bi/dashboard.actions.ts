"use server";

import { DashboardRepository } from "@/lib/repositories/bi/dashboard.repository";

const dashboardRepo = new DashboardRepository();

export async function fetchDashboardRevenueAction(days = 7) {
  try {
    const rawData = await dashboardRepo.getDailyRevenue(days);
    const data = rawData || [];

    // Format for charts (e.g. { name: 'Mon', revenue: 45000 })
    const formattedData = data.map((d: any) => {
      const date = new Date(d.date);
      return {
        name: date.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: Number(d.total_revenue),
      };
    });

    return { success: true, data: formattedData };
  } catch (error: any) {
    console.error("fetchDashboardRevenueAction error:", error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function fetchDashboardKPIsAction() {
  try {
    const data = await dashboardRepo.getDashboardKPIs();
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchDashboardKPIsAction error:", error);
    return { success: false, error: error.message, data: null };
  }
}

export async function fetchOperationalMetricsAction() {
  try {
    const data = await dashboardRepo.getOperationalMetrics();
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchOperationalMetricsAction error:", error);
    return { success: false, error: error.message, data: null };
  }
}
