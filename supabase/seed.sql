-- Seed data pro testovani
-- Spust v Supabase SQL Editoru PO vsech migracich

-- POZOR: Nejdriv vytvor uzivatele v Supabase Auth:
-- Email: demo@svoji.cz
-- Password: demo1234
-- Pak ziskej jeho UUID a nahrad nize

-- Priklad UUID (nahrad skutecnym po vytvoreni uzivatele):
-- INSERT INTO couples (id, partner1_name, partner2_name, wedding_date, wedding_size, budget_total, onboarding_completed)
-- VALUES ('UUID-Z-AUTH', 'Anna', 'Tomas', '2025-09-20', 'medium', 250000, true);

-- Demo par
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Zkus najit demo uzivatele
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@svoji.cz' LIMIT 1;

  IF demo_user_id IS NULL THEN
    RAISE NOTICE 'Demo uzivatel neexistuje. Vytvor ho v Supabase Auth: demo@svoji.cz / demo1234';
    RETURN;
  END IF;

  -- Vloz couple data
  INSERT INTO couples (id, partner1_name, partner2_name, wedding_date, wedding_size, budget_total, onboarding_completed)
  VALUES (demo_user_id, 'Anna', 'Tomas', '2025-09-20', 'medium', 250000, true)
  ON CONFLICT (id) DO UPDATE SET
    partner1_name = EXCLUDED.partner1_name,
    partner2_name = EXCLUDED.partner2_name,
    wedding_date = EXCLUDED.wedding_date;

  -- Checklist items
  INSERT INTO checklist_items (couple_id, title, description, category, due_date, priority, completed) VALUES
  (demo_user_id, 'Rezervovat misto pro obrad', 'Kaple nebo radnice', 'venue', '2025-03-15', 'urgent', true),
  (demo_user_id, 'Vybrat fotografa', 'Projit portfolia, domluvit schuzku', 'vendors', '2025-04-01', 'high', true),
  (demo_user_id, 'Objednat svatebni saty', 'Salon v Praze', 'attire', '2025-04-15', 'high', false),
  (demo_user_id, 'Poslat oznameni', 'Design + tisk + rozeslani', 'guests', '2025-05-01', 'medium', false),
  (demo_user_id, 'Vybrat menu', 'Degustace v restauraci', 'catering', '2025-05-15', 'medium', false),
  (demo_user_id, 'Objednat kytice', 'Svatebni + dekorace', 'decor', '2025-06-01', 'medium', false),
  (demo_user_id, 'Pripravit playlist', 'Prvni tanec, party', 'entertainment', '2025-07-01', 'low', false),
  (demo_user_id, 'Zkouska ucesu a liceni', 'Termin u vizazistky', 'attire', '2025-08-15', 'medium', false),
  (demo_user_id, 'Vyzvednout prstynky', 'U klenotnika', 'attire', '2025-09-10', 'high', false),
  (demo_user_id, 'Posledni fitting satu', 'Pripadne upravy', 'attire', '2025-09-15', 'high', false);

  -- Budget items
  INSERT INTO budget_items (couple_id, category, name, estimated_cost, actual_cost, paid) VALUES
  (demo_user_id, 'venue', 'Zamek Dobris - pronjem', 80000, 75000, true),
  (demo_user_id, 'catering', 'Catering pro 60 lidi', 60000, NULL, false),
  (demo_user_id, 'photo', 'Fotograf Jan Novak', 25000, 25000, true),
  (demo_user_id, 'music', 'DJ + technika', 15000, NULL, false),
  (demo_user_id, 'flowers', 'Kvetiny a dekorace', 12000, NULL, false),
  (demo_user_id, 'attire', 'Svatebni saty', 35000, 32000, true),
  (demo_user_id, 'attire', 'Oblek pro zenicha', 8000, NULL, false),
  (demo_user_id, 'rings', 'Snubni prsteny', 20000, 18500, true),
  (demo_user_id, 'cake', 'Svatebni dort', 8000, NULL, false),
  (demo_user_id, 'other', 'Oznameni a tiskoviny', 5000, 4200, true);

  -- Guests
  INSERT INTO guests (couple_id, name, email, group_name, plus_one, rsvp_status, dietary_requirements) VALUES
  (demo_user_id, 'Marie Novakova', 'marie@email.cz', 'Rodina nevesty', false, 'confirmed', NULL),
  (demo_user_id, 'Jan Novak', 'jan@email.cz', 'Rodina nevesty', false, 'confirmed', NULL),
  (demo_user_id, 'Petra Svobodova', 'petra@email.cz', 'Priatele', true, 'confirmed', 'vegetarian'),
  (demo_user_id, 'Martin Dvorak', 'martin@email.cz', 'Priatele', false, 'confirmed', NULL),
  (demo_user_id, 'Lucie Kralova', 'lucie@email.cz', 'Kolegyni', false, 'pending', NULL),
  (demo_user_id, 'Tomas Maly', 'tomas@email.cz', 'Rodina zenicha', true, 'confirmed', 'bezlepkove'),
  (demo_user_id, 'Eva Velka', 'eva@email.cz', 'Rodina zenicha', false, 'declined', NULL),
  (demo_user_id, 'Pavel Cerny', 'pavel@email.cz', 'Priatele', false, 'pending', NULL);

  -- Chat history
  INSERT INTO chat_messages (couple_id, role, content, created_at) VALUES
  (demo_user_id, 'user', 'Ahoj, kolik stoji svatebni fotograf?', NOW() - INTERVAL '2 days'),
  (demo_user_id, 'assistant', 'Ceny fotografu se v CR pohybuji priblizne takto:

- Zakladni balicek (4-6 hodin): 15-25 tisic Kc
- Celodenni foceni: 25-40 tisic Kc
- Premium fotografove: 40-60 tisic Kc

Vzhledem k vasemu rozpoctu 250 000 Kc bych doporucila pocitat s castkou kolem 25-30 tisic za kvalitniho fotografa.', NOW() - INTERVAL '2 days' + INTERVAL '1 minute'),
  (demo_user_id, 'user', 'Diky! A co je potreba vyridit na matrice?', NOW() - INTERVAL '1 day'),
  (demo_user_id, 'assistant', 'Na matriku budete potrebovat:

1. Vyplneny dotaznik k uzavreni manzelstvi
2. Obcanske prukazy obou snoubencu
3. Rodne listy
4. U rozvedenych: rozsudek o rozvodu

Doporucuji zajit 2-3 mesice pred svatbou. Mate svatbu 20. zari, takze idealne v cervnu/cervenci.', NOW() - INTERVAL '1 day' + INTERVAL '1 minute');

  -- Wedding website
  INSERT INTO wedding_websites (couple_id, slug, headline, subheadline, story, published, show_timeline, show_gallery, show_locations, show_rsvp, show_contacts, show_dress_code, dress_code_description)
  VALUES (demo_user_id, 'anna-tomas', 'Bereme se!', 'A radi bychom to oslavili s vami',
    'Potkali jsme se na vysoke skole v Praze. Anna studovala architekturu, Tomas informatiku. Prvni spolecnou kavu jsme si dali v zari 2018 a od te doby jsme nerozditelni.

Po sesti letech spolecneho zivota jsme se rozhodli udelat dalsi krok. Tomas pozadal Annu o ruku na dovolene v Italii a ona rekla ANO!',
    true, true, true, true, true, true, true, 'Elegantni / Semi-formal. Prosime vyhnete se bile a cerne barve.')
  ON CONFLICT (couple_id) DO UPDATE SET
    published = true;

  RAISE NOTICE 'Demo data uspesne vlozena pro uzivatele %', demo_user_id;
END $$;
