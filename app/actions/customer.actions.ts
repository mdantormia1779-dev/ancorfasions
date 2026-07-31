'use server';

import { revalidatePath } from 'next/cache';
import { CustomerService } from '@/lib/services/customer.service';
import { createClient } from '@/lib/supabase/server';

const customerService = new CustomerService();

async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user.id;
}

export async function updateProfileAction(formData: FormData) {
  const userId = await getUserId();
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const phone = formData.get('phone') as string;
  const dob = formData.get('date_of_birth') as string;
  
  await customerService.updateProfile(userId, {
    first_name: firstName,
    last_name: lastName,
    phone: phone,
    date_of_birth: dob || null,
  });

  revalidatePath('/account/profile');
  return { success: true };
}

export async function createAddressAction(formData: FormData) {
  const userId = await getUserId();
  
  await customerService.createAddress(userId, {
    title: formData.get('title') as string || 'Home',
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    phone: formData.get('phone') as string,
    address_line_1: formData.get('address_line_1') as string,
    address_line_2: formData.get('address_line_2') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    zip: formData.get('zip') as string,
    country: formData.get('country') as string || 'US',
    is_default_shipping: formData.get('is_default_shipping') === 'true',
    is_default_billing: formData.get('is_default_billing') === 'true',
  });

  revalidatePath('/account/addresses');
  return { success: true };
}

export async function markNotificationAsReadAction(id: string) {
  const userId = await getUserId();
  await customerService.markNotificationAsRead(id, userId);
  revalidatePath('/account/notifications');
  return { success: true };
}

export async function fetchWalletAction() {
  try {
    const userId = await getUserId();
    const supabase = await createClient();
    
    const { data: wallet, error: walletError } = await supabase
      .from('customer_wallets')
      .select('*')
      .eq('customer_id', userId)
      .single();

    if (walletError) {
      if (walletError.code === 'PGRST116') return { success: true, data: { balance: 0, currency: 'BDT', transactions: [] } };
      throw walletError;
    }

    const { data: transactions } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false });

    return { success: true, data: { ...wallet, transactions: transactions || [] } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchLoyaltyAction() {
  try {
    const userId = await getUserId();
    const supabase = await createClient();
    
    const { data: loyalty, error: loyaltyError } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .eq('customer_id', userId)
      .single();

    if (loyaltyError) {
      if (loyaltyError.code === 'PGRST116') return { success: true, data: { tier: 'MEMBER', points_balance: 0 } };
      throw loyaltyError;
    }

    return { success: true, data: loyalty };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchAccountSummaryAction() {
  try {
    const userId = await getUserId();
    const supabase = await createClient();
    
    const [walletRes, loyaltyRes, ordersRes] = await Promise.all([
      fetchWalletAction(),
      fetchLoyaltyAction(),
      supabase.from('orders').select('id', { count: 'exact' }).eq('customer_id', userId).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    return {
      success: true,
      data: {
        recentOrders: ordersRes.count || 0,
        walletBalance: walletRes.data?.balance || 0,
        currency: walletRes.data?.currency || 'BDT',
        loyaltyPoints: loyaltyRes.data?.points_balance || 0,
        loyaltyTier: loyaltyRes.data?.tier || 'MEMBER',
        supportTickets: 0 // Can be replaced by actual count
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAddressAction(id: string) {
  try {
    const userId = await getUserId();
    await customerService.deleteAddress(id, userId);
    revalidatePath('/account/addresses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- Customer Portal Actions ---

export async function fetchReviewsAction() {
  try {
    const userId = await getUserId();
    const reviews = await customerService.getReviews(userId);
    return { success: true, data: reviews };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchTicketsAction() {
  try {
    const userId = await getUserId();
    const tickets = await customerService.getTickets(userId);
    return { success: true, data: tickets };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createTicketAction(formData: FormData) {
  try {
    const userId = await getUserId();
    const subject = formData.get('subject') as string;
    const description = formData.get('description') as string;
    
    await customerService.createTicket(userId, {
      subject,
      description,
      status: 'OPEN',
      priority: 'NORMAL'
    });
    
    revalidatePath('/account/support');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchTicketDetailsAction(ticketId: string) {
  try {
    const userId = await getUserId();
    const ticket = await customerService.getTicketDetails(ticketId, userId);
    return { success: true, data: ticket };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchLoginHistoryAction() {
  try {
    const userId = await getUserId();
    const history = await customerService.getLoginHistory(userId);
    return { success: true, data: history };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchActiveSessionsAction() {
  try {
    const userId = await getUserId();
    const sessions = await customerService.getActiveSessions(userId);
    return { success: true, data: sessions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

