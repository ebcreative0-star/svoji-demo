---
phase: 12-ai-smarts-first-run
plan: 04
subsystem: ui
tags: [guests, div-layout, edit-in-row, tags, framer-motion, animated-expand, empty-state]

requires:
  - 12-01
provides:
  - GuestsView div-based layout with expand-in-row edit (src/components/dashboard/GuestsView.tsx)
  - Tags on add form and displayed as pills on each guest row
  - Empty state with CTA and AI chat link
affects: []

tech-stack:
  added: []
  patterns:
    - "Expand-in-row edit: AnimatePresence + motion.div height:auto animation below each guest row"
    - "Optimistic update with revert: update state immediately, revert to initialGuests on Supabase error"
    - "Div grid layout: grid-cols-[1fr_140px_110px_110px_88px] matches header + row columns"

key-files:
  created: []
  modified:
    - src/components/dashboard/GuestsView.tsx

key-decisions:
  - "Single file rewrite: both tasks (table-to-div and edit/empty-state) implemented in one commit as they're inseparable"
  - "Pencil icon toggles edit: clicking again cancels (same icon acts as toggle), avoids two separate cancel paths"
  - "Mobile RSVP buttons in action column: keeps table scannable on small screens without a separate mobile layout branch"
  - "Empty state only on guests.length === 0 (not filteredGuests): filtered empty shows different message inline"

requirements-completed:
  - UI-05
  - UI-06

duration: 2min
completed: 2026-03-16
---

# Phase 12 Plan 04: GuestsView Refactor Summary

**GuestsView converted from HTML table to div grid layout with AnimatePresence expand-in-row editing, tag pills on rows and add form, and empty state -- eliminates Framer Motion height animation breakage from table elements.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-16T19:14:30Z
- **Completed:** 2026-03-16T19:16:42Z
- **Tasks:** 2 (both implemented in single commit)
- **Files modified:** 1

## Accomplishments

- Table-to-div refactor: `grid-cols-[1fr_140px_110px_110px_88px]` header + row grid replaces `<table>` structure
- Tags on add form: TagInput with existingTags autocomplete, included in Supabase insert, reset on success
- Tag pills on guest rows: `getTagColor()` deterministic colors, compact below name
- Edit-in-row: Pencil icon per row, AnimatePresence motion.div expands below row with full edit form
- Edit fields: name, email, phone, group, RSVP (Select), dietary, plus_one (checkbox), notes (textarea), tags (TagInput)
- Optimistic save: state updated immediately, Supabase write async, revert on error
- Empty state: Users icon, "Zatim zadni hoste" heading, "Pridat prvniho hosta" CTA button, AI chat link
- All existing features preserved: stats cards, search, filter, RSVP toggle buttons, delete, CSV export

## Task Commits

1. **Tasks 1+2: Table-to-div refactor + tags + edit + empty state** - `4702a2c` (feat)

## Files Created/Modified

- `src/components/dashboard/GuestsView.tsx` - Full rewrite: div grid layout, tags, expand-in-row edit, empty state (668 lines)

## Decisions Made

- Both tasks combined into single commit: they share state (editingId, editDraft, tags) so splitting artificially would leave the file in an inconsistent intermediate state
- Pencil icon acts as toggle (click again = cancel): reduces UI surface area, consistent with common pattern
- Empty state only on total `guests.length === 0`, not filtered empty: filtered empty handled by "no results" message inline
- Mobile RSVP buttons duplicated in action column: avoids complex responsive branching while keeping functionality on small screens

## Deviations from Plan

None - plan executed exactly as written. Both tasks (Task 1: table-to-div + tags, Task 2: edit + empty state) are complete.

## Issues Encountered

None.

## User Setup Required

Migration 009 must be applied in Supabase Dashboard SQL Editor before tags can be stored (from Plan 12-01):

```sql
ALTER TABLE guests ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
```

## Self-Check: PASSED

- FOUND: src/components/dashboard/GuestsView.tsx (668 lines, no table elements)
- FOUND: .planning/phases/12-ai-smarts-first-run/12-04-SUMMARY.md
- FOUND: commit 4702a2c

---
*Phase: 12-ai-smarts-first-run*
*Completed: 2026-03-16*
