# Milestones: Svoji

## v2.0 B2C Product (Shipped: 2026-03-13)

**Phases completed:** 6 phases (5-10), 23 plans
**Timeline:** 12 days (2026-03-01 -> 2026-03-12)
**Commits:** 58
**Codebase:** 78 files, 9,258 LOC TypeScript/TSX

**Key accomplishments:**
- Real authentication: removed demo mode, Supabase middleware auth + Google OAuth with PKCE
- Full UI redesign: auth pages, dashboard (nav, checklist, budget, guests, chat, settings), public wedding web on new design system
- 5-step onboarding: names+date, guests, location+radius, style, budget with GDPR consent and satin transitions
- AI pipeline overhaul: Kilo gateway, Haiku intent classification (few-shot), action execution (checklist/budget/guest CRUD), rate limiting (15/day)
- Data collection foundation: demand signal logging, engagement metrics, UTM tracking
- Integration fixups: password reset E2E flow, chat rate limit UX (429 handling)

---

## v0 — Initial Build (Pre-GSD)

**Completed:** 2025-02-28
**Phases:** 0 (built outside GSD workflow)

**What shipped:**
- Landing page with marketing content
- Auth flow (email/password, registration, login)
- 3-step onboarding (names, date, budget)
- Adaptive checklist with deadline compression (30+ tasks)
- AI chatbot (Claude API, Czech wedding context, history)
- Budget tracker with category grouping
- Guest list with RSVP management
- Public wedding web for guests (/w/[slug])
- RSVP form on public web
- Dashboard with navigation
- Demo mode for offline development
- Supabase schema (couples, checklist, budget, guests, chat, wedding websites)

**Notes:** Feature-complete prototype. Visuals are prototype quality. All planned v1 features from original implementation plan were built.

---

## v1.0 — Design Overhaul (Partial)

**Completed:** 2026-02-28 (archived — remaining design work merged into v2.0)
**Phases:** 1–4 (of planned 7)

**What shipped:**
- UI Primitives: Typed Button, Card, Input, Badge components with cva+clsx (Phase 2)
- Animation Layer: Lenis smooth scroll, Framer Motion scroll-triggered reveals, micro-interactions, page transitions, reduced-motion support (Phase 3)
- Landing Page: Full redesign — Hero, Features, SocialProof, HowItWorks, FinalCTA, LandingNav, LandingFooter (Phase 4)

**Carried forward to v2.0:**
- Auth pages redesign (AUTH-01, AUTH-02, AUTH-03)
- Dashboard redesign (DASH-01 through DASH-06)
- Public wedding web redesign (PWEB-01, PWEB-02, PWEB-03)
- Design token migration (Phase 1 — 0/2 plans completed)

**Notes:** Design foundation is solid (primitives + animations + landing). Remaining surface redesigns will happen alongside new feature work in v2.0. Key decisions from v1.0 (OKLCH tokens, clsx-only cn(), Card dot notation, ScrollReveal patterns) carry forward.

---
*Last milestone: v1.0*
*Last phase number: 4*
