import { z } from 'zod';

export const ticketPriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export const ticketStatusEnum = z.enum(['open', 'pending', 'in_progress', 'waiting_for_customer', 'resolved', 'closed', 'reopened']);
export const agentStatusEnum = z.enum(['online', 'busy', 'offline']);
export const senderTypeEnum = z.enum(['CUSTOMER', 'AGENT', 'SYSTEM', 'AI']);

export const createSupportTicketSchema = z.object({
  profile_id: z.string().uuid().optional(),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  priority: ticketPriorityEnum.default('medium'),
  department_id: z.string().uuid().optional(),
  order_id: z.string().uuid().optional(),
});

export const updateSupportTicketSchema = z.object({
  status: ticketStatusEnum.optional(),
  priority: ticketPriorityEnum.optional(),
  department_id: z.string().uuid().optional(),
  assigned_agent_id: z.string().uuid().optional(),
});

export const createTicketMessageSchema = z.object({
  ticket_id: z.string().uuid(),
  message: z.string().min(1, 'Message is required'),
  is_internal_note: z.boolean().default(false),
  sender_type: senderTypeEnum.default('AGENT'),
  sender_id: z.string().uuid().optional(),
});

export const createTicketAttachmentSchema = z.object({
  ticket_id: z.string().uuid().optional(),
  message_id: z.string().uuid().optional(),
  file_name: z.string().min(1, 'File name is required'),
  file_url: z.string().url(),
  file_type: z.string().optional(),
  file_size_bytes: z.number().int().optional(),
}).refine(data => data.ticket_id || data.message_id, {
  message: "Either ticket_id or message_id must be provided",
  path: ["ticket_id"],
});

export const createKnowledgeBaseArticleSchema = z.object({
  category_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  is_published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export const updateKnowledgeBaseArticleSchema = createKnowledgeBaseArticleSchema.partial();
