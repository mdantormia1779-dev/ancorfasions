import { createClient } from '@/lib/supabase/server';
import { Campaign, CampaignAudience } from '@/types/marketing.types';

export class MarketingRepository {
  async getCampaigns(): Promise<Campaign[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, campaign_audiences(*)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getCampaignById(id: string): Promise<Campaign | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, campaign_audiences(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data;
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getAudiences(): Promise<CampaignAudience[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('campaign_audiences').select('*').order('name');
    if (error) throw new Error(error.message);
    return data;
  }

  async createAudience(audience: Partial<CampaignAudience>): Promise<CampaignAudience> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('campaign_audiences')
      .insert(audience)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
