import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export type DbClient = SupabaseClient<Database>;

export interface IRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(options?: any): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}

/**
 * Enterprise Base Repository
 * Provides abstract data access foundation.
 */
export abstract class BaseRepository<T, ID = string> implements IRepository<T, ID> {
  protected constructor(
    protected readonly client: DbClient,
    protected readonly tableName: keyof Database['public']['Tables']
  ) {}

  abstract findById(id: ID): Promise<T | null>;
  abstract findAll(options?: any): Promise<T[]>;
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: ID, data: Partial<T>): Promise<T>;
  abstract delete(id: ID): Promise<void>;

  /**
   * Helper to ensure the client is available
   */
  protected get query() {
    return this.client.from(this.tableName as string);
  }
}
