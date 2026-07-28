import { MarketingRepository } from '@/repositories/marketing.repository';
import { campaignSchema, campaignAudienceSchema } from '@/validators/marketing.schema';
import { Campaign, CampaignAudience } from '@/types/marketing.types';

const marketingRepository = new MarketingRepository();

export class MarketingService {
  async getCampaigns(): Promise<Campaign[]> {
    return await marketingRepository.getCampaigns();
  }

  async getCampaignById(id: string): Promise<Campaign | null> {
    return await marketingRepository.getCampaignById(id);
  }

  async createCampaign(data: unknown): Promise<Campaign> {
    const validData = campaignSchema.parse(data);
    return await marketingRepository.createCampaign(validData);
  }

  async updateCampaign(id: string, data: unknown): Promise<Campaign> {
    const validData = campaignSchema.partial().parse(data);
    return await marketingRepository.updateCampaign(id, validData);
  }

  async getAudiences(): Promise<CampaignAudience[]> {
    return await marketingRepository.getAudiences();
  }

  async createAudience(data: unknown): Promise<CampaignAudience> {
    const validData = campaignAudienceSchema.parse(data);
    return await marketingRepository.createAudience(validData);
  }
}

export const marketingService = new MarketingService();
