# Requirements: Svoji

**Defined:** 2026-03-01
**Core Value:** Couples can plan their entire wedding from one place with AI guidance

## v2.0 Requirements

Requirements for v2.0 B2C Product. Each maps to roadmap phases.

### Security

- [ ] **SEC-01**: DEMO_MODE disabled in production middleware (all auth works for real)
- [ ] **SEC-02**: Existing email accounts audited for unverified emails before OAuth enablement
- [ ] **SEC-03**: GDPR consent mechanism before data collection (privacy policy update + consent banner)

### Auth

- [ ] **AUTH-01**: User can register/login via Google OAuth (Supabase built-in)
- [ ] **AUTH-02**: Google OAuth correctly links with existing email accounts (no duplicates)

### Onboarding

- [ ] **ONBD-01**: Step 1 -- couple names + wedding date (with "Ještě nevíme" option for date)
- [ ] **ONBD-02**: Step 2 -- guest count (preset buttons: do 30 / 30-60 / 60-100 / 100-150 / 150+)
- [ ] **ONBD-03**: Step 3 -- location (Czech city autocomplete) + radius slider/presets
- [ ] **ONBD-04**: Step 4 -- wedding style (tradiční, boho, opulentní, minimalistická, rustikální)
- [ ] **ONBD-05**: Step 5 -- budget (preset buttons, skippable)
- [ ] **ONBD-06**: Satin fade transitions between steps with editorial visual design
- [ ] **ONBD-07**: All onboarding data passed as AI assistant system prompt context

### UI Redesign

- [ ] **UI-01**: Auth pages (login, register) redesigned with new design system primitives
- [ ] **UI-02**: Dashboard full redesign (navigation, checklist, budget, guests, chat, settings views)
- [ ] **UI-03**: Public wedding web visual refresh with new design tokens and primitives

### AI Pipeline

- [ ] **AI-01**: AI chat routed through Kilo gateway API (replacing direct Claude API calls)
- [ ] **AI-02**: Intent classification (fire-and-forget, async after response is sent)
- [ ] **AI-03**: Rate limiting (15 messages/day with UI feedback -- preparation for future freemium)

### Data Collection

- [ ] **DATA-01**: Demand signal logging from AI conversations (structured: category, region, budget, urgency)
- [ ] **DATA-02**: Engagement metrics tracking (messages, sessions, checklist completion, days until wedding)
- [ ] **DATA-03**: UTM parameter tracking on landing page

## v1.0 Completed Requirements

Shipped in v1.0 Design Overhaul milestone.

### Design Tokens

- [x] **DSGN-01**: OKLCH color palette with warm premium tones
- [x] **DSGN-02**: Modern serif heading font (Cormorant Garamond) + Inter body
- [x] **DSGN-03**: Consistent spacing/sizing token scale in Tailwind 4 @theme
- [x] **DSGN-04**: All color tokens propagate via CSS variables to 196+ references

### UI Primitives

- [x] **PRIM-01**: Typed Button component (cva variants)
- [x] **PRIM-02**: Typed Card component
- [x] **PRIM-03**: Typed Input component with focus transitions
- [x] **PRIM-04**: Typed Badge component for status indicators

### Animation

- [x] **ANIM-01**: Scroll-triggered entrance animations (Framer Motion whileInView)
- [x] **ANIM-02**: Smooth scroll via Lenis
- [x] **ANIM-03**: Micro-interactions on buttons, cards, inputs
- [x] **ANIM-04**: Page transitions (Next.js template.js pattern)
- [x] **ANIM-05**: prefers-reduced-motion support

### Landing Page

- [x] **LAND-01**: Hero section with animated entrance and CTA
- [x] **LAND-02**: Features section with visual cards
- [x] **LAND-03**: Social proof section
- [x] **LAND-04**: How-it-works section
- [x] **LAND-05**: Final CTA section
- [x] **LAND-06**: Navigation bar with scroll behavior + mobile menu
- [x] **LAND-07**: Footer with brand styling

## Future Requirements

Deferred to v3.0+. Tracked but not in current roadmap.

### Monetization

- **PAY-01**: Stripe payment integration
- **PAY-02**: Freemium tier system (free vs premium)
- **PAY-03**: Svatební web as premium paywall (free=preview, premium=published)
- **PAY-04**: Stripe Customer Portal for subscription management

### Vendor Marketplace

- **VEND-01**: Vendor profiles and portfolio
- **VEND-02**: Vendor onboarding flow
- **VEND-03**: Vendor dashboard (impressions, leads, conversion)
- **VEND-04**: Pay-per-lead model
- **VEND-05**: AI recommends vendors from database

## Out of Scope

| Feature | Reason |
|---------|--------|
| B2B vendor marketplace | Deferred to v3.0 -- need demand data first |
| Payment integration (Stripe/GoPay) | Deferred to v3.0 -- monetization not in v2.0 |
| Svatební web paywall | Deferred to v3.0 -- needs tier system |
| Dark mode | ~40% overhead, conflicts with warm palette |
| Heavy parallax effects | Mobile performance penalty |
| 3D/WebGL elements | Overkill for wedding SaaS |
| GoPay integration | No maintained JS SDK, manual approval -- Stripe first in v3.0 |
| Real-time chat/WebSocket | High complexity, not core |
| Mobile native app | Web-first |
| Multi-language support | Czech market only for now |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | TBD | Pending |
| SEC-02 | TBD | Pending |
| SEC-03 | TBD | Pending |
| AUTH-01 | TBD | Pending |
| AUTH-02 | TBD | Pending |
| ONBD-01 | TBD | Pending |
| ONBD-02 | TBD | Pending |
| ONBD-03 | TBD | Pending |
| ONBD-04 | TBD | Pending |
| ONBD-05 | TBD | Pending |
| ONBD-06 | TBD | Pending |
| ONBD-07 | TBD | Pending |
| UI-01 | TBD | Pending |
| UI-02 | TBD | Pending |
| UI-03 | TBD | Pending |
| AI-01 | TBD | Pending |
| AI-02 | TBD | Pending |
| AI-03 | TBD | Pending |
| DATA-01 | TBD | Pending |
| DATA-02 | TBD | Pending |
| DATA-03 | TBD | Pending |

**Coverage:**
- v2.0 requirements: 21 total
- Mapped to phases: 0
- Unmapped: 21 (pending roadmap creation)

---
*Requirements defined: 2026-03-01*
*Last updated: 2026-03-01 after initial definition*
