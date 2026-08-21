-- Migration: Add RPCs for atomic inventory stock operations
-- Fixes race conditions in reserveStock, releaseStock, reduceStock, and transferStock

-- 1. atomic_reserve_stock
CREATE OR REPLACE FUNCTION atomic_reserve_stock(
    p_variant_id UUID,
    p_warehouse_id UUID,
    p_quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be greater than zero';
    END IF;

    UPDATE public.inventory_levels
    SET 
        quantity_available = quantity_available - p_quantity,
        quantity_reserved = quantity_reserved + p_quantity,
        updated_at = NOW()
    WHERE variant_id = p_variant_id AND warehouse_id = p_warehouse_id
    AND quantity_available >= p_quantity;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock or inventory record not found';
    END IF;
END;
$$;

-- 2. atomic_release_stock
CREATE OR REPLACE FUNCTION atomic_release_stock(
    p_variant_id UUID,
    p_warehouse_id UUID,
    p_quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be greater than zero';
    END IF;

    UPDATE public.inventory_levels
    SET 
        quantity_available = quantity_available + p_quantity,
        quantity_reserved = GREATEST(0, quantity_reserved - p_quantity),
        updated_at = NOW()
    WHERE variant_id = p_variant_id AND warehouse_id = p_warehouse_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory record not found';
    END IF;
END;
$$;

-- 3. atomic_reduce_stock
CREATE OR REPLACE FUNCTION atomic_reduce_stock(
    p_variant_id UUID,
    p_warehouse_id UUID,
    p_quantity INTEGER,
    p_from_reserved BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_reserved INTEGER;
    v_diff INTEGER;
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be greater than zero';
    END IF;

    IF p_from_reserved THEN
        -- If reducing from reserved, but quantity is greater than what's reserved,
        -- we need to deduct the rest from available.
        SELECT quantity_reserved INTO v_reserved
        FROM public.inventory_levels
        WHERE variant_id = p_variant_id AND warehouse_id = p_warehouse_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Inventory record not found';
        END IF;

        IF p_quantity > v_reserved THEN
            v_diff := p_quantity - v_reserved;
            
            UPDATE public.inventory_levels
            SET 
                quantity_reserved = 0,
                quantity_available = GREATEST(0, quantity_available - v_diff),
                updated_at = NOW()
            WHERE variant_id = p_variant_id AND warehouse_id = p_warehouse_id;
        ELSE
            UPDATE public.inventory_levels
            SET 
                quantity_reserved = quantity_reserved - p_quantity,
                updated_at = NOW()
            WHERE variant_id = p_variant_id AND warehouse_id = p_warehouse_id;
        END IF;
    ELSE
        UPDATE public.inventory_levels
        SET 
            quantity_available = GREATEST(0, quantity_available - p_quantity),
            updated_at = NOW()
        WHERE variant_id = p_variant_id AND warehouse_id = p_warehouse_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Inventory record not found';
        END IF;
    END IF;
END;
$$;

-- 4. atomic_transfer_stock
CREATE OR REPLACE FUNCTION atomic_transfer_stock(
    p_variant_id UUID,
    p_from_warehouse_id UUID,
    p_to_warehouse_id UUID,
    p_quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be greater than zero';
    END IF;

    IF p_from_warehouse_id = p_to_warehouse_id THEN
        RAISE EXCEPTION 'Source and destination warehouse must be different';
    END IF;

    -- Deduct from source
    UPDATE public.inventory_levels
    SET 
        quantity_available = quantity_available - p_quantity,
        updated_at = NOW()
    WHERE variant_id = p_variant_id AND warehouse_id = p_from_warehouse_id
    AND quantity_available >= p_quantity;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock in source warehouse or inventory record not found';
    END IF;

    -- Add to destination
    UPDATE public.inventory_levels
    SET 
        quantity_available = quantity_available + p_quantity,
        updated_at = NOW()
    WHERE variant_id = p_variant_id AND warehouse_id = p_to_warehouse_id;

    IF NOT FOUND THEN
        -- Insert new record if it doesn't exist in destination warehouse
        INSERT INTO public.inventory_levels (
            variant_id, 
            warehouse_id, 
            quantity_available, 
            quantity_reserved, 
            quantity_incoming, 
            quantity_damaged, 
            quantity_returned, 
            reorder_point, 
            safety_stock
        )
        VALUES (
            p_variant_id,
            p_to_warehouse_id,
            p_quantity,
            0,
            0,
            0,
            0,
            0,
            0
        );
    END IF;
END;
$$;
