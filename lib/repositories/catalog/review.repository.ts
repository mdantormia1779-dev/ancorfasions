import { createClient } from "@/lib/supabase/server";
import { Review } from "@/types/catalog.types";

export class ReviewRepository {
  /**
   * Retrieves all reviews with customer and product names joined.
   * BUG FIX: Previously returned raw UUIDs with no human-readable info.
   * customer_id on customer_reviews references customer_profiles(id).
   */
  static async getReviews(): Promise<Review[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("customer_reviews")
        .select(
          "*, customer:customer_profiles(first_name, last_name, email), product:products(name, slug)"
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        return [];
      }
      return (data as unknown as Review[]) || [];
    } catch (err) {
      console.error("Unexpected error in getReviews:", err);
      return [];
    }
  }

  /**
   * Retrieves all approved reviews for a specific product.
   */
  static async getReviewsByProductId(productId: string): Promise<Review[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("customer_reviews")
        .select(
          "*, customer:customer_profiles(first_name, last_name, email), product:products(name, slug)"
        )
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching product reviews:", error);
        return [];
      }
      return (data as unknown as Review[]) || [];
    } catch (err) {
      console.error("Unexpected error in getReviewsByProductId:", err);
      return [];
    }
  }

  /**
   * Approves a review (makes it publicly visible).
   */
  static async approveReview(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("customer_reviews")
      .update({ is_approved: true })
      .eq("id", id);
    if (error) throw error;
  }

  /**
   * Revokes approval for a review (sets it back to pending).
   */
  static async revokeReview(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("customer_reviews")
      .update({ is_approved: false })
      .eq("id", id);
    if (error) throw error;
  }

  /**
   * Permanently deletes a review.
   */
  static async deleteReview(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("customer_reviews")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
}
