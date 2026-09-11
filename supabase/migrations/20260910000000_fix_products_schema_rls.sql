-- ============================================================================
-- Migration: Fix products RLS + Add cost_price & sale_price columns
-- ============================================================================

-- 1. Add cost_price and sale_price to products table (and other missing columns)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
  ADD COLUMN IF NOT EXISTS barcode VARCHAR(100),
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
  ADD COLUMN IF NOT EXISTS season VARCHAR(50),
  ADD COLUMN IF NOT EXISTS care_instructions TEXT,
  ADD COLUMN IF NOT EXISTS country_of_origin VARCHAR(100),
  ADD COLUMN IF NOT EXISTS warranty VARCHAR(255),
  ADD COLUMN IF NOT EXISTS material VARCHAR(255),
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- 2. Add barcode, sale_price & attributes to variants if missing
ALTER TABLE public.variants
  ADD COLUMN IF NOT EXISTS barcode VARCHAR(100),
  ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS attributes JSONB;

-- ============================================================================
-- 3. HELPER: Check if the current user is an admin/manager/staff
--    Uses role_id → roles table join (profiles has NO direct `role` text column)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_staff_or_above()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON r.id = p.role_id
    WHERE p.id = auth.uid()
      AND LOWER(r.name) IN ('admin', 'superadmin', 'super_admin', 'manager', 'staff')
  )
$$;

-- ============================================================================
-- 4. FIX RLS POLICIES — Allow admins and managers to write to products tables
-- ============================================================================

-- ── products ──────────────────────────────────────────────────────────────────
-- Drop any stale policies first so we can cleanly recreate them
DROP POLICY IF EXISTS "Admins and managers can insert products"    ON public.products;
DROP POLICY IF EXISTS "Admins and managers can update products"    ON public.products;
DROP POLICY IF EXISTS "Admins and managers can delete products"    ON public.products;
DROP POLICY IF EXISTS "Admins view all products"                   ON public.products;

-- Staff can INSERT new products
CREATE POLICY "Staff can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_staff_or_above());

-- Staff can UPDATE products
CREATE POLICY "Staff can update products"
  ON public.products FOR UPDATE
  USING (public.is_staff_or_above());

-- Staff can DELETE products
CREATE POLICY "Staff can delete products"
  ON public.products FOR DELETE
  USING (public.is_staff_or_above());

-- Staff can SELECT all products (including DRAFT / ARCHIVED)
-- The existing "Public can view active products" policy handles storefront reads.
CREATE POLICY "Staff can view all products"
  ON public.products FOR SELECT
  USING (public.is_staff_or_above());

-- ── variants ──────────────────────────────────────────────────────────────────
ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active variants"           ON public.variants;
DROP POLICY IF EXISTS "Admins and managers can manage variants"   ON public.variants;

CREATE POLICY "Public can view active variants"
  ON public.variants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage variants"
  ON public.variants FOR ALL
  USING (public.is_staff_or_above())
  WITH CHECK (public.is_staff_or_above());

-- ── product_media ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'product_media' AND table_schema = 'public'
  ) THEN
    EXECUTE 'ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY';

    -- DROP stale policies
    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "Public can view product media" ON public.product_media';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "Admins and managers can manage product media" ON public.product_media';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    EXECUTE $p$
      CREATE POLICY "Public can view product media"
        ON public.product_media FOR SELECT USING (true)
    $p$;

    EXECUTE $p$
      CREATE POLICY "Staff can manage product media"
        ON public.product_media FOR ALL
        USING  (public.is_staff_or_above())
        WITH CHECK (public.is_staff_or_above())
    $p$;
  END IF;
END $$;

-- ── product_seo ───────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'product_seo' AND table_schema = 'public'
  ) THEN
    EXECUTE 'ALTER TABLE public.product_seo ENABLE ROW LEVEL SECURITY';

    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "Public can view product seo" ON public.product_seo';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "Admins and managers can manage product seo" ON public.product_seo';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    EXECUTE $p$
      CREATE POLICY "Public can view product seo"
        ON public.product_seo FOR SELECT USING (true)
    $p$;

    EXECUTE $p$
      CREATE POLICY "Staff can manage product seo"
        ON public.product_seo FOR ALL
        USING  (public.is_staff_or_above())
        WITH CHECK (public.is_staff_or_above())
    $p$;
  END IF;
END $$;

-- ── product_tags ──────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'product_tags' AND table_schema = 'public'
  ) THEN
    EXECUTE 'ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY';

    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "Public can view product tags" ON public.product_tags';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "Admins and managers can manage product tags" ON public.product_tags';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;

    EXECUTE $p$
      CREATE POLICY "Public can view product tags"
        ON public.product_tags FOR SELECT USING (true)
    $p$;

    EXECUTE $p$
      CREATE POLICY "Staff can manage product tags"
        ON public.product_tags FOR ALL
        USING  (public.is_staff_or_above())
        WITH CHECK (public.is_staff_or_above())
    $p$;
  END IF;
END $$;
