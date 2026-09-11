import { createAdminClient } from "@/lib/supabase/admin-client";

export interface CouponRecord {
  id: string;
  code: string;
  discount_type: "PERCENTAGE" | "FIXED";
  value: number;
  min_order_value?: number | null;
  max_discount?: number | null;
  usage_limit?: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateCouponInput {
  code: string;
  discount_type: "PERCENTAGE" | "FIXED";
  value: number;
  min_order_value?: number | null;
  max_discount?: number | null;
  usage_limit?: number | null;
  valid_from: string;
  valid_until: string;
  is_active?: boolean;
}

export class CouponRepository {
  private static getAdminClient() {
    return createAdminClient();
  }

  static async getCoupons(): Promise<CouponRecord[]> {
    try {
      const supabase = this.getAdminClient();
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching coupons:", error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        code: row.code,
        discount_type: row.discount_type,
        value: Number(row.value),
        min_order_value: row.min_order_value ? Number(row.min_order_value) : null,
        max_discount: row.max_discount ? Number(row.max_discount) : null,
        usage_limit: row.usage_limit ? Number(row.usage_limit) : null,
        used_count: Number(row.used_count || 0),
        valid_from: row.valid_from,
        valid_until: row.valid_until,
        is_active: !!row.is_active,
        created_at: row.created_at,
      }));
    } catch (err) {
      console.error("Unexpected error in getCoupons:", err);
      return [];
    }
  }

  static async createCoupon(input: CreateCouponInput): Promise<CouponRecord> {
    const supabase = this.getAdminClient();

    const payload = {
      code: input.code.trim().toUpperCase(),
      discount_type: input.discount_type,
      value: input.value,
      min_order_value: input.min_order_value || null,
      max_discount: input.max_discount || null,
      usage_limit: input.usage_limit || null,
      used_count: 0,
      valid_from: new Date(input.valid_from).toISOString(),
      valid_until: new Date(input.valid_until).toISOString(),
      is_active: input.is_active ?? true,
    };

    const { data, error } = await supabase
      .from("coupons")
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(`Failed to create coupon: ${error.message}`);

    return {
      id: data.id,
      code: data.code,
      discount_type: data.discount_type,
      value: Number(data.value),
      min_order_value: data.min_order_value ? Number(data.min_order_value) : null,
      max_discount: data.max_discount ? Number(data.max_discount) : null,
      usage_limit: data.usage_limit ? Number(data.usage_limit) : null,
      used_count: Number(data.used_count || 0),
      valid_from: data.valid_from,
      valid_until: data.valid_until,
      is_active: !!data.is_active,
      created_at: data.created_at,
    };
  }

  static async toggleCouponStatus(
    id: string,
    is_active: boolean
  ): Promise<CouponRecord> {
    const supabase = this.getAdminClient();

    const { data, error } = await supabase
      .from("coupons")
      .update({ is_active })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update coupon status: ${error.message}`);

    return {
      id: data.id,
      code: data.code,
      discount_type: data.discount_type,
      value: Number(data.value),
      min_order_value: data.min_order_value ? Number(data.min_order_value) : null,
      max_discount: data.max_discount ? Number(data.max_discount) : null,
      usage_limit: data.usage_limit ? Number(data.usage_limit) : null,
      used_count: Number(data.used_count || 0),
      valid_from: data.valid_from,
      valid_until: data.valid_until,
      is_active: !!data.is_active,
      created_at: data.created_at,
    };
  }

  static async deleteCoupon(id: string): Promise<void> {
    const supabase = this.getAdminClient();
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete coupon: ${error.message}`);
  }
}
