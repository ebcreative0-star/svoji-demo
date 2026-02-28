---
phase: 02-ui-primitives
plan: 01
subsystem: ui
tags: [react, typescript, tailwind, class-variance-authority, clsx, react-hook-form, lucide-react]

# Dependency graph
requires:
  - phase: 01-design-system
    provides: OKLCH design tokens via @theme CSS variables in globals.css

provides:
  - cn() utility wrapping clsx for class composition
  - Button component with 4 variants x 3 sizes, isLoading, icon support, forwardRef
  - Card compound component (Card.Header, Card.Body, Card.Footer), padding tiers, interactive prop
  - Input component with label/error/helperText, forwardRef, branded focus ring
  - Textarea component with same visual style as Input, resize-y
  - Select component (children-based) with same visual style as Input
  - Badge component with 5 semantic intents x 2 sizes, dot indicator
  - FormInput, FormTextarea, FormSelect: react-hook-form Controller wrappers
  - Barrel export at src/components/ui/index.ts

affects: [03-motion, 04-homepage, 05-rsvp, 06-dashboard, 07-mobile]

# Tech tracking
tech-stack:
  added: [class-variance-authority@^0.7, clsx@^2]
  patterns: [cva variant composition, compound component dot notation, forwardRef + displayName, Controller-based RHF wrappers]

key-files:
  created:
    - src/lib/cn.ts
    - src/components/ui/Button.tsx
    - src/components/ui/Card.tsx
    - src/components/ui/Input.tsx
    - src/components/ui/Textarea.tsx
    - src/components/ui/Select.tsx
    - src/components/ui/Badge.tsx
    - src/components/ui/FormInput.tsx
    - src/components/ui/FormTextarea.tsx
    - src/components/ui/FormSelect.tsx
    - src/components/ui/index.ts
  modified:
    - package.json

key-decisions:
  - "clsx-only (no tailwind-merge): OKLCH @theme token arbitrary values don't produce merge conflicts; twMerge can be swapped in later if needed"
  - "Card sub-components via dot notation (Card.Header etc.) instead of named exports: enforces structural consistency, aligns with RESEARCH.md Pattern 2"
  - "Select uses children approach (pass <option> elements) rather than options prop array: matches existing RSVP.tsx pattern and is more flexible"
  - "Icon-only Button: runtime console.warn instead of TS discriminated union for missing aria-label -- too complex for Phase 2"
  - "Build failure (Turbopack CSS module resolution) is pre-existing and unrelated to this plan -- tsc --noEmit passes clean"

patterns-established:
  - "cva() for variant/size composition on Button and Badge; produces TypeScript union types automatically"
  - "cn() from @/lib/cn for all className assembly; never raw string concatenation"
  - "forwardRef + displayName on all form-element-based components (Input, Textarea, Select, Button)"
  - "FormX wrappers use Controller render prop, spread field + pass fieldState.error?.message as error prop"
  - "CSS variable references use Tailwind arbitrary value syntax: bg-[var(--color-primary)]"
  - "Complete Tailwind class strings only -- no dynamic interpolation (Tailwind 4 purge safety)"

requirements-completed: [PRIM-01, PRIM-02, PRIM-03, PRIM-04]

# Metrics
duration: 15min
completed: 2026-02-28
---

# Phase 02 Plan 01: UI Primitives Foundation Summary

**cva-based Button/Badge, compound Card, forwardRef Input/Textarea/Select, and RHF Controller wrappers -- 11 new files establishing the typed component layer for all surface redesign phases**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-02-28T18:30:00Z
- **Completed:** 2026-02-28T18:45:00Z
- **Tasks:** 2
- **Files modified:** 12 (11 created + package.json updated)

## Accomplishments
- Installed class-variance-authority and clsx; created cn() utility in src/lib/cn.ts
- Built Button with 4 variants x 3 sizes using cva, isLoading spinner, leadingIcon/trailingIcon, forwardRef
- Built Card as compound component (Card.Header, Card.Body, Card.Footer) with dot notation, padding tiers, interactive hover
- Built Input, Textarea, Select with consistent label/error/helperText layout, forwardRef, branded OKLCH focus ring
- Built Badge with 5 semantic intents x 2 sizes using cva, optional dot status indicator
- Built FormInput, FormTextarea, FormSelect as thin RHF Controller wrappers
- Barrel export at src/components/ui/index.ts covers all components
- Zero TypeScript errors (npx tsc --noEmit clean)

## Task Commits

1. **Task 1: Install dependencies and create cn() utility** - `4c4c286` (chore)
2. **Task 2: Create all UI component files** - `b4bc353` (feat)

## Files Created/Modified
- `src/lib/cn.ts` - cn() utility wrapping clsx for class composition
- `src/components/ui/Button.tsx` - Button with cva variants, isLoading, icon support, forwardRef
- `src/components/ui/Card.tsx` - Compound Card with Header/Body/Footer sub-components
- `src/components/ui/Input.tsx` - Base Input with label/error/helperText, forwardRef
- `src/components/ui/Textarea.tsx` - Base Textarea, same visual style as Input, min-h-[80px] resize-y
- `src/components/ui/Select.tsx` - Base Select (children-based), same visual style as Input
- `src/components/ui/Badge.tsx` - Badge with cva intents, optional dot indicator
- `src/components/ui/FormInput.tsx` - RHF Controller wrapper for Input
- `src/components/ui/FormTextarea.tsx` - RHF Controller wrapper for Textarea
- `src/components/ui/FormSelect.tsx` - RHF Controller wrapper for Select
- `src/components/ui/index.ts` - Barrel export for all components
- `package.json` - Added class-variance-authority and clsx dependencies

## Decisions Made
- clsx only, no tailwind-merge: OKLCH arbitrary values don't conflict; twMerge can be added later if needed
- Card dot-notation sub-components over named exports: enforces correct usage pattern
- Select accepts children (not options array): matches existing RSVP.tsx usage and is more flexible
- Icon-only Button warning is a runtime console.warn not a TS discriminated union (too complex for Phase 2 scope)

## Deviations from Plan

None - plan executed exactly as written.

The pre-existing Turbopack build failure (CSS module resolution error in globals.css, unrelated to this plan) was identified and confirmed as pre-existing via `git stash` test. Logged as a known blocker -- was present before Phase 2 work began.

## Issues Encountered

- Pre-existing `npm run build` failure: Turbopack cannot resolve `'...'` in the compiled globals.css output. Confirmed pre-existing (present before any Phase 2 changes via git stash verification). `npx tsc --noEmit` passes clean -- TypeScript compilation is correct. The build issue is Turbopack-specific to CSS processing and needs investigation in a separate task.

## Next Phase Readiness
- All 4 primitive component types (Button, Card, Input, Badge) ready for migration
- Plan 02-02 can begin migrating existing raw buttons/cards/inputs/badges to typed components
- Phase 3 can layer motion primitives on top of Card (interactive prop already in place)
- Both base Input (compatible with RHF register spread) and FormX wrappers (Controller-based) available for different migration approaches

## Self-Check: PASSED

- All 11 created files confirmed present on disk
- Commits 4c4c286 and b4bc353 verified in git log
- TypeScript compilation: zero errors (npx tsc --noEmit clean)

---
*Phase: 02-ui-primitives*
*Completed: 2026-02-28*
