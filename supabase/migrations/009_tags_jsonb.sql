-- Add tags column to all three item tables
ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE budget_items ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE guests ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
