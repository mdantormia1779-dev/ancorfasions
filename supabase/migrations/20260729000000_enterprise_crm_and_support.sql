-- ========================================================================================
-- ENTERPRISE CRM & CUSTOMER SUPPORT PLATFORM
-- ========================================================================================

-- Drop old support tables if they exist to replace with the complete CRM architecture
DROP TABLE IF EXISTS public.csat_surveys CASCADE;
DROP TABLE IF EXISTS public.live_chat_messages CASCADE;
DROP TABLE IF EXISTS public.live_chats CASCADE;
DROP TABLE IF EXISTS public.ticket_messages CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.kb_articles CASCADE;
DROP TABLE IF EXISTS public.kb_categories CASCADE;
DROP TABLE IF EXISTS public.support_slas CASCADE;
DROP TABLE IF EXISTS public.support_agents CASCADE;
DROP TABLE IF EXISTS public.support_departments CASCADE;

-- Also drop types if they exist so we can recreate them
DROP TYPE IF EXISTS public.ticket_priority CASCADE;
DROP TYPE IF EXISTS public.ticket_status CASCADE;
DROP TYPE IF EXISTS public.chat_status CASCADE;
DROP TYPE IF EXISTS public.agent_status CASCADE;
DROP TYPE IF EXISTS public.lead_status CASCADE;

-- Enums
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.ticket_status AS ENUM ('open', 'pending', 'in_progress', 'waiting_for_customer', 'resolved', 'closed', 'reopened');
CREATE TYPE public.chat_status AS ENUM ('queued', 'active', 'transferred', 'resolved', 'closed');
CREATE TYPE public.agent_status AS ENUM ('online', 'busy', 'offline');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'lost', 'converted');

-- ==========================================
-- 1. CRM CUSTOMERS
-- ==========================================
-- Extends the customer_profiles for CRM-specific tracking (VIP, Blocked, etc.)
CREATE TABLE IF NOT EXISTS public.crm_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    is_vip BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    block_reason TEXT,
    customer_lifecycle_stage VARCHAR(50) DEFAULT 'PROSPECT' CHECK (customer_lifecycle_stage IN ('PROSPECT', 'FIRST_TIME_BUYER', 'REPEAT_CUSTOMER', 'LOYAL', 'AT_RISK', 'CHURNED')),
    health_score INTEGER DEFAULT 100, -- 0-100
    account_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total_support_tickets INTEGER DEFAULT 0,
    custom_fields JSONB DEFAULT '{}',
    last_interaction_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(profile_id)
);

-- ==========================================
-- 2. CRM LEADS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.crm_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company_name VARCHAR(100),
    status public.lead_status DEFAULT 'new',
    source VARCHAR(100), -- 'organic', 'social', 'paid', 'referral', etc.
    assigned_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    score INTEGER DEFAULT 0,
    custom_fields JSONB DEFAULT '{}',
    converted_to_profile_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL,
    next_follow_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 3. CUSTOMER TAGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customer_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20) DEFAULT '#000000',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.crm_customer_tags (
    crm_customer_id UUID REFERENCES public.crm_customers(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.customer_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (crm_customer_id, tag_id)
);

-- ==========================================
-- 4. CRM NOTES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.crm_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CHECK ((profile_id IS NOT NULL AND lead_id IS NULL) OR (profile_id IS NULL AND lead_id IS NOT NULL))
);

-- ==========================================
-- 5. COMMUNICATION LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('EMAIL', 'SMS', 'IN_APP', 'PUSH', 'CALL', 'MEETING')),
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    subject VARCHAR(255),
    content TEXT,
    status VARCHAR(50) DEFAULT 'SENT', -- SENT, DELIVERED, FAILED, READ
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 6. SUPPORT DEPARTMENTS & AGENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.support_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.support_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.support_departments(id) ON DELETE SET NULL,
    current_status public.agent_status DEFAULT 'offline',
    max_concurrent_chats INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- ==========================================
-- 7. SLA POLICIES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.sla_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    priority public.ticket_priority NOT NULL,
    first_response_time_minutes INTEGER NOT NULL,
    resolution_time_minutes INTEGER NOT NULL,
    escalation_rule JSONB DEFAULT '{}', -- Rules for when SLA is breached
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(priority)
);

-- ==========================================
-- 8. SUPPORT TICKETS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number SERIAL UNIQUE,
    profile_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    priority public.ticket_priority DEFAULT 'medium',
    status public.ticket_status DEFAULT 'open',
    department_id UUID REFERENCES public.support_departments(id) ON DELETE SET NULL,
    assigned_agent_id UUID REFERENCES public.support_agents(id) ON DELETE SET NULL,
    order_id UUID, -- Assuming orders table exists, skipping constraint for simplicity or linking later
    sla_breach_at TIMESTAMPTZ,
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 9. TICKET ASSIGNMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ticket_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.support_agents(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    unassigned_at TIMESTAMPTZ
);

