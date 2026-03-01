# Feature Research

**Domain:** B2C Wedding SaaS — Freemium Tier, Payments, Enhanced Onboarding, AI Pipeline, Demand Signals
**Researched:** 2026-03-01
**Confidence:** HIGH (core patterns), MEDIUM (Czech market specifics)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume any 2026 freemium SaaS will have. Missing these makes the product feel unfinished or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Google OAuth ("Sign in with Google") | Default expectation for any consumer app targeting 25-38 year olds; email+password alone feels dated | MEDIUM | Supabase has first-class Google OAuth support via PKCE flow; requires Google Cloud Console OAuth client, callback route, and profiles trigger to populate user table on first login |
| Clear free vs premium distinction | Users need to understand what they get before registering; ambiguity kills conversion | LOW | Pricing section on landing, in-app badge/label on premium features, consistent "upgrade" CTA copy |
| Paywall at value moment, not at entry | Users must experience product value before hitting paywall; premature paywall = immediate churn | LOW | Svoji: let users build onboarding data, use AI chat, see checklist — paywall appears when they try to publish their wedding web |
| Upgrade prompt that feels like discovery, not punishment | "You discovered a Premium feature" converts better than "You can't do that" | LOW | Framer Motion modal or inline CTA; copy frames it as unlocking, not blocking |
| Rate limit warning before hard stop | Warn at 80% usage (12/15 messages), not only at 100%; prevents frustration at cutoff | LOW | Simple counter in chat UI: "3 zpráv zbývá dnes" (3 messages left today); resets at midnight |
| Payment flow with local methods | Czech users expect card + bank transfer; Google Pay / Apple Pay on mobile; Stripe Link accelerates checkout | MEDIUM | Stripe handles CZK natively, supports Google Pay/Apple Pay, card payments; GoPay adds local bank transfer (Česká spořitelna, KB, etc.) if needed |
| Subscription management (cancel, update card) | Users must be able to self-serve; inability to cancel = trust destruction | MEDIUM | Stripe Customer Portal covers this entirely; redirect to hosted portal page, no custom UI needed |
| Webhook-driven entitlement sync | Premium features must activate immediately after payment; polling is not acceptable | MEDIUM | Stripe webhooks -> Supabase `users` table `tier` column update; use `checkout.session.completed` and `customer.subscription.deleted` events |
| Onboarding data used immediately by AI | Users expect AI to reference their answers; "tell me about your wedding" after they just filled 4 steps = broken | MEDIUM | Pass onboarding data (location, guest count, date, budget) to Claude system prompt on first chat load |
| Mobile-responsive checkout | 60%+ of signups happen on mobile; Stripe Checkout is already mobile-optimized | LOW | Use Stripe Checkout hosted page to avoid building responsive payment forms from scratch |

### Differentiators (Competitive Advantage)

