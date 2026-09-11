-- Migration: Flash Sales Enhancements (Start Time, Name, Atomic RPC)

-- 1. Extend flash_sales table
ALTER TABLE public.flash_sales 
  ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT 'Flash Sale',
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Rename expires_at to end_time for consistency
ALTER TABLE public.flash_sales RENAME COLUMN expires_at TO end_time;

-- Update RLS policy to account for start_time
DROP POLICY IF EXISTS "Public can view active flash sales" ON public.flash_sales;
CREATE POLICY "Public can view active flash sales" ON public.flash_sales 
  FOR SELECT USING (is_active = true AND end_time > NOW());

-- 2. Create Atomic RPC for consuming flash sale stock
CREATE OR REPLACE FUNCTION public.consume_flash_sale_stock(
    p_flash_sale_id UUID,
    p_quantity INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as DB owner to bypass RLS for atomic updates
AS $$
DECLARE
    v_sale RECORD;
BEGIN
    -- Select the flash sale and lock it for update
    SELECT * INTO v_sale 
    FROM public.flash_sales 
    WHERE id = p_flash_sale_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Flash sale not found';
    END IF;

    -- Check if it's active and within time window
    IF v_sale.is_active = false OR NOW() < v_sale.start_time OR NOW() > v_sale.end_time THEN
        RAISE EXCEPTION 'Flash sale is not currently active';
    END IF;

    -- Check stock availability
    IF (v_sale.stock_allocated - v_sale.stock_sold) < p_quantity THEN
        RAISE EXCEPTION 'Insufficient flash sale stock. Available: %, Requested: %', 
            (v_sale.stock_allocated - v_sale.stock_sold), p_quantity;
    END IF;

    -- Update stock_sold
    UPDATE public.flash_sales
    SET stock_sold = stock_sold + p_quantity
    WHERE id = p_flash_sale_id;

    RETURN jsonb_build_object(
        'success', true,
        'flash_sale_id', p_flash_sale_id,
        'stock_allocated', v_sale.stock_allocated,
        'stock_sold_before', v_sale.stock_sold,
        'stock_sold_after', v_sale.stock_sold + p_quantity
    );
END;
$$;

-- Revoke execute from public and grant to service_role (and authenticated for admin)
REVOKE EXECUTE ON FUNCTION public.consume_flash_sale_stock(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_flash_sale_stock(UUID, INTEGER) TO service_role;

-- 3. Create Atomic RPC for releasing flash sale stock (for rollback)
CREATE OR REPLACE FUNCTION public.release_flash_sale_stock(
    p_flash_sale_id UUID,
    p_quantity INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sale RECORD;
BEGIN
    SELECT * INTO v_sale 
    FROM public.flash_sales 
    WHERE id = p_flash_sale_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Flash sale not found');
    END IF;

    UPDATE public.flash_sales
    SET stock_sold = GREATEST(0, stock_sold - p_quantity)
    WHERE id = p_flash_sale_id;

    RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.release_flash_sale_stock(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.release_flash_sale_stock(UUID, INTEGER) TO service_role;
