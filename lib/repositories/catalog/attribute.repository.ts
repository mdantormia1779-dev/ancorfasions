import { createClient } from "@/lib/supabase/server";
import {
  Attribute,
  CreateAttributeInput,
  UpdateAttributeInput,
} from "@/types/catalog.types";

export class AttributeRepository {
  /**
   * Retrieves all attributes with their values joined.
   * BUG FIX: Previously returned attributes without values.
   */
  static async getAttributes(): Promise<Attribute[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("attributes")
        .select("*, values:attribute_values(*)")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching attributes:", error);
        return [];
      }
      return (data as unknown as Attribute[]) || [];
    } catch (err) {
      console.error("Unexpected error in getAttributes:", err);
      return [];
    }
  }

  /**
   * Creates a new attribute.
   */
  static async createAttribute(input: CreateAttributeInput): Promise<Attribute> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("attributes")
      .insert(input)
      .select("*, values:attribute_values(*)")
      .single();
    if (error) throw error;
    return data as unknown as Attribute;
  }

  /**
   * Updates an existing attribute by ID.
   */
  static async updateAttribute(
    id: string,
    input: UpdateAttributeInput
  ): Promise<Attribute> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("attributes")
      .update(input)
      .eq("id", id)
      .select("*, values:attribute_values(*)")
      .single();
    if (error) throw error;
    return data as unknown as Attribute;
  }

  /**
   * Adds a value to an existing attribute.
   */
  static async addAttributeValue(
    attributeId: string,
    value: string
  ): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("attribute_values")
      .insert({ attribute_id: attributeId, value });
    if (error) throw error;
  }

  /**
   * Removes a specific attribute value by its ID.
   */
  static async removeAttributeValue(valueId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("attribute_values")
      .delete()
      .eq("id", valueId);
    if (error) throw error;
  }

  /**
   * Deletes an attribute and all its values (cascade).
   */
  static async deleteAttribute(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("attributes").delete().eq("id", id);
    if (error) throw error;
  }
}
