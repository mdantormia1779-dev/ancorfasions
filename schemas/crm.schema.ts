import { z } from "zod";

export const customerLifecycleStageEnum = z.enum([
  "PROSPECT",
  "FIRST_TIME_BUYER",
  "REPEAT_CUSTOMER",
  "LOYAL",
  "AT_RISK",
  "CHURNED",
]);

export const leadStatusEnum = z.enum([
  "new",
  "contacted",
  "qualified",
  "lost",
  "converted",
]);

export const communicationTypeEnum = z.enum([
  "EMAIL",
  "SMS",
  "IN_APP",
  "PUSH",
  "CALL",
  "MEETING",
]);

export const communicationDirectionEnum = z.enum(["INBOUND", "OUTBOUND"]);

export const createCRMLeadSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  status: leadStatusEnum.default("new"),
  source: z.string().optional(),
  assigned_agent_id: z.string().uuid().optional(),
  score: z.number().int().default(0),
  custom_fields: z.record(z.any()).default({}),
});

export const updateCRMLeadSchema = createCRMLeadSchema.partial();

export const createCRMNoteSchema = z
  .object({
    profile_id: z.string().uuid().optional(),
    lead_id: z.string().uuid().optional(),
    content: z.string().min(1, "Note content is required"),
    is_pinned: z.boolean().default(false),
  })
  .refine((data) => data.profile_id || data.lead_id, {
    message: "Either profile_id or lead_id must be provided",
    path: ["profile_id"],
  });

export const createCommunicationLogSchema = z
  .object({
    profile_id: z.string().uuid().optional(),
    lead_id: z.string().uuid().optional(),
    type: communicationTypeEnum,
    direction: communicationDirectionEnum,
    subject: z.string().optional(),
    content: z.string().optional(),
    status: z.string().default("SENT"),
    metadata: z.record(z.any()).default({}),
  })
  .refine((data) => data.profile_id || data.lead_id, {
    message: "Either profile_id or lead_id must be provided",
    path: ["profile_id"],
  });

export const createCustomerTagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  color: z.string().default("#000000"),
});
