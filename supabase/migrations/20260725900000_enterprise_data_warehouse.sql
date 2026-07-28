-- ==========================================
-- ENTERPRISE DATA WAREHOUSE (STAR SCHEMA)
-- ==========================================

-- 1. DIMENSION TABLES
-- ------------------------------------------

-- dim_date (Time Intelligence)
CREATE TABLE IF NOT EXISTS public.dim_date (
    date_key INT PRIMARY KEY, -- e.g., 20260725
    full_date DATE NOT NULL UNIQUE,
    day_of_week INT NOT NULL,
    day_name VARCHAR(20) NOT NULL,
    day_of_month INT NOT NULL,
    day_of_year INT NOT NULL,
    week_of_year INT NOT NULL,
    month_number INT NOT NULL,
    month_name VARCHAR(20) NOT NULL,
    quarter INT NOT NULL,
    year INT NOT NULL,
    is_weekend BOOLEAN NOT NULL,
    is_holiday BOOLEAN DEFAULT FALSE
);

-- dim_customer (Slowly Changing Dimension Type 2)
CREATE TABLE IF NOT EXISTS public.dim_customer (
    customer_sk UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Surrogate Key
    customer_id UUID NOT NULL, -- Natural Key (auth.users id)
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    segment VARCHAR(50) DEFAULT 'New', -- e.g., VIP, Churned, At Risk
    lifetime_value DECIMAL(12,2) DEFAULT 0,
    acquisition_date DATE,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_to TIMESTAMPTZ,
    is_current BOOLEAN DEFAULT TRUE
);

-- dim_product
CREATE TABLE IF NOT EXISTS public.dim_product (
    product_sk UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category_id UUID,
    category_name VARCHAR(100),
    brand_id UUID,
    brand_name VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(20),
    cost_price DECIMAL(10,2) DEFAULT 0,
    retail_price DECIMAL(10,2) DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_to TIMESTAMPTZ,
    is_current BOOLEAN DEFAULT TRUE
);

-- dim_campaign
CREATE TABLE IF NOT EXISTS public.dim_campaign (
    campaign_sk UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID, -- Nullable if organic/no campaign
    campaign_name VARCHAR(255) DEFAULT 'Organic',
    channel VARCHAR(100), -- Email, Social, SMS
    medium VARCHAR(100), -- CPC, Organic
    source VARCHAR(100), -- Google, Facebook
    coupon_code VARCHAR(50),
    discount_percentage DECIMAL(5,2),
    start_date DATE,
    end_date DATE
);

-- dim_location
CREATE TABLE IF NOT EXISTS public.dim_location (
    location_sk UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country VARCHAR(100) DEFAULT 'Bangladesh',
    division VARCHAR(100),
    district VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    UNIQUE(country, division, district, city, postal_code)
);

-- 2. FACT TABLES
-- ------------------------------------------

-- fact_sales
CREATE TABLE IF NOT EXISTS public.fact_sales (
    sales_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_key INT NOT NULL REFERENCES public.dim_date(date_key),
    customer_sk UUID NOT NULL REFERENCES public.dim_customer(customer_sk),
    product_sk UUID NOT NULL REFERENCES public.dim_product(product_sk),
    campaign_sk UUID REFERENCES public.dim_campaign(campaign_sk),
    location_sk UUID REFERENCES public.dim_location(location_sk),
    order_id UUID NOT NULL, -- Logical reference to operational db
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    gross_revenue DECIMAL(12,2) NOT NULL, -- quantity * unit_price
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    net_revenue DECIMAL(12,2) NOT NULL, -- gross - discount - tax
    cogs DECIMAL(12,2) NOT NULL, -- Cost of Goods Sold
    gross_profit DECIMAL(12,2) NOT NULL, -- net_revenue - cogs
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- fact_inventory_movements
CREATE TABLE IF NOT EXISTS public.fact_inventory_movements (
    movement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_key INT NOT NULL REFERENCES public.dim_date(date_key),
    product_sk UUID NOT NULL REFERENCES public.dim_product(product_sk),
    location_sk UUID REFERENCES public.dim_location(location_sk), -- Warehouse Location
    movement_type VARCHAR(50) NOT NULL, -- 'IN', 'OUT', 'ADJUSTMENT', 'RETURN'
    quantity INT NOT NULL, -- Positive for IN, Negative for OUT
    unit_cost DECIMAL(12,2) NOT NULL,
    total_value DECIMAL(12,2) NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- fact_marketing_conversions
CREATE TABLE IF NOT EXISTS public.fact_marketing_conversions (
    conversion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_key INT NOT NULL REFERENCES public.dim_date(date_key),
    campaign_sk UUID NOT NULL REFERENCES public.dim_campaign(campaign_sk),
    customer_sk UUID REFERENCES public.dim_customer(customer_sk), -- Can be null if guest
    event_type VARCHAR(50) NOT NULL, -- 'CLICK', 'SIGNUP', 'PURCHASE'
    conversion_value DECIMAL(12,2) DEFAULT 0, -- Revenue tied to conversion
    device_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. INDEXES & PERFORMANCE
-- ------------------------------------------

CREATE INDEX IF NOT EXISTS idx_fact_sales_date ON public.fact_sales(date_key);
CREATE INDEX IF NOT EXISTS idx_fact_sales_customer ON public.fact_sales(customer_sk);
CREATE INDEX IF NOT EXISTS idx_fact_sales_product ON public.fact_sales(product_sk);
CREATE INDEX IF NOT EXISTS idx_fact_sales_campaign ON public.fact_sales(campaign_sk);

CREATE INDEX IF NOT EXISTS idx_fact_inventory_date ON public.fact_inventory_movements(date_key);
CREATE INDEX IF NOT EXISTS idx_fact_inventory_product ON public.fact_inventory_movements(product_sk);

CREATE INDEX IF NOT EXISTS idx_dim_customer_id ON public.dim_customer(customer_id);
CREATE INDEX IF NOT EXISTS idx_dim_product_sku ON public.dim_product(sku);


-- 4. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------

ALTER TABLE public.dim_date ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_product ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_campaign ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dim_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_marketing_conversions ENABLE ROW LEVEL SECURITY;

-- Analytics users / BI tools read access
DROP POLICY IF EXISTS "Analysts can read dim_date" ON public.dim_date;
CREATE POLICY "Analysts can read dim_date" ON public.dim_date FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Analysts can read dim_customer" ON public.dim_customer;
CREATE POLICY "Analysts can read dim_customer" ON public.dim_customer FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Analysts can read dim_product" ON public.dim_product;
CREATE POLICY "Analysts can read dim_product" ON public.dim_product FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Analysts can read dim_campaign" ON public.dim_campaign;
CREATE POLICY "Analysts can read dim_campaign" ON public.dim_campaign FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Analysts can read dim_location" ON public.dim_location;
CREATE POLICY "Analysts can read dim_location" ON public.dim_location FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Analysts can read fact_sales" ON public.fact_sales;
CREATE POLICY "Analysts can read fact_sales" ON public.fact_sales FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Analysts can read fact_inventory_movements" ON public.fact_inventory_movements;
CREATE POLICY "Analysts can read fact_inventory_movements" ON public.fact_inventory_movements FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Analysts can read fact_marketing_conversions" ON public.fact_marketing_conversions;
CREATE POLICY "Analysts can read fact_marketing_conversions" ON public.fact_marketing_conversions FOR SELECT USING (auth.role() = 'authenticated');
