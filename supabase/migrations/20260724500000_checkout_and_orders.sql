-- ==========================================
-- Anchor Fashion - Enterprise Checkout & Orders Schema
-- ==========================================

-- 1. Drop old simplified tables from init migration to upgrade to the new architecture
DROP TABLE IF EXISTS public.refunds CASCADE;
DROP TABLE IF EXISTS public.returns CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.customer_risk_profiles CASCADE;
DROP TABLE IF EXISTS public.delivery_logs CASCADE;
DROP TABLE IF EXISTS public.shipments CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;

-- ==========================================
-- 2. ENUMS
-- ==========================================
DROP TYPE IF EXISTS public.coupon_discount_type CASCADE;
CREATE TYPE public.coupon_discount_type AS ENUM ('PERCENTAGE', 'FIXED', 'FREE_SHIPPING');

DROP TYPE IF EXISTS public.order_status CASCADE;
CREATE TYPE public.order_status AS ENUM (
    'PENDING_PAYMENT', 
    'PENDING_REVIEW', 
    'CONFIRMED', 
    'PROCESSING', 
    'READY_FOR_PACKAGING',
    'PACKING', 
    'READY_FOR_COURIER',
    'SHIPPED', 
    'OUT_FOR_DELIVERY',
    'DELIVERED', 
    'COMPLETED', 
    'RETURN_REQUESTED',
    'RETURNED', 
    'REFUNDED', 
    'CANCELLED', 
    'FAILED_DELIVERY'
);

DROP TYPE IF EXISTS public.payment_status CASCADE;
CREATE TYPE public.payment_status AS ENUM (
    'PENDING', 
    'AUTHORIZED',
    'CAPTURED', 
    'FAILED', 
    'REFUNDED'
);

DROP TYPE IF EXISTS public.return_status CASCADE;
CREATE TYPE public.return_status AS ENUM (
    'PENDING', 
    'APPROVED', 
    'REJECTED', 
    'RECEIVED', 
    'REFUNDED'
);

DROP TYPE IF EXISTS public.risk_level CASCADE;
CREATE TYPE public.risk_level AS ENUM (
    'LOW', 
    'MEDIUM', 
    'HIGH'
);

-- ==========================================
-- 3. CUSTOMER RISK PROFILES
-- ==========================================
CREATE TABLE public.customer_risk_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_orders INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    returned_orders INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    risk_level risk_level DEFAULT 'LOW',
    last_evaluated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 4. COUPONS
-- ==========================================
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type coupon_discount_type NOT NULL,
    value DECIMAL(10, 2) NOT NULL, -- percentage or fixed amount
    min_order_value DECIMAL(10, 2) DEFAULT 0,
    max_discount DECIMAL(10, 2), -- useful for percentage discounts
    usage_limit INTEGER, -- null means unlimited
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 5. ORDERS
-- ==========================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, 
    session_id VARCHAR(255), -- For guest checkout
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'AF-20260724-XYZ'
    status order_status DEFAULT 'PENDING_PAYMENT' NOT NULL,
    
    -- Idempotency (Prevent duplicate creation)
    idempotency_key VARCHAR(255) UNIQUE,
    
    -- Addresses
    shipping_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    billing_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    
    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    -- Coupons
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
    
    -- Metadata
    payment_method VARCHAR(50) NOT NULL, -- 'SSLCOMMERZ', 'BKASH', 'NAGAD', 'COD', 'STRIPE'
    notes TEXT,
    
    -- Risk Snapshot
    risk_level risk_level DEFAULT 'LOW',
    
    -- Invoices
    invoice_url VARCHAR(1024),
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT orders_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- ==========================================
-- 6. ORDER ITEMS
-- ==========================================
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.variants(id) ON DELETE SET NULL,
    
    -- Snapshot data
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255), -- e.g., 'Color: Red, Size: M'
    sku VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 7. PAYMENTS
-- ==========================================
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    
    -- Payment Metadata
    payment_intent_id VARCHAR(255), -- ID initialized before redirect
    transaction_id VARCHAR(255) UNIQUE, -- Final TrxID from gateway
    idempotency_key VARCHAR(255) UNIQUE, -- Prevents duplicate charges
    
    gateway VARCHAR(50) NOT NULL, -- 'SSLCOMMERZ', 'BKASH', 'COD'
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'PENDING' NOT NULL,
    
    -- Logging & Webhook
    gateway_response JSONB, -- Full response from gateway
    webhook_received_at TIMESTAMPTZ,
    
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 8. SHIPMENTS & DELIVERY LOGS
-- ==========================================
CREATE TABLE public.shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    
    courier_name VARCHAR(100), -- 'Pathao', 'Steadfast', etc.
    consignment_id VARCHAR(100) UNIQUE, -- ID from courier
    tracking_number VARCHAR(100),
    tracking_url VARCHAR(1024),
    
    -- Courier API Payloads
    courier_payload JSONB, -- Data sent to courier
    courier_response JSONB, -- Data received from courier
    
    status VARCHAR(50) DEFAULT 'PENDING',
    estimated_delivery_date DATE,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 9. INVOICES
-- ==========================================
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    pdf_url VARCHAR(1024),
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 10. RETURNS & REFUNDS
-- ==========================================
CREATE TABLE public.returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    status return_status DEFAULT 'PENDING' NOT NULL,
    reason TEXT NOT NULL,
    images TEXT[], -- Array of image URLs for proof
    
    admin_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID REFERENCES public.returns(id) ON DELETE CASCADE NOT NULL UNIQUE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    
    payment_transaction_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'PENDING' NOT NULL,
    gateway_response JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 11. TRIGGERS
-- ==========================================
CREATE TRIGGER update_customer_risk_profiles_updated_at BEFORE UPDATE ON public.customer_risk_profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_returns_updated_at BEFORE UPDATE ON public.returns FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON public.refunds FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ==========================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.customer_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- Note: Admin access (e.g. Finance, Warehouse) bypasses RLS via Supabase service_role,
-- or can be explicitly granted via custom RBAC rules if leveraging JWT claims.

-- Customer Risk Profiles (Users can view their own)
CREATE POLICY "Users can view their own risk profile" ON public.customer_risk_profiles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Coupons (Public Read Active)
CREATE POLICY "Active coupons are viewable by everyone" ON public.coupons FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- Orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Order Items
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert their own order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Payments
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert their own payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid())
);

-- Shipments & Logs
CREATE POLICY "Users can view their own shipments" ON public.shipments FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = shipments.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Users can view their own delivery logs" ON public.delivery_logs FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.shipments 
        JOIN public.orders ON orders.id = shipments.order_id 
        WHERE shipments.id = delivery_logs.shipment_id AND orders.user_id = auth.uid()
    )
);

-- Invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = invoices.order_id AND orders.user_id = auth.uid())
);

-- Returns
CREATE POLICY "Users can view their own returns" ON public.returns FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own returns" ON public.returns FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Refunds
CREATE POLICY "Users can view their own refunds" ON public.refunds FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = refunds.order_id AND orders.user_id = auth.uid())
);
