-- ==========================================
-- Anchor Fashion Enterprise - Migration 8
-- Enterprise Inventory, Warehouse & Stock Management
-- ==========================================

-- ==========================================
-- 1. WAREHOUSE HIERARCHY
-- ==========================================
-- Warehouses table was created in 20260724300000_enterprise_catalog_oms.sql
-- Let's add Zones, Aisles, Racks, and Bins

CREATE TABLE public.warehouse_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'STORAGE' CHECK (type IN ('STORAGE', 'PICKING', 'RETURNS', 'QUARANTINE', 'COLD_STORAGE')),
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'FULL', 'OFFLINE')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.warehouse_bins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID REFERENCES public.warehouse_zones(id) ON DELETE CASCADE NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE, -- e.g., BIN-04-B-12
    barcode VARCHAR(100) UNIQUE,
    capacity_volume DECIMAL(10,2), -- In cubic meters or cm3
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'HOLD', 'FULL')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 2. INVENTORY LEDGER (Double-Entry)
-- ==========================================

-- We will replace the basic inventory table with a robust inventory_levels table per bin
CREATE TABLE public.inventory_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID REFERENCES public.variants(id) ON DELETE CASCADE NOT NULL,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE NOT NULL,
    bin_id UUID REFERENCES public.warehouse_bins(id), -- Nullable if we only track at warehouse level for some
    
    -- Status Buckets
    quantity_available INTEGER DEFAULT 0 CHECK (quantity_available >= 0),
    quantity_reserved INTEGER DEFAULT 0 CHECK (quantity_reserved >= 0),
    quantity_incoming INTEGER DEFAULT 0 CHECK (quantity_incoming >= 0),
    quantity_damaged INTEGER DEFAULT 0 CHECK (quantity_damaged >= 0),
    quantity_returned INTEGER DEFAULT 0 CHECK (quantity_returned >= 0),
    
    -- Planning
    reorder_point INTEGER DEFAULT 0,
    safety_stock INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(variant_id, warehouse_id, bin_id)
);

-- Enhance stock movements to support detailed tracking
ALTER TABLE public.stock_movements
    ADD COLUMN to_warehouse_id UUID REFERENCES public.warehouses(id),
    ADD COLUMN from_bin_id UUID REFERENCES public.warehouse_bins(id),
    ADD COLUMN to_bin_id UUID REFERENCES public.warehouse_bins(id),
    ADD COLUMN reason_code VARCHAR(100);

-- ==========================================
-- 3. PURCHASE ORDERS & RECEIVING
-- ==========================================

CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    lead_time_days INTEGER DEFAULT 7,
    rating DECIMAL(3,2), -- 1.00 to 5.00
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE RESTRICT NOT NULL,
    destination_warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'PARTIAL_RECEIPT', 'FULFILLED', 'CANCELLED')),
    ordered_by UUID REFERENCES public.profiles(id),
    expected_delivery_date TIMESTAMPTZ,
    total_amount DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES public.variants(id) ON DELETE RESTRICT NOT NULL,
    quantity_ordered INTEGER NOT NULL CHECK (quantity_ordered > 0),
    quantity_received INTEGER DEFAULT 0 CHECK (quantity_received >= 0),
    unit_cost DECIMAL(10,2) NOT NULL
);

-- ==========================================
-- 4. INVENTORY AUDITS (Cycle Counts)
-- ==========================================

CREATE TABLE public.inventory_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT NOT NULL,
    zone_id UUID REFERENCES public.warehouse_zones(id),
    status VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED')),
    assigned_to UUID REFERENCES public.profiles(id),
    blind_count BOOLEAN DEFAULT true, -- If true, staff doesn't see expected quantity
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.inventory_audit_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES public.inventory_audits(id) ON DELETE CASCADE NOT NULL,
    bin_id UUID REFERENCES public.warehouse_bins(id) ON DELETE RESTRICT NOT NULL,
    variant_id UUID REFERENCES public.variants(id) ON DELETE RESTRICT NOT NULL,
    expected_quantity INTEGER NOT NULL,
    counted_quantity INTEGER,
    variance INTEGER, -- counted_quantity - expected_quantity
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COUNTED', 'RECOUNT_REQUESTED', 'APPROVED', 'REJECTED')),
    notes TEXT
);

-- ==========================================
-- 5. TRIGGERS & RLS
-- ==========================================

CREATE TRIGGER update_warehouse_zones_updated_at BEFORE UPDATE ON public.warehouse_zones FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_warehouse_bins_updated_at BEFORE UPDATE ON public.warehouse_bins FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_inventory_levels_updated_at BEFORE UPDATE ON public.inventory_levels FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_inventory_audits_updated_at BEFORE UPDATE ON public.inventory_audits FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.warehouse_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_audit_items ENABLE ROW LEVEL SECURITY;

-- Add Permissions
INSERT INTO public.permissions (action, description) VALUES
('manage_inventory', 'Can adjust stock levels, perform audits, and manage POs'),
('manage_warehouse', 'Can manage warehouse zones, bins, and routing'),
('view_inventory', 'Can view inventory levels and audit reports')
ON CONFLICT (action) DO NOTHING;

-- Map to SUPERADMIN and MANAGER
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name IN ('SUPERADMIN', 'MANAGER') AND p.action IN ('manage_inventory', 'manage_warehouse', 'view_inventory')
ON CONFLICT DO NOTHING;

-- RLS Policies
-- Only authenticated users with permission can access inventory data
CREATE POLICY "Staff view inventory" ON public.inventory_levels FOR SELECT USING (public.has_permission('view_inventory') OR public.has_permission('manage_inventory'));
CREATE POLICY "Admins manage inventory" ON public.inventory_levels FOR ALL USING (public.has_permission('manage_inventory'));

CREATE POLICY "Staff view warehouse structure" ON public.warehouse_zones FOR SELECT USING (public.has_permission('view_inventory'));
CREATE POLICY "Admins manage warehouse structure" ON public.warehouse_zones FOR ALL USING (public.has_permission('manage_warehouse'));

CREATE POLICY "Staff view bins" ON public.warehouse_bins FOR SELECT USING (public.has_permission('view_inventory'));
CREATE POLICY "Admins manage bins" ON public.warehouse_bins FOR ALL USING (public.has_permission('manage_warehouse'));

CREATE POLICY "Admins manage POs" ON public.purchase_orders FOR ALL USING (public.has_permission('manage_inventory'));
CREATE POLICY "Admins manage PO items" ON public.purchase_order_items FOR ALL USING (public.has_permission('manage_inventory'));
CREATE POLICY "Admins manage suppliers" ON public.suppliers FOR ALL USING (public.has_permission('manage_inventory'));

CREATE POLICY "Staff view audits" ON public.inventory_audits FOR SELECT USING (public.has_permission('view_inventory'));
CREATE POLICY "Admins manage audits" ON public.inventory_audits FOR ALL USING (public.has_permission('manage_inventory'));
CREATE POLICY "Staff view audit items" ON public.inventory_audit_items FOR SELECT USING (public.has_permission('view_inventory'));
CREATE POLICY "Admins manage audit items" ON public.inventory_audit_items FOR ALL USING (public.has_permission('manage_inventory'));
