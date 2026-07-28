-- Migration: 20260726400000_enterprise_payment_system.sql
-- Description: Creates the tables, relationships, RLS policies, and triggers for the Enterprise Payment Integration Platform.

-- 1. Create Enums Safely
DO $$ BEGIN
    CREATE TYPE payment_provider_status AS ENUM ('active', 'inactive', 'maintenance', 'deprecated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_session_status AS ENUM ('pending', 'completed', 'failed', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_webhook_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'ignored');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_refund_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Create Tables

-- Payment Providers
CREATE TABLE IF NOT EXISTS public.payment_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    status payment_provider_status DEFAULT 'inactive',
    is_fallback BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}'::jsonb,
    supported_currencies TEXT[] DEFAULT '{"BDT", "USD"}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Sessions
CREATE TABLE IF NOT EXISTS public.payment_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES public.payment_providers(id) ON DELETE SET NULL,
    order_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount NUMERIC(15, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BDT',
    status payment_session_status DEFAULT 'pending',
    gateway_url TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.payment_sessions(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES public.payment_providers(id) ON DELETE SET NULL,
    order_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount NUMERIC(15, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BDT',
    status payment_transaction_status DEFAULT 'pending',
    reference_number VARCHAR(255) UNIQUE,
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB DEFAULT '{}'::jsonb,
    error_code VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Webhooks
CREATE TABLE IF NOT EXISTS public.payment_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES public.payment_providers(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    headers JSONB DEFAULT '{}'::jsonb,
    signature VARCHAR(512),
    status payment_webhook_status DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Refunds
CREATE TABLE IF NOT EXISTS public.payment_refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 4) NOT NULL,
    reason TEXT NOT NULL,
    status payment_refund_status DEFAULT 'pending',
    gateway_refund_id VARCHAR(255),
    gateway_response JSONB DEFAULT '{}'::jsonb,
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Audit Logs
CREATE TABLE IF NOT EXISTS public.payment_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'transaction', 'session', 'provider', 'refund', 'webhook'
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Indexes
CREATE INDEX IF NOT EXISTS idx_payment_providers_code ON public.payment_providers(code);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_order_id ON public.payment_sessions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_user_id ON public.payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON public.payment_transactions(reference_number);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_id ON public.payment_transactions(gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_status ON public.payment_webhooks(status);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_transaction_id ON public.payment_refunds(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_entity ON public.payment_audit_logs(entity_type, entity_id);

-- 4. Create Triggers for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_payment_providers ON public.payment_providers;
CREATE TRIGGER set_timestamp_payment_providers
BEFORE UPDATE ON public.payment_providers
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_payment_sessions ON public.payment_sessions;
CREATE TRIGGER set_timestamp_payment_sessions
BEFORE UPDATE ON public.payment_sessions
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_payment_transactions ON public.payment_transactions;
CREATE TRIGGER set_timestamp_payment_transactions
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_payment_webhooks ON public.payment_webhooks;
CREATE TRIGGER set_timestamp_payment_webhooks
BEFORE UPDATE ON public.payment_webhooks
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_payment_refunds ON public.payment_refunds;
CREATE TRIGGER set_timestamp_payment_refunds
BEFORE UPDATE ON public.payment_refunds
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- 5. Row Level Security (RLS) Policies
ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_audit_logs ENABLE ROW LEVEL SECURITY;

-- Providers Policies
DROP POLICY IF EXISTS "Providers are viewable by everyone" ON public.payment_providers;
CREATE POLICY "Providers are viewable by everyone" ON public.payment_providers
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Providers insert/update restricted to admin" ON public.payment_providers;
CREATE POLICY "Providers insert/update restricted to admin" ON public.payment_providers
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Sessions Policies
DROP POLICY IF EXISTS "Users can view their own payment sessions" ON public.payment_sessions;
CREATE POLICY "Users can view their own payment sessions" ON public.payment_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all payment sessions" ON public.payment_sessions;
CREATE POLICY "Admins can view all payment sessions" ON public.payment_sessions
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Users can create payment sessions" ON public.payment_sessions;
CREATE POLICY "Users can create payment sessions" ON public.payment_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage payment sessions" ON public.payment_sessions;
CREATE POLICY "Admins can manage payment sessions" ON public.payment_sessions
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Transactions Policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.payment_transactions;
CREATE POLICY "Users can view their own transactions" ON public.payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.payment_transactions;
CREATE POLICY "Admins can view all transactions" ON public.payment_transactions
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "System can manage transactions" ON public.payment_transactions;
CREATE POLICY "System can manage transactions" ON public.payment_transactions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

-- Webhooks Policies
DROP POLICY IF EXISTS "Webhooks are manageable by system/admin only" ON public.payment_webhooks;
CREATE POLICY "Webhooks are manageable by system/admin only" ON public.payment_webhooks
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

-- Refunds Policies
DROP POLICY IF EXISTS "Users can view their own refunds" ON public.payment_refunds;
CREATE POLICY "Users can view their own refunds" ON public.payment_refunds
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.payment_transactions pt 
            WHERE pt.id = transaction_id AND pt.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can manage refunds" ON public.payment_refunds;
CREATE POLICY "Admins can manage refunds" ON public.payment_refunds
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Audit Logs Policies
DROP POLICY IF EXISTS "Audit logs are viewable by admin only" ON public.payment_audit_logs;
CREATE POLICY "Audit logs are viewable by admin only" ON public.payment_audit_logs
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- 6. Seed Default Providers
INSERT INTO public.payment_providers (name, code, status, is_fallback, config, supported_currencies) VALUES
('SSLCommerz', 'sslcommerz', 'active', false, '{"store_id": "", "store_passwd": "", "is_sandbox": true}', '{"BDT"}'),
('bKash', 'bkash', 'active', false, '{"app_key": "", "app_secret": "", "username": "", "password": "", "is_sandbox": true}', '{"BDT"}'),
('Nagad', 'nagad', 'active', false, '{"merchant_id": "", "public_key": "", "private_key": "", "is_sandbox": true}', '{"BDT"}'),
('Rocket', 'rocket', 'active', false, '{"merchant_id": "", "password": "", "is_sandbox": true}', '{"BDT"}'),
('Visa', 'visa', 'active', false, '{"merchant_id": "", "api_key": "", "is_sandbox": true}', '{"BDT", "USD"}'),
('MasterCard', 'mastercard', 'active', false, '{"merchant_id": "", "api_key": "", "is_sandbox": true}', '{"BDT", "USD"}'),
('Cash on Delivery', 'cod', 'active', true, '{"max_amount": 10000, "allowed_zones": []}', '{"BDT"}')
ON CONFLICT (code) DO NOTHING;
