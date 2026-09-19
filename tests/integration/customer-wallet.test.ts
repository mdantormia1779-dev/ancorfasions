import { describe, it, expect, vi } from "vitest";
import { WalletService } from "@/services/wallet.service";
import { LoyaltyService } from "@/services/loyalty.service";
import { WalletRepository } from "@/repositories/wallet.repository";
import { LoyaltyRepository } from "@/repositories/loyalty.repository";

vi.mock("@/repositories/wallet.repository");
vi.mock("@/repositories/loyalty.repository");
vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: vi.fn().mockResolvedValue({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: "wal-1",
              customer_id: "bc067dfd-3df4-46ce-bb93-a6e8b603ee33",
              balance: 1500,
              currency: "BDT",
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      }),
    }),
  }),
  createClient: vi.fn().mockResolvedValue({}),
}));

describe("Wallet and Loyalty Integration", () => {
  it("should retrieve wallet and transactions", async () => {
    const mockWallet = {
      id: "wal-1",
      customer_id: "bc067dfd-3df4-46ce-bb93-a6e8b603ee33",
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

    const wallet = await WalletService.getWallet("bc067dfd-3df4-46ce-bb93-a6e8b603ee33");
    expect(wallet).toBeDefined();
  });

  it("should retrieve loyalty account and points", async () => {
    const mockLoyalty = {
      id: "loy-1",
      customer_id: "bc067dfd-3df4-46ce-bb93-a6e8b603ee33",
      tier: "GOLD" as const,
      points_balance: 3450,
      total_points_earned: 5000,
      total_points_redeemed: 1550,
      tier_updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(LoyaltyRepository.getAccount).mockResolvedValue(mockLoyalty);

    const account = await LoyaltyService.getAccount("bc067dfd-3df4-46ce-bb93-a6e8b603ee33");

    expect(account?.tier).toBe("GOLD");
    expect(account?.points_balance).toBe(3450);
  });
});
