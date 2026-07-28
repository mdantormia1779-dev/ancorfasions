-- ==========================================
-- ENTERPRISE STORAGE & SEED DATA MIGRATION
-- ==========================================

-- ==========================================
-- 1. STORAGE CONFIGURATION
-- ==========================================

-- Insert Buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('products', 'products', true),
('categories', 'categories', true),
('brands', 'brands', true),
('users', 'users', true),
('avatars', 'avatars', true),
('banners', 'banners', true),
('blog_images', 'blog_images', true),
('cms', 'cms', true),
('invoices', 'invoices', false),
('documents', 'documents', false),
('reports', 'reports', false),
('ai_assets', 'ai_assets', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies (Example for public buckets)
CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Public Access Categories" ON storage.objects FOR SELECT USING (bucket_id = 'categories');
CREATE POLICY "Public Access Brands" ON storage.objects FOR SELECT USING (bucket_id = 'brands');
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public Access Banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Public Access Blog Images" ON storage.objects FOR SELECT USING (bucket_id = 'blog_images');
CREATE POLICY "Public Access CMS" ON storage.objects FOR SELECT USING (bucket_id = 'cms');

-- ==========================================
-- 2. CONFIGURATION TABLES (GEOGRAPHY & LOGISTICS)
-- ==========================================

-- Countries
CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(2) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Divisions / States
CREATE TABLE IF NOT EXISTS public.divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(country_id, name)
);

-- Delivery Zones
CREATE TABLE IF NOT EXISTS public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division_id UUID REFERENCES public.divisions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    base_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Courier Providers
CREATE TABLE IF NOT EXISTS public.courier_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    tracking_url_template TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Payment Methods
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'CASH_ON_DELIVERY', 'CREDIT_CARD', 'MOBILE_BANKING'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Read Policies (Public read)
CREATE POLICY "Allow public read access on countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Allow public read access on divisions" ON public.divisions FOR SELECT USING (true);
CREATE POLICY "Allow public read access on delivery_zones" ON public.delivery_zones FOR SELECT USING (true);
CREATE POLICY "Allow public read access on courier_providers" ON public.courier_providers FOR SELECT USING (true);
CREATE POLICY "Allow public read access on payment_methods" ON public.payment_methods FOR SELECT USING (true);

-- ==========================================
-- 3. SEED DATA
-- ==========================================

-- Seed Countries
INSERT INTO public.countries (code, name) VALUES 
('BD', 'Bangladesh')
ON CONFLICT (code) DO NOTHING;

-- Seed Divisions (Bangladesh)
INSERT INTO public.divisions (country_id, name) 
SELECT id, 'Dhaka' FROM public.countries WHERE code = 'BD'
ON CONFLICT DO NOTHING;
INSERT INTO public.divisions (country_id, name) 
SELECT id, 'Chattogram' FROM public.countries WHERE code = 'BD'
ON CONFLICT DO NOTHING;
INSERT INTO public.divisions (country_id, name) 
SELECT id, 'Sylhet' FROM public.countries WHERE code = 'BD'
ON CONFLICT DO NOTHING;

-- Seed Delivery Zones (Inside Dhaka vs Outside Dhaka)
INSERT INTO public.delivery_zones (division_id, name, base_charge)
SELECT id, 'Inside Dhaka', 60.00 FROM public.divisions WHERE name = 'Dhaka'
ON CONFLICT DO NOTHING;
INSERT INTO public.delivery_zones (division_id, name, base_charge)
SELECT id, 'Outside Dhaka (Hub)', 100.00 FROM public.divisions WHERE name = 'Dhaka'
ON CONFLICT DO NOTHING;
INSERT INTO public.delivery_zones (division_id, name, base_charge)
SELECT id, 'Outside Dhaka (Sadar)', 120.00 FROM public.divisions WHERE name = 'Chattogram'
ON CONFLICT DO NOTHING;

-- Seed Courier Providers
INSERT INTO public.courier_providers (name, tracking_url_template) VALUES 
('Pathao', 'https://pathao.com/tracking?consignment_id={tracking_number}'),
('Steadfast', 'https://steadfast.com.bd/tracking?consignment_id={tracking_number}'),
('RedX', 'https://redx.com.bd/track-parcel/?trackingId={tracking_number}')
ON CONFLICT (name) DO NOTHING;

-- Seed Payment Methods
INSERT INTO public.payment_methods (code, name, type) VALUES 
('COD', 'Cash on Delivery', 'CASH_ON_DELIVERY'),
('BKASH', 'bKash', 'MOBILE_BANKING'),
('NAGAD', 'Nagad', 'MOBILE_BANKING'),
('SSLCOMMERZ', 'SSLCommerz', 'PAYMENT_GATEWAY')
ON CONFLICT (code) DO NOTHING;
