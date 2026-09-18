import { createAdminClient } from "@/lib/supabase/admin-client";
import {
  Warehouse,
  WarehouseZone,
  WarehouseBin,
} from "@/types/inventory.types";

export class WarehouseRepository {
  private getAdminClient() {
    return createAdminClient();
  }

  async getAllWarehouses(): Promise<Warehouse[]> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from("warehouses")
      .select("*")
      .order("name");
    if (error) throw new Error(`Failed to get warehouses: ${error.message}`);
    return data as Warehouse[];
  }

  async getWarehouseById(id: string): Promise<Warehouse | null> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from("warehouses")
      .select("*")
      .eq("id", id)
      .single();
    if (error && error.code !== "PGRST116")
      throw new Error(`Failed to get warehouse: ${error.message}`);
    return data as Warehouse | null;
  }

  async createWarehouse(warehouseData: Partial<Warehouse> & { code?: string }): Promise<Warehouse> {
    const supabase = this.getAdminClient();
    const code = (
      warehouseData.code ||
      warehouseData.name?.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase() ||
      "WH"
    ).trim().toUpperCase();

    // Check if code already exists
    const { data: existing } = await supabase
      .from("warehouses")
      .select("id")
      .ilike("code", code)
      .maybeSingle();

    if (existing) {
      throw new Error(`A warehouse with code "${code}" already exists. Please provide a unique code.`);
    }

    const { data, error } = await supabase
      .from("warehouses")
      .insert({
        ...warehouseData,
        code,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to create warehouse: ${error.message}`);
    return data as Warehouse;
  }

  async updateWarehouse(
    id: string,
    warehouseData: Partial<Warehouse>
  ): Promise<Warehouse> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from("warehouses")
      .update(warehouseData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update warehouse: ${error.message}`);
    return data as Warehouse;
  }

  async getZonesByWarehouse(warehouseId: string): Promise<WarehouseZone[]> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from("warehouse_zones")
      .select("*")
      .eq("warehouse_id", warehouseId)
      .order("name");
    if (error)
      throw new Error(`Failed to get warehouse zones: ${error.message}`);
    return data as WarehouseZone[];
  }

  async createZone(zoneData: Partial<WarehouseZone>): Promise<WarehouseZone> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from("warehouse_zones")
      .insert(zoneData)
      .select()
      .single();
    if (error) throw new Error(`Failed to create zone: ${error.message}`);
    return data as WarehouseZone;
  }

  async updateZone(id: string, zoneData: Partial<WarehouseZone>): Promise<WarehouseZone> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from("warehouse_zones")
      .update(zoneData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update zone: ${error.message}`);
    return data as WarehouseZone;
  }

  async deleteZone(id: string): Promise<void> {
    const supabase = this.getAdminClient();
    const { error } = await supabase.from("warehouse_zones").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete zone: ${error.message}`);
  }

  async getBinsByZone(zoneId: string): Promise<WarehouseBin[]> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from("warehouse_bins")
      .select("*")
      .eq("zone_id", zoneId)
      .order("code"); // code is in the DB schema, though type says 'name'. Let me check the type again... wait.
    if (error)
      throw new Error(`Failed to get warehouse bins: ${error.message}`);
    return data as WarehouseBin[];
  }

  async createBin(binData: Partial<WarehouseBin>): Promise<WarehouseBin> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from("warehouse_bins")
      .insert(binData)
      .select()
      .single();
    if (error) throw new Error(`Failed to create bin: ${error.message}`);
    return data as WarehouseBin;
  }

  async updateBin(id: string, binData: Partial<WarehouseBin>): Promise<WarehouseBin> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from("warehouse_bins")
      .update(binData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update bin: ${error.message}`);
    return data as WarehouseBin;
  }

  async deleteBin(id: string): Promise<void> {
    const supabase = this.getAdminClient();
    const { error } = await supabase.from("warehouse_bins").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete bin: ${error.message}`);
  }

  async getDefaultWarehouse(): Promise<Warehouse | null> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from("warehouses")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to get default warehouse: ${error.message}`);
    }
    return data as Warehouse | null;
  }
}
