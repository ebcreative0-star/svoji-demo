---
phase: 04-landing-page
plan: 01
subsystem: ui
tags: [framer-motion, tailwind, next-js, landing-page, animation]

# Dependency graph
requires:
  - phase: 03-animation-layer
    provides: ScrollReveal, StaggerContainer, MotionConfig, Framer Motion setup
  - phase: 02-ui-primitives
    provides: buttonVariants (exported), cn(), Card, Button components
provides:
  - LandingNav with scroll-aware transparent/solid transition and mobile hamburger
  - Hero with full-viewport grain texture and animated chat mockup
  - LandingFooter with Svoji branding
  - buttonVariants export from Button.tsx for Link CTA styling
  - page.tsx refactored to clean Server Component composition
affects:
  - 04-02 (Features/SocialProof/HowItWorks sections slot into page.tsx)
  - 04-03 (FinalCTA uses buttonVariants)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Scroll-aware nav using useEffect + passive scroll listener with isScrolled state
    - AnimatePresence mobile panel with slide-down motion (opacity+y) for hamburger menu
    - Hero grain texture via inline SVG data URL at opacity 0.04, baseFrequency 0.65
    - Chat message animation via per-message delay with animate="visible" (not whileInView) for above-fold content
    - page.tsx as Server Component composing client sub-components

key-files:
  created:
    - src/components/landing/LandingNav.tsx
    - src/components/landing/Hero.tsx
    - src/components/landing/LandingFooter.tsx
  modified:
    - src/components/ui/Button.tsx
    - src/app/(public)/page.tsx

key-decisions:
  - "Hero uses animate='visible' (not whileInView) because it is above the fold on page load"
  - "Grain texture via inline SVG data URL at opacity 0.04 -- no external asset, renders as paper texture"
  - "page.tsx stays as Server Component -- all interactivity is in client sub-components"
  - "buttonVariants export from Button.tsx lets Link elements share button styling without asChild"

patterns-established:
  - "Scroll-aware nav: passive scroll listener + isScrolled boolean + cn() for conditional classes"
  - "Mobile menu: AnimatePresence + motion.div slide-down, menu closes on link click"
  - "Above-fold animation: animate='visible' with per-item delay, not whileInView"

requirements-completed: [LAND-01, LAND-06, LAND-07]

# Metrics
duration: 2min
completed: 2026-02-28
---

# Phase 4 Plan 01: Landing Page Shell Summary

**Scroll-aware LandingNav with mobile hamburger, full-viewport Hero with SVG grain texture and sequentially animated chat messages, LandingFooter, and page.tsx refactored to clean Server Component composition**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-28T22:14:45Z
- **Completed:** 2026-02-28T22:16:28Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- LandingNav transitions from transparent to white/blur/shadow past 60px scroll, with mobile hamburger that slides in an AnimatePresence panel
- Hero fills 100dvh with SVG grain texture overlay (opacity 0.04, baseFrequency 0.65), dual CTA using buttonVariants, chat mockup with 4 messages animating in with staggered delays, floating stats card on desktop
- LandingFooter renders Svoji logo and copyright as a Server Component
- buttonVariants exported from Button.tsx, eliminating the need to duplicate button class strings in Link elements
- page.tsx is now a clean Server Component importing 3 landing components with a comment placeholder for Plan 04-02 sections

## Task Commits

Each task was committed atomically:

1. **Task 1: Export buttonVariants, create LandingNav + LandingFooter** - `935bd08` (feat)
2. **Task 2: Create Hero + refactor page.tsx** - `5117cdf` (feat)

## Files Created/Modified
- `src/components/ui/Button.tsx` - Added `export { buttonVariants }` at bottom
- `src/components/landing/LandingNav.tsx` - Scroll-aware fixed nav with mobile hamburger and AnimatePresence panel
- `src/components/landing/LandingFooter.tsx` - Brand footer, Server Component
- `src/components/landing/Hero.tsx` - Full-viewport hero with grain texture, animated chat, dual CTA, floating stats
- `src/app/(public)/page.tsx` - Refactored to Server Component composing LandingNav + Hero + LandingFooter

## Decisions Made
- Hero uses `animate="visible"` not `whileInView` -- the hero is above the fold so viewport intersection never triggers on initial load
- Grain texture uses an inline SVG data URL with feTurbulence -- no external image asset required, renders at opacity 0.04 as subtle paper noise
- page.tsx stays a Server Component (no `'use client'`) -- all interactivity is isolated in LandingNav.tsx and Hero.tsx
- `buttonVariants` export pattern chosen over duplicating class strings in every Link element

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Landing shell is in place: LandingNav, Hero, LandingFooter rendering correctly, TypeScript clean
- Plan 04-02 slots Features, SocialProof, HowItWorks, and FinalCTA sections between Hero and LandingFooter in page.tsx
- Plan 04-03 can use buttonVariants for any additional CTA links

---
*Phase: 04-landing-page*
*Completed: 2026-02-28*

## Self-Check: PASSED

- src/components/landing/LandingNav.tsx: FOUND
- src/components/landing/Hero.tsx: FOUND
- src/components/landing/LandingFooter.tsx: FOUND
- Commit 935bd08: FOUND
- Commit 5117cdf: FOUND
