"use server";

import { revalidatePath } from "next/cache";
import { CustomerService } from "@/lib/services/customer.service";
import { createClient } from "@/lib/supabase/server";
import { WalletService } from "@/services/wallet.service";
import { LoyaltyService } from "@/services/loyalty.service";

const customerService = new CustomerService();

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user.id;
}

export async function updateProfileAction(formData: FormData) {
  const userId = await getUserId();
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const phone = formData.get("phone") as string;
  const dob = formData.get("date_of_birth") as string;

  await customerService.updateProfile(userId, {
    first_name: firstName,
    last_name: lastName,
    phone: phone,
    date_of_birth: dob || null,
  });

  revalidatePath("/account/profile");
  return { success: true };
}

export async function createAddressAction(formData: FormData) {
  const userId = await getUserId();

  await customerService.createAddress(userId, {
    title: (formData.get("title") as string) || "Home",
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
    address_line_1: formData.get("address_line_1") as string,
    address_line_2: formData.get("address_line_2") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    zip: formData.get("zip") as string,
    country: (formData.get("country") as string) || "US",
    is_default_shipping: formData.get("is_default_shipping") === "true",
    is_default_billing: formData.get("is_default_billing") === "true",
  });

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function markNotificationAsReadAction(id: string) {
  const userId = await getUserId();
  await customerService.markNotificationAsRead(id, userId);
  revalidatePath("/account/notifications");
  return { success: true };
}

export async function fetchWalletAction() {
  try {
    const userId = await getUserId();
    const supabase = await createClient();

    const { data: wallet, error: walletError } = await supabase
      .from("customer_wallets")
      .select("*")
      .eq("customer_id", userId)
      .single();

    if (walletError) {
      if (walletError.code === "PGRST116")
        return {
          success: true,
          data: { balance: 0, currency: "BDT", transactions: [] },
        };
      throw walletError;
    }

    const { data: transactions } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("wallet_id", wallet.id)
      .order("created_at", { ascending: false });

    return {
      success: true,
      data: { ...wallet, transactions: transactions || [] },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchLoyaltyAction() {
  try {
    const userId = await getUserId();
    const supabase = await createClient();

    const { data: loyalty, error: loyaltyError } = await supabase
      .from("loyalty_accounts")
      .select("*")
      .eq("customer_id", userId)
      .single();

    if (loyaltyError) {
      if (loyaltyError.code === "PGRST116")
        return { success: true, data: { tier: "MEMBER", points_balance: 0 } };
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
      supabase
        .from("orders")
        .select("id", { count: "exact" })
        .eq("customer_id", userId)
        .gte(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        ),
    ]);

    return {
      success: true,
      data: {
        recentOrders: ordersRes.count || 0,
        walletBalance: walletRes.data?.balance || 0,
        currency: walletRes.data?.currency || "BDT",
        loyaltyPoints: loyaltyRes.data?.points_balance || 0,
        loyaltyTier: loyaltyRes.data?.tier || "MEMBER",
        supportTickets: 0, // Can be replaced by actual count
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAddressAction(id: string) {
  try {
    const userId = await getUserId();
    await customerService.deleteAddress(id, userId);
    revalidatePath("/account/addresses");
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
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;

    await customerService.createTicket(userId, {
      subject,
      description,
      status: "OPEN",
      priority: "NORMAL",
    });

    revalidatePath("/account/support");
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

export async function replyTicketAction(data: {
  ticketId: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    if (!data.message || !data.message.trim()) {
      return { success: false, error: "Message cannot be empty" };
    }
    await customerService.replyTicket(data.ticketId, userId, data.message.trim());
    revalidatePath(`/account/support/${data.ticketId}`);
    revalidatePath("/account/support");
    return { success: true };
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

export async function fetchPurchasedProductsAction(): Promise<{
  success: boolean;
  data?: Array<{
    productId: string;
    productName: string;
    orderId: string;
    orderNumber: string;
  }>;
  error?: string;
}> {
  try {
    const userId = await getUserId();
    const supabase = await createClient();

    // Fetch user's orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, order_number")
      .eq("customer_id", userId);

    if (ordersError || !orders || orders.length === 0) {
      // Fallback to catalog products so customer can still submit review
      const { data: catalogProducts } = await supabase
        .from("products")
        .select("id, name")
        .limit(10);

      return {
        success: true,
        data: (catalogProducts || []).map((p) => ({
          productId: p.id,
          productName: p.name,
          orderId: "",
          orderNumber: "Catalog Product",
        })),
      };
    }

    const orderIds = orders.map((o) => o.id);
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, product_name, order_id")
      .in("order_id", orderIds)
      .not("product_id", "is", null);

    const orderMap = orders.reduce((acc, o) => {
      acc[o.id] = o.order_number;
      return acc;
    }, {} as Record<string, string>);

    const seen = new Set<string>();
    const purchased: Array<{
      productId: string;
      productName: string;
      orderId: string;
      orderNumber: string;
    }> = [];

    for (const it of items || []) {
      if (it.product_id && !seen.has(it.product_id)) {
        seen.add(it.product_id);
        purchased.push({
          productId: it.product_id,
          productName: it.product_name,
          orderId: it.order_id,
          orderNumber: orderMap[it.order_id] || "Order",
        });
      }
    }

    if (purchased.length === 0) {
      const { data: catalogProducts } = await supabase
        .from("products")
        .select("id, name")
        .limit(10);

      return {
        success: true,
        data: (catalogProducts || []).map((p) => ({
          productId: p.id,
          productName: p.name,
          orderId: "",
          orderNumber: "Catalog Product",
        })),
      };
    }

    return { success: true, data: purchased };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createReviewAction(data: {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  body?: string;
  comment?: string;
  review_text?: string;
}): Promise<{ success?: boolean; data?: any; error?: string }> {
  try {
    const userId = await getUserId();
    const supabase = await createClient();

    if (data.rating < 1 || data.rating > 5) {
      return { error: "Rating must be between 1 and 5" };
    }

    // Check if user already reviewed this product in customer_reviews
    const { data: existing } = await supabase
      .from("customer_reviews")
      .select("id")
      .eq("customer_id", userId)
      .eq("product_id", data.productId)
      .maybeSingle();

    if (existing) {
      return { error: "You have already reviewed this product" };
    }

    const reviewContent = data.review_text || data.comment || data.body || data.title || "Verified product review";

    const { data: review, error } = await supabase
      .from("customer_reviews")
      .insert({
        customer_id: userId,
        product_id: data.productId,
        order_id: data.orderId || null,
        rating: data.rating,
        title: data.title || null,
        review_text: reviewContent,
        is_approved: false,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/account/reviews");
    return { success: true, data: review };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function topUpWalletAction(data: {
  amount: number;
  paymentMethod: string;
  paymentRef: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const userId = await getUserId();
    if (!data.amount || data.amount <= 0) {
      return { success: false, error: "Amount must be greater than zero" };
    }
    if (!data.paymentRef || !data.paymentRef.trim()) {
      return { success: false, error: "Payment transaction reference is required" };
    }

    const result = await WalletService.topUp({
      userId,
      amount: Number(data.amount),
      paymentMethod: data.paymentMethod || "bKash / Nagad",
      paymentRef: data.paymentRef.trim(),
    });

    revalidatePath("/account/wallet");
    revalidatePath("/account");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function withdrawWalletAction(data: {
  amount: number;
  destinationMethod: string;
  destinationAccount: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const userId = await getUserId();
    if (!data.amount || data.amount <= 0) {
      return { success: false, error: "Amount must be greater than zero" };
    }
    if (!data.destinationAccount || !data.destinationAccount.trim()) {
      return { success: false, error: "Account/Mobile number is required" };
    }

    const result = await WalletService.withdraw({
      userId,
      amount: Number(data.amount),
      destinationMethod: data.destinationMethod || "bKash",
      destinationAccount: data.destinationAccount.trim(),
    });

    revalidatePath("/account/wallet");
    revalidatePath("/account");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function transferWalletAction(data: {
  toIdentifier: string;
  amount: number;
  note?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const userId = await getUserId();
    if (!data.amount || data.amount <= 0) {
      return { success: false, error: "Transfer amount must be greater than zero" };
    }
    if (!data.toIdentifier || !data.toIdentifier.trim()) {
      return { success: false, error: "Recipient phone or customer ID is required" };
    }

    const result = await WalletService.transfer({
      fromUserId: userId,
      toIdentifier: data.toIdentifier.trim(),
      amount: Number(data.amount),
      note: data.note,
    });

    revalidatePath("/account/wallet");
    revalidatePath("/account");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function redeemLoyaltyPointsAction(data: {
  points: number;
  rewardTitle: string;
  creditWallet?: boolean;
  walletCreditAmount?: number;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const userId = await getUserId();
    if (!data.points || data.points <= 0) {
      return { success: false, error: "Points must be greater than zero" };
    }

    const result = await LoyaltyService.redeemPoints({
      userId,
      points: Number(data.points),
      rewardTitle: data.rewardTitle,
      creditWallet: data.creditWallet,
      walletCreditAmount: data.walletCreditAmount,
    });

    revalidatePath("/account/loyalty");
    revalidatePath("/account/rewards");
    revalidatePath("/account/wallet");
    revalidatePath("/account");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomerReviewAction(reviewId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("customer_reviews")
      .delete()
      .eq("id", reviewId)
      .eq("customer_id", userId);

    if (error) throw error;

    revalidatePath("/account/reviews");
    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}



