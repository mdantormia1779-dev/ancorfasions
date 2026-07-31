import { z } from "zod";

export const campaignAudienceSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().nullable().optional(),
  segment_criteria: z.record(z.any()).default({}),
});

export const campaignSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  type: z.enum(["email", "sms", "push", "drip"]),
  status: z
    .enum(["draft", "scheduled", "running", "completed", "paused"])
    .default("draft"),
  audience_id: z.string().uuid().nullable().optional(),
  subject: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  schedule_time: z.date().nullable().optional(),
  created_by: z.string().uuid(),
});

export const dynamicFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  type: z.string().min(1, "Type is required").max(50),
  fields: z.array(z.record(z.any())).default([]),
  success_message: z.string().nullable().optional(),
  redirect_url: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});
