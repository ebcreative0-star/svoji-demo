---
phase: 12-ai-smarts-first-run
verified: 2026-03-16T20:00:00Z
status: gaps_found
score: 6/7 must-haves verified
gaps:
  - truth: "Czech date strings like '31.1.2026', 'za 2 tydny', 'konec ledna' parse to correct ISO dates in AI chat"
    status: partial
    reason: "parseCzechDate() utility exists and is correct, but is not imported or called by action-executor.ts or intent-classifier.ts. The AI chat path still has due_date hardcoded to null. The fix was built but not wired."
    artifacts:
      - path: "src/lib/date-utils.ts"
        issue: "File exists with correct implementation but has zero imports anywhere in the codebase"
      - path: "src/lib/ai/action-executor.ts"
        issue: "Still sets due_date: null directly (lines 103, 148) without calling parseCzechDate"
    missing:
      - "Import parseCzechDate from '@/lib/date-utils' in src/lib/ai/action-executor.ts"
      - "Call parseCzechDate on any date params extracted by the intent classifier before passing to Supabase insert"
human_verification:
  - test: "Add a checklist item via quick-add (Enter key)"
    expected: "Item appears immediately in the list with optimistic update, persists after page reload"
    why_human: "Requires live Supabase connection and browser interaction"
  - test: "Click Pencil on a checklist item, edit all fields, click Ulozit"
    expected: "Item updates immediately (optimistic), changes persist after page reload"
    why_human: "Requires live Supabase connection and browser interaction"
  - test: "Click Trash2 on a checklist item"
    expected: "Item disappears immediately (optimistic), stays gone after page reload"
    why_human: "Requires live Supabase connection and browser interaction"
  - test: "Add a budget item with tags, click Pencil to edit, change fields, save"
    expected: "Tag pills appear on row with deterministic colors; all edited fields persist"
    why_human: "Requires live Supabase + migration 009 applied"
  - test: "Add a guest with tags, click Pencil to edit all fields, save"
    expected: "Guest row updates with all edited values; no table elements, div grid layout"
    why_human: "Requires live Supabase + migration 009 applied"
  - test: "Navigate to /chat and type 'za 2 tydny' as a due date in a request"
    expected: "AI creates checklist item with due_date 14 days from today (NOT null)"
    why_human: "FIX-01 wiring gap -- this will FAIL until parseCzechDate is wired into action-executor.ts"
---

# Phase 12: AI Smarts / First Run Verification Report

**Phase Goal:** Users can add, edit, and delete checklist items, budget items, and guests directly from the dashboard without relying on AI chat. Free-form tagging system. Czech date parsing fix.
**Verified:** 2026-03-16
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Tags column exists on all three item tables (text[] with empty default) | ? MANUAL REQUIRED | Migration SQL in 009_tags_jsonb.sql is correct; must be applied manually via Supabase Dashboard |
| 2 | Tag color is deterministic from tag string (same tag always gets same color) | VERIFIED | `src/lib/tags.ts` uses `(hash * 31 + charCode) % 8` -- deterministic, 8-color palette |
| 3 | TagInput supports adding/removing tags with autocomplete from existing tags | VERIFIED | `src/components/dashboard/TagInput.tsx` -- 144 lines, full impl: pills, X-remove, Enter/comma/Backspace/Escape, onMouseDown dropdown |
| 4 | Czech date strings like '31.1.2026', 'za 2 tydny', 'konec ledna' parse to valid ISO dates | PARTIAL | `parseCzechDate()` in `src/lib/date-utils.ts` is correct but NOT imported by any consumer. `action-executor.ts` still sets `due_date: null` |
| 5 | User can add, edit, delete checklist items with quick-add, expand-in-row edit, and trash icon | VERIFIED | ChecklistView.tsx 790 lines: `quickTitle`, `handleDelete`, `editingId`/`editDraft`, Supabase insert/update/delete all present and wired |
| 6 | User can add budget items (with tags), edit inline, see empty state | VERIFIED | BudgetView.tsx 553 lines: TagInput in add form, `editingId`/`editDraft`, Supabase update wired, PiggyBank empty state |
| 7 | User can add guests (with tags), edit inline (div layout, not table), see empty state | VERIFIED | GuestsView.tsx 668 lines: div grid layout (zero `table`/`thead`/`tbody` matches), TagInput on add form, `editingId`/`editDraft`, Supabase update wired, Users empty state |

