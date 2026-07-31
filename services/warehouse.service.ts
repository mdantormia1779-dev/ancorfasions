import { WarehouseRepository } from "@/repositories/warehouse.repository";
import {
  Warehouse,
  WarehouseZone,
  WarehouseBin,
} from "@/types/inventory.types";

export class WarehouseService {
  private repository: WarehouseRepository;

  constructor() {
    this.repository = new WarehouseRepository();
  }

  async getAllWarehouses(): Promise<Warehouse[]> {
    return await this.repository.getAllWarehouses();
  }

  async getWarehouseById(id: string): Promise<Warehouse | null> {
    return await this.repository.getWarehouseById(id);
  }

  async createWarehouse(data: Partial<Warehouse>): Promise<Warehouse> {
    return await this.repository.createWarehouse(data);
  }

  async updateWarehouse(
    id: string,
    data: Partial<Warehouse>
  ): Promise<Warehouse> {
    return await this.repository.updateWarehouse(id, data);
  }

  async getZones(warehouseId: string): Promise<WarehouseZone[]> {
    return await this.repository.getZonesByWarehouse(warehouseId);
  }

  async getBins(zoneId: string): Promise<WarehouseBin[]> {
    return await this.repository.getBinsByZone(zoneId);
  }

  async getDefaultWarehouse(): Promise<Warehouse | null> {
    return await this.repository.getDefaultWarehouse();
  }
}
