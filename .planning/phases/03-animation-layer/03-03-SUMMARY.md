---
phase: 03-animation-layer
plan: 03
subsystem: ui
tags: [framer-motion, animation, css, next-js, page-transitions]

requires:
  - phase: 03-02
    provides: Button/Input with Framer Motion, (public) route group with template.tsx crossfade

provides:
  - Button hover tween 150ms + tap tween 100ms replacing stiff spring
  - Input focus ring uses component-level gray ring (global CSS override removed)
  - AnimatePresence in persistent PublicTransitionProvider for proper exit+enter crossfade
  - (public)/layout.tsx wrapping all public routes in the transition provider

affects: [04-content-pages, any phase that adds public routes]

tech-stack:
  added: []
  patterns:
    - "AnimatePresence in persistent layout (server component) via Client Component wrapper -- not in template"
    - "Per-gesture transition objects on motion.button instead of shared transition prop"

key-files:
  created:
    - src/app/(public)/layout.tsx
    - src/components/animation/PublicTransitionProvider.tsx
  modified:
    - src/components/ui/Button.tsx
    - src/app/globals.css
    - src/app/(public)/template.tsx

key-decisions:
  - "Per-gesture transitions on motion.button (whileHover/whileTap each carry their own transition object) -- cleaner than shared prop"
  - "PublicTransitionProvider client component pattern to host AnimatePresence inside a server layout"

patterns-established:
  - "AnimatePresence pattern: persistent layout (server) -> PublicTransitionProvider (client) -> keyed motion.div in template"
  - "Remove element selectors from global CSS focus rules when the component manages its own focus ring"

requirements-completed: [ANIM-03, ANIM-04]

duration: 2min
completed: 2026-02-28
---

# Phase 03 Plan 03: UAT Gap Closure Summary

**Tween-based button hover/tap transitions + gray input focus ring + exit/enter crossfade via AnimatePresence moved to persistent (public)/layout.tsx**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-28T21:22:07Z
- **Completed:** 2026-02-28T21:23:36Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Button hover and tap now use separate tween transitions (150ms / 100ms) giving perceptible motion instead of near-instant spring snap
- Input focus ring is now the component's own gray ring -- brown brand outline removed from globals.css
- Page transitions now show both exit fade-out and enter fade-in because AnimatePresence lives in a persistent layout wrapper, not the destroyed template

## Task Commits

1. **Task 1: Fix button hover/tap visibility + input focus ring** - `c5d07f0` (fix)
2. **Task 2: Move AnimatePresence to persistent (public)/layout.tsx** - `0026664` (feat)

## Files Created/Modified
- `src/components/ui/Button.tsx` - Per-gesture transition objects, tween 150ms hover / 100ms tap
- `src/app/globals.css` - Removed `input:focus-visible` from brand-color outline rule
- `src/components/animation/PublicTransitionProvider.tsx` - New client component hosting AnimatePresence mode=wait
- `src/app/(public)/layout.tsx` - New server component wrapping children in PublicTransitionProvider
- `src/app/(public)/template.tsx` - Removed AnimatePresence; now only keyed motion.div + FrozenRouter

## Decisions Made
- Per-gesture transition objects on motion.button rather than a shared `transition` prop, allowing hover and tap to have independent timing
- PublicTransitionProvider client component as the thin wrapper that Next.js layout.tsx (server) delegates to -- keeps layout as a server component

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

All 4 UAT gaps from 03-UAT.md are closed. Phase 03 animation layer is complete and ready for visual verification. Phase 04 content pages can proceed.

---
*Phase: 03-animation-layer*
*Completed: 2026-02-28*
