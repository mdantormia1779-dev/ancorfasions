-- ==========================================
-- Anchor Fashion - Enterprise SEO, Performance & Search Migrations
-- ==========================================

-- Enable pgvector for semantic search (Gemini AI integration)
CREATE EXTENSION IF NOT EXISTS vector;

-- ==========================================
-- 1. HEADLESS SEO ENGINE
-- ==========================================
CREATE TABLE public.seo_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_path VARCHAR(512) UNIQUE, -- e.g., '/category/womens-ethnic' OR null if tied to entity
    entity_type VARCHAR(50) CHECK (entity_type IN ('PRODUCT', 'CATEGORY', 'BRAND', 'COLLECTION', 'PAGE', 'BLOG_POST')),
    entity_id UUID, -- References the specific item
    meta_title VARCHAR(255),
    meta_description TEXT,
    canonical_url VARCHAR(1024),
    og_image_url VARCHAR(1024),
    robots_directive VARCHAR(100) DEFAULT 'index, follow',
    structured_data JSONB, -- JSON-LD overrides
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT target_or_entity CHECK (target_path IS NOT NULL OR (entity_type IS NOT NULL AND entity_id IS NOT NULL))
);

-- ==========================================
-- 2. URL ROUTING & REDIRECTS
-- ==========================================
CREATE TABLE public.url_redirects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    old_slug VARCHAR(512) UNIQUE NOT NULL,
    new_slug VARCHAR(512) NOT NULL,
    status_code INTEGER DEFAULT 301 CHECK (status_code IN (301, 302, 307, 308, 410)),
    entity_type VARCHAR(50) CHECK (entity_type IN ('PRODUCT', 'CATEGORY', 'BRAND', 'COLLECTION', 'PAGE', 'BLOG_POST')),
    entity_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Function to automatically log a redirect when a product slug changes
CREATE OR REPLACE FUNCTION public.log_product_slug_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.slug IS DISTINCT FROM NEW.slug THEN
        -- Insert the old slug into the redirects table, pointing to the new slug
        INSERT INTO public.url_redirects (old_slug, new_slug, status_code, entity_type, entity_id)
        VALUES ('/product/' || OLD.slug, '/product/' || NEW.slug, 301, 'PRODUCT', NEW.id)
        ON CONFLICT (old_slug) 
        DO UPDATE SET new_slug = EXCLUDED.new_slug, updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_product_slug_change
AFTER UPDATE OF slug ON public.products
FOR EACH ROW EXECUTE PROCEDURE public.log_product_slug_change();


-- ==========================================
-- 3. SEARCH ANALYTICS DATA LAKE
-- ==========================================
CREATE TABLE public.search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable for anonymous users
    session_id VARCHAR(255),
    results_count INTEGER DEFAULT 0,
    clicked_item_id UUID, -- Null if they just searched and left
    clicked_item_type VARCHAR(50) CHECK (clicked_item_type IN ('PRODUCT', 'CATEGORY', 'BRAND', 'COLLECTION')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.search_synonyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    term VARCHAR(100) UNIQUE NOT NULL,
    synonyms JSONB NOT NULL, -- e.g., ["sneakers", "kicks", "running shoes"]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 4. AI SEARCH UPGRADES (PGVECTOR)
-- ==========================================
-- Add vector column to products for semantic matching
ALTER TABLE public.products
ADD COLUMN embedding vector(768); -- 768 is a standard dimension for Gemini embeddings

-- Create an HNSW index on the embedding column for rapid similarity search
CREATE INDEX idx_products_embedding ON public.products USING hnsw (embedding vector_cosine_ops);


-- ==========================================
-- 5. TRIGGERS & RLS
-- ==========================================
CREATE TRIGGER update_seo_metadata_updated_at BEFORE UPDATE ON public.seo_metadata FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_url_redirects_updated_at BEFORE UPDATE ON public.url_redirects FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_search_synonyms_updated_at BEFORE UPDATE ON public.search_synonyms FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.url_redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_synonyms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- SEO Metadata is public read-only
CREATE POLICY "Public can view active seo metadata" ON public.seo_metadata FOR SELECT USING (true);
CREATE POLICY "Public can view active url redirects" ON public.url_redirects FOR SELECT USING (is_active = true);

-- Search Synonyms are public read-only (so the edge API can fetch them for autocomplete)
CREATE POLICY "Public can view search synonyms" ON public.search_synonyms FOR SELECT USING (is_active = true);

-- Anyone (including anon) can insert into search analytics
CREATE POLICY "Anyone can insert search analytics" ON public.search_analytics FOR INSERT WITH CHECK (true);
-- But only authenticated managers/admins can view search analytics
CREATE POLICY "Admins can view search analytics" ON public.search_analytics FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        JOIN public.roles ON profiles.role_id = roles.id 
        WHERE profiles.id = auth.uid() AND roles.name IN ('SUPERADMIN', 'MANAGER', 'MARKETING')
    )
);
