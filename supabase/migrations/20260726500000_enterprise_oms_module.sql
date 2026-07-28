-- ============================================================================
-- Enterprise Order Management System (OMS) Migration
-- ============================================================================

BEGIN;

-- 0. Drop old types and tables to upgrade to Enterprise OMS Architecture
DROP TABLE IF EXISTS public.order_assignments CASCADE;
DROP TABLE IF EXISTS public.order_events CASCADE;
DROP TABLE IF EXISTS public.order_notes CASCADE;
DROP TABLE IF EXISTS public.order_status_history CASCADE;
DROP TABLE IF EXISTS public.refund_requests CASCADE;
DROP TABLE IF EXISTS public.order_shipments CASCADE;
DROP TABLE IF EXISTS public.order_invoices CASCADE;
DROP TABLE IF EXISTS public.returns CASCADE;
DROP TABLE IF EXISTS public.refunds CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.shipments CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.order_event_type CASCADE;

-- 1. Create Custom Types for the State Machine
CREATE TYPE public.order_status AS ENUM (
    'draft',
    'pending_payment',
    'payment_processing',
    'paid',
    'confirmed',
    'preparing',
    'picking',
    'packing',
    'ready_for_shipment',
    'shipped',
    'out_for_delivery',
    'delivered',
    'completed',
    'cancelled',
    'refund_requested',
    'refund_approved',
    'refunded',
    'returned',
    'failed'
);

CREATE TYPE public.order_event_type AS ENUM (
    'status_changed',
    'payment_received',
    'note_added',
    'staff_assigned',
    'tracking_updated',
    'refund_processed',
    'return_initiated',
    'system_alert'
);

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status public.order_status NOT NULL DEFAULT 'draft',
    
    -- Financials
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    shipping_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Meta
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    shipping_address_id UUID, -- References address table (assumed existing)
    billing_address_id UUID,  -- References address table
    payment_intent_id VARCHAR(255),
    
    -- Lifecycle
    placed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    -- Traceability
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID, -- References products table
    variant_id UUID, -- References product_variants table
    sku VARCHAR(100) NOT NULL,
    
    -- Snapshots (Immutable at time of order)
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    unit_price DECIMAL(12, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    discount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    line_total DECIMAL(12, 2) NOT NULL,
    
    -- Fulfillment
    inventory_reserved BOOLEAN NOT NULL DEFAULT FALSE,
    allocated_warehouse_id UUID,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Order Status History (Audit Trail for State Machine)
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status public.order_status,
    new_status public.order_status NOT NULL,
    reason TEXT,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Order Notes (Internal & Customer facing)
CREATE TABLE IF NOT EXISTS public.order_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    is_customer_visible BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Order Events (Event-Driven Architecture Log)
CREATE TABLE IF NOT EXISTS public.order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    event_type public.order_event_type NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Order Assignments (Staff assignment)
CREATE TABLE IF NOT EXISTS public.order_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    assignee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    role VARCHAR(100), -- e.g. 'picker', 'packer', 'manager'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(order_id, assignee_id)
);

-- 8. Order Invoices
CREATE TABLE IF NOT EXISTS public.order_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    pdf_url VARCHAR(1024),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'issued', -- 'issued', 'paid', 'voided'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Order Shipments
CREATE TABLE IF NOT EXISTS public.order_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    tracking_number VARCHAR(255),
    courier VARCHAR(100),
    label_url VARCHAR(1024),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'ready', 'in_transit', 'delivered'
    shipped_at TIMESTAMPTZ,
    estimated_delivery TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Returns and Refunds
CREATE TABLE IF NOT EXISTS public.returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    return_number VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'requested', -- 'requested', 'approved', 'rejected', 'received', 'completed'
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    return_id UUID REFERENCES public.returns(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'processed', 'failed'
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Triggers and Functions
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_oms_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_oms_updated_at_column();

CREATE TRIGGER update_order_notes_updated_at
    BEFORE UPDATE ON public.order_notes
    FOR EACH ROW EXECUTE FUNCTION update_oms_updated_at_column();

CREATE TRIGGER update_order_shipments_updated_at
    BEFORE UPDATE ON public.order_shipments
    FOR EACH ROW EXECUTE FUNCTION update_oms_updated_at_column();

CREATE TRIGGER update_returns_updated_at
    BEFORE UPDATE ON public.returns
    FOR EACH ROW EXECUTE FUNCTION update_oms_updated_at_column();

CREATE TRIGGER update_refund_requests_updated_at
    BEFORE UPDATE ON public.refund_requests
    FOR EACH ROW EXECUTE FUNCTION update_oms_updated_at_column();


-- Trigger for Order Status History Tracking
CREATE OR REPLACE FUNCTION track_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.order_status_history (order_id, previous_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.updated_by);
        
        -- Also emit an event
        INSERT INTO public.order_events (order_id, event_type, payload, triggered_by)
        VALUES (NEW.id, 'status_changed', jsonb_build_object('previous_status', OLD.status, 'new_status', NEW.status), NEW.updated_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_track_order_status_change
    AFTER UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION track_order_status_change();


-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_sku ON public.order_items(sku);

CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX idx_order_events_order_id ON public.order_events(order_id);

CREATE INDEX idx_order_shipments_tracking ON public.order_shipments(tracking_number);
CREATE INDEX idx_order_invoices_order_id ON public.order_invoices(order_id);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

-- Base Policies (Customers can view their own orders)
CREATE POLICY "Customers can view their own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can view their own order items" 
ON public.order_items FOR SELECT 
USING (order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid()));

CREATE POLICY "Customers can view public notes" 
ON public.order_notes FOR SELECT 
USING (is_customer_visible = TRUE AND order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid()));

-- Admins can do everything (assumes admin role logic, e.g. jwt claim or user table check)
-- For this enterprise setup, we assume authenticated users with 'admin' role bypass RLS or have explicit policies.
-- Using a simplistic policy for demonstration; in production, this would use an app_metadata check or custom function.

CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);
CREATE POLICY "Admins can manage all order items" ON public.order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);
CREATE POLICY "Admins can manage all order notes" ON public.order_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);
CREATE POLICY "Admins can manage all order events" ON public.order_events FOR ALL USING (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin')
);

COMMIT;
