import { describe, it, expect, vi } from 'vitest';
import { AIService } from '@/services/ai.service';
import { AIGatewayService } from '@/services/ai/ai-gateway.service';

vi.mock('@/services/ai/ai-gateway.service', () => ({
  AIGatewayService: {
    generateText: vi.fn(),
  },
}));

describe('AIService', () => {
  const service = new AIService();

  it('should generate blog content', async () => {
    vi.mocked(AIGatewayService.generateText).mockResolvedValueOnce({
      success: true,
      providerId: 'gemini',
      timestamp: new Date().toISOString(),
      data: { text: 'Generated Blog Content' },
    });

    const content = await service.generateBlogContent('Fashion', ['style']);
    expect(content).toBe('Generated Blog Content');
  });

  it('should throw error if generation fails', async () => {
    vi.mocked(AIGatewayService.generateText).mockResolvedValueOnce({
      success: false,
      providerId: 'gemini',
      timestamp: new Date().toISOString(),
      error: { code: 'ERR', message: 'Failed' },
    });

    await expect(service.generateBlogContent('Fashion', ['style'])).rejects.toThrow('AI generation failed: Failed');
  });
});
