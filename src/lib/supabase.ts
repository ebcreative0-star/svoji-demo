import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Typy pro databázi
export interface RSVPResponse {
  id?: string;
  wedding_id: string;
  guest_name: string;
  email: string;
  attending: boolean;
  guest_count: number;
  dietary_requirements?: string;
  notes?: string;
  created_at?: string;
}

export interface Wedding {
  id: string;
  slug: string;
  couple_names: string;
  wedding_date: string;
  hero_image_url?: string;
  primary_color: string;
  created_at: string;
}
