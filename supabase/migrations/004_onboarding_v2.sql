-- Phase 7: Enhanced onboarding fields
ALTER TABLE couples
  ADD COLUMN IF NOT EXISTS guest_count_range VARCHAR(20),
  ADD COLUMN IF NOT EXISTS location VARCHAR(200),
  ADD COLUMN IF NOT EXISTS search_radius_km INT DEFAULT 50,
  ADD COLUMN IF NOT EXISTS wedding_style VARCHAR(50) CHECK (
    wedding_style IN ('tradicni', 'boho', 'opulentni', 'minimalisticka', 'rustikalni')
  ),
  ADD COLUMN IF NOT EXISTS gdpr_consent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;
