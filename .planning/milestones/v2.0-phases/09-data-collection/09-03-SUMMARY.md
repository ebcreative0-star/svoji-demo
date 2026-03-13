---
phase: 09-data-collection
plan: 03
subsystem: api
tags: [engagement-tracking, demand-signals, admin, fire-and-forget, nextjs-api]

# Dependency graph
requires:
  - phase: 09-data-collection
    plan: 01
    provides: engagement-logger.ts, extended demand-logger.ts, engagement_events table
affects:
  - data collection pipeline (now live)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Fire-and-forget fetch from client component (fetch().catch(() => {}))
    - Service role bypass for admin aggregate queries

key-files:
  created:
    - src/app/api/track/route.ts
    - src/app/api/admin/stats/route.ts
  modified:
    - src/app/api/chat/route.ts
    - src/components/dashboard/ChecklistView.tsx

key-decisions:
  - "message_sent excluded from /api/track ALLOWED_EVENTS -- only logged server-side to prevent client spoofing"
  - "Admin stats uses createClient() from @supabase/supabase-js directly with service role key -- bypasses RLS for cross-user aggregates"
  - "Demand signal confidence threshold aligned to 0.6 (matches action execution threshold -- was 0.7)"
  - "ADMIN_API_KEY added to .env.local (openssl rand -hex 32 generated)"

requirements-completed: [DATA-01, DATA-02]

# Metrics
duration: 2min
completed: 2026-03-03
---

# Phase 9 Plan 03: Integration Wiring Summary

**All 4 engagement event integration points wired: message_sent from chat route, checklist_item_completed from ChecklistView via /api/track, budget_add demand signals with sourceIntent, and admin stats endpoint with X-Admin-Key auth**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-03T21:22:27Z
- **Completed:** 2026-03-03T21:24:04Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Chat route (`src/app/api/chat/route.ts`): added `logEngagementEvent` for `message_sent` (fire-and-forget after DB insert), updated STEP 5 demand signal block with 0.6 threshold and `sourceIntent` param passed to both `extractDemandSignal()` and `logDemandSignal()`
- Created `src/app/api/track/route.ts`: POST endpoint for 3 client-triggered event types, validates auth (401 if no user), rejects `message_sent` to prevent spoofing, responds immediately
- `src/components/dashboard/ChecklistView.tsx`: added fire-and-forget `fetch('/api/track')` in `toggleItem` -- only fires on completion (not un-completion), sends `item_id`, `item_title`, `item_category` in metadata
- Created `src/app/api/admin/stats/route.ts`: X-Admin-Key secured GET endpoint returning totals (demand_signals, engagement_events, utm_users), top 5 categories by count, 30-day daily breakdown -- uses service role key to bypass RLS

## Task Commits

1. **Task 1: Wire engagement + demand signal logging in chat route, create /api/track endpoint** - `cbace66` (feat)
2. **Task 2: Wire checklist tracking and create admin stats endpoint** - `1ad41d9` (feat)

## Files Created/Modified

- `src/app/api/chat/route.ts` - added logEngagementEvent for message_sent, updated STEP 5 with 0.6 threshold + sourceIntent
- `src/app/api/track/route.ts` - new client-triggered event tracking endpoint
- `src/components/dashboard/ChecklistView.tsx` - fires /api/track on checklist item completion
- `src/app/api/admin/stats/route.ts` - admin-only aggregate stats endpoint

## Decisions Made

- `message_sent` excluded from `/api/track` ALLOWED_EVENTS -- it is only logged server-side in the chat route to prevent any client from spoofing chat activity metrics
- Admin stats endpoint uses `createClient()` from `@supabase/supabase-js` directly with the service role key, not the server helper -- aggregate queries across all couples require RLS bypass
- Demand signal confidence threshold aligned to 0.6 (was 0.7), matching the action execution threshold set in Phase 8 gap closure
- `ADMIN_API_KEY` generated with `openssl rand -hex 32` and added to `.env.local`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

- `SUPABASE_SERVICE_ROLE_KEY` must be present in `.env.local` for the admin stats endpoint (should already exist from Supabase setup)
- `ADMIN_API_KEY` has been added to `.env.local` with a generated secret -- store it securely

## Self-Check: PASSED

All files exist. Both commits present (cbace66, 1ad41d9). TypeScript compiles clean.

---
*Phase: 09-data-collection*
*Completed: 2026-03-03*
