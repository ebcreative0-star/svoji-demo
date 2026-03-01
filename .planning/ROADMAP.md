# Roadmap: Svoji

## Milestones

- ✅ **v1.0 Design Overhaul** - Phases 1-4 (shipped 2026-02-28, partial -- carried into v2.0)
- 🚧 **v2.0 B2C Product** - Phases 5-9 (in progress)

## Phases

<details>
<summary>✅ v1.0 Design Overhaul (Phases 1-4) - SHIPPED 2026-02-28 (partial)</summary>

### Phase 1: Design System Foundation
**Goal**: The new warm-premium palette and typography are live across the entire app from a single atomic commit
**Depends on**: Nothing (first phase)
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04
**Success Criteria** (what must be TRUE):
  1. All existing UI surfaces display the new OKLCH warm-premium color palette without any 196+ CSS variable reference breaking
  2. Headings site-wide render in Cormorant Garamond with Inter body copy, with no layout shift on load
  3. A visitor inspecting any page sees a consistent spacing and sizing scale applied via Tailwind 4 @theme tokens
  4. Dev can add a new color reference using @theme variable names and it resolves correctly in all browsers
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md -- Migrate globals.css to @theme OKLCH tokens + swap font to Cormorant Garamond in layout.tsx
- [ ] 01-02-PLAN.md -- Automated token verification + visual checkpoint

### Phase 2: UI Primitives
**Goal**: Typed Button, Card, Input, and Badge components exist and replace all one-off CSS class usage
**Depends on**: Phase 1
**Requirements**: PRIM-01, PRIM-02, PRIM-03, PRIM-04
**Success Criteria** (what must be TRUE):
  1. A button rendered on any page uses the Button component with explicit variant/size props -- no .btn-primary or .btn-outline class strings remain
  2. Card components display with consistent padding, border-radius, and shadow matching design spec
  3. Input fields show branded focus rings and inline error states using the Input component
  4. Badge components render status indicators consistently across all views
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md -- Install cva+clsx, create cn() utility, build Button/Card/Input/Textarea/Select/Badge/FormX components + barrel export
- [x] 02-02-PLAN.md -- Migrate all btn-primary/btn-outline usages, dashboard buttons/cards/badges, RSVP inputs to new primitives + remove legacy CSS

### Phase 3: Animation Layer
**Goal**: Smooth scroll physics, scroll-triggered reveals, micro-interactions, and page transitions are wired and accessible
**Depends on**: Phase 2
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05
**Success Criteria** (what must be TRUE):
  1. Scrolling any page feels physically smooth via Lenis -- no abrupt jumps on desktop or mobile
  2. Major content sections fade and slide into view as the user scrolls to them
  3. Hovering a button lifts it; hovering a card deepens its shadow; focusing an input glows with accent color
  4. Navigating between routes shows a clean opacity transition rather than an abrupt swap
  5. A user with prefers-reduced-motion enabled sees no motion -- all animations are suppressed
**Plans**: 4 plans

Plans:
- [x] 03-01-PLAN.md -- Install Lenis, create LenisProvider + MotionConfig root wiring, build ScrollReveal/StaggerContainer/FrozenRouter animation primitives
- [x] 03-02-PLAN.md -- Wire micro-interactions to Button/Card/Input, create (public) route group with crossfade page transitions via template.tsx
- [x] 03-03-PLAN.md -- UAT gap closure: button tween transitions, input focus ring, AnimatePresence in persistent layout
- [x] 03-04-PLAN.md -- Wire ScrollReveal into landing page and public wedding web; remove CSS scroll-behavior conflict

### Phase 4: Landing Page
**Goal**: The landing page is a polished showcase of the new design direction that converts visitors to sign-ups
**Depends on**: Phase 3
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06, LAND-07
**Success Criteria** (what must be TRUE):
  1. A first-time visitor sees a compelling hero section with animated entrance and a prominent CTA
  2. All sections (features, social proof, how-it-works, final CTA) are visible and scroll-animated on desktop and mobile
  3. The navigation bar changes appearance on scroll and collapses to a mobile menu on small screens
  4. The footer renders with consistent brand styling matching the rest of the page
  5. The page passes a visual check on iOS Safari mobile without layout breaks or animation jank
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md -- Export buttonVariants, create LandingNav + Hero + LandingFooter, refactor page.tsx to component composition
- [x] 04-02-PLAN.md -- Create Features + SocialProof + HowItWorks + FinalCTA sections, finalize page.tsx with all 7 components
- [x] 04-03-PLAN.md -- Visual QA checkpoint: verify landing page on desktop and mobile

</details>

---

### 🚧 v2.0 B2C Product (In Progress)

**Milestone Goal:** Transform Svoji from a prototype into a production-ready freemium product. Real authentication, polished surfaces, enhanced onboarding, AI pipeline improvements, and the data collection foundation that powers the vendor marketplace flywheel.

#### Phase 5: Auth Foundation
**Goal**: Real authentication is active in production and users can sign in with Google
**Depends on**: Phase 4
**Requirements**: SEC-01, SEC-02, AUTH-01, AUTH-02
**Success Criteria** (what must be TRUE):
  1. An unauthenticated GET to /dashboard returns a 302 redirect to /login -- DEMO_MODE bypass is gone
  2. A user can click "Sign in with Google" and land in their dashboard within 2 clicks, with no account duplication
  3. A user who previously registered with email can then sign in with Google using the same email without getting a second account
  4. An audit confirms zero unverified email accounts exist before Google OAuth is enabled in production
