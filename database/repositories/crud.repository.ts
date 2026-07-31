import { BaseRepository, DbClient } from "./base.repository";
import { Database } from "@/types/supabase";
import { handlePostgresError } from "../utils/error-handler";

/**
 * Enterprise Generic CRUD Repository
 * Standardizes common data access patterns.
 */
export class CrudRepository<
  T extends { id: any },
  ID = T["id"],
> extends BaseRepository<T, ID> {
  constructor(client: DbClient, tableName: keyof Database["public"]["Tables"]) {
    super(client, tableName);
  }

  async findById(id: ID): Promise<T | null> {
    const { data, error } = await this.query.select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw handlePostgresError(error);
    }
    return data as T;
  }

  async findAll(options?: { limit?: number; offset?: number }): Promise<T[]> {
    let queryBuilder = this.query.select("*");

    if (options?.limit) {
      queryBuilder = queryBuilder.limit(options.limit);
    }
    if (options?.offset) {
      queryBuilder = queryBuilder.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    const { data, error } = await queryBuilder;

    if (error) throw handlePostgresError(error);
    return data as T[];
  }

  async create(payload: Partial<T>): Promise<T> {
    const { data, error } = await this.query
      .insert(payload as any)
      .select()
      .single();

    if (error) throw handlePostgresError(error);
    return data as T;
  }

  async update(id: ID, payload: Partial<T>): Promise<T> {
    const { data, error } = await this.query
      .update(payload as any)
      .eq("id", id)
      .select()
      .single();

    if (error) throw handlePostgresError(error);
    return data as T;
  }

  async delete(id: ID): Promise<void> {
    const { error } = await this.query.delete().eq("id", id);

    if (error) throw handlePostgresError(error);
  }
}
