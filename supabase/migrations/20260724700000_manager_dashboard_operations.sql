-- ==========================================
-- Anchor Fashion Enterprise - Migration 7
-- Manager Dashboard & Daily Operations System
-- ==========================================

-- ==========================================
-- 1. TASK MANAGEMENT (Daily Operations)
-- ==========================================

CREATE TABLE public.manager_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'archived')),
    due_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.profiles(id),
    created_by UUID REFERENCES public.profiles(id),
    related_entity_type VARCHAR(100), -- e.g., 'order', 'product', 'ticket'
    related_entity_id UUID,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_manager_tasks_assigned_to ON public.manager_tasks(assigned_to);
CREATE INDEX idx_manager_tasks_status ON public.manager_tasks(status);

-- Triggers for updated_at
CREATE TRIGGER update_manager_tasks_updated_at
    BEFORE UPDATE ON public.manager_tasks
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Audit trigger
CREATE TRIGGER audit_manager_tasks
    AFTER INSERT OR UPDATE OR DELETE ON public.manager_tasks
    FOR EACH ROW EXECUTE PROCEDURE public.audit_trigger_function();

-- ==========================================
-- 2. TEAM COLLABORATION (Internal Notes)
-- ==========================================

CREATE TABLE public.internal_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'order', 'customer', 'product', 'ticket'
    entity_id UUID NOT NULL,
    note_content TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    tags TEXT[], -- Array of strings e.g. ['VIP', 'Delayed']
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_internal_notes_entity ON public.internal_notes(entity_type, entity_id);

CREATE TRIGGER update_internal_notes_updated_at
    BEFORE UPDATE ON public.internal_notes
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER audit_internal_notes
    AFTER INSERT OR UPDATE OR DELETE ON public.internal_notes
    FOR EACH ROW EXECUTE PROCEDURE public.audit_trigger_function();

-- ==========================================
-- 3. CUSTOMER SUPPORT (Tickets & Replies)
-- ==========================================

-- Alter existing support_tickets table from enterprise_init
ALTER TABLE public.support_tickets 
    ADD COLUMN ticket_number VARCHAR(50) UNIQUE DEFAULT 'TKT-' || extract(epoch from now())::int::text,
    ADD COLUMN category VARCHAR(100) DEFAULT 'general' CHECK (category IN ('general', 'refund', 'exchange', 'complaint', 'shipping', 'product_inquiry')),
    ADD COLUMN assigned_to UUID REFERENCES public.profiles(id),
    ADD COLUMN resolved_at TIMESTAMPTZ;

CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);

-- Audit trigger (updated_at trigger is already in enterprise_init.sql)
CREATE TRIGGER audit_support_tickets
    AFTER INSERT OR UPDATE OR DELETE ON public.support_tickets
    FOR EACH ROW EXECUTE PROCEDURE public.audit_trigger_function();


CREATE TABLE public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system', 'ai')),
    sender_id UUID REFERENCES public.profiles(id), -- Null if system/AI
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- If true, invisible to customer
    attachments JSONB, -- Array of file URLs
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_support_ticket_messages_ticket ON public.support_ticket_messages(ticket_id);

CREATE TRIGGER audit_support_ticket_messages
    AFTER INSERT OR UPDATE OR DELETE ON public.support_ticket_messages
    FOR EACH ROW EXECUTE PROCEDURE public.audit_trigger_function();

-- ==========================================
-- 4. APPROVAL WORKFLOW
-- ==========================================

CREATE TABLE public.approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES public.profiles(id) NOT NULL,
    approver_id UUID REFERENCES public.profiles(id), -- Can be null initially until claimed
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'refund', 'discount', 'inventory_adjustment', 'campaign_publish'
    entity_id UUID NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    payload JSONB, -- The data to apply upon approval
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    requester_comments TEXT,
    approver_comments TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_approval_requests_status ON public.approval_requests(status);
CREATE INDEX idx_approval_requests_entity ON public.approval_requests(entity_type, entity_id);

