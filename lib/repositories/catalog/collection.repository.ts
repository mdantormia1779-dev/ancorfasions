import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/types/catalog.types";

export class CollectionRepository {
  /**
   * Retrieves all collections with optional active-only filter.
   */
  static async getCollections(
    activeOnly: boolean = true
  ): Promise<Collection[]> {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("collections")
        .select("*")
        .order("name", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching collections:", error);
        return [];
      }
      return (data as Collection[]) || [];
    } catch (err) {
      console.error("Unexpected error in getCollections:", err);
      return [];
    }
  }

  /**
   * Creates a new collection.
   */
  static async createCollection(
    input: CreateCollectionInput
  ): Promise<Collection> {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("collections")
      .insert(input)
      .select("*")
      .single();
    if (error) throw error;
    return data as Collection;
  }

  /**
   * Updates an existing collection by ID.
   */
  static async updateCollection(
    id: string,
    input: UpdateCollectionInput
  ): Promise<Collection> {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("collections")
      .update(input)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as Collection;
  }

  /**
   * Soft-deletes a collection by setting is_active=false.
   */
  static async deleteCollection(id: string): Promise<void> {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("collections")
      .update({ is_active: false })
      .eq("id", id);
    if (error) throw error;
  }
}
