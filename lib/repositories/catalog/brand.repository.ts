import { createClient } from "@/lib/supabase/server";

export class BrandRepository {
  static async getBrands(activeOnly: boolean = true) {
    const supabase = await createClient();
    let query = supabase
      .from("brands")
      .select("*")
      .order("name", { ascending: true });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}
