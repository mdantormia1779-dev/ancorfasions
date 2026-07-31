import { z } from "zod";

export const cmsPageSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  author_id: z.string().uuid(),
  published_at: z.date().nullable().optional(),
  layout_data: z.record(z.any()).default({}),
});

export const cmsSectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  type: z.string().min(1, "Type is required").max(100),
  content: z.record(z.any()).default({}),
  is_global: z.boolean().default(false),
});

export const cmsNavigationSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  location: z.string().min(1, "Location is required").max(100),
  items: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
        target: z.string().optional(),
        children: z.array(z.any()).optional(),
      })
    )
    .default([]),
});
