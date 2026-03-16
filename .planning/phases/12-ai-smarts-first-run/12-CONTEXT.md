# Phase 12: Manual CRUD UI - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Add manual add/edit/delete capabilities to all three dashboard views (checklist, budget, guests) so users can manage their wedding plan without relying on AI chat. Includes free-form tagging system and Czech date parsing fix. Budget and Guests already have add+delete; Checklist has nothing. All three views need edit capability.

</domain>

<decisions>
## Implementation Decisions

### Edit Pattern
- Expand-in-row: click/tap item -> row expands to show edit form with all fields including tags
- Consistent with existing add forms in Budget and Guests (both use collapsible forms)
- Same pattern for all three views

### Tagging System
- Free-form tags: user types custom tags, system suggests existing tags via autocomplete
- Each item can have multiple tags
- Colored pill badges (auto-assigned from a palette) -- reuse existing Badge component with color variants
- Tags replace the current hardcoded `category` field as the primary grouping mechanism
- DB: likely a tags table + junction table, or JSONB array on each item

### Checklist Add UI
- Quick add at top: single text field "Pridat ukol..." -- Enter to add
- Below the quick add: expandable section for details (date, priority, tags)
- Fast for basic items, optional details

### Delete Pattern
- Trash icon on each row (consistent with Budget and Guests)
- On mobile: optionally swipe left to reveal delete

### Date Input
- Native HTML date picker (type='date') for manual UI -- already used in onboarding
- For AI chat: classifier returns ISO date strings, relative dates computed against today
- No additional date library needed

### Empty States
- Illustration + descriptive text + CTA button ("Zacnete pridavat...")
- Include link to AI chat ("Nebo to nechte na AI")
- Each view has its own empty state (checklist, budget, guests)

### Claude's Discretion
- Exact empty state illustrations/copy
- Tag color palette selection
- Autocomplete behavior details
- Swipe-to-delete implementation (optional enhancement)
- Whether existing `category` field migrates to tags or coexists

</decisions>

<specifics>
## Specific Ideas

- Demo data showed tags like "venue", "vendors", "attire", "catering" -- these work as default suggested tags but users should be able to create any tag
- Budget and Guests already have add forms + trash delete -- extend the pattern, don't redesign
- Checklist is the most critical gap -- currently read-only (only toggle completion)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button`: variants (primary, secondary, ghost, danger), sizes, loading state, icons
- `Card`: compound component with Header, Body, Footer
- `Input`: label, error, helperText, all standard types
- `Select`: label, error, consistent styling
- `Badge`: intents (success, warning, danger, info, neutral), sizes, dot indicator
- `BudgetView`: has working add form (collapsible) + delete (trash icon) + toggle paid
- `GuestsView`: has working add form (collapsible) + delete (trash icon) + RSVP buttons

### Established Patterns
- Collapsible add forms in Budget/Guests (click "Pridat" -> form expands)
- Trash2 icon for delete on each row
- Status toggles via icon buttons (checkbox for completion, RSVP status buttons)
- `date-fns` already installed (used in ChatInterface for date headers)
- Framer Motion for animations (collapse/expand, hover states)

### Integration Points
- `ChecklistView.tsx`: needs add, edit, delete -- currently only read + toggle completion
- `BudgetView.tsx`: needs edit capability -- has add + delete
- `GuestsView.tsx`: needs edit capability -- has add + delete + RSVP
- DB schema: `category VARCHAR` on checklist_items and budget_items needs consideration for tags migration

</code_context>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 12-ai-smarts-first-run*
*Context gathered: 2026-03-16*
