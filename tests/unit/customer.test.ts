import { describe, it, expect, vi } from 'vitest';
import { CustomerService } from '@/services/customer.service';
import { CustomerRepository } from '@/repositories/customer.repository';

// Mock repository
vi.mock('@/repositories/customer.repository');

describe('CustomerService', () => {
  it('should fetch customer profile', async () => {
    const mockProfile = {
      id: 'usr-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: null,
      date_of_birth: null,
      gender: null,
      avatar_url: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    vi.mocked(CustomerRepository.getProfile).mockResolvedValue(mockProfile);

    const profile = await CustomerService.getProfile('usr-1');
    expect(profile).toEqual(mockProfile);
    expect(CustomerRepository.getProfile).toHaveBeenCalledWith('usr-1');
  });

  it('should validate and update customer profile', async () => {
    const mockProfile = {
      id: 'usr-1',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      phone: '+1234567890',
      date_of_birth: '1990-01-01',
      gender: 'FEMALE' as const,
      avatar_url: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(CustomerRepository.updateProfile).mockResolvedValue(mockProfile);

    const updates = { first_name: 'Jane', last_name: 'Smith', phone: '+1234567890' };
    const updated = await CustomerService.updateProfile('usr-1', updates);

    expect(updated?.first_name).toBe('Jane');
    expect(CustomerRepository.updateProfile).toHaveBeenCalledWith('usr-1', updates);
  });
});
