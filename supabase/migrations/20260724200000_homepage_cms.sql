-- ==========================================
-- HOMEPAGE CMS SCHEMA
-- ==========================================

-- Drop existing generic tables from enterprise_init if they exist to replace with this strongly-typed schema
DROP TABLE IF EXISTS public.homepage_featured_products CASCADE;
DROP TABLE IF EXISTS public.homepage_featured_categories CASCADE;
DROP TABLE IF EXISTS public.homepage_promotions CASCADE;
DROP TABLE IF EXISTS public.homepage_hero CASCADE;
DROP TABLE IF EXISTS public.homepage_sections CASCADE;

-- 1. Homepage Sections (Master Table)
CREATE TABLE public.homepage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN ('HERO', 'PROMO', 'CATEGORY_GRID', 'PRODUCT_GRID', 'TRUST_BAR', 'SOCIAL_PROOF')),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Hero Section Configurations
CREATE TABLE public.homepage_hero (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES public.homepage_sections(id) ON DELETE CASCADE UNIQUE,
    media_type VARCHAR(20) DEFAULT 'IMAGE' CHECK (media_type IN ('IMAGE', 'VIDEO')),
    media_url VARCHAR(1024) NOT NULL,
    headline VARCHAR(255),
    subheadline TEXT,
    cta_text VARCHAR(100),
    cta_url VARCHAR(255),
    overlay_opacity DECIMAL(3,2) DEFAULT 0.50,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Promotional Banners
CREATE TABLE public.homepage_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
    image_desktop VARCHAR(1024) NOT NULL,
    image_mobile VARCHAR(1024),
    title VARCHAR(255),
    description TEXT,
    cta_text VARCHAR(100),
    cta_url VARCHAR(255),
    bg_color VARCHAR(50),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Featured Categories (Links Sections to Categories)
CREATE TABLE public.homepage_featured_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(section_id, category_id)
);

-- 5. Featured Products (Links Sections to Products)
CREATE TABLE public.homepage_featured_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(section_id, product_id)
);

-- ==========================================
-- TRIGGERS
-- ==========================================
CREATE TRIGGER update_homepage_sections_updated_at
BEFORE UPDATE ON public.homepage_sections
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_homepage_hero_updated_at
BEFORE UPDATE ON public.homepage_hero
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_homepage_promotions_updated_at
BEFORE UPDATE ON public.homepage_promotions
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_featured_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_featured_products ENABLE ROW LEVEL SECURITY;

-- Public can read active sections and their content
CREATE POLICY "Public can view active homepage sections" ON public.homepage_sections
FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view hero content" ON public.homepage_hero
FOR SELECT USING (
    section_id IN (SELECT id FROM public.homepage_sections WHERE is_active = true)
);

CREATE POLICY "Public can view active promotions" ON public.homepage_promotions
FOR SELECT USING (
    section_id IN (SELECT id FROM public.homepage_sections WHERE is_active = true)
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
);

CREATE POLICY "Public can view featured categories" ON public.homepage_featured_categories
FOR SELECT USING (
    section_id IN (SELECT id FROM public.homepage_sections WHERE is_active = true)
);

CREATE POLICY "Public can view featured products" ON public.homepage_featured_products
FOR SELECT USING (
    section_id IN (SELECT id FROM public.homepage_sections WHERE is_active = true)
);
