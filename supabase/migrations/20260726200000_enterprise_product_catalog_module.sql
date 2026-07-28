-- ==========================================
-- Anchor Fashion - Enterprise Product Catalog Module Upgrade
-- ==========================================

-- ==========================================
-- 1. EXTEND PRODUCTS TABLE
-- ==========================================
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS short_description VARCHAR(500),
ADD COLUMN IF NOT EXISTS care_instructions TEXT,
ADD COLUMN IF NOT EXISTS country_of_origin VARCHAR(100),
ADD COLUMN IF NOT EXISTS warranty VARCHAR(255),
ADD COLUMN IF NOT EXISTS material VARCHAR(255),
ADD COLUMN IF NOT EXISTS barcode VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE;

-- ==========================================
-- 2. TAGS & PRODUCT TAGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.product_tags (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

-- ==========================================
-- 3. PRODUCT SEO TABLE
-- ==========================================
-- Extended SEO metadata beyond the basic title and description
CREATE TABLE IF NOT EXISTS public.product_seo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE UNIQUE NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    canonical_url VARCHAR(1024),
    og_title VARCHAR(255),
    og_description TEXT,
    og_image_url VARCHAR(1024),
    twitter_card_type VARCHAR(50) DEFAULT 'summary_large_image',
    structured_data JSONB, -- JSON-LD
    keywords TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 4. PRODUCT AUDIT LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.product_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Null if system generated
    action VARCHAR(50) NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE'
    changes JSONB, -- Record of what changed { "field_name": { "old": "X", "new": "Y" } }
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 5. TRIGGERS
-- ==========================================
-- Update timestamps
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_product_seo_updated_at BEFORE UPDATE ON public.product_seo FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Audit log trigger function
CREATE OR REPLACE FUNCTION public.log_product_changes()
RETURNS TRIGGER AS $$
DECLARE
    changed_fields JSONB;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Basic jsonb comparison (this is a simplified approach, a robust one would compare all fields)
        changed_fields := jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        );
        INSERT INTO public.product_audit_logs (product_id, user_id, action, changes)
        VALUES (NEW.id, auth.uid(), 'UPDATE', changed_fields);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.product_audit_logs (product_id, user_id, action, changes)
        VALUES (NEW.id, auth.uid(), 'CREATE', jsonb_build_object('new', to_jsonb(NEW)));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.product_audit_logs (product_id, user_id, action, changes)
        VALUES (OLD.id, auth.uid(), 'DELETE', jsonb_build_object('old', to_jsonb(OLD)));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_product_changes
AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW EXECUTE PROCEDURE public.log_product_changes();

-- ==========================================
-- 6. INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);

-- ==========================================
-- 7. RLS (ROW LEVEL SECURITY)
-- ==========================================
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_audit_logs ENABLE ROW LEVEL SECURITY;

-- Tags are readable by everyone, modifiable by managers/admins
CREATE POLICY "Tags are readable by all" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Tags are modifiable by managers" ON public.tags FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role_id IN (SELECT id FROM public.roles WHERE name IN ('SUPERADMIN', 'MANAGER')))
);

-- Product Tags follow similar rules
CREATE POLICY "Product tags readable by all" ON public.product_tags FOR SELECT USING (true);
CREATE POLICY "Product tags modifiable by managers" ON public.product_tags FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role_id IN (SELECT id FROM public.roles WHERE name IN ('SUPERADMIN', 'MANAGER')))
);

-- Product SEO is readable by everyone, modifiable by managers/admins
CREATE POLICY "Product SEO is readable by all" ON public.product_seo FOR SELECT USING (true);
CREATE POLICY "Product SEO is modifiable by managers" ON public.product_seo FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role_id IN (SELECT id FROM public.roles WHERE name IN ('SUPERADMIN', 'MANAGER')))
);

-- Audit logs are ONLY readable by managers/admins
CREATE POLICY "Audit logs readable by managers" ON public.product_audit_logs FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role_id IN (SELECT id FROM public.roles WHERE name IN ('SUPERADMIN', 'MANAGER')))
);
-- Note: Inserts into audit logs happen via SECURITY DEFINER trigger.
