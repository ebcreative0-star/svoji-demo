-- Svatební weby pro hosty
-- Spusť tento SQL v Supabase SQL Editoru PO 002_couples_and_planning.sql

-- Tabulka pro svatební weby
CREATE TABLE IF NOT EXISTS wedding_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE UNIQUE,
  slug VARCHAR(50) UNIQUE NOT NULL,

  -- Základní info
  headline VARCHAR(255) DEFAULT 'Bereme se!',
  subheadline VARCHAR(255) DEFAULT 'A rádi bychom to oslavili s vámi',
  story TEXT,

  -- Design
  primary_color VARCHAR(7) DEFAULT '#8B7355',
  secondary_color VARCHAR(7) DEFAULT '#F5F1EB',
  font_family VARCHAR(50) DEFAULT 'Playfair Display',

  -- Sekce toggle
  show_timeline BOOLEAN DEFAULT true,
  show_gallery BOOLEAN DEFAULT true,
  show_locations BOOLEAN DEFAULT true,
  show_rsvp BOOLEAN DEFAULT true,
  show_contacts BOOLEAN DEFAULT true,
  show_dress_code BOOLEAN DEFAULT true,

  -- RSVP nastavení
  rsvp_deadline DATE,
  rsvp_message TEXT,

  -- Dress code
  dress_code_title VARCHAR(100) DEFAULT 'Dress Code',
  dress_code_description TEXT,

  -- Metadata
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timeline položky pro svatební web
CREATE TABLE IF NOT EXISTS wedding_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES wedding_websites(id) ON DELETE CASCADE,
  time VARCHAR(10) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(20) DEFAULT 'clock',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Místa pro svatební web
CREATE TABLE IF NOT EXISTS wedding_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES wedding_websites(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('ceremony', 'reception', 'parking', 'accommodation', 'other')),
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  time VARCHAR(10),
  description TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  map_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Galerie pro svatební web
CREATE TABLE IF NOT EXISTS wedding_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES wedding_websites(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(255),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kontakty pro svatební web
CREATE TABLE IF NOT EXISTS wedding_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES wedding_websites(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_wedding_websites_slug ON wedding_websites(slug);
CREATE INDEX IF NOT EXISTS idx_wedding_websites_couple ON wedding_websites(couple_id);
CREATE INDEX IF NOT EXISTS idx_wedding_timeline_website ON wedding_timeline(website_id);
CREATE INDEX IF NOT EXISTS idx_wedding_locations_website ON wedding_locations(website_id);
CREATE INDEX IF NOT EXISTS idx_wedding_gallery_website ON wedding_gallery(website_id);
CREATE INDEX IF NOT EXISTS idx_wedding_contacts_website ON wedding_contacts(website_id);

-- RLS
ALTER TABLE wedding_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_contacts ENABLE ROW LEVEL SECURITY;

-- Politiky - vlastník může spravovat
CREATE POLICY "Users can manage own website" ON wedding_websites
  FOR ALL USING (couple_id = auth.uid());

CREATE POLICY "Users can manage own timeline" ON wedding_timeline
  FOR ALL USING (website_id IN (SELECT id FROM wedding_websites WHERE couple_id = auth.uid()));

CREATE POLICY "Users can manage own locations" ON wedding_locations
  FOR ALL USING (website_id IN (SELECT id FROM wedding_websites WHERE couple_id = auth.uid()));

CREATE POLICY "Users can manage own gallery" ON wedding_gallery
  FOR ALL USING (website_id IN (SELECT id FROM wedding_websites WHERE couple_id = auth.uid()));

CREATE POLICY "Users can manage own contacts" ON wedding_contacts
  FOR ALL USING (website_id IN (SELECT id FROM wedding_websites WHERE couple_id = auth.uid()));

-- Veřejný přístup pro publikované weby (pouze SELECT)
CREATE POLICY "Public can view published websites" ON wedding_websites
  FOR SELECT USING (published = true);

CREATE POLICY "Public can view timeline of published websites" ON wedding_timeline
  FOR SELECT USING (website_id IN (SELECT id FROM wedding_websites WHERE published = true));

CREATE POLICY "Public can view locations of published websites" ON wedding_locations
  FOR SELECT USING (website_id IN (SELECT id FROM wedding_websites WHERE published = true));

CREATE POLICY "Public can view gallery of published websites" ON wedding_gallery
  FOR SELECT USING (website_id IN (SELECT id FROM wedding_websites WHERE published = true));

CREATE POLICY "Public can view contacts of published websites" ON wedding_contacts
  FOR SELECT USING (website_id IN (SELECT id FROM wedding_websites WHERE published = true));

-- Trigger pro updated_at
CREATE TRIGGER update_wedding_websites_updated_at
  BEFORE UPDATE ON wedding_websites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
