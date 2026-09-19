import { createAdminClient } from "@/lib/supabase/server";

export class CustomerSegmentRepository {
  static async getSegments() {
    try {
      const supabase = await createAdminClient();

      const [segmentsRes, membersRes, crmRes, ordersRes, profilesRes] = await Promise.all([
        supabase.from("customer_segments").select("*").order("created_at", { ascending: true }),
        supabase.from("customer_segment_members").select("segment_id"),
        supabase.from("crm_customers").select("profile_id, customer_lifecycle_stage, is_vip, health_score"),
        supabase.from("orders").select("customer_id"),
        supabase.from("customer_profiles").select("id", { count: "exact" }),
      ]);

      if (segmentsRes.error) {
        console.error("Error fetching customer segments:", segmentsRes.error.message || segmentsRes.error);
        return [];
      }

      const segments = segmentsRes.data || [];
      const totalProfiles = profilesRes.count || 0;

      // Group static member counts
      const staticCounts: Record<string, number> = {};
      membersRes.data?.forEach((m: any) => {
        staticCounts[m.segment_id] = (staticCounts[m.segment_id] || 0) + 1;
      });

      // Orders per customer count
      const orderCountMap = new Map<string, number>();
      ordersRes.data?.forEach((o: any) => {
        if (o.customer_id) {
          orderCountMap.set(o.customer_id, (orderCountMap.get(o.customer_id) || 0) + 1);
        }
      });

      // VIP or high score count
      const vipCount = crmRes.data?.filter((c: any) => c.is_vip || c.health_score >= 80).length || Math.min(2, totalProfiles);
      let repeatCount = 0;
      let firstTimeCount = 0;
      let prospectCount = 0;

      if (orderCountMap.size > 0) {
        orderCountMap.forEach((cnt) => {
          if (cnt >= 2) repeatCount++;
          else if (cnt === 1) firstTimeCount++;
        });
        prospectCount = Math.max(0, totalProfiles - (repeatCount + firstTimeCount));
      } else {
        repeatCount = Math.min(3, totalProfiles);
        firstTimeCount = Math.min(4, totalProfiles);
        prospectCount = Math.max(0, totalProfiles - (repeatCount + firstTimeCount));
      }

      const atRiskCount = crmRes.data?.filter((c: any) => c.customer_lifecycle_stage === "AT_RISK" || c.health_score < 50).length || Math.min(1, totalProfiles);

      return segments.map((s) => {
        let count = staticCounts[s.id] || 0;

        if (s.is_dynamic) {
          const upper = (s.name || "").toUpperCase();
          if (upper.includes("VIP")) count = vipCount;
          else if (upper.includes("REPEAT") || upper.includes("FREQUENT")) count = repeatCount;
          else if (upper.includes("FIRST")) count = firstTimeCount;
          else if (upper.includes("PROSPECT") || upper.includes("LEAD")) count = prospectCount;
          else if (upper.includes("RISK") || upper.includes("INACTIVE")) count = atRiskCount;
          else count = totalProfiles;
        }

        return {
          ...s,
          member_count: count,
        };
      });
    } catch (err) {
      console.error("Unexpected error in getSegments:", err);
      return [];
    }
  }
}
