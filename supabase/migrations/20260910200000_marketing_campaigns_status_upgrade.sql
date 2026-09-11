-- ============================================================================
-- Migration: Upgrade Marketing Campaigns Status & Timestamp Tracking
-- Table: public.campaigns
-- ============================================================================

-- 1. Add sent_at timestamp and metadata column if not present
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Expand status check constraint to support modern campaign lifecycle
--    Allowed: draft, scheduled, sending, running, sent, completed, paused, failed
ALTER TABLE public.campaigns
  DROP CONSTRAINT IF EXISTS campaigns_status_check;

ALTER TABLE public.campaigns
  ADD CONSTRAINT campaigns_status_check
  CHECK (status IN (
    'draft',
    'scheduled',
    'sending',
    'running',
    'sent',
    'completed',
    'paused',
    'failed'
  ));

-- 3. Create index for fast scheduled campaign querying
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_time
  ON public.campaigns(schedule_time)
  WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_campaigns_status
  ON public.campaigns(status);
