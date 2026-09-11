-- ============================================================================
-- Anchor Fashion — Prompt 6: Size Charts & Measurements
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.size_charts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false,
    measurements JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraint: A chart is either global (is_default), for a category, or for a product.
ALTER TABLE public.size_charts
  ADD CONSTRAINT chk_size_chart_target 
  CHECK (
    (is_default = true AND category_id IS NULL AND product_id IS NULL) OR
    (is_default = false AND category_id IS NOT NULL AND product_id IS NULL) OR
    (is_default = false AND category_id IS NULL AND product_id IS NOT NULL)
  );

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_size_charts_product_id ON public.size_charts(product_id);
CREATE INDEX IF NOT EXISTS idx_size_charts_category_id ON public.size_charts(category_id);
CREATE INDEX IF NOT EXISTS idx_size_charts_is_default ON public.size_charts(is_default);

-- RLS Policies
ALTER TABLE public.size_charts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view size charts" ON public.size_charts;
CREATE POLICY "Public can view size charts"
  ON public.size_charts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage size charts" ON public.size_charts;
CREATE POLICY "Staff can manage size charts"
  ON public.size_charts FOR ALL
  USING (public.is_staff_or_above())
  WITH CHECK (public.is_staff_or_above());

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_size_charts_updated_at') THEN
    CREATE TRIGGER update_size_charts_updated_at 
    BEFORE UPDATE ON public.size_charts 
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
  END IF;
END $$;
