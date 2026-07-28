'use server';

import { marketingService } from '@/services/marketing.service';
import { Campaign, CampaignAudience } from '@/types/marketing.types';
import { revalidatePath } from 'next/cache';

export async function getCampaigns(): Promise<Campaign[]> {
  return await marketingService.getCampaigns();
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  return await marketingService.getCampaignById(id);
}

export async function createCampaign(data: unknown): Promise<Campaign> {
  const campaign = await marketingService.createCampaign(data);
  revalidatePath('/admin/campaigns');
  return campaign;
}

export async function updateCampaign(id: string, data: unknown): Promise<Campaign> {
  const campaign = await marketingService.updateCampaign(id, data);
  revalidatePath('/admin/campaigns');
  revalidatePath(`/admin/campaigns/${id}`);
  return campaign;
}

export async function getAudiences(): Promise<CampaignAudience[]> {
  return await marketingService.getAudiences();
}

export async function createAudience(data: unknown): Promise<CampaignAudience> {
  const audience = await marketingService.createAudience(data);
  revalidatePath('/admin/campaigns/audiences');
  return audience;
}