CREATE TRIGGER update_approval_requests_updated_at
    BEFORE UPDATE ON public.approval_requests
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER audit_approval_requests
    AFTER INSERT OR UPDATE OR DELETE ON public.approval_requests
    FOR EACH ROW EXECUTE PROCEDURE public.audit_trigger_function();

-- ==========================================
-- 5. NOTIFICATION CENTER (Manager Alerts)
-- ==========================================

CREATE TABLE public.manager_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL, -- The recipient
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'alert', 'success')),
    link_url VARCHAR(255), -- Deep link to the entity
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_manager_notifications_user_read ON public.manager_notifications(user_id, is_read);

-- ==========================================
-- 6. PERMISSIONS & SEED DATA
-- ==========================================

-- Insert the operational permissions
INSERT INTO public.permissions (action, description) VALUES
('view_dashboard', 'Can view the manager dashboard'),
('manage_tasks', 'Can create, assign, and update manager tasks'),
('manage_internal_notes', 'Can add and view internal notes across entities'),
('view_support_tickets', 'Can view customer support tickets'),
('manage_support_tickets', 'Can respond to and manage support tickets'),
('create_approval_request', 'Can create requests requiring higher approval'),
('manage_approvals', 'Can approve or reject pending approval requests')
ON CONFLICT (action) DO NOTHING;

-- Map permissions to SUPERADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name = 'SUPERADMIN' 
  AND p.action IN ('view_dashboard', 'manage_tasks', 'manage_internal_notes', 'view_support_tickets', 'manage_support_tickets', 'create_approval_request', 'manage_approvals')
ON CONFLICT DO NOTHING;


-- ==========================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.manager_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_notifications ENABLE ROW LEVEL SECURITY;

-- Tasks: Users can view tasks assigned to them or created by them. Admins with 'manage_tasks' can view/edit all.
CREATE POLICY "Users view own tasks" ON public.manager_tasks
    FOR SELECT USING (auth.uid() = assigned_to OR auth.uid() = created_by OR public.has_permission('manage_tasks'));

CREATE POLICY "Users insert tasks" ON public.manager_tasks
    FOR INSERT WITH CHECK (public.has_permission('manage_tasks') OR auth.uid() = created_by);

CREATE POLICY "Users update own tasks" ON public.manager_tasks
    FOR UPDATE USING (auth.uid() = assigned_to OR public.has_permission('manage_tasks'));

-- Internal Notes: Requires 'manage_internal_notes' permission
CREATE POLICY "Admins manage internal notes" ON public.internal_notes
    FOR ALL USING (public.has_permission('manage_internal_notes'));

-- Support Tickets: Customers can view their own, Agents can view/manage all.
CREATE POLICY "Customers view own tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id OR public.has_permission('view_support_tickets'));

CREATE POLICY "Customers insert tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Agents manage tickets" ON public.support_tickets
    FOR UPDATE USING (public.has_permission('manage_support_tickets'));

-- Support Ticket Messages
CREATE POLICY "Customers view own ticket messages" ON public.support_ticket_messages
    FOR SELECT USING (
        (EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid()) AND is_internal = false)
        OR public.has_permission('view_support_tickets')
    );

CREATE POLICY "Customers insert messages" ON public.support_ticket_messages
    FOR INSERT WITH CHECK (
        (EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid()) AND is_internal = false AND sender_type = 'customer')
        OR public.has_permission('manage_support_tickets')
    );

-- Approvals: Requesters can view their own, Approvers can view all.
CREATE POLICY "Requesters view own approvals" ON public.approval_requests
    FOR SELECT USING (auth.uid() = requester_id OR public.has_permission('manage_approvals'));

CREATE POLICY "Requesters insert approvals" ON public.approval_requests
    FOR INSERT WITH CHECK (auth.uid() = requester_id AND public.has_permission('create_approval_request'));

CREATE POLICY "Approvers manage approvals" ON public.approval_requests
    FOR UPDATE USING (public.has_permission('manage_approvals'));

-- Notifications: Users only view their own
CREATE POLICY "Users manage own notifications" ON public.manager_notifications
    FOR ALL USING (auth.uid() = user_id);
