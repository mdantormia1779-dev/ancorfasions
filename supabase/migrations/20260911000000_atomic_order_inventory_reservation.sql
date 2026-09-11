-- ============================================================================
-- Migration: 20260911000000_atomic_order_inventory_reservation.sql
-- Atomic Inventory Reservation + Overselling Protection
--
-- Architecture:
--   reserve_order_inventory  → called once when order is created (PENDING_PAYMENT)
--   release_order_inventory  → called on cancellation or expiry
--   confirm_order_inventory  → called when order ships (moves reserved → sold)
--
-- Concurrency strategy: SELECT ... FOR UPDATE on inventory_levels rows.
-- All mutations for an order happen inside one implicit PL/pgSQL transaction,
-- so the entire reservation is all-or-nothing.
-- ============================================================================

-- ============================================================================
-- 1. SCHEMA ADDITIONS
-- ============================================================================

-- Add reservation expiry to orders so the cron job can expire stale reservations.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS reservation_expires_at TIMESTAMPTZ;

-- Add idempotency_key to orders.
-- The checkout service already tries to write this field, but the OMS module
-- migration (20260726500000) dropped it when replacing the old orders schema.
-- This restores it so double-click / network-retry protection works correctly.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255);

-- Unique constraint on idempotency_key — enforce at DB level.
-- Use DO block to skip if constraint already exists (safe re-run).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_idempotency_key_key'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_idempotency_key_key UNIQUE (idempotency_key);
  END IF;
END $$;

-- ============================================================================
-- 2. INDEXES (justified queries listed inline)
-- ============================================================================

-- Used by the expiry cron: WHERE status = 'pending_payment' AND reservation_expires_at < NOW()
CREATE INDEX IF NOT EXISTS idx_orders_status_reservation_expires
  ON public.orders (status, reservation_expires_at)
  WHERE reservation_expires_at IS NOT NULL;

-- Used by reserve/release/confirm: WHERE order_id = ? AND inventory_reserved = false/true
CREATE INDEX IF NOT EXISTS idx_order_items_order_id_reserved
  ON public.order_items (order_id, inventory_reserved);

-- ============================================================================
-- 3. RPC: reserve_order_inventory
--
-- Atomically reserves inventory for all items in an order.
--
-- Parameters:
--   p_order_id  -- the order whose items to reserve
--   p_items     -- JSONB array: [{variant_id, warehouse_id, quantity}, ...]
--
-- Idempotency:
--   If ALL order_items already have inventory_reserved = TRUE, returns immediately.
--
-- Row Locking:
--   Uses SELECT ... FOR UPDATE on each inventory_levels row so that concurrent
--   transactions for the same variant+warehouse serialize correctly.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.reserve_order_inventory(
  p_order_id  UUID,
  p_items     JSONB
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_item            JSONB;
  v_variant_id      UUID;
  v_warehouse_id    UUID;
  v_qty             INTEGER;
  v_available       INTEGER;
  v_reserved_count  INTEGER;
  v_total_count     INTEGER;
BEGIN
  -- Idempotency guard
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE inventory_reserved = TRUE)
  INTO v_total_count, v_reserved_count
  FROM public.order_items
  WHERE order_id = p_order_id;

  IF v_total_count = 0 THEN
    RAISE EXCEPTION 'Order % has no items', p_order_id;
  END IF;

  -- All items already reserved: idempotent success.
  IF v_reserved_count = v_total_count THEN
    RETURN;
  END IF;

  -- Partial reservation: unsafe state, require manual intervention.
  IF v_reserved_count > 0 AND v_reserved_count < v_total_count THEN
    RAISE EXCEPTION 'Order % is partially reserved (% of % items). Manual intervention required.',
      p_order_id, v_reserved_count, v_total_count;
  END IF;

  -- Per-item reservation
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id   := (v_item->>'variant_id')::UUID;
    v_warehouse_id := (v_item->>'warehouse_id')::UUID;
    v_qty          := (v_item->>'quantity')::INTEGER;

    IF v_qty <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity % for variant %', v_qty, v_variant_id;
    END IF;

    -- Lock the inventory row. Two concurrent calls for the same variant+warehouse
    -- will serialize here: the second waits until the first commits/rolls back.
    SELECT quantity_available
    INTO   v_available
    FROM   public.inventory_levels
    WHERE  variant_id   = v_variant_id
      AND  warehouse_id = v_warehouse_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'No inventory record for variant % in warehouse %',
        v_variant_id, v_warehouse_id
        USING ERRCODE = 'P0001', HINT = 'INVENTORY_NOT_FOUND';
    END IF;

    IF v_available < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for variant %: requested %, available %',
        v_variant_id, v_qty, v_available
        USING ERRCODE = 'P0002', HINT = 'INSUFFICIENT_STOCK';
    END IF;

    -- Move quantity from available to reserved.
    UPDATE public.inventory_levels
    SET
      quantity_available = quantity_available - v_qty,
      quantity_reserved  = quantity_reserved  + v_qty,
      updated_at         = NOW()
    WHERE variant_id   = v_variant_id
      AND warehouse_id = v_warehouse_id;

    -- Audit trail entry.
    INSERT INTO public.stock_movements (
      variant_id,
      warehouse_id,
      movement_type,
      quantity,
      reference_type,
      reference_id,
      notes
    ) VALUES (
      v_variant_id,
      v_warehouse_id,
      'RESERVE',
      v_qty,
      'ORDER',
      p_order_id::TEXT,
      'Reserved for order ' || p_order_id
    );

    -- Mark the order_item as reserved and record the fulfilling warehouse.
    UPDATE public.order_items
    SET
      inventory_reserved     = TRUE,
      allocated_warehouse_id = v_warehouse_id
    WHERE order_id   = p_order_id
      AND variant_id = v_variant_id;
  END LOOP;
