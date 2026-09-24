import { crmRepository } from "@/repositories/crm.repository";
import { createAdminClient } from "@/lib/supabase/admin-client";
import {
  createCRMLeadSchema,
  updateCRMLeadSchema,
  createCRMNoteSchema,
} from "@/schemas/crm.schema";
import { CRMLead, CRMNote, CommunicationLog } from "@/types/crm.types";

export class CRMService {
  async getCustomers() {
    return await crmRepository.getCustomers();
  }

  async getCustomerTimeline(profileId: string) {
    const [notes, logs] = await Promise.all([
      crmRepository.getNotes(profileId),
      crmRepository.getCommunicationLogs(profileId),
    ]);

    // Merge and sort notes and logs by created_at descending
    const timeline = [
      ...notes.map((n) => ({ ...n, timeline_type: "NOTE" })),
      ...logs.map((l) => ({ ...l, timeline_type: "COMMUNICATION" })),
    ].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return timeline;
  }

  async getLeads() {
    return await crmRepository.getLeads();
  }

  async getLeadById(id: string): Promise<CRMLead | null> {
    return await crmRepository.getLeadById(id);
  }

  async deleteLead(id: string): Promise<void> {
    await crmRepository.deleteLead(id);
  }

  async createLead(data: unknown): Promise<CRMLead> {
    const validData = createCRMLeadSchema.parse(data);
    const existing = await crmRepository.getLeadByEmail(validData.email);
    if (existing) {
      throw new Error(`A lead with email "${validData.email}" already exists.`);
    }

    const { notes, ...leadFields } = validData;
    const lead = await crmRepository.createLead(leadFields);

    if (notes && notes.trim() && lead?.id) {
      await crmRepository.createNote({
        lead_id: lead.id,
        content: notes.trim(),
      });
    }

    return lead;
  }

  async updateLead(id: string, data: unknown): Promise<CRMLead> {
    const validData = updateCRMLeadSchema.parse(data);
    return await crmRepository.updateLead(id, validData);
  }

  async convertLead(id: string, profileId?: string): Promise<CRMLead> {
    const lead = await crmRepository.getLeadById(id);
    if (!lead) {
      throw new Error("Lead not found");
    }

    let targetProfileId = profileId || lead.converted_to_profile_id;

    // If no target profile was specified, convert lead into an official customer profile
    if (!targetProfileId && lead.email) {
      const supabase = createAdminClient();
      const cleanEmail = lead.email.trim().toLowerCase();

      // Check if customer profile already exists
      const { data: existingProfile } = await supabase
        .from("customer_profiles")
        .select("id")
        .ilike("email", cleanEmail)
        .maybeSingle();

      if (existingProfile?.id) {
        targetProfileId = existingProfile.id;
      } else {
        // Create an official customer profile
        const newUserId = crypto.randomUUID();
        const firstName = lead.first_name?.trim() || "Customer";
        const lastName = lead.last_name?.trim() || "";
        const phone = lead.phone?.trim() || null;

        // 1. Try to create or find Auth user
        let authUserId = newUserId;
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: cleanEmail,
            email_confirm: true,
            user_metadata: {
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`.trim(),
              phone: phone || "",
              role: "customer",
            },
          });
          if (authData?.user?.id) {
            authUserId = authData.user.id;
          } else if (authError) {
            const { data: listData } = await supabase.auth.admin.listUsers();
            const existingAuth = listData?.users?.find(
              (u) => u.email?.toLowerCase() === cleanEmail
            );
            if (existingAuth?.id) authUserId = existingAuth.id;
          }
        } catch {
          // fallback to newUserId
        }

        // 2. Upsert customer_profiles
        await supabase.from("customer_profiles").upsert(
          {
            id: authUserId,
            first_name: firstName,
            last_name: lastName,
            email: cleanEmail,
            phone: phone,
            is_active: true,
          },
          { onConflict: "id" }
        );

        // 3. Upsert profiles
        try {
          await supabase.from("profiles").upsert(
            {
              id: authUserId,
              first_name: firstName,
              last_name: lastName,
              email: cleanEmail,
              phone: phone,
              role: "customer",
              is_active: true,
            },
            { onConflict: "id" }
          );
        } catch {}

        // 4. Upsert crm_customers
        await supabase.from("crm_customers").upsert(
          {
            profile_id: authUserId,
            customer_lifecycle_stage: "FIRST_TIME_BUYER",
            is_vip: false,
            health_score: 80,
            total_support_tickets: 0,
            last_interaction_at: new Date().toISOString(),
          },
          { onConflict: "profile_id" }
        );

        targetProfileId = authUserId;
      }
    }

    const updateData: Partial<CRMLead> = {
      status: "converted",
    };
    if (targetProfileId) {
      updateData.converted_to_profile_id = targetProfileId;
    }
    return await crmRepository.updateLead(id, updateData);
  }

  async addNoteToCustomer(profileId: string, data: unknown): Promise<CRMNote> {
    const validData = createCRMNoteSchema.parse({
      ...(data as any),
      profile_id: profileId,
    });
    return await crmRepository.createNote(validData);
  }

  async getLeadNotes(leadId: string): Promise<CRMNote[]> {
    return await crmRepository.getNotes(undefined, leadId);
  }

  async addNoteToLead(leadId: string, content: string): Promise<CRMNote> {
    const validData = createCRMNoteSchema.parse({
      lead_id: leadId,
      content,
      is_pinned: false,
    });
    return await crmRepository.createNote(validData);
  }

  async getLeadCommunicationLogs(leadId: string): Promise<CommunicationLog[]> {
    return await crmRepository.getCommunicationLogs(undefined, leadId);
  }

  async logCommunication(data: unknown): Promise<CommunicationLog> {
    return await crmRepository.createCommunicationLog(data as any);
  }

  async getCommunicationLogs(): Promise<CommunicationLog[]> {
    return await crmRepository.getCommunicationLogs();
  }

  async updateCommunicationLog(
    id: string,
    data: Partial<CommunicationLog>
  ): Promise<CommunicationLog> {
    return await crmRepository.updateCommunicationLog(id, data);
  }

  async deleteCommunicationLog(id: string): Promise<void> {
    await crmRepository.deleteCommunicationLog(id);
  }
}

export const crmService = new CRMService();
