import { createClient } from "@/lib/supabase/server";

export class NewsletterRepository {
  static async getSubscribers() {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) {
        console.error("Error fetching subscribers:", error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error("Unexpected error in getSubscribers:", err);
      return [];
    }
  }
}
