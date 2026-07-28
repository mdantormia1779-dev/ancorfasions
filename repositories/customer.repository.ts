import { createClient } from '@/lib/supabase/server';
import { CustomerProfile, CustomerAddress, CustomerReview, CustomerNotification } from '@/types/customer.types';

export class CustomerRepository {
  static async getProfile(userId: string): Promise<CustomerProfile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }

  static async updateProfile(userId: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customer_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error(error.message);
    }
    return data;
  }

  static async getAddresses(userId: string): Promise<CustomerAddress[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', userId)
      .order('is_default_shipping', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
    return data;
  }

  static async addAddress(userId: string, address: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customer_addresses')
      .insert([{ ...address, customer_id: userId }])
      .select()
      .single();

    if (error) {
      console.error('Error adding address:', error);
      throw new Error(error.message);
    }
    return data;
  }

  static async getReviews(userId: string): Promise<CustomerReview[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customer_reviews')
      .select('*, products(name, images)')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
    return data;
  }
}
