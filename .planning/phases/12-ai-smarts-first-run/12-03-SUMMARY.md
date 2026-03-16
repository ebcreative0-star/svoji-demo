---
phase: 12-ai-smarts-first-run
plan: 03
subsystem: ui
tags: [budget, tags, inline-edit, empty-state, TagInput, framer-motion, optimistic-update]

requires:
  - 12-01

provides:
  - BudgetView with expand-in-row edit for all fields
  - Tags on budget item add form and displayed as pills on rows
  - Empty state with PiggyBank illustration + CTA + AI chat link

affects:
  - src/components/dashboard/BudgetView.tsx

tech-stack:
  added: []
  patterns:
    - "Expand-in-row edit: AnimatePresence height 0->auto with overflow-hidden for smooth collapse"
    - "Optimistic update: snapshot prevItems, apply immediately, revert on Supabase error"
    - "Tag display: getTagColor deterministic hash, inline pills below item name on rows"

key-files:
  created: []
  modified:
    - src/components/dashboard/BudgetView.tsx

key-decisions:
  - "tags field optional (tags?: string[]) in BudgetItem interface -- migration 009 may not be applied in all environments"
  - "Single commit covering both tasks -- both modify only BudgetView.tsx and were implemented together"
  - "Empty state checks items.length === 0 (not groupedItems.length) so it shows before any categorization logic runs"

metrics:
  duration: 3min
  completed: 2026-03-16
---

# Phase 12 Plan 03: BudgetView Edit, Tags, Empty State Summary

**Tags on add form, tag pills on rows, Pencil-triggered expand-in-row edit for all fields with AnimatePresence animation, and empty state with PiggyBank CTA and AI chat link.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-16T19:14:25Z
- **Completed:** 2026-03-16T19:17:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- `TagInput` integrated into add form -- tags persisted to Supabase on insert
- Tag pills rendered per item row using `getTagColor` for deterministic colors
- `editingId` / `editDraft` state drives expand-in-row edit: Pencil icon expands animated form
- Edit form covers all fields: name, estimated_cost, actual_cost, category, paid checkbox, tags
- Optimistic update applies immediately, Supabase `.update()` runs async, reverts on error
- Empty state: `PiggyBank` icon (16x16, 30% opacity), heading, subtext, primary CTA button, AI text link

## Task Commits

1. **Task 1+2: Tags + edit + empty state** - `539a213` (feat)

## Files Modified

- `src/components/dashboard/BudgetView.tsx` - Full rewrite with tags, edit form, empty state (342 lines -> 380 lines)

## Decisions Made

- `tags?: string[]` (optional) in BudgetItem -- pre-existing rows from DB may not have tags column until migration 009 is applied
- `items.length === 0` for empty state guard (vs `groupedItems.length`) -- shows empty state before category grouping logic
- Single atomic commit -- both tasks modify only one file

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Made tags optional in BudgetItem interface**
- **Found during:** TypeScript compile check
- **Issue:** `budget/page.tsx` passes demo items without `tags` field; migration 009 may not be applied
- **Fix:** Changed `tags: string[]` to `tags?: string[]` and used `item.tags || []` everywhere
- **Files modified:** `src/components/dashboard/BudgetView.tsx`
- **Commit:** 539a213

## Issues Encountered

Pre-existing TypeScript errors in `checklist/page.tsx` and `guests/page.tsx` (missing `tags` on demo items for ChecklistView and GuestView). Out of scope for this plan -- logged for plans 12-02 and 12-04 to fix in their own contexts.

## Next Phase Readiness

- Plan 12-04 (GuestView tags + edit) can follow the same patterns established here
- Migration 009 still needs manual application for tags to persist in production

---
*Phase: 12-ai-smarts-first-run*
*Completed: 2026-03-16*
