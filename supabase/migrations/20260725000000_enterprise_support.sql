-- Migration: Enterprise Customer Support, Live Chat, and Ticket Management System
-- Description: Creates schemas for ticketing, live chat, knowledge base, SLAs, and CSAT surveys.

-- Drop legacy tables from init migration to replace with enterprise schema
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;

-- 1. Enums
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.ticket_status AS ENUM ('open', 'pending', 'in_progress', 'waiting_for_customer', 'resolved', 'closed', 'reopened');
CREATE TYPE public.chat_status AS ENUM ('queued', 'active', 'transferred', 'resolved', 'closed');
CREATE TYPE public.agent_status AS ENUM ('online', 'busy', 'offline');

-- 2. Support Departments
CREATE TABLE public.support_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Support Agents (Extends Profiles)
CREATE TABLE public.support_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.support_departments(id) ON DELETE SET NULL,
    current_status public.agent_status DEFAULT 'offline',
    max_concurrent_chats INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id)
);

-- 4. Knowledge Base Categories
CREATE TABLE public.kb_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES public.kb_categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Knowledge Base Articles
CREATE TABLE public.kb_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.kb_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL, -- Markdown/HTML
    excerpt TEXT,
    is_published BOOLEAN DEFAULT false,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Support Tickets
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number SERIAL UNIQUE, -- Human readable ID
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_email TEXT, -- For non-logged in users
    guest_name TEXT,
    subject TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Order Issue', 'Return Request'
    priority public.ticket_priority DEFAULT 'medium',
    status public.ticket_status DEFAULT 'open',
    assigned_agent_id UUID REFERENCES public.support_agents(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.support_departments(id) ON DELETE SET NULL,
    order_id UUID, -- References public.orders(id) if applicable
    tags TEXT[],
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Ticket Messages
CREATE TABLE public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Null means system or guest
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system', 'ai')),
    message TEXT NOT NULL,
    is_internal_note BOOLEAN DEFAULT false, -- True for agent-only notes
    attachments JSONB DEFAULT '[]', -- Array of file URLs/metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Live Chats
CREATE TABLE public.live_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_session_id TEXT, -- For anonymous users
    status public.chat_status DEFAULT 'queued',
    assigned_agent_id UUID REFERENCES public.support_agents(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.support_departments(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    escalated_to_ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE SET NULL,
    summary TEXT, -- AI generated summary
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Live Chat Messages
CREATE TABLE public.live_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.live_chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'ai', 'system')),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'action')),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Customer Feedback / CSAT
CREATE TABLE public.csat_surveys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    chat_id UUID REFERENCES public.live_chats(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (ticket_id IS NOT NULL OR chat_id IS NOT NULL)
);

-- 11. SLAs (Service Level Agreements)
CREATE TABLE public.support_slas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    priority public.ticket_priority NOT NULL,
    first_response_time_minutes INTEGER NOT NULL,
    resolution_time_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(priority)
);

-- Indexes for performance
CREATE INDEX idx_tickets_customer ON public.support_tickets(customer_id);
CREATE INDEX idx_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_tickets_agent ON public.support_tickets(assigned_agent_id);
CREATE INDEX idx_ticket_messages_ticket ON public.ticket_messages(ticket_id);
CREATE INDEX idx_live_chats_customer ON public.live_chats(customer_id);
CREATE INDEX idx_live_chats_status ON public.live_chats(status);
CREATE INDEX idx_chat_messages_chat ON public.live_chat_messages(chat_id);
CREATE INDEX idx_kb_articles_category ON public.kb_articles(category_id);
CREATE INDEX idx_csat_ticket ON public.csat_surveys(ticket_id);
CREATE INDEX idx_csat_chat ON public.csat_surveys(chat_id);

-- Triggers for updated_at
CREATE TRIGGER update_support_departments_updated_at BEFORE UPDATE ON public.support_departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_agents_updated_at BEFORE UPDATE ON public.support_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kb_categories_updated_at BEFORE UPDATE ON public.kb_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kb_articles_updated_at BEFORE UPDATE ON public.kb_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_live_chats_updated_at BEFORE UPDATE ON public.live_chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Simplified for brevity, assumes detailed RBAC logic elsewhere)
ALTER TABLE public.support_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csat_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_slas ENABLE ROW LEVEL SECURITY;

-- Read policies for public KB
CREATE POLICY "Public read access for active KB categories" ON public.kb_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for published KB articles" ON public.kb_articles FOR SELECT USING (is_published = true);

-- Customer access to their own tickets and chats
CREATE POLICY "Customers view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers view own ticket messages" ON public.ticket_messages FOR SELECT USING (
    ticket_id IN (SELECT id FROM public.support_tickets WHERE customer_id = auth.uid()) 
    AND is_internal_note = false
);
CREATE POLICY "Customers view own live chats" ON public.live_chats FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers view own live chat messages" ON public.live_chat_messages FOR SELECT USING (
    chat_id IN (SELECT id FROM public.live_chats WHERE customer_id = auth.uid())
);

-- Customers can insert messages/chats
CREATE POLICY "Customers insert own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers insert own ticket messages" ON public.ticket_messages FOR INSERT WITH CHECK (
    ticket_id IN (SELECT id FROM public.support_tickets WHERE customer_id = auth.uid()) 
    AND sender_type = 'customer'
);
CREATE POLICY "Customers insert own live chats" ON public.live_chats FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers insert own live chat messages" ON public.live_chat_messages FOR INSERT WITH CHECK (
    chat_id IN (SELECT id FROM public.live_chats WHERE customer_id = auth.uid()) 
    AND sender_type = 'customer'
);
CREATE POLICY "Customers insert own CSAT" ON public.csat_surveys FOR INSERT WITH CHECK (auth.uid() = customer_id);