**Score:** 6/7 truths verified (1 partial -- FIX-01 wiring missing)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/009_tags_jsonb.sql` | tags text[] on 3 tables | VERIFIED | 4 lines, correct ALTER TABLE for all 3 tables |
| `src/lib/tags.ts` | getTagColor() + TAG_COLORS | VERIFIED | 24 lines, exports both; deterministic hash via charCode |
| `src/lib/date-utils.ts` | parseCzechDate() | PARTIAL | 120 lines, correct impl; exports parseCzechDate -- but zero imports in codebase |
| `src/components/dashboard/TagInput.tsx` | Reusable tag input | VERIFIED | 144 lines, 'use client', exports TagInput; full keyboard UX |
| `src/components/dashboard/ChecklistView.tsx` | Full CRUD checklist | VERIFIED | 790 lines (min 500); quick-add, expand-edit, delete, tags, empty state |
| `src/components/dashboard/BudgetView.tsx` | Budget with edit + tags | VERIFIED | 553 lines (min 400); add form tags, edit form, empty state |
| `src/components/dashboard/GuestsView.tsx` | Guests div layout + edit + tags | VERIFIED | 668 lines (min 450); no table elements, expand-edit, tags, empty state |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `TagInput.tsx` | `src/lib/tags.ts` | import getTagColor | WIRED | Line 6: `import { getTagColor } from '@/lib/tags'` |
| `src/lib/date-utils.ts` | `date-fns` | import addDays, addWeeks, etc. | WIRED | Line 1: `import { addDays, addWeeks, endOfMonth, parse, isValid, format } from 'date-fns'` |
| `ChecklistView.tsx` | `TagInput.tsx` | import TagInput | WIRED | Verified via pattern count (37 matches on combined patterns) |
| `ChecklistView.tsx` | `@supabase/supabase-js` | supabase.from('checklist_items').insert/update/delete | WIRED | Lines 117 (insert), 185 (update), 151 (delete) all present |
| `BudgetView.tsx` | `TagInput.tsx` | import TagInput | WIRED | Line 289: `<TagInput ...>` in add form |
| `BudgetView.tsx` | `@supabase/supabase-js` | supabase.from('budget_items').update | WIRED | Line 141: `.update({...}).eq('id', editingId)` |
| `GuestsView.tsx` | `TagInput.tsx` | import TagInput | WIRED | Present (count 44 matches on combined patterns) |
| `GuestsView.tsx` | `@supabase/supabase-js` | supabase.from('guests').update | WIRED | Lines 178-180: `.update(update).eq('id', editingId)` |
| `src/lib/date-utils.ts` | `src/lib/ai/action-executor.ts` | import parseCzechDate | NOT WIRED | Zero imports of date-utils anywhere; action-executor sets due_date: null directly |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| UI-01 | 12-02 | User can manually add checklist items | SATISFIED | ChecklistView: quick-add input + Enter handler + Supabase insert |
| UI-02 | 12-02 | User can edit checklist items (title, due_date, priority, category) | SATISFIED | ChecklistView: editingId/editDraft state, AnimatePresence expand, Supabase update |
| UI-03 | 12-03 | User can manually add budget items | SATISFIED | BudgetView: existing add form extended with tags, Supabase insert |
| UI-04 | 12-03 | User can edit budget items (name, amount, category, paid status) | SATISFIED | BudgetView: Pencil icon, expand-in-row edit form, Supabase update all fields |
| UI-05 | 12-04 | User can manually add guests | SATISFIED | GuestsView: existing add form extended with tags, Supabase insert |
| UI-06 | 12-04 | User can edit guest details (name, group, RSVP status, dietary, plus_one) | SATISFIED | GuestsView: Pencil icon, full edit form (name/email/phone/group/RSVP/dietary/plus_one/notes/tags), Supabase update |
| FIX-01 | 12-01 | Czech date parsing for AI chat | BLOCKED | parseCzechDate() utility exists but is NOT wired into action-executor.ts or intent-classifier.ts; due_date still hardcoded to null |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/date-utils.ts` | -- | Exported function with zero consumers | Warning | parseCzechDate exists but is an orphan utility; FIX-01 goal unmet |
| `src/lib/ai/action-executor.ts` | 103, 148 | `due_date: null` hardcoded | Warning | Czech date input from AI chat is silently dropped; this was the bug FIX-01 should fix |

