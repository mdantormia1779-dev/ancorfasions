-- Enterprise Operations, Analytics, and AI Platform Migration
-- Contains schemas for Business Intelligence, DevOps Observability, and AI Operations

-- 1. Analytics Events (BI & Tracking)
CREATE TABLE public.analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_category VARCHAR(100) NOT NULL, -- e.g., 'sales', 'marketing', 'user_journey'
    event_action VARCHAR(100) NOT NULL,   -- e.g., 'checkout_completed', 'page_view'
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id UUID,
    url TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_category_action ON public.analytics_events(event_category, event_action);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);

-- 2. Dashboard Snapshots (BI Reporting Cache)
CREATE TABLE public.dashboard_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    dashboard_type VARCHAR(100) NOT NULL, -- e.g., 'executive', 'sales', 'inventory'
    timeframe VARCHAR(50) NOT NULL,       -- e.g., 'daily', 'weekly', 'monthly'
    snapshot_data JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_dashboard_snapshots_type_timeframe ON public.dashboard_snapshots(dashboard_type, timeframe);
CREATE INDEX idx_dashboard_snapshots_generated_at ON public.dashboard_snapshots(generated_at);

-- 3. System Logs (Observability)
CREATE TABLE public.system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    level VARCHAR(20) NOT NULL,           -- e.g., 'INFO', 'WARN', 'ERROR', 'FATAL'
    service_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    trace_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_logs_level ON public.system_logs(level);
CREATE INDEX idx_system_logs_service ON public.system_logs(service_name);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at);
CREATE INDEX idx_system_logs_trace_id ON public.system_logs(trace_id);

-- 4. System Metrics (Performance)
CREATE TABLE public.system_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    value NUMERIC NOT NULL,
    unit VARCHAR(50),
    tags JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_metrics_name ON public.system_metrics(metric_name);
CREATE INDEX idx_system_metrics_timestamp ON public.system_metrics(timestamp);

-- 5. Health Checks (Monitoring)
CREATE TABLE public.health_checks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,          -- e.g., 'UP', 'DOWN', 'DEGRADED'
    response_time_ms INTEGER,
    details JSONB DEFAULT '{}'::jsonb,
    last_checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_checks_service ON public.health_checks(service_name);

-- 6. AI Predictions (AI Operations)
CREATE TABLE public.ai_predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,     -- e.g., 'sales_forecasting_v1', 'churn_prediction_v2'
    target_entity_type VARCHAR(50) NOT NULL, -- e.g., 'product', 'user', 'region'
    target_entity_id VARCHAR(100),
    prediction_type VARCHAR(100) NOT NULL, -- e.g., 'demand', 'clv', 'churn'
    prediction_data JSONB NOT NULL,
    confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ
);

CREATE INDEX idx_ai_predictions_model_type ON public.ai_predictions(model_name, prediction_type);
CREATE INDEX idx_ai_predictions_entity ON public.ai_predictions(target_entity_type, target_entity_id);

-- 7. Scheduled Jobs (Background Workers)
CREATE TABLE public.scheduled_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    cron_expression VARCHAR(100),
    status VARCHAR(50) DEFAULT 'IDLE',    -- 'IDLE', 'RUNNING', 'PAUSED', 'FAILED'
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    last_run_status VARCHAR(50),
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_jobs_status ON public.scheduled_jobs(status);
CREATE INDEX idx_scheduled_jobs_next_run ON public.scheduled_jobs(next_run_at);

-- 8. Feature Flags (DevOps/Release Management)
CREATE TABLE public.feature_flags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    flag_key VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_enabled BOOLEAN DEFAULT FALSE,
    rules JSONB DEFAULT '[]'::jsonb,      -- E.g., user targeting rules
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. System Alerts (Incident Management)
CREATE TABLE public.system_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alert_type VARCHAR(100) NOT NULL,     -- e.g., 'high_cpu', 'api_errors', 'inventory_low'
    severity VARCHAR(20) NOT NULL,        -- 'INFO', 'WARNING', 'CRITICAL', 'FATAL'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',  -- 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'
    assigned_to UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_system_alerts_status_severity ON public.system_alerts(status, severity);
CREATE INDEX idx_system_alerts_created_at ON public.system_alerts(created_at);


-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scheduled_jobs_updated_at
    BEFORE UPDATE ON public.scheduled_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- RLS Policies (Security Operations)

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;


-- 1. Analytics Events RLS
-- Anyone can insert (track events) if authenticated, admins can view all
CREATE POLICY "Users can insert their own analytics events"
    ON public.analytics_events FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view analytics events"
    ON public.analytics_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name IN ('ADMIN', 'SUPERADMIN', 'MANAGER')
        )
    );

-- 2. Operations Tables (Logs, Metrics, Alerts, Health, Jobs) RLS
-- Only admins/superadmins can view or manage operational data
CREATE POLICY "Admins manage operations data"
    ON public.system_logs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name IN ('ADMIN', 'SUPERADMIN')
        )
    );

CREATE POLICY "Admins manage metrics"
    ON public.system_metrics FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name IN ('ADMIN', 'SUPERADMIN')
        )
    );

CREATE POLICY "Admins manage health checks"
    ON public.health_checks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name IN ('ADMIN', 'SUPERADMIN')
        )
    );

CREATE POLICY "Admins manage scheduled jobs"
    ON public.scheduled_jobs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name IN ('ADMIN', 'SUPERADMIN')
        )
    );

CREATE POLICY "Admins manage system alerts"
    ON public.system_alerts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name IN ('ADMIN', 'SUPERADMIN')
        )
    );

-- 3. Feature Flags RLS
-- Anyone can read feature flags, only admins can manage
CREATE POLICY "Anyone can read feature flags"
    ON public.feature_flags FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage feature flags"
    ON public.feature_flags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name IN ('ADMIN', 'SUPERADMIN')
        )
    );

-- 4. Dashboard Snapshots & AI Predictions RLS
-- Managers and admins can view
CREATE POLICY "Managers and Admins can view BI and AI data"
    ON public.dashboard_snapshots FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name IN ('ADMIN', 'SUPERADMIN', 'MANAGER')
        )
    );

CREATE POLICY "Managers and Admins can manage BI and AI data"
    ON public.dashboard_snapshots FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name IN ('ADMIN', 'SUPERADMIN')
        )
    );

CREATE POLICY "Managers and Admins can view AI Predictions"
    ON public.ai_predictions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name IN ('ADMIN', 'SUPERADMIN', 'MANAGER')
        )
    );

CREATE POLICY "Admins can manage AI Predictions"
    ON public.ai_predictions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.roles r ON p.role_id = r.id
            WHERE p.id = auth.uid() AND r.name IN ('ADMIN', 'SUPERADMIN')
        )
    );

-- Setup Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.health_checks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;
