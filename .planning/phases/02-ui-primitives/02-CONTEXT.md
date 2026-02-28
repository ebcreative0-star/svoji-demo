# Phase 2: UI Primitives - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Build typed Button, Card, Input, and Badge components in `src/components/ui/` that replace all one-off CSS class usage across the app. Every button, card container, form field, and status indicator should use these primitives with explicit variant/size props. No new pages or features -- this is foundation work.

</domain>

<decisions>
## Implementation Decisions

### Button
- **Variants:** Primary (solid accent), Secondary (outlined), Ghost (text-only), Danger (destructive)
- **Sizes:** sm (compact actions, table rows), md (default), lg (hero CTAs, prominent actions)
- **Icon support:** Leading icon, trailing icon, and icon-only mode. Lucide icons used throughout the app.
- **Loading state:** Built-in `isLoading` prop that shows spinner and disables the button. Replaces manual Loader2 + disabled pattern.

### Card
- **Visual style:** Subtle & clean -- light border + minimal shadow. Modern SaaS aesthetic (Linear/Notion feel).
- **Structure:** Compound components -- Card, Card.Header, Card.Body, Card.Footer. Enforces consistent padding and dividers.
- **Padding:** 2 tiers -- Default (p-4 for dashboard content) and Compact (p-3 for dense lists/tables).
- **Interactivity:** Opt-in `interactive` prop that adds hover shadow lift and cursor pointer. Phase 3 will layer motion on top.

### Input & Form
- **Scope:** Three separate components -- Input, Textarea, Select -- sharing the same visual style (focus ring, border, error states).
- **Labels:** Built-in label, helperText, and error props. Label renders above, helper/error below the field.
- **RHF integration:** Standalone base components + separate FormInput/FormTextarea/FormSelect wrappers for react-hook-form. Works with and without RHF.
- **Error states:** Red/danger border color + error message in small text below the field.

### Badge
- **Colors:** Semantic mapping -- success (green, confirmed RSVP), warning (amber, pending), danger (red, declined/urgent), info (blue, neutral info), neutral (gray, default).
- **Style:** Pill shape (rounded-full) with soft background tint and darker text. GitHub/Linear label aesthetic.
- **Dot indicator:** Optional leading colored dot for status indicators (RSVP status, online/offline).
- **Sizes:** sm (inline in tables, compact lists) and md (standalone labels, card headers).

### Claude's Discretion
- Exact spacing values and typography sizing within components
- Internal component implementation patterns (forwardRef, polymorphism, etc.)
- How to handle compound Card component exports (dot notation vs named exports)
- Focus ring exact color and width
- Transition durations for hover states

</decisions>

<specifics>
## Specific Ideas

- Cards should feel like Linear's issue cards -- clean, not cluttered
- Badges should look like GitHub labels or Linear status chips
- Button loading replaces the manual `Loader2 + disabled` pattern already scattered across the codebase
- Premium 2026 SaaS aesthetic -- warm OKLCH palette from Phase 1 should flow through all primitives

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lucide-react` icons (Send, Loader2, Plus, Trash2, Check, X, etc.) -- used for button icons
- `react-hook-form` + `@hookform/resolvers` + `zod` -- form validation stack, Input wrappers should integrate
- `framer-motion` -- installed but not yet used for primitives (Phase 3 will add motion)
- OKLCH design tokens via `@theme` CSS variables in `globals.css`

### Established Patterns
- Tailwind utility-first with CSS variables: `text-[var(--color-primary)]`, `focus:ring-[var(--color-primary)]`
- `'use client'` directive for interactive components
- Named exports for components (not default)
- Props interfaces suffixed with `Props`
- Path alias `@/` for all imports

### Integration Points
- `src/components/ui/` -- target directory for all new primitives (currently only Navigation.tsx, Footer.tsx)
- ~30 raw `<button>` elements across dashboard and section components need migration
- ~15 card-pattern divs (`bg-white p-4 rounded-lg shadow-sm`) across dashboard views
- ~6 input patterns in RSVP form and ChatInterface
- Badge patterns in GuestsView (RSVP statuses), ChecklistView (priorities), BudgetView (categories)

</code_context>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 02-ui-primitives*
*Context gathered: 2026-02-28*
