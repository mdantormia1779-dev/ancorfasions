import { createClient } from "@/lib/supabase/server";
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/types/catalog.types";

export class CategoryRepository {
  /**
   * Retrieves all categories with optional active-only filter.
   * Joins parent category for display.
   */
  static async getCategories(activeOnly: boolean = true): Promise<Category[]> {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("categories")
        .select("*, parent:categories!parent_id(id, name)")
        .order("display_order", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
      return (data as unknown as Category[]) || [];
    } catch (err) {
      console.error("Unexpected error in getCategories:", err);
      return [];
    }
  }

  /**
   * Creates a new category.
   */
  static async createCategory(input: CreateCategoryInput): Promise<Category> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .insert(input)
      .select("*, parent:categories!parent_id(id, name)")
      .single();
    if (error) throw error;
    return data as unknown as Category;
  }

  /**
   * Updates an existing category by ID.
   */
  static async updateCategory(
    id: string,
    input: UpdateCategoryInput
  ): Promise<Category> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .update(input)
      .eq("id", id)
      .select("*, parent:categories!parent_id(id, name)")
      .single();
    if (error) throw error;
    return data as unknown as Category;
  }

  /**
   * Soft-deletes a category by setting is_active=false.
   * We intentionally avoid hard deletes here to preserve referential
   * integrity — products linked to this category keep their category_id
   * and are not orphaned.
   */
  static async deleteCategory(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("categories")
      .update({ is_active: false })
      .eq("id", id);
    if (error) throw error;
  }
}
