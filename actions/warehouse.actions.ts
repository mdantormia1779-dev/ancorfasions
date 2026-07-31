'use server';

import { WarehouseService } from '@/services/warehouse.service';
import { Warehouse, WarehouseZone, WarehouseBin } from '@/types/inventory.types';

export async function getAllWarehouses(): Promise<{ data?: Warehouse[]; error?: string }> {
  try {
    const service = new WarehouseService();
    const data = await service.getAllWarehouses();
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getWarehouseById(id: string): Promise<{ data?: Warehouse | null; error?: string }> {
  try {
    const service = new WarehouseService();
    const data = await service.getWarehouseById(id);
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createWarehouse(input: Partial<Warehouse>): Promise<{ data?: Warehouse; error?: string }> {
  try {
    const service = new WarehouseService();
    const data = await service.createWarehouse(input);
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateWarehouse(id: string, input: Partial<Warehouse>): Promise<{ data?: Warehouse; error?: string }> {
  try {
    const service = new WarehouseService();
    const data = await service.updateWarehouse(id, input);
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getWarehouseZones(warehouseId: string): Promise<{ data?: WarehouseZone[]; error?: string }> {
  try {
    const service = new WarehouseService();
    const data = await service.getZones(warehouseId);
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getZoneBins(zoneId: string): Promise<{ data?: WarehouseBin[]; error?: string }> {
  try {
    const service = new WarehouseService();
    const data = await service.getBins(zoneId);
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}
