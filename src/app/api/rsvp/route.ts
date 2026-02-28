import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// Validacni schema
const rsvpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  attending: z.enum(['yes', 'no']),
  guestCount: z.number().min(1).max(5).optional(),
  dietary: z.string().optional(),
  notes: z.string().optional(),
  websiteId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validace
    const result = rsvpSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Neplatna data', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;
    const supabase = await createClient();

    // Ulozit RSVP do guests tabulky (spojeno s wedding_website)
    if (data.websiteId) {
      // Najit couple_id pro tento website
      const { data: website } = await supabase
        .from('wedding_websites')
        .select('couple_id')
        .eq('id', data.websiteId)
        .single();

      if (!website) {
        return NextResponse.json(
          { error: 'Svatebni web nenalezen' },
          { status: 404 }
        );
      }

      // Zkontrolovat jestli uz RSVP existuje pro tento email
      const { data: existingGuest } = await supabase
        .from('guests')
        .select('id')
        .eq('couple_id', website.couple_id)
        .eq('email', data.email)
        .single();

      if (existingGuest) {
        // Update existujiciho
        const { error } = await supabase
          .from('guests')
          .update({
            rsvp_status: data.attending === 'yes' ? 'confirmed' : 'declined',
            plus_ones: (data.guestCount || 1) - 1,
            dietary_notes: data.dietary || null,
            notes: data.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingGuest.id);

        if (error) {
          console.error('RSVP update error:', error);
          return NextResponse.json(
            { error: 'Chyba pri aktualizaci RSVP' },
            { status: 500 }
          );
        }
      } else {
        // Insert noveho hosta
        const { error } = await supabase.from('guests').insert({
          couple_id: website.couple_id,
          name: data.name,
          email: data.email,
          rsvp_status: data.attending === 'yes' ? 'confirmed' : 'declined',
          plus_ones: (data.guestCount || 1) - 1,
          dietary_notes: data.dietary || null,
          notes: data.notes || null,
        });

        if (error) {
          console.error('RSVP insert error:', error);
          return NextResponse.json(
            { error: 'Chyba pri ukladani RSVP' },
            { status: 500 }
          );
        }
      }
    } else {
      // Fallback - ulozit do rsvp_responses (stara tabulka)
      // Pro zpetnou kompatibilitu s existujicimi weby bez websiteId
      const { error } = await supabase.from('rsvp_responses').insert({
        guest_name: data.name,
        email: data.email,
        attending: data.attending === 'yes',
        guest_count: data.guestCount || 1,
        dietary_requirements: data.dietary || null,
        notes: data.notes || null,
      });

      if (error) {
        console.error('RSVP fallback insert error:', error);
        return NextResponse.json(
          { error: 'Chyba pri ukladani RSVP' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: true, message: 'RSVP uspesne ulozeno' },
      { status: 200 }
    );
  } catch (error) {
    console.error('RSVP error:', error);
    return NextResponse.json(
      { error: 'Interni chyba serveru' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'RSVP API endpoint - use POST to submit' },
    { status: 200 }
  );
}
