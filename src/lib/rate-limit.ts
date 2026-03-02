import { SupabaseClient } from '@supabase/supabase-js';

// Rate limiting constants
const DAILY_LIMIT = 50;
const WARNING_THRESHOLD = 45;
const TIMEZONE = 'Europe/Prague';

interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  warning: boolean;
  remaining: number;
  resetAt: string | null;
}

/**
 * Check and increment the chat rate limit for a couple.
 *
 * This function atomically increments the message count and checks
 * against the daily limit (50 messages/day). It also provides warnings
 * at 45 messages.
 *
 * @param supabase - Supabase client
 * @param coupleId - UUID of the couple
 * @returns Rate limit status
 */
export async function checkAndIncrementChatLimit(
  supabase: SupabaseClient,
  coupleId: string
): Promise<RateLimitResult> {
  // Call the atomic increment function
  const { data, error } = await supabase.rpc('increment_chat_count', {
    p_couple_id: coupleId
  });

  if (error) {
    console.error('Rate limit check failed:', error);
    // On error, allow the message but log the issue
    return {
      allowed: true,
      count: 0,
      limit: DAILY_LIMIT,
      warning: false,
      remaining: DAILY_LIMIT,
      resetAt: null
    };
  }

  const result = Array.isArray(data) ? data[0] : data;
  const newCount = result.new_count;
  const isNewWindow = result.is_new_window;

  // Calculate next midnight in Prague time
  const now = new Date();
  const prague = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
  const tomorrow = new Date(prague);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const resetAt = tomorrow.toISOString();

  // Determine if allowed and if warning should be shown
  const allowed = newCount <= DAILY_LIMIT;
  const warning = newCount >= WARNING_THRESHOLD && newCount <= DAILY_LIMIT;
  const remaining = Math.max(0, DAILY_LIMIT - newCount);

  return {
    allowed,
    count: newCount,
    limit: DAILY_LIMIT,
    warning,
    remaining,
    resetAt
  };
}

/**
 * Get the current rate limit status without incrementing.
 *
 * @param supabase - Supabase client
 * @param coupleId - UUID of the couple
 * @returns Current rate limit status
 */
export async function getRateLimitStatus(
  supabase: SupabaseClient,
  coupleId: string
): Promise<RateLimitResult> {
  const { data, error } = await supabase
    .from('chat_rate_limits')
    .select('message_count, window_start')
    .eq('couple_id', coupleId)
    .single();

  if (error || !data) {
    // No rate limit record yet
    return {
      allowed: true,
      count: 0,
      limit: DAILY_LIMIT,
      warning: false,
      remaining: DAILY_LIMIT,
      resetAt: null
    };
  }

  // Check if window has expired (past midnight)
  const now = new Date();
  const prague = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
  const todayStart = new Date(prague);
  todayStart.setHours(0, 0, 0, 0);

  const windowStart = new Date(data.window_start);
  const isNewWindow = windowStart < todayStart;

  const count = isNewWindow ? 0 : data.message_count;
  const allowed = count < DAILY_LIMIT;
  const warning = count >= WARNING_THRESHOLD && count < DAILY_LIMIT;
  const remaining = Math.max(0, DAILY_LIMIT - count);

  // Calculate next midnight in Prague time
  const tomorrow = new Date(prague);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const resetAt = tomorrow.toISOString();

  return {
    allowed,
    count,
    limit: DAILY_LIMIT,
    warning,
    remaining,
    resetAt
  };
}
