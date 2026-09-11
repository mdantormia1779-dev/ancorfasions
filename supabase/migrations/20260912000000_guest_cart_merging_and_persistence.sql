-- ==============================================================================
-- Anchor Fashion - Guest Cart Merging & Persistent Bag (Prompt 7)
-- ==============================================================================

-- 1. Ensure Performance Indexes for Cart & Items
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON public.carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_updated_at ON public.carts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON public.cart_items(variant_id);

-- 2. Ensure Unique Constraint on (cart_id, variant_id) to Prevent Duplicate Lines
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cart_items_cart_id_variant_id_key' 
           OR conname = 'cart_items_cart_id_variant_id_unique'
    ) THEN
        BEGIN
            ALTER TABLE public.cart_items 
            ADD CONSTRAINT cart_items_cart_id_variant_id_key UNIQUE (cart_id, variant_id);
        EXCEPTION
            WHEN duplicate_table THEN NULL;
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

-- 3. Transactional, Idempotent Cart Merge RPC Function
CREATE OR REPLACE FUNCTION public.merge_guest_cart(
    p_session_id TEXT,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_guest_cart_id UUID;
    v_user_cart_id UUID;
    v_guest_item RECORD;
    v_existing_item_id UUID;
    v_existing_quantity INT;
    v_available_stock INT;
    v_variant_active BOOLEAN;
    v_merged_quantity INT;
    v_items_merged INT := 0;
    v_items_skipped INT := 0;
    v_action TEXT := 'none';
BEGIN
    -- Guard against invalid inputs
    IF p_session_id IS NULL OR trim(p_session_id) = '' OR p_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'reason', 'INVALID_PARAMETERS',
            'merged', false
        );
    END IF;

    -- 1. Find and lock guest cart
    SELECT id INTO v_guest_cart_id
    FROM public.carts
    WHERE session_id = p_session_id
    ORDER BY updated_at DESC
    LIMIT 1
    FOR UPDATE;

    IF v_guest_cart_id IS NULL THEN
        -- Idempotent exit: Guest cart already merged or does not exist
        RETURN jsonb_build_object(
            'success', true,
            'reason', 'NO_GUEST_CART',
            'merged', false
        );
    END IF;

    -- Check if guest cart has any items
    IF NOT EXISTS (SELECT 1 FROM public.cart_items WHERE cart_id = v_guest_cart_id) THEN
        -- Empty guest cart: safely clean it up
        DELETE FROM public.carts WHERE id = v_guest_cart_id;
        RETURN jsonb_build_object(
            'success', true,
            'reason', 'EMPTY_GUEST_CART_REMOVED',
            'merged', true,
            'items_merged', 0
        );
    END IF;

    -- 2. Find and lock user cart
    SELECT id INTO v_user_cart_id
    FROM public.carts
    WHERE user_id = p_user_id
    ORDER BY updated_at DESC
    LIMIT 1
    FOR UPDATE;

    -- If user has no existing cart, reassign guest cart to user directly (Atomic fast path)
    IF v_user_cart_id IS NULL THEN
        UPDATE public.carts
        SET user_id = p_user_id,
            session_id = NULL,
            updated_at = NOW()
        WHERE id = v_guest_cart_id;

        -- Clean up any secondary guest carts with this session_id if any exist
        DELETE FROM public.carts WHERE session_id = p_session_id AND id <> v_guest_cart_id;

        RETURN jsonb_build_object(
            'success', true,
            'action', 'REASSIGNED_GUEST_CART',
            'user_cart_id', v_guest_cart_id,
            'merged', true
        );
    END IF;

    -- 3. If user already has a cart, merge guest items into user cart
    FOR v_guest_item IN
        SELECT id, variant_id, quantity
        FROM public.cart_items
        WHERE cart_id = v_guest_cart_id
    LOOP
        -- Check if variant is active
        SELECT is_active INTO v_variant_active
        FROM public.variants
        WHERE id = v_guest_item.variant_id;

        IF v_variant_active IS NOT TRUE THEN
            v_items_skipped := v_items_skipped + 1;
            CONTINUE;
        END IF;

        -- Calculate total available stock across warehouses
        SELECT COALESCE(SUM(quantity_available), 999) INTO v_available_stock
        FROM public.inventory_levels
        WHERE variant_id = v_guest_item.variant_id;

        -- If variant has no inventory_levels rows at all, default to 999 for non-tracked stock
        IF v_available_stock IS NULL OR v_available_stock <= 0 THEN
            -- Check if any inventory row exists for this variant
            IF EXISTS (SELECT 1 FROM public.inventory_levels WHERE variant_id = v_guest_item.variant_id) THEN
                -- Tracked and out of stock: skip
                v_items_skipped := v_items_skipped + 1;
                CONTINUE;
            ELSE
                v_available_stock := 999;
            END IF;
        END IF;

        -- Check if user cart already has this variant
        SELECT id, quantity INTO v_existing_item_id, v_existing_quantity
        FROM public.cart_items
        WHERE cart_id = v_user_cart_id AND variant_id = v_guest_item.variant_id
        LIMIT 1;

        IF v_existing_item_id IS NOT NULL THEN
            -- Merge quantities, capping at available stock
            v_merged_quantity := LEAST(v_existing_quantity + v_guest_item.quantity, v_available_stock);
            IF v_merged_quantity > 0 THEN
                UPDATE public.cart_items
                SET quantity = v_merged_quantity,
                    updated_at = NOW()
                WHERE id = v_existing_item_id;
                v_items_merged := v_items_merged + 1;
            END IF;
        ELSE
            -- Insert new line, capping at available stock
            v_merged_quantity := LEAST(v_guest_item.quantity, v_available_stock);
            IF v_merged_quantity > 0 THEN
                INSERT INTO public.cart_items (
                    cart_id,
                    variant_id,
                    quantity,
                    created_at,
                    updated_at
                )
                VALUES (
                    v_user_cart_id,
                    v_guest_item.variant_id,
                    v_merged_quantity,
                    NOW(),
                    NOW()
                )
                ON CONFLICT (cart_id, variant_id) DO UPDATE
                SET quantity = LEAST(public.cart_items.quantity + EXCLUDED.quantity, v_available_stock),
                    updated_at = NOW();

                v_items_merged := v_items_merged + 1;
            END IF;
        END IF;
    END LOOP;

    -- Update user cart timestamp
    UPDATE public.carts SET updated_at = NOW() WHERE id = v_user_cart_id;

    -- Delete guest cart (cascades to remaining guest cart items)
    DELETE FROM public.carts WHERE id = v_guest_cart_id;
    -- Clean up any residual carts with this session_id
    DELETE FROM public.carts WHERE session_id = p_session_id;

    RETURN jsonb_build_object(
        'success', true,
        'action', 'MERGED_INTO_USER_CART',
        'user_cart_id', v_user_cart_id,
        'items_merged', v_items_merged,
        'items_skipped', v_items_skipped,
        'merged', true
    );
END;
$$;

-- 4. Permissions & Security
REVOKE ALL ON FUNCTION public.merge_guest_cart(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.merge_guest_cart(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.merge_guest_cart(TEXT, UUID) TO service_role;
