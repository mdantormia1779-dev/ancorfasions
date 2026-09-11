-- ============================================================================
-- Migration: 20260910300000_catalog_performance_indexes.sql
-- High-Traffic & Flash Sale Catalog Query Optimization Indexes
-- Target Load: 10,000+ daily visitors, high concurrency read throughput
-- ============================================================================

-- 1. Optimized Partial Index for Storefront Active Product Listing & New Arrivals
-- Eliminates table scans when sorting active storefront products by newest first
CREATE INDEX IF NOT EXISTS idx_products_active_created_at
  ON public.products (created_at DESC)
  WHERE status = 'ACTIVE' AND deleted_at IS NULL;

-- 2. Optimized Partial Index for Homepage Featured Products
-- High-traffic homepage query filtering exclusively for active featured products
CREATE INDEX IF NOT EXISTS idx_products_active_featured
  ON public.products (created_at DESC)
  WHERE status = 'ACTIVE' AND deleted_at IS NULL AND is_featured = true;

-- 3. Composite Partial Index for Category Filtered Product Browsing
-- Speeds up /products?category=xyz and category landing pages
CREATE INDEX IF NOT EXISTS idx_products_active_category_created
  ON public.products (category_id, created_at DESC)
  WHERE status = 'ACTIVE' AND deleted_at IS NULL;

-- 4. Composite Partial Index for Brand Filtered Product Browsing
-- Speeds up /products?brand=xyz
CREATE INDEX IF NOT EXISTS idx_products_active_brand_created
  ON public.products (brand_id, created_at DESC)
  WHERE status = 'ACTIVE' AND deleted_at IS NULL;

-- 5. Partial Index for Active Categories Taxonomy Ordering
-- Speeds up navigation menus, mobile drawer, and category lists
CREATE INDEX IF NOT EXISTS idx_categories_active_display_order
  ON public.categories (display_order ASC)
  WHERE is_active = true;



-- 7. Product Media Ordering Index
-- Speeds up product card and PDP media resolution
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_media' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_product_media_product_order
      ON public.product_media (product_id, display_order ASC);
  END IF;
END $$;

-- 8. Index-Only Scan Acceleration for Variant Stock Aggregations
-- Allows PostgreSQL to compute total available stock across variants directly from index tree
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_levels' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_inventory_levels_variant_stock
      ON public.inventory_levels (variant_id, quantity_available);
  END IF;
END $$;
