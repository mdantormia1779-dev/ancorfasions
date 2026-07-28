-- Enterprise AI Automation Platform Schema

-- 1. AI Prompts (Central Registry)
CREATE TABLE public.ai_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- e.g., 'customer_support', 'marketing', 'executive'
    model VARCHAR(100) NOT NULL DEFAULT 'gemini-1.5-flash', -- e.g., 'gemini-1.5-pro', 'gemini-1.5-flash'
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. AI Prompt Versions (History & Rollback)
CREATE TABLE public.ai_prompt_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES public.ai_prompts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    model VARCHAR(100) NOT NULL,
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,
    temperature DECIMAL(3,2) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(prompt_id, version_number)
);

-- 3. AI Request Logs (Telemetry & Analytics)
CREATE TABLE public.ai_request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES public.ai_prompts(id) ON DELETE SET NULL,
    prompt_name VARCHAR(255), -- Stored in case prompt is deleted
    model VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id), -- Who triggered it (if applicable)
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    latency_ms INTEGER NOT NULL,
    cost_estimated_usd DECIMAL(10,6) DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'success', -- 'success', 'error', 'timeout'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. AI Workflows (Automation Rules)
CREATE TABLE public.ai_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    trigger_event VARCHAR(255) NOT NULL, -- e.g., 'product.created', 'stock.low'
    action_prompt_id UUID REFERENCES public.ai_prompts(id),
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_ai_prompts_category ON public.ai_prompts(category);
CREATE INDEX idx_ai_request_logs_prompt_id ON public.ai_request_logs(prompt_id);
CREATE INDEX idx_ai_request_logs_created_at ON public.ai_request_logs(created_at);

-- RLS Policies
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_workflows ENABLE ROW LEVEL SECURITY;

-- Prompts: Admins/Managers can manage, authenticated users can read active ones (for gateway)
CREATE POLICY "Allow read access for authenticated users to active prompts" 
    ON public.ai_prompts FOR SELECT 
    USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Allow all access for admin to prompts" 
    ON public.ai_prompts FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p 
        JOIN public.roles r ON p.role_id = r.id 
        WHERE p.id = auth.uid() AND r.name IN ('SUPERADMIN', 'MANAGER')
      )
    );

-- Prompt Versions: Admins only
CREATE POLICY "Allow all access for admin to prompt versions" 
    ON public.ai_prompt_versions FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p 
        JOIN public.roles r ON p.role_id = r.id 
        WHERE p.id = auth.uid() AND r.name IN ('SUPERADMIN', 'MANAGER')
      )
    );

-- Logs: Service role can insert, Admin can read
-- Assuming service role handles insertions via API
CREATE POLICY "Allow insert for authenticated users to logs" 
    ON public.ai_request_logs FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for admin to logs" 
    ON public.ai_request_logs FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p 
        JOIN public.roles r ON p.role_id = r.id 
        WHERE p.id = auth.uid() AND r.name IN ('SUPERADMIN', 'MANAGER')
      )
    );

-- Workflows: Admins only
CREATE POLICY "Allow all access for admin to workflows" 
    ON public.ai_workflows FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p 
        JOIN public.roles r ON p.role_id = r.id 
        WHERE p.id = auth.uid() AND r.name IN ('SUPERADMIN', 'MANAGER')
      )
    );
