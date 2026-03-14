# Phase 11: Bug Fixes - Research

**Researched:** 2026-03-14
**Domain:** Next.js App Router, Supabase SSR, React component surgery
**Confidence:** HIGH

## Summary

All four bugs are surgical fixes within already-existing, well-structured code. No new libraries are needed. The root causes are clearly visible from source inspection: (1) the dashboard heading never rendered because there is no `/dashboard` page -- the nav shows names in the desktop header only, and on mobile the names are hidden; (2) the auth callback redirect logic already detects new vs. returning users but uses the wrong signal and never redirects to `/chat`; (3) budget items created by the AI chatbot land in the same `budget_items` table but the `BudgetView` component has no way to know they were AI-created -- the table has no `source` column; (4) the checklist stat grid renders four cards with a duplicate "Progres" card and the "Zbyvá" card shows pending task count rather than days-to-wedding.

Each fix is isolated. The shared risk is the redirect logic (BUG-02) which touches the OAuth callback route -- changes there must not break existing returning-user flows.

**Primary recommendation:** Fix in this order: BUG-01 (trivial data fetch), BUG-04 (pure UI edit), BUG-03 (DB migration + UI badge), BUG-02 (redirect logic, most risk).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Checklist header (BUG-04)
- Remove the "Progres" stat card entirely (duplicates Hotovo info)
- Keep 3 cards: Hotovo (X/Y), Zbývá (countdown), Po termínu
- "Zbývá" card shows days-to-wedding as main value (e.g. "180 dní"), not pending task count
- 3 cards stretch to full container width, aligned with the checklist content below

#### Budget items from chatbot (BUG-03)
- AI-created budget items are fully editable and deletable, same controls as manual items
- AI items get a placeholder AI icon to distinguish source
- Vendor logo replacement for the AI icon is deferred to v3.0+ (vendor marketplace)
- Items appear in the same list as manual items, no separate section

#### Post-login redirect (BUG-02)
- First login (right after onboarding): redirect to `/chat` (AI assistant welcome)
- Every subsequent login: redirect to `/checklist`
- Fix must work on mobile (current bug: mobile redirects to landing page)

#### Dashboard couple names (BUG-01)
- User sees actual partner1_name & partner2_name in dashboard heading
- Straightforward data fetch fix

### Claude's Discretion
- How to detect "first login" vs "returning login" for redirect logic
- AI placeholder icon design (style, size)
- Dashboard names fix implementation approach

### Deferred Ideas (OUT OF SCOPE)
- Vendor logo icons on budget items -- v3.0+ vendor marketplace
- "Last visited page" redirect memory -- not needed now, consistent redirect is simpler
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUG-01 | User sees actual couple names in dashboard heading (not placeholder) | Layout already fetches `partner1_name` & `partner2_name` from `couples` table and passes to `DashboardNav`. Desktop nav renders names inline. Need to confirm where "dashboard heading" is -- likely the `DashboardNav` desktop logo area which already shows `{partner1} & {partner2}`. If the bug is the mobile header (which hides names), a small visible heading or mobile top-bar addition resolves it. |
| BUG-02 | User is redirected to `/chat` after first login, `/checklist` on subsequent logins -- must work on mobile | Auth callback route at `/auth/callback/route.ts` already has redirect logic but it redirects to `/checklist` even for new users (after onboarding data is written, `couple` record exists, so it always matches the "returning" branch). Need first-login detection. |
| BUG-03 | User sees individual budget line items created via chatbot with edit and delete | `action-executor.ts` inserts into `budget_items` with no source marker. `BudgetView` renders all items but has no AI icon. Two parts: DB migration to add `source` column, UI badge to show AI icon. |
| BUG-04 | User sees simple days-to-wedding countdown in checklist header, not confusing task stats | `ChecklistView` renders 4 stat cards in a `grid-cols-2 lg:grid-cols-4` grid. Remove "Progres" card, change "Zbývá" card value to `daysUntilWedding` string (e.g. "180 dní"). Adjust grid to 3 columns. |
</phase_requirements>

