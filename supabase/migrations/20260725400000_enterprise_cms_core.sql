-- ==========================================
-- ENTERPRISE CMS CORE SCHEMA
-- ==========================================

-- Drop existing generic tables from enterprise_init if they exist to replace with this strongly-typed schema
DROP TABLE IF EXISTS public.banners CASCADE;
DROP TABLE IF EXISTS public.cms_pages CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;

-- 1. Content Status Enum
CREATE TYPE public.content_status AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- ==========================================
-- MEDIA LIBRARY (DAM)
-- ==========================================
CREATE TABLE public.cms_media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    url VARCHAR(1024) NOT NULL,
    size_bytes BIGINT,
    alt_text VARCHAR(255),
    metadata JSONB,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- BLOG MANAGEMENT & TAXONOMY
-- ==========================================
CREATE TABLE public.cms_blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.cms_blog_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.cms_blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    author_id UUID REFERENCES auth.users(id),
    cover_image_id UUID REFERENCES public.cms_media_assets(id),
    status public.content_status DEFAULT 'DRAFT',
    seo_metadata JSONB,
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.cms_post_categories (
    post_id UUID REFERENCES public.cms_blog_posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.cms_blog_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

CREATE TABLE public.cms_post_tags (
    post_id UUID REFERENCES public.cms_blog_posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.cms_blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- ==========================================
-- LANDING PAGE BUILDER
-- ==========================================
CREATE TABLE public.cms_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    template VARCHAR(100) DEFAULT 'default',
    status public.content_status DEFAULT 'DRAFT',
    seo_metadata JSONB,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.cms_page_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES public.cms_pages(id) ON DELETE CASCADE,
    section_type VARCHAR(100) NOT NULL,
    content_json JSONB NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- GLOBAL NAVIGATION & FOOTER
-- ==========================================
CREATE TABLE public.cms_menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(100) UNIQUE NOT NULL, -- e.g. HEADER_MAIN, FOOTER_QUICK_LINKS
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.cms_menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID REFERENCES public.cms_menus(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.cms_menu_items(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    url VARCHAR(1024) NOT NULL,
    icon VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- SUPPORT & LEGAL
-- ==========================================
CREATE TABLE public.cms_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.cms_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_type VARCHAR(100) UNIQUE NOT NULL, -- e.g. PRIVACY, SHIPPING
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    version VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- TRIGGERS
-- ==========================================
CREATE TRIGGER update_cms_blog_posts_updated_at BEFORE UPDATE ON public.cms_blog_posts FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_cms_pages_updated_at BEFORE UPDATE ON public.cms_pages FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_cms_page_blocks_updated_at BEFORE UPDATE ON public.cms_page_blocks FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_cms_menus_updated_at BEFORE UPDATE ON public.cms_menus FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_cms_menu_items_updated_at BEFORE UPDATE ON public.cms_menu_items FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_cms_faqs_updated_at BEFORE UPDATE ON public.cms_faqs FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_cms_policies_updated_at BEFORE UPDATE ON public.cms_policies FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.cms_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_policies ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public can view published blog posts" ON public.cms_blog_posts FOR SELECT USING (status = 'PUBLISHED' AND published_at <= NOW());
CREATE POLICY "Public can view published pages" ON public.cms_pages FOR SELECT USING (status = 'PUBLISHED' AND published_at <= NOW());
CREATE POLICY "Public can view active page blocks" ON public.cms_page_blocks FOR SELECT USING (is_active = true AND page_id IN (SELECT id FROM public.cms_pages WHERE status = 'PUBLISHED' AND published_at <= NOW()));
CREATE POLICY "Public can view blog categories" ON public.cms_blog_categories FOR SELECT USING (true);
CREATE POLICY "Public can view blog tags" ON public.cms_blog_tags FOR SELECT USING (true);
CREATE POLICY "Public can view active menus" ON public.cms_menus FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active menu items" ON public.cms_menu_items FOR SELECT USING (menu_id IN (SELECT id FROM public.cms_menus WHERE is_active = true));
CREATE POLICY "Public can view active faqs" ON public.cms_faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active policies" ON public.cms_policies FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view media assets" ON public.cms_media_assets FOR SELECT USING (true);

-- Allow authenticated users to view draft/review content (could be restricted further by role)
CREATE POLICY "Authenticated users can view all blog posts" ON public.cms_blog_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view all pages" ON public.cms_pages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view all page blocks" ON public.cms_page_blocks FOR SELECT TO authenticated USING (true);
