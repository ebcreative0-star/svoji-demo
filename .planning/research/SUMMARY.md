# Project Research Summary

**Project:** Svoji v2.0 — B2C Freemium Wedding SaaS
**Domain:** Freemium SaaS — payments, Google OAuth, AI pipeline, demand signal analytics (Czech market)
**Researched:** 2026-03-01
**Confidence:** HIGH

## Executive Summary

Svoji v2.0 is a freemium B2C SaaS built on an existing Next.js 16 + Supabase stack. The product adds monetization (Stripe subscriptions), social login (Google OAuth via Supabase), and an AI demand signal pipeline on top of an already-working wedding planning app. The standard pattern for this class of product is well-documented: Stripe for payments, Supabase Auth for OAuth, PostHog for analytics, and fire-and-forget intent classification via a cheap model (Claude Haiku). No exotic technology decisions are required — the challenge is sequencing correctly and avoiding the specific pitfalls common to freemium systems.

The recommended approach is to build foundation first, monetization second, AI pipeline third. The `couples.tier` column and proper Supabase RLS policies are the central dependency — every paywall gate, rate limit, and subscription sync branches from this single source of truth. Stripe (not GoPay) is the right call for v2.0: it supports CZK, Czech cards, Google Pay/Apple Pay, and SCA compliance with zero approval delay and a self-serve go-live. GoPay can be revisited in v3.0 if conversion data shows bank transfer demand.

The highest-risk area is the combination of auth hardening (DEMO_MODE currently bypasses all auth in production middleware) and webhook integrity (race conditions and duplicate delivery). These are not complexity problems — they are discipline problems. Both must be solved before any tier enforcement or payment logic ships. A secondary risk is GDPR: demand signal logging and engagement metrics require privacy policy disclosure before they go live, not after.

## Key Findings

### Recommended Stack

The existing stack (Next.js 16, React 19, Supabase, Tailwind 4, Framer Motion, Anthropic SDK) requires minimal additions for v2.0. Three new packages cover payments: `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`. One more for analytics: `posthog-js`. Everything else — Google OAuth, rate limiting, intent classification, demand signal logging — is handled by configuring existing packages or writing plain SQL and API routes.

**Core technologies:**
- `stripe@20.4.0`: Server-side payment SDK — creates checkout sessions, manages subscriptions, validates webhooks; pinned to API 2026-02-25
- `@stripe/stripe-js@8.8.0` + `@stripe/react-stripe-js@3.x`: Client-side Stripe.js + React Embedded Checkout components; EmbeddedCheckout keeps users on the domain, handles PCI compliance
- `posthog-js@1.x`: Product analytics — event funnels, UTM capture, feature flags; 1M events/month free tier; use `eu.posthog.com` for EU data residency
- `@supabase/supabase-js` (existing): Google OAuth via `signInWithOAuth()` — zero new packages, Supabase dashboard config only
- `@anthropic-ai/sdk` (existing): Intent classification via Claude Haiku (`claude-haiku-3-5-20241022`) — ~$0.00025/1k tokens, no extra SDK needed

**Do not add:** GoPay (no maintained Node SDK — all community packages 2-7 years old), Vercel AI SDK (duplicates existing Anthropic integration), Upstash/Redis (overkill for rate limiting at early scale), next-auth (conflicts with Supabase Auth), Prisma (conflicts with existing Supabase migrations pattern).

### Expected Features

Research confirms a clear feature set for v2.0 launch. The tier system (`couples.tier`) is the structural core — all other features gate on it.

**Must have (table stakes):**
- Google OAuth — expected by the 25-38 year old target demographic; email+password alone feels dated in 2026
- Clear free vs premium distinction — pricing section on landing, tier badge in dashboard, consistent upgrade CTA copy
- Paywall at value moment — free users experience real product value before hitting the gate (not on entry)
- Stripe Checkout + webhooks — only path to activating `tier = 'premium'` in Supabase; webhook is source of truth
- Stripe Customer Portal — self-serve cancel/update; legally expected in EU; near-zero dev effort
- AI rate limit 15 messages/day — warn at 12/15, hard stop at 15, upgrade modal on hit
- Webhook-driven entitlement sync — tier activates within seconds after payment; polling is not acceptable

