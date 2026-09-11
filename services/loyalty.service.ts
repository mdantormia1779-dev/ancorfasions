import { createClient, createAdminClient } from "@/lib/supabase/server";
import { LoyaltyRepository } from "@/repositories/loyalty.repository";
import { LoyaltyAccount, LoyaltyTransaction } from "@/types/customer.types";
import { WalletService } from "@/services/wallet.service";

export class LoyaltyService {
  private static async getClient() {
    try {
      return await createAdminClient();
    } catch {
      return await createClient();
    }
  }

  /**
   * Fetch customer loyalty account, creating default SILVER tier if not yet present
   */
  static async getAccount(userId: string): Promise<LoyaltyAccount> {
    const existing = await LoyaltyRepository.getAccount(userId);
    if (existing) return existing;

    const supabase = await this.getClient();
    const { data: created, error } = await supabase
      .from("loyalty_accounts")
      .insert({
        customer_id: userId,
        tier: "SILVER",
        points_balance: 0,
        total_points_earned: 0,
        total_points_redeemed: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to auto-create loyalty account:", error);
      return {
        id: "",
        customer_id: userId,
        tier: "SILVER",
        points_balance: 0,
        total_points_earned: 0,
        total_points_redeemed: 0,
        tier_updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return created;
  }

  static async getTransactions(
    accountId: string
  ): Promise<LoyaltyTransaction[]> {
    return LoyaltyRepository.getTransactions(accountId);
  }

  /**
   * Earn loyalty points (e.g. from purchases, reviews, referrals)
   */
  static async earnPoints(params: {
    userId: string;
    points: number;
    description?: string;
    referenceType?: string;
    referenceId?: string;
  }): Promise<{ account: LoyaltyAccount; pointsEarned: number }> {
    if (params.points <= 0) {
      throw new Error("Points to earn must be greater than zero");
    }

    const account = await this.getAccount(params.userId);
    const supabase = await this.getClient();

    const newBalance = account.points_balance + params.points;
    const newTotalEarned = account.total_points_earned + params.points;

    // Recalculate tier based on lifetime earned points
    let newTier: "SILVER" | "GOLD" | "PLATINUM" | "VIP" = "SILVER";
    if (newTotalEarned >= 10000) newTier = "VIP";
    else if (newTotalEarned >= 5000) newTier = "PLATINUM";
    else if (newTotalEarned >= 2000) newTier = "GOLD";

    const { data: updatedAccount, error: updateError } = await supabase
      .from("loyalty_accounts")
      .update({
        points_balance: newBalance,
        total_points_earned: newTotalEarned,
        tier: newTier,
        tier_updated_at: newTier !== account.tier ? new Date().toISOString() : account.tier_updated_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id)
      .select()
      .single();

    if (updateError || !updatedAccount) {
      throw new Error(`Failed to update loyalty balance: ${updateError?.message}`);
    }

    const isUuid = Boolean(
      params.referenceId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.referenceId)
    );

    // Record transaction
    await supabase.from("loyalty_transactions").insert({
      loyalty_account_id: account.id,
      type: "EARN",
      points: params.points,
      description: params.description || `Earned ${params.points} loyalty points`,
      reference_type: params.referenceType || "MANUAL",
      reference_id: isUuid ? params.referenceId : null,
    });

    return { account: updatedAccount, pointsEarned: params.points };
  }

  /**
   * Redeem loyalty points for discounts, store credit vouchers, or gift rewards
   */
  static async redeemPoints(params: {
    userId: string;
    points: number;
    rewardTitle?: string;
    creditWallet?: boolean;
    walletCreditAmount?: number;
  }): Promise<{ account: LoyaltyAccount; voucherCode: string; walletCredited?: boolean }> {
    if (params.points <= 0) {
      throw new Error("Points to redeem must be greater than zero");
    }

    const account = await this.getAccount(params.userId);
    if (account.points_balance < params.points) {
      throw new Error(
        `Insufficient points balance. You have ${account.points_balance} points, but need ${params.points}.`
      );
    }

    const supabase = await this.getClient();
    const newBalance = account.points_balance - params.points;
    const newTotalRedeemed = account.total_points_redeemed + params.points;

    const { data: updatedAccount, error: updateError } = await supabase
      .from("loyalty_accounts")
      .update({
        points_balance: newBalance,
        total_points_redeemed: newTotalRedeemed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id)
      .select()
      .single();

    if (updateError || !updatedAccount) {
      throw new Error(`Failed to redeem points: ${updateError?.message}`);
    }

    const voucherCode = `RW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Record redemption log
    const desc = params.rewardTitle
      ? `Redeemed: ${params.rewardTitle} (Voucher: ${voucherCode})`
      : `Redeemed ${params.points} points for voucher ${voucherCode}`;

    await supabase.from("loyalty_transactions").insert({
      loyalty_account_id: account.id,
      type: "REDEEM",
      points: params.points,
      description: desc,
      reference_type: "REWARD_REDEMPTION",
      reference_id: null,
    });

    let walletCredited = false;
    // If reward option converts points into wallet credit
    if (params.creditWallet && params.walletCreditAmount && params.walletCreditAmount > 0) {
      try {
        await WalletService.topUp({
          userId: params.userId,
          amount: params.walletCreditAmount,
          paymentMethod: "Loyalty Points Conversion",
          paymentRef: voucherCode,
          description: `Loyalty points redemption reward voucher [${voucherCode}]`,
        });
        walletCredited = true;
      } catch (err) {
        console.error("Failed to auto-credit wallet from loyalty redemption:", err);
      }
    }

    return { account: updatedAccount, voucherCode, walletCredited };
  }
}
