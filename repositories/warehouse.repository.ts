import { createAdminClient } from "@/lib/supabase/admin-client";
import {
  Warehouse,
  WarehouseZone,
  WarehouseBin,
} from "@/types/inventory.types";

function normalizeWarehouseType(type?: string): "WAREHOUSE" | "RETAIL_STORE" {
  if (!type) return "WAREHOUSE";
  const upper = String(type).trim().toUpperCase();
  if (
    upper === "RETAIL_STORE" ||
    upper === "RETAIL" ||
    upper === "STORE" ||
    upper === "OUTLET" ||
    upper === "SHOWROOM"
  ) {
    return "RETAIL_STORE";
  }
  return "WAREHOUSE";
}

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
    return (data || []).map((w: any) => ({
      ...w,
      code: w.warehouse_code || w.code || "",
    })) as Warehouse[];
  }

  async getWarehouseById(id: string): Promise<Warehouse | null> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from("warehouses")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error)
      throw new Error(`Failed to get warehouse: ${error.message}`);
    if (!data) return null;
    return {
      ...data,
      code: (data as any).warehouse_code || (data as any).code || "",
    } as Warehouse;
  }

  async createWarehouse(warehouseData: Partial<Warehouse> & { code?: string; warehouse_code?: string }): Promise<Warehouse> {
    const supabase = this.getAdminClient();
    const code = (
      warehouseData.warehouse_code ||
      warehouseData.code ||
      warehouseData.name?.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase() ||
      "WH"
    ).trim().toUpperCase();

    // Check if warehouse_code already exists
    const { data: existing } = await supabase
      .from("warehouses")
      .select("id")
      .ilike("warehouse_code", code)
      .maybeSingle();

    if (existing) {
      throw new Error(`A warehouse with code "${code}" already exists. Please provide a unique code.`);
    }

    const { code: _unusedCode, ...rest } = warehouseData as any;

    const payload: any = {
      ...rest,
      warehouse_code: code,
      name: warehouseData.name?.trim(),
      type: normalizeWarehouseType(warehouseData.type),
      is_active: warehouseData.is_active !== undefined ? warehouseData.is_active : true,
    };

    const { data, error } = await supabase
      .from("warehouses")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(`Failed to create warehouse: ${error.message}`);
    return {
      ...data,
      code: data.warehouse_code || code,
    } as Warehouse;
  }

  async updateWarehouse(
    id: string,
    warehouseData: Partial<Warehouse> & { code?: string; warehouse_code?: string }
  ): Promise<Warehouse> {
    const supabase = this.getAdminClient();
    const payload: any = { ...warehouseData };
    if (payload.code !== undefined) {
      payload.warehouse_code = payload.code;
      delete payload.code;
    }
    if (payload.type !== undefined) {
      payload.type = normalizeWarehouseType(payload.type);
    }
    const { data, error } = await supabase
      .from("warehouses")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update warehouse: ${error.message}`);
    return {
      ...data,
      code: data.warehouse_code,
    } as Warehouse;
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
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get default warehouse: ${error.message}`);
    }
    if (!data) return null;
    return {
      ...data,
      code: (data as any).warehouse_code || (data as any).code || "",
    } as Warehouse;
  }
}
