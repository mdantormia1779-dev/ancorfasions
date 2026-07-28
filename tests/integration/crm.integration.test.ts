import { describe, it, expect, vi } from 'vitest';
import { CRMService } from '../../services/crm.service';

// Mock dependencies
vi.mock('../../repositories/crm.repository', () => ({
  crmRepository: {
    createLead: vi.fn().mockResolvedValue({ id: '1', first_name: 'Test', email: 'test@example.com' }),
    updateLead: vi.fn().mockResolvedValue({ id: '1', status: 'converted' }),
  }
}));

describe('CRM Service Integration', () => {
  it('should create a lead successfully', async () => {
    const crmService = new CRMService();
    const result = await crmService.createLead({ email: 'test@example.com' });
    expect(result).toHaveProperty('id');
    expect(result.email).toBe('test@example.com');
  });

  it('should fail lead creation with invalid data', async () => {
    const crmService = new CRMService();
    await expect(crmService.createLead({ email: 'invalid' })).rejects.toThrow();
  });
});
