# Phase 7: Enhanced Onboarding - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

New users complete a 5-step personalization flow that equips the AI with full wedding context and satisfies GDPR requirements. The onboarding runs BEFORE registration -- data lives in React state during the flow and is persisted to the database only after successful registration. Quick reply buttons in AI chat are out of scope (Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Onboarding flow order
- GDPR consent screen (before step 1, mandatory to proceed)
- Step 1: Couple names + wedding date (with "Ještě nevíme" option)
- Step 2: Guest count (preset buttons: do 30 / 30-60 / 60-100 / 100-150 / 150+)
- Step 3: Location (Czech city autocomplete) + radius (preset buttons: e.g. 10/25/50/100 km)
- Step 4: Wedding style (single select: tradiční, boho, opulentní, minimalistická, rustikální)
- Step 5: Budget (preset buttons, skippable)
- After step 5: redirect to registration form. Data saved to DB after successful registration.

### GDPR consent
- Two separate checkboxes, both pre-unchecked:
  1. Data processing consent (mandatory) -- "Souhlasím se zpracováním osobních údajů" + link to privacy policy
  2. Marketing consent (optional) -- separate opt-in for marketing communications
- Consent recorded with timestamp
- User cannot proceed to step 1 without accepting data processing consent
- Withdrawal mechanism needed in settings (later)

### Data storage during onboarding
- React state only (no localStorage)
- Data does not survive page refresh -- user must start over
- After registration, onboarding data is written to `couples` table with new fields (location, radius, style)

### Transitions & visual design
- Soft crossfade between steps (Framer Motion AnimatePresence, fade out current / fade in next)
- Thin horizontal progress bar filling as steps complete (not dots, not numbered steps)
- Clean white background, no patterns or decorative elements
- Lucide icons on all 5 steps (one relevant icon per step)
- Editorial, minimal feel

### AI context handoff
- All onboarding data injected into AI system prompt (names, date, guest count, location, radius, style, budget)
- First AI message is personal and warm: uses names, references their wedding details
- AI proactively suggests a first step (e.g., "Začneme výběrem místa?")
- AI should proactively offer choices when helping with decisions (like Claude does)

### Claude's Discretion
- "Ještě nevíme" date implementation: null date vs. season+year approximation
- AI greeting detail level: how much onboarding data to reference in first message
- Exact radius preset values
- Icon choices for each step
- Transition timing and easing curves
- How to handle edge cases (empty budget, no date) in AI prompt

</decisions>

<specifics>
## Specific Ideas

- "Rád bych aby AI při řešení záležitostí proaktivně nabízelo volby, tak jak to dělá Claude" -- AI should present structured options when helping users make decisions
- Onboarding before registration is a deliberate product decision to reduce friction -- users see value before committing
- Quick reply buttons (clickable choices under AI messages) are desired but deferred to Phase 8 (AI Pipeline)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` component (`src/components/ui/Button.tsx`): supports primary/secondary variants, loading state
- `Input`, `Select`, `FormInput` components in `src/components/ui/`
- `ScrollReveal` + `StaggerContainer` (`src/components/animation/`): Framer Motion wrappers for fade+slide animations
- `PublicTransitionProvider` + `FrozenRouter`: page-level transition infrastructure
- `LenisProvider`: smooth scroll provider

### Established Patterns
- Client components marked with `'use client'`
- Supabase client via `createClient()` from `@/lib/supabase/client`
- Server client via `createServerClient()` from `@/lib/supabase/server`
- CSS variables for colors: `var(--color-primary)`, `var(--color-text-light)`, `var(--color-secondary)`
- Error messages in Czech
- Optimistic updates with `useState` + `startTransition`

### Integration Points
- Current onboarding: `src/app/(auth)/onboarding/page.tsx` (4 steps, needs full rewrite to 5 steps + GDPR)
- `Couple` type in `src/lib/types.ts` needs new fields: location, radius, wedding_style
- AI system prompt builder in `src/app/api/chat/route.ts` needs to include new onboarding fields
- Registration flow at `src/app/(auth)/register/page.tsx` needs to receive onboarding data
- Database migration needed for new `couples` table columns

</code_context>

<deferred>
## Deferred Ideas

- Quick reply buttons in AI chat (clickable choices under messages) -- Phase 8 (AI Pipeline)
- GDPR right to erasure endpoint -- future compliance phase
- Data Processing Agreement (DPO) -- future compliance phase
- localStorage persistence for onboarding data across sessions -- rejected (React state only)

</deferred>

---

*Phase: 07-enhanced-onboarding*
*Context gathered: 2026-03-01*
