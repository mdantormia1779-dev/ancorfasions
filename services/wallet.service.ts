import { WalletRepository } from '@/repositories/wallet.repository';
import { CustomerWallet, WalletTransaction } from '@/types/customer.types';

export class WalletService {
  static async getWallet(userId: string): Promise<CustomerWallet | null> {
    return WalletRepository.getWallet(userId);
  }

  static async getTransactions(walletId: string): Promise<WalletTransaction[]> {
    return WalletRepository.getTransactions(walletId);
  }
}