**Should have (competitive differentiators):**
- 4-step enhanced onboarding (names+date, guest count, location+radius, budget) — enables AI personalization; competitors collect 2-3 fields; location+radius feeds demand signal pipeline
- AI intent classification per message — categorizes what couples ask about; feeds the vendor marketplace flywheel
- Demand signal logging (category + region + wedding date bucket) — aggregated data becomes B2B pitch material for v3.0; first-mover advantage in Czech market
- UTM tracking — capture source/medium/campaign before any paid acquisition begins; trivial cost to implement
- Wedding web as premium paywall — high perceived value gate; couples want to share the link immediately after engagement
- Soft guest list limit (warn at 30, hard cap at 50, not 30) — hard cap at 30 feels punitive when average Czech wedding has 60-100 guests

**Defer to v2.x or v3.0:**
- GoPay bank transfer — add only if Stripe conversion data shows a demand gap
- Real-time AI streaming — 15 msg/day limit means latency is not felt; adds architecture complexity without proportional benefit
- Multi-user shared planning — doubles backend complexity (permissions model, notification system)
- Email digest / weekly recap — separate GDPR workflow; defer to v3.0
- Vendor matching UI — no vendor DB exists yet; AI general advice (prompt-only) serves this need until v3.0
- Trial period (7/14 days) — freemium is the trial; trial models add billing lifecycle complexity and heavy post-trial churn

### Architecture Approach

The architecture follows three well-established patterns layered on the existing app. The Supabase `couples.tier` column is the single source of truth — written only by Stripe webhooks (via service-role client), read by Server Components and API routes. RLS policies enforce tier at the database level as a mandatory second defense layer. Intent classification runs fire-and-forget via `void classifyAndLogIntent()` after saving chat messages — never blocking the chat response path. Google OAuth uses existing Supabase SSR infrastructure with one new `/auth/callback` route.

**Major components:**
1. **Stripe payment pipeline** — `/api/stripe/checkout`, `/api/stripe/webhook` (raw body required, idempotency via `webhook_events` table), `/api/stripe/portal`; writes `couples.tier` and `subscriptions` table
2. **Supabase tier system** — `couples.tier` column + RLS policies + `subscriptions` table; `isPremium()` and `checkFeatureAccess()` helpers in `src/lib/tier.ts`; checked server-side in all premium API routes
3. **Google OAuth flow** — Supabase dashboard config + `/auth/callback` route + `GoogleOAuthButton` client component; new users redirect to onboarding, returning users to dashboard
4. **AI intent classification pipeline** — `src/lib/intent-classifier.ts` using Claude Haiku; fire-and-forget from modified `/api/chat` route; writes to `demand_signals` table with indexed schema (category, region, created_at)
5. **Rate limiting (DB-based)** — `rate_limit_usage` table + atomic Postgres function `increment_and_check_rate_limit`; prevents race conditions; no Redis needed at this scale
6. **Engagement metrics** — `/api/metrics/event` route + `engagement_events` table; PostHog for aggregate funnel analytics

**4 new Supabase migrations required:** `004_subscriptions.sql`, `005_demand_signals.sql`, `006_engagement_events.sql`, `007_rate_limits.sql`

**Build order (dependency-driven from ARCHITECTURE.md):**
DB migrations → lib utilities (`admin.ts`, `tier.ts`, `types.ts`) → Google OAuth → enhanced onboarding → remove DEMO_MODE → Stripe integration → freemium tier gates → rate limiting → intent classification → demand signals → engagement metrics → GoPay (last, if ever)

### Critical Pitfalls

1. **DEMO_MODE left enabled in production** — `src/middleware.ts` currently has `DEMO_MODE = true` which bypasses all authentication. This is the first change needed before any v2.0 feature. Verify: unauthenticated GET to `/dashboard` returns 302 to `/login`. This is CRITICAL — all security features are inert while this flag is active.

2. **Webhook race condition on payment success** — Stripe success redirect arrives 1-5 seconds before the webhook. Sync-fetch payment status from Stripe API on the `?upgraded=1` redirect page; use webhook as idempotent backup. Without this, users see "still on free tier" immediately after paying and may assume payment failed.

3. **Webhook idempotency not implemented** — Stripe guarantees at-least-once delivery. Store processed event IDs in a `webhook_events` table; check before processing each event. Without this, duplicate events can corrupt subscription state or double-process tier changes.

