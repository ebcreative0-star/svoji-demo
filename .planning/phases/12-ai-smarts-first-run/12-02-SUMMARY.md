---
phase: 12-ai-smarts-first-run
plan: 02
subsystem: ui
tags: [crud, checklist, quick-add, inline-edit, optimistic-ui, framer-motion, tags]

requires:
  - 12-01
provides:
  - Full CRUD ChecklistView with quick-add, expand-in-row edit, delete, tag pills, empty state
affects:
  - checklist/page.tsx (coupleId prop, tags normalization)

tech-stack:
  added: []
  patterns:
    - "Quick-add with Enter-to-submit + expandable details section (AnimatePresence height:0 to auto)"
    - "Expand-in-row edit: editingId state controls AnimatePresence per item"
    - "Optimistic UI: apply locally first, revert state snapshot on Supabase error"
    - "Null due_date guard in groupItems: noDueDate bucket before date parsing"

key-files:
  created: []
  modified:
    - src/components/dashboard/ChecklistView.tsx
    - src/app/(dashboard)/checklist/page.tsx

key-decisions:
  - "coupleId as required prop on ChecklistView -- avoids fetching it inside the component"
  - "Single editingId state replaces any previous edit -- only one inline edit open at a time"
  - "Optimistic insert uses crypto.randomUUID() for temp id, replaced with real id after DB response"
  - "checklist/page.tsx normalizes tags with item.tags ?? [] to handle pre-migration rows"
  - "guests/page.tsx tags type error deferred to Plan 12-03 (GuestsView CRUD scope)"

metrics:
  duration: "~3 min"
  completed: "2026-03-16"
  tasks: 2
  files_modified: 2
---

# Phase 12 Plan 02: ChecklistView Full CRUD Summary

**Full CRUD for the checklist view: quick-add with Enter-to-submit, expandable details form, expand-in-row inline edit with framer-motion animation, optimistic delete, colored tag pills, and empty state with AI chat link.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-16T19:14:24Z
- **Completed:** 2026-03-16T19:17:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `ChecklistView`: upgraded from read-only (toggle only) to full CRUD -- add, edit, delete
- Quick-add field: single input + Enter-to-submit for fast entry; "+ Detaily" toggle expands date/priority/category/tags form
- Expand-in-row edit: clicking Pencil icon expands an animated form directly below the item row; only one item editable at a time
- Optimistic UI for all mutations: state updated immediately, reverted to snapshot if Supabase returns error
- Tag pills: colored spans using `getTagColor()` rendered after category badge on each row
- Empty state: `ClipboardList` icon + heading + CTA button that focuses quick-add input + AI chat link
- Null `due_date` guard: items without a due date grouped under "Bez terminu" instead of crashing on `new Date(null)`
- `checklist/page.tsx`: passes `coupleId` and normalizes `tags ?? []` for pre-migration rows

## Task Commits

1. **Task 1+2: Full CRUD ChecklistView** - `f9a130b` (feat)

## Files Created/Modified

- `src/components/dashboard/ChecklistView.tsx` - Full rewrite: 790 lines, all CRUD features
- `src/app/(dashboard)/checklist/page.tsx` - Added coupleId prop, tags normalization

## Decisions Made

- `coupleId` passed as prop rather than fetched inside component -- keeps component pure/testable
- `crypto.randomUUID()` for optimistic insert temp ID, replaced with real DB ID on success
- Single `editingId` string state -- setting a new item's ID automatically closes any previous edit
- `tags ?? []` normalization at the page level -- handles DB rows created before migration 009

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Type errors in checklist/page.tsx**
- **Found during:** TypeScript build check after writing ChecklistView
- **Issue:** `ChecklistView` now requires `coupleId: string` and `tags: string[]` on items, but `checklist/page.tsx` was not passing either
- **Fix:** Added `coupleId={user.id}` and `.map((item) => ({ ...item, tags: item.tags ?? [] }))` normalization; same for demo mode
- **Files modified:** `src/app/(dashboard)/checklist/page.tsx`
- **Commit:** `f9a130b`

## Deferred Issues

- `guests/page.tsx` TypeScript error: `tags` missing from Guest type returned by the page -- will be fixed in Plan 12-03 (GuestsView CRUD) which is the natural scope for that file

## Self-Check: PASSED

- `src/components/dashboard/ChecklistView.tsx`: found, 790 lines
- `src/app/(dashboard)/checklist/page.tsx`: found, updated
- Commit `f9a130b`: verified in git log

---
*Phase: 12-ai-smarts-first-run*
*Completed: 2026-03-16*
