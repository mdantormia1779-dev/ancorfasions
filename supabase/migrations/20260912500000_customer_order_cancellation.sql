-- 1. Add cancellation_reason and cancellation_note to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancellation_note TEXT;
