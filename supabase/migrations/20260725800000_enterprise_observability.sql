-- Enterprise Observability & Reliability Schema

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Services Catalog
CREATE TABLE obs_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- frontend, backend, database, third_party, ai
    owner_team VARCHAR(255),
    tier VARCHAR(50) NOT NULL, -- tier-1, tier-2, tier-3
    status VARCHAR(50) DEFAULT 'operational',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. System Metrics (Time-series data)
CREATE TABLE obs_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES obs_services(id),
    metric_name VARCHAR(255) NOT NULL,
    metric_value NUMERIC NOT NULL,
    unit VARCHAR(50),
    tags JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_obs_metrics_service_time ON obs_metrics(service_id, timestamp DESC);
CREATE INDEX idx_obs_metrics_name_time ON obs_metrics(metric_name, timestamp DESC);

-- 3. Centralized Logs
CREATE TABLE obs_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES obs_services(id),
    level VARCHAR(50) NOT NULL, -- INFO, WARN, ERROR, CRITICAL
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    trace_id VARCHAR(255),
    correlation_id VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_obs_logs_service_level ON obs_logs(service_id, level, timestamp DESC);
CREATE INDEX idx_obs_logs_trace_id ON obs_logs(trace_id);

-- 4. Distributed Traces
CREATE TABLE obs_traces (
    trace_id VARCHAR(255) PRIMARY KEY,
    root_service_id UUID REFERENCES obs_services(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_ms INTEGER,
    status VARCHAR(50), -- success, error
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. Alert Configurations
CREATE TABLE obs_alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES obs_services(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    metric_name VARCHAR(255),
    condition VARCHAR(50), -- >, <, ==, !=
    threshold NUMERIC,
    severity VARCHAR(50) NOT NULL, -- SEV-1, SEV-2, SEV-3
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Incident Management
CREATE TABLE obs_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'investigating', -- investigating, identified, monitoring, resolved
    primary_service_id UUID REFERENCES obs_services(id),
    commander_id UUID REFERENCES auth.users(id), -- Nullable for auto-created
    started_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    root_cause TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE obs_incident_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES obs_incidents(id) ON DELETE CASCADE,
    update_text TEXT NOT NULL,
    update_type VARCHAR(50) DEFAULT 'status', -- status, internal, rca
    posted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AI Telemetry & Observability
CREATE TABLE obs_ai_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(255) NOT NULL,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    latency_ms INTEGER,
    status VARCHAR(50) DEFAULT 'success',
    error_message TEXT,
    trace_id VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_obs_ai_telemetry_model_time ON obs_ai_telemetry(model_name, timestamp DESC);

-- Trigger for updated_at
CREATE TRIGGER update_obs_services_modtime BEFORE UPDATE ON obs_services FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_obs_alert_rules_modtime BEFORE UPDATE ON obs_alert_rules FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_obs_incidents_modtime BEFORE UPDATE ON obs_incidents FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- RLS Policies
ALTER TABLE obs_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_ai_telemetry ENABLE ROW LEVEL SECURITY;

-- Admins and internal systems can read/write. For now, basic read access for authenticated admins.
CREATE POLICY "Admins can manage observability data" ON obs_services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage observability data" ON obs_metrics FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage observability data" ON obs_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage observability data" ON obs_traces FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage observability data" ON obs_alert_rules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage observability data" ON obs_incidents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage observability data" ON obs_incident_updates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage observability data" ON obs_ai_telemetry FOR ALL USING (auth.role() = 'authenticated');
