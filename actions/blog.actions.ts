'use server';

import { blogService } from '@/services/blog.service';
import { BlogPost, BlogCategory, BlogTag } from '@/types/blog.types';
import { revalidatePath } from 'next/cache';

export async function getPosts(status?: string): Promise<BlogPost[]> {
  return await blogService.getPosts(status);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return await blogService.getPostBySlug(slug);
}

export async function createPost(data: unknown): Promise<BlogPost> {
  const post = await blogService.createPost(data);
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  return post;
}

export async function updatePost(id: string, data: unknown): Promise<BlogPost> {
  const post = await blogService.updatePost(id, data);
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  if (post.slug) {
    revalidatePath(`/blog/${post.slug}`);
  }
  return post;
}

export async function deletePost(id: string): Promise<void> {
  await blogService.deletePost(id);
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
}

export async function getCategories(): Promise<BlogCategory[]> {
  return await blogService.getCategories();
}

export async function getTags(): Promise<BlogTag[]> {
  return await blogService.getTags();
}
