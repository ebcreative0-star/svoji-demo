---
phase: 11-bug-fixes
plan: 02
subsystem: auth, ui, database
tags: [supabase, next.js, lucide-react, auth-callback, budget]

# Dependency graph
requires:
  - phase: onboarding
    provides: onboarding URL param passed through OAuth redirect

provides:
  - First-login detection via onboarding URL param (no extra DB query)
  - Post-login redirect to /chat for new users, /checklist for returning
  - budget_items.source column (manual | ai) with migration + backfill
  - Sparkles badge in BudgetView for AI-created items

affects: [12-performance, 13-public-web]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "onboarding param as first-login signal: avoids DB roundtrip, uses existing OAuth redirect data"
    - "source field tagging: attach provenance to AI-created DB rows for UI differentiation"

key-files:
  created:
    - supabase/migrations/008_budget_item_source.sql
  modified:
    - src/app/auth/callback/route.ts
    - src/lib/ai/action-executor.ts
    - src/components/dashboard/BudgetView.tsx

key-decisions:
  - "Use onboardingParam as first-login signal instead of querying couples table -- avoids extra DB roundtrip, param already present in OAuth callback"
  - "Keep fallback couples table check for returning users without onboarding param -- preserves edge-case handling"
  - "AI items remain fully editable/deletable -- Sparkles is informational only, no behavior change"

patterns-established:
  - "Provenance tagging: insert source: 'ai' for AI-created rows, render badge in UI"

requirements-completed: [BUG-02, BUG-03]

# Metrics
duration: 10min
completed: 2026-03-14
---

# Phase 11 Plan 02: Post-login Redirect and AI Budget Badge Summary

**onboarding-param-based first-login redirect to /chat, plus Sparkles badge on AI-created budget items via new source column**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-14T10:42:00Z
- **Completed:** 2026-03-14T10:52:50Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Fixed BUG-02: new users completing onboarding now land on /chat (AI welcome) instead of /checklist
- Fixed BUG-03: AI-created budget items show a Sparkles icon inline with their name
- Added DB migration for budget_items.source column with backfill of existing rows
- AI budget items retain identical edit/delete controls as manual items

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix post-login redirect (BUG-02)** - `14cf997` (fix)
2. **Task 2: Add source column + AI badge (BUG-03)** - `bb3c34a` (feat)

## Files Created/Modified
- `src/app/auth/callback/route.ts` - isFirstLogin from onboardingParam, redirects to /chat on first login
- `supabase/migrations/008_budget_item_source.sql` - ADD COLUMN source VARCHAR(20) DEFAULT 'manual' + backfill UPDATE
- `src/lib/ai/action-executor.ts` - addBudgetItem insert now includes source: 'ai'
- `src/components/dashboard/BudgetView.tsx` - source field in BudgetItem interface, Sparkles import, conditional badge render

## Decisions Made
- Use `onboardingParam` presence as first-login signal instead of a new couples table query -- the param is already in scope earlier in the same handler, no extra DB round-trip needed
- Retain the existing couples table lookup for returning users (edge-case: someone who lost their session and logs back in without onboarding param still gets correctly routed)
- Sparkles icon is purely informational -- AI items have the same edit and delete affordances as manual items

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Migration `008_budget_item_source.sql` must be applied to the Supabase project:
```
supabase db push
```
or run directly in the Supabase SQL editor.

## Next Phase Readiness
- BUG-02 and BUG-03 are resolved, ready to proceed to remaining bug-fix plans in phase 11
- No blockers introduced

---
*Phase: 11-bug-fixes*
*Completed: 2026-03-14*
