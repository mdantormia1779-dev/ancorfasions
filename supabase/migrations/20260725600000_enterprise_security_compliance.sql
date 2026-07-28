-- ==========================================
-- ENTERPRISE SECURITY, COMPLIANCE, & RISK MANAGEMENT
-- ==========================================

-- ==========================================
-- 1. EXTENDED ACCESS CONTROL & GOVERNANCE
-- ==========================================

-- Permission Groups for easier management
CREATE TABLE public.permission_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Map permissions to groups
CREATE TABLE public.permission_group_mappings (
    group_id UUID REFERENCES public.permission_groups(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, permission_id)
);

-- Temporary Permissions (time-bound access for contractors/support)
CREATE TABLE public.temporary_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES public.profiles(id),
    reason TEXT NOT NULL,
    valid_from TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Department Level Permissions (ABAC)
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE public.user_departments (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    PRIMARY KEY (user_id, department_id)
);

-- ==========================================
-- 2. AUTHENTICATION & SESSIONS
-- ==========================================

CREATE TABLE public.login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    email VARCHAR(255), -- Stored in case user is deleted or failed login
    ip_address INET,
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE', 'BLOCKED')),
    failure_reason TEXT,
    attempted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX idx_login_history_ip ON public.login_history(ip_address);

CREATE TABLE public.active_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.user_devices(id) ON DELETE SET NULL,
    token_hash VARCHAR(255) NOT NULL, -- Hashed refresh token or session identifier
    ip_address INET,
    user_agent TEXT,
    is_revoked BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_active_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 3. FRAUD & RISK DETECTION (RISK ENGINE)
-- ==========================================

-- Unified risk scoring for various entities
CREATE TABLE public.risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('USER', 'ORDER', 'PAYMENT', 'DEVICE', 'IP')),
    entity_id UUID NOT NULL, -- Polymorphic reference
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    factors JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of reasons e.g. ["IP_MISMATCH", "HIGH_VELOCITY"]
    evaluated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(entity_type, entity_id)
);

CREATE TABLE public.fraud_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_score_id UUID REFERENCES public.risk_scores(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE')),
    assigned_to UUID REFERENCES public.profiles(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 4. COMPLIANCE & DATA PRIVACY (GDPR)
-- ==========================================

-- Consent Management
CREATE TABLE public.user_consents (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    marketing_email BOOLEAN DEFAULT false,
    marketing_sms BOOLEAN DEFAULT false,
    analytics_cookies BOOLEAN DEFAULT false,
    third_party_tracking BOOLEAN DEFAULT false,
    last_updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Subject Access Requests (Right to Portability / Right to be Forgotten)
CREATE TABLE public.privacy_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('DATA_EXPORT', 'ACCOUNT_DELETION')),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED')),
    notes TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMPTZ
);

-- Policy Management
CREATE TABLE public.compliance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_type VARCHAR(50) NOT NULL CHECK (policy_type IN ('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'COOKIE_POLICY')),
    version VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.policy_acknowledgments (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES public.compliance_policies(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ip_address INET,
    PRIMARY KEY (user_id, policy_id)
);

-- ==========================================
-- 5. MONITORING & ALERTING
-- ==========================================

CREATE TABLE public.security_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'HIGH', 'CRITICAL')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('AUTHENTICATION', 'AUTHORIZATION', 'API_ABUSE', 'DATA_ACCESS', 'SYSTEM')),
    message TEXT NOT NULL,
    context JSONB,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 6. RLS POLICIES & SECURITY
-- ==========================================

-- Enable RLS
ALTER TABLE public.permission_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_group_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporary_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Basic Public/User Policies
CREATE POLICY "Public can view active policies" ON public.compliance_policies FOR SELECT USING (is_active = true);
CREATE POLICY "Users manage own consent" ON public.user_consents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own privacy requests" ON public.privacy_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own active sessions" ON public.active_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own login history" ON public.login_history FOR SELECT USING (auth.uid() = user_id);

-- Audit Triggers for critical tables
CREATE TRIGGER audit_temporary_permissions
AFTER INSERT OR UPDATE OR DELETE ON public.temporary_permissions
FOR EACH ROW EXECUTE PROCEDURE public.audit_trigger_function();

CREATE TRIGGER audit_compliance_policies
AFTER INSERT OR UPDATE OR DELETE ON public.compliance_policies
FOR EACH ROW EXECUTE PROCEDURE public.audit_trigger_function();
