-- ==========================================
-- EXECUTIVE DASHBOARD & BI SCHEMA
-- ==========================================

-- 1. Admin Dashboard Preferences
CREATE TABLE public.admin_dashboard_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'system',
    layout_config JSONB DEFAULT '{}'::jsonb,
    favorite_kpis JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(admin_id)
);

-- 2. BI Daily Revenue Rollup (Summary table for fast dashboard loading)
CREATE TABLE public.bi_daily_revenue_rollup (
    date DATE PRIMARY KEY,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_orders INT DEFAULT 0,
    total_profit DECIMAL(12,2) DEFAULT 0,
    total_refunds DECIMAL(12,2) DEFAULT 0,
    aov DECIMAL(12,2) DEFAULT 0,
    new_customers INT DEFAULT 0,
    returning_customers INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. AI Business Insights
CREATE TABLE public.ai_business_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    metrics JSONB,
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    valid_until TIMESTAMPTZ,
    is_read BOOLEAN DEFAULT FALSE
);

-- 4. Executive Alerts
CREATE TABLE public.executive_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id)
);

-- 5. Executive Approvals
CREATE TABLE public.executive_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    entity_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    payload JSONB
);

-- 6. Security Audit Logs
CREATE TABLE public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    ip_address INET,
    user_agent TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_bi_daily_rollup_date ON public.bi_daily_revenue_rollup(date DESC);
CREATE INDEX idx_ai_insights_type ON public.ai_business_insights(insight_type, generated_at DESC);
CREATE INDEX idx_executive_alerts_status ON public.executive_alerts(is_resolved, severity);
CREATE INDEX idx_executive_approvals_status ON public.executive_approvals(status);
CREATE INDEX idx_security_audit_logs_actor ON public.security_audit_logs(actor_id, created_at DESC);

-- ==========================================
-- TRIGGERS
-- ==========================================
CREATE TRIGGER update_admin_preferences_updated_at
BEFORE UPDATE ON public.admin_dashboard_preferences
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_bi_daily_rollup_updated_at
BEFORE UPDATE ON public.bi_daily_revenue_rollup
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.admin_dashboard_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bi_daily_revenue_rollup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_business_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: In a real enterprise system, a custom auth claim like 'role' = 'MAIN_ADMIN' would be used.
-- For this schema, we use 'authenticated' and rely on application-level or more advanced claim checks.

CREATE POLICY "Admins can view and edit their own preferences" 
ON public.admin_dashboard_preferences FOR ALL 
USING (auth.uid() = admin_id);

CREATE POLICY "Authenticated users can view BI rollups" 
ON public.bi_daily_revenue_rollup FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view AI insights" 
ON public.ai_business_insights FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view alerts" 
ON public.executive_alerts FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage approvals" 
ON public.executive_approvals FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view audit logs" 
ON public.security_audit_logs FOR SELECT 
USING (auth.role() = 'authenticated');
