---
phase: 09-data-collection
plan: 01
subsystem: database
tags: [supabase, postgres, typescript, rls, engagement-tracking, demand-signals]

# Dependency graph
requires:
  - phase: 08-ai-pipeline
    provides: demand-logger.ts and intent-classifier.ts with vendor_search signal logging
  - phase: 05-auth-foundation
    provides: couples table and RLS patterns
provides:
  - engagement_events table with 4 typed event types and RLS
  - demand_signals.source_intent column distinguishing vendor_search vs budget_add
  - couples.utm_source/utm_medium/utm_campaign columns
  - engagement-logger.ts fire-and-forget utility
  - extended demand-logger.ts with sourceIntent param and budget_add extraction
  - extended isDemandSignal() covering both vendor_search and budget_add
affects:
  - 09-data-collection plan-03 (integration wiring)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Fire-and-forget engagement logging (never throws, never blocks caller)
    - Source intent tracking on demand signals for multi-origin attribution

key-files:
  created:
    - supabase/migrations/007_data_collection.sql
    - src/lib/engagement-logger.ts
  modified:
    - src/lib/ai/demand-logger.ts
    - src/lib/ai/intent-classifier.ts

key-decisions:
  - "extractDemandSignal() accepts optional sourceIntent to enable budget_add category mapping via params.name (budget_add uses name not category param)"
  - "params.amount mapped to budget_hint for budget_add intents (classifier extracts amount field, not budget_hint)"
  - "logDemandSignal() sourceIntent defaults to 'vendor_search' for backward compatibility with existing callers"

patterns-established:
  - "Fire-and-forget utility pattern: try/catch with console.error, never re-throw, always void return"
  - "DB CHECK constraint mirrors TypeScript union type for event_type and source_intent"

requirements-completed: [DATA-01, DATA-02]

# Metrics
duration: 2min
completed: 2026-03-03
---

# Phase 9 Plan 01: Data Collection Schema Summary

**Migration 007 + engagement-logger.ts + extended demand signal pipeline: engagement_events table, source_intent tracking on demand_signals, and budget_add as a demand signal source**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-03T21:19:00Z
- **Completed:** 2026-03-03T21:20:01Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created `supabase/migrations/007_data_collection.sql` with engagement_events table (4 typed event types, RLS), demand_signals.source_intent column, and UTM columns on couples
- Created `src/lib/engagement-logger.ts` with typed `EngagementEventType` union and fire-and-forget `logEngagementEvent()`
- Extended `isDemandSignal()` to return true for `budget_add` in addition to `vendor_search`
- Extended `logDemandSignal()` with optional `sourceIntent` param (default `'vendor_search'`) included in DB insert
- Extended `extractDemandSignal()` to map `params.name` to `category` and `params.amount` to `budget_hint` for budget_add intents

## Task Commits

Each task was committed atomically:

1. **Task 1: Migration 007 data collection schema** - `9e32861` (feat)
2. **Task 2: Engagement logger + extend demand signal modules** - `f71dbc5` (feat)

## Files Created/Modified
- `supabase/migrations/007_data_collection.sql` - engagement_events table, demand_signals extension, couples UTM columns
- `src/lib/engagement-logger.ts` - new fire-and-forget engagement event logger
- `src/lib/ai/demand-logger.ts` - extended with sourceIntent param and budget_add field mapping
- `src/lib/ai/intent-classifier.ts` - isDemandSignal() extended to cover budget_add

## Decisions Made
- `extractDemandSignal()` accepts optional `sourceIntent` to enable budget_add category mapping: budget_add uses `params.name` (not `params.category`) since the classifier extracts the budget item name into that field
- `params.amount` mapped to `budget_hint` for budget_add (classifier emits `amount`, not `budget_hint`)
- `logDemandSignal()` sourceIntent defaults to `'vendor_search'` for backward compatibility with existing callers in Phase 8 AI pipeline

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
Migration 007 must be applied to Supabase. Run via Supabase CLI (`npx supabase db push`) or paste SQL into the Supabase SQL editor for the project.

## Self-Check: PASSED

All files exist. Both commits present (9e32861, f71dbc5). TypeScript compiles clean.

## Next Phase Readiness
- All DB schema changes ready for deployment
- engagement-logger.ts and extended demand-logger.ts ready for integration wiring in Plan 03
- TypeScript compiles clean with no errors

---
*Phase: 09-data-collection*
*Completed: 2026-03-03*
