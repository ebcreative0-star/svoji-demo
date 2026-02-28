---
phase: 02-ui-primitives
plan: 02
subsystem: ui
tags: [react, tailwind, cva, button, card, input, badge, select, textarea]

# Dependency graph
requires:
  - phase: 02-ui-primitives plan 01
    provides: Button, Card, Input, Textarea, Select, Badge primitives from @/components/ui

provides:
  - All btn-primary/btn-outline usages replaced with Button component or direct Tailwind classes on Link elements
  - Dashboard views (Budget, Guests, Checklist, Chat, Nav) fully migrated to Button/Card/Badge primitives
  - RSVP.tsx form inputs migrated to Input/Textarea/Select with label and error props
  - globals.css cleaned of .btn-primary and .btn-outline class definitions

affects:
  - Phase 3 (any new UI work should use primitives, not raw elements)
  - Phase 4 (RSVP/Hero sections already using primitives)
  - Phase 6 (Dashboard nav and views use Button/Card/Badge)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Link elements that look like buttons use direct Tailwind classes (no asChild in Phase 2)
    - Icon-only buttons use Button ghost variant with aria-label
    - RSVP_INTENT mapping pattern for semantic badge colors from string status values
    - CATEGORY_INTENT mapping pattern for category-to-badge-intent translation
    - Card.Header / Card.Body compound component for structured card content

key-files:
  created: []
  modified:
    - src/app/page.tsx
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/register/page.tsx
    - src/app/(auth)/onboarding/page.tsx
    - src/components/sections/Hero.tsx
    - src/components/sections/RSVP.tsx
    - src/components/dashboard/BudgetView.tsx
    - src/components/dashboard/GuestsView.tsx
    - src/components/dashboard/ChecklistView.tsx
    - src/components/dashboard/ChatInterface.tsx
    - src/components/dashboard/DashboardNav.tsx
    - src/app/globals.css

key-decisions:
  - "Link elements styled as buttons get direct Tailwind classes -- asChild not implemented in Phase 2 per 02-RESEARCH.md"
  - "RSVP status toggle buttons kept as interaction mechanism -- Badge added to name column for quick visual status scan"
  - "ChecklistView toggle button kept raw (it has complex custom circle shape) -- only filter/badge patterns migrated to primitives"
  - "Loader2 kept in ChatInterface for the AI thinking indicator (inline loading context, not button)"

patterns-established:
  - "Link-as-button: apply Button's visual Tailwind classes directly on the Link element"
  - "RSVP_INTENT: Record<string, BadgeIntent> mapping for status-to-color translation"
  - "CATEGORY_INTENT: Record<TaskCategory, BadgeIntent> for category badges"
  - "Card.Header replaces bg-secondary header divs inside card patterns"

requirements-completed: [PRIM-01, PRIM-02, PRIM-03, PRIM-04]

# Metrics
duration: 6min
completed: 2026-02-28
---

# Phase 2 Plan 02: UI Primitive Migration Summary

**All btn-primary/btn-outline usages replaced with Button/Tailwind across 11 files; dashboard views use Card/Badge; RSVP inputs use Input/Select/Textarea; globals.css cleaned**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-28T18:57:21Z
- **Completed:** 2026-02-28T19:03:00Z
- **Tasks:** 2 auto tasks complete (checkpoint:human-verify pending)
- **Files modified:** 11 source files + globals.css

## Accomplishments
- Migrated all btn-primary/btn-outline class usages to Button component (or direct Tailwind on Link elements) across page.tsx, login, register, onboarding, Hero, RSVP
- Migrated all dashboard raw button elements to Button with proper variants: primary (add), secondary (export/cancel), ghost (nav/icon-only), danger (delete)
- Replaced card-pattern divs in BudgetView (6), GuestsView (5), ChecklistView (using StatCard) with Card compound component
- Migrated RSVP form fields to Input/Select/Textarea with built-in label and error handling, keeping register spread
- Added RSVP status Badge with dot indicator in GuestsView; urgency + category Badges in ChecklistView
- Removed .btn-primary, .btn-outline, and their mobile media query override from globals.css
- TypeScript passes with zero errors

## Task Commits

1. **Task 1: Migrate btn-primary/btn-outline and auth page buttons** - `11666d5` (feat)
2. **Task 2: Migrate dashboard buttons, cards, inputs, badges + remove legacy CSS** - `b9802ab` (feat)

## Files Created/Modified
- `src/app/page.tsx` - Link CTA elements use direct Tailwind button classes
- `src/app/(auth)/login/page.tsx` - Submit button uses Button variant=primary isLoading
- `src/app/(auth)/register/page.tsx` - Submit button uses Button variant=primary isLoading
- `src/app/(auth)/onboarding/page.tsx` - Back/Next/Finish buttons use Button secondary/primary
- `src/components/sections/Hero.tsx` - CTA anchor uses direct Tailwind button classes
- `src/components/sections/RSVP.tsx` - Submit Button + Input/Select/Textarea for form fields
- `src/components/dashboard/BudgetView.tsx` - Button + Card throughout; category Card.Header pattern
- `src/components/dashboard/GuestsView.tsx` - Button + Card + Badge with RSVP_INTENT mapping
- `src/components/dashboard/ChecklistView.tsx` - Button + Card + Badge with CATEGORY_INTENT mapping
- `src/components/dashboard/ChatInterface.tsx` - Button primary for send, Input for chat input
- `src/components/dashboard/DashboardNav.tsx` - Button ghost with aria-label for icon-only actions
- `src/app/globals.css` - Removed .btn-primary and .btn-outline class definitions (74 lines removed)

## Decisions Made
- Link elements get direct Tailwind classes (no Button asChild) -- consistent with 02-RESEARCH.md Phase 2 decision
- RSVP toggle buttons kept as UX mechanism for status toggling; Badge added to name column for quick scan
- ChecklistView group toggle button kept as raw `<button>` -- it has custom circle/expand styling not fitting Button variants
- Loader2 kept in ChatInterface for the AI thinking indicator animation (not a button context)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Re-added Loader2 import to ChatInterface**
- **Found during:** Task 2 TypeScript check
- **Issue:** Removed Loader2 from imports but it is still used in the AI thinking indicator bubble (not a button context)
- **Fix:** Re-added `Loader2` to the lucide-react import in ChatInterface.tsx
- **Files modified:** src/components/dashboard/ChatInterface.tsx
- **Verification:** npx tsc --noEmit passes
- **Committed in:** b9802ab (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - import bug)
**Impact on plan:** Minor import correction. No scope change.

## Issues Encountered
None beyond the Loader2 import fix documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All UI primitives now consistently used across the entire codebase
- Zero legacy btn-primary/btn-outline patterns remain
- Visual checkpoint (Task 3) requires user to open http://localhost:3000 and verify no visual regressions
- After checkpoint approval, Phase 2 is complete and Phase 3 can begin

---
*Phase: 02-ui-primitives*
*Completed: 2026-02-28*
