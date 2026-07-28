-- ==========================================
-- ENTERPRISE AUTH EXTENSIONS
-- ==========================================

-- 1. USER PERMISSIONS (Overrides/Specific Grants)
CREATE TABLE public.user_permissions (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, permission_id)
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can manage user permissions" ON public.user_permissions
    FOR ALL USING (public.has_permission('manage_roles'));

-- 2. LOGIN HISTORY
CREATE TABLE public.login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    location VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX idx_login_history_created_at ON public.login_history(created_at);

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own login history" ON public.login_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can view all login history" ON public.login_history
    FOR SELECT USING (public.has_permission('view_security_logs'));

-- 3. USER SESSIONS (Active Sessions tracking)
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.user_devices(id) ON DELETE CASCADE,
    session_token VARCHAR(512) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON public.user_sessions(session_token);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions" ON public.user_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can view all sessions" ON public.user_sessions
    FOR SELECT USING (public.has_permission('view_security_logs'));

-- 4. SECURITY EVENTS
CREATE TABLE public.security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN ('ACCOUNT_LOCKOUT', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'MFA_ENABLED', 'MFA_DISABLED', 'SUSPICIOUS_LOGIN')),
    severity VARCHAR(50) DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_type ON public.security_events(event_type);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own security events" ON public.security_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can view all security events" ON public.security_events
    FOR SELECT USING (public.has_permission('view_security_logs'));

-- Update has_permission function to also check user_permissions
CREATE OR REPLACE FUNCTION public.has_permission(required_permission VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_id UUID;
    has_perm BOOLEAN;
BEGIN
    -- Get the current user's role from their profile
    SELECT role_id INTO user_role_id
    FROM public.profiles
    WHERE id = auth.uid();

    -- Check if the role is SUPERADMIN (which bypasses all permission checks)
    IF EXISTS (SELECT 1 FROM public.roles WHERE id = user_role_id AND name = 'SUPERADMIN') THEN
        RETURN true;
    END IF;

    -- Check if the user's role has the required permission
    SELECT EXISTS (
        SELECT 1
        FROM public.role_permissions rp
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE rp.role_id = user_role_id AND p.action = required_permission
    ) INTO has_perm;

    -- If not found in role_permissions, check user_permissions
    IF NOT has_perm THEN
        SELECT EXISTS (
            SELECT 1
            FROM public.user_permissions up
            JOIN public.permissions p ON p.id = up.permission_id
            WHERE up.user_id = auth.uid() AND p.action = required_permission
        ) INTO has_perm;
    END IF;

    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