4. **RLS not enforcing tiers** — Supabase anon key is public; motivated users call the database directly, bypassing all Next.js middleware. RLS policies on premium-gated tables must check `subscription_tier`, not just `auth.uid() = couple_id`. Client-side tier checks are UX only, never security boundaries.

5. **Google OAuth duplicate accounts** — Users who registered via email/password and then sign in with Google can get two separate `couples` rows if email confirmation was not enforced previously. Audit: `SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL` before enabling OAuth in production.

6. **GDPR without consent** — demand signal logging and engagement tracking process personal data linkable to identified individuals via `couple_id`. Privacy policy must disclose AI conversation analysis and demand logging before these features go live. Cookie consent required for UTM tracking.

7. **Intent classification blocking chat response** — if `await classifyAndLogIntent()` is used instead of `void classifyAndLogIntent()`, every chat message adds 300-800ms latency. Classification is analytics, never user-facing — always fire-and-forget.

## Implications for Roadmap

Based on research, the dependency graph is clear and suggests a 5-phase structure. The tier system is the linchpin — all monetization branches from it.

### Phase 1: Auth Foundation
**Rationale:** DEMO_MODE bypass makes all downstream security work meaningless. This is a hard prerequisite with no dependencies — must be the first thing done. Google OAuth is grouped here because it is also auth-layer work and has no payment dependencies; it unblocks user acquisition in parallel with later phases.
**Delivers:** Real authentication active in production; Google OAuth sign-in with `/auth/callback` route; `GoogleOAuthButton` component; onboarding flow correctly catches OAuth new users vs returning users
**Addresses:** Google OAuth (P1 feature from FEATURES.md)
**Avoids:** DEMO_MODE auth bypass (Pitfall 5 — CRITICAL), Google OAuth duplicate accounts (Pitfall 3 — run email confirmation audit before enabling OAuth)
**Stack:** Supabase Auth config only — zero new packages

### Phase 2: Freemium Tier System + Enhanced Onboarding
**Rationale:** The `couples.tier` column and RLS policies must exist before any payment integration ships — Stripe webhooks need a column to write to, and RLS must enforce it before the paywall gates are built. Enhanced 4-step onboarding belongs here because it is schema-level work and feeds the AI context enrichment and demand signals that come in Phase 4. GDPR disclosure should also be drafted here since demand signal logging (Phase 4) cannot go live without it.
**Delivers:** DB migrations 004-007; `couples.tier` + `stripe_customer_id` + location/guest columns; `subscriptions`, `demand_signals`, `engagement_events`, `rate_limit_usage` tables; RLS tier enforcement policies; `src/lib/tier.ts` (`isPremium()`, `checkFeatureAccess()`); updated TypeScript types; 4-step onboarding with location + guest count steps; AI context enrichment from profile data in chat system prompt; GDPR copy in onboarding
**Addresses:** Freemium tier mechanics (P1), 4-step onboarding (P1), demand signal schema design (must be upfront)
**Avoids:** RLS not enforcing tiers (Pitfall 2), client-side only enforcement (Pitfall 11), demand signal schema underdesigned as raw JSON (Pitfall 9), GDPR logging without consent (Pitfall 10)
**Stack:** Supabase SQL migrations; updated TypeScript types; `src/lib/tier.ts`

### Phase 3: Payment Integration (Stripe)
**Rationale:** Stripe is the only path to tier activation. This phase makes the product monetizable. Rate limiting is included here because it enforces the free tier pressure that drives upgrades, and it depends on the tier column from Phase 2. The upgrade page, tier badge, and upgrade prompts are built here because they all depend on Stripe being live and returning real tier values.
**Delivers:** Stripe Checkout (CZK subscription, embedded mode); `/api/stripe/webhook` with idempotency table + raw body handling; Stripe Customer Portal; `UpgradePrompt` + `TierBadge` components; wedding web publish paywall (preview mode for free, published for premium); AI rate limit (15 messages/day, atomic Postgres `increment_and_check_rate_limit` function); billing settings page; upgrade page
**Addresses:** Stripe Checkout + webhooks (P1), Customer Portal (P1), wedding web paywall (P1), rate limiting (P1)
**Avoids:** Webhook race condition — sync-fetch from Stripe API on success redirect (Pitfall 1); webhook idempotency — `webhook_events` table (Pitfall 7); client-side tier enforcement without API layer (Pitfall 11)
**Stack:** `stripe@20.4.0`, `@stripe/stripe-js@8.8.0`, `@stripe/react-stripe-js@3.x` (3 new packages)

