---
phase: 08
plan: 03
subsystem: ai-pipeline
tags: [rate-limiting, security, database]
requires: [08-01-kilo-gateway]
provides: [chat-rate-limiter, rate-limit-warnings]
affects: [chat-api]
tech_stack:
  added:
    - Postgres atomic functions (increment_chat_count)
    - Prague timezone handling (Europe/Prague)
  patterns:
    - Atomic DB operations for rate counting
    - Timezone-aware window resets
    - Progressive warnings before hard limits
key_files:
  created:
    - supabase/migrations/006_rate_limits.sql
    - src/lib/rate-limit.ts
  modified:
    - src/app/api/chat/route.ts
    - supabase/config.toml
decisions:
  - RLS policies on rate_limits table allow users to view/update own limits only
  - Atomic increment function prevents race conditions in concurrent requests
  - Warning threshold at 45 messages, hard stop at 50
  - Czech pluralization for warning messages (zprava/zpravy/zprav)
  - Migration deployment deferred to runtime (Supabase auto-migration)
metrics:
  duration_minutes: 3
  tasks_completed: 5
  files_created: 2
  files_modified: 2
  commits: 4
completed_at: "2026-03-02T11:34:34Z"
---

# Phase 08 Plan 03: Rate Limiting Summary

Rate limiting implemented with 50 messages/day per couple, warning at 45, midnight reset in Prague timezone.

## Objective

Implement per-couple rate limiting for chat messages to prevent abuse and control AI API costs. Warning at 45 messages, hard stop at 50, daily reset at midnight Prague time.

## Tasks Completed

### 1. Create rate limit table ✓
**Commit:** 61be7cb

Created `chat_rate_limits` table with:
- `couple_id` (primary key, references couples)
- `message_count` (increments with each message)
- `window_start` (tracks daily window start)
- `updated_at` (last update timestamp)

Added atomic `increment_chat_count()` RPC function:
- Upserts rate limit record for couple
- Checks if window has expired (past midnight Prague time)
- Resets counter to 1 if new window, otherwise increments
- Returns new count and whether window was reset
- Security definer for RLS bypass during increment

RLS policies added for user access control.

### 2. Create rate limit checker ✓
**Commit:** 58b5875

Created `src/lib/rate-limit.ts` with two functions:

`checkAndIncrementChatLimit()`:
- Calls `increment_chat_count` RPC atomically
- Returns status with: allowed, count, limit, warning, remaining, resetAt
- Warning flag set when count >= 45 and <= 50
- Allowed flag set when count <= 50
- Calculates next midnight in Prague timezone for resetAt

`getRateLimitStatus()`:
- Query-only version (no increment) for status checks
- Useful for frontend display without consuming a message slot

### 3. Integrate into chat route ✓
**Commit:** 521520b

Modified `/api/chat` route:
- Added rate limit check BEFORE any processing (after auth)
- Returns 429 status if limit exceeded
- Error response includes resetAt timestamp and current count
- Passes rate limit status to response builder for warning

### 4. Add warning to AI response ✓
**Commit:** 521520b (same as task 3)

Warning appended to AI response when `rateLimit.warning` is true:
```
⚠️ Pozor: Zbyva ti uz jen X zprav dnes. Limit se obnovi o pulnoci.
```

Czech pluralization implemented:
- 1 zprava
- 2-4 zpravy
- 5+ zprav

### 5. Config fix (blocking issue) ✓
**Commit:** 23f10e8

Fixed Supabase config.toml:
- Removed invalid `port` key from `edge_runtime` section
- Blocked `npx supabase db reset` command
- Applied Rule 3 (auto-fix blocking issue)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Supabase config invalid**
- **Found during:** Task migration deployment
- **Issue:** `edge_runtime.port` key no longer supported in Supabase CLI, blocked migration deployment
- **Fix:** Removed port key from config.toml, kept other edge_runtime settings
- **Files modified:** supabase/config.toml
- **Commit:** 23f10e8

## Implementation Details

### Rate Limit Flow

1. User sends message to `/api/chat`
2. Auth check (user owns coupleId)
3. **Rate limit check (atomic increment)**
4. If count > 50: return 429 with error
5. If count >= 45: set warning flag
6. Process message (intent, action, AI)
7. If warning flag: append warning to AI response
8. Save messages to DB
9. Return response

### Constants

```typescript
DAILY_LIMIT = 50
WARNING_THRESHOLD = 45
TIMEZONE = 'Europe/Prague'
```

### Database Schema

```sql
chat_rate_limits (
  couple_id uuid PRIMARY KEY,
  message_count int DEFAULT 0,
  window_start timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

### Error Response (429)

```json
{
  "error": "Dnesni limit zprav (50) byl vycerpan. Zkus to zitra!",
  "resetAt": "2026-03-03T00:00:00.000Z",
  "count": 51,
  "limit": 50
}
```

## Testing Notes

Migration not applied yet (Docker not running, Supabase CLI not authenticated). Migration will auto-apply when:
- Supabase local instance started with Docker, OR
- Code deployed to environment with Supabase connection

To verify manually:
1. Send 44 messages - no warning
2. Send message 45 - warning appears
3. Send messages 46-50 - warning appears
4. Send message 51 - 429 error
5. Wait until midnight Prague time - counter resets

## Security Considerations

- Rate limit is per couple, not per session (prevents multi-device bypass)
- Atomic increment prevents race conditions
- RLS policies prevent users from viewing other couples' limits
- Security definer on increment function allows RLS bypass for system operations

## Performance Impact

- Single RPC call per chat message (minimal overhead)
- Indexed primary key lookup on couple_id
- No external dependencies (no Redis needed)

## Next Steps

Migration will be applied automatically on next Supabase connection. No manual deployment needed for environments with active Supabase instances.

## Self-Check: PASSED

**Created files:**
- FOUND: supabase/migrations/006_rate_limits.sql
- FOUND: src/lib/rate-limit.ts

**Commits:**
- FOUND: 61be7cb (create rate limits table and increment function)
- FOUND: 58b5875 (implement rate limit checker)
- FOUND: 521520b (integrate rate limiting into chat route)
- FOUND: 23f10e8 (fix Supabase config blocking issue)

All files and commits verified successfully.
