/**
 * Engagement Event Logger
 * Logs user engagement events to engagement_events table
 * Fire-and-forget pattern -- never throws, never blocks caller
 */

import { SupabaseClient } from '@supabase/supabase-js';

export type EngagementEventType =
  | 'message_sent'
  | 'checklist_item_completed'
  | 'onboarding_step_completed'
  | 'upgrade_cta_clicked';

/**
 * Log an engagement event (async, fire-and-forget)
 */
export async function logEngagementEvent(
  supabase: SupabaseClient,
  coupleId: string,
  eventType: EngagementEventType,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const { error } = await supabase.from('engagement_events').insert({
      couple_id: coupleId,
      event_type: eventType,
      metadata: metadata || null,
    });
    if (error) {
      console.error('Failed to log engagement event:', error);
    }
  } catch (error) {
    console.error('Engagement event logging error:', error);
    // Never throw -- fire-and-forget
  }
}
