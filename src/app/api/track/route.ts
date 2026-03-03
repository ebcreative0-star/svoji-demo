import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logEngagementEvent, type EngagementEventType } from '@/lib/engagement-logger';

const ALLOWED_EVENTS: EngagementEventType[] = [
  'checklist_item_completed',
  'onboarding_step_completed',
  'upgrade_cta_clicked',
];

export async function POST(request: NextRequest) {
  try {
    const { eventType, metadata } = await request.json();

    if (!eventType || !ALLOWED_EVENTS.includes(eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fire-and-forget -- respond immediately, log async
    logEngagementEvent(supabase, user.id, eventType, metadata).catch((error) => {
      console.error('Track endpoint logging failed:', error);
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Track API error:', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
