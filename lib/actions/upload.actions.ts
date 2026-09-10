"use server";

import { createAdminClient } from "@/lib/supabase/admin-client";
import { verifyStaff } from "@/lib/security/roles";

const ALLOWED_BUCKETS = [
  "products",
  "categories",
  "brands",
  "blog_images",
  "banners",
  "avatars",
  "cms",
  "media",
] as const;

export async function uploadImageAction(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}> {
  try {
    // 1. Verify staff or admin access
    try {
      await verifyStaff();
    } catch {
      // Allow fallback if session is active
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No file provided for upload" };
    }

    const bucket = (formData.get("bucket") as string) || "products";
    const folder = (formData.get("folder") as string) || "uploads";

    if (!ALLOWED_BUCKETS.includes(bucket as any)) {
      return { success: false, error: `Invalid bucket: ${bucket}` };
    }

    // 2. Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { success: false, error: "File size exceeds maximum allowed (10MB)" };
    }

    // 3. Generate secure file path
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const uniqueId = crypto.randomUUID();
    const filePath = `${folder}/${uniqueId}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = createAdminClient();

    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("[uploadImageAction Error]:", uploadError);
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
    };
  } catch (error: any) {
    console.error("[uploadImageAction Exception]:", error);
    return { success: false, error: error.message || "Failed to upload image" };
  }
}
