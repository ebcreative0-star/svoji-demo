---
phase: 03-animation-layer
plan: 02
subsystem: ui
tags: [framer-motion, micro-interactions, page-transitions, route-groups]

requires:
  - phase: 03-animation-layer
    plan: 01
    provides: FrozenRouter, MotionConfig, LenisProvider
  - phase: 02-ui-primitives
    provides: Button, Card, Input components
provides:
  - Button with hover lift+scale and tap press via motion.button
  - Card with hover shadow deepening via motion.div (interactive only)
  - Input with neutral gray focus ring
  - Public route crossfade page transitions via template.tsx
  - (public) route group structure
affects: [04-landing, 05-dashboard, 06-ai-assistant, 07-wedding-web]

tech-stack:
  added: []
  patterns: [motion-element-replacement, route-group-transitions, omit-motion-conflicts]

key-files:
  created:
    - src/app/(public)/template.tsx
  modified:
    - src/components/ui/Button.tsx
    - src/components/ui/Card.tsx
    - src/components/ui/Input.tsx
    - src/app/(public)/page.tsx
    - src/app/(public)/w/[slug]/page.tsx

key-decisions:
  - "Omit React drag/animation event handlers from ButtonProps/CardProps to avoid Framer Motion type conflicts"
  - "Card non-interactive variant stays plain div (no motion overhead)"
  - "Input focus ring is pure Tailwind change (no Framer Motion needed)"

patterns-established:
  - "MotionConflicts type alias: Omit drag/animation handlers when extending HTMLAttributes for motion components"
  - "Route group (public) for page transitions; (auth)/(dashboard) stay instant"

requirements-completed: [ANIM-03, ANIM-04, ANIM-01]

duration: 5min
completed: 2026-02-28
---

# Plan 03-02: UI Micro-interactions + Page Transitions Summary

**Framer Motion hover/tap gestures on Button/Card, neutral Input focus ring, and crossfade page transitions via (public) route group template**

## Performance

- **Duration:** 5 min
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Button hover lift (-1.5px) + scale (1.03x) with spring physics, tap press (0.975x)
- Interactive Card hover shadow deepening via Framer Motion spring
- Input focus ring changed from brand primary to neutral gray (ring-gray-300/70)
- Public routes restructured into (public) group with crossfade transitions (400ms)
- Dashboard and auth routes remain transition-free

## Task Commits

1. **Task 1: Add micro-interactions to Button, Card, Input** - `db5fa48` (feat)
2. **Task 2: Create (public) route group with page transitions** - `e6b75d6` (feat)

## Files Created/Modified
- `src/components/ui/Button.tsx` - motion.button with whileHover/whileTap gestures
- `src/components/ui/Card.tsx` - motion.div for interactive cards, 'use client' added
- `src/components/ui/Input.tsx` - focus ring changed to gray-300/70
- `src/app/(public)/template.tsx` - AnimatePresence crossfade + FrozenRouter
- `src/app/(public)/page.tsx` - Landing page relocated
- `src/app/(public)/w/[slug]/page.tsx` - Wedding web relocated

## Decisions Made
- Omit React drag/animation event handlers from component props to resolve Framer Motion type conflicts
- Card non-interactive variant stays plain div (no motion overhead)
- Input focus ring is pure Tailwind change (no Framer Motion needed for CSS ring)

## Deviations from Plan

### Auto-fixed Issues

**1. [Type Conflicts] Resolved React/Framer Motion event handler type conflicts**
- **Found during:** Task 1 (Button and Card motion conversion)
- **Issue:** React's onDrag/onDragStart/onDragEnd/onAnimationStart/onAnimationEnd conflict with Framer Motion's same-named props
- **Fix:** Created MotionConflicts type alias, used Omit to exclude conflicting handlers from component interfaces
- **Files modified:** src/components/ui/Button.tsx, src/components/ui/Card.tsx
- **Verification:** npx tsc --noEmit passes
- **Committed in:** db5fa48 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (type conflict resolution)
**Impact on plan:** Necessary for TypeScript correctness. No scope creep.

## Issues Encountered
- Stale .next/types cache referenced old page.tsx locations after route restructure. Cleared cache, resolved.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All animation infrastructure and UI integrations complete
- ScrollReveal and StaggerContainer ready for landing page sections (Phase 4)
- Page transitions active on public routes
- All animations respect prefers-reduced-motion via MotionConfig

---
*Phase: 03-animation-layer*
*Completed: 2026-02-28*
