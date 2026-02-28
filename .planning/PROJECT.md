# Svoji - AI Svatební Asistent

## What This Is

AI-powered wedding planning assistant for Czech couples. Combines a conversational chatbot, adaptive checklist, budget tracker, guest management, and a public wedding website for guests - all in one SaaS product.

## Core Value

Couples can plan their entire wedding from one place with AI guidance, without needing to juggle multiple tools or spreadsheets.

## Requirements

### Validated

<!-- Shipped and confirmed working from existing codebase. -->

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

### Active

<!-- Current milestone scope -->

- [ ] Full visual redesign - modern 2026 SaaS aesthetic
- [ ] Fresh color palette (warm premium, not rustic)
- [ ] Modern typography (replace Playfair Display)
- [ ] Scroll-triggered animations and micro-interactions
- [ ] Landing page redesign with polished sections
- [ ] Auth pages redesign (login, register, onboarding)
- [ ] Dashboard redesign (all views)
- [ ] Public wedding web visual refresh

### Out of Scope

- Vendor database — deferred to future milestone
- Multi-language support — deferred
- QR codes for invitations — deferred
- Seating arrangement — deferred
- Real-time chat/WebSocket — high complexity, not core
- Mobile native app — web-first
- Payment integration — no monetization yet

## Context

- Existing Next.js 16 + Tailwind 4 + Supabase codebase
- Framer Motion v12 already installed but underused
- Current palette: mocha brown (#8B7355), sage, rose - feels dated/rustic
- Current heading font: Playfair Display - overused in wedding space
- Body font: Inter - fine to keep
- Czech language throughout UI
- Target market: Czech couples planning weddings
- Competitors: WeMarry.io (1490 CZK), Brzy-svoji.cz (490-990 CZK)

## Constraints

- **Stack**: Next.js 16 + Tailwind CSS 4 + Supabase (keep existing)
- **Animation library**: Framer Motion (already installed)
- **Language**: Czech UI throughout
- **Performance**: Animations must not degrade mobile performance
- **Compatibility**: Must work on all modern browsers + mobile Safari

## Current Milestone: v1.0 Design Overhaul

**Goal:** Transform the entire UI from prototype-quality to premium 2026 SaaS aesthetic.

**Target features:**
- Fresh warm-premium color system
- Modern typography pairing
- Tasteful scroll animations and micro-interactions (Framer Motion)
- Redesigned landing page, auth flows, and dashboard
- Public wedding web visual refresh

## Product Vision & Design Direction

### Overall Aesthetic
Modern, trustworthy, and emotionally engaging -- targeting couples planning a wedding. Clean SaaS aesthetic combined with subtle wedding accents: generous whitespace, elegant typography, and restrained romantic color accents. The overall impression should be a modern smart app, not a traditional wedding catalog -- fast responses, subtle micro-interactions, smooth animations, full responsiveness on all devices.

### Hero Section (Phase 4)
The hero must immediately communicate the core benefit: fast, smart wedding planning with AI. The dominant element is an interactive AI assistant window placed above the fold. The chatbot should have a friendly but professional look with a subtle entrance animation (pulsing cursor, typing effect, or gentle "breathing" of the window) signaling readiness to interact. On page load, the chatbot can display a sample message like "Pomohu vam naplanovat svatbu behem par minut" to pull the user in immediately.

### User Flow
Maximally direct: clicking the main CTA takes the user straight into an AI conversation that walks them through key decisions step by step (budget, guest count, venue, wedding style). The user should see a concrete plan forming in real time -- e.g., a dynamic checklist or timeline appearing as they answer.

### Landing Page Structure (Phase 4)
Below the hero: a concise "How it works" section in 3 simple steps, then an overview of key benefits (time savings, personalization, budget overview), then a visual showcase of the app in action. Clear, repeated CTA elements throughout the page that guide the user back to starting their plan.

### Design Principles
- Modern smart app feel, not a wedding catalog
- Fast perceived performance
- Subtle micro-interactions and smooth animations (Phase 3)
- Full responsiveness across all devices
- User should understand the value within seconds and feel naturally motivated to start planning via the AI assistant

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full redesign over incremental | Current design is prototype quality, incremental would leave inconsistencies | — Pending |
| Warm premium style | Fits wedding domain while feeling modern (not rustic/vintage) | — Pending |
| Replace Playfair Display | Too common in wedding space, feels dated | — Pending |
| Framer Motion for animations | Already installed, powerful, good React integration | — Pending |
| Fresh color palette | Current mocha scheme reads as 2020s rustic, not 2026 premium | — Pending |

---
*Last updated: 2026-02-28 after milestone v1.0 initialization*
