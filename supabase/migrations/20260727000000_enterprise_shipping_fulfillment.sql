-- ============================================================================
-- Enterprise Courier, Shipping & Fulfillment Platform Migration
-- Anchor Fashion — Phase 11
-- ============================================================================

BEGIN;

-- ============================================================================
-- 0. DROP existing partial tables from OMS migration to upgrade
-- ============================================================================
DROP TABLE IF EXISTS public.order_shipments CASCADE;
DROP TABLE IF EXISTS public.courier_providers CASCADE;
DROP TABLE IF EXISTS public.delivery_zones CASCADE;
DROP TABLE IF EXISTS public.shipping_rates CASCADE;

-- ============================================================================
-- 1. CUSTOM TYPES
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE public.shipment_status AS ENUM (
    'created',
    'pickup_requested',
    'pickup_confirmed',
    'picked_up',
    'in_transit',
    'hub_received',
    'out_for_delivery',
    'delivered',
    'delivery_failed',
    'returned_to_origin',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.courier_provider_code AS ENUM (
    'steadfast',
    'pathao',
    'redx',
    'paperfly',
    'sundarban',
    'ecourier',
    'dhl',
    'fedex',
    'ups',
    'sandbox'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.return_status AS ENUM (
    'requested',
    'approved',
    'rejected',
    'pickup_scheduled',
    'picked_up',
    'in_transit',
    'received',
    'inventory_synced',
    'completed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.shipping_event_type AS ENUM (
    'shipment_created',
    'courier_assigned',
    'courier_reassigned',
    'pickup_requested',
    'pickup_confirmed',
    'picked_up',
    'status_updated',
    'label_generated',
    'delivered',
    'delivery_failed',
    'returned',
    'cancelled',
    'webhook_received'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 2. COURIER PROVIDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.courier_providers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              public.courier_provider_code NOT NULL UNIQUE,
  name              VARCHAR(100) NOT NULL,
  display_name      VARCHAR(150) NOT NULL,
  logo_url          VARCHAR(1024),
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  is_cod_supported  BOOLEAN NOT NULL DEFAULT TRUE,
  is_sandbox        BOOLEAN NOT NULL DEFAULT FALSE,
  priority          INTEGER NOT NULL DEFAULT 100,        -- lower = higher priority
  max_weight_kg     DECIMAL(8, 3),                       -- NULL = unlimited
  credentials       JSONB NOT NULL DEFAULT '{}'::jsonb,  -- encrypted at rest by Supabase Vault in prod
  settings          JSONB NOT NULL DEFAULT '{}'::jsonb,  -- provider-specific config
  webhook_secret    VARCHAR(255),
  supported_zones   TEXT[],                              -- array of zone codes
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. DELIVERY ZONES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   VARCHAR(100) NOT NULL,
  code                   VARCHAR(50) NOT NULL UNIQUE,
  description            TEXT,
  districts              TEXT[] NOT NULL DEFAULT '{}',   -- list of district names
  is_cod_available       BOOLEAN NOT NULL DEFAULT TRUE,
  is_active              BOOLEAN NOT NULL DEFAULT TRUE,
  estimated_days_min     INTEGER NOT NULL DEFAULT 1,
  estimated_days_max     INTEGER NOT NULL DEFAULT 3,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. SHIPPING RATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id               UUID NOT NULL REFERENCES public.delivery_zones(id) ON DELETE CASCADE,
  courier_provider_id   UUID REFERENCES public.courier_providers(id) ON DELETE SET NULL,
  name                  VARCHAR(100) NOT NULL,            -- e.g. "Standard", "Express"
  base_rate             DECIMAL(10, 2) NOT NULL,          -- BDT
  per_kg_rate           DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  free_shipping_above   DECIMAL(12, 2),                   -- NULL = no free shipping
  min_weight_kg         DECIMAL(8, 3) NOT NULL DEFAULT 0,
  max_weight_kg         DECIMAL(8, 3),                    -- NULL = unlimited
  is_cod_rate           BOOLEAN NOT NULL DEFAULT FALSE,
  cod_charge            DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. SHIPMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shipments (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number          VARCHAR(50) NOT NULL UNIQUE,
  order_id                 UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  courier_provider_id      UUID REFERENCES public.courier_providers(id) ON DELETE SET NULL,
  courier_provider_code    public.courier_provider_code,
  status                   public.shipment_status NOT NULL DEFAULT 'created',

  -- Provider Data
  consignment_id           VARCHAR(255),                  -- provider's internal ID
  tracking_number          VARCHAR(255),
  provider_status          VARCHAR(100),                  -- raw status from provider

  -- Recipient (snapshot at time of shipment)
  recipient_name           VARCHAR(255) NOT NULL,
  recipient_phone          VARCHAR(50) NOT NULL,
  recipient_address        TEXT NOT NULL,
  recipient_city           VARCHAR(100),
  recipient_district       VARCHAR(100),
  recipient_zone_code      VARCHAR(50),

  -- Delivery Zone & Rate
  delivery_zone_id         UUID REFERENCES public.delivery_zones(id) ON DELETE SET NULL,
  shipping_rate_id         UUID REFERENCES public.shipping_rates(id) ON DELETE SET NULL,

  -- Financials
  shipping_charge          DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  cod_amount               DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  is_cod                   BOOLEAN NOT NULL DEFAULT FALSE,

  -- Physical
  weight_kg                DECIMAL(8, 3),
  length_cm                DECIMAL(8, 2),
  width_cm                 DECIMAL(8, 2),
  height_cm                DECIMAL(8, 2),

  -- Lifecycle timestamps
  pickup_requested_at      TIMESTAMPTZ,
  pickup_confirmed_at      TIMESTAMPTZ,
  picked_up_at             TIMESTAMPTZ,
  in_transit_at            TIMESTAMPTZ,
  out_for_delivery_at      TIMESTAMPTZ,
  delivered_at             TIMESTAMPTZ,
  delivery_failed_at       TIMESTAMPTZ,
  returned_at              TIMESTAMPTZ,
  cancelled_at             TIMESTAMPTZ,
  estimated_delivery_date  DATE,

  -- Label
  label_url                VARCHAR(1024),
  label_generated_at       TIMESTAMPTZ,

  -- Notes
  special_instructions     TEXT,
  failure_reason           TEXT,
  rto_initiated            BOOLEAN NOT NULL DEFAULT FALSE,

  -- Traceability
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by               UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================================================
-- 6. SHIPMENT ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shipment_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id     UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  order_item_id   UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
  sku             VARCHAR(100) NOT NULL,
  product_name    VARCHAR(255) NOT NULL,
  variant_name    VARCHAR(255),
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  unit_price      DECIMAL(12, 2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. SHIPMENT TRACKING EVENTS TABLE (immutable log from provider)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shipment_tracking_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id         UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  tracking_number     VARCHAR(255),
  status              VARCHAR(100) NOT NULL,
  status_description  TEXT,
  location            VARCHAR(255),
  event_time          TIMESTAMPTZ NOT NULL,
  provider_raw        JSONB NOT NULL DEFAULT '{}'::jsonb,  -- raw data from provider
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. SHIPMENT LABELS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shipment_labels (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id       UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  label_type        VARCHAR(50) NOT NULL DEFAULT 'pdf',  -- 'pdf', 'zpl', 'png'
  label_url         VARCHAR(1024),
  label_data        TEXT,                                 -- base64 if stored directly
  generated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  printed_at        TIMESTAMPTZ,
  print_count       INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. SHIPMENT EVENTS TABLE (internal lifecycle audit log)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shipment_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id     UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  event_type      public.shipping_event_type NOT NULL,
  payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
  triggered_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source          VARCHAR(50) NOT NULL DEFAULT 'system',  -- 'system', 'admin', 'webhook', 'customer'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. RETURNS TABLE (full upgrade from OMS partial)
-- ============================================================================

-- Drop OMS returns if it exists (already dropped with CASCADE if needed)
DROP TABLE IF EXISTS public.return_items CASCADE;
ALTER TABLE IF EXISTS public.returns
  ADD COLUMN IF NOT EXISTS shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS return_shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS return_tracking_number VARCHAR(255),
  ADD COLUMN IF NOT EXISTS return_courier_code public.courier_provider_code,
  ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS inventory_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- If returns table doesn't exist yet, create it fresh
CREATE TABLE IF NOT EXISTS public.returns (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_number          VARCHAR(100) NOT NULL UNIQUE,
  order_id               UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shipment_id            UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  return_shipment_id     UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  status                 public.return_status NOT NULL DEFAULT 'requested',
  reason                 TEXT,
  return_tracking_number VARCHAR(255),
  return_courier_code    public.courier_provider_code,
  picked_up_at           TIMESTAMPTZ,
  received_at            TIMESTAMPTZ,
  inventory_synced_at    TIMESTAMPTZ,
  completed_at           TIMESTAMPTZ,
  notes                  TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. RETURN ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.return_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id       UUID NOT NULL REFERENCES public.returns(id) ON DELETE CASCADE,
  order_item_id   UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
  sku             VARCHAR(100) NOT NULL,
  product_name    VARCHAR(255) NOT NULL,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  reason          TEXT,
  condition       VARCHAR(50) DEFAULT 'unknown',  -- 'good', 'damaged', 'defective', 'unknown'
  restocked       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. TRIGGERS & FUNCTIONS
-- ============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_shipping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION update_shipping_updated_at();

CREATE OR REPLACE TRIGGER trg_returns_updated_at
  BEFORE UPDATE ON public.returns
  FOR EACH ROW EXECUTE FUNCTION update_shipping_updated_at();

CREATE OR REPLACE TRIGGER trg_delivery_zones_updated_at
  BEFORE UPDATE ON public.delivery_zones
  FOR EACH ROW EXECUTE FUNCTION update_shipping_updated_at();

CREATE OR REPLACE TRIGGER trg_shipping_rates_updated_at
  BEFORE UPDATE ON public.shipping_rates
  FOR EACH ROW EXECUTE FUNCTION update_shipping_updated_at();

CREATE OR REPLACE TRIGGER trg_courier_providers_updated_at
  BEFORE UPDATE ON public.courier_providers
  FOR EACH ROW EXECUTE FUNCTION update_shipping_updated_at();

-- Auto-generate shipment number
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.shipment_number IS NULL OR NEW.shipment_number = '' THEN
    NEW.shipment_number = 'SHP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
      LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_shipments_generate_number
  BEFORE INSERT ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION generate_shipment_number();

-- Log shipment status changes as events
CREATE OR REPLACE FUNCTION log_shipment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.shipment_events (shipment_id, event_type, payload, triggered_by, source)
    VALUES (
      NEW.id,
      'status_updated',
      jsonb_build_object(
        'previous_status', OLD.status,
        'new_status', NEW.status,
        'tracking_number', NEW.tracking_number
      ),
      NEW.updated_by,
      'system'
    );
    -- Sync lifecycle timestamps
    CASE NEW.status
      WHEN 'pickup_requested'  THEN NEW.pickup_requested_at  = COALESCE(NEW.pickup_requested_at,  NOW());
      WHEN 'pickup_confirmed'  THEN NEW.pickup_confirmed_at  = COALESCE(NEW.pickup_confirmed_at,  NOW());
      WHEN 'picked_up'         THEN NEW.picked_up_at          = COALESCE(NEW.picked_up_at,          NOW());
      WHEN 'in_transit'        THEN NEW.in_transit_at         = COALESCE(NEW.in_transit_at,         NOW());
      WHEN 'out_for_delivery'  THEN NEW.out_for_delivery_at   = COALESCE(NEW.out_for_delivery_at,   NOW());
      WHEN 'delivered'         THEN NEW.delivered_at          = COALESCE(NEW.delivered_at,          NOW());
      WHEN 'delivery_failed'   THEN NEW.delivery_failed_at    = COALESCE(NEW.delivery_failed_at,    NOW());
      WHEN 'returned_to_origin'THEN NEW.returned_at           = COALESCE(NEW.returned_at,           NOW());
      WHEN 'cancelled'         THEN NEW.cancelled_at          = COALESCE(NEW.cancelled_at,          NOW());
      ELSE NULL;
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_log_shipment_status_change
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION log_shipment_status_change();

-- Sync shipment status → order status
CREATE OR REPLACE FUNCTION sync_order_status_from_shipment()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'picked_up' THEN
        UPDATE public.orders SET status = 'shipped', shipped_at = NOW(), updated_by = NEW.updated_by
        WHERE id = NEW.order_id AND status NOT IN ('delivered','completed','cancelled','returned');
      WHEN 'delivered' THEN
        UPDATE public.orders SET status = 'delivered', delivered_at = NOW(), updated_by = NEW.updated_by
        WHERE id = NEW.order_id AND status NOT IN ('completed','cancelled');
      WHEN 'out_for_delivery' THEN
        UPDATE public.orders SET status = 'out_for_delivery', updated_by = NEW.updated_by
        WHERE id = NEW.order_id AND status NOT IN ('delivered','completed','cancelled');
      WHEN 'returned_to_origin' THEN
        UPDATE public.orders SET status = 'returned', updated_by = NEW.updated_by
        WHERE id = NEW.order_id AND status NOT IN ('completed','cancelled');
      ELSE NULL;
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_sync_order_from_shipment
  AFTER UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION sync_order_status_from_shipment();

-- ============================================================================
-- 13. STORED PROCEDURES
-- ============================================================================

-- Calculate shipping charge
CREATE OR REPLACE FUNCTION calculate_shipping_charge(
  p_zone_id UUID,
  p_weight_kg DECIMAL,
  p_order_value DECIMAL,
  p_is_cod BOOLEAN DEFAULT FALSE
)
RETURNS DECIMAL AS $$
DECLARE
  v_rate RECORD;
  v_charge DECIMAL := 0;
BEGIN
  SELECT * INTO v_rate
  FROM public.shipping_rates
  WHERE zone_id = p_zone_id
    AND is_active = TRUE
    AND is_cod_rate = p_is_cod
    AND (min_weight_kg IS NULL OR p_weight_kg >= min_weight_kg)
    AND (max_weight_kg IS NULL OR p_weight_kg <= max_weight_kg)
  ORDER BY base_rate ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Check free shipping threshold
  IF v_rate.free_shipping_above IS NOT NULL AND p_order_value >= v_rate.free_shipping_above THEN
    RETURN CASE WHEN p_is_cod THEN v_rate.cod_charge ELSE 0 END;
  END IF;

  v_charge := v_rate.base_rate + (p_weight_kg * v_rate.per_kg_rate);
  IF p_is_cod THEN
    v_charge := v_charge + v_rate.cod_charge;
  END IF;

  RETURN v_charge;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get shipment with full details
CREATE OR REPLACE FUNCTION get_shipment_full(p_shipment_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'shipment', row_to_json(s),
    'items', (SELECT jsonb_agg(row_to_json(si)) FROM public.shipment_items si WHERE si.shipment_id = s.id),
    'tracking_events', (SELECT jsonb_agg(row_to_json(te) ORDER BY te.event_time DESC)
                        FROM public.shipment_tracking_events te WHERE te.shipment_id = s.id),
    'labels', (SELECT jsonb_agg(row_to_json(sl)) FROM public.shipment_labels sl WHERE sl.shipment_id = s.id),
    'events', (SELECT jsonb_agg(row_to_json(se) ORDER BY se.created_at DESC)
               FROM public.shipment_events se WHERE se.shipment_id = s.id),
    'courier', row_to_json(cp),
    'zone', row_to_json(dz)
  )
  INTO v_result
  FROM public.shipments s
  LEFT JOIN public.courier_providers cp ON cp.id = s.courier_provider_id
  LEFT JOIN public.delivery_zones dz ON dz.id = s.delivery_zone_id
  WHERE s.id = p_shipment_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 14. VIEWS
-- ============================================================================

-- Shipments with order & courier summary
CREATE OR REPLACE VIEW public.v_shipments_summary WITH (security_invoker = on) AS
SELECT
  s.id,
  s.shipment_number,
  s.order_id,
  o.order_number,
  s.courier_provider_code,
  cp.display_name AS courier_name,
  s.status,
  s.tracking_number,
  s.recipient_name,
  s.recipient_city,
  s.recipient_district,
  s.is_cod,
  s.cod_amount,
  s.shipping_charge,
  s.weight_kg,
  s.estimated_delivery_date,
  s.delivered_at,
  s.delivery_failed_at,
  s.rto_initiated,
  s.created_at,
  s.updated_at
FROM public.shipments s
LEFT JOIN public.orders o ON o.id = s.order_id
LEFT JOIN public.courier_providers cp ON cp.id = s.courier_provider_id;

-- Delivery analytics
CREATE OR REPLACE VIEW public.v_delivery_analytics WITH (security_invoker = on) AS
SELECT
  DATE(s.created_at) AS date,
  s.courier_provider_code,
  COUNT(*) AS total_shipments,
  COUNT(*) FILTER (WHERE s.status = 'delivered') AS delivered,
  COUNT(*) FILTER (WHERE s.status = 'delivery_failed') AS failed,
  COUNT(*) FILTER (WHERE s.status = 'returned_to_origin') AS rto,
  COUNT(*) FILTER (WHERE s.status = 'cancelled') AS cancelled,
  ROUND(
    COUNT(*) FILTER (WHERE s.status = 'delivered')::DECIMAL /
    NULLIF(COUNT(*) FILTER (WHERE s.status IN ('delivered','delivery_failed')), 0) * 100,
    2
  ) AS delivery_success_rate,
  AVG(EXTRACT(EPOCH FROM (s.delivered_at - s.picked_up_at))/3600) AS avg_delivery_hours,
  SUM(s.shipping_charge) AS total_revenue,
  SUM(s.cod_amount) FILTER (WHERE s.is_cod AND s.status = 'delivered') AS cod_collected
FROM public.shipments s
GROUP BY DATE(s.created_at), s.courier_provider_code;

-- RTO dashboard view
CREATE OR REPLACE VIEW public.v_rto_summary WITH (security_invoker = on) AS
SELECT
  s.id AS shipment_id,
  s.shipment_number,
  o.order_number,
  s.courier_provider_code,
  s.tracking_number,
  s.recipient_name,
  s.recipient_city,
  s.failure_reason,
  s.delivery_failed_at,
  s.returned_at,
  s.rto_initiated,
  r.id AS return_id,
  r.status AS return_status
FROM public.shipments s
LEFT JOIN public.orders o ON o.id = s.order_id
LEFT JOIN public.returns r ON r.shipment_id = s.id
WHERE s.status IN ('delivery_failed', 'returned_to_origin') OR s.rto_initiated = TRUE;

-- ============================================================================
-- 15. INDEXES
-- ============================================================================

-- courier_providers
CREATE INDEX IF NOT EXISTS idx_courier_providers_code      ON public.courier_providers(code);
CREATE INDEX IF NOT EXISTS idx_courier_providers_is_active ON public.courier_providers(is_active);

-- delivery_zones
CREATE INDEX IF NOT EXISTS idx_delivery_zones_code      ON public.delivery_zones(code);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_is_active ON public.delivery_zones(is_active);

-- shipping_rates
CREATE INDEX IF NOT EXISTS idx_shipping_rates_zone_id  ON public.shipping_rates(zone_id);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_is_active ON public.shipping_rates(is_active);

-- shipments
CREATE INDEX IF NOT EXISTS idx_shipments_order_id          ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status            ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number   ON public.shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_courier_code      ON public.shipments(courier_provider_code);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at        ON public.shipments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipments_shipment_number   ON public.shipments(shipment_number);
CREATE INDEX IF NOT EXISTS idx_shipments_consignment_id    ON public.shipments(consignment_id);
CREATE INDEX IF NOT EXISTS idx_shipments_rto               ON public.shipments(rto_initiated) WHERE rto_initiated = TRUE;

-- shipment_items
CREATE INDEX IF NOT EXISTS idx_shipment_items_shipment_id ON public.shipment_items(shipment_id);

-- shipment_tracking_events
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id ON public.shipment_tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_time  ON public.shipment_tracking_events(event_time DESC);

-- shipment_labels
CREATE INDEX IF NOT EXISTS idx_shipment_labels_shipment_id ON public.shipment_labels(shipment_id);

-- shipment_events
CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment_id ON public.shipment_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_events_type        ON public.shipment_events(event_type);

-- returns
CREATE INDEX IF NOT EXISTS idx_returns_order_id    ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_status      ON public.returns(status);
CREATE INDEX IF NOT EXISTS idx_returns_shipment_id ON public.returns(shipment_id);

-- return_items
CREATE INDEX IF NOT EXISTS idx_return_items_return_id ON public.return_items(return_id);

-- ============================================================================
-- 16. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.courier_providers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_tracking_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_labels           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items              ENABLE ROW LEVEL SECURITY;

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND (raw_user_meta_data->>'role' = 'admin' OR raw_app_meta_data->>'role' = 'admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- courier_providers: public read (for active ones); admin full control
DROP POLICY IF EXISTS "Public can view active courier providers" ON public.courier_providers;
CREATE POLICY "Public can view active courier providers" ON public.courier_providers FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage courier providers" ON public.courier_providers;
CREATE POLICY "Admins manage courier providers" ON public.courier_providers FOR ALL
  USING (public.is_admin());

-- delivery_zones: public read active; admin manage
DROP POLICY IF EXISTS "Public can view active delivery zones" ON public.delivery_zones;
CREATE POLICY "Public can view active delivery zones" ON public.delivery_zones FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage delivery zones" ON public.delivery_zones;
CREATE POLICY "Admins manage delivery zones" ON public.delivery_zones FOR ALL
  USING (public.is_admin());

-- shipping_rates: public read active; admin manage
DROP POLICY IF EXISTS "Public can view active shipping rates" ON public.shipping_rates;
CREATE POLICY "Public can view active shipping rates" ON public.shipping_rates FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins manage shipping rates" ON public.shipping_rates;
CREATE POLICY "Admins manage shipping rates" ON public.shipping_rates FOR ALL
  USING (public.is_admin());

-- shipments: customers view their own; admins manage all
DROP POLICY IF EXISTS "Customers can view their own shipments" ON public.shipments;
CREATE POLICY "Customers can view their own shipments" ON public.shipments FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage all shipments" ON public.shipments;
CREATE POLICY "Admins manage all shipments" ON public.shipments FOR ALL
  USING (public.is_admin());

-- shipment_items: mirror shipments
DROP POLICY IF EXISTS "Customers can view their own shipment items" ON public.shipment_items;
CREATE POLICY "Customers can view their own shipment items" ON public.shipment_items FOR SELECT
  USING (shipment_id IN (
    SELECT id FROM public.shipments
    WHERE order_id IN (SELECT id FROM public.orders WHERE customer_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Admins manage shipment items" ON public.shipment_items;
CREATE POLICY "Admins manage shipment items" ON public.shipment_items FOR ALL
  USING (public.is_admin());

-- shipment_tracking_events: public read by tracking number; customers by shipment; admins all
DROP POLICY IF EXISTS "Public can view tracking events by tracking number" ON public.shipment_tracking_events;
CREATE POLICY "Public can view tracking events by tracking number" ON public.shipment_tracking_events FOR SELECT
  USING (TRUE);  -- public tracking page queries by tracking_number

DROP POLICY IF EXISTS "Admins manage tracking events" ON public.shipment_tracking_events;
CREATE POLICY "Admins manage tracking events" ON public.shipment_tracking_events FOR ALL
  USING (public.is_admin());

-- shipment_labels: admin only
DROP POLICY IF EXISTS "Admins manage shipment labels" ON public.shipment_labels;
CREATE POLICY "Admins manage shipment labels" ON public.shipment_labels FOR ALL
  USING (public.is_admin());

-- shipment_events: admin only
DROP POLICY IF EXISTS "Admins manage shipment events" ON public.shipment_events;
CREATE POLICY "Admins manage shipment events" ON public.shipment_events FOR ALL
  USING (public.is_admin());

-- returns: customers see own; admins manage all
DROP POLICY IF EXISTS "Customers can view their own returns" ON public.returns;
CREATE POLICY "Customers can view their own returns" ON public.returns FOR SELECT
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage all returns" ON public.returns;
CREATE POLICY "Admins manage all returns" ON public.returns FOR ALL
  USING (public.is_admin());

-- return_items: mirror returns
DROP POLICY IF EXISTS "Customers can view their own return items" ON public.return_items;
CREATE POLICY "Customers can view their own return items" ON public.return_items FOR SELECT
  USING (return_id IN (SELECT id FROM public.returns WHERE customer_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage return items" ON public.return_items;
CREATE POLICY "Admins manage return items" ON public.return_items FOR ALL
  USING (public.is_admin());

-- ============================================================================
-- 17. SEED DATA — Delivery Zones (Bangladesh)
-- ============================================================================

INSERT INTO public.delivery_zones (name, code, description, districts, is_cod_available, estimated_days_min, estimated_days_max)
VALUES
  ('Dhaka Metro',   'DHAKA_METRO',   'Dhaka city & metro area',              ARRAY['Dhaka'],                                                   TRUE, 1, 2),
  ('Dhaka Division','DHAKA_DIV',     'Dhaka division excluding metro',        ARRAY['Gazipur','Narayanganj','Narsingdi','Manikganj','Munshiganj','Rajbari','Faridpur','Gopalganj','Madaripur','Shariatpur'],  TRUE, 2, 3),
  ('Chittagong',    'CHITTAGONG',    'Chittagong city & district',            ARRAY['Chattogram'],                                              TRUE, 2, 3),
  ('Sylhet',        'SYLHET',        'Sylhet division',                       ARRAY['Sylhet','Moulvibazar','Habiganj','Sunamganj'],              TRUE, 2, 4),
  ('Rajshahi',      'RAJSHAHI',      'Rajshahi division',                     ARRAY['Rajshahi','Chapai Nawabganj','Natore','Naogaon','Pabna','Sirajganj','Bogra','Joypurhat'],  TRUE, 3, 5),
  ('Khulna',        'KHULNA',        'Khulna division',                       ARRAY['Khulna','Bagerhat','Satkhira','Jessore','Narail','Magura','Jhenaidah','Kushtia','Meherpur','Chuadanga'],  TRUE, 3, 5),
  ('Barishal',      'BARISHAL',      'Barishal division',                     ARRAY['Barishal','Barguna','Bhola','Jhalokati','Patuakhali','Pirojpur'],  TRUE, 3, 5),
  ('Rangpur',       'RANGPUR',       'Rangpur division',                      ARRAY['Rangpur','Dinajpur','Gaibandha','Kurigram','Lalmonirhat','Nilphamari','Panchagarh','Thakurgaon'],  TRUE, 3, 5),
  ('Mymensingh',    'MYMENSINGH',    'Mymensingh division',                   ARRAY['Mymensingh','Jamalpur','Netrokona','Sherpur'],              TRUE, 2, 4),
  ('Remote Area',   'REMOTE',        'Remote & hard-to-reach areas',          ARRAY['Bandarban','Rangamati','Khagrachhari','Cox''s Bazar'],      FALSE, 5, 10)
ON CONFLICT (code) DO NOTHING;

-- Seed default shipping rates for Dhaka Metro
INSERT INTO public.shipping_rates (zone_id, name, base_rate, per_kg_rate, free_shipping_above, is_cod_rate, cod_charge)
SELECT
  id,
  'Standard Delivery',
  60.00,
  20.00,
  1000.00,
  FALSE,
  0.00
FROM public.delivery_zones WHERE code = 'DHAKA_METRO'
ON CONFLICT DO NOTHING;

INSERT INTO public.shipping_rates (zone_id, name, base_rate, per_kg_rate, free_shipping_above, is_cod_rate, cod_charge)
SELECT
  id,
  'COD Delivery',
  60.00,
  20.00,
  2000.00,
  TRUE,
  30.00
FROM public.delivery_zones WHERE code = 'DHAKA_METRO'
ON CONFLICT DO NOTHING;

-- Seed sandbox provider
INSERT INTO public.courier_providers (code, name, display_name, is_active, is_cod_supported, is_sandbox, priority, credentials, settings)
VALUES (
  'sandbox',
  'Sandbox Courier',
  'Sandbox (Testing)',
  TRUE,
  TRUE,
  TRUE,
  999,
  '{"apiKey":"sandbox-key"}'::jsonb,
  '{"simulateDelay":false}'::jsonb
) ON CONFLICT (code) DO NOTHING;

COMMIT;
