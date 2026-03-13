# Svoji - AI Svatební Asistent

## What This Is

AI-powered wedding planning assistant for Czech couples. SaaS combining a conversational AI chatbot with intent-driven actions, 5-step personalized onboarding, adaptive checklist, budget tracker, guest management, and a public wedding website. Real authentication with Google OAuth. Demand signal and engagement tracking foundation ready for vendor marketplace flywheel.

## Core Value

Couples can plan their entire wedding from one place with AI guidance, without needing to juggle multiple tools or spreadsheets.

## Requirements

### Validated

<!-- Shipped and confirmed working. -->

- ✓ Landing page with marketing content and CTAs -- v0
- ✓ Auth flow (email/password registration, login) -- v0
- ✓ 3-step onboarding (names, date, budget) -- v0
- ✓ Adaptive checklist with deadline compression -- v0
- ✓ AI chatbot (Claude API, Czech wedding context, chat history) -- v0
- ✓ Budget tracker with categories -- v0
- ✓ Guest list with RSVP management -- v0
- ✓ Public wedding web for guests (/w/[slug]) -- v0
- ✓ RSVP form on public web -- v0
- ✓ Dashboard with navigation -- v0
- ✓ Demo mode for offline development -- v0
- ✓ UI Primitives (Button, Card, Input, Badge with cva+clsx) -- v1.0
- ✓ Animation layer (Lenis scroll, Framer Motion reveals, micro-interactions, page transitions) -- v1.0
- ✓ Landing page redesign (Hero, Features, SocialProof, HowItWorks, FinalCTA) -- v1.0
- ✓ Auth pages + dashboard + public web redesign -- v2.0
- ✓ 5-step onboarding (names+date, guests, location+radius, style, budget) with GDPR consent -- v2.0
- ✓ Google OAuth registration with PKCE -- v2.0
- ✓ AI routed through Kilo gateway (no direct Claude API calls) -- v2.0
- ✓ AI intent classification (Haiku few-shot, fire-and-forget) -- v2.0
- ✓ AI action execution (checklist/budget/guest CRUD via chat) -- v2.0
- ✓ Rate limiting (15 messages/day with UI feedback) -- v2.0
- ✓ Demand signal logging (category, region, budget, urgency) -- v2.0
- ✓ Engagement metrics tracking -- v2.0
- ✓ UTM tracking on landing page -- v2.0
- ✓ Password reset E2E flow -- v2.0
- ✓ GDPR consent in onboarding -- v2.0

### Active

<!-- Next milestone scope -->

- [ ] Freemium tier system (free vs premium)
- [ ] Payment integration (Stripe)
- [ ] Svatební web as premium paywall (free=preview, premium=published)
- [ ] AI vendor recommendations (general advice, no vendor DB yet)

### Out of Scope

- Vendor database / B2B marketplace -- deferred to v3.0+, need demand data first
- Vendor onboarding + profiles -- deferred to v3.0+
- Pay-per-lead model -- deferred to v3.0+
- Vendor dashboard -- deferred to v3.0+
- Multi-language support -- Czech market only for now
- QR codes for invitations -- deferred
- Seating arrangement -- deferred
- Real-time chat/WebSocket -- high complexity, not core
- Mobile native app -- web-first
- Dark mode -- ~40% overhead, conflicts with warm palette
- GoPay -- no maintained JS SDK, Stripe first

## Context

- Next.js 16 + Tailwind 4 + Supabase codebase, 78 files, 9,258 LOC TypeScript/TSX
- Framer Motion v12 wired (Lenis, ScrollReveal, page transitions, micro-interactions)
- UI primitives: Button, Card, Input, Badge (cva+clsx), cn() utility
- Full design system applied across all surfaces (landing, auth, dashboard, public web)
- AI pipeline: Kilo gateway -> Sonnet chat + Haiku intent classifier -> action execution
- 7 Supabase migrations applied (couples, checklist, budget, guests, chat, engagement, demand signals)
- Czech language throughout UI
- Target market: ~30,000 tech-savvy couples/year in CZ (25-38 years)
- Competitors: WeMarry.io (1490 CZK), Brzy-svoji.cz (490-990 CZK)
- Monetization: B2C freemium first, B2B marketplace later
- Flywheel: more couples -> more demand signals -> better vendor pitch -> more vendors -> better recommendations -> more couples

## Constraints

- **Stack**: Next.js 16 + Tailwind CSS 4 + Supabase (keep existing)
- **AI gateway**: Kilo API (OpenAI-compatible format)
- **Animation library**: Framer Motion (already wired)
- **Language**: Czech UI throughout
- **Performance**: Animations must not degrade mobile performance
- **Compatibility**: Must work on all modern browsers + mobile Safari
- **Payments**: Stripe (Czech-friendly, well-maintained SDK)

## Product Vision & Design Direction

### Overall Aesthetic
Modern, trustworthy, and emotionally engaging -- targeting couples planning a wedding. Clean SaaS aesthetic combined with subtle wedding accents: generous whitespace, elegant typography, and restrained romantic color accents. The overall impression should be a modern smart app, not a traditional wedding catalog -- fast responses, subtle micro-interactions, smooth animations, full responsiveness on all devices.

### User Flow
Maximally direct: CTA -> 5-step onboarding (~2 min) -> registration -> AI chat immediately personalized from onboarding data. The user should see a concrete plan forming in real time.

### Design Principles
- Modern smart app feel, not a wedding catalog
- Fast perceived performance
- Subtle micro-interactions and smooth animations
- Full responsiveness across all devices
- Clear free vs premium value distinction

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full redesign over incremental | Current design is prototype quality, incremental would leave inconsistencies | ✓ Good |
| Warm premium style | Fits wedding domain while feeling modern (not rustic/vintage) | ✓ Good |
| Replace Playfair Display with Cormorant Garamond | Too common in wedding space, feels dated | ✓ Good |
| Framer Motion for animations | Already installed, powerful, good React integration | ✓ Good |
| clsx-only cn() (no tailwind-merge) | OKLCH @theme tokens don't create merge conflicts | ✓ Good |
| Card dot notation | Enforces structural consistency for compound components | ✓ Good |
| Kilo gateway over direct Claude API | Centralized model routing, cost tracking, future model switching | ✓ Good |
| Haiku for intent classification | Faster/cheaper than Sonnet, 0.6 confidence threshold works well | ✓ Good |
| Fire-and-forget intent classification | Never blocks chat response, async logging | ✓ Good |
| DB atomic rate limiting (no Redis) | Simpler infra, Postgres function handles atomicity | ✓ Good |
| Onboarding 5 steps (added style) | Style context improves AI personalization significantly | ✓ Good |
| Onboarding data via URL params (not DB) | No DB write before email confirmation, works with OAuth redirect | ✓ Good |
| All CTAs funnel through /onboarding | Personalization is mandatory entry point, not skippable | ✓ Good |
| B2C freemium before B2B marketplace | Need couples + demand data before approaching vendors | -- Pending |
| Svatební web as main paywall | High perceived value, clear free/premium distinction | -- Pending |
| Stripe for payments | Czech market support, well-maintained SDK | -- Pending |

---
*Last updated: 2026-03-13 after v2.0 milestone*
