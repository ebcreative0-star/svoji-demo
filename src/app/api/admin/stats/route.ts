import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  // Auth check FIRST -- before any DB queries
  const adminKey = request.headers.get('X-Admin-Key');
  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role key to bypass RLS for cross-user aggregate queries
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Run all queries in parallel
    const [
      signalsCount,
      eventsCount,
      utmUsersCount,
      topCategories,
      recentSignals,
      recentEvents,
    ] = await Promise.all([
      // Total demand signals
      supabase.from('demand_signals').select('id', { count: 'exact', head: true }),
      // Total engagement events
      supabase.from('engagement_events').select('id', { count: 'exact', head: true }),
      // Users with UTM attribution
      supabase.from('couples').select('id', { count: 'exact', head: true }).not('utm_source', 'is', null),
      // Top 5 demand categories
      supabase.from('demand_signals').select('category').order('created_at', { ascending: false }).limit(500),
      // Last 30 days demand signals for daily breakdown
      supabase.from('demand_signals').select('created_at, category, source_intent').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()).order('created_at', { ascending: false }),
      // Last 30 days engagement events for daily breakdown
      supabase.from('engagement_events').select('created_at, event_type').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()).order('created_at', { ascending: false }),
    ]);

    // Compute top 5 categories from raw data
    const categoryCounts: Record<string, number> = {};
    (topCategories.data || []).forEach((row: { category: string }) => {
      categoryCounts[row.category] = (categoryCounts[row.category] || 0) + 1;
    });
    const top5Categories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Compute daily breakdown for last 30 days
    const dailyBreakdown: Record<string, { signals: number; events: number }> = {};
    (recentSignals.data || []).forEach((row: { created_at: string }) => {
      const day = row.created_at.slice(0, 10);
      if (!dailyBreakdown[day]) dailyBreakdown[day] = { signals: 0, events: 0 };
      dailyBreakdown[day].signals++;
    });
    (recentEvents.data || []).forEach((row: { created_at: string }) => {
      const day = row.created_at.slice(0, 10);
      if (!dailyBreakdown[day]) dailyBreakdown[day] = { signals: 0, events: 0 };
      dailyBreakdown[day].events++;
    });

    return NextResponse.json({
      totals: {
        demand_signals: signalsCount.count ?? 0,
        engagement_events: eventsCount.count ?? 0,
        utm_users: utmUsersCount.count ?? 0,
      },
      top_categories: top5Categories,
      daily_breakdown: Object.entries(dailyBreakdown)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, counts]) => ({ date, ...counts })),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
