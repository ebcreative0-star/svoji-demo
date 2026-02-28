-- Svatební web - Databázové schéma
-- Spusť tento SQL v Supabase SQL Editoru

-- Svatby (multi-tenant ready)
CREATE TABLE IF NOT EXISTS weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  couple_names VARCHAR(255) NOT NULL,
  wedding_date DATE,
  hero_image_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#8B7355',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RSVP odpovědi
CREATE TABLE IF NOT EXISTS rsvp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  attending BOOLEAN NOT NULL DEFAULT true,
  guest_count INT DEFAULT 1 CHECK (guest_count >= 1 AND guest_count <= 10),
  dietary_requirements TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sekce obsahu (flexibilní struktura)
CREATE TABLE IF NOT EXISTS content_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL, -- 'program', 'location', 'about', 'gallery', etc.
  title VARCHAR(255),
  content JSONB,
  sort_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fotky v galerii
CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Místa
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  location_type VARCHAR(50), -- 'ceremony', 'reception', 'parking', 'accommodation'
  event_time TIME,
  description TEXT,
  map_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timeline (program dne)
CREATE TABLE IF NOT EXISTS timeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  event_time TIME NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'circle',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kontakty
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexy pro rychlejší dotazy
CREATE INDEX IF NOT EXISTS idx_rsvp_wedding ON rsvp_responses(wedding_id);
CREATE INDEX IF NOT EXISTS idx_content_wedding ON content_sections(wedding_id);
CREATE INDEX IF NOT EXISTS idx_gallery_wedding ON gallery_photos(wedding_id);
CREATE INDEX IF NOT EXISTS idx_locations_wedding ON locations(wedding_id);
CREATE INDEX IF NOT EXISTS idx_timeline_wedding ON timeline_items(wedding_id);
CREATE INDEX IF NOT EXISTS idx_contacts_wedding ON contacts(wedding_id);

-- Row Level Security (RLS)
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Politiky pro veřejný přístup (čtení)
CREATE POLICY "Public read access to weddings" ON weddings
  FOR SELECT USING (true);

CREATE POLICY "Public read access to content" ON content_sections
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Public read access to gallery" ON gallery_photos
  FOR SELECT USING (true);

CREATE POLICY "Public read access to locations" ON locations
  FOR SELECT USING (true);

CREATE POLICY "Public read access to timeline" ON timeline_items
  FOR SELECT USING (true);

CREATE POLICY "Public read access to contacts" ON contacts
  FOR SELECT USING (true);

-- RSVP může kdokoliv vložit
CREATE POLICY "Anyone can submit RSVP" ON rsvp_responses
  FOR INSERT WITH CHECK (true);

-- Funkce pro updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggery pro updated_at
CREATE TRIGGER update_weddings_updated_at
  BEFORE UPDATE ON weddings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_sections_updated_at
  BEFORE UPDATE ON content_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