END;
$$;

-- ============================================================================
-- 4. RPC: release_order_inventory
--
-- Releases ALL reserved inventory for an order back to available.
-- Called on: order cancellation, reservation expiry, payment failure.
-- Idempotent: if no items are reserved, returns immediately.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.release_order_inventory(
  p_order_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_item RECORD;
BEGIN
  FOR v_item IN
    SELECT
      oi.variant_id,
      oi.allocated_warehouse_id AS warehouse_id,
      oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id          = p_order_id
      AND oi.inventory_reserved = TRUE
    FOR UPDATE OF oi
  LOOP
    IF v_item.warehouse_id IS NULL THEN
      CONTINUE;
    END IF;

    UPDATE public.inventory_levels
    SET
      quantity_available = quantity_available + v_item.quantity,
      quantity_reserved  = GREATEST(0, quantity_reserved - v_item.quantity),
      updated_at         = NOW()
    WHERE variant_id   = v_item.variant_id
      AND warehouse_id = v_item.warehouse_id;

    INSERT INTO public.stock_movements (
      variant_id, warehouse_id, movement_type, quantity,
      reference_type, reference_id, notes
    ) VALUES (
      v_item.variant_id, v_item.warehouse_id, 'RELEASE', v_item.quantity,
      'ORDER', p_order_id::TEXT,
      'Released reservation for order ' || p_order_id
    );

    UPDATE public.order_items
    SET
      inventory_reserved     = FALSE,
      allocated_warehouse_id = NULL
    WHERE order_id   = p_order_id
      AND variant_id = v_item.variant_id;
  END LOOP;
END;
$$;

-- ============================================================================
-- 5. RPC: confirm_order_inventory
--
-- Permanently removes reserved stock when an order ships.
-- quantity_reserved decrements; stock has physically left the warehouse.
-- Idempotent: items with inventory_reserved = FALSE are skipped.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.confirm_order_inventory(
  p_order_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_item RECORD;
BEGIN
  FOR v_item IN
    SELECT
      oi.variant_id,
      oi.allocated_warehouse_id AS warehouse_id,
      oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id          = p_order_id
      AND oi.inventory_reserved = TRUE
    FOR UPDATE OF oi
  LOOP
    IF v_item.warehouse_id IS NULL THEN
      CONTINUE;
    END IF;

    UPDATE public.inventory_levels
    SET
      quantity_reserved = GREATEST(0, quantity_reserved - v_item.quantity),
      updated_at        = NOW()
    WHERE variant_id   = v_item.variant_id
      AND warehouse_id = v_item.warehouse_id;

    INSERT INTO public.stock_movements (
      variant_id, warehouse_id, movement_type, quantity,
      reference_type, reference_id, notes
    ) VALUES (
      v_item.variant_id, v_item.warehouse_id, 'SHIP', v_item.quantity,
      'ORDER', p_order_id::TEXT,
      'Confirmed shipment for order ' || p_order_id
    );

    UPDATE public.order_items
    SET inventory_reserved = FALSE
    WHERE order_id   = p_order_id
      AND variant_id = v_item.variant_id;
  END LOOP;
END;
$$;

-- ============================================================================
-- 6. SECURITY
-- Revoke public execution; only service_role (server-side admin client) can call.
-- Customers cannot invoke these RPCs directly through PostgREST because:
--   a) The admin client (service_role JWT) is server-only
--   b) RLS on inventory_levels blocks direct anon/authenticated mutations
--   c) Application layer validates order ownership before calling
-- ============================================================================
REVOKE ALL ON FUNCTION public.reserve_order_inventory(UUID, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_order_inventory(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_order_inventory(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.reserve_order_inventory(UUID, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_order_inventory(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_order_inventory(UUID) TO service_role;
