import { createAdminClient } from '@/lib/supabase/admin-client';
import { Warehouse, WarehouseZone, WarehouseBin } from '@/types/inventory.types';

export class WarehouseRepository {
  private getAdminClient() {
    return createAdminClient();
  }

  async getAllWarehouses(): Promise<Warehouse[]> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase.from('warehouses').select('*').order('name');
    if (error) throw new Error(`Failed to get warehouses: ${error.message}`);
    return data as Warehouse[];
  }

  async getWarehouseById(id: string): Promise<Warehouse | null> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw new Error(`Failed to get warehouse: ${error.message}`);
    return data as Warehouse | null;
  }

  async createWarehouse(warehouseData: Partial<Warehouse>): Promise<Warehouse> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from('warehouses')
      .insert(warehouseData)
      .select()
      .single();
    if (error) throw new Error(`Failed to create warehouse: ${error.message}`);
    return data as Warehouse;
  }

  async updateWarehouse(id: string, warehouseData: Partial<Warehouse>): Promise<Warehouse> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from('warehouses')
      .update(warehouseData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`Failed to update warehouse: ${error.message}`);
    return data as Warehouse;
  }

  async getZonesByWarehouse(warehouseId: string): Promise<WarehouseZone[]> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from('warehouse_zones')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .order('name');
    if (error) throw new Error(`Failed to get warehouse zones: ${error.message}`);
    return data as WarehouseZone[];
  }

  async getBinsByZone(zoneId: string): Promise<WarehouseBin[]> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from('warehouse_bins')
      .select('*')
      .eq('zone_id', zoneId)
      .order('code'); // code is in the DB schema, though type says 'name'. Let me check the type again... wait.
    if (error) throw new Error(`Failed to get warehouse bins: ${error.message}`);
    return data as WarehouseBin[];
  }

  async getDefaultWarehouse(): Promise<Warehouse | null> {
    const supabase = this.getAdminClient();
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get default warehouse: ${error.message}`);
    }
    return data as Warehouse | null;
  }
}
