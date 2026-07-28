import { describe, it, expect, vi } from 'vitest';
import { BlogService } from '@/services/blog.service';

vi.mock('@/repositories/blog.repository', () => {
  return {
    BlogRepository: vi.fn().mockImplementation(() => {
      return {
        getPosts: vi.fn().mockResolvedValue([{ id: '1', title: 'First Post', status: 'published' }]),
        createPost: vi.fn().mockResolvedValue({ id: '2', title: 'New Post', status: 'draft' }),
      };
    }),
  };
});

describe('BlogService', () => {
  const service = new BlogService();

  it('should fetch posts', async () => {
    const posts = await service.getPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('First Post');
  });

  it('should create a post with valid data', async () => {
    const newPost = await service.createPost({
      title: 'New Post',
      slug: 'new-post',
      author_id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(newPost.title).toBe('New Post');
  });
});
