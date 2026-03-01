# Stack Research

**Domain:** B2C Freemium SaaS — payments, auth, AI pipeline, analytics (Czech market)
**Researched:** 2026-03-01
**Confidence:** HIGH for Stripe + Supabase OAuth + PostHog; MEDIUM for GoPay (no official Node SDK); MEDIUM for AI intent pipeline (depends on existing Claude integration)

---

## Context: Already Installed (Do Not Re-Research)

| Package | Version | Status |
|---------|---------|--------|
| Next.js | 16.1.6 | Keep |
| Tailwind CSS | ^4 | Keep |
| Framer Motion | ^12.34.3 | Keep |
| React | 19.2.3 | Keep |
| @supabase/supabase-js | ^2.98.0 | Keep — OAuth provider added via Supabase dashboard config only |
| @supabase/ssr | ^0.8.0 | Keep |
| @anthropic-ai/sdk | ^0.78.0 | Keep — extend for intent classification |
| react-hook-form + zod | 7.x + 4.x | Keep — reuse for new onboarding steps |
| lenis | ^1.3.17 | Keep |

---

## New Stack Additions for v2.0

### Payments

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| stripe | ^20.4.0 | Server-side Stripe SDK — create checkout sessions, manage subscriptions, handle webhooks | Current major version; pinned to API 2026-02-25. Stripe fully supports CZK, Czech Republic card payments (Visa/MC), SCA/PSD2 compliance, recurring billing. No peer dependency conflicts with Next.js 16 + React 19. |
| @stripe/stripe-js | ^8.8.0 | Load Stripe.js client — required for EmbeddedCheckout | Lazy-loads Stripe.js from Stripe CDN. Required when using `EmbeddedCheckoutProvider`. Never expose the secret key client-side — this package only needs the publishable key. |
| @stripe/react-stripe-js | ^3.x | React components: `EmbeddedCheckoutProvider`, `EmbeddedCheckout` | Embedded Checkout (ui_mode: 'embedded') keeps the user on your domain, handles PCI compliance. Required version ≥3.0.0 for embedded component support. |

**GoPay decision:** No official Node.js SDK from gopaycommunity. All community packages (gopay-js, gopay-node, gopay-nodejs) are 2-7 years old with no active maintenance. GoPay's REST API is well-documented but would require building a custom wrapper. Given that Stripe fully supports CZK, Czech card payments, SCA compliance, and subscription billing — use Stripe only for v2.0. GoPay can be added in v3.0 if user research shows local bank transfer (FIO, Raiffeisen) demand.

### Authentication (Google OAuth)

No new package needed. Supabase Auth already supports Google OAuth natively via `signInWithOAuth()`. Implementation is purely configuration:

1. Supabase Dashboard → Authentication → Providers → Enable Google
2. Google Cloud Console → Create OAuth 2.0 Client ID → add Supabase callback URL
3. Add `app/auth/callback/route.ts` to exchange auth code for session
4. Call `supabase.auth.signInWithOAuth({ provider: 'google' })` from existing auth flow

The existing `@supabase/ssr` + `@supabase/supabase-js` packages handle all of this. Zero new dependencies.

### Analytics and Engagement Metrics

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| posthog-js | ^1.x | Engagement metrics, UTM tracking, funnel analysis, feature flags | 1M events/month free on cloud — more than enough for early-stage. Native Next.js App Router support. Handles UTM parameter capture automatically. Product analytics (event funnels, retention) is what's needed, not just traffic analytics. Self-hostable later if privacy requirements change. Alternative (Mixpanel) is also strong but PostHog's developer experience and free tier are better for this stage. |

**UTM tracking:** PostHog captures UTM parameters automatically on `posthog.capture('$pageview')`. No additional library needed.

**Demand signal logging:** Use Supabase directly — insert rows to a `demand_signals` table from the existing chat API route. No new library needed. PostHog for aggregate engagement, Supabase for structured demand data tied to user records.

### AI Intent Classification

No new package. The existing `@anthropic-ai/sdk` handles this. Intent classification is a structured output problem — call Claude with a Zod-validated response schema via the `tools` API to extract intent category from chat messages.

