import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from '@/services/payment.service';
import { paymentRepository } from '@/repositories/payment.repository';
import { paymentFactory } from '@/providers/payment/payment.factory';

// Mock dependencies
vi.mock('@/repositories/payment.repository', () => ({
  paymentRepository: {
    getProviderByCode: vi.fn(),
    createSession: vi.fn(),
    updateSession: vi.fn(),
    createTransaction: vi.fn(),
    createAuditLog: vi.fn(),
    getSessionById: vi.fn(),
    getTransactionBySessionId: vi.fn(),
    updateTransaction: vi.fn(),
  }
}));

describe('PaymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializePayment', () => {
    it('should initialize payment via provider and create db records', async () => {
      // Mock db returns
      vi.mocked(paymentRepository.getProviderByCode).mockResolvedValue({ id: 'provider-1', code: 'mock' } as any);
      vi.mocked(paymentRepository.createSession).mockResolvedValue({ id: 'session-1' } as any);
      vi.mocked(paymentRepository.createTransaction).mockResolvedValue({ id: 'txn-1' } as any);

      // Mock provider via factory
      const mockProvider = {
        getCode: () => 'mock',
        initializePayment: vi.fn().mockResolvedValue({ gatewayUrl: 'http://mock.gateway/pay' })
      };
      vi.spyOn(paymentFactory, 'getActiveProvider').mockResolvedValue(mockProvider as any);

      const request = {
        orderId: 'order-1',
        userId: 'user-1',
        amount: 100,
        providerCode: 'mock'
      };

      const result = await paymentService.initializePayment(request);

      expect(result.sessionId).toBe('session-1');
      expect(result.gatewayUrl).toBe('http://mock.gateway/pay');
      expect(paymentRepository.createSession).toHaveBeenCalled();
      expect(paymentRepository.updateSession).toHaveBeenCalledWith('session-1', { gatewayUrl: 'http://mock.gateway/pay' });
      expect(paymentRepository.createTransaction).toHaveBeenCalled();
      expect(paymentRepository.createAuditLog).toHaveBeenCalled();
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment and update transaction status to completed', async () => {
      vi.mocked(paymentRepository.getSessionById).mockResolvedValue({ id: 'session-1', provider_id: 'provider-1' } as any);
      vi.mocked(paymentRepository.getTransactionBySessionId).mockResolvedValue({ id: 'txn-1' } as any);
      vi.mocked(paymentRepository.getProviderByCode).mockResolvedValue({ id: 'provider-1', code: 'mock' } as any);
      vi.mocked(paymentRepository.updateTransaction).mockResolvedValue({ id: 'txn-1', status: 'completed' } as any);

      const mockProvider = {
        getCode: () => 'mock',
        verifyPayment: vi.fn().mockResolvedValue({ status: 'completed' })
      };
      vi.spyOn(paymentFactory, 'getProvider').mockReturnValue(mockProvider as any);

      const result = await paymentService.verifyPayment('session-1', { status: 'success' });

      expect(result.status).toBe('completed');
      expect(paymentRepository.updateTransaction).toHaveBeenCalledWith('txn-1', { status: 'completed' });
      expect(paymentRepository.updateSession).toHaveBeenCalledWith('session-1', { status: 'completed' });
      expect(paymentRepository.createAuditLog).toHaveBeenCalled();
    });
  });
});
