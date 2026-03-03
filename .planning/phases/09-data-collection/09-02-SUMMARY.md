---
phase: 09-data-collection
plan: 02
subsystem: analytics
tags: [utm, attribution, localStorage, onboarding, oauth, supabase]

# Dependency graph
requires:
  - phase: 07-enhanced-onboarding
    provides: onboarding URLSearchParams passthrough and btoa OAuth blob pattern
  - phase: 09-data-collection
    provides: couples table schema with utm_source/medium/campaign columns (plan 01)
provides:
  - UTM parameter capture on landing page via localStorage
  - UTM passthrough from onboarding finish() to register via URLSearchParams
  - UTM persistence in couples table for both email and OAuth signup paths
affects: [analytics, attribution, marketing-reporting]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - localStorage svoji_utm key for cross-page UTM persistence
    - try/catch guards on localStorage reads for private browsing safety
    - null-safe UTM: empty strings become null in DB (|| null pattern)

key-files:
  created: []
  modified:
    - src/components/landing/Hero.tsx
    - src/app/(auth)/onboarding/page.tsx
    - src/app/(auth)/register/page.tsx
    - src/app/auth/callback/route.ts

key-decisions:
  - "UTM stored in localStorage under svoji_utm key as JSON object -- survives SPA navigation"
  - "Only store UTM if utm_source is present -- no point writing empty data"
  - "Empty string UTM values from URL params stored as null in DB (|| null) -- clean data"
  - "OAuth path persists UTM via btoa blob decoding in auth/callback -- same pattern as onboarding data"

patterns-established:
  - "localStorage svoji_utm: JSON object with utm_source, utm_medium, utm_campaign -- read in onboarding finish()"
  - "Null-safe UTM: searchParams.get('utm_source') || null -- ensures clean DB state for users without UTM"

requirements-completed: [DATA-03]

# Metrics
duration: 10min
completed: 2026-03-03
---

# Phase 9 Plan 02: UTM Attribution Pipeline Summary

**End-to-end UTM attribution: landing page localStorage capture through onboarding passthrough to couples table persistence for both email and OAuth signup paths**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-03T21:10:00Z
- **Completed:** 2026-03-03T21:20:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Hero.tsx captures utm_source/medium/campaign from URL on mount, stores to localStorage as svoji_utm JSON
- Onboarding finish() reads UTM from localStorage and forwards via URLSearchParams to /register
- register/page.tsx onboardingData object includes UTM fields (null-safe), automatically included in both email upsert (via spread) and OAuth btoa blob
- auth/callback/route.ts explicitly includes utm_source/medium/campaign in couples upsert for OAuth users

## Task Commits

Each task was committed atomically:

1. **Task 1: Capture UTM params on landing page and forward through onboarding to register** - `0f313bd` (feat)
2. **Task 2: Persist UTM data in register page (email + OAuth paths) and auth callback** - `bda64d3` (feat)

## Files Created/Modified
- `src/components/landing/Hero.tsx` - Added useEffect that captures UTM from URL to localStorage svoji_utm
- `src/app/(auth)/onboarding/page.tsx` - finish() reads UTM from localStorage, appends to URLSearchParams
- `src/app/(auth)/register/page.tsx` - onboardingData now includes utm_source/medium/campaign (null-safe)
- `src/app/auth/callback/route.ts` - couples upsert now includes UTM fields from decoded onboarding blob

## Decisions Made
- Store UTM only if utm_source is present: no empty object written to localStorage when no UTM in URL
- Empty string URL params coerced to null before DB write: keeps data clean for users without attribution
- OAuth path reuses existing btoa blob pattern from Phase 7: no new mechanism needed, UTM fields just added to the existing onboardingData object

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. Requires couples table to have utm_source, utm_medium, utm_campaign columns (added in plan 09-01 migration 007).

## Next Phase Readiness
- UTM attribution pipeline complete. Data will flow into couples table from next signup onwards.
- Phase 9 plan 03+ can proceed with demand signal logging and analytics.

---
*Phase: 09-data-collection*
*Completed: 2026-03-03*
