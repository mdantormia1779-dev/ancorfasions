-- Storefront Setup SQL Script

-- 1. Create store_products table
CREATE TABLE IF NOT EXISTS public.store_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    sale_price NUMERIC(10, 2),
    category TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    description TEXT,
    sizes JSONB,
    colors JSONB,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create customer_orders table
CREATE TABLE IF NOT EXISTS public.customer_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_address TEXT NOT NULL,
    city TEXT NOT NULL,
    payment_method TEXT NOT NULL, -- 'COD', 'bKash', 'Nagad', 'Card'
    payment_status TEXT NOT NULL DEFAULT 'Pending',
    total_amount NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Processing',
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create customer_wishlist table
CREATE TABLE IF NOT EXISTS public.customer_wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.store_products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 4. Ensure profiles table supports 'customer' role (Assuming profiles table exists)
-- This might need adjusting based on the actual profiles table schema, but we'll add a check/update just in case
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        -- We just assume it's a text field or enum that supports 'customer'.
        -- If it's an ENUM we might need to ALTER TYPE, assuming TEXT for now.
        NULL;
    END IF;
END $$;

-- 5. Create registration_otps table with proper indexes and RLS
CREATE TABLE IF NOT EXISTS public.registration_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_registration_otps_email ON public.registration_otps(email);

-- Enable RLS and add basic policies (Service Role can bypass RLS, we want to allow insert/select from API)
ALTER TABLE public.registration_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_wishlist ENABLE ROW LEVEL SECURITY;

-- Allow public read access to store_products
CREATE POLICY "Public profiles are viewable by everyone" ON public.store_products
    FOR SELECT USING (true);

-- Allow authenticated users to view/manage their own wishlists
CREATE POLICY "Users can manage their own wishlist" ON public.customer_wishlist
    FOR ALL USING (auth.uid() = user_id);

-- Allow inserting orders (this might be via an API using service role, or we can allow public insert if guest checkout)
CREATE POLICY "Anyone can insert orders" ON public.customer_orders
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own orders (we'd need a user_id on customer_orders to do this properly, 
-- but for guest checkout they might not have an ID. For now, allow select if they are the owner)
-- Adding user_id to customer_orders for optional association
ALTER TABLE public.customer_orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE POLICY "Users can view their own orders" ON public.customer_orders
    FOR SELECT USING (auth.uid() = user_id);

-- Note: The registration_otps table should probably only be accessed by a secure server API
-- using the service_role key, so we don't necessarily need public policies for it.