No placeholder stubs, empty implementations, or TODO markers found in any of the four Phase 12 view files.

---

## Human Verification Required

### 1. Supabase Migration 009

**Test:** Apply migration SQL via Supabase Dashboard SQL Editor:
```sql
ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE budget_items ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE guests ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
```
**Expected:** All three commands succeed (or are idempotent if already applied)
**Why human:** Cannot verify DB state programmatically without live credentials

### 2. ChecklistView Full CRUD Flow

**Test:** In the browser, navigate to /checklist. Type a task title, press Enter. Click the Pencil icon on an item. Edit title + due date. Click Ulozit. Click Trash2 on another item.
**Expected:** Quick-add creates item instantly (optimistic); edit form expands with animation; save updates immediately; delete removes immediately. All changes survive page reload.
**Why human:** Requires live Supabase session + browser interaction

### 3. BudgetView Edit + Tags

**Test:** Add a budget item with a tag. Then click Pencil on that item and change the name, cost, and tags.
**Expected:** Tag pills appear with consistent colors; edit form expands smoothly; save persists all changed fields.
**Why human:** Requires live Supabase + migration 009 applied

### 4. GuestsView Div Layout + Edit

**Test:** Open /guests, confirm no table-based rendering in browser DevTools. Add a guest with tags. Click Pencil to edit.
**Expected:** Guest list renders as CSS grid (not HTML table); expand animation works correctly in Safari; all fields editable.
**Why human:** Visual + browser-specific behavior cannot be grepped

### 5. FIX-01 Czech Date in AI Chat (EXPECTED TO FAIL)

**Test:** Open /chat, ask "Pridej ukol zavesit svetla za 2 tydny"
**Expected (after fix):** Checklist item created with due_date 14 days from today
**Actual (current state):** Item created with due_date null -- parseCzechDate not wired
**Why human:** Requires live AI session; documents the current broken state for re-verification

---

## Gaps Summary

One gap blocks full goal achievement:

**FIX-01 wiring missing.** The Czech date parsing utility (`parseCzechDate` in `src/lib/date-utils.ts`) was correctly implemented per the plan specification. However, it was never connected to the AI chat execution path. The RESEARCH.md explicitly described the fix location as `action-executor.ts`, and the plan listed FIX-01 as a completed requirement in 12-01-SUMMARY.md. But `action-executor.ts` still hardcodes `due_date: null` on lines 103 and 148, and `parseCzechDate` has zero imports in the entire codebase.

The fix is minimal: import `parseCzechDate` in `action-executor.ts` and apply it to any date string extracted from the AI intent before storing to Supabase.

All other phase goals -- manual CRUD for checklist, budget, and guests; free-form tagging system with colored pills and autocomplete; TagInput reusable component; tags DB migration -- are fully verified with substantive implementations and correct wiring.

---

_Verified: 2026-03-16_
_Verifier: Claude (gsd-verifier)_
