-- ==============================================================================
-- Anchor Fashion - Live bKash Tokenized Payment Gateway (Prompt 8)
-- ==============================================================================

-- 1. Add payment tracking & compatibility columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12, 2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(12, 2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12, 2);

-- Backfill compatibility values from existing columns
UPDATE public.orders 
SET 
  total_amount = COALESCE(total_amount, grand_total, 0),
  shipping_fee = COALESCE(shipping_fee, shipping_total, 0),
  discount_amount = COALESCE(discount_amount, discount_total, 0)
WHERE total_amount IS NULL;

-- 2. Indexes for fast order querying & dashboard filtering
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

-- 3. Indexes for bKash payment sessions and transactions
CREATE INDEX IF NOT EXISTS idx_payment_sessions_metadata_payment_id 
ON public.payment_sessions ((metadata->>'paymentID'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_provider_gateway_id 
ON public.payment_transactions (provider_id, gateway_transaction_id) 
WHERE gateway_transaction_id IS NOT NULL AND status = 'completed';

-- 4. Upsert bKash into payment_providers table
INSERT INTO public.payment_providers (name, code, status, is_fallback, config, supported_currencies)
VALUES (
    'bKash',
    'bkash',
    'active',
    false,
    '{"is_sandbox": true}'::jsonb,
    '{"BDT"}'
)
ON CONFLICT (code) DO UPDATE
SET status = 'active',
    supported_currencies = '{"BDT"}',
    updated_at = NOW();
