"use server";

import { WarehouseService } from "@/services/warehouse.service";
import {
  Warehouse,
  WarehouseZone,
  WarehouseBin,
} from "@/types/inventory.types";

export async function getAllWarehouses(): Promise<{
  data?: Warehouse[];
  error?: string;
}> {
  try {
    const service = new WarehouseService();
    const data = await service.getAllWarehouses();
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getWarehouseById(
  id: string
): Promise<{ data?: Warehouse | null; error?: string }> {
  try {
    const service = new WarehouseService();
    const data = await service.getWarehouseById(id);
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

import { revalidatePath } from "next/cache";

export async function createWarehouse(
  input: Partial<Warehouse> & { code?: string }
): Promise<{ data?: Warehouse; error?: string }> {
  try {
    const service = new WarehouseService();
    const data = await service.createWarehouse(input);
    revalidatePath("/admin/inventory/warehouses");
    revalidatePath("/admin/operations/warehouses");
    return { data };
  } catch (error: any) {
    return { error: error.message || "Failed to create warehouse" };
  }
}

export async function updateWarehouse(
  id: string,
  input: Partial<Warehouse>
): Promise<{ data?: Warehouse; error?: string }> {
  try {
    const service = new WarehouseService();
    const data = await service.updateWarehouse(id, input);
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getWarehouseZones(
  warehouseId: string
): Promise<{ data?: WarehouseZone[]; error?: string }> {
  try {
    const service = new WarehouseService();
    const data = await service.getZones(warehouseId);
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getZoneBins(
  zoneId: string
): Promise<{ data?: WarehouseBin[]; error?: string }> {
  try {
    const service = new WarehouseService();
    const data = await service.getBins(zoneId);
    return { data };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createWarehouseZoneAction(data: {
  warehouse_id: string;
  name: string;
  type: string;
}): Promise<{ data?: WarehouseZone; error?: string }> {
  try {
    const service = new WarehouseService();
    const zone = await service.createZone({
      warehouse_id: data.warehouse_id,
      name: data.name,
      type: data.type || "PICKING",
      is_active: true,
    });
    revalidatePath(`/admin/inventory/warehouses/${data.warehouse_id}`);
    return { data: zone };
  } catch (error: any) {
    return { error: error.message || "Failed to create storage zone" };
  }
}

export async function deleteWarehouseZoneAction(
  zoneId: string,
  warehouseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const service = new WarehouseService();
    await service.deleteZone(zoneId);
    revalidatePath(`/admin/inventory/warehouses/${warehouseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete storage zone" };
  }
}

export async function createWarehouseBinAction(
  data: {
    zone_id: string;
    code: string;
    barcode?: string;
    capacity_volume?: number;
    capacity_weight?: number;
  },
  warehouseId: string
): Promise<{ data?: WarehouseBin; error?: string }> {
  try {
    const service = new WarehouseService();
    const bin = await service.createBin({
      zone_id: data.zone_id,
      code: data.code.trim().toUpperCase(),
      barcode: data.barcode?.trim() || data.code.trim().toUpperCase(),
      capacity_volume: Number(data.capacity_volume) || 0,
      capacity_weight: Number(data.capacity_weight) || 0,
    });
    revalidatePath(`/admin/inventory/warehouses/${warehouseId}`);
    return { data: bin };
  } catch (error: any) {
    return { error: error.message || "Failed to create storage bin" };
  }
}

export async function deleteWarehouseBinAction(
  binId: string,
  warehouseId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const service = new WarehouseService();
    await service.deleteBin(binId);
    revalidatePath(`/admin/inventory/warehouses/${warehouseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete storage bin" };
  }
}