### Phase 4: AI Pipeline + Demand Signals
**Rationale:** Intent classification depends on a stable chat route (existing) and the structured `demand_signals` schema from Phase 2. UTM tracking goes here because it must be live before any paid acquisition starts. This phase activates the business flywheel — demand data starts accumulating from day one of real paying users.
**Delivers:** Fire-and-forget intent classification (Claude Haiku, 17-category Czech wedding taxonomy); `demand_signals` table writes (confidence threshold > 0.6); UTM parameter capture on landing + storage in `user_profiles`; `engagement_events` logging for key actions (messages sent, checklist completed, upgrade clicked, onboarding step completed)
**Addresses:** AI intent classification (P1), demand signal logging (P1), UTM tracking (P1), engagement metrics basic (P2)
**Avoids:** Classification blocking chat response latency — `void classifyAndLogIntent()` pattern enforced (Pitfall 8); demand signal schema is already structured from Phase 2 (Pitfall 9); GDPR disclosure must be live from Phase 2 before this phase ships (Pitfall 10)
**Stack:** `@anthropic-ai/sdk` (existing) — no new packages

### Phase 5: Analytics (PostHog)
**Rationale:** PostHog integration is independent of all other features but is most useful when real monetized users are generating events. Comes after core monetization is live. Enables funnel analysis for conversion optimization — registration to paid.
**Delivers:** PostHog initialized with EU data residency (`eu.posthog.com`); manual pageview capture with Next.js App Router `usePathname`; funnel dashboards (landing visit → registration → onboarding complete → first chat → upgrade view → upgrade click → paid); UTM capture delegated to PostHog
**Addresses:** Engagement metrics dashboard (P2)
**Avoids:** GDPR — EU host for data residency; `capture_pageview: false` for manual control aligned with cookie consent timing
**Stack:** `posthog-js@1.x` (1 new package)

### Phase Ordering Rationale

- Phase 1 first because DEMO_MODE bypass makes all security features inert regardless of what else is built; Google OAuth is zero-dependency auth work that can ship immediately
- Phase 2 before Phase 3 because Stripe webhooks need `couples.tier` to write to; RLS must be in place before premium features are gated; schema must be correct before payment UI ships
- Phase 3 before Phase 4 because demand signals are more analytically useful when correlated with paid vs free user behavior; tier data enriches demand signal records
- Phase 4 before Phase 5 because PostHog is most valuable when events from real users are flowing; analytics layer built after core flows are stable
- GoPay explicitly excluded — start Stripe only for v2.0; revisit if conversion data shows Czech bank transfer demand

### Research Flags

Phases with well-documented patterns (skip `/gsd:research-phase`):
- **Phase 1 (Auth Foundation):** Supabase Google OAuth is thoroughly documented in official docs; DEMO_MODE removal is a single code edit with clear test
- **Phase 5 (PostHog):** PostHog Next.js App Router docs are comprehensive; standard providers.tsx pattern

Phases that may benefit from task-level research detail during planning:
- **Phase 3 (Payments):** Stripe webhook idempotency and the success-redirect race condition are nuanced. Verify the exact events to subscribe to (`customer.subscription.created` vs `customer.subscription.updated` vs `invoice.paid`) — they have overlapping coverage and must not be double-processed. Also verify raw body pattern for Next.js 16 App Router specifically.
- **Phase 2 (Tier + RLS):** RLS policies that reference `couples.tier` within Supabase's RLS context can cause a per-row JOIN performance issue on large tables. Validate the Supabase recommendation (push `subscription_tier` into JWT claims via Auth hook) vs inline column check before writing policies.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Stripe, Supabase Auth, PostHog all verified from official docs and current npm package versions; GoPay exclusion confirmed via SDK audit (all packages 2-7 years old) |
| Features | HIGH | Core freemium patterns (paywall timing, rate limiting UX, tier mechanics) verified across multiple SaaS sources; Czech market specifics MEDIUM — competitor feature analysis based on public product inspection |
| Architecture | HIGH | Stripe+Supabase patterns well-documented; multiple reference implementations exist (KolbySisk/next-supabase-stripe-starter, Vercel subscription payments); direct codebase analysis confirms DEMO_MODE flag and existing structure |
| Pitfalls | HIGH (payments/auth/RLS), MEDIUM (GoPay webhook reliability), MEDIUM (AI pipeline at scale) | Payments and auth pitfalls backed by official documentation; GoPay-specific reliability data limited — no public post-mortems found |

