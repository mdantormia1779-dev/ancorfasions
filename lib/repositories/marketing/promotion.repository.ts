import { createAdminClient } from "@/lib/supabase/admin-client";

export interface PromotionRecord {
  id: string;
  name: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface CreatePromotionInput {
  name: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}

export class PromotionRepository {
  private static getAdminClient() {
    return createAdminClient();
  }

  static async getPromotions(): Promise<PromotionRecord[]> {
    try {
      const supabase = this.getAdminClient();
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching promotions:", error);
        return [];
      }
      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        discount_percentage: Number(row.discount_percentage),
        start_date: row.start_date,
        end_date: row.end_date,
        is_active: !!row.is_active,
        created_at: row.created_at,
      }));
    } catch (err) {
      console.error("Unexpected error in getPromotions:", err);
      return [];
    }
  }

  static async getPromotionById(id: string): Promise<PromotionRecord | null> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch promotion: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      discount_percentage: Number(data.discount_percentage),
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: !!data.is_active,
      created_at: data.created_at,
    };
  }

  static async createPromotion(input: CreatePromotionInput): Promise<PromotionRecord> {
    const supabase = this.getAdminClient();

    const payload = {
      name: input.name.trim(),
      discount_percentage: input.discount_percentage,
      start_date: new Date(input.start_date).toISOString(),
      end_date: new Date(input.end_date).toISOString(),
      is_active: input.is_active ?? true,
    };

    const { data, error } = await supabase
      .from("promotions")
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(`Failed to create promotion: ${error.message}`);

    return {
      id: data.id,
      name: data.name,
      discount_percentage: Number(data.discount_percentage),
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: !!data.is_active,
      created_at: data.created_at,
    };
  }

  static async updatePromotion(
    id: string,
    updates: Partial<CreatePromotionInput>
  ): Promise<PromotionRecord> {
    const supabase = this.getAdminClient();

    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.discount_percentage !== undefined)
      payload.discount_percentage = updates.discount_percentage;
    if (updates.start_date !== undefined)
      payload.start_date = new Date(updates.start_date).toISOString();
    if (updates.end_date !== undefined)
      payload.end_date = new Date(updates.end_date).toISOString();
    if (updates.is_active !== undefined) payload.is_active = updates.is_active;

    const { data, error } = await supabase
      .from("promotions")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update promotion: ${error.message}`);

    return {
      id: data.id,
      name: data.name,
      discount_percentage: Number(data.discount_percentage),
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: !!data.is_active,
      created_at: data.created_at,
    };
  }

  static async deletePromotion(id: string): Promise<void> {
    const supabase = this.getAdminClient();
    const { error } = await supabase.from("promotions").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete promotion: ${error.message}`);
  }

  static async togglePromotionStatus(id: string, is_active: boolean): Promise<PromotionRecord> {
    return await this.updatePromotion(id, { is_active });
  }
}
