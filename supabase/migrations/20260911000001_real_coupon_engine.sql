-- ============================================================================
-- Migration: 20260911000001_real_coupon_engine.sql
-- Database-driven Coupon Engine: Atomicity and Checkout Session integration
-- ============================================================================

-- ============================================================================
-- 1. CHECKOUT SESSION UPDATE
-- ============================================================================
ALTER TABLE public.checkout_sessions 
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);

-- ============================================================================
-- 2. RPC: consume_coupon_atomic
-- ============================================================================
CREATE OR REPLACE FUNCTION public.consume_coupon_atomic(
  p_coupon_code VARCHAR,
  p_customer_id UUID,
  p_order_id UUID,
  p_discount_applied DECIMAL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_coupon RECORD;
  v_user_usage_count INTEGER;
BEGIN
  -- 1. Lock the coupon row to prevent concurrent global limit breaches
  SELECT *
  INTO v_coupon
  FROM public.coupons
  WHERE code = p_coupon_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coupon not found' USING ERRCODE = 'P0001', HINT = 'INVALID_COUPON';
  END IF;

  IF NOT v_coupon.is_active THEN
    RAISE EXCEPTION 'Coupon is inactive' USING ERRCODE = 'P0002', HINT = 'COUPON_INACTIVE';
  END IF;

  IF NOW() < v_coupon.valid_from OR NOW() > v_coupon.valid_until THEN
    RAISE EXCEPTION 'Coupon expired or not yet valid' USING ERRCODE = 'P0003', HINT = 'COUPON_EXPIRED';
  END IF;

  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
    RAISE EXCEPTION 'Coupon usage limit reached' USING ERRCODE = 'P0004', HINT = 'COUPON_USAGE_LIMIT_REACHED';
  END IF;

  -- 2. Check per-user limit
  IF v_coupon.per_user_limit IS NOT NULL AND p_customer_id IS NOT NULL THEN
    SELECT COUNT(*)
    INTO v_user_usage_count
    FROM public.coupon_usages
    WHERE coupon_id = v_coupon.id AND customer_id = p_customer_id;

    IF v_user_usage_count >= v_coupon.per_user_limit THEN
      RAISE EXCEPTION 'Customer usage limit reached' USING ERRCODE = 'P0005', HINT = 'CUSTOMER_USAGE_LIMIT_REACHED';
    END IF;
  END IF;

  -- 3. Idempotency Check: did this order already consume this coupon?
  IF EXISTS (SELECT 1 FROM public.coupon_usages WHERE order_id = p_order_id AND coupon_id = v_coupon.id) THEN
    RETURN jsonb_build_object('success', true, 'idempotent', true);
  END IF;

  -- 4. Update used_count
  UPDATE public.coupons
  SET used_count = used_count + 1, updated_at = NOW()
  WHERE id = v_coupon.id;

  -- 5. Insert usage record
  INSERT INTO public.coupon_usages (coupon_id, customer_id, order_id, discount_applied)
  VALUES (v_coupon.id, p_customer_id, p_order_id, p_discount_applied);

  RETURN jsonb_build_object('success', true, 'coupon_id', v_coupon.id);
END;
$$;

-- ============================================================================
-- 3. RPC: release_coupon_atomic
-- ============================================================================
CREATE OR REPLACE FUNCTION public.release_coupon_atomic(
  p_order_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_usage RECORD;
BEGIN
  -- Find the usage record and lock it
  SELECT * INTO v_usage 
  FROM public.coupon_usages 
  WHERE order_id = p_order_id 
  FOR UPDATE;
  
  IF NOT FOUND THEN RETURN; END IF;

  -- Delete usage
  DELETE FROM public.coupon_usages WHERE id = v_usage.id;

  -- Decrement used_count safely
  UPDATE public.coupons
  SET used_count = GREATEST(0, used_count - 1), updated_at = NOW()
  WHERE id = v_usage.coupon_id;
END;
$$;

-- ============================================================================
-- 4. SECURITY
-- ============================================================================
REVOKE ALL ON FUNCTION public.consume_coupon_atomic(VARCHAR, UUID, UUID, DECIMAL) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_coupon_atomic(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.consume_coupon_atomic(VARCHAR, UUID, UUID, DECIMAL) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_coupon_atomic(UUID) TO service_role;
