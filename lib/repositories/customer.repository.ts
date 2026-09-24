import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CustomerProfile,
  CustomerAddress,
  CustomerNotification,
} from "@/types/customer.types";

export class CustomerRepository {
  async getProfile(userId: string): Promise<CustomerProfile | null> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data) {
        return data as CustomerProfile;
      }

      // If user client returns nothing or error (e.g. RLS strictness), fallback to adminClient
      const admin = createAdminClient();
      const { data: adminProfile } = await admin
        .from("customer_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (adminProfile) {
        return adminProfile as CustomerProfile;
      }

      // If not yet in customer_profiles, check auth.users & profiles to auto-provision
      const { data: authData } = await admin.auth.admin.getUserById(userId);
      const { data: staffData } = await admin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (authData?.user) {
        const u = authData.user;
        const firstName =
          staffData?.first_name ||
          u.user_metadata?.first_name ||
          u.user_metadata?.name?.split(" ")[0] ||
          u.user_metadata?.full_name?.split(" ")[0] ||
          "Customer";
        const lastName =
          staffData?.last_name ||
          u.user_metadata?.last_name ||
          u.user_metadata?.name?.split(" ").slice(1).join(" ") ||
          u.user_metadata?.full_name?.split(" ").slice(1).join(" ") ||
          "";

        const newProfile = {
          id: userId,
          first_name: firstName,
          last_name: lastName,
          email: u.email || "",
          phone: staffData?.phone || u.phone || null,
          avatar_url: staffData?.avatar_url || u.user_metadata?.avatar_url || null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: created } = await admin
          .from("customer_profiles")
          .upsert(newProfile)
          .select()
          .maybeSingle();

        if (created) return created as CustomerProfile;
        return newProfile as unknown as CustomerProfile;
      }

      return null;
    } catch (err) {
      console.error("Error in CustomerRepository.getProfile:", err);
      return null;
    }
  }

  async updateProfile(
    userId: string,
    updates: Partial<CustomerProfile>
  ): Promise<CustomerProfile> {
    try {
      const admin = createAdminClient();

      // First try to update existing record
      const { data: updated, error: updateErr } = await admin
        .from("customer_profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .maybeSingle();

      if (updated) {
        return updated as CustomerProfile;
      }

      // If no row existed, obtain user email to satisfy the NOT NULL constraint on insert
      let email = updates.email;
      if (!email) {
        const { data: authData } = await admin.auth.admin.getUserById(userId);
        email = authData?.user?.email || "";
      }

      const { data: inserted, error: insertErr } = await admin
        .from("customer_profiles")
        .upsert({
          id: userId,
          email,
          ...updates,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertErr) {
        console.error("Failed to update/create customer profile:", insertErr);
        throw new Error(`Failed to update profile: ${insertErr.message}`);
      }

      return inserted as CustomerProfile;
    } catch (err) {
      console.error("Error in CustomerRepository.updateProfile:", err);
      throw err;
    }
  }

  async getAddresses(userId: string): Promise<CustomerAddress[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("customer_id", userId)
      .order("is_default_shipping", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch addresses: ${error.message}`);
    }

    return data as CustomerAddress[];
  }

  async createAddress(
    address: Omit<CustomerAddress, "id" | "created_at" | "updated_at">
  ): Promise<CustomerAddress> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customer_addresses")
      .insert(address)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create address: ${error.message}`);
    }

    return data as CustomerAddress;
  }

  async updateAddress(
    id: string,
    userId: string,
    updates: Partial<CustomerAddress>
  ): Promise<CustomerAddress> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customer_addresses")
      .update(updates)
      .eq("id", id)
      .eq("customer_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update address: ${error.message}`);
    }

    return data as CustomerAddress;
  }

  async deleteAddress(id: string, userId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("customer_addresses")
      .delete()
      .eq("id", id)
      .eq("customer_id", userId);

    if (error) {
      throw new Error(`Failed to delete address: ${error.message}`);
    }
  }

  async getNotifications(userId: string): Promise<CustomerNotification[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customer_notifications")
      .select("*")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return data as CustomerNotification[];
  }

  async markNotificationAsRead(id: string, userId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("customer_notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("customer_id", userId);

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  // --- Reviews ---
  async getReviews(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customer_reviews")
      .select("*, product:products(*)")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching customer reviews:", error);
      return [];
    }
    return data || [];
  }

  // --- Support Tickets ---
  async getTickets(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching customer tickets:", error);
      return [];
    }
    return data || [];
  }

  async createTicket(ticket: any) {
    const supabase = await createClient();
    const payload = {
      profile_id: ticket.profile_id || ticket.user_id,
      subject: ticket.subject,
      description: ticket.description || "",
      category: ticket.category || "General",
      priority: (ticket.priority || "medium").toLowerCase(),
      status: (ticket.status || "open").toLowerCase(),
    };

    const { data, error } = await supabase
      .from("support_tickets")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getTicketDetails(ticketId: string, userId: string) {
    const supabase = await createClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketId);
    
    let query = supabase
      .from("support_tickets")
      .select("*")
      .eq("profile_id", userId);

    if (isUuid) {
      query = query.eq("id", ticketId);
    } else if (!isNaN(Number(ticketId))) {
      query = query.eq("ticket_number", Number(ticketId));
    } else {
      query = query.eq("id", ticketId);
    }

    const { data: ticket, error } = await query.maybeSingle();

    if (error || !ticket) {
      return null;
    }

    // Fetch messages (excluding staff internal notes)
    const { data: messages } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticket.id)
      .eq("is_internal_note", false)
      .order("created_at", { ascending: true });

    return {
      ...ticket,
      messages: messages || [],
    };
  }

  async replyTicket(ticketId: string, userId: string, message: string) {
    const supabase = await createClient();

    // Verify ownership
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("id, status")
      .eq("id", ticketId)
      .eq("profile_id", userId)
      .single();

    if (!ticket) {
      throw new Error("Ticket not found or unauthorized");
    }

    // Insert message
    const { data: msg, error: msgErr } = await supabase
      .from("ticket_messages")
      .insert({
        ticket_id: ticketId,
        sender_id: userId,
        sender_type: "CUSTOMER",
        message: message.trim(),
        is_internal_note: false,
      })
      .select()
      .single();

    if (msgErr) throw msgErr;

    // Update ticket status back to open if it was pending or closed
    await supabase
      .from("support_tickets")
      .update({
        status: "open",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    return msg;
  }

  // --- Login History & Security ---
  async getLoginHistory(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("login_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    // In case the table uses attempted_at instead of created_at, fallback to it if created_at fails
    if (error) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("login_history")
        .select("*")
        .eq("user_id", userId)
        .order("attempted_at", { ascending: false })
        .limit(20);
      if (fallbackError) throw fallbackError;
      return fallbackData;
    }
    return data;
  }

  async getActiveSessions(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("active_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("last_active_at", { ascending: false });
    if (error) {
      // Just return empty array if active_sessions doesn't exist
      return [];
    }
    return data;
  }

  // --- Wishlist ---
  async getWishlists(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("wishlists")
      .select("*, items:wishlist_items(*, product:products(*))")
      .eq("user_id", userId);
    if (error) throw error;
    return data;
  }
}