Pattern: during the existing chat route handling, pass the user message through a lightweight classification call (model: `claude-haiku-3-5` for cost) that returns one of a fixed enum of intent categories (vendor_inquiry, budget_question, timeline_stress, checklist_help, general_question). Store the category alongside the chat message in Supabase.

Do NOT add the Vercel AI SDK — it would duplicate the existing Anthropic SDK integration and add unnecessary abstraction.

### Rate Limiting (Free Tier — 15 messages/day)

No new package. Implement in Supabase using the existing `chat_messages` table:

```sql
-- Count today's messages for a user before allowing new ones
SELECT COUNT(*) FROM chat_messages
WHERE couple_id = $1
AND created_at > now() - interval '1 day'
AND role = 'user';
```

Check this count in the existing `app/api/chat/route.ts` before calling Claude. Return 429 if limit exceeded. Store user tier in the `couples` table — premium users skip the check.

No Redis, no upstash, no rate limiting library needed at this scale.

---

## Installation

```bash
# Payments
npm install stripe @stripe/stripe-js @stripe/react-stripe-js

# Analytics
npm install posthog-js
```

No new dev dependencies required.

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Stripe | GoPay | No maintained Node.js SDK from official gopaycommunity org; Stripe supports CZK + SCA + Czech card payments fully |
| Stripe | Paddle | Paddle is Merchant of Record model (handles taxes) — valuable but more overhead; Stripe is simpler for v2.0 |
| PostHog | Mixpanel | Both are strong; PostHog has better free tier (1M events/month), native Next.js docs, open-source, self-hostable |
| PostHog | Google Analytics 4 | GA4 is traffic analytics, not product analytics — can't track feature usage funnels or engagement per user |
| Embedded Checkout | Stripe Elements (custom form) | Embedded Checkout requires less code, handles SCA/PSD2 automatically, Stripe handles PCI compliance |
| Supabase rate limiting | Upstash Redis | Redis adds infrastructure complexity; Supabase SQL is sufficient at this user volume |
| Claude for intent classification | Fine-tuned classifier | Far too early to justify training data collection; Claude claude-haiku-3-5 is cheap and immediate |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| gopay-js / gopay-node / gopay-nodejs | All community packages, last updated 2-7 years ago, no types, no maintenance | Stripe (Czech market compatible) |
| Vercel AI SDK | Duplicates existing @anthropic-ai/sdk integration; abstracts away direct tool-use API needed for intent classification | @anthropic-ai/sdk directly |
| Upstash / Redis | Overkill for rate limiting at early-stage user counts | Supabase SQL count query in API route |
| next-auth | Project already uses Supabase Auth; adding next-auth creates two auth systems | Supabase OAuth provider config |
| Prisma | Project uses Supabase client directly (no ORM); Prisma adds migration complexity on top of existing Supabase migrations | Supabase client + raw SQL |
| Stripe Customer Portal (full setup) | Correct for v3.0 when self-serve subscription management is needed; premature in v2.0 with small subscriber base | Manual subscription management via Supabase dashboard |

---

## Integration Architecture

### Stripe Subscription Flow

```
User clicks "Upgrade" → Server Action creates Checkout Session (mode: subscription, ui_mode: embedded)
→ Client renders EmbeddedCheckout inside modal
→ User pays → Stripe fires webhook to /api/webhooks/stripe
→ Webhook handler verifies signature → updates couples.tier = 'premium' in Supabase
→ User sees premium features unlocked
```

Required env vars:
- `STRIPE_SECRET_KEY` — server only
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — client (safe)
- `STRIPE_WEBHOOK_SECRET` — server only (webhook signature verification)

### Google OAuth Flow

```
User clicks "Pokračovat s Google" → signInWithOAuth({ provider: 'google', redirectTo: '/auth/callback' })
→ Redirect to Google consent screen
→ Google redirects to Supabase callback URL → Supabase exchanges code for session
→ Supabase redirects to app/auth/callback/route.ts → exchangeCodeForSession()
→ Redirect to /onboarding (new user) or /dashboard (returning user)
```

