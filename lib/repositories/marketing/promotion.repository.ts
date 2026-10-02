import { createAdminClient } from "@/lib/supabase/admin-client";

export interface PromotionRecord {
  id: string;
  name: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  banner_url?: string;
  banner_link?: string;
  show_popup?: boolean;
  popup_delay?: number;
  description?: string;
  created_at: string;
}

export interface CreatePromotionInput {
  name: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  banner_url?: string;
  banner_link?: string;
  show_popup?: boolean;
  popup_delay?: number;
  description?: string;
}

const SETTINGS_PROMO_KEY = "promotions_banner_metadata";

export class PromotionRepository {
  private static getAdminClient() {
    return createAdminClient();
  }

  /**
   * Loads all promotion metadata (banner_url, banner_link, popup_delay, etc.) from settings table.
   */
  private static async getPromoMetadataMap(): Promise<Record<string, any>> {
    try {
      const supabase = this.getAdminClient();
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", SETTINGS_PROMO_KEY)
        .maybeSingle();

      if (error || !data || !data.value || typeof data.value !== "object") {
        return {};
      }
      return data.value as Record<string, any>;
    } catch {
      return {};
    }
  }

  /**
   * Saves metadata for a promotion into settings table safely.
   */
  private static async savePromoMetadata(promoId: string, meta: {
    banner_url?: string;
    banner_link?: string;
    show_popup?: boolean;
    popup_delay?: number;
    description?: string;
  }) {
    try {
      const supabase = this.getAdminClient();
      const currentMap = await this.getPromoMetadataMap();
      currentMap[promoId] = {
        banner_url: meta.banner_url || "",
        banner_link: meta.banner_link || "",
        show_popup: meta.show_popup !== undefined ? meta.show_popup : true,
        popup_delay: meta.popup_delay !== undefined ? meta.popup_delay : 5,
        description: meta.description || "",
      };

      await supabase.from("settings").upsert({
        key: SETTINGS_PROMO_KEY,
        value: currentMap,
        description: "Promotions rich metadata (photos, links, popup configs)",
      });
    } catch (err) {
      console.warn("Failed to save promotion metadata in settings:", err);
    }
  }

  /**
   * Removes metadata for a deleted promotion.
   */
  private static async deletePromoMetadata(promoId: string) {
    try {
      const supabase = this.getAdminClient();
      const currentMap = await this.getPromoMetadataMap();
      if (currentMap[promoId]) {
        delete currentMap[promoId];
        await supabase.from("settings").upsert({
          key: SETTINGS_PROMO_KEY,
          value: currentMap,
          description: "Promotions rich metadata (photos, links, popup configs)",
        });
      }
    } catch (err) {
      console.warn("Failed to delete promotion metadata in settings:", err);
    }
  }

  static async getPromotions(): Promise<PromotionRecord[]> {
    try {
      const supabase = this.getAdminClient();
      const [promosRes, metaMap] = await Promise.all([
        supabase
          .from("promotions")
          .select("*")
          .order("created_at", { ascending: false }),
        this.getPromoMetadataMap(),
      ]);

      if (promosRes.error) {
        console.error("Error fetching promotions:", promosRes.error);
        return [];
      }

      return (promosRes.data || []).map((row: any) => {
        const meta = metaMap[row.id] || {};
        return {
          id: row.id,
          name: row.name,
          discount_percentage: Number(row.discount_percentage),
          start_date: row.start_date,
          end_date: row.end_date,
          is_active: !!row.is_active,
          banner_url: row.banner_url || row.image_url || meta.banner_url || "",
          banner_link: row.banner_link || meta.banner_link || "",
          show_popup: row.show_popup !== undefined ? !!row.show_popup : (meta.show_popup !== undefined ? !!meta.show_popup : true),
          popup_delay: Number(row.popup_delay ?? meta.popup_delay ?? 5),
          description: row.description || meta.description || "",
          created_at: row.created_at,
        };
      });
    } catch (err) {
      console.error("Unexpected error in getPromotions:", err);
      return [];
    }
  }

