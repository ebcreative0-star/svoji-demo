-- Migration 007: Data Collection Schema
-- Adds engagement_events table, demand_signals source_intent column, and UTM columns on couples

-- 1. Add source_intent column to demand_signals
ALTER TABLE demand_signals
  ADD COLUMN IF NOT EXISTS source_intent TEXT
    CHECK (source_intent IN ('vendor_search', 'budget_add'))
    DEFAULT 'vendor_search';

-- 2. Add UTM tracking columns to couples
ALTER TABLE couples
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- 3. Create engagement_events table
CREATE TABLE IF NOT EXISTS engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'message_sent',
    'checklist_item_completed',
    'onboarding_step_completed',
    'upgrade_cta_clicked'
  )),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for engagement_events
CREATE INDEX IF NOT EXISTS idx_engagement_couple_id ON engagement_events(couple_id);
CREATE INDEX IF NOT EXISTS idx_engagement_event_type ON engagement_events(event_type);
CREATE INDEX IF NOT EXISTS idx_engagement_created_at ON engagement_events(created_at DESC);

-- RLS for engagement_events
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
  ON engagement_events FOR SELECT
  USING (auth.uid() = couple_id);

CREATE POLICY "System can insert events"
  ON engagement_events FOR INSERT
  WITH CHECK (true);
