-- Add source column to budget_items to track who created the item
ALTER TABLE budget_items
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';

-- Backfill existing rows
UPDATE budget_items SET source = 'manual' WHERE source IS NULL;
