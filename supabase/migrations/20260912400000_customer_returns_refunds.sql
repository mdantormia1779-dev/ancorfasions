-- ============================================================================
-- Migration: 20260912400000_customer_returns_refunds.sql
-- Customer Self-Service Return & Refund System (Prompt 11/20)
--
-- Extends existing public.returns and public.return_items tables.
-- Adds return policy configuration to settings table.
-- Configures storage bucket for return photo proofs.
-- Adds RLS policies for customer self-service security.
-- ============================================================================

-- 1. Extend public.returns table
ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS refund_method VARCHAR(50) DEFAULT 'ORIGINAL_PAYMENT';
ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS exchange_requested BOOLEAN DEFAULT false;
ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS exchange_variant_id UUID;
ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS customer_note TEXT;
ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS internal_note TEXT;
ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}';
ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS inspected_at TIMESTAMPTZ;
ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 2. Extend public.return_items table
ALTER TABLE public.return_items
  ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(12, 2) DEFAULT 0;

-- 3. Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_returns_user_id ON public.returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON public.returns(status);
CREATE INDEX IF NOT EXISTS idx_returns_created_at ON public.returns(created_at);
CREATE INDEX IF NOT EXISTS idx_return_items_return_id ON public.return_items(return_id);
CREATE INDEX IF NOT EXISTS idx_return_items_order_item_id ON public.return_items(order_item_id);

-- 4. Return Policy in settings table
INSERT INTO public.settings (key, value, description)
VALUES (
  'return_policy_settings',
  jsonb_build_object(
    'return_window_days', 7,
    'require_photo_for_damaged', true,
    'allow_exchanges', true,
    'restock_shipping_fee_refundable', false,
    'allowed_reasons', jsonb_build_array(
      'Wrong size',
      'Wrong item received',
      'Damaged item',
      'Defective item',
      'Product not as described',
      'Quality issue',
      'Changed my mind',
      'Other'
    )
  ),
  'Customer return and refund policy settings'
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = NOW();

-- 5. Storage Bucket Configuration for Return Proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('return_proofs', 'return_proofs', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;

-- Customers can view their own returns
DROP POLICY IF EXISTS "Customers can view their returns" ON public.returns;
CREATE POLICY "Customers can view their returns"
  ON public.returns
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Customers can insert their own returns (must belong to auth.uid())
DROP POLICY IF EXISTS "Customers can insert their returns" ON public.returns;
CREATE POLICY "Customers can insert their returns"
  ON public.returns
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Customers can view return items belonging to their returns
DROP POLICY IF EXISTS "Customers can view their return items" ON public.return_items;
CREATE POLICY "Customers can view their return items"
  ON public.return_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.returns
      WHERE returns.id = return_items.return_id
        AND returns.user_id = auth.uid()
    )
  );

-- Service role full access
DROP POLICY IF EXISTS "Staff can view all returns" ON public.returns;
DROP POLICY IF EXISTS "Service role full access on returns" ON public.returns;
CREATE POLICY "Service role full access on returns"
  ON public.returns
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can manage all return items" ON public.return_items;
DROP POLICY IF EXISTS "Service role full access on return_items" ON public.return_items;
CREATE POLICY "Service role full access on return_items"
  ON public.return_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Storage bucket RLS policies for return_proofs
DROP POLICY IF EXISTS "Customers can upload return proofs" ON storage.objects;
CREATE POLICY "Customers can upload return proofs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'return_proofs');

DROP POLICY IF EXISTS "Public can view return proofs" ON storage.objects;
CREATE POLICY "Public can view return proofs"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'return_proofs');
