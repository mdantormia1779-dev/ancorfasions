-- ==========================================
-- ENTERPRISE MARKETING, CRM, & GROWTH SYSTEM
-- ==========================================

-- ==========================================
-- 1. LOYALTY TIERS & CUSTOMER METADATA
-- ==========================================

CREATE TABLE public.loyalty_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'SILVER', 'GOLD', 'PLATINUM', 'VIP'
    min_spend DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    points_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    free_shipping BOOLEAN DEFAULT false,
    early_access BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert Default Tiers
INSERT INTO public.loyalty_tiers (name, min_spend, points_multiplier, free_shipping, early_access) VALUES 
('SILVER', 0.00, 1.00, false, false),
('GOLD', 50000.00, 1.50, true, false),
('PLATINUM', 150000.00, 2.00, true, true),
('VIP', 500000.00, 3.00, true, true);

CREATE TABLE public.customer_metadata (
    customer_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    loyalty_tier_id UUID REFERENCES public.loyalty_tiers(id),
    reward_points INTEGER DEFAULT 0,
    lifetime_value DECIMAL(12,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    total_returns INTEGER DEFAULT 0,
    churn_risk_score DECIMAL(3,2) DEFAULT 0.00, -- AI derived: 0.0 to 1.0
    accepts_marketing_email BOOLEAN DEFAULT true,
    accepts_marketing_push BOOLEAN DEFAULT true,
    internal_notes TEXT, -- Visible only to managers
    first_purchase_at TIMESTAMPTZ,
    last_purchase_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_customer_metadata_tier ON public.customer_metadata(loyalty_tier_id);
CREATE INDEX idx_customer_metadata_ltv ON public.customer_metadata(lifetime_value);

-- ==========================================
-- 2. LOYALTY POINTS LEDGER
-- ==========================================

CREATE TABLE public.loyalty_points_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    points INTEGER NOT NULL, -- Positive for earning, Negative for spending/expiring
    reason VARCHAR(100) NOT NULL, -- e.g., 'ORDER_PURCHASE', 'REFERRAL_BONUS', 'REDEMPTION', 'EXPIRED'
    source_order_id UUID, -- Optional, if points are tied to an order
    expires_at TIMESTAMPTZ, -- When these points expire (if positive)
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_loyalty_ledger_customer ON public.loyalty_points_ledger(customer_id);

-- ==========================================
-- 3. CUSTOMER SEGMENTATION
-- ==========================================

CREATE TABLE public.customer_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'High Value Customers', 'Cart Abandoners'
    description TEXT,
    is_dynamic BOOLEAN DEFAULT true, -- If true, populated by AI or cron
    rule_definition JSONB, -- Logic for dynamic segments
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.customer_segment_members (
    segment_id UUID REFERENCES public.customer_segments(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    added_by VARCHAR(50) DEFAULT 'SYSTEM', -- SYSTEM, AI, or MANAGER_ID
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (segment_id, customer_id)
);

-- ==========================================
-- 4. COUPON ENGINE
-- ==========================================

ALTER TABLE public.coupons 
ADD COLUMN per_user_limit INTEGER DEFAULT 1,
ADD COLUMN target_segment_id UUID REFERENCES public.customer_segments(id),
ADD COLUMN target_tier_id UUID REFERENCES public.loyalty_tiers(id);

CREATE TABLE public.coupon_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    order_id UUID NOT NULL, -- Hardcoded to UUID to avoid circular ref with orders table for now
    discount_applied DECIMAL(12,2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_coupon_usages_customer ON public.coupon_usages(customer_id);
CREATE INDEX idx_coupon_usages_coupon ON public.coupon_usages(coupon_id);

-- ==========================================
-- 5. REFERRAL SYSTEM
-- ==========================================

CREATE TABLE public.referral_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    code VARCHAR(20) UNIQUE NOT NULL,
    clicks INTEGER DEFAULT 0,
    successful_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    referee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE, -- The new customer
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FRAUD')),
    reward_issued BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);

-- ==========================================
-- 6. CAMPAIGN MANAGEMENT (EMAIL / PUSH)
-- ==========================================

CREATE TABLE public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('EMAIL', 'PUSH', 'SMS')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED')),
    target_segment_id UUID REFERENCES public.customer_segments(id),
    subject_line VARCHAR(255),
    content_body TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ,
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    revenue_generated DECIMAL(12,2) DEFAULT 0.00,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.marketing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED')),
    event_time TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_marketing_logs_campaign ON public.marketing_logs(campaign_id);
CREATE INDEX idx_marketing_logs_customer ON public.marketing_logs(customer_id);

-- ==========================================
-- 7. EVENT TRACKING & ANALYTICS (DATA LAYER)
-- ==========================================

CREATE TABLE public.tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Null if guest
    session_id VARCHAR(255) NOT NULL,
    event_name VARCHAR(100) NOT NULL, -- e.g., 'page_view', 'add_to_cart', 'begin_checkout'
    url VARCHAR(1024),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(255),
    event_data JSONB, -- Stores product IDs, values, etc.
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_tracking_events_customer ON public.tracking_events(customer_id);
CREATE INDEX idx_tracking_events_name ON public.tracking_events(event_name);
CREATE INDEX idx_tracking_events_created_at ON public.tracking_events(created_at);

-- ==========================================
-- TRIGGERS
-- ==========================================

CREATE TRIGGER update_loyalty_tiers_updated_at
BEFORE UPDATE ON public.loyalty_tiers
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_customer_metadata_updated_at
BEFORE UPDATE ON public.customer_metadata
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_customer_segments_updated_at
BEFORE UPDATE ON public.customer_segments
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Trigger for coupons already exists in previous migration

CREATE TRIGGER update_marketing_campaigns_updated_at
BEFORE UPDATE ON public.marketing_campaigns
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segment_members ENABLE ROW LEVEL SECURITY;
-- RLS for coupons already enabled in previous migration
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Customers can read loyalty tiers
CREATE POLICY "Anyone can view loyalty tiers" ON public.loyalty_tiers FOR SELECT USING (true);

-- Customers can view their own metadata
CREATE POLICY "Customers can view their own metadata" ON public.customer_metadata 
FOR SELECT USING (auth.uid() = customer_id);

-- Customers can view their own points ledger
CREATE POLICY "Customers can view their own points ledger" ON public.loyalty_points_ledger 
FOR SELECT USING (auth.uid() = customer_id);

-- Customers can view their own referral code
CREATE POLICY "Customers can view their own referral code" ON public.referral_codes 
FOR SELECT USING (auth.uid() = customer_id);

-- Tracking events can be inserted by authenticated customers or anonymous users via Edge Functions
-- But selecting is restricted to managers.
CREATE POLICY "Users can insert own tracking events" ON public.tracking_events 
FOR INSERT WITH CHECK (auth.uid() = customer_id OR customer_id IS NULL);

-- Managers can do everything (simplified for enterprise role)
CREATE POLICY "Managers have full access to loyalty_tiers" ON public.loyalty_tiers FOR ALL USING (public.has_permission('manage_marketing'));
CREATE POLICY "Managers have full access to customer_metadata" ON public.customer_metadata FOR ALL USING (public.has_permission('manage_marketing'));
CREATE POLICY "Managers have full access to points_ledger" ON public.loyalty_points_ledger FOR ALL USING (public.has_permission('manage_marketing'));
CREATE POLICY "Managers have full access to segments" ON public.customer_segments FOR ALL USING (public.has_permission('manage_marketing'));
CREATE POLICY "Managers have full access to segment_members" ON public.customer_segment_members FOR ALL USING (public.has_permission('manage_marketing'));
CREATE POLICY "Managers have full access to coupons" ON public.coupons FOR ALL USING (public.has_permission('manage_marketing'));
CREATE POLICY "Managers have full access to coupon_usages" ON public.coupon_usages FOR ALL USING (public.has_permission('manage_marketing'));
CREATE POLICY "Managers have full access to campaigns" ON public.marketing_campaigns FOR ALL USING (public.has_permission('manage_marketing'));
CREATE POLICY "Managers have full access to tracking_events" ON public.tracking_events FOR ALL USING (public.has_permission('manage_marketing'));

-- ==========================================
-- ADD MARKETING PERMISSION
-- ==========================================
INSERT INTO public.permissions (action, description) VALUES
('manage_marketing', 'Can manage campaigns, CRM, loyalty, and coupons')
ON CONFLICT (action) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name IN ('SUPERADMIN', 'MARKETING') AND p.action = 'manage_marketing'
ON CONFLICT DO NOTHING;
