import { BlogRepository } from "@/repositories/blog.repository";
import { blogPostSchema } from "@/validators/blog.schema";
import { BlogPost, BlogCategory, BlogTag } from "@/types/blog.types";

const blogRepository = new BlogRepository();

export class BlogService {
  async getPosts(status?: string): Promise<BlogPost[]> {
    return await blogRepository.getPosts(status);
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    return await blogRepository.getPostBySlug(slug);
  }

  async createPost(data: unknown): Promise<BlogPost> {
    const validData = blogPostSchema.parse(data);
    return await blogRepository.createPost(validData);
  }

  async updatePost(id: string, data: unknown): Promise<BlogPost> {
    const validData = blogPostSchema.partial().parse(data);
    return await blogRepository.updatePost(id, validData);
  }

  async deletePost(id: string): Promise<void> {
    await blogRepository.deletePost(id);
  }

  async getCategories(): Promise<BlogCategory[]> {
    return await blogRepository.getCategories();
  }

  async getTags(): Promise<BlogTag[]> {
    return await blogRepository.getTags();
  }
}

export const blogService = new BlogService();
