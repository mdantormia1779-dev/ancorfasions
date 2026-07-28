-- ==========================================
-- Anchor Fashion - Enterprise Catalog & OMS Upgrade
-- ==========================================

-- ==========================================
-- 1. CATALOG UPGRADES (PRODUCTS & VARIANTS)
-- ==========================================
-- Add new enterprise fields to products
ALTER TABLE public.products
ADD COLUMN gender VARCHAR(20) CHECK (gender IN ('MEN', 'WOMEN', 'UNISEX', 'KIDS')),
ADD COLUMN season VARCHAR(50),
ADD COLUMN seo_title VARCHAR(255),
ADD COLUMN seo_description TEXT,
ADD COLUMN is_featured BOOLEAN DEFAULT false,
ADD COLUMN published_at TIMESTAMPTZ;

-- Add new fields to variants
ALTER TABLE public.variants
ADD COLUMN barcode VARCHAR(100) UNIQUE,
ADD COLUMN sale_price DECIMAL(10,2);

-- Rename product_images to product_media and enhance
ALTER TABLE public.product_images RENAME TO product_media;
ALTER TABLE public.product_media
ADD COLUMN media_type VARCHAR(20) DEFAULT 'IMAGE' CHECK (media_type IN ('IMAGE', 'VIDEO', '360_VIEW')),
ADD COLUMN url_webp VARCHAR(1024);

-- ==========================================
-- 2. MERCHANDISING UPGRADES (COLLECTIONS)
-- ==========================================
ALTER TABLE public.collections
ADD COLUMN type VARCHAR(20) DEFAULT 'MANUAL' CHECK (type IN ('MANUAL', 'DYNAMIC')),
ADD COLUMN rule_logic JSONB,
ADD COLUMN start_date TIMESTAMPTZ,
ADD COLUMN end_date TIMESTAMPTZ;

-- ==========================================
-- 3. ENTERPRISE INVENTORY (MULTI-WAREHOUSE)
-- ==========================================
-- Create Warehouses Table
CREATE TABLE public.warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'WAREHOUSE' CHECK (type IN ('WAREHOUSE', 'RETAIL_STORE')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Adapt the existing inventory table to support multi-warehouse tracking.
-- Note: Dropping the auto-generated UNIQUE constraint on variant_id to allow the same variant in multiple warehouses.
ALTER TABLE public.inventory DROP CONSTRAINT IF EXISTS inventory_variant_id_key;
ALTER TABLE public.inventory ADD COLUMN warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT;
ALTER TABLE public.inventory ADD CONSTRAINT inventory_variant_warehouse_unique UNIQUE (variant_id, warehouse_id);

-- Upgrade stock_movements ledger
ALTER TABLE public.stock_movements
ADD COLUMN warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT,
ADD COLUMN reference_id VARCHAR(255); -- Optional PO number or Order ID

-- ==========================================
-- 4. ORDER MANAGEMENT SYSTEM (OMS) & FULFILLMENT
-- ==========================================
-- Add to orders
ALTER TABLE public.orders
ADD COLUMN idempotency_key VARCHAR(255) UNIQUE;

-- Add to transactions
ALTER TABLE public.transactions
ADD COLUMN gateway_webhook_payload JSONB;

-- Create fulfillments table
CREATE TABLE public.fulfillments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PICKING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    courier_name VARCHAR(100),
    tracking_number VARCHAR(100),
    tracking_url VARCHAR(1024),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Fulfillment items (what exactly is in this physical box)
CREATE TABLE public.fulfillment_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fulfillment_id UUID REFERENCES public.fulfillments(id) ON DELETE CASCADE NOT NULL,
    order_item_id UUID REFERENCES public.order_items(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- Create returns (RMA) table
CREATE TABLE public.returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE RESTRICT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    status VARCHAR(50) DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'APPROVED', 'RECEIVED', 'REFUNDED', 'EXCHANGED', 'REJECTED')),
    return_reason TEXT NOT NULL,
    refund_amount DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Return items
CREATE TABLE public.return_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID REFERENCES public.returns(id) ON DELETE CASCADE NOT NULL,
    order_item_id UUID REFERENCES public.order_items(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    condition VARCHAR(50) CHECK (condition IN ('SELLABLE', 'DAMAGED', 'DEFECTIVE'))
);

-- ==========================================
-- 5. TRIGGERS & RLS
-- ==========================================
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_fulfillments_updated_at BEFORE UPDATE ON public.fulfillments FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_returns_updated_at BEFORE UPDATE ON public.returns FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Enable Row Level Security on new tables
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;

-- Customers can view their own fulfillments and returns
CREATE POLICY "Customers can view their fulfillments" ON public.fulfillments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = fulfillments.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Customers can view their returns" ON public.returns FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Customers can create returns" ON public.returns FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
