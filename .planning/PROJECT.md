# Svoji - AI Svatební Asistent

## What This Is

AI-powered wedding planning assistant for Czech couples. Freemium SaaS combining a conversational AI chatbot, adaptive checklist, budget tracker, guest management, and a public wedding website for guests. Monetized via B2C premium subscriptions (svatební web as main paywall) and future B2B vendor marketplace.

## Core Value

Couples can plan their entire wedding from one place with AI guidance, without needing to juggle multiple tools or spreadsheets.

## Requirements

### Validated

<!-- Shipped and confirmed working. -->

- ✓ Landing page with marketing content and CTAs — v0
- ✓ Auth flow (email/password registration, login) — v0
- ✓ 3-step onboarding (names, date, budget) — v0
- ✓ Adaptive checklist with deadline compression — v0
- ✓ AI chatbot (Claude API, Czech wedding context, chat history) — v0
- ✓ Budget tracker with categories — v0
- ✓ Guest list with RSVP management — v0
- ✓ Public wedding web for guests (/w/[slug]) — v0
- ✓ RSVP form on public web — v0
- ✓ Dashboard with navigation — v0
- ✓ Demo mode for offline development — v0
- ✓ UI Primitives (Button, Card, Input, Badge with cva+clsx) — v1.0
- ✓ Animation layer (Lenis scroll, Framer Motion reveals, micro-interactions, page transitions) — v1.0
- ✓ Landing page redesign (Hero, Features, SocialProof, HowItWorks, FinalCTA) — v1.0

### Active

<!-- Current milestone scope: v2.0 B2C Product -->

- [ ] Auth pages + dashboard + public web redesign (carried from v1.0)
- [ ] Enhanced onboarding (4 steps: names+date, guests, location+radius, budget)
- [ ] Google OAuth registration
- [ ] Freemium tier system (free vs premium)
- [ ] Payment integration (Stripe/GoPay)
- [ ] Svatební web as premium paywall (free=preview, premium=published)
- [ ] AI intent classification pipeline
- [ ] AI doporučení dodavatelů (general advice, no vendor DB yet)
- [ ] Demand signal logging from AI conversations
- [ ] Rate limiting for free tier (15 messages/day)
- [ ] Engagement metrics tracking
- [ ] UTM tracking on landing page

### Out of Scope

- Vendor database / B2B marketplace — deferred to v3.0
- Vendor onboarding + profiles — deferred to v3.0
- Pay-per-lead model — deferred to v3.0
- Vendor dashboard — deferred to v3.0
- Multi-language support — deferred
- QR codes for invitations — deferred
- Seating arrangement — deferred
- Real-time chat/WebSocket — high complexity, not core
- Mobile native app — web-first
- Dark mode — adds ~40% overhead, conflicts with warm palette

## Context

- Existing Next.js 16 + Tailwind 4 + Supabase codebase
- Framer Motion v12 installed and wired (Lenis, ScrollReveal, page transitions)
- UI primitives built: Button, Card, Input, Badge (cva+clsx)
- Landing page fully redesigned (Hero, Features, SocialProof, HowItWorks, FinalCTA)
- Auth pages, dashboard, public web still on old design
- Czech language throughout UI
- Target market: ~30,000 tech-savvy couples/year in CZ (25-38 years)
- Competitors: WeMarry.io (1490 CZK), Brzy-svoji.cz (490-990 CZK)
- Monetization: B2C freemium first, B2B marketplace later
- Flywheel: more couples -> more demand signals -> better vendor pitch -> more vendors -> better recommendations -> more couples

## Constraints

- **Stack**: Next.js 16 + Tailwind CSS 4 + Supabase (keep existing)
- **Animation library**: Framer Motion (already wired)
- **Language**: Czech UI throughout
- **Performance**: Animations must not degrade mobile performance
- **Compatibility**: Must work on all modern browsers + mobile Safari
- **Payments**: Stripe or GoPay (Czech-friendly)

## Current Milestone: v2.0 B2C Product

**Goal:** Transform Svoji from a prototype into a monetizable freemium product with enhanced onboarding, payment integration, svatební web paywall, AI pipeline improvements, and demand signal collection.

**Target features:**
- Finish visual redesign (auth, dashboard, public web)
- Enhanced 4-step onboarding (names+date, guests, location+radius, budget)
- Google OAuth
- Freemium tier system with payment integration
- Svatební web as premium paywall
- AI intent classification and improved pipeline
- Demand signal logging
- Engagement metrics

## Product Vision & Design Direction

### Overall Aesthetic
Modern, trustworthy, and emotionally engaging -- targeting couples planning a wedding. Clean SaaS aesthetic combined with subtle wedding accents: generous whitespace, elegant typography, and restrained romantic color accents. The overall impression should be a modern smart app, not a traditional wedding catalog -- fast responses, subtle micro-interactions, smooth animations, full responsiveness on all devices.

### User Flow
Maximally direct: CTA -> registration -> 4-step onboarding (~2 min) -> AI chat immediately personalized from onboarding data. The user should see a concrete plan forming in real time.

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
| Replace Playfair Display | Too common in wedding space, feels dated | ✓ Good |
| Framer Motion for animations | Already installed, powerful, good React integration | ✓ Good |
| clsx-only cn() (no tailwind-merge) | OKLCH @theme tokens don't create merge conflicts | ✓ Good |
| Card dot notation | Enforces structural consistency for compound components | ✓ Good |
| B2C freemium before B2B marketplace | Need couples + demand data before approaching vendors | -- Pending |
| Svatební web as main paywall | High perceived value, clear free/premium distinction | -- Pending |
| Stripe/GoPay for payments | Czech market needs local payment methods | -- Pending |

---
*Last updated: 2026-03-01 after milestone v2.0 initialization*
