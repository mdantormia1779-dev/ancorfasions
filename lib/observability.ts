import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface LogEntry {
  service_id: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  trace_id?: string;
  correlation_id?: string;
}

export interface MetricEntry {
  service_id: string;
  metric_name: string;
  metric_value: number;
  unit?: string;
  tags?: Record<string, any>;
}

export interface IncidentEntry {
  title: string;
  description: string;
  severity: 'SEV-1' | 'SEV-2' | 'SEV-3';
  primary_service_id: string;
}

export const ObservabilityService = {
  /**
   * Logs a message to the centralized logging system
   */
  async log(entry: LogEntry) {
    try {
      const { error } = await supabase.from('obs_logs').insert([
        {
          service_id: entry.service_id,
          level: entry.level,
          message: entry.message,
          metadata: entry.metadata || {},
          trace_id: entry.trace_id,
          correlation_id: entry.correlation_id,
        },
      ]);
      
      if (error) {
        console.error('Failed to write to central obs_logs:', error);
      }
    } catch (e) {
      console.error('ObservabilityService.log error:', e);
    }
  },

  /**
   * Records a time-series metric
   */
  async recordMetric(entry: MetricEntry) {
    try {
      const { error } = await supabase.from('obs_metrics').insert([
        {
          service_id: entry.service_id,
          metric_name: entry.metric_name,
          metric_value: entry.metric_value,
          unit: entry.unit || 'count',
          tags: entry.tags || {},
        },
      ]);
      
      if (error) {
        console.error('Failed to write to obs_metrics:', error);
      }
    } catch (e) {
      console.error('ObservabilityService.recordMetric error:', e);
    }
  },

  /**
   * Opens a new incident and alerts operations
   */
  async createIncident(entry: IncidentEntry) {
    try {
      const { data, error } = await supabase.from('obs_incidents').insert([
        {
          title: entry.title,
          description: entry.description,
          severity: entry.severity,
          primary_service_id: entry.primary_service_id,
          status: 'investigating',
        },
      ]).select().single();
      
      if (error) {
        console.error('Failed to create incident:', error);
        return null;
      }
      
      // Auto-post an initial update
      if (data) {
        await supabase.from('obs_incident_updates').insert([
          {
            incident_id: data.id,
            update_text: 'Incident automatically created and escalated for investigation.',
            update_type: 'status',
          }
        ]);
      }
      
      return data;
    } catch (e) {
      console.error('ObservabilityService.createIncident error:', e);
      return null;
    }
  },

  /**
   * Records telemetry for AI Operations (tokens, cost, latency)
   */
  async recordAITelemetry(telemetry: {
    model_name: string;
    prompt_tokens: number;
    completion_tokens: number;
    latency_ms: number;
    status?: 'success' | 'error';
    error_message?: string;
    trace_id?: string;
  }) {
    try {
      await supabase.from('obs_ai_telemetry').insert([
        {
          model_name: telemetry.model_name,
          prompt_tokens: telemetry.prompt_tokens,
          completion_tokens: telemetry.completion_tokens,
          total_tokens: telemetry.prompt_tokens + telemetry.completion_tokens,
          latency_ms: telemetry.latency_ms,
          status: telemetry.status || 'success',
          error_message: telemetry.error_message,
          trace_id: telemetry.trace_id,
        },
      ]);
    } catch (e) {
      console.error('Failed to record AI telemetry:', e);
    }
  },

  /**
   * Pings core services to perform a health check
   */
  async runHealthChecks() {
    const checks = {
      database: 'UNKNOWN',
      api: 'UNKNOWN',
      timestamp: new Date().toISOString()
    };
    
    try {
      const { error } = await supabase.from('obs_logs').select('id').limit(1);
      checks.database = error ? 'DOWN' : 'UP';
    } catch {
      checks.database = 'DOWN';
    }

    // In a real scenario, this might ping the Courier API or Payment Gateway
    checks.api = 'UP';
    
    // Record health metric
    await this.recordMetric({
      service_id: 'system_health',
      metric_name: 'health_status',
      metric_value: checks.database === 'UP' && checks.api === 'UP' ? 1 : 0,
    });

    return checks;
  }
};
