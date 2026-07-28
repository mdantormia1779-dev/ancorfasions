-- ==========================================
-- 1. AUTO-PROVISIONING PROFILES
-- ==========================================

-- Function to handle new user signups from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
BEGIN
    -- Get the ID for the CUSTOMER role
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'CUSTOMER' LIMIT 1;
    
    INSERT INTO public.profiles (id, first_name, last_name, role_id)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        default_role_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ==========================================
-- 2. ENHANCED AUTHORIZATION FUNCTIONS
-- ==========================================

-- Function to check if the current user has a specific permission
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

    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================================
-- 3. USER DEVICES (TRUSTED DEVICES FOR 2FA)
-- ==========================================

DROP TABLE IF EXISTS public.user_devices CASCADE;

CREATE TABLE public.user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_fingerprint VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_trusted BOOLEAN DEFAULT false,
    trusted_until TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, device_fingerprint)
);

CREATE INDEX idx_user_devices_user_id ON public.user_devices(user_id);

ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own devices
CREATE POLICY "Users can manage own devices" ON public.user_devices 
    FOR ALL USING (auth.uid() = user_id);

-- Main Admins can view all devices (for security monitoring)
CREATE POLICY "Superadmins can view all devices" ON public.user_devices 
    FOR SELECT USING (public.has_permission('view_security_logs'));


-- ==========================================
-- 4. ENTERPRISE AUDIT LOGGING
-- ==========================================

DROP TABLE IF EXISTS public.audit_logs CASCADE;

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID, -- For composite keys, might need JSONB, but UUID covers most of our PKs
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id), -- Intentionally referencing auth.users to preserve log if profile is deleted
    changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_changed_at ON public.audit_logs(changed_at);

-- Audit log trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_row JSONB := NULL;
    new_row JSONB := NULL;
    rec_id UUID := NULL;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        old_row := to_jsonb(OLD);
        new_row := to_jsonb(NEW);
        -- Assumes all audited tables have an 'id' column of type UUID
        BEGIN
            EXECUTE 'SELECT ($1).id' INTO rec_id USING OLD;
        EXCEPTION WHEN OTHERS THEN
            rec_id := NULL;
        END;
        
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, rec_id, TG_OP, old_row, new_row, auth.uid());
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        old_row := to_jsonb(OLD);
        BEGIN
            EXECUTE 'SELECT ($1).id' INTO rec_id USING OLD;
        EXCEPTION WHEN OTHERS THEN
            rec_id := NULL;
        END;

        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, rec_id, TG_OP, old_row, auth.uid());
        RETURN OLD;
        
    ELSIF TG_OP = 'INSERT' THEN
        new_row := to_jsonb(NEW);
        BEGIN
            EXECUTE 'SELECT ($1).id' INTO rec_id USING NEW;
        EXCEPTION WHEN OTHERS THEN
            rec_id := NULL;
        END;

        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, rec_id, TG_OP, new_row, auth.uid());
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit triggers to critical security tables
CREATE TRIGGER audit_roles_changes
AFTER INSERT OR UPDATE OR DELETE ON public.roles
FOR EACH ROW EXECUTE PROCEDURE public.audit_trigger_function();

CREATE TRIGGER audit_permissions_changes
AFTER INSERT OR UPDATE OR DELETE ON public.permissions
FOR EACH ROW EXECUTE PROCEDURE public.audit_trigger_function();

CREATE TRIGGER audit_role_permissions_changes
AFTER INSERT OR UPDATE OR DELETE ON public.role_permissions
FOR EACH ROW EXECUTE PROCEDURE public.audit_trigger_function();

-- Protect audit_logs (append-only via the database)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only superadmins can view audit logs
CREATE POLICY "Superadmins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.has_permission('view_audit_logs'));

-- No one can update or delete audit logs from the client via RLS.
-- (Inserts are handled by the SECURITY DEFINER trigger function which bypasses RLS)


-- ==========================================
-- 5. SEED INITIAL AUTH PERMISSIONS
-- ==========================================

-- Insert the permissions we used above
INSERT INTO public.permissions (action, description) VALUES
('view_security_logs', 'Can view device logs and active sessions'),
('view_audit_logs', 'Can view system audit logs')
ON CONFLICT (action) DO NOTHING;

-- Grant to SUPERADMIN (Optional, since the function already bypasses, but good for completeness)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name = 'SUPERADMIN' AND p.action IN ('view_security_logs', 'view_audit_logs')
ON CONFLICT DO NOTHING;
