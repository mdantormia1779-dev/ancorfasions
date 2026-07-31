import { describe, it, expect, vi } from "vitest";
import { WalletService } from "@/services/wallet.service";
import { LoyaltyService } from "@/services/loyalty.service";
import { WalletRepository } from "@/repositories/wallet.repository";
import { LoyaltyRepository } from "@/repositories/loyalty.repository";

vi.mock("@/repositories/wallet.repository");
vi.mock("@/repositories/loyalty.repository");

describe("Wallet and Loyalty Integration", () => {
  it("should retrieve wallet and transactions", async () => {
    const mockWallet = {
      id: "wal-1",
      customer_id: "usr-1",
      balance: 1500,
      currency: "BDT",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockTransactions = [
      {
        id: "tx-1",
        wallet_id: "wal-1",
        type: "CREDIT" as const,
        amount: 500,
        balance_after: 1500,
        reference_type: "BONUS",
        reference_id: null,
        description: "Sign-up Bonus",
        created_at: new Date().toISOString(),
      },
    ];

    vi.mocked(WalletRepository.getWallet).mockResolvedValue(mockWallet);
    vi.mocked(WalletRepository.getTransactions).mockResolvedValue(
      mockTransactions
    );

    const wallet = await WalletService.getWallet("usr-1");
    const transactions = await WalletService.getTransactions("wal-1");

    expect(wallet?.balance).toBe(1500);
    expect(transactions.length).toBe(1);
    expect(transactions[0].amount).toBe(500);
  });

  it("should retrieve loyalty account and points", async () => {
    const mockLoyalty = {
      id: "loy-1",
      customer_id: "usr-1",
      tier: "GOLD" as const,
      points_balance: 3450,
      total_points_earned: 5000,
      total_points_redeemed: 1550,
      tier_updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(LoyaltyRepository.getAccount).mockResolvedValue(mockLoyalty);

    const account = await LoyaltyService.getAccount("usr-1");

    expect(account?.tier).toBe("GOLD");
    expect(account?.points_balance).toBe(3450);
  });
});
