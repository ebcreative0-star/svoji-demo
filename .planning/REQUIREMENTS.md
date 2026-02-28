# Requirements: Svoji

**Defined:** 2026-02-28
**Core Value:** Couples can plan their entire wedding from one place with AI guidance

## v1 Requirements

Requirements for v1.0 Design Overhaul. Each maps to roadmap phases.

### Design Tokens

- [x] **DSGN-01**: Color palette uses OKLCH color space with warm premium tones (champagne, blush, stone, charcoal)
- [x] **DSGN-02**: Typography uses modern serif heading font replacing Playfair Display, paired with Inter body
- [x] **DSGN-03**: Spacing and sizing follow a consistent token scale defined in Tailwind 4 @theme
- [x] **DSGN-04**: All color tokens propagate via CSS variables to existing 196+ references without breakage

### UI Primitives

- [x] **PRIM-01**: Typed Button component with size/variant props replaces all .btn-primary/.btn-outline usage
- [x] **PRIM-02**: Typed Card component with consistent padding, radius, and shadow
- [x] **PRIM-03**: Typed Input component with focus transitions and error states
- [x] **PRIM-04**: Typed Badge component for status indicators (RSVP, priority, categories)

### Animation

- [ ] **ANIM-01**: Scroll-triggered entrance animations on all major sections (fade + slide, Framer Motion whileInView)
- [ ] **ANIM-02**: Smooth scroll across entire site via Lenis
- [x] **ANIM-03**: Micro-interactions on buttons (hover lift/scale), cards (hover shadow), inputs (focus glow)
- [x] **ANIM-04**: Page transitions between routes using Next.js App Router template.js pattern
- [ ] **ANIM-05**: All animations respect prefers-reduced-motion via useReducedMotion

### Landing Page

- [ ] **LAND-01**: Hero section with compelling headline, CTA, and animated entrance
- [ ] **LAND-02**: Features section with visual cards showcasing product capabilities
- [ ] **LAND-03**: Social proof section (stats, testimonials)
- [ ] **LAND-04**: How-it-works section with step-by-step visual flow
- [ ] **LAND-05**: Final CTA section with gradient or accent background
- [ ] **LAND-06**: Navigation bar with scroll behavior and mobile menu
- [ ] **LAND-07**: Footer with consistent brand styling

### Auth Pages

- [ ] **AUTH-01**: Login page with branded design, smooth form interactions
- [ ] **AUTH-02**: Register page matching login aesthetic
- [ ] **AUTH-03**: Onboarding flow (3 steps) with progress indication and polished inputs

### Dashboard

- [ ] **DASH-01**: Dashboard navigation redesigned with consistent brand styling (desktop + mobile)
- [ ] **DASH-02**: Checklist view restyled with new primitives and loading skeleton
- [ ] **DASH-03**: Budget view restyled with new primitives and empty state
- [ ] **DASH-04**: Guest list view restyled with new primitives and loading skeleton
- [ ] **DASH-05**: Chat interface restyled to match new aesthetic
- [ ] **DASH-06**: Settings page restyled with new form primitives

### Public Wedding Web

- [ ] **PWEB-01**: Public wedding web visual refresh matching new brand aesthetic
- [ ] **PWEB-02**: RSVP form restyled with new Input/Button primitives
- [ ] **PWEB-03**: Gallery, timeline, locations sections visually updated

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Visual Polish

- **VPOL-01**: Dark mode toggle with automatic palette inversion
- **VPOL-02**: Theme customization for public wedding web (couples pick their colors)
- **VPOL-03**: Advanced animation sequences (staggered list entrances, morphing shapes)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dark mode | Adds ~40% overhead, conflicts with warm palette aesthetic |
| Heavy parallax effects | Mobile performance penalty, diminishing returns |
| 3D/WebGL elements | Overkill for wedding SaaS, complexity without value |
| Custom icon set | Lucide React is sufficient and already integrated |
| CSS scroll-driven animations (native) | Incomplete Firefox support as of early 2026 |
| GSAP animation library | Framer Motion covers all needs, GSAP adds 30kb duplicate |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSGN-01 | Phase 1 | Complete |
| DSGN-02 | Phase 1 | Complete |
| DSGN-03 | Phase 1 | Complete |
| DSGN-04 | Phase 1 | Complete |
| PRIM-01 | Phase 2 | Complete |
| PRIM-02 | Phase 2 | Complete |
| PRIM-03 | Phase 2 | Complete |
| PRIM-04 | Phase 2 | Complete |
| ANIM-01 | Phase 3 | Pending |
| ANIM-02 | Phase 3 | Pending |
| ANIM-03 | Phase 3 | Complete |
| ANIM-04 | Phase 3 | Complete |
| ANIM-05 | Phase 3 | Pending |
| LAND-01 | Phase 4 | Pending |
| LAND-02 | Phase 4 | Pending |
| LAND-03 | Phase 4 | Pending |
| LAND-04 | Phase 4 | Pending |
| LAND-05 | Phase 4 | Pending |
| LAND-06 | Phase 4 | Pending |
| LAND-07 | Phase 4 | Pending |
| AUTH-01 | Phase 5 | Pending |
| AUTH-02 | Phase 5 | Pending |
| AUTH-03 | Phase 5 | Pending |
| DASH-01 | Phase 6 | Pending |
| DASH-02 | Phase 6 | Pending |
| DASH-03 | Phase 6 | Pending |
| DASH-04 | Phase 6 | Pending |
| DASH-05 | Phase 6 | Pending |
| DASH-06 | Phase 6 | Pending |
| PWEB-01 | Phase 7 | Pending |
| PWEB-02 | Phase 7 | Pending |
| PWEB-03 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0

---
*Requirements defined: 2026-02-28*
*Last updated: 2026-02-28 after roadmap creation*
