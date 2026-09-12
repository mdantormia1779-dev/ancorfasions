-- ==============================================================================
-- Anchor Fashion - Live SSLCommerz & Card Payment Gateway (Prompt 9)
-- ==============================================================================

-- 1. Ensure SSLCommerz payment provider entry exists and is active
INSERT INTO public.payment_providers (name, code, status, is_fallback, config, supported_currencies)
VALUES (
    'SSLCommerz',
    'sslcommerz',
    'active',
    false,
    '{"is_sandbox": true}'::jsonb,
    '{"BDT"}'
)
ON CONFLICT (code) DO UPDATE
SET name = 'SSLCommerz',
    status = 'active',
    supported_currencies = '{"BDT"}',
    updated_at = NOW();

-- 2. Indexes for SSLCommerz payment session lookups
CREATE INDEX IF NOT EXISTS idx_payment_sessions_metadata_tran_id 
ON public.payment_sessions ((metadata->>'tran_id'));

CREATE INDEX IF NOT EXISTS idx_payment_sessions_metadata_sessionkey 
ON public.payment_sessions ((metadata->>'sessionkey'));

CREATE INDEX IF NOT EXISTS idx_payment_sessions_metadata_val_id 
ON public.payment_sessions ((metadata->>'val_id'));

-- 3. Indexes on payment transactions for reference & gateway transaction ID
CREATE INDEX IF NOT EXISTS idx_payment_transactions_ref_number 
ON public.payment_transactions (reference_number);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_trx 
ON public.payment_transactions (gateway_transaction_id);

-- 4. Unique index to enforce idempotency on completed gateway transaction IDs per provider
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_provider_sslcommerz_gateway_id 
ON public.payment_transactions (provider_id, gateway_transaction_id) 
WHERE gateway_transaction_id IS NOT NULL AND status = 'completed';
