-- ============================================================================
-- Dashboard BI Views for new widgets
-- ============================================================================

BEGIN;

-- 1. Top Sellers View (Last 30 days)
CREATE OR REPLACE VIEW public.bi_top_sellers WITH (security_invoker = on) AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    c.name as category_name,
    p.base_price as price,
    COALESCE(SUM(oi.quantity), 0) as sold,
    COALESCE(SUM(oi.line_total), 0) as earnings,
    (SELECT url_webp FROM public.product_media pm WHERE pm.product_id = p.id AND media_type = 'IMAGE' ORDER BY created_at ASC LIMIT 1) as image_url
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
JOIN public.order_items oi ON p.id = oi.product_id
JOIN public.orders o ON oi.order_id = o.id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
  AND o.status NOT IN ('draft', 'cancelled', 'failed')
GROUP BY p.id, p.name, c.name, p.base_price
ORDER BY sold DESC
LIMIT 5;

-- 2. Revenue By Category View (Last 30 days)
CREATE OR REPLACE VIEW public.bi_revenue_by_category WITH (security_invoker = on) AS
SELECT 
    c.name as category_name,
    SUM(oi.line_total) as total_revenue
FROM public.categories c
JOIN public.products p ON p.category_id = c.id
JOIN public.order_items oi ON oi.product_id = p.id
JOIN public.orders o ON o.id = oi.order_id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
  AND o.status NOT IN ('draft', 'cancelled', 'failed')
GROUP BY c.id, c.name
ORDER BY total_revenue DESC;

-- 3. Recent Customers View
CREATE OR REPLACE VIEW public.bi_recent_customers WITH (security_invoker = on) AS
SELECT DISTINCT ON (u.id)
    u.id as user_id,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.raw_user_meta_data->>'avatar_url' as avatar_url,
    o.id as latest_order_id,
    o.status as latest_order_status,
    o.created_at as last_order_date
FROM auth.users u
JOIN public.orders o ON o.customer_id = u.id
ORDER BY u.id, o.created_at DESC;

-- 4. User Locations View (Grouped by Country)
CREATE OR REPLACE VIEW public.bi_user_locations WITH (security_invoker = on) AS
SELECT 
    country,
    COUNT(DISTINCT customer_id) as user_count
FROM public.customer_addresses
WHERE is_default_shipping = true
GROUP BY country
ORDER BY user_count DESC;

COMMIT;
