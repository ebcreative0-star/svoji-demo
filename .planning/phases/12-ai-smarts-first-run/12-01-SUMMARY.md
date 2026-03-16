---
phase: 12-ai-smarts-first-run
plan: 01
subsystem: ui
tags: [tags, date-utils, czech-locale, date-fns, lucide-react, tailwind]

requires: []
provides:
  - getTagColor() deterministic hash function and TAG_COLORS palette (src/lib/tags.ts)
  - parseCzechDate() Czech date normalization utility (src/lib/date-utils.ts)
  - TagInput reusable component with autocomplete and colored pills (src/components/dashboard/TagInput.tsx)
  - tags text[] DB migration for checklist_items, budget_items, guests (supabase/migrations/009_tags_jsonb.sql)
affects:
  - 12-02
  - 12-03
  - 12-04

tech-stack:
  added: []
  patterns:
    - "Deterministic tag colors: hash tag string with char codes mod palette length"
    - "Czech date parsing: regex-based pattern matching for D.M.YYYY, 'za N dni/tydny', 'konec [mesice]'"
    - "TagInput: controlled component with onMouseDown on suggestions to beat onBlur timing"

key-files:
  created:
    - src/lib/tags.ts
    - src/lib/date-utils.ts
    - src/components/dashboard/TagInput.tsx
    - supabase/migrations/009_tags_jsonb.sql
  modified: []

key-decisions:
  - "Tag colors: 8-color palette (rose, violet, sky, emerald, amber, pink, indigo, teal), hash-based assignment"
  - "Czech month diacritics: normalize NFD + strip combining chars before lookup -- handles 'ledna'/'března'/'dubna' etc."
  - "Suggestion dropdown onMouseDown not onClick: prevents onBlur from firing before click registers"
  - "Migration 009 uses text[] not JSONB for tags -- simpler querying with @> and ANY() operators"

patterns-established:
  - "TagInput pattern: value/onChange controlled, existingTags for autocomplete, colored pills via getTagColor"
  - "Czech date parser: returns ISO string or null, never throws"

requirements-completed:
  - FIX-01

duration: 2min
completed: 2026-03-16
---

# Phase 12 Plan 01: Foundation Layer Summary

**Deterministic tag color system, Czech date parser for AI normalization, and reusable TagInput component with autocomplete -- shared foundation for all three CRUD views in Phase 12.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-16T19:09:44Z
- **Completed:** 2026-03-16T19:11:54Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- `getTagColor()`: deterministic hash mapping any tag string to one of 8 Tailwind color pairs -- same tag always same color
- `parseCzechDate()`: handles ISO passthrough, D.M.YYYY, relative "za N dni/tydny", "konec [mesice]" -- returns null on bad input, never throws
- `TagInput`: colored pill tags with add/remove, autocomplete dropdown from existingTags, keyboard UX (Enter/comma/Backspace/Escape)
- `009_tags_jsonb.sql`: tags text[] column on all three item tables, ready for manual application in Supabase Dashboard

## Task Commits

1. **Task 1: Tag utilities and Czech date parser** - `d0d2255` (feat)
2. **Task 2: TagInput component and DB migration** - `c2b1796` (feat)

## Files Created/Modified

- `src/lib/tags.ts` - TAG_COLORS palette + getTagColor() deterministic hash function
- `src/lib/date-utils.ts` - parseCzechDate() with Czech locale support via date-fns
- `src/components/dashboard/TagInput.tsx` - Reusable controlled tag input with autocomplete pills
- `supabase/migrations/009_tags_jsonb.sql` - ALTER TABLE for tags column on all three item tables

## Decisions Made

- Czech month lookup normalizes diacritics (NFD strip) to match both "ledna" and "března" variants
- Suggestion dropdown uses `onMouseDown` instead of `onClick` to prevent `onBlur` timing race
- `text[]` for tags column (not JSONB) -- simpler PostgreSQL operators (`@>`, `ANY()`) for filtering

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Apply migration 009 manually via Supabase Dashboard SQL Editor (same process as migration 008):

```sql
ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE budget_items ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE guests ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
```

## Next Phase Readiness

- Plans 12-02, 12-03, 12-04 can import TagInput from `@/components/dashboard/TagInput`
- `getTagColor` and `parseCzechDate` available from `@/lib/tags` and `@/lib/date-utils`
- Migration 009 needs manual application before tags can be stored

---
*Phase: 12-ai-smarts-first-run*
*Completed: 2026-03-16*
