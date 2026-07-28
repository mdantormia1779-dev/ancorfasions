-- Anchor Fashion - Enterprise Checkout System Extensions
-- Adds missing tables and modifies orders to use snapshotted addresses

-- ==========================================
-- 1. ENUMS (if not exists)
-- ==========================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checkout_step') THEN
        CREATE TYPE checkout_step AS ENUM ('INFORMATION', 'SHIPPING', 'PAYMENT', 'REVIEW', 'COMPLETED');
    END IF;
END $$;

-- ==========================================
-- 2. CHECKOUT SESSIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.checkout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_email VARCHAR(255),
    cart_id UUID REFERENCES public.carts(id) ON DELETE SET NULL,
    current_step checkout_step DEFAULT 'INFORMATION' NOT NULL,
    
    shipping_address_snapshot JSONB,
    billing_address_snapshot JSONB,
    
    shipping_method VARCHAR(100),
    payment_method VARCHAR(100),
    
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '2 hours',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_checkout_sessions_user_id ON public.checkout_sessions(user_id);
CREATE INDEX idx_checkout_sessions_cart_id ON public.checkout_sessions(cart_id);

CREATE TRIGGER update_checkout_sessions_updated_at BEFORE UPDATE ON public.checkout_sessions FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ==========================================
-- 3. ORDER ADDRESSES (Immutable Snapshot)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.order_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    address_type VARCHAR(20) CHECK (address_type IN ('SHIPPING', 'BILLING')) NOT NULL,
    
    -- Snapshot fields
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Bangladesh',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_order_addresses_order_id ON public.order_addresses(order_id);

-- ==========================================
-- 4. ORDER STATUS HISTORY
-- ==========================================
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    status order_status NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Null implies system
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);

-- ==========================================
-- 5. COUPON USAGES RLS (Table exists from Marketing CRM)
-- ==========================================

-- ==========================================
-- 6. ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Checkout Sessions RLS
CREATE POLICY "Users can manage their own checkout sessions" ON public.checkout_sessions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Public can manage guest checkout sessions by id" ON public.checkout_sessions FOR ALL TO public USING (user_id IS NULL) WITH CHECK (user_id IS NULL);

-- Order Addresses RLS
CREATE POLICY "Users can view their own order addresses" ON public.order_addresses FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_addresses.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Public can view guest order addresses by order_id" ON public.order_addresses FOR SELECT TO public USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_addresses.order_id AND orders.user_id IS NULL)
);

-- Order Status History RLS
CREATE POLICY "Users can view their own order status history" ON public.order_status_history FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Public can view guest order status history by order_id" ON public.order_status_history FOR SELECT TO public USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND orders.user_id IS NULL)
);

-- Coupon Usages RLS
CREATE POLICY "Users can view their own coupon usages" ON public.coupon_usages FOR SELECT TO authenticated USING (customer_id = auth.uid());
