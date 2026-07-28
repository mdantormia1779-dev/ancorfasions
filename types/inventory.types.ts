export interface WarehouseZone {
  id: string;
  warehouse_id: string;
  name: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WarehouseBin {
  id: string;
  zone_id: string;
  name: string;
  barcode: string;
  capacity_volume: number;
  capacity_weight: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryLevel {
  id: string;
  variant_id: string;
  warehouse_id: string;
  bin_id?: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_incoming: number;
  quantity_damaged: number;
  quantity_returned: number;
  reorder_point: number;
  safety_stock: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  variant_id: string;
  warehouse_id: string;
  movement_type: 'RECEIVE' | 'TRANSFER' | 'ADJUST' | 'RESERVE' | 'RELEASE' | 'SHIP' | 'RETURN' | 'DAMAGE';
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  from_bin_id?: string;
  to_bin_id?: string;
  to_warehouse_id?: string;
  reason_code?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  lead_time_days: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  destination_warehouse_id: string;
  status: 'DRAFT' | 'SENT' | 'PARTIAL_RECEIPT' | 'FULFILLED' | 'CANCELLED';
  ordered_by?: string;
  expected_delivery_date?: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  variant_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryAudit {
  id: string;
  warehouse_id: string;
  zone_id?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assigned_to?: string;
  scheduled_date?: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryAuditItem {
  id: string;
  audit_id: string;
  variant_id: string;
  bin_id?: string;
  expected_quantity: number;
  counted_quantity?: number;
  variance?: number;
  status: 'PENDING' | 'COUNTED' | 'DISCREPANCY' | 'RESOLVED';
  created_at: string;
  updated_at: string;
}