---

## Standard Stack

### Core (already in project -- no new installs needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 15.x | Server components, route handlers | Already in use |
| @supabase/ssr | current | Server-side Supabase client | Already in use -- auth callback uses it |
| React useState | built-in | Local state in client components | Already in BudgetView, ChecklistView |
| lucide-react | current | Icon set including Sparkles/Bot/Wand | Already in use in BudgetView (Trash2, Check etc.) |
| date-fns / differenceInDays | current | Days-to-wedding calculation | Already in ChecklistView |
| Tailwind 4 | 4.x | Styling | Already in use |

### No New Dependencies

All fixes are achievable with existing stack. The AI icon for BUG-03 uses a Lucide icon (`Sparkles` or `Bot`) already available from `lucide-react`.

---

## Architecture Patterns

### BUG-01: Dashboard Couple Names

**Current state (verified by reading layout.tsx and DashboardNav.tsx):**

The dashboard layout already fetches `partner1_name` and `partner2_name` from `couples` table and passes them to `DashboardNav`. The desktop nav renders them in the header:

```tsx
// DashboardNav.tsx line 52-54 -- already working on desktop
<span className="text-sm text-[var(--color-text-light)]">
  {partner1} & {partner2}
</span>
```

The mobile top bar (line 104-120) shows only the "Svoji" logo -- no partner names visible.

**The likely bug:** On mobile, partner names are never shown. The fix is to add partner names to the mobile top bar OR confirm the "dashboard heading" refers to a page-level `<h1>` somewhere.

**Recommendation:** Add a visible `{partner1} & {partner2}` line to the mobile top bar nav. This is a 2-line change in `DashboardNav.tsx`.

**Pattern -- prop already available, just render it:**
```tsx
// Mobile top bar addition
<span className="text-xs text-[var(--color-text-light)]">
  {partner1} & {partner2}
</span>
```

### BUG-02: Post-Login Redirect

**Current state (verified by reading auth/callback/route.ts):**

```typescript
// Line 60-67 in route.ts -- current logic
const { data: couple } = await supabase
  .from('couples')
  .select('id')
  .eq('id', data.user.id)
  .single()

const redirectTo = couple ? '/checklist' : '/onboarding'
```

**The bug:** When a NEW user signs in after onboarding, the onboarding data was ALREADY written to the `couples` table earlier in the same callback (lines 33-57). So by the time the redirect check runs, `couple` is always found, and the user always goes to `/checklist` instead of `/chat`.

The mobile-specific bug is a separate issue: the callback route runs server-side, so mobile vs desktop should not matter at the route handler level. The mobile redirect to the landing page likely happens because the Next.js middleware or a client-side redirect intercepts and sends the user to `/`. Needs testing.

