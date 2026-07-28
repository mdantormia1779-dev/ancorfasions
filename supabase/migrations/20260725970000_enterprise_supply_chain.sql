-- ==========================================
-- Anchor Fashion Enterprise - Migration 23
-- Enterprise Supply Chain, Inventory, Procurement, and Logistics
-- ==========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. ADVANCED WAREHOUSE & INVENTORY
-- ==========================================

-- Advanced Bin Location Management
CREATE TABLE IF NOT EXISTS public.warehouse_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
    zone_code VARCHAR(50) NOT NULL, -- e.g., 'A' for Aisle A, 'COLD' for Cold Storage
    rack_code VARCHAR(50) NOT NULL, -- e.g., '01'
    shelf_code VARCHAR(50) NOT NULL, -- e.g., '02'
    bin_code VARCHAR(50) NOT NULL, -- e.g., '05'
    barcode VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'WH1-A-01-02-05'
    picking_sequence INTEGER NOT NULL DEFAULT 0, -- For optimizing wave pick routes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(warehouse_id, zone_code, rack_code, shelf_code, bin_code)
);

-- Real-time Stock Ledger (Double Entry System)
-- Every movement creates two entries: Debit from source, Credit to destination
CREATE TABLE IF NOT EXISTS public.stock_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL, -- Ties the debit/credit pair together
    variant_id UUID REFERENCES public.variants(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.warehouse_locations(id), -- Null if virtual location (e.g., transit, supplier, customer)
    virtual_location VARCHAR(50) CHECK (virtual_location IN ('SUPPLIER', 'IN_TRANSIT', 'CUSTOMER', 'LOST', 'DAMAGED_DISPOSED')),
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('PURCHASE_RECEIPT', 'ORDER_DISPATCH', 'INTERNAL_TRANSFER', 'RETURN_RECEIPT', 'STOCK_ADJUSTMENT')),
    quantity INTEGER NOT NULL, -- Positive for Credit (receiving), Negative for Debit (sending)
    reference_type VARCHAR(50), -- e.g., 'PURCHASE_ORDER', 'SALES_ORDER', 'RMA'
    reference_id UUID,
    unit_cost NUMERIC(12, 2) DEFAULT 0, -- For moving average cost calculation
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. PROCUREMENT & SUPPLIER MANAGEMENT
-- ==========================================

