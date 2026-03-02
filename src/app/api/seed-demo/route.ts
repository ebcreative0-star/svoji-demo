import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Ensure couples row exists
  const { data: couple } = await supabase
    .from('couples')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!couple) {
    const { error: coupleErr } = await supabase.from('couples').insert({
      id: user.id,
      partner1_name: 'Adam',
      partner2_name: 'Eva',
      wedding_date: '2026-09-15',
      wedding_size: 'medium',
      budget_total: 500000,
      onboarding_completed: true,
    });
    if (coupleErr) {
      return NextResponse.json({ error: 'Failed to create couple: ' + coupleErr.message }, { status: 500 });
    }
  }

  // Check if website already exists
  const { data: existing } = await supabase
    .from('wedding_websites')
    .select('id, slug')
    .eq('couple_id', user.id)
    .single();

  if (existing) {
    // Just publish it and set slug to "demo" if needed
    await supabase
      .from('wedding_websites')
      .update({ published: true, slug: 'demo' })
      .eq('id', existing.id);

    return NextResponse.json({ ok: true, slug: 'demo', action: 'published existing' });
  }

  // Create wedding website
  const { data: website, error: wsError } = await supabase
    .from('wedding_websites')
    .insert({
      couple_id: user.id,
      slug: 'demo',
      headline: 'Bereme se!',
      subheadline: 'A rádi bychom to oslavili s vámi',
      story: 'Potkali jsme se jednoho krásného dne a od té doby jsme nerozlučná dvojka. Po letech společných dobrodružství jsme se rozhodli, že to zpečetíme svatbou.',
      primary_color: '#8B7355',
      secondary_color: '#F5F1EB',
      published: true,
      show_timeline: true,
      show_gallery: true,
      show_locations: true,
      show_rsvp: true,
      show_contacts: true,
      show_dress_code: true,
      dress_code_title: 'Dress Code',
      dress_code_description: 'Slavnostní elegance. Pánové oblek, dámy koktejlové nebo dlouhé šaty.',
      rsvp_deadline: '2026-08-01',
    })
    .select('id')
    .single();

  if (wsError) {
    return NextResponse.json({ error: wsError.message }, { status: 500 });
  }

  const wsId = website.id;

  // Seed timeline
  await supabase.from('wedding_timeline').insert([
    { website_id: wsId, time: '14:00', title: 'Obřad', description: 'Slavnostní svatební obřad v kapli', icon: 'heart', sort_order: 0 },
    { website_id: wsId, time: '15:00', title: 'Přípitek', description: 'Společný přípitek na zahradě', icon: 'wine', sort_order: 1 },
    { website_id: wsId, time: '16:00', title: 'Hostina', description: 'Svatební hostina v hlavním sále', icon: 'utensils', sort_order: 2 },
    { website_id: wsId, time: '20:00', title: 'Večerní zábava', description: 'Tanec a hudba do noci', icon: 'music', sort_order: 3 },
  ]);

  // Seed locations
  await supabase.from('wedding_locations').insert([
    { website_id: wsId, type: 'ceremony', name: 'Kaple sv. Anny', address: 'Zahradní 12, Praha 2', time: '14:00', description: 'Historická kaple v centru Prahy', lat: 50.0755, lng: 14.4378, map_url: 'https://maps.google.com/?q=50.0755,14.4378', sort_order: 0 },
    { website_id: wsId, type: 'reception', name: 'Zámek Průhonice', address: 'Zámecká 1, Průhonice', time: '16:00', description: 'Romantický zámek s krásnou zahradou', lat: 50.0003, lng: 14.5561, map_url: 'https://maps.google.com/?q=50.0003,14.5561', sort_order: 1 },
  ]);

  // Seed contacts
  await supabase.from('wedding_contacts').insert([
    { website_id: wsId, name: 'Jana Nováková', role: 'Svědkyně', phone: '+420 777 123 456', email: 'jana@example.com', sort_order: 0 },
    { website_id: wsId, name: 'Petr Svoboda', role: 'Svědek', phone: '+420 777 654 321', email: 'petr@example.com', sort_order: 1 },
  ]);

  return NextResponse.json({ ok: true, slug: 'demo', action: 'created with all sections' });
}
