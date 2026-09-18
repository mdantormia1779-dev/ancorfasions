import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Review } from "@/types/catalog.types";
import { revalidatePath } from "next/cache";

export class ReviewRepository {
  /**
   * Retrieves all reviews with customer and product names joined.
   * BUG FIX: Previously returned raw UUIDs with no human-readable info.
   * customer_id on customer_reviews references customer_profiles(id).
   */
  static async getReviews(): Promise<Review[]> {
    try {
      const supabase = createAdminClient();
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
      const supabase = createAdminClient();
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
   * Retrieves aggregated review stats for a product from the database view.
   */
  static async getReviewStatsByProductId(productId: string): Promise<any> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("product_review_stats")
        .select("*")
        .eq("product_id", productId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching product review stats:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("Unexpected error in getReviewStatsByProductId:", err);
      return null;
    }
  }

  /**
   * Approves a review (makes it publicly visible).
   */
  static async approveReview(id: string): Promise<void> {
    const supabase = createAdminClient();
    const { data: review } = await supabase
      .from("customer_reviews")
      .select("product_id")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase
      .from("customer_reviews")
      .update({ is_approved: true })
      .eq("id", id);
    if (error) throw error;

    if (review?.product_id) {
      await this.recalculateProductRating(review.product_id);
    }
  }

  /**
   * Revokes approval for a review (sets it back to pending / unapproved, hiding it from the public store).
   */
  static async revokeReview(id: string): Promise<void> {
    const supabase = createAdminClient();
    const { data: review } = await supabase
      .from("customer_reviews")
      .select("product_id")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase
      .from("customer_reviews")
      .update({ is_approved: false })
      .eq("id", id);
    if (error) throw error;

    if (review?.product_id) {
      await this.recalculateProductRating(review.product_id);
    }
  }

  /**
   * Permanently deletes a review.
   */
  static async deleteReview(id: string): Promise<void> {
    const supabase = createAdminClient();
    const { data: review } = await supabase
      .from("customer_reviews")
      .select("product_id")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase
      .from("customer_reviews")
      .delete()
      .eq("id", id);
    if (error) throw error;

    if (review?.product_id) {
      await this.recalculateProductRating(review.product_id);
    }
  }

  /**
   * Recalculates average rating for a product based strictly on approved reviews
   * and purges product caches so changes reflect immediately.
   */
  static async recalculateProductRating(productId: string): Promise<void> {
    try {
      const supabase = createAdminClient();
      const { data: prodReviews } = await supabase
        .from("customer_reviews")
        .select("rating")
        .eq("product_id", productId)
        .eq("is_approved", true);

      const avg =
        prodReviews && prodReviews.length > 0
          ? prodReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / prodReviews.length
          : 0;

      await supabase
        .from("products")
        .update({ average_rating: Number(avg.toFixed(2)) })
        .eq("id", productId);

      const { data: prod } = await supabase
        .from("products")
        .select("slug")
        .eq("id", productId)
        .maybeSingle();

      if (prod?.slug) {
        revalidatePath(`/product/${prod.slug}`);
        revalidatePath(`/products/${prod.slug}`);
      }
      revalidatePath("/products");
      revalidatePath("/admin/products/reviews");
    } catch (e) {
      console.error("Failed to recalculate product rating:", e);
    }
  }

  /**
   * Increments or toggles helpful/like votes on a review in the database.
   */
  static async voteHelpful(
    id: string,
    increment: boolean = true
  ): Promise<{ success: boolean; helpful_votes: number; error?: string }> {
    try {
      const supabase = createAdminClient();
      const { data: review, error: fetchErr } = await supabase
        .from("customer_reviews")
        .select("id, helpful_votes")
        .eq("id", id)
        .maybeSingle();

      if (fetchErr || !review) {
        return { success: false, helpful_votes: 0, error: "Review not found" };
      }

      const currentVotes = review.helpful_votes || 0;
      const nextVotes = increment ? currentVotes + 1 : Math.max(0, currentVotes - 1);

      const { error: updateErr } = await supabase
        .from("customer_reviews")
        .update({ helpful_votes: nextVotes })
        .eq("id", id);

      if (updateErr) {
        console.error("Failed to update helpful_votes in DB:", updateErr);
        return { success: false, helpful_votes: currentVotes, error: updateErr.message };
      }

      return { success: true, helpful_votes: nextVotes };
    } catch (err: any) {
      console.error("Unexpected error in voteHelpful:", err);
      return { success: false, helpful_votes: 0, error: err.message };
    }
  }
}
