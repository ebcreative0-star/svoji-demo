-- AI Svatební Asistent - Tabulky pro plánování
-- Spusť tento SQL v Supabase SQL Editoru PO 001_initial_schema.sql

-- Páry/Uživatelé
CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  partner1_name VARCHAR(100),
  partner2_name VARCHAR(100),
  wedding_date DATE,
  wedding_size VARCHAR(20) CHECK (wedding_size IN ('small', 'medium', 'large')),
  budget_total DECIMAL(12,2),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checklist položky
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  due_date DATE,
  priority VARCHAR(20) CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rozpočet položky
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  category VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  paid BOOLEAN DEFAULT false,
  vendor_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hosté
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  group_name VARCHAR(100),
  plus_one BOOLEAN DEFAULT false,
  dietary_requirements TEXT,
  rsvp_status VARCHAR(20) DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined')),
  rsvp_date TIMESTAMP WITH TIME ZONE,
  table_assignment VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat historie
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_checklist_couple ON checklist_items(couple_id);
CREATE INDEX IF NOT EXISTS idx_checklist_due ON checklist_items(due_date);
CREATE INDEX IF NOT EXISTS idx_budget_couple ON budget_items(couple_id);
CREATE INDEX IF NOT EXISTS idx_guests_couple ON guests(couple_id);
CREATE INDEX IF NOT EXISTS idx_chat_couple ON chat_messages(couple_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at);

-- RLS
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Politiky - uživatel vidí pouze svá data
CREATE POLICY "Users can view own couple data" ON couples
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own checklist" ON checklist_items
  FOR ALL USING (couple_id = auth.uid());

CREATE POLICY "Users can manage own budget" ON budget_items
  FOR ALL USING (couple_id = auth.uid());

CREATE POLICY "Users can manage own guests" ON guests
  FOR ALL USING (couple_id = auth.uid());

CREATE POLICY "Users can manage own chat" ON chat_messages
  FOR ALL USING (couple_id = auth.uid());

-- Trigger pro updated_at na couples
CREATE TRIGGER update_couples_updated_at
  BEFORE UPDATE ON couples
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
