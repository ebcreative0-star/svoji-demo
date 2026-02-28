# Roadmap: Svoji v1.0 Design Overhaul

## Overview

Transform Svoji from prototype-quality visuals to a premium 2026 SaaS aesthetic. The work follows a strict dependency order: design tokens first (shifts the palette everywhere atomically), then typed UI primitives, then the animation layer, then surfaces in priority order (landing, auth, dashboard, public wedding web). Each phase builds on the last — no surface work starts before the foundation is stable.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Design System Foundation** - Establish OKLCH color tokens, typography swap, and spacing scale that propagate to all 196+ CSS variable references
- [ ] **Phase 2: UI Primitives** - Build typed Button, Card, Input, and Badge components that all surface redesigns depend on
- [ ] **Phase 3: Animation Layer** - Wire Lenis smooth scroll, Framer Motion scroll-triggered reveals, micro-interactions, page transitions, and reduced-motion support
- [ ] **Phase 4: Landing Page** - Redesign all landing page sections with new tokens, primitives, and scroll animations
- [ ] **Phase 5: Auth Pages** - Restyle login, register, and onboarding with polished form interactions and branded aesthetic
- [ ] **Phase 6: Dashboard** - Restyle all dashboard views with skeleton screens, empty states, and performance-gated micro-interactions
- [ ] **Phase 7: Public Wedding Web** - Redesign guest-facing wedding pages and RSVP form to editorial premium quality

## Phase Details

### Phase 1: Design System Foundation
**Goal**: The new warm-premium palette and typography are live across the entire app from a single atomic commit
**Depends on**: Nothing (first phase)
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04
**Success Criteria** (what must be TRUE):
  1. All existing UI surfaces display the new OKLCH warm-premium color palette without any 196+ CSS variable reference breaking
  2. Headings site-wide render in Cormorant Garamond with Inter body copy, with no layout shift on load
  3. A visitor inspecting any page sees a consistent spacing and sizing scale applied via Tailwind 4 @theme tokens
  4. Dev can add a new color reference using @theme variable names and it resolves correctly in all browsers
**Plans**: TBD

Plans:
- [ ] 01-01: TBD

### Phase 2: UI Primitives
**Goal**: Typed Button, Card, Input, and Badge components exist and replace all one-off CSS class usage
**Depends on**: Phase 1
**Requirements**: PRIM-01, PRIM-02, PRIM-03, PRIM-04
**Success Criteria** (what must be TRUE):
  1. A button rendered on any page uses the Button component with explicit variant/size props — no .btn-primary or .btn-outline class strings remain
  2. Card components display with consistent padding, border-radius, and shadow matching design spec
  3. Input fields show branded focus rings and inline error states using the Input component
  4. Badge components render status indicators (RSVP states, checklist priorities, budget categories) consistently across all views
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Animation Layer
**Goal**: Smooth scroll physics, scroll-triggered reveals, micro-interactions, and page transitions are wired and accessible
**Depends on**: Phase 2
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05
**Success Criteria** (what must be TRUE):
  1. Scrolling any page feels physically smooth via Lenis — no abrupt jumps on desktop or mobile
  2. Major content sections (landing page, public web) fade and slide into view as the user scrolls to them
  3. Hovering a button lifts it; hovering a card deepens its shadow; focusing an input glows with accent color
  4. Navigating between routes shows a clean opacity transition rather than an abrupt swap
  5. A user with prefers-reduced-motion enabled sees no motion — all animations are suppressed
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

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
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Auth Pages
**Goal**: Login, register, and onboarding feel like premium product surfaces, not prototype forms
**Depends on**: Phase 4
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. A user can log in through a branded page that matches the new aesthetic — correct typography, colors, and Input/Button primitives
  2. The register page is visually consistent with login — same layout approach, same component usage
  3. The 3-step onboarding flow shows a clear progress indicator and smooth transitions between steps, with polished input interactions at each step
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Dashboard
**Goal**: Authenticated users experience a premium daily-use product — all dashboard views are restyled with proper loading states and micro-interactions
**Depends on**: Phase 5
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06
**Success Criteria** (what must be TRUE):
  1. The dashboard navigation is styled with consistent brand tokens and collapses correctly on mobile
  2. All async dashboard sections (checklist, budget, guest list) show skeleton screens while loading — no blank flash
  3. Checklist, budget, and guest list views use new primitives throughout — no legacy .btn-primary classes remain in dashboard
  4. The chat interface matches the new aesthetic — correct font, colors, and spacing
  5. Micro-interactions (task completion check, item add/remove) animate smoothly without jank on a mid-range Android with 50+ items
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Public Wedding Web
**Goal**: The guest-facing wedding page is editorial-quality — guests see a premium brand surface that reflects well on the couple
**Depends on**: Phase 6
**Requirements**: PWEB-01, PWEB-02, PWEB-03
**Success Criteria** (what must be TRUE):
  1. Visiting a /w/[slug] URL shows a visually premium page with new palette, typography, and scroll animations matching the overall brand
  2. The RSVP form uses new Input and Button primitives and submits without visual glitches
  3. Gallery, timeline, and locations sections display with updated visual treatment consistent with the new design system
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design System Foundation | 0/? | Not started | - |
| 2. UI Primitives | 0/? | Not started | - |
| 3. Animation Layer | 0/? | Not started | - |
| 4. Landing Page | 0/? | Not started | - |
| 5. Auth Pages | 0/? | Not started | - |
| 6. Dashboard | 0/? | Not started | - |
| 7. Public Wedding Web | 0/? | Not started | - |
