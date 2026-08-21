-- ============================================================================
-- Security Patch: Set security_invoker = on for all views
-- This prevents the "auth_users_exposed" vulnerability in Supabase
-- ============================================================================

BEGIN;

ALTER VIEW public.bi_top_sellers SET (security_invoker = on);
ALTER VIEW public.bi_revenue_by_category SET (security_invoker = on);
ALTER VIEW public.bi_recent_customers SET (security_invoker = on);
ALTER VIEW public.bi_user_locations SET (security_invoker = on);

ALTER VIEW public.v_shipments_summary SET (security_invoker = on);
ALTER VIEW public.v_delivery_analytics SET (security_invoker = on);
ALTER VIEW public.v_rto_summary SET (security_invoker = on);

ALTER VIEW public.secure_mv_sales_performance_daily SET (security_invoker = on);
ALTER VIEW public.secure_mv_customer_rfm SET (security_invoker = on);
ALTER VIEW public.secure_mv_inventory_aging SET (security_invoker = on);

COMMIT;