  static async getPromotionById(id: string): Promise<PromotionRecord | null> {
    const supabase = this.getAdminClient();
    const [promoRes, metaMap] = await Promise.all([
      supabase
        .from("promotions")
        .select("*")
        .eq("id", id)
        .single(),
      this.getPromoMetadataMap(),
    ]);

    if (promoRes.error) {
      if (promoRes.error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch promotion: ${promoRes.error.message}`);
    }

    const data = promoRes.data;
    const meta = metaMap[data.id] || {};

    return {
      id: data.id,
      name: data.name,
      discount_percentage: Number(data.discount_percentage),
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: !!data.is_active,
      banner_url: data.banner_url || data.image_url || meta.banner_url || "",
      banner_link: data.banner_link || meta.banner_link || "",
      show_popup: data.show_popup !== undefined ? !!data.show_popup : (meta.show_popup !== undefined ? !!meta.show_popup : true),
      popup_delay: Number(data.popup_delay ?? meta.popup_delay ?? 5),
      description: data.description || meta.description || "",
      created_at: data.created_at,
    };
  }

  /**
   * Returns all currently active promotions within date range.
   */
  static async getActivePromotions(): Promise<PromotionRecord[]> {
    try {
      const supabase = this.getAdminClient();
      const now = new Date().toISOString();
      const [promosRes, metaMap] = await Promise.all([
        supabase
          .from("promotions")
          .select("*")
          .eq("is_active", true)
          .lte("start_date", now)
          .gte("end_date", now)
          .order("discount_percentage", { ascending: false }),
        this.getPromoMetadataMap(),
      ]);

      if (promosRes.error) {
        console.error("Error fetching active promotions:", promosRes.error);
        return [];
      }

      return (promosRes.data || []).map((row: any) => {
        const meta = metaMap[row.id] || {};
        return {
          id: row.id,
          name: row.name,
          discount_percentage: Number(row.discount_percentage),
          start_date: row.start_date,
          end_date: row.end_date,
          is_active: !!row.is_active,
          banner_url: row.banner_url || row.image_url || meta.banner_url || "",
          banner_link: row.banner_link || meta.banner_link || "",
          show_popup: row.show_popup !== undefined ? !!row.show_popup : (meta.show_popup !== undefined ? !!meta.show_popup : true),
          popup_delay: Number(row.popup_delay ?? meta.popup_delay ?? 5),
          description: row.description || meta.description || "",
          created_at: row.created_at,
        };
      });
    } catch (err) {
      console.error("Unexpected error in getActivePromotions:", err);
      return [];
    }
  }

  /**
   * Returns the single best active promotion (highest discount percentage).
   */
  static async getBestActivePromotion(): Promise<PromotionRecord | null> {
    const active = await this.getActivePromotions();
    if (active.length === 0) return null;
    return active[0];
  }

  static async createPromotion(input: CreatePromotionInput): Promise<PromotionRecord> {
    const supabase = this.getAdminClient();

    // Ensure name never exceeds 255 chars
    const cleanName = input.name.trim().substring(0, 255);

    const payload: any = {
      name: cleanName,
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

    // Save rich metadata (photos, banner link, popup delay) in settings table
    await this.savePromoMetadata(data.id, {
      banner_url: input.banner_url,
      banner_link: input.banner_link,
      show_popup: input.show_popup,
      popup_delay: input.popup_delay,
      description: input.description,
    });

    return {
      id: data.id,
      name: data.name,
      discount_percentage: Number(data.discount_percentage),
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: !!data.is_active,
      banner_url: input.banner_url || "",
      banner_link: input.banner_link || "",
      show_popup: input.show_popup ?? true,
      popup_delay: input.popup_delay ?? 5,
      description: input.description || "",
      created_at: data.created_at,
    };
  }

  static async updatePromotion(
    id: string,
    updates: Partial<CreatePromotionInput>
  ): Promise<PromotionRecord> {
    const supabase = this.getAdminClient();

    const payload: Record<string, any> = {};
    if (updates.name !== undefined) {
      payload.name = updates.name.trim().substring(0, 255);
    }
    if (updates.discount_percentage !== undefined) {
      payload.discount_percentage = updates.discount_percentage;
    }
    if (updates.start_date !== undefined) {
      payload.start_date = new Date(updates.start_date).toISOString();
    }
    if (updates.end_date !== undefined) {
      payload.end_date = new Date(updates.end_date).toISOString();
    }
    if (updates.is_active !== undefined) {
      payload.is_active = updates.is_active;
    }

    const { data, error } = await supabase
      .from("promotions")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update promotion: ${error.message}`);

    // If metadata fields are provided, update them in settings table
    const metaMap = await this.getPromoMetadataMap();
    const currentMeta = metaMap[id] || {};
    const updatedMeta = {
      banner_url: updates.banner_url !== undefined ? updates.banner_url : currentMeta.banner_url,
      banner_link: updates.banner_link !== undefined ? updates.banner_link : currentMeta.banner_link,
      show_popup: updates.show_popup !== undefined ? updates.show_popup : currentMeta.show_popup,
      popup_delay: updates.popup_delay !== undefined ? updates.popup_delay : currentMeta.popup_delay,
      description: updates.description !== undefined ? updates.description : currentMeta.description,
    };

    await this.savePromoMetadata(id, updatedMeta);

    return {
      id: data.id,
      name: data.name,
      discount_percentage: Number(data.discount_percentage),
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: !!data.is_active,
      banner_url: updatedMeta.banner_url || "",
      banner_link: updatedMeta.banner_link || "",
      show_popup: updatedMeta.show_popup ?? true,
      popup_delay: updatedMeta.popup_delay ?? 5,
      description: updatedMeta.description || "",
      created_at: data.created_at,
    };
  }

  static async deletePromotion(id: string): Promise<void> {
    const supabase = this.getAdminClient();
    const { error } = await supabase.from("promotions").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete promotion: ${error.message}`);
    await this.deletePromoMetadata(id);
  }

  static async togglePromotionStatus(id: string, is_active: boolean): Promise<PromotionRecord> {
    return await this.updatePromotion(id, { is_active });
  }
}
