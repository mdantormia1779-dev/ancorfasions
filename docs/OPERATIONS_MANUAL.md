# Enterprise Operations & SRE Manual

## Observability & Monitoring
Anchor Fashion utilizes a structured logging system integrated directly with Supabase and our custom Next.js dashboards.

### System Logs
Logs are categorized by `INFO`, `WARN`, `ERROR`, and `FATAL`. Use the `logSystemEvent` server action in `actions/ops.actions.ts`.

### Metrics & Health Checks
Service health is monitored through the `health_checks` table, verifying PostGres, Redis, and external APIs.
Metrics for API latency, memory, and database query times are logged in `system_metrics`.

## Feature Flags
Feature flags allow safe, decoupled deployment of code to production. Enable/disable features in the Operations Center Dashboard (`/operations`).

## Incident Management
Critical errors trigger entries in `system_alerts`.
Active alerts must be acknowledged and resolved by an assigned SRE or Admin.