**Plans**: 2 plans

Plans:
- [ ] 05-01-PLAN.md -- Remove hardcoded demo mode, wire isDemoMode() to env var, real middleware auth, build guard, SEC-02 email audit script
- [ ] 05-02-PLAN.md -- Create OAuth callback/confirm routes, rebuild login/register pages with Google OAuth + premium card layout

#### Phase 6: UI Redesign
**Goal**: Auth pages, dashboard, and public wedding web match the premium design system established in v1.0
**Depends on**: Phase 5
**Requirements**: UI-01, UI-02, UI-03, UI-04
**Success Criteria** (what must be TRUE):
  1. A user visiting /login or /register sees a branded page with correct typography, OKLCH palette, and Input/Button primitives -- no prototype-era styles remain
  2. An authenticated user opening the dashboard sees consistent navigation, section layouts, and component usage matching the new design system across all views (checklist, budget, guests, chat, settings)
  3. A guest visiting a /w/[slug] URL sees a visually premium page with new design tokens, scroll animations, and a polished RSVP form
  4. The footer contains functional links for TOS and GDPR/privacy, social media icons, and a contact placeholder
**Plans**: 4 plans

Plans:
- [ ] 06-01-PLAN.md -- Auth page entrance animations + SaaS footer + /tos, /privacy, /contact pages
- [ ] 06-02-PLAN.md -- Dashboard nav polish + mobile bottom tab bar + layout padding
- [ ] 06-03-PLAN.md -- Dashboard views (checklist, budget, guests, chat, settings) design system primitive substitution
- [ ] 06-04-PLAN.md -- Public wedding web parallax + section design tokens + Navigation update + visual checkpoint

#### Phase 7: Enhanced Onboarding
**Goal**: New users complete a 5-step personalization flow that equips the AI with full wedding context and satisfies GDPR requirements
**Depends on**: Phase 6
**Requirements**: ONBD-01, ONBD-02, ONBD-03, ONBD-04, ONBD-05, ONBD-06, ONBD-07, SEC-03
**Success Criteria** (what must be TRUE):
  1. A new user completes 5 onboarding steps -- names+date, guest count, location+radius, wedding style, budget -- with satin fade transitions between each step
  2. The "Ještě nevíme" date option and skippable budget step work correctly without blocking onboarding completion
  3. After completing onboarding, the AI chat greets the user with a personalized message that references their names, wedding date, guest count, location, and style
  4. A user is shown a GDPR consent notice and must accept it before any personal data collection begins
**Plans**: 3 plans

Plans:
- [ ] 07-01-PLAN.md -- DB migration + Couple type update + onboarding page rewrite (GDPR + 5 steps with crossfade transitions)
- [ ] 07-02-PLAN.md -- Register page reads onboarding params + persists data + AI system prompt extension with new fields
- [ ] 07-03-PLAN.md -- Visual and functional verification of complete onboarding-to-AI-chat flow

#### Phase 8: AI Pipeline
**Goal**: AI chat routes through Kilo gateway, classifies user intent asynchronously, and enforces rate limits without blocking responses
**Depends on**: Phase 7
**Requirements**: AI-01, AI-02, AI-03
**Success Criteria** (what must be TRUE):
  1. All chat messages route through the Kilo gateway API -- zero direct Claude API calls remain in the codebase
  2. Sending a chat message triggers intent classification in the background -- the user receives their response at normal speed with no added latency
  3. A user who has sent 12 messages today sees a warning; at 15 messages they see a hard stop with clear messaging -- the limit resets at midnight
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

#### Phase 9: Data Collection
**Goal**: Demand signals, engagement events, and UTM attribution are captured from the first real user session
**Depends on**: Phase 8
**Requirements**: DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. Every AI conversation that mentions a vendor category, region, or budget produces a structured demand signal record with category, region, budget, and urgency fields populated
  2. Key user actions (message sent, checklist item completed, onboarding step completed, upgrade CTA clicked) produce engagement event records queryable in the database
  3. A user arriving via a UTM link has their source, medium, and campaign stored and associable with their account
**Plans**: TBD

Plans:
- [ ] 09-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 5 → 6 → 7 → 8 → 9

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Design System Foundation | v1.0 | 0/2 | Planned | - |
| 2. UI Primitives | v1.0 | 2/2 | Complete | 2026-02-28 |
| 3. Animation Layer | v1.0 | 4/4 | Complete | 2026-02-28 |
| 4. Landing Page | v1.0 | 3/3 | Complete | 2026-02-28 |
| 5. Auth Foundation | 2/2 | Complete    | 2026-03-01 | - |
| 6. UI Redesign | 6/6 | Complete   | 2026-03-01 | - |
| 7. Enhanced Onboarding | 1/3 | In Progress|  | - |
| 8. AI Pipeline | v2.0 | 0/? | Not started | - |
| 9. Data Collection | v2.0 | 0/? | Not started | - |
