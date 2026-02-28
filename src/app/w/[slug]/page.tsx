import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/ui/Navigation';
import { Footer } from '@/components/ui/Footer';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Timeline } from '@/components/sections/Timeline';
import { Locations } from '@/components/sections/Locations';
import { Gallery } from '@/components/sections/Gallery';
import { Contacts } from '@/components/sections/Contacts';
import { RSVP } from '@/components/sections/RSVP';

interface WeddingWebsite {
  id: string;
  couple_id: string;
  slug: string;
  headline: string;
  subheadline: string;
  story: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  show_timeline: boolean;
  show_gallery: boolean;
  show_locations: boolean;
  show_rsvp: boolean;
  show_contacts: boolean;
  show_dress_code: boolean;
  rsvp_deadline: string | null;
  rsvp_message: string | null;
  dress_code_title: string;
  dress_code_description: string | null;
  published: boolean;
  couples: {
    partner1_name: string;
    partner2_name: string;
    wedding_date: string;
  };
}

interface TimelineItem {
  time: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
}

interface Location {
  type: string;
  name: string;
  address: string;
  time: string;
  description: string;
  lat: number;
  lng: number;
  map_url: string;
}

interface GalleryImage {
  image_url: string;
  caption: string;
}

interface Contact {
  name: string;
  role: string;
  phone: string;
  email: string;
}

export default async function WeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Načíst svatební web podle slugu
  const { data: website } = await supabase
    .from('wedding_websites')
    .select(`
      *,
      couples (
        partner1_name,
        partner2_name,
        wedding_date
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (!website) {
    notFound();
  }

  const typedWebsite = website as WeddingWebsite;

  // Načíst související data paralelně
  const [timelineRes, locationsRes, galleryRes, contactsRes] = await Promise.all([
    supabase
      .from('wedding_timeline')
      .select('*')
      .eq('website_id', typedWebsite.id)
      .order('sort_order'),
    supabase
      .from('wedding_locations')
      .select('*')
      .eq('website_id', typedWebsite.id)
      .order('sort_order'),
    supabase
      .from('wedding_gallery')
      .select('*')
      .eq('website_id', typedWebsite.id)
      .order('sort_order'),
    supabase
      .from('wedding_contacts')
      .select('*')
      .eq('website_id', typedWebsite.id)
      .order('sort_order'),
  ]);

  const timeline = (timelineRes.data || []) as TimelineItem[];
  const locations = (locationsRes.data || []) as Location[];
  const gallery = (galleryRes.data || []) as GalleryImage[];
  const contacts = (contactsRes.data || []) as Contact[];

  const couple = typedWebsite.couples;
  const weddingDate = new Date(couple.wedding_date);

  return (
    <div
      style={{
        ['--color-primary' as string]: typedWebsite.primary_color,
        ['--color-secondary' as string]: typedWebsite.secondary_color,
      }}
    >
      <Navigation />

      <main>
        <Hero
          partner1={couple.partner1_name}
          partner2={couple.partner2_name}
          date={weddingDate}
          headline={typedWebsite.headline}
          subheadline={typedWebsite.subheadline}
        />

        {typedWebsite.story && (
          <About
            title="Nas pribeh"
            story={typedWebsite.story}
          />
        )}

        {typedWebsite.show_timeline && timeline.length > 0 && (
          <Timeline
            items={timeline.map((item) => ({
              time: item.time,
              title: item.title,
              description: item.description,
              icon: item.icon,
            }))}
          />
        )}

        {typedWebsite.show_locations && locations.length > 0 && (
          <Locations
            locations={locations.map((loc) => ({
              type: loc.type as 'ceremony' | 'reception' | 'parking',
              name: loc.name,
              address: loc.address,
              time: loc.time,
              description: loc.description,
              coordinates: { lat: loc.lat, lng: loc.lng },
              mapUrl: loc.map_url,
            }))}
          />
        )}

        {typedWebsite.show_gallery && gallery.length > 0 && (
          <Gallery
            images={gallery.map((img) => ({
              url: img.image_url,
              caption: img.caption,
            }))}
          />
        )}

        {typedWebsite.show_contacts && contacts.length > 0 && (
          <Contacts
            contacts={contacts.map((c) => ({
              name: c.name,
              role: c.role,
              phone: c.phone,
            }))}
            dressCode={
              typedWebsite.show_dress_code && typedWebsite.dress_code_description
                ? {
                    title: typedWebsite.dress_code_title,
                    description: typedWebsite.dress_code_description,
                  }
                : undefined
            }
          />
        )}

        {typedWebsite.show_rsvp && (
          <RSVP
            deadline={
              typedWebsite.rsvp_deadline
                ? new Date(typedWebsite.rsvp_deadline)
                : new Date(couple.wedding_date)
            }
            contactEmail=""
            websiteId={typedWebsite.id}
          />
        )}
      </main>

      <Footer
        partner1={couple.partner1_name}
        partner2={couple.partner2_name}
      />
    </div>
  );
}

// Dynamicka generace - ne staticka (cookies potrebuji request scope)
export const dynamic = 'force-dynamic';