-- ==========================================
-- 10. TICKET MESSAGES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('CUSTOMER', 'AGENT', 'SYSTEM', 'AI')),
    message TEXT NOT NULL,
    is_internal_note BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 11. TICKET ATTACHMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES public.ticket_messages(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size_bytes INTEGER,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 12. KNOWLEDGE BASE & FAQ
-- ==========================================
CREATE TABLE IF NOT EXISTS public.faq_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.faq_categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.faq_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL, -- Markdown/HTML
    excerpt TEXT,
    is_published BOOLEAN DEFAULT false,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION public.crm_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_crm_customers_updated_at BEFORE UPDATE ON public.crm_customers FOR EACH ROW EXECUTE PROCEDURE public.crm_update_updated_at_column();
CREATE TRIGGER update_crm_leads_updated_at BEFORE UPDATE ON public.crm_leads FOR EACH ROW EXECUTE PROCEDURE public.crm_update_updated_at_column();
CREATE TRIGGER update_crm_notes_updated_at BEFORE UPDATE ON public.crm_notes FOR EACH ROW EXECUTE PROCEDURE public.crm_update_updated_at_column();
CREATE TRIGGER update_support_departments_updated_at BEFORE UPDATE ON public.support_departments FOR EACH ROW EXECUTE PROCEDURE public.crm_update_updated_at_column();
CREATE TRIGGER update_support_agents_updated_at BEFORE UPDATE ON public.support_agents FOR EACH ROW EXECUTE PROCEDURE public.crm_update_updated_at_column();
CREATE TRIGGER update_sla_policies_updated_at BEFORE UPDATE ON public.sla_policies FOR EACH ROW EXECUTE PROCEDURE public.crm_update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE PROCEDURE public.crm_update_updated_at_column();
CREATE TRIGGER update_ticket_messages_updated_at BEFORE UPDATE ON public.ticket_messages FOR EACH ROW EXECUTE PROCEDURE public.crm_update_updated_at_column();
CREATE TRIGGER update_faq_categories_updated_at BEFORE UPDATE ON public.faq_categories FOR EACH ROW EXECUTE PROCEDURE public.crm_update_updated_at_column();
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.knowledge_base FOR EACH ROW EXECUTE PROCEDURE public.crm_update_updated_at_column();

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_crm_customers_profile ON public.crm_customers(profile_id);
CREATE INDEX idx_crm_customers_manager ON public.crm_customers(account_manager_id);
CREATE INDEX idx_crm_leads_email ON public.crm_leads(email);
CREATE INDEX idx_crm_leads_agent ON public.crm_leads(assigned_agent_id);
CREATE INDEX idx_crm_notes_profile ON public.crm_notes(profile_id);
CREATE INDEX idx_crm_notes_lead ON public.crm_notes(lead_id);
CREATE INDEX idx_communication_logs_profile ON public.communication_logs(profile_id);
CREATE INDEX idx_support_tickets_profile ON public.support_tickets(profile_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_agent ON public.support_tickets(assigned_agent_id);
CREATE INDEX idx_ticket_messages_ticket ON public.ticket_messages(ticket_id);
CREATE INDEX idx_ticket_attachments_ticket ON public.ticket_attachments(ticket_id);
CREATE INDEX idx_knowledge_base_category ON public.knowledge_base(category_id);

-- ==========================================
-- RLS (ROW LEVEL SECURITY)
-- ==========================================
ALTER TABLE public.crm_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Simplified RLS for brevity, assuming backend admin bypasses RLS with service role for most operations.
-- Customers can view their own tickets
CREATE POLICY "Customers view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Customers insert own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Customers update own tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Customers view own ticket messages" ON public.ticket_messages FOR SELECT USING (
    ticket_id IN (SELECT id FROM public.support_tickets WHERE profile_id = auth.uid()) 
    AND is_internal_note = false
);
CREATE POLICY "Customers insert own ticket messages" ON public.ticket_messages FOR INSERT WITH CHECK (
    ticket_id IN (SELECT id FROM public.support_tickets WHERE profile_id = auth.uid()) 
    AND sender_type = 'CUSTOMER'
);

CREATE POLICY "Customers view own ticket attachments" ON public.ticket_attachments FOR SELECT USING (
    ticket_id IN (SELECT id FROM public.support_tickets WHERE profile_id = auth.uid())
);
CREATE POLICY "Customers insert own ticket attachments" ON public.ticket_attachments FOR INSERT WITH CHECK (
    ticket_id IN (SELECT id FROM public.support_tickets WHERE profile_id = auth.uid())
);

CREATE POLICY "Public read access for active FAQ categories" ON public.faq_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for published KB articles" ON public.knowledge_base FOR SELECT USING (is_published = true);

-- Admins / Agents will use a service role for the Admin Dashboard or need specific agent policies (bypassed here for simplicity)