No new env vars — uses existing `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### PostHog Initialization (App Router pattern)

```tsx
// app/providers.tsx (client component)
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PHProvider({ children }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: 'https://eu.posthog.com', // EU data residency
      capture_pageview: false,            // handle manually with usePathname
      capture_pageleave: true,
    })
  }, [])
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

Required env vars:
- `NEXT_PUBLIC_POSTHOG_KEY` — client (safe)

Use EU host (`eu.posthog.com`) for GDPR compliance since the user base is Czech/EU.

### Intent Classification Pipeline

```tsx
// Inside existing app/api/chat/route.ts, after receiving user message:

const classification = await anthropic.messages.create({
  model: 'claude-haiku-3-5-20241022',
  max_tokens: 64,
  tools: [{
    name: 'classify_intent',
    description: 'Classify wedding planning chat message intent',
    input_schema: {
      type: 'object',
      properties: {
        intent: {
          type: 'string',
          enum: ['vendor_inquiry', 'budget_question', 'timeline_stress', 'checklist_help', 'general_question']
        },
        location_mentioned: { type: 'string' },
        vendor_category: { type: 'string' }
      },
      required: ['intent']
    }
  }],
  tool_choice: { type: 'tool', name: 'classify_intent' },
  messages: [{ role: 'user', content: userMessage }]
})

// Insert demand signal if vendor-related
if (classification.intent === 'vendor_inquiry') {
  await supabase.from('demand_signals').insert({
    couple_id, intent, vendor_category, location_mentioned, raw_message: userMessage
  })
}
```

Run classification concurrently with the main Claude response (Promise.all) to not add latency. claude-haiku-3-5 is ~10x cheaper than Sonnet — cost negligible.

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| stripe@20.4.0 | Node.js 14+, TypeScript 5 | No React dependency; server-only |
| @stripe/stripe-js@8.8.0 | React 19, Next.js 16 | Use dynamic import to avoid SSR issues |
| @stripe/react-stripe-js@3.x | React 19 | EmbeddedCheckout requires stripe-js ≥5.2.0 |
| posthog-js@1.x | React 19, Next.js App Router | Use 'use client' wrapper in providers.tsx |

---

## Supabase Schema Additions Needed

```sql
-- couples table: add tier column
ALTER TABLE couples ADD COLUMN tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium'));
ALTER TABLE couples ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE couples ADD COLUMN stripe_subscription_id TEXT;

-- demand signals table (new)
CREATE TABLE demand_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  intent TEXT NOT NULL,
  vendor_category TEXT,
  location_mentioned TEXT,
  raw_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE demand_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "couples can read own signals" ON demand_signals FOR SELECT USING (auth.uid() = couple_id);
-- Insert via service role key in API route (bypasses RLS)
```

---

## Sources

- [stripe npm](https://www.npmjs.com/package/stripe) — v20.4.0, verified current
- [Stripe Czech Republic payments](https://stripe.com/resources/more/payments-in-czech-republic) — CZK, SCA/PSD2 support confirmed
- [Stripe Billing subscriptions](https://stripe.com/en-cz/billing) — recurring subscription support confirmed
- [Build embedded checkout — Stripe Docs](https://docs.stripe.com/checkout/embedded/quickstart) — EmbeddedCheckout pattern
- [Supabase Auth Google provider](https://supabase.com/docs/guides/auth/social-login/auth-google) — no new package needed, config only
- [PostHog Next.js App Router docs](https://posthog.com/docs/libraries/next-js) — providers.tsx pattern, App Router support
- [PostHog pricing](https://posthog.com/pricing) — 1M events/month free tier confirmed
- [GoPay gopaycommunity GitHub](https://github.com/gopaycommunity) — no official Node.js SDK
- gopay-js last publish: 2 years ago (LOW confidence for production use)
- @stripe/react-stripe-js — EmbeddedCheckout requires v3.0.0+

---

*Stack research for: Svoji v2.0 B2C (payments, OAuth, AI pipeline, analytics)*
*Researched: 2026-03-01*
