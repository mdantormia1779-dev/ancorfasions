-- ==============================================================================
-- Enterprise CMS & Website Builder Schema
-- Phase 10: Anchor Fashion Enterprise E-commerce Platform
-- ==============================================================================

BEGIN;

-- Drop existing tables and types from earlier phases to avoid conflicts
DROP TABLE IF EXISTS public.cms_pages CASCADE;
DROP TABLE IF EXISTS public.cms_page_blocks CASCADE;
DROP TABLE IF EXISTS public.cms_blog_posts CASCADE;
DROP TABLE IF EXISTS public.cms_blogs CASCADE;
DROP TABLE IF EXISTS public.cms_post_categories CASCADE;
DROP TABLE IF EXISTS public.cms_post_tags CASCADE;
DROP TABLE IF EXISTS public.cms_blog_categories CASCADE;
DROP TABLE IF EXISTS public.cms_blog_tags CASCADE;
DROP TABLE IF EXISTS public.cms_media_assets CASCADE;
DROP TABLE IF EXISTS public.cms_media CASCADE;
DROP TABLE IF EXISTS public.cms_menus CASCADE;
DROP TABLE IF EXISTS public.cms_menu_items CASCADE;
DROP TABLE IF EXISTS public.cms_faqs CASCADE;
DROP TABLE IF EXISTS public.cms_policies CASCADE;
DROP TYPE IF EXISTS public.content_status CASCADE;

-- 1. CMS Pages Table (Homepage, Landing Pages, Static Pages)
CREATE TABLE IF NOT EXISTS public.cms_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('homepage', 'landing_page', 'static_page', 'blog_index')),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived')),
    content_blocks JSONB DEFAULT '[]'::jsonb,
    seo_metadata JSONB DEFAULT '{}'::jsonb,
    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_cms_pages_slug ON public.cms_pages(slug);
CREATE INDEX idx_cms_pages_status ON public.cms_pages(status);

-- 2. CMS Page Versions (For History & Rollback)
CREATE TABLE IF NOT EXISTS public.cms_page_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES public.cms_pages(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    content_blocks JSONB NOT NULL,
    seo_metadata JSONB,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cms_page_versions_page_id ON public.cms_page_versions(page_id);

-- 3. CMS Blogs Table
CREATE TABLE IF NOT EXISTS public.cms_blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT, -- or markdown/jsonb depending on editor
    content_blocks JSONB DEFAULT '[]'::jsonb, -- If using block editor for blogs
    featured_image_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived')),
    author_id UUID REFERENCES auth.users(id),
    category_id UUID, -- Assume a categories table exists or create one
    seo_metadata JSONB DEFAULT '{}'::jsonb,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cms_blogs_slug ON public.cms_blogs(slug);

-- 4. CMS Blog Categories & Tags
CREATE TABLE IF NOT EXISTS public.cms_blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.cms_blog_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cms_blog_tag_relations (
    blog_id UUID REFERENCES public.cms_blogs(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.cms_blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (blog_id, tag_id)
);

-- Alter cms_blogs to reference category
ALTER TABLE public.cms_blogs
    ADD CONSTRAINT fk_cms_blogs_category FOREIGN KEY (category_id) REFERENCES public.cms_blog_categories(id) ON DELETE SET NULL;

-- 5. CMS Media Library
CREATE TABLE IF NOT EXISTS public.cms_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- image/jpeg, video/mp4, etc.
    file_size_bytes BIGINT NOT NULL,
    alt_text VARCHAR(255),
    folder_path VARCHAR(255) DEFAULT '/',
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cms_media_folder ON public.cms_media(folder_path);

-- 6. CMS Menus
CREATE TABLE IF NOT EXISTS public.cms_menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- Header, Footer, MegaMenu
    location VARCHAR(50) UNIQUE NOT NULL,
    menu_structure JSONB NOT NULL DEFAULT '[]'::jsonb, -- Hierarchical JSON for menu items
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CMS Banners & Announcements
CREATE TABLE IF NOT EXISTS public.cms_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('hero', 'popup', 'sidebar', 'announcement_bar')),
    content TEXT,
    media_url TEXT,
    link_url TEXT,
    target_audience VARCHAR(50) DEFAULT 'all',
    status VARCHAR(50) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'scheduled')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cms_banners_active ON public.cms_banners(status, start_date, end_date);

-- 8. CMS SEO Overrides & Redirects
CREATE TABLE IF NOT EXISTS public.cms_seo_redirects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_path VARCHAR(255) UNIQUE NOT NULL,
    target_path VARCHAR(255) NOT NULL,
    redirect_type INT NOT NULL DEFAULT 301 CHECK (redirect_type IN (301, 302)),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_banners ENABLE ROW LEVEL SECURITY;

-- Create Policies (Admin & Editors have full access, Public has read-only to published content)
CREATE POLICY "Admins and Editors have full access to pages" ON public.cms_pages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name IN ('SUPERADMIN', 'MANAGER', 'MARKETING')
        )
    );

CREATE POLICY "Public can view published pages" ON public.cms_pages
    FOR SELECT
    USING (status = 'published' AND deleted_at IS NULL);

-- Apply similar policies to blogs, menus, banners
CREATE POLICY "Public can view published blogs" ON public.cms_blogs
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view active banners" ON public.cms_banners
    FOR SELECT USING (status = 'active');

CREATE POLICY "Public can view menus" ON public.cms_menus
    FOR SELECT USING (true);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cms_pages_modtime
    BEFORE UPDATE ON public.cms_pages
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_cms_blogs_modtime
    BEFORE UPDATE ON public.cms_blogs
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

COMMIT;