**Overall confidence:** HIGH

### Gaps to Address

- **GoPay recurring subscription mechanics:** If GoPay is added in v3.0, recurring payments require a separate "recurrence" setup distinct from one-time payments. Intentionally deferred; revisit only when conversion data shows bank transfer demand gap.
- **Czech cookie consent specifics:** Czech cookie law (Act No. 127/2005 Coll. + GDPR Act No. 110/2019 Coll.) has specific requirements for behavioral data logging. Privacy policy and consent flow copy should be reviewed by a Czech legal resource before demand signal logging goes live.
- **PostHog cookie consent integration:** Research confirms EU host and correct initialization but does not detail the exact pattern for integrating PostHog initialization with a cookie consent banner in Next.js App Router. Needs resolution during Phase 5 task planning.
- **Subscription price point in CZK:** Research does not include Czech market pricing benchmarks for wedding SaaS. No specific monthly/annual CZK price is recommended here — this is a business decision outside research scope.
- **Supabase RLS JWT claims performance:** Whether to check `couples.tier` inline in RLS vs push into JWT via Auth hook depends on table size projections. The inline approach is simpler for v2.0 but may need migration at 1000+ couples.

## Sources

### Primary (HIGH confidence)
- [Stripe Next.js App Router integration](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/) — checkout, webhooks, raw body requirement
- [Stripe Billing subscriptions webhooks](https://docs.stripe.com/billing/subscriptions/webhooks) — event types, at-least-once delivery, idempotency
- [Stripe Czech Republic payments](https://stripe.com/resources/more/payments-in-czech-republic) — CZK, SCA/PSD2, Google Pay/Apple Pay support confirmed
- [Stripe Embedded Checkout quickstart](https://docs.stripe.com/checkout/embedded/quickstart) — EmbeddedCheckout pattern, PCI compliance
- [Supabase Google OAuth docs](https://supabase.com/docs/guides/auth/social-login/auth-google) — PKCE flow, callback route pattern, no new packages needed
- [Supabase Auth identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking) — duplicate account risk confirmed
- [Supabase RLS performance](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) — tier check in RLS context, JWT claims optimization
- [PostHog Next.js App Router docs](https://posthog.com/docs/libraries/next-js) — providers.tsx pattern, manual pageview, EU host
- [Stripe + Supabase webhook sync](https://supabase.com/docs/guides/functions/examples/stripe-webhooks) — webhook handler pattern
- Direct codebase analysis — `src/middleware.ts` (DEMO_MODE confirmed), `src/app/api/chat/route.ts`, `src/lib/types.ts`, existing Supabase schema

### Secondary (MEDIUM confidence)
- [KolbySisk/next-supabase-stripe-starter](https://github.com/KolbySick/next-supabase-stripe-starter) — reference implementation for Stripe + Supabase subscription pattern
- [Vercel nextjs-subscription-payments](https://github.com/vercel/nextjs-subscription-payments) — subscription billing reference
- [Freemium paywall timing](https://www.getmonetizely.com/articles/mastering-freemium-paywalls-strategic-timing-for-saas-success) — paywall at value moment pattern confirmed across multiple SaaS sources
- [Freemium conversion benchmarks](https://userpilot.com/blog/freemium-conversion-rate/) — 2-5% freemium to paid conversion typical for B2C SaaS
- [Stripe webhook race conditions](https://www.pedroalonso.net/blog/stripe-webhooks-solving-race-conditions/) — race condition pattern and sync-fetch mitigation
- [Intent classification best practices](https://labelyourdata.com/articles/machine-learning/intent-classification) — confidence threshold, taxonomy design
- [GDPR Czech Republic](https://www.termsfeed.com/blog/czech-republic-gdpr/) — Act No. 110/2019 Coll. applicability to behavioral data

### Tertiary (LOW confidence)
- GoPay webhook reliability specifics — no public post-mortems found; timing assumptions inferred from API documentation only
- Czech wedding SaaS competitor analysis (WeMarry.io, Brzy-svoji.cz) — feature observations based on public product inspection, not insider knowledge

---
*Research completed: 2026-03-01*
*Ready for roadmap: yes*