Features that set Svoji apart in the Czech wedding SaaS market and support the business flywheel.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 4-step enhanced onboarding with location + radius | Collecting location + radius enables future vendor matching; competitors (WeMarry, Brzy-svoji) collect only date/budget | MEDIUM | Step 2: guest count slider (20-300+); Step 3: location (city autocomplete via Google Places API or simple text) + radius picker (25/50/75/100 km slider); data stored in `user_profiles` table |
| AI intent classification pipeline | Automatically categorizes what couples ask about (catering, venue, photographer, etc.); feeds demand signal DB without manual analysis | HIGH | Classify each AI message into categories: venue, catering, music, flowers, photography, legal, budget, checklist, other; use Claude's JSON mode or a separate lightweight classifier; store in `demand_events` table |
| Demand signal logging | Aggregated intent data becomes pitch material for B2B vendor marketplace (v3.0); first-mover advantage in Czech market | MEDIUM | Every classified AI message -> `demand_events(user_id, category, region, wedding_date_bucket, created_at)`; no PII in aggregate reports; enables "X couples in Prague searched for photographers this month" |
| Wedding web as premium paywall | High-perceived-value gate: couple wants to share link with family ASAP after engagement; clear premium reason to upgrade | MEDIUM | Free tier: web exists but shows "preview mode" watermark or is not publicly accessible; premium: published at /w/[slug], shareable link; toggle in Supabase based on `tier` column |
| UTM-tracked landing page | Enables measuring which acquisition channels work before spending ad budget | LOW | Store `utm_source`, `utm_medium`, `utm_campaign` in localStorage/cookie at landing, pass through registration, store in `user_profiles`; Next.js useSearchParams hook on root layout |
| Engagement metrics dashboard (internal) | Product analytics to understand feature adoption, churn indicators, upgrade triggers | MEDIUM | Track: messages sent/day, checklist items completed, budget entries, guests added, time-to-upgrade; store events in `analytics_events` table or use PostHog (self-hostable, GDPR-compliant); no external JS on users without consent |
| AI vendor recommendations (general, no DB) | AI can recommend venue types, photographer styles, catering formats based on guest count + location radius + budget; soft differentiator before real vendor DB | LOW | Prompt engineering only: enrich Claude system prompt with wedding profile data; no new backend needed; qualifies as "personalized recommendations" in marketing |
| Free tier with genuine value | Freemium only works if the free tier is genuinely useful; users who don't use the product won't upgrade | LOW | Free: AI chat (15 msgs/day), checklist, budget, guest list (up to 30 guests), wedding web in preview; not crippled, just limited |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Complex vendor matching UI | "AI matches you with vendors" sounds premium | No vendor DB exists yet (v3.0 scope); building matching UI now means dead UI with no data | AI general advice ("for 80 guests in Prague radius, you need a venue of X capacity") until v3.0 |
| Real-time AI streaming (WebSocket) | Chat feels faster with token streaming | Adds architecture complexity (WebSocket or SSE), not standard in Next.js App Router; 15 msg/day limit means users aren't hitting latency in practice | Server action with loading state; good enough for 15 msg/day usage pattern |
| Custom payment form (Stripe Elements) | More control over UI, can match brand | 3-4x more dev work than Stripe Checkout; PCI compliance surface area increases; Stripe Checkout converts well on mobile | Stripe Checkout hosted page; style it with Stripe's appearance API to match brand colors |
| Invite team members / shared planning | "Couples plan together" | Adds user-to-user relationship, permissions model, notification system; doubles backend complexity | Single-account, share wedding web link for read-only guest view; defer multi-user to v3.0+ |
| Trial period (7/14-day trial of premium) | Reduces friction to convert | Trial users churn heavily after trial ends; harder to reason about than pure freemium; adds billing lifecycle complexity | Freemium is the trial: users experience real value on free tier, upgrade when they want the wedding web published |
| Email digest / weekly recap | Feels "engaged" | Requires email template system, unsubscribe logic, GDPR opt-in; content is redundant if users are active in-app | In-app notifications or next-action prompts in dashboard; defer email marketing to v3.0 |
| GoPay + Stripe simultaneously | Cover all Czech payment preferences | Double integration, double webhook logic, double testing surface, double failure modes; Stripe supports CZK and Czech cards natively | Stripe only for v2.0; revisit GoPay if conversion data shows bank transfer demand (add as Stripe's payment method via Financial Connections or a separate checkout option) |
| Guest count hard cap on free tier | Classic freemium gate | Wedding guest lists are often exactly 30-80 guests; cap at 30 means most users hit the wall immediately and feel cheated, not engaged | Soft limit: warn at 30, allow up to 50, suggest premium; hard cap at 50 |

---

## Feature Dependencies

```
Google OAuth
    └──requires──> Supabase Google provider config (Google Cloud Console)
    └──requires──> /auth/callback route with PKCE code exchange
    └──requires──> profiles trigger (populate user_profiles on first OAuth login)

Enhanced 4-step Onboarding
    └──requires──> profiles table with: guest_count, location, radius_km, budget, names, date
    └──required by──> AI context enrichment (system prompt uses this data)
    └──required by──> Demand signal logging (region + date_bucket come from onboarding)

Freemium Tier System
    └──requires──> users.tier column (free | premium) in Supabase
    └──required by──> Svatební web paywall (check tier before publish)
    └──required by──> AI rate limiting (check daily message count vs tier)
    └──required by──> Guest list soft limit (check tier at 30+ guests)

Payment Integration (Stripe)
    └──requires──> Stripe account + CZK enabled
    └──requires──> Stripe Checkout session API route
    └──requires──> Stripe Customer Portal route
    └──requires──> Stripe webhooks -> Supabase tier update
    └──required by──> Freemium Tier System (tier changes only via successful payment)

AI Intent Classification
    └──requires──> AI chat pipeline (already exists)
    └──requires──> demand_events table in Supabase
    └──required by──> Demand signal logging (classification is the input)

Demand Signal Logging
    └──requires──> AI intent classification (category label)
    └──requires──> onboarding data (region, wedding date bucket)
    └──feeds──> B2B vendor marketplace pitch (v3.0)

UTM Tracking
    └──requires──> Next.js root layout useSearchParams
    └──requires──> user_profiles.utm_* columns
    └──independent of──> all other features (can be added first or last)

Engagement Metrics
    └──requires──> analytics_events table OR PostHog project
    └──enhances──> demand signal data (correlates usage with upgrade intent)
    └──independent of──> payment flow (can track free users before they pay)
```

### Dependency Notes

- **Tier system is the central dependency**: Paywall logic, rate limiting, and guest list limits all branch from a single `users.tier` column. This must be established early in the phase sequence.
- **Stripe webhooks are the source of truth for tier**: Never trust client-side tier claims. Tier updates happen server-side via webhook only.
- **Onboarding data must be stored before AI uses it**: AI context enrichment depends on profile data being persisted; Google OAuth users who skip/rush onboarding must still land in onboarding flow.
- **Intent classification can be async**: It does not need to block the AI response; classify after response is sent, store demand event in background.
- **Google OAuth and email/password must both land users in the same onboarding flow**: OAuth first-time login must detect `onboarding_complete = false` and redirect to onboarding step 1.

---

## MVP Definition

For v2.0, MVP = "functional freemium product that can charge real users and collect demand data."

### Launch With (v2.0)

- [ ] Google OAuth — removes registration friction, expected by target demographic
- [ ] Enhanced 4-step onboarding (names+date, guests, location+radius, budget) — required for AI personalization
- [ ] `users.tier` column + row-level security on premium features — foundation of monetization
- [ ] Stripe Checkout integration — one-time or monthly subscription, CZK, card + digital wallets
- [ ] Stripe webhooks -> tier update — without this, payments don't activate features
- [ ] Stripe Customer Portal — self-serve cancel/update; legally required in EU
- [ ] Svatební web paywall (preview mode for free, published for premium) — main conversion lever
- [ ] AI chat rate limit (15 msgs/day for free) — prevents abuse, creates upgrade pressure
- [ ] AI intent classification per message — stores category in demand_events
- [ ] Demand signal logging (category + region + date bucket) — feeds the flywheel
- [ ] UTM parameter capture + storage — required before any paid acquisition starts
- [ ] Basic engagement event logging (messages sent, checklist completed, upgraded) — minimum for product decisions

### Add After Validation (v2.x)

- [ ] Upgrade prompt A/B testing — trigger: when monthly active users > 500 and conversion data is available
- [ ] Guest list soft limit UX refinement — trigger: if user research shows friction at 30-guest threshold
- [ ] PostHog full funnel analysis — trigger: when manual SQL queries become insufficient
- [ ] GoPay bank transfer option — trigger: if Stripe conversion rate is notably lower than expected for Czech market

### Future Consideration (v3.0)

- [ ] Demand signal dashboard for vendors — requires vendor accounts, deferred
- [ ] Vendor matching based on demand signals — requires vendor DB, deferred
- [ ] Multi-user shared planning — complex permissions model, deferred
- [ ] Email marketing / digest — separate GDPR workflow, deferred

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Google OAuth | HIGH | MEDIUM | P1 |
| Enhanced 4-step onboarding | HIGH | MEDIUM | P1 |
| Tier system (`users.tier`) | HIGH | LOW | P1 |
| Stripe Checkout + webhooks | HIGH | MEDIUM | P1 |
| Stripe Customer Portal | HIGH | LOW | P1 |
| Svatební web paywall | HIGH | LOW | P1 |
| AI rate limiting (15/day) | MEDIUM | LOW | P1 |
| AI intent classification | MEDIUM | MEDIUM | P1 |
| Demand signal logging | MEDIUM | LOW | P1 |
| UTM tracking | MEDIUM | LOW | P1 |
| Engagement metrics (basic) | MEDIUM | LOW | P2 |
| AI vendor recommendations (prompt-only) | MEDIUM | LOW | P2 |
| Guest list soft limit UX | LOW | LOW | P2 |
| Upgrade prompt animation/copy polish | MEDIUM | LOW | P2 |

**Priority key:**
- P1: Required for v2.0 launch — product cannot monetize without it
- P2: Should include — meaningfully improves conversion or retention
- P3: Nice to have — defer under time pressure

---

## Competitor Feature Analysis

| Feature | WeMarry.io | Brzy-svoji.cz | Zola (US, reference) | Svoji v2.0 Target |
|---------|------------|---------------|----------------------|-------------------|
| Freemium model | Yes (limited features) | Yes (basic free) | Free + paid domain | Yes: free tools, premium = web published |
| Paywall mechanism | Feature gating | Subscription tiers | Custom domain ($14.95/yr) | Svatební web publish |
| Payment options | Card | Card | Card + registry | Stripe (card, Google Pay, Apple Pay) |
| AI chat | No | No | No | Yes, 15/day free |
| Onboarding depth | 2-3 fields | 2 fields | Name + date | 4 steps including location + radius |
| Google OAuth | Unknown | Unknown | Yes | Yes |
| Demand signals | No | No | No | Yes (internal) |
| Rate limiting | No AI to limit | No AI to limit | N/A | 15 messages/day free |
| Czech market focus | Yes | Yes | No | Yes (CZK, Czech UI) |

---

## Key Implementation Notes

### Freemium Tier Mechanics

The cleanest pattern: single `tier` enum column (`free` | `premium`) on the `users` (or `profiles`) table. All feature gates in code check `user.tier === 'premium'`. Stripe webhook `checkout.session.completed` sets `tier = 'premium'`. Webhook `customer.subscription.deleted` or `invoice.payment_failed` (after retry period) reverts to `tier = 'free'`.

Do NOT gate features on Stripe subscription status directly — always reflect to your own DB, otherwise your app depends on Stripe availability for every feature check.

### AI Rate Limiting Pattern

Daily message counter pattern (not rolling window): store `ai_messages_count` and `ai_messages_reset_at` (next midnight UTC) in `user_profiles`. On each AI request: check if reset_at is past, reset counter if so, then check `count >= 15`. This is simpler than a rolling window and matches what users expect ("resets tomorrow").

Show count in chat UI: "15 zpráv / 15 dnes" (progress bar or text). Warn at 12/15. At 15/15 show upgrade modal.

### Intent Classification Pattern

Use Claude's response to simultaneously classify intent. Options in cost order:
1. Add a JSON postscript to the Claude system prompt: "After your response, on a new line output JSON: `{\"intent\": \"venue|catering|photography|music|flowers|legal|budget|checklist|other\"}`". Parse from response end. Cost: 0 extra API calls.
2. Separate lightweight classification call (gpt-4o-mini or Claude Haiku): send user message only, classify. Cost: small but adds latency.
3. Rule-based keyword classifier in Czech: fast, free, lower accuracy. Good fallback.

Recommendation: Option 1 (append JSON to system prompt) for v2.0 — zero extra API cost, good enough accuracy.

### Demand Signal Schema

```sql
CREATE TABLE demand_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  category text NOT NULL, -- venue, catering, photography, music, flowers, legal, budget, checklist, other
  region text, -- city from onboarding (e.g. "Praha", "Brno")
  radius_km int, -- from onboarding
  wedding_date_bucket text, -- e.g. "2025-Q3", "2026-Q1" (not exact date)
  created_at timestamptz DEFAULT now()
);
```

No exact wedding dates, no PII beyond user_id. Aggregate queries: `SELECT category, region, COUNT(*) FROM demand_events WHERE created_at > now() - interval '30 days' GROUP BY category, region`.

### Location + Radius Onboarding UX

Location: simple text input with `datalist` suggestions of Czech cities (hard-code top 50 cities) rather than Google Places API (adds complexity, cost, requires API key management). Couples know their region; exact geocoding is not needed for demand signals.

Radius: segmented button group or slider with 4 options: 25 km / 50 km / 75 km / 100 km. Slider is more tactile but 4 fixed options are faster to implement and easier to query in analytics.

### Stripe vs GoPay Decision

Use Stripe for v2.0. Rationale:
- Stripe is 206x more widely used than GoPay globally
- Stripe supports CZK natively
- Stripe supports Czech card networks, Google Pay, Apple Pay
- Stripe Checkout is PCI compliant out of the box
- Stripe Customer Portal eliminates custom subscription management UI
- GoPay's main advantage is Czech bank transfer (bank2bank); add only if conversion data shows demand
- Single integration = half the webhook surface, half the testing effort

---

## Sources

- [Mastering Freemium Paywalls — getmonetizely.com](https://www.getmonetizely.com/articles/mastering-freemium-paywalls-strategic-timing-for-saas-success)
- [Best Freemium Upgrade Prompts — appcues.com](https://www.appcues.com/blog/best-freemium-upgrade-prompts)
- [Stripe Freemium/Subscription Patterns — stripe.com](https://stripe.com/resources/more/freemium-pricing-explained)
- [Stripe SaaS Integration Guide — stripe.com/docs](https://docs.stripe.com/saas)
- [Build Subscriptions — stripe.com/docs](https://docs.stripe.com/billing/subscriptions/build-subscriptions)
- [Supabase Google OAuth — supabase.com/docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Intent Classification 2025 — labelyourdata.com](https://labelyourdata.com/articles/machine-learning/intent-classification)
- [Chatbot Intent Recognition 2026 — aimultiple.com](https://research.aimultiple.com/chatbot-intent/)
- [GoPay vs Stripe Comparison — wmtips.com](https://www.wmtips.com/technologies/compare/gopay-vs-stripe/)
- [Payments in Czech Republic — stripe.com](https://stripe.com/en-de/resources/more/payments-in-czech-republic)
- [SaaS Onboarding Best Practices 2025 — flowjam.com](https://www.flowjam.com/blog/saas-onboarding-best-practices-2025-guide-checklist)
- [Freemium Conversion Rate — userpilot.com](https://userpilot.com/blog/freemium-conversion-rate/)
- [Zola Freemium Model — zola.com](https://www.zola.com/wedding-planning/website)

---
*Feature research for: Svoji — B2C Product v2.0*
*Researched: 2026-03-01*
