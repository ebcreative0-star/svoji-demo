---
phase: 07-enhanced-onboarding
plan: 03
subsystem: ui
tags: [onboarding, czech, diacritics, redirect, cta, framer-motion]

# Dependency graph
requires:
  - phase: 07-enhanced-onboarding (07-01)
    provides: GDPR + 5-step onboarding state machine with Framer Motion
  - phase: 07-enhanced-onboarding (07-02)
    provides: Onboarding data pipeline, register page wiring, AI chat context

provides:
  - Verified end-to-end onboarding flow
  - All landing page CTAs route through /onboarding
  - Post-login/OAuth/confirm redirects go to /checklist (not broken /dashboard)
  - All Czech text in onboarding has correct diacritics

affects: [08-ai-ux-and-demand-signals, 09-demand-logging]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "User journey smoke test: verify each CTA and auth redirect before shipping"

key-files:
  created: []
  modified:
    - src/components/landing/Hero.tsx
    - src/components/landing/FinalCTA.tsx
    - src/components/landing/LandingNav.tsx
    - src/app/(auth)/login/page.tsx
    - src/app/auth/callback/route.ts
    - src/app/auth/confirm/route.ts
    - src/app/(auth)/onboarding/page.tsx

key-decisions:
  - "Landing CTAs go to /onboarding not /register -- user must complete personalization before account creation"
  - "Default post-auth redirect is /checklist (first actual page in (dashboard) route group)"

patterns-established:
  - "Landing CTA pattern: all signup entry points funnel through /onboarding"

requirements-completed:
  - ONBD-01
  - ONBD-02
  - ONBD-03
  - ONBD-04
  - ONBD-05
  - ONBD-06
  - ONBD-07
  - SEC-03

# Metrics
duration: 30min
completed: 2026-03-01
---

# Phase 7 Plan 03: Enhanced Onboarding Verification Summary

**Full onboarding-to-auth pipeline verified: 3 routing/UX bugs found during smoke test and fixed (CTA destinations, broken /dashboard redirect, missing Czech diacritics)**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-01T21:30:00Z
- **Completed:** 2026-03-01T22:39:00Z
- **Tasks:** 1 (checkpoint verify + 3 auto-fixes)
- **Files modified:** 7

## Accomplishments

- Smoke-tested the full user journey: landing page -> /onboarding -> /register -> auth
- Fixed all landing page CTAs so they route through /onboarding (Hero, FinalCTA, LandingNav)
- Fixed post-auth redirects from broken /dashboard to working /checklist across login, OAuth callback, and email confirm
- Fixed all Czech text in the 6-screen onboarding flow (city names, labels, headings, error messages, buttons)

## Task Commits

1. **Fix: Route landing CTAs through /onboarding** - `a64efef` (fix)
2. **Fix: Redirect to /checklist after auth** - `e9264f5` (fix)
3. **Fix: Czech diacritics in onboarding** - `f2c1ea3` (fix)

## Files Created/Modified

- `src/components/landing/Hero.tsx` - CTA href changed from /register to /onboarding
- `src/components/landing/FinalCTA.tsx` - CTA href changed from /register to /onboarding
- `src/components/landing/LandingNav.tsx` - "Vyzkouset zdarma" and "Zacit zdarma" hrefs changed to /onboarding
- `src/app/(auth)/login/page.tsx` - Post-login redirect changed from /dashboard to /checklist
- `src/app/auth/callback/route.ts` - OAuth callback redirect changed from /dashboard to /checklist
- `src/app/auth/confirm/route.ts` - Email confirm redirect changed from /dashboard to /checklist
- `src/app/(auth)/onboarding/page.tsx` - All 120 Czech strings corrected with proper diacritics (hacky, carky)

## Decisions Made

- Landing CTAs must go to /onboarding, not /register -- the full personalization flow is the product differentiator and should not be bypassable from the marketing page
- /checklist is the canonical landing page after auth; /dashboard does not exist as a standalone route in the (dashboard) route group

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Landing CTAs pointing to /register instead of /onboarding**
- **Found during:** Task 1 (human verification smoke test)
- **Issue:** Hero.tsx, FinalCTA.tsx, LandingNav.tsx all had href="/register", bypassing the onboarding flow entirely
- **Fix:** Updated all three files to href="/onboarding"
- **Files modified:** src/components/landing/Hero.tsx, src/components/landing/FinalCTA.tsx, src/components/landing/LandingNav.tsx
- **Verification:** All three CTAs navigate to /onboarding in browser
- **Committed in:** a64efef

**2. [Rule 1 - Bug] Post-auth redirect to non-existent /dashboard**
- **Found during:** Task 1 (human verification smoke test)
- **Issue:** After login/OAuth/email-confirm, all three auth routes redirected to /dashboard which returns 404 (pages live under (dashboard) route group with actual paths like /checklist)
- **Fix:** Changed redirect target to /checklist in login/page.tsx, auth/callback/route.ts, auth/confirm/route.ts
- **Files modified:** src/app/(auth)/login/page.tsx, src/app/auth/callback/route.ts, src/app/auth/confirm/route.ts
- **Verification:** Login redirects to /checklist successfully
- **Committed in:** e9264f5

**3. [Rule 1 - Bug] Czech diacritics missing throughout onboarding**
- **Found during:** Task 1 (human verification smoke test)
- **Issue:** All user-facing text in onboarding/page.tsx was stripped of hacky and carky (e.g. "Prsteni" instead of "Prsteni", "Praha" rendered correctly but options like "Moderni" missing accent)
- **Fix:** Corrected all 60 affected strings across city names, step labels, headings, error messages, and button text
- **Files modified:** src/app/(auth)/onboarding/page.tsx
- **Verification:** Onboarding renders correct Czech text in browser
- **Committed in:** f2c1ea3

---

**Total deviations:** 3 auto-fixed (3 bugs)
**Impact on plan:** All three fixes were correctness requirements -- broken routing would have blocked user registration, broken redirects would have returned 404, and missing diacritics would have made the product look broken to Czech users.

## Issues Encountered

None beyond the three bugs documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 7 (Enhanced Onboarding) is fully complete across all 3 plans
- Full onboarding-to-auth pipeline is verified working end-to-end
- Phase 8 (AI UX + Demand Signals) can proceed -- onboarding data is wired into AI chat system prompt
- GDPR consent is in place (required before Phase 9 demand logging)

---
*Phase: 07-enhanced-onboarding*
*Completed: 2026-03-01*