**First-login detection approaches (Claude's Discretion -- recommend option 2):**

**Option 1: `created_at` timestamp check**
After onboarding upsert, check if `created_at` is within the last 60 seconds:
```typescript
const { data: couple } = await supabase
  .from('couples')
  .select('id, created_at')
  .eq('id', data.user.id)
  .single()

const isFirstLogin = couple &&
  Date.now() - new Date(couple.created_at).getTime() < 60_000
const redirectTo = isFirstLogin ? '/chat' : '/checklist'
```
Risk: race condition if DB write is slow.

**Option 2: Query parameter flag (RECOMMENDED)**
The onboarding flow already passes an `onboarding` base64 param to the OAuth callback. Use this presence to signal first login:
```typescript
// Already available: const onboardingParam = searchParams.get('onboarding')
const isFirstLogin = Boolean(onboardingParam)
const redirectTo = isFirstLogin ? '/chat' : '/checklist'
```
This is the cleanest signal -- the `onboarding` param is ONLY present on the very first OAuth flow after completing onboarding. Returning users who log in again do not have this param. Zero DB queries needed.

**Option 3: `first_login_at` column on couples table**
Add a nullable `first_login_at` column, set it on first callback, check it on subsequent ones. Most robust but requires a migration.

**Recommendation:** Option 2 (query param) -- zero migration, zero race condition, logically correct.

**Mobile bug investigation:** The middleware at `src/lib/supabase/middleware.ts` does not redirect to `/` for authenticated users -- it only redirects unauthenticated users away from protected paths. The landing page redirect on mobile is likely caused by the callback URL itself: the `origin` on mobile may resolve differently, or the OAuth provider's redirect_uri is set to a URL that the mobile browser treats differently. The `NextResponse.redirect(\`${origin}${redirectTo}\`)` should work the same on mobile -- investigate by checking if `origin` resolves to `http://localhost:3000` or `https://...` correctly.

### BUG-03: AI Budget Items Visibility + Source Icon

**Current state (verified by reading action-executor.ts and BudgetView.tsx):**

The AI inserts budget items with:
```typescript
// action-executor.ts line 224-232
await supabase.from('budget_items').insert({
  couple_id: coupleId,
  name,
  category: category || 'other',
  estimated_cost: amount,
  actual_cost: null,
  paid: false,
})
```

No `source` field exists. The `budget_items` table schema (migration 002) has no `source` column.

`BudgetView` fetches with `select('*')` and renders all items. Items ARE visible -- they appear in the grouped list under their category. The bug description says users don't see them, which suggests either:
- Items land in a category (`'other'`) but the grouped view only shows categories with items, so they should appear
- OR the bug is that there's no way to know an item was AI-created (cosmetic/trust issue)
- OR the actual_cost display logic hides them (items without actual_cost show estimated in gray with `~` prefix -- this IS shown)

**Most likely interpretation:** Items are visible but indistinguishable from manual items. The fix is cosmetic: add `source` column to DB, store `'ai'` when inserted by action-executor, show a Sparkles icon badge in BudgetView.

**Implementation pattern:**

1. Migration: add `source VARCHAR(20) DEFAULT 'manual'` to `budget_items`
2. `action-executor.ts`: pass `source: 'ai'` in insert
3. `BudgetView.tsx`: update `BudgetItem` interface, render AI badge:

```tsx
// In BudgetView item row, after the name span
{item.source === 'ai' && (
  <Sparkles className="w-3 h-3 text-[var(--color-accent)] flex-shrink-0"
    aria-label="Přidáno AI asistentem" />
)}
```

The `BudgetItem` interface in `BudgetView.tsx` needs `source?: string` field added.

The budget page fetches with `select('*')` so new column is automatically returned -- no query change needed.

### BUG-04: Checklist Header Countdown

**Current state (verified by reading ChecklistView.tsx lines 138-160):**

```tsx
// 4 StatCard grid -- current (WRONG)
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
  <StatCard label="Hotovo" value={`${stats.completed}/${stats.total}`} progress={...} />
  <StatCard label="Zbývá" value={stats.pending.toString()} subtitle={`${daysUntilWedding} dní do svatby`} />
  <StatCard label="Po termínu" value={stats.overdue.toString()} alert={...} />
  <StatCard label="Progres" value={`${Math.round(...)}%`} progress={...} />
</div>
```

`daysUntilWedding` is already calculated at line 61:
```tsx
const daysUntilWedding = differenceInDays(new Date(weddingDate), new Date());
```

**Fix -- exact change:**

```tsx
// AFTER: 3 StatCard grid
<div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
  <StatCard label="Hotovo" value={`${stats.completed}/${stats.total}`} progress={...} />
  <StatCard label="Zbývá" value={`${daysUntilWedding} dní`} subtitle="do svatby" />
  <StatCard label="Po termínu" value={stats.overdue.toString()} alert={...} />
</div>
```

Remove the "Progres" StatCard entirely. Change grid from `grid-cols-2 lg:grid-cols-4` to `grid-cols-3`. Change "Zbývá" value from `stats.pending.toString()` to `\`${daysUntilWedding} dní\`` and subtitle from the days-to-wedding string to `"do svatby"`.

Edge case: `daysUntilWedding` can be negative if the wedding date is in the past. Handle gracefully:
```tsx
const daysLabel = daysUntilWedding >= 0
  ? `${daysUntilWedding} dní`
  : 'Proběhla'
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| First-login detection | Custom session tracking table | `onboarding` query param already present | Zero-cost signal already in the flow |
| AI icon | Custom SVG | `Sparkles` from lucide-react | Already imported pattern in codebase |
| Days calculation | Custom date math | `differenceInDays` from date-fns | Already in ChecklistView, tested |
| DB migration | Manual Supabase dashboard edits | SQL migration file in `supabase/migrations/` | Reproducible, version-controlled |

---

## Common Pitfalls

### Pitfall 1: The `onboarding` param check for BUG-02 must come BEFORE couple lookup
**What goes wrong:** If the couple lookup runs first and the developer checks `isFirstLogin` after, the redirect logic may run with stale state.
**How to avoid:** Determine `isFirstLogin` from `onboardingParam` immediately, then set `redirectTo` based on it. The existing onboarding upsert block already gates on `if (onboardingParam)` so the check is consistent.

### Pitfall 2: `budget_items` migration -- `DEFAULT 'manual'` required
**What goes wrong:** Existing rows without `source` will have `NULL`, and `item.source === 'ai'` check won't need changing, but `item.source === 'manual'` checks would fail.
**How to avoid:** Set `DEFAULT 'manual'` in the migration. Existing rows get `'manual'` via backfill in the same migration:
```sql
UPDATE budget_items SET source = 'manual' WHERE source IS NULL;
```

### Pitfall 3: `BudgetItem` TypeScript interface not updated
**What goes wrong:** Adding `source` to DB but not to the `BudgetItem` interface in `BudgetView.tsx` causes TypeScript errors or silently ignores the field.
**How to avoid:** Add `source?: string` to the interface before using it in JSX.

### Pitfall 4: Negative `daysUntilWedding` crashes the display
**What goes wrong:** If `wedding_date` is in the past, `differenceInDays` returns a negative number. Showing "-12 dní" is confusing.
**How to avoid:** Add a guard: `daysUntilWedding >= 0 ? \`${daysUntilWedding} dní\` : 'Proběhla'`.

### Pitfall 5: Mobile redirect root cause may be OAuth redirect_uri
**What goes wrong:** Investigating the "mobile redirects to landing page" bug only in code, missing that the Supabase OAuth redirect_uri setting or the `origin` URL resolution may be the actual cause.
**How to avoid:** After BUG-02 code fix, test on actual mobile device. If issue persists, check Supabase project's allowed redirect URLs in the Auth settings. The `origin` in `NextResponse.redirect(\`${origin}${redirectTo}\`)` may resolve to `http://localhost:3000` in some environments.

### Pitfall 6: Stat grid layout breaks on small screens with 3 columns
**What goes wrong:** `grid-cols-3` on very small screens (320px) may make stat cards too narrow to read.
**How to avoid:** Use `grid-cols-3` without the `lg:` qualifier since 3 wide cards fit at 320px minimum (each ~100px). Test on 375px viewport. If too tight, use responsive: `grid-cols-3 sm:grid-cols-3`.

---

## Code Examples

### BUG-01: Add partner names to mobile nav bar

```tsx
// src/components/dashboard/DashboardNav.tsx
// Mobile top bar -- BEFORE (line 104-120)
<nav className="md:hidden fixed top-0 left-0 right-0 z-40 ...">
  <div className="flex items-center justify-between h-14 px-4">
    <Link href="/checklist" className="flex items-center gap-2">
      <span className="text-lg font-heading text-[var(--color-primary)]">Svoji</span>
    </Link>
    ...
  </div>
</nav>

// AFTER
<nav className="md:hidden fixed top-0 left-0 right-0 z-40 ...">
  <div className="flex items-center justify-between h-14 px-4">
    <Link href="/checklist" className="flex items-center gap-2">
      <span className="text-lg font-heading text-[var(--color-primary)]">Svoji</span>
      <span className="text-xs text-[var(--color-text-light)]">{partner1} & {partner2}</span>
    </Link>
    ...
  </div>
</nav>
```

### BUG-02: First-login redirect using onboarding param

```typescript
// src/app/auth/callback/route.ts
// Replace lines 60-67 with:
const isFirstLogin = Boolean(onboardingParam)
const redirectTo = isFirstLogin ? '/chat' : '/checklist'
return NextResponse.redirect(`${origin}${redirectTo}`)
```

### BUG-03: DB migration for source column

```sql
-- supabase/migrations/008_budget_item_source.sql
ALTER TABLE budget_items
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';

UPDATE budget_items SET source = 'manual' WHERE source IS NULL;
```

### BUG-03: action-executor insert with source

```typescript
// src/lib/ai/action-executor.ts -- addBudgetItem function
const { data, error } = await supabase
  .from('budget_items')
  .insert({
    couple_id: coupleId,
    name,
    category: category || 'other',
    estimated_cost: amount,
    actual_cost: null,
    paid: false,
    source: 'ai',  // ADD THIS
  })
  .select()
  .single();
```

### BUG-03: BudgetView interface and AI badge

```tsx
// src/components/dashboard/BudgetView.tsx

// 1. Update interface
interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  paid: boolean;
  source?: string;  // ADD THIS
}

// 2. Import Sparkles from lucide-react (already imported Plus, Trash2, Check, X, PiggyBank)
import { Plus, Trash2, Check, X, PiggyBank, Sparkles } from 'lucide-react';

// 3. In the item row JSX, after item name span:
<span className={item.paid ? 'line-through text-gray-400' : ''}>
  {item.name}
</span>
{item.source === 'ai' && (
  <Sparkles
    className="w-3 h-3 text-[var(--color-accent)] flex-shrink-0"
    aria-label="Přidáno AI asistentem"
  />
)}
```

### BUG-04: ChecklistView stat grid change

```tsx
// src/components/dashboard/ChecklistView.tsx

// BEFORE (lines 139-160)
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
  <StatCard label="Hotovo" value={`${stats.completed}/${stats.total}`} progress={(stats.completed / stats.total) * 100} />
  <StatCard label="Zbývá" value={stats.pending.toString()} subtitle={`${daysUntilWedding} dní do svatby`} />
  <StatCard label="Po termínu" value={stats.overdue.toString()} alert={stats.overdue > 0} />
  <StatCard label="Progres" value={`${Math.round((stats.completed / stats.total) * 100)}%`} progress={(stats.completed / stats.total) * 100} />
</div>

// AFTER
<div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
  <StatCard label="Hotovo" value={`${stats.completed}/${stats.total}`} progress={(stats.completed / stats.total) * 100} />
  <StatCard
    label="Zbývá"
    value={daysUntilWedding >= 0 ? `${daysUntilWedding} dní` : 'Proběhla'}
    subtitle="do svatby"
  />
  <StatCard label="Po termínu" value={stats.overdue.toString()} alert={stats.overdue > 0} />
</div>
```

---

## Validation Architecture

> `workflow.nyquist_validation` is absent from config.json -- treating as enabled.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected -- no jest.config, vitest.config, or test directories found |
| Config file | Wave 0 gap -- needs creation |
| Quick run command | `npx vitest run --reporter=verbose` (after setup) |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUG-01 | Partner names render in mobile nav | Manual visual | n/a | n/a |
| BUG-02 | First login redirects to `/chat`, subsequent to `/checklist` | Unit (redirect logic) | `npx vitest run tests/auth-callback.test.ts` | Wave 0 gap |
| BUG-03 | AI budget items appear with Sparkles badge, editable and deletable | Manual visual + unit (interface) | `npx vitest run tests/budget-view.test.ts` | Wave 0 gap |
| BUG-04 | Checklist shows 3 cards with days value in Zbývá | Manual visual | n/a | n/a |

Note: BUG-01 and BUG-04 are pure UI changes best verified visually. BUG-02 redirect logic and BUG-03 source field propagation benefit from unit tests.

### Sampling Rate

- **Per task commit:** Manual: load page on mobile and desktop and verify visual
- **Per wave merge:** TypeScript compile check: `npx tsc --noEmit`
- **Phase gate:** All 4 bugs confirmed fixed on desktop + mobile before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/auth-callback.test.ts` -- unit test for redirect logic (BUG-02): test `isFirstLogin = true` -> `/chat`, `isFirstLogin = false` -> `/checklist`
- [ ] `tests/budget-view.test.ts` -- unit test for AI source badge rendering (BUG-03)
- [ ] Test framework install: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom` -- if vitest selected

*(Given the surgical nature of these fixes, the planner may reasonably decide manual testing is sufficient for this phase and skip test framework setup.)*

---

## Open Questions

1. **BUG-01 actual location of "dashboard heading"**
   - What we know: There is no `/dashboard` route -- the main entry after login is `/checklist`. The DashboardNav already shows partner names on desktop.
   - What's unclear: Is the bug the mobile nav missing names, or is there a page-level heading somewhere that shows a placeholder?
   - Recommendation: The fix should add names to the mobile top bar. If a page-level heading is expected, the planner should decide which page (checklist? a new dashboard redirect?).

2. **BUG-02 mobile root cause**
   - What we know: The callback route runs server-side so mobile/desktop distinction shouldn't matter at the route level.
   - What's unclear: Whether the "mobile redirects to landing page" is caused by (a) the OAuth redirect_uri not being mobile-friendly, (b) the Next.js middleware intercepting the redirect, or (c) something specific to the mobile browser handling the OAuth flow.
   - Recommendation: Fix the redirect logic (onboarding param approach) and test on real mobile. If issue persists, check Supabase Auth redirect URL allowlist and `origin` resolution.

3. **BUG-03: Are AI items actually invisible or just unlabeled?**
   - What we know: `BudgetView` renders all items from `budget_items` with `select('*')`, grouped by category. AI items inserted with `category: 'other'` appear in the "Ostatní" group.
   - What's unclear: The bug description says "user sees individual budget line items created via chatbot" -- implying they're NOT visible. But the code should show them.
   - Recommendation: The fix should focus on the AI source badge (icon) as the primary deliverable. If items truly aren't visible, investigate whether `action-executor` is actually being called and items are being inserted (add logging/error handling).

---

## Sources

### Primary (HIGH confidence)
- Direct source code inspection of all relevant files (verified 2026-03-14):
  - `src/app/(dashboard)/layout.tsx`
  - `src/app/auth/callback/route.ts`
  - `src/components/dashboard/BudgetView.tsx`
  - `src/components/dashboard/ChecklistView.tsx`
  - `src/components/dashboard/DashboardNav.tsx`
  - `src/lib/ai/action-executor.ts`
  - `src/lib/supabase/middleware.ts`
  - `src/app/(dashboard)/budget/page.tsx`
  - `src/app/(dashboard)/checklist/page.tsx`
  - `supabase/migrations/002_couples_and_planning.sql`
  - `supabase/migrations/004_onboarding_v2.sql`
  - `supabase/migrations/007_data_collection.sql`

### Secondary (MEDIUM confidence)
- Supabase SSR docs pattern for server-side redirect in route handlers (known pattern, consistent with existing code)
- date-fns `differenceInDays` behavior with past dates (returns negative int -- well-documented)

---

## Metadata

**Confidence breakdown:**
- BUG-01 fix: HIGH -- code is right there, trivial 2-line change
- BUG-02 redirect logic: HIGH -- root cause identified (onboarding param already present), mobile root cause: MEDIUM (needs real device test)
- BUG-03 DB migration + icon: HIGH -- migration pattern established, BudgetItem interface clearly mapped
- BUG-04 grid change: HIGH -- exact lines identified, diff is mechanical

**Research date:** 2026-03-14
**Valid until:** 90 days (stable Next.js + Supabase project, no churn expected)
