import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CustomerProfile,
  CustomerAddress,
  CustomerReview,
  CustomerNotification,
} from "@/types/customer.types";

export class CustomerRepository {
  static async getProfile(userId: string): Promise<CustomerProfile | null> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data) return data;

      const admin = createAdminClient();
      const { data: adminData } = await admin
        .from("customer_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      return adminData;
    } catch (e) {
      console.error("Error fetching profile:", e);
      return null;
    }
  }

  static async updateProfile(
    userId: string,
    updates: Partial<CustomerProfile>
  ): Promise<CustomerProfile | null> {
    try {
      const admin = createAdminClient();

      // First try to update existing record
      const { data: updated, error: updateErr } = await admin
        .from("customer_profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .maybeSingle();

      if (updated) {
        return updated;
      }

      // If no row existed, obtain user email to satisfy the NOT NULL constraint on insert
      let email = updates.email;
      if (!email) {
        const { data: authData } = await admin.auth.admin.getUserById(userId);
        email = authData?.user?.email || "";
      }

      const { data: inserted, error: insertErr } = await admin
        .from("customer_profiles")
        .upsert({
          id: userId,
          email,
          ...updates,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertErr) {
        console.error("Error updating profile:", insertErr);
        throw new Error(insertErr.message);
      }
      return inserted;
    } catch (e) {
      console.error("Error in updateProfile:", e);
      throw e;
    }
  }

  static async getAddresses(userId: string): Promise<CustomerAddress[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", userId)
      .order("is_default_shipping", { ascending: false });

    if (error) {
      console.error("Error fetching addresses:", error);
      return [];
    }
    return data;
  }

  static async addAddress(
    userId: string,
    address: Partial<CustomerAddress>
  ): Promise<CustomerAddress> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customer_addresses")
      .insert([{ ...address, customer_id: userId }])
      .select()
      .single();

    if (error) {
      console.error("Error adding address:", error);
      throw new Error(error.message);
    }
    return data;
  }

  static async getReviews(userId: string): Promise<CustomerReview[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customer_reviews")
      .select("*, products(name, product_media(url_webp))")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
    return data;
  }

  static async deactivateProfile(userId: string): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("customer_profiles")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("Error deactivating customer profile:", error);
      throw new Error(error.message);
    }
    return true;
  }

  static async deleteProfile(userId: string): Promise<boolean> {
    const supabase = await createClient();
    // Delete related customer addresses first
    await supabase.from("customer_addresses").delete().eq("customer_id", userId);
    // Delete customer profile
    const { error } = await supabase
      .from("customer_profiles")
      .delete()
      .eq("id", userId);

    if (error) {
      console.error("Error deleting customer profile:", error);
      throw new Error(error.message);
    }
    return true;
  }

  // --- CRM Additions ---

  static async logActivity(userId: string, activityType: string, metadata: any = {}) {
    const supabase = await createClient();
    const { error } = await supabase.from("customer_activity_logs").insert([
      { user_id: userId, activity_type: activityType, metadata }
    ]);
    if (error) {
      console.error("Failed to log customer activity:", error);
    }
  }

  static async getCustomerCRMStats(userId: string) {
    const supabase = await createClient();
    
    const [ordersRes, activityRes, segmentsRes] = await Promise.all([
      supabase.from("orders").select("grand_total, created_at").eq("customer_id", userId),
      supabase.from("customer_activity_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
      supabase.from("user_segments").select("customer_segments(name, description)").eq("user_id", userId)
    ]);

    const orders = ordersRes.data || [];
    const lifetimeValue = orders.reduce((sum, order) => sum + (Number(order.grand_total) || 0), 0);
    const orderCount = orders.length;

    return {
      lifetimeValue,
      orderCount,
      recentActivity: activityRes.data || [],
      segments: segmentsRes.data?.map(s => s.customer_segments) || []
    };
  }
}