CREATE TABLE IF NOT EXISTS public.supplier_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    tax_id VARCHAR(100),
    payment_terms VARCHAR(100), -- e.g., 'Net 30', 'Net 60', 'PIA'
    lead_time_days INTEGER DEFAULT 14,
    performance_score NUMERIC(3, 2) DEFAULT 5.00 CHECK (performance_score >= 1.0 AND performance_score <= 5.0),
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'INACTIVE')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.procurement_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id UUID REFERENCES public.supplier_profiles(id) ON DELETE RESTRICT,
    destination_warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'PARTIAL_RECEIPT', 'FULFILLED', 'CANCELLED')),
    total_amount NUMERIC(12, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'BDT',
    expected_delivery_date DATE,
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.procurement_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID REFERENCES public.procurement_orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.variants(id) ON DELETE RESTRICT,
    quantity_ordered INTEGER NOT NULL CHECK (quantity_ordered > 0),
    quantity_received INTEGER DEFAULT 0,
    unit_cost NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.goods_receiving_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_number VARCHAR(100) UNIQUE NOT NULL,
    po_id UUID REFERENCES public.procurement_orders(id) ON DELETE RESTRICT,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    received_by UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'IN_INSPECTION' CHECK (status IN ('IN_INSPECTION', 'APPROVED', 'REJECTED', 'PARTIAL_ACCEPT')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. ORDER FULFILLMENT & PICK LISTS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.pick_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_number VARCHAR(100) UNIQUE NOT NULL,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    pick_type VARCHAR(50) DEFAULT 'WAVE' CHECK (pick_type IN ('SINGLE_ORDER', 'BATCH', 'WAVE')),
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    assigned_to UUID REFERENCES auth.users(id),
    total_items INTEGER DEFAULT 0,
    picked_items INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.pick_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pick_list_id UUID REFERENCES public.pick_lists(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.variants(id) ON DELETE RESTRICT,
    location_id UUID REFERENCES public.warehouse_locations(id), -- Where to pick it from
    quantity INTEGER NOT NULL,
    is_picked BOOLEAN DEFAULT false,
    picked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.packing_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
    station_code VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    current_user_id UUID REFERENCES auth.users(id) -- Staff member currently logged into this station
);

-- ==========================================
-- 4. COURIER & LOGISTICS INTEGRATION
-- ==========================================

CREATE TABLE IF NOT EXISTS public.courier_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name VARCHAR(100) UNIQUE NOT NULL,
    api_key TEXT,
    api_secret TEXT,
    webhook_secret TEXT,
    is_active BOOLEAN DEFAULT true,
    priority_level INTEGER DEFAULT 1, -- Lower number = higher priority for auto-assignment
    supported_zones JSONB, -- Array of region codes
    features JSONB, -- e.g., ["COD", "NEXT_DAY", "REVERSE"]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    courier_id UUID REFERENCES public.courier_providers(id) ON DELETE RESTRICT,
    tracking_number VARCHAR(100) UNIQUE,
    awb_url TEXT, -- Link to printable Waybill label
    status VARCHAR(50) DEFAULT 'READY_FOR_PICKUP' CHECK (status IN ('PROCESSING', 'READY_FOR_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED_ATTEMPT', 'RETURNED_TO_SENDER')),
    weight_grams INTEGER,
    dimensions_cm JSONB, -- {"l": 30, "w": 20, "h": 10}
    shipping_cost NUMERIC(10, 2),
    cod_amount NUMERIC(12, 2) DEFAULT 0,
    cod_status VARCHAR(50) DEFAULT 'PENDING' CHECK (cod_status IN ('PENDING', 'COLLECTED', 'REMITTED', 'RECONCILED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courier Webhook Event Log for Tracking Sync
CREATE TABLE IF NOT EXISTS public.courier_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
    courier_status_code VARCHAR(100),
    description TEXT,
    location VARCHAR(255),
    event_timestamp TIMESTAMPTZ,
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. RETURN MANAGEMENT (RMA)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.return_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES auth.users(id),
    rma_number VARCHAR(100) UNIQUE NOT NULL,
    reason VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_APPROVAL' CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'IN_TRANSIT', 'RECEIVED_QC', 'REFUNDED', 'REPLACED', 'REJECTED')),
    refund_amount NUMERIC(12, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.return_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID REFERENCES public.return_requests(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.variants(id),
    inspected_by UUID REFERENCES auth.users(id),
    condition VARCHAR(50) CHECK (condition IN ('NEW_SELLABLE', 'DAMAGED_REPAIRABLE', 'DAMAGED_DISPOSE')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. AI FORECASTING & ANALYTICS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.demand_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID REFERENCES public.variants(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    predicted_sales_quantity INTEGER NOT NULL,
    confidence_score NUMERIC(5, 2), -- 0 to 100 percentage
    ai_model_version VARCHAR(50),
    factors JSONB, -- Why did it predict this? {"seasonality": 1.2, "trend": 1.05}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(variant_id, forecast_date)
);

-- ==========================================
-- 7. TRIGGERS & RLS POLICIES
-- ==========================================

DROP TRIGGER IF EXISTS update_supplier_profiles_updated_at ON public.supplier_profiles;
CREATE TRIGGER update_supplier_profiles_updated_at BEFORE UPDATE ON public.supplier_profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_procurement_orders_updated_at ON public.procurement_orders;
CREATE TRIGGER update_procurement_orders_updated_at BEFORE UPDATE ON public.procurement_orders FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_courier_providers_updated_at ON public.courier_providers;
CREATE TRIGGER update_courier_providers_updated_at BEFORE UPDATE ON public.courier_providers FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_shipments_updated_at ON public.shipments;
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pick_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Basic Admin Policies
CREATE POLICY "Admins full access to stock ledger" ON public.stock_ledger FOR ALL USING (public.has_permission('manage_inventory'));
CREATE POLICY "Pickers view pick lists" ON public.pick_lists FOR SELECT USING (assigned_to = auth.uid() OR public.has_permission('manage_fulfillment'));
CREATE POLICY "Pickers update pick lists" ON public.pick_lists FOR UPDATE USING (assigned_to = auth.uid() OR public.has_permission('manage_fulfillment'));
CREATE POLICY "Admins full access to shipments" ON public.shipments FOR ALL USING (public.has_permission('manage_logistics'));
CREATE POLICY "Admins full access to procurement" ON public.procurement_orders FOR ALL USING (public.has_permission('manage_procurement'));
