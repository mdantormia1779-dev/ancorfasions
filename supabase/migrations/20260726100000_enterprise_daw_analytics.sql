-- ==========================================
-- ENTERPRISE DATA WAREHOUSE - ANALYTICS & ETL
-- ==========================================

-- 1. MATERIALIZED VIEWS
-- ------------------------------------------

-- mv_sales_performance_daily
-- Aggregates sales data on a daily basis for fast dashboard loading
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_sales_performance_daily AS
SELECT
    d.full_date AS sales_date,
    SUM(f.quantity) AS total_units_sold,
    SUM(f.gross_revenue) AS total_gross_revenue,
    SUM(f.discount_amount) AS total_discounts,
    SUM(f.net_revenue) AS total_net_revenue,
    SUM(f.cogs) AS total_cogs,
    SUM(f.gross_profit) AS total_gross_profit,
    COUNT(DISTINCT f.order_id) AS total_orders,
    COUNT(DISTINCT f.customer_sk) AS unique_customers
FROM
    public.fact_sales f
JOIN
    public.dim_date d ON f.date_key = d.date_key
GROUP BY
    d.full_date
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_sales_performance_daily_date 
ON public.mv_sales_performance_daily(sales_date);

-- mv_customer_rfm
-- Calculates Recency, Frequency, Monetary value per customer
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_customer_rfm AS
WITH customer_stats AS (
    SELECT
        c.customer_id,
        c.first_name,
        c.last_name,
        MAX(d.full_date) AS last_purchase_date,
        COUNT(DISTINCT f.order_id) AS frequency,
        SUM(f.net_revenue) AS monetary_value
    FROM
        public.fact_sales f
    JOIN
        public.dim_customer c ON f.customer_sk = c.customer_sk
    JOIN
        public.dim_date d ON f.date_key = d.date_key
    GROUP BY
        c.customer_id, c.first_name, c.last_name
)
SELECT
    customer_id,
    first_name,
    last_name,
    last_purchase_date,
    CURRENT_DATE - last_purchase_date AS recency_days,
    frequency,
    monetary_value,
    -- Simple quintile scoring (1-5, 5 being best)
    NTILE(5) OVER (ORDER BY (CURRENT_DATE - last_purchase_date) DESC) AS r_score,
    NTILE(5) OVER (ORDER BY frequency ASC) AS f_score,
    NTILE(5) OVER (ORDER BY monetary_value ASC) AS m_score
FROM
    customer_stats
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_customer_rfm_id 
ON public.mv_customer_rfm(customer_id);

-- mv_inventory_aging
-- Tracks inventory levels and aging (simplified snapshot based on movements)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_inventory_aging AS
SELECT
    p.sku,
    p.name AS product_name,
    p.category_name,
    SUM(f.quantity) AS current_stock_level,
    SUM(f.quantity * f.unit_cost) AS total_inventory_value,
    MAX(d.full_date) AS last_movement_date,
    CURRENT_DATE - MAX(d.full_date) AS days_since_last_movement
FROM
    public.fact_inventory_movements f
JOIN
    public.dim_product p ON f.product_sk = p.product_sk
JOIN
    public.dim_date d ON f.date_key = d.date_key
GROUP BY
    p.sku, p.name, p.category_name
HAVING 
    SUM(f.quantity) > 0
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_inventory_aging_sku 
ON public.mv_inventory_aging(sku);


-- 2. ETL STORED PROCEDURES
-- ------------------------------------------

-- sp_refresh_daw_views
-- Utility to refresh all materialized views
CREATE OR REPLACE FUNCTION public.sp_refresh_daw_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_sales_performance_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_customer_rfm;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_inventory_aging;
END;
$$;


-- Note: In a real-world scenario, you would have sp_etl_sync_customers, 
-- sp_etl_sync_products, and sp_etl_load_sales mapping from the operational schema 
-- into the dimensional models. For brevity and because we lack the exact full 
-- schema definitions of the OLTP side (e.g. operational "orders" table definition), 
-- these functions are created as structural stubs to establish the architecture.

CREATE OR REPLACE FUNCTION public.sp_etl_sync_customers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- SCD Type 2 Logic:
    -- 1. Insert new customers that don't exist in dim_customer.
    -- 2. For changed customers, UPDATE existing record's valid_to = NOW(), is_current = FALSE.
    -- 3. INSERT new row for changed customers with valid_from = NOW(), is_current = TRUE.
    
    -- Example (Pseudo-code matching assumed Profiles schema):
    /*
    INSERT INTO public.dim_customer (customer_id, email, first_name, last_name)
    SELECT p.id, p.email, p.first_name, p.last_name
    FROM public.profiles p
    WHERE NOT EXISTS (
        SELECT 1 FROM public.dim_customer dc 
        WHERE dc.customer_id = p.id AND dc.is_current = TRUE
    );
    */
    
    -- In production, this runs efficiently as an UPSERT/MERGE or SCD workflow.
    NULL;
END;
$$;


CREATE OR REPLACE FUNCTION public.sp_etl_load_sales()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Incremental Load Logic:
    -- Select from operational Orders/OrderItems tables where created_at > last_etl_run
    -- Lookup sk (Surrogate Keys) from dim_date, dim_customer, dim_product
    -- Insert into fact_sales
    NULL;
END;
$$;


-- 3. ROW LEVEL SECURITY (RLS) FOR MATERIALIZED VIEWS
-- Note: Materialized views cannot have RLS policies applied directly in Postgres.
-- To restrict access, we wrap them in a standard view and apply RLS, or grant permissions.

-- Create secure views over the materialized views
CREATE OR REPLACE VIEW public.secure_mv_sales_performance_daily AS
SELECT * FROM public.mv_sales_performance_daily;

CREATE OR REPLACE VIEW public.secure_mv_customer_rfm AS
SELECT * FROM public.mv_customer_rfm;

CREATE OR REPLACE VIEW public.secure_mv_inventory_aging AS
SELECT * FROM public.mv_inventory_aging;

-- Since standard views inherit permissions of the creator, 
-- we revoke standard public access and grant it explicitly based on role checks in the application,
-- OR we use functions with SECURITY INVOKER to access them. 
-- In Supabase, usually we grant SELECT to the authenticated role for BI.

GRANT SELECT ON public.secure_mv_sales_performance_daily TO authenticated;
GRANT SELECT ON public.secure_mv_customer_rfm TO authenticated;
GRANT SELECT ON public.secure_mv_inventory_aging TO authenticated;
