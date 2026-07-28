-- ==========================================
-- Anchor Fashion - Enterprise AI Personalization & Recommendations
-- ==========================================

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ==========================================
-- 1. AI USER CONTEXT VECTORS (Personalization)
-- ==========================================
CREATE TABLE public.ai_user_context_vectors (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    affinity_vector vector(768), -- Embedding representing brand, style, size, color preferences
    last_computed_at TIMESTAMPTZ DEFAULT NOW(),
    explicit_preferences JSONB DEFAULT '{}'::jsonb, -- Preferred sizes, colors
    implicit_preferences JSONB DEFAULT '{}'::jsonb, -- Browsing habits, category scores
    risk_score DECIMAL(5,2) DEFAULT 0.00, -- e.g., Return risk or churn risk
    lifetime_value_predicted DECIMAL(12,2) DEFAULT 0.00
);

-- ==========================================
-- 2. AI PRODUCT EMBEDDINGS (Recommendations)
-- ==========================================
CREATE TABLE public.ai_product_embeddings (
    product_id UUID PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
    semantic_embedding vector(768), -- Text embedding of title + description
    image_embedding vector(768),    -- Visual embedding of primary image
    last_embedded_at TIMESTAMPTZ DEFAULT NOW(),
    trending_score DECIMAL(5,2) DEFAULT 0.00, -- Updated via background jobs based on views/sales
    seasonality_flags TEXT[] DEFAULT '{}'::text[]
);

-- Index for similarity search
CREATE INDEX idx_ai_product_semantic_embedding ON public.ai_product_embeddings USING hnsw (semantic_embedding vector_l2_ops);
CREATE INDEX idx_ai_product_image_embedding ON public.ai_product_embeddings USING hnsw (image_embedding vector_l2_ops);

-- ==========================================
-- 3. AI RECOMMENDATION MODELS (Strategy Tracking)
-- ==========================================
CREATE TABLE public.ai_recommendation_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    strategy VARCHAR(100) NOT NULL, -- e.g., 'collaborative_filtering', 'content_based', 'trending'
    is_active BOOLEAN DEFAULT true,
    weight DECIMAL(3,2) DEFAULT 1.00, -- Used for hybrid recommendation scoring
    config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. AI MODEL HEALTH & GOVERNANCE LOGS
-- ==========================================
CREATE TABLE public.ai_model_health_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(100) NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- e.g., 'recommendation', 'personalization', 'pricing'
    success BOOLEAN NOT NULL DEFAULT true,
    latency_ms INTEGER NOT NULL,
    fallback_used BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ai_governance_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(100) NOT NULL, -- 'mass_discount', 'bulk_content', 'sensitive_communication'
    suggested_by_model VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE public.ai_user_context_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_product_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendation_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_governance_actions ENABLE ROW LEVEL SECURITY;

-- Context Vectors: Users can read their own
CREATE POLICY "Users can view their own context vectors" ON public.ai_user_context_vectors FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Product Embeddings: Public read
CREATE POLICY "Product embeddings are public" ON public.ai_product_embeddings FOR SELECT USING (true);

-- Admins/Managers can read/write everything
CREATE POLICY "Admins have full access to ai_user_context_vectors" ON public.ai_user_context_vectors FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name IN ('SUPERADMIN', 'MANAGER')));
CREATE POLICY "Admins have full access to ai_product_embeddings" ON public.ai_product_embeddings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name IN ('SUPERADMIN', 'MANAGER')));
CREATE POLICY "Admins have full access to ai_recommendation_models" ON public.ai_recommendation_models FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name IN ('SUPERADMIN', 'MANAGER')));
CREATE POLICY "Admins have full access to ai_model_health_logs" ON public.ai_model_health_logs FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name IN ('SUPERADMIN', 'MANAGER')));
CREATE POLICY "Admins have full access to ai_governance_actions" ON public.ai_governance_actions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p JOIN public.roles r ON p.role_id = r.id WHERE p.id = auth.uid() AND r.name IN ('SUPERADMIN', 'MANAGER')));

-- Service roles (API) will bypass RLS.
