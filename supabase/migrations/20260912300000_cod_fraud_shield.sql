-- ====================================================================
-- Anchor Fashion — Prompt 10: COD Fraud Shield & Order Verification
-- Migration: 20260912300000_cod_fraud_shield.sql
-- ====================================================================

-- 1. Add COD risk evaluation and verification columns to public.orders if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'risk_level') THEN
        ALTER TABLE public.orders ADD COLUMN risk_level VARCHAR(20) DEFAULT 'LOW';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'risk_score') THEN
        ALTER TABLE public.orders ADD COLUMN risk_score INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'risk_reasons') THEN
        ALTER TABLE public.orders ADD COLUMN risk_reasons JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'verification_status') THEN
        ALTER TABLE public.orders ADD COLUMN verification_status VARCHAR(50) DEFAULT 'UNVERIFIED';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'verification_verified_at') THEN
        ALTER TABLE public.orders ADD COLUMN verification_verified_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
        ALTER TABLE public.orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'COD';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
        ALTER TABLE public.orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'PENDING';
    END IF;
END $$;

-- 2. Create table for secure COD verification sessions
CREATE TABLE IF NOT EXISTS public.cod_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    target_type VARCHAR(20) NOT NULL DEFAULT 'email', -- 'email' | 'phone'
    target_value VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    resend_count INTEGER DEFAULT 0,
    last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes for rapid risk analysis & verification querying
CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON public.orders(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_addresses_phone ON public.order_addresses(phone);
CREATE INDEX IF NOT EXISTS idx_order_addresses_email ON public.order_addresses(email);
CREATE INDEX IF NOT EXISTS idx_cod_verifications_session ON public.cod_verifications(session_id);
CREATE INDEX IF NOT EXISTS idx_cod_verifications_target ON public.cod_verifications(target_value);

-- 4. Upsert Authoritative COD Fraud Settings in public.settings
INSERT INTO public.settings (key, value, description, updated_at)
VALUES (
    'cod_fraud_settings',
    '{
        "enabled": true,
        "cod_high_value_threshold": 3000,
        "otp_required_for_high_value": true,
        "otp_required_for_first_order": true,
        "max_cod_risk_score": 60,
        "otp_expiry_minutes": 10,
        "otp_max_attempts": 5,
        "otp_resend_cooldown_seconds": 60,
        "duplicate_order_window_minutes": 15
    }'::jsonb,
    'Configurable COD Fraud Shield and Risk Assessment Policies',
    now()
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();

-- 5. Enable Row Level Security (RLS) on cod_verifications
ALTER TABLE public.cod_verifications ENABLE ROW LEVEL SECURITY;

-- Service role full access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'cod_verifications' 
        AND policyname = 'Service role full access on cod_verifications'
    ) THEN
        CREATE POLICY "Service role full access on cod_verifications" 
        ON public.cod_verifications 
        FOR ALL 
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;
