import { LoyaltyRepository } from "@/repositories/loyalty.repository";
import { LoyaltyAccount, LoyaltyTransaction } from "@/types/customer.types";

export class LoyaltyService {
  static async getAccount(userId: string): Promise<LoyaltyAccount | null> {
    return LoyaltyRepository.getAccount(userId);
  }

  static async getTransactions(
    accountId: string
  ): Promise<LoyaltyTransaction[]> {
    return LoyaltyRepository.getTransactions(accountId);
  }
}
