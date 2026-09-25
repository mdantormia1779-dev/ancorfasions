import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicSupabaseClient } from "@/lib/supabase/public";
import {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/types/catalog.types";

export class CollectionRepository {
  /**
   * Retrieves all collections with optional active-only filter.
   * Includes product count and assigned product IDs.
   */
  static async getCollections(
    activeOnly: boolean = true
  ): Promise<Collection[]> {
    try {
      const supabase = getPublicSupabaseClient();
      let query = supabase
        .from("collections")
        .select("*, collection_products(product_id, products(id, deleted_at, status))")
        .order("created_at", { ascending: false });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching collections:", error);
        return [];
      }

      return (data || []).map((col: any) => {
        const activeLinks = (col.collection_products || []).filter(
          (cp: any) => !cp.products?.deleted_at && cp.products?.status !== "ARCHIVED"
        );
        return {
          ...col,
          product_count: activeLinks.length,
          product_ids: activeLinks.map((cp: any) => cp.product_id),
        };
      }) as Collection[];
    } catch (err) {
      console.error("Unexpected error in getCollections:", err);
      return [];
    }
  }

  /**
   * Retrieves a single collection by slug with its active products.
   */
  static async getCollectionBySlug(
    slug: string,
    activeOnly: boolean = true
  ): Promise<{ collection: Collection | null; products: any[] }> {
    try {
      const supabase = getPublicSupabaseClient();
      let colQuery = supabase
        .from("collections")
        .select("*")
        .eq("slug", slug);

      if (activeOnly) {
        colQuery = colQuery.eq("is_active", true);
      }

      const { data: collection, error: colError } = await colQuery.maybeSingle();
      if (colError || !collection) {
        return { collection: null, products: [] };
      }

      const col = collection as unknown as Collection;

      // Fetch products for this collection
      const { data: colProducts, error: prodError } = await supabase
        .from("collection_products")
        .select(`
          product_id,
          display_order,
          products (
            *,
            categories (name, slug),
            brands (name),
            product_media (url, alt_text, is_primary)
          )
        `)
        .eq("collection_id", col.id)
        .order("display_order", { ascending: true });

      if (prodError) {
        console.error("Error fetching collection products:", prodError);
        return { collection: col, products: [] };
      }

      const products = (colProducts || [])
        .map((cp: any) => cp.products)
        .filter(
          (p: any) =>
            p &&
            !p.deleted_at &&
            p.status !== "ARCHIVED" &&
            (!activeOnly || p.status === "ACTIVE")
        );

      return {
        collection: {
          ...col,
          product_count: products.length,
        },
        products,
      };
    } catch (err) {
      console.error("Unexpected error in getCollectionBySlug:", err);
      return { collection: null, products: [] };
    }
  }

  /**
   * Creates a new collection and associates products.
   */
  static async createCollection(
    input: CreateCollectionInput
  ): Promise<Collection> {
    const supabase = await createAdminClient();
    const { product_ids, ...colData } = input;

    const { data, error } = await supabase
      .from("collections")
      .insert(colData)
      .select("*")
      .single();
    if (error) throw error;

    const collection = data as Collection;

    if (product_ids && product_ids.length > 0) {
      const links = product_ids.map((pid, idx) => ({
        collection_id: collection.id,
        product_id: pid,
        display_order: idx,
      }));
      await supabase.from("collection_products").insert(links);
    }

    return {
      ...collection,
      product_count: product_ids?.length ?? 0,
      product_ids: product_ids ?? [],
    };
  }

  /**
   * Updates an existing collection by ID and updates associated products.
   */
  static async updateCollection(
    id: string,
    input: UpdateCollectionInput
  ): Promise<Collection> {
    const supabase = await createAdminClient();
    const { product_ids, ...colData } = input;

    const { data, error } = await supabase
      .from("collections")
      .update(colData)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;

    if (product_ids !== undefined) {
      // Remove old links
      await supabase
        .from("collection_products")
        .delete()
        .eq("collection_id", id);

      // Insert new links
      if (product_ids.length > 0) {
        const links = product_ids.map((pid, idx) => ({
          collection_id: id,
          product_id: pid,
          display_order: idx,
        }));
        await supabase.from("collection_products").insert(links);
      }
    }

    return {
      ...(data as Collection),
      product_count: product_ids !== undefined ? product_ids.length : undefined,
      product_ids,
    };
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
