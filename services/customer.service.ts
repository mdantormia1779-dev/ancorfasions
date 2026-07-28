import { CustomerRepository } from '@/repositories/customer.repository';
import { CustomerProfile, CustomerAddress } from '@/types/customer.types';
import { updateProfileSchema, addressSchema } from '@/schemas/customer.schema';

export class CustomerService {
  static async getProfile(userId: string): Promise<CustomerProfile | null> {
    return CustomerRepository.getProfile(userId);
  }

  static async updateProfile(userId: string, data: Partial<CustomerProfile>): Promise<CustomerProfile | null> {
    const validatedData = updateProfileSchema.parse(data);
    return CustomerRepository.updateProfile(userId, validatedData);
  }

  static async getAddresses(userId: string): Promise<CustomerAddress[]> {
    return CustomerRepository.getAddresses(userId);
  }

  static async addAddress(userId: string, data: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const validatedData = addressSchema.parse(data);
    return CustomerRepository.addAddress(userId, validatedData);
  }
}
