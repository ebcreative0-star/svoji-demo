# Phase 11: Bug Fixes - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Four targeted usability fixes that break trust on first use: dashboard couple names, mobile redirect after login, budget line items from chatbot, and checklist countdown. No new features -- just making existing things work correctly.

</domain>

<decisions>
## Implementation Decisions

### Checklist header (BUG-04)
- Remove the "Progres" stat card entirely (duplicates Hotovo info)
- Keep 3 cards: Hotovo (X/Y), Zbývá (countdown), Po termínu
- "Zbývá" card shows days-to-wedding as main value (e.g. "180 dní"), not pending task count
- 3 cards stretch to full container width, aligned with the checklist content below

### Budget items from chatbot (BUG-03)
- AI-created budget items are fully editable and deletable, same controls as manual items
- AI items get a placeholder AI icon to distinguish source
- Vendor logo replacement for the AI icon is deferred to v3.0+ (vendor marketplace)
- Items appear in the same list as manual items, no separate section

### Post-login redirect (BUG-02)
- First login (right after onboarding): redirect to `/chat` (AI assistant welcome)
- Every subsequent login: redirect to `/checklist`
- Fix must work on mobile (current bug: mobile redirects to landing page)

### Dashboard couple names (BUG-01)
- User sees actual partner1_name & partner2_name in dashboard heading
- Straightforward data fetch fix

### Claude's Discretion
- How to detect "first login" vs "returning login" for redirect logic
- AI placeholder icon design (style, size)
- Dashboard names fix implementation approach

</decisions>

<specifics>
## Specific Ideas

- First login -> /chat ties into Phase 12 (AI welcome message) -- the redirect sets up that experience
- AI icon on budget items is a stepping stone toward vendor logos in the marketplace phase

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BudgetView` component (`src/components/dashboard/BudgetView.tsx`): Already has add/edit/delete UI for budget items
- `ChecklistView` component (`src/components/dashboard/ChecklistView.tsx`): Has StatCard sub-component, stats calculation, and grid layout
- `Card`, `Badge`, `Button` UI primitives from Phase 2
- `DashboardNav` component already receives partner1/partner2 props

### Established Patterns
- Dashboard layout fetches couple data in server component (`src/app/(dashboard)/layout.tsx`), passes to client components via props
- Budget items fetched from `budget_items` table with `select('*')` in budget page server component
- Auth callback in `src/app/auth/callback/route.ts` handles OAuth redirect logic
- Middleware (`src/lib/supabase/middleware.ts`) handles protected route enforcement

### Integration Points
- OAuth callback route (`/auth/callback`): redirect logic lives here, needs first-login detection
- `couples` table: has `partner1_name`, `partner2_name` fields, queried in dashboard layout
- `budget_items` table: AI action-executor inserts here via `src/lib/ai/action-executor.ts`
- ChecklistView stat cards: grid layout at line ~139, StatCard component renders each card

</code_context>

<deferred>
## Deferred Ideas

- Vendor logo icons on budget items -- v3.0+ vendor marketplace
- "Last visited page" redirect memory -- not needed now, consistent redirect is simpler

</deferred>

---

*Phase: 11-bug-fixes*
*Context gathered: 2026-03-14*
