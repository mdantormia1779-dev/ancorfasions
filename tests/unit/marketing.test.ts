import { describe, it, expect, vi } from 'vitest';
import { MarketingService } from '@/services/marketing.service';

vi.mock('@/repositories/marketing.repository', () => {
  return {
    MarketingRepository: vi.fn().mockImplementation(() => {
      return {
        getCampaigns: vi.fn().mockResolvedValue([{ id: '1', name: 'Summer Sale', type: 'email' }]),
        createCampaign: vi.fn().mockResolvedValue({ id: '2', name: 'Winter Promo', type: 'sms' }),
      };
    }),
  };
});

describe('MarketingService', () => {
  const service = new MarketingService();

  it('should fetch campaigns', async () => {
    const campaigns = await service.getCampaigns();
    expect(campaigns).toHaveLength(1);
    expect(campaigns[0].name).toBe('Summer Sale');
  });

  it('should create a campaign', async () => {
    const newCampaign = await service.createCampaign({
      name: 'Winter Promo',
      type: 'sms',
      created_by: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(newCampaign.name).toBe('Winter Promo');
  });
});
