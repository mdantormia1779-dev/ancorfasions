-- ==========================================
-- ENTERPRISE ANALYTICS, BI, & FORECASTING
-- ==========================================

-- 1. Data Marts for BI Dashboards
-- These tables act as materialized rollups or fast-query logs for analytical processing.

CREATE TABLE IF NOT EXISTS public.bi_sales_mart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    category_id UUID,
    brand_id UUID,
    region VARCHAR(100),
    device_type VARCHAR(50),
    total_sales DECIMAL(12,2) DEFAULT 0,
    total_orders INT DEFAULT 0,
    units_sold INT DEFAULT 0,
    refunds DECIMAL(12,2) DEFAULT 0,
    gross_profit DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(date, category_id, brand_id, region, device_type)
);

CREATE TABLE IF NOT EXISTS public.bi_customer_mart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    new_customers INT DEFAULT 0,
    returning_customers INT DEFAULT 0,
    churned_customers INT DEFAULT 0,
    total_active_sessions INT DEFAULT 0,
    cart_abandonment_rate DECIMAL(5,2) DEFAULT 0,
    cac DECIMAL(12,2) DEFAULT 0, -- Customer Acquisition Cost
    cltv DECIMAL(12,2) DEFAULT 0, -- Customer Lifetime Value
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(date)
);

CREATE TABLE IF NOT EXISTS public.bi_inventory_mart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    warehouse_id UUID,
    category_id UUID,
    total_stock_value DECIMAL(12,2) DEFAULT 0,
    fast_moving_items INT DEFAULT 0,
    slow_moving_items INT DEFAULT 0,
    dead_stock_value DECIMAL(12,2) DEFAULT 0,
    stock_turnover_ratio DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(date, warehouse_id, category_id)
);

-- 2. Custom Report Builder Configuration
CREATE TABLE IF NOT EXISTS public.custom_reports_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_name VARCHAR(255) NOT NULL,
    description TEXT,
    dimensions JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g., ["date", "region"]
    metrics JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g., ["total_sales"]
    filters JSONB DEFAULT '{}'::jsonb,
    chart_type VARCHAR(50) DEFAULT 'table',
    is_public BOOLEAN DEFAULT FALSE,
    schedule_cron VARCHAR(50), -- e.g., "0 9 * * 1" for Monday 9AM
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Analytics Alert Rules
CREATE TABLE IF NOT EXISTS public.analytics_alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL, -- e.g., 'cart_abandonment_rate'
    condition_operator VARCHAR(20) NOT NULL, -- e.g., '>', '<', '=='
    threshold_value DECIMAL(12,2) NOT NULL,
    severity VARCHAR(20) DEFAULT 'warning', -- info, warning, critical
    notification_channels JSONB DEFAULT '["email"]'::jsonb, -- email, slack, sms
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.analytics_alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES public.analytics_alert_rules(id) ON DELETE CASCADE,
    triggered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    actual_value DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'new', -- new, acknowledged, resolved
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id)
);

-- 4. AI Forecasting Output Tables
CREATE TABLE IF NOT EXISTS public.ai_sales_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_date DATE NOT NULL,
    predicted_sales DECIMAL(12,2) NOT NULL,
    lower_bound DECIMAL(12,2),
    upper_bound DECIMAL(12,2),
    confidence_score DECIMAL(5,2),
    model_version VARCHAR(50),
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(forecast_date)
);

CREATE TABLE IF NOT EXISTS public.ai_inventory_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL, -- Logical reference to product
    predicted_demand INT NOT NULL,
    suggested_reorder_point INT NOT NULL,
    suggested_reorder_qty INT NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bi_sales_mart_date ON public.bi_sales_mart(date DESC);
CREATE INDEX IF NOT EXISTS idx_bi_customer_mart_date ON public.bi_customer_mart(date DESC);
CREATE INDEX IF NOT EXISTS idx_bi_inventory_mart_date ON public.bi_inventory_mart(date DESC);
CREATE INDEX IF NOT EXISTS idx_custom_reports_owner ON public.custom_reports_config(owner_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_custom_reports_updated_at ON public.custom_reports_config;
CREATE TRIGGER update_custom_reports_updated_at
BEFORE UPDATE ON public.custom_reports_config
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_analytics_alert_rules_updated_at ON public.analytics_alert_rules;
CREATE TRIGGER update_analytics_alert_rules_updated_at
BEFORE UPDATE ON public.analytics_alert_rules
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.bi_sales_mart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_customer_mart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_inventory_mart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_reports_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sales_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_inventory_forecasts ENABLE ROW LEVEL SECURITY;

-- Basic Policies
DROP POLICY IF EXISTS "Staff can view BI sales mart" ON public.bi_sales_mart;
CREATE POLICY "Staff can view BI sales mart" ON public.bi_sales_mart FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Staff can view BI customer mart" ON public.bi_customer_mart;
CREATE POLICY "Staff can view BI customer mart" ON public.bi_customer_mart FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Staff can view BI inventory mart" ON public.bi_inventory_mart;
CREATE POLICY "Staff can view BI inventory mart" ON public.bi_inventory_mart FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Staff can view and manage their custom reports" ON public.custom_reports_config;
CREATE POLICY "Staff can view and manage their custom reports" ON public.custom_reports_config FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Staff can view public reports" ON public.custom_reports_config;
CREATE POLICY "Staff can view public reports" ON public.custom_reports_config FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Staff can view alert rules" ON public.analytics_alert_rules;
CREATE POLICY "Staff can view alert rules" ON public.analytics_alert_rules FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Staff can view alert history" ON public.analytics_alert_history;
CREATE POLICY "Staff can view alert history" ON public.analytics_alert_history FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Staff can view sales forecasts" ON public.ai_sales_forecasts;
CREATE POLICY "Staff can view sales forecasts" ON public.ai_sales_forecasts FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Staff can view inventory forecasts" ON public.ai_inventory_forecasts;
CREATE POLICY "Staff can view inventory forecasts" ON public.ai_inventory_forecasts FOR SELECT USING (auth.role() = 'authenticated');
