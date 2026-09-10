"use server";

import { blogService } from "@/services/blog.service";
import { BlogPost, BlogCategory, BlogTag } from "@/types/blog.types";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";

export async function getPosts(status?: string): Promise<BlogPost[]> {
  try {
    return await blogService.getPosts(status);
  } catch (error) {
    console.error("[getPosts Error]:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    return await blogService.getPostBySlug(slug);
  } catch (error) {
    console.error("[getPostBySlug Error]:", error);
    return null;
  }
}

export async function createPost(data: unknown): Promise<BlogPost> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let authorId = (data as any)?.author_id;
  if (!authorId || authorId === "00000000-0000-0000-0000-000000000000") {
    authorId = user?.id;
  }

  if (!authorId) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .limit(1)
      .maybeSingle();
    authorId = profile?.id;
  }

  const postData = {
    ...(data as any),
    author_id: authorId,
  };

  const post = await blogService.createPost(postData);
  revalidatePath("/admin/cms/blogs");
  revalidatePath("/blog");
  return post;
}

export async function updatePost(id: string, data: unknown): Promise<BlogPost> {
  const post = await blogService.updatePost(id, data);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (post.slug) {
    revalidatePath(`/blog/${post.slug}`);
  }
  return post;
}

export async function deletePost(id: string): Promise<void> {
  await blogService.deletePost(id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function getCategories(): Promise<BlogCategory[]> {
  return await blogService.getCategories();
}

export async function getTags(): Promise<BlogTag[]> {
  return await blogService.getTags();
}
