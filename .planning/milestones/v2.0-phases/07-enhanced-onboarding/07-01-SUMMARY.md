---
phase: 07-enhanced-onboarding
plan: 01
subsystem: ui
tags: [framer-motion, supabase, onboarding, gdpr, next.js, react]

# Dependency graph
requires:
  - phase: 06-ui-redesign
    provides: Design system tokens (--color-primary, --color-secondary), Button component, raw checkbox pattern
  - phase: 05-auth-foundation
    provides: Auth flow structure, /register route
provides:
  - 6-screen onboarding state machine (GDPR + 5 personalization steps)
  - DB migration 004_onboarding_v2.sql with 6 new couples columns
  - Updated Couple interface with guest_count_range, location, search_radius_km, wedding_style, gdpr_consent_at, marketing_consent
  - URLSearchParams handoff from /onboarding to /register with all collected data
affects:
  - 07-02 (register page reads onboarding URLSearchParams and writes to DB)
  - Any code reading Couple interface (new fields available)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - AnimatePresence mode="wait" crossfade between step panels (key=step triggers exit/enter)
    - Thin motion.div progress bar animated via animate.width prop
    - Preset button selection pattern: border-2 rounded-xl PRESET_ACTIVE/PRESET_INACTIVE constants
    - Onboarding collects data pre-registration, passes via URLSearchParams to /register
    - No DB writes in onboarding flow -- all data forwarded to register page

key-files:
  created:
    - supabase/migrations/004_onboarding_v2.sql
  modified:
    - src/lib/types.ts
    - src/app/(auth)/onboarding/page.tsx

key-decisions:
  - "Onboarding does not write to DB -- all data passed via URLSearchParams to /register"
  - "wedding_size kept in Couple interface as @deprecated (backward compat), superseded by guest_count_range"
  - "Budget step 5 is fully skippable with dedicated Preskocit button when no selection made"
  - "GDPR timestamp captured client-side at moment of consent click, stored in state for forwarding"
  - "Czech city autocomplete via HTML datalist (no external library)"

patterns-established:
  - "Preset button pattern: PRESET_BASE + conditional PRESET_ACTIVE/PRESET_INACTIVE string concat"
  - "Step machine: single step integer state, AnimatePresence key=step, nextStep() validates before increment"

requirements-completed: [SEC-03, ONBD-01, ONBD-02, ONBD-03, ONBD-04, ONBD-05, ONBD-06]

# Metrics
duration: 12min
completed: 2026-03-01
---

# Phase 7 Plan 01: Enhanced Onboarding Summary

**6-screen onboarding state machine (GDPR consent + 5 personalization steps) with Framer Motion crossfade transitions, forwarding all data to /register via URLSearchParams**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-01T21:22:02Z
- **Completed:** 2026-03-01T21:34:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- DB migration adds 6 new columns to couples table (guest_count_range, location, search_radius_km, wedding_style, gdpr_consent_at, marketing_consent)
- Couple TypeScript interface updated with all new fields; wedding_size marked @deprecated
- Onboarding page fully rewritten from 4-step DB-writing flow to 6-screen pre-registration state machine with no Supabase calls
- AnimatePresence mode="wait" crossfades each step; thin progress bar fills steps 1-5
- GDPR screen blocks all progress until mandatory consent accepted; optional marketing consent captured

## Task Commits

1. **Task 1: Create DB migration and update Couple type** - `ead9d4e` (feat)
2. **Task 2: Rewrite onboarding page as 6-screen state machine** - `a4b23b5` (feat)

## Files Created/Modified

- `supabase/migrations/004_onboarding_v2.sql` - ALTER TABLE couples with 6 new columns and CHECK constraint for wedding_style
- `src/lib/types.ts` - Couple interface extended with guest_count_range, location, search_radius_km, wedding_style, gdpr_consent_at, marketing_consent; wedding_size @deprecated
- `src/app/(auth)/onboarding/page.tsx` - Full rewrite: 6-screen state machine, AnimatePresence crossfade, CZECH_CITIES datalist, preset button constants, URLSearchParams redirect to /register

## Decisions Made

- Onboarding does not write to DB. All data passes via URLSearchParams to /register where actual upsert happens. Simpler, keeps onboarding accessible before account creation.
- Budget step (step 5) is skippable. Both "Preskocit" (when no selection) and "Dokoncit" trigger the same `finish()` function.
- GDPR timestamp captured client-side at consent click via `new Date().toISOString()`. Precise enough for compliance purposes.
- Czech cities use HTML `<datalist>` element -- no external autocomplete library needed for ~70 cities.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Run migration against Supabase:
```bash
supabase db push
# or apply 004_onboarding_v2.sql manually in Supabase dashboard SQL editor
```

## Next Phase Readiness

- /onboarding redirects to /register with full URLSearchParams payload
- 07-02 (register page) needs to read and consume these params to populate the couple record on sign-up
- Couple interface already has all new field types ready for 07-02 DB writes

---
*Phase: 07-enhanced-onboarding*
*Completed: 2026-03-01*

## Self-Check: PASSED

- supabase/migrations/004_onboarding_v2.sql: FOUND
- src/lib/types.ts: FOUND
- src/app/(auth)/onboarding/page.tsx: FOUND
- .planning/phases/07-enhanced-onboarding/07-01-SUMMARY.md: FOUND
- commit ead9d4e (Task 1): FOUND
- commit a4b23b5 (Task 2): FOUND
