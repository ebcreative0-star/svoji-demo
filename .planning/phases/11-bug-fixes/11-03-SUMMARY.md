---
phase: 11-bug-fixes
plan: 03
subsystem: auth
tags: [google-oauth, supabase, cookies, onboarding]

requires:
  - phase: 11-bug-fixes/11-02
    provides: OAuth redirect loop investigation and baseline callback structure

provides:
  - Cookie-based onboarding data bridge across Google OAuth redirect
  - Correct isFirstLogin detection for new Google users
  - New Google users land on /chat after completing onboarding

affects: [auth, onboarding, register]

tech-stack:
  added: []
  patterns:
    - "Cookie bridge pattern: set cookie before OAuth redirect, read+delete in callback"
    - "svoji_onboarding cookie: base64 JSON, 10min TTL, SameSite=Lax"

key-files:
  created: []
  modified:
    - src/app/(auth)/register/page.tsx
    - src/app/auth/callback/route.ts

key-decisions:
  - "Cookie over query param for onboarding data: Supabase strips custom params from OAuth redirectTo, cookie survives round-trip"
  - "One-time cookie: deleted immediately after reading in callback to prevent stale data leaking into future logins"
  - "onboardingParam kept as primary source, cookie as fallback: backward compatible if query param ever works"

patterns-established:
  - "OAuth data bridge via cookie: set before redirect, delete after read"

requirements-completed: [BUG-02]

duration: 8min
completed: 2026-03-14
---

# Phase 11 Plan 03: Google OAuth Onboarding Cookie Bridge Summary

**Cookie-based onboarding data persistence across Google OAuth redirect -- new users now land on /chat instead of looping back to /onboarding**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-14T11:00:00Z
- **Completed:** 2026-03-14T11:08:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Register page sets `svoji_onboarding` cookie (base64 JSON, 10min TTL) before Google OAuth redirect instead of relying on stripped query params
- Auth callback reads cookie as fallback when `onboarding` query param is absent, then deletes cookie immediately (one-time use)
- `isFirstLogin` now correctly detects new Google users: cookie presence signals first-time onboarding flow, triggers redirect to /chat
- Returning Google users (no cookie, no param) still fall through to couple lookup and redirect to /checklist or /onboarding

## Task Commits

Each task was committed atomically:

1. **Task 1: Persist onboarding data in cookie before Google OAuth redirect** - `2c6c63f` (feat)
2. **Task 2: Read onboarding data from cookie in auth callback** - `9479f92` (feat)

## Files Created/Modified

- `src/app/(auth)/register/page.tsx` - Replaced query param approach with document.cookie set before signInWithOAuth; simplified callbackUrl to plain string
- `src/app/auth/callback/route.ts` - Added cookie fallback via cookieStore.get/delete; replaced onboardingParam references with onboardingRaw throughout

## Decisions Made

- Cookie name `svoji_onboarding` with `max-age=600` (10min): ample time for OAuth round-trip, short enough to not linger
- `SameSite=Lax` required: OAuth redirect is a top-level navigation, Strict would block the cookie
- Cookie deleted immediately after reading: prevents stale onboarding data from being applied on future logins

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- BUG-02 resolved: Google OAuth onboarding data loss fixed
- Phase 11 bug fixes complete (BUG-01 through BUG-04 addressed across plans 11-01 to 11-03)
- Ready to proceed to phase 12 or UAT verification

## Self-Check: PASSED

- `src/app/(auth)/register/page.tsx` -- FOUND
- `src/app/auth/callback/route.ts` -- FOUND
- `.planning/phases/11-bug-fixes/11-03-SUMMARY.md` -- FOUND
- Commit `2c6c63f` -- FOUND
- Commit `9479f92` -- FOUND

---
*Phase: 11-bug-fixes*
*Completed: 2026-03-14*
