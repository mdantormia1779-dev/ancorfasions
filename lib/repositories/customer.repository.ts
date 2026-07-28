import { createClient } from '@/lib/supabase/server';
import { CustomerProfile, CustomerAddress, CustomerNotification } from '@/types/customer.types';

export class CustomerRepository {
  async getProfile(userId: string): Promise<CustomerProfile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data as CustomerProfile;
  }

  async updateProfile(userId: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customer_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data as CustomerProfile;
  }

  async getAddresses(userId: string): Promise<CustomerAddress[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', userId)
      .order('is_default_shipping', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch addresses: ${error.message}`);
    }

    return data as CustomerAddress[];
  }

  async createAddress(address: Omit<CustomerAddress, 'id' | 'created_at' | 'updated_at'>): Promise<CustomerAddress> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customer_addresses')
      .insert(address)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create address: ${error.message}`);
    }

    return data as CustomerAddress;
  }

  async updateAddress(id: string, userId: string, updates: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customer_addresses')
      .update(updates)
      .eq('id', id)
      .eq('customer_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update address: ${error.message}`);
    }

    return data as CustomerAddress;
  }

  async deleteAddress(id: string, userId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', id)
      .eq('customer_id', userId);

    if (error) {
      throw new Error(`Failed to delete address: ${error.message}`);
    }
  }

  async getNotifications(userId: string): Promise<CustomerNotification[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customer_notifications')
      .select('*')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return data as CustomerNotification[];
  }

  async markNotificationAsRead(id: string, userId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('customer_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('customer_id', userId);

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }
}
