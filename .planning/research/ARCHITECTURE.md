# Architecture Research

**Domain:** Freemium SaaS — wedding planning with payments, AI pipeline, and analytics
**Researched:** 2026-03-01
**Confidence:** HIGH (Stripe+Supabase patterns well-documented; GoPay is REST-only, no JS SDK)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Next.js 16 App Router                       │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ (public)     │  │ (auth)       │  │ (dashboard)              │   │
│  │ Landing      │  │ Login        │  │ Chat                     │   │
│  │ /w/[slug]    │  │ Register     │  │ Checklist                │   │
│  │              │  │ Onboarding   │  │ Budget, Guests           │   │
│  │              │  │ /auth/cb     │  │ Upgrade      ← NEW       │   │
│  │              │  │  ← NEW       │  │ Settings/Billing ← NEW   │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                      API Routes (src/app/api/)                 │   │
│  │                                                               │   │
│  │  EXISTING: /chat  /rsvp                                       │   │
│  │  NEW:  /stripe/checkout  /stripe/webhook  /stripe/portal      │   │
│  │        /gopay/create     /gopay/notify                        │   │
│  │        /ai/classify-intent   /metrics/event                   │   │
│  └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
         │                    │                     │
         ▼                    ▼                     ▼
┌──────────────────┐  ┌────────────────┐  ┌─────────────────┐
│  Supabase        │  │  Stripe        │  │  Anthropic      │
│  - auth + OAuth  │  │  - Checkout    │  │  - Claude Sonnet│
│  - couples       │  │  - Webhooks    │  │    (chat)       │
│  - subscriptions │  │  - Portal      │  │  - Claude Haiku │
│  - demand_signals│  └────────────────┘  │    (intent cls) │
│  - engagement    │                      └─────────────────┘
│  - rate_limits   │  ┌────────────────┐
└──────────────────┘  │  GoPay (CZ)    │
                       │  - REST API    │
                       │  - No JS SDK   │
                       └────────────────┘
```

---

## DB Schema Additions

### Modified: `couples` table

Add columns to existing table — no breaking changes to current schema.

```sql
ALTER TABLE couples
  ADD COLUMN tier VARCHAR(20) DEFAULT 'free'
    CHECK (tier IN ('free', 'premium')),
  ADD COLUMN stripe_customer_id VARCHAR(255) UNIQUE,
  ADD COLUMN subscription_status VARCHAR(50),
    -- 'active', 'canceled', 'past_due', null
  ADD COLUMN subscription_period_end TIMESTAMP WITH TIME ZONE,
  ADD COLUMN location_city VARCHAR(100),       -- new onboarding step 3
  ADD COLUMN location_radius_km INT,           -- how far they search vendors
  ADD COLUMN guest_count INT;                  -- new onboarding step 2
```

### New: `subscriptions` table

Source of truth for payment state. Separate from `couples` to keep payment history on cancel/resubscribe.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'gopay')),
  provider_subscription_id VARCHAR(255) UNIQUE,
  provider_customer_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
    -- 'active', 'canceled', 'past_due', 'trialing'
  plan VARCHAR(50) NOT NULL,
    -- 'premium_monthly', 'premium_yearly'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_couple ON subscriptions(couple_id);
```

### New: `demand_signals` table

Stores classified intents from AI conversations. Powers the vendor marketplace flywheel in v3.0.
Denormalizes couple context at signal time — queries need historical snapshots, not live couple data.

```sql
CREATE TABLE demand_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  chat_message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  intent_category VARCHAR(100) NOT NULL,
    -- 'photographer', 'catering', 'venue', 'music', 'florist', etc.
  intent_subcategory VARCHAR(100),
    -- 'outdoor', 'budget', 'premium', 'traditional', etc.
  location_city VARCHAR(100),
  location_radius_km INT,
  wedding_date DATE,
  budget_total DECIMAL(12,2),
  guest_count INT,
  raw_message TEXT,
  confidence DECIMAL(4,3),   -- 0.000-1.000
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_demand_signals_category ON demand_signals(intent_category);
CREATE INDEX idx_demand_signals_location ON demand_signals(location_city);
CREATE INDEX idx_demand_signals_couple ON demand_signals(couple_id);
CREATE INDEX idx_demand_signals_created ON demand_signals(created_at);
```

### New: `engagement_events` table

Funnel analytics and feature usage tracking. Flexible JSONB payload accommodates future event types.

```sql
CREATE TABLE engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
    -- 'page_view', 'chat_message', 'checklist_complete',
    -- 'onboarding_step', 'upgrade_view', 'upgrade_click', etc.
  event_data JSONB,
  session_id VARCHAR(100),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_engagement_events_couple ON engagement_events(couple_id);
CREATE INDEX idx_engagement_events_type ON engagement_events(event_type);
CREATE INDEX idx_engagement_events_created ON engagement_events(created_at);
```

### New: `rate_limit_usage` table

Daily message quota tracking for free tier. One row per (user, day).

```sql
CREATE TABLE rate_limit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES couples(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INT DEFAULT 0,
  UNIQUE(couple_id, date)
);
CREATE INDEX idx_rate_limit_couple_date ON rate_limit_usage(couple_id, date);

-- Atomic increment + gate check — prevents race conditions
CREATE OR REPLACE FUNCTION increment_and_check_rate_limit(
  p_couple_id UUID, p_date DATE, p_limit INT
) RETURNS BOOLEAN AS $$
DECLARE new_count INT;
BEGIN
  INSERT INTO rate_limit_usage (couple_id, date, message_count)
  VALUES (p_couple_id, p_date, 1)
  ON CONFLICT (couple_id, date)
  DO UPDATE SET message_count = rate_limit_usage.message_count + 1
  RETURNING message_count INTO new_count;
  RETURN new_count <= p_limit;
END;
$$ LANGUAGE plpgsql;
```

### Modified: `wedding_websites` table

```sql
-- published=true only allowed when couple.tier='premium'
-- Enforcement: in API handler, not DB constraint (simpler to change tier rules later)
ALTER TABLE wedding_websites
  ADD COLUMN is_premium_feature BOOLEAN DEFAULT true;
```

---

## New Components Required

### New API Routes

| Route | Method | What it does | Auth |
|-------|--------|--------------|------|
| `/api/stripe/checkout` | POST | Create Stripe Checkout session, create/reuse stripe_customer_id | Required |
| `/api/stripe/webhook` | POST | Handle Stripe events (subscription state sync) | Stripe signature |
| `/api/stripe/portal` | POST | Create Customer Portal session for billing management | Required |
| `/api/gopay/create` | POST | Create GoPay payment via REST, return redirect URL | Required |
| `/api/gopay/notify` | POST | GoPay IPN — verify payment state, update tier | GoPay signature |
| `/api/ai/classify-intent` | POST | Internal — classify message intent, write demand_signals | Internal only |
| `/api/metrics/event` | POST | Write to engagement_events | Optional auth |
| `/auth/callback` | GET | Exchange OAuth code for Supabase session (Google OAuth) | None |

### New Pages and UI Components

| Location | Type | Purpose |
|----------|------|---------|
| `(dashboard)/upgrade/page.tsx` | Page | Pricing comparison + Stripe/GoPay checkout CTAs |
| `(dashboard)/settings/billing/page.tsx` | Page | Subscription status, Customer Portal link, cancel info |
| `components/paywall/UpgradePrompt.tsx` | Component | Inline gate — shown when free user hits premium feature |
| `components/paywall/TierBadge.tsx` | Component | FREE / PREMIUM pill in DashboardNav |
| `components/auth/GoogleOAuthButton.tsx` | Component | Google sign-in button using Supabase OAuth |
| `components/onboarding/StepGuests.tsx` | Component | Onboarding step 2 — guest count input |
| `components/onboarding/StepLocation.tsx` | Component | Onboarding step 3 — city + search radius |

---

## Recommended Project Structure (new files only)

```
src/
├── app/
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts    # session creation
│   │   │   ├── webhook/route.ts     # MUST use raw body (request.text())
│   │   │   └── portal/route.ts      # customer portal session
│   │   ├── gopay/
│   │   │   ├── create/route.ts      # REST call to gate.gopay.cz/api
│   │   │   └── notify/route.ts      # IPN handler
│   │   ├── ai/
│   │   │   └── classify-intent/route.ts  # optional — can be inline lib fn
│   │   └── metrics/
│   │       └── event/route.ts
│   ├── auth/
│   │   └── callback/route.ts        # OAuth code exchange
│   └── (dashboard)/
│       ├── upgrade/page.tsx
│       └── settings/billing/page.tsx
├── components/
│   ├── paywall/
│   │   ├── UpgradePrompt.tsx
│   │   └── TierBadge.tsx
│   ├── auth/
│   │   └── GoogleOAuthButton.tsx
│   └── onboarding/
│       ├── StepGuests.tsx
│       └── StepLocation.tsx
└── lib/
    ├── stripe.ts              # Stripe singleton
    ├── gopay.ts               # GoPay REST helpers (token + payment)
    ├── tier.ts                # isPremium(), checkFeatureAccess() helpers
    ├── intent-classifier.ts   # Claude haiku prompt + intent parser
    └── supabase/
        └── admin.ts           # Service-role client (for webhooks)

supabase/migrations/
├── 004_subscriptions.sql
├── 005_demand_signals.sql
├── 006_engagement_events.sql
└── 007_rate_limits.sql
```

---

## Architectural Patterns

### Pattern 1: Webhook as Single Source of Truth (Stripe)

**What:** Never trust the Checkout success redirect to update subscription state. The webhook is the only place that writes `couples.tier` and `subscriptions`.

**When to use:** Always. Success page redirects can fail if the user closes the tab. Stripe guarantees webhook delivery with retries.

**Trade-offs:** Slight activation delay (usually under 5 seconds). Premium UI may render before webhook fires on the success page — poll `tier` on the success redirect or show a "activating..." state.

```typescript
// src/app/api/stripe/webhook/route.ts
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.text(); // raw body — required for sig verification
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = createAdminClient(); // service_role bypasses RLS

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated'
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const isActive = sub.status === 'active' || sub.status === 'trialing';

    await supabase.from('couples')
      .update({
        tier: isActive ? 'premium' : 'free',
        subscription_status: sub.status,
        subscription_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      })
      .eq('stripe_customer_id', sub.customer as string);

    await supabase.from('subscriptions').upsert({
      couple_id: /* resolved via stripe_customer_id lookup */ '',
      provider: 'stripe',
      provider_subscription_id: sub.id,
      status: sub.status,
      plan: sub.items.data[0]?.price.lookup_key ?? 'premium_monthly',
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    }, { onConflict: 'provider_subscription_id' });
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    await supabase.from('couples')
      .update({ tier: 'free', subscription_status: 'canceled' })
      .eq('stripe_customer_id', sub.customer as string);
  }

  return new Response('ok');
}
```

### Pattern 2: Fire-and-Forget Intent Classification

**What:** After saving a chat message, trigger intent classification asynchronously. The user response is returned immediately — classification runs in the background.

**When to use:** AI intent classification and demand signal logging. These are analytics, never user-facing.

**Trade-offs:** Classification can fail silently. Acceptable. If signals are missing for some messages, the analytics are slightly incomplete — far better than degrading chat UX.

**Intent taxonomy for Czech wedding domain:**
`photographer`, `videographer`, `venue`, `catering`, `music`, `florist`, `car`, `officiant`, `honeymoon`, `dress`, `invitations`, `cake`, `hair_makeup`, `budget_advice`, `checklist_advice`, `legal`, `general`

```typescript
// src/app/api/chat/route.ts — modified section after saving messages
await supabase.from('chat_messages').insert([
  { couple_id: coupleId, role: 'user', content: message },
  { couple_id: coupleId, role: 'assistant', content: assistantMessage },
]);

// Fire-and-forget — never await, never block the response
void classifyAndLogIntent({
  coupleId,
  message,
  coupleContext: context,
});

return NextResponse.json({ message: assistantMessage });

// ─── src/lib/intent-classifier.ts ───────────────────────────────────
const INTENT_PROMPT = `
Classify the following wedding planning message into one intent category.
Respond with JSON only: { "category": string, "subcategory": string | null, "confidence": number }
Categories: photographer, videographer, venue, catering, music, florist,
car, officiant, honeymoon, dress, invitations, cake, hair_makeup,
budget_advice, checklist_advice, legal, general
`;

export async function classifyAndLogIntent({ coupleId, message, coupleContext }) {
  try {
    const result = await anthropic.messages.create({
      model: 'claude-haiku-20240307',
      max_tokens: 80,
      system: INTENT_PROMPT,
      messages: [{ role: 'user', content: message }],
    });
    const parsed = JSON.parse(result.content[0].text);
    if (parsed.confidence > 0.6) {
      const supabase = createAdminClient();
      await supabase.from('demand_signals').insert({
        couple_id: coupleId,
        intent_category: parsed.category,
        intent_subcategory: parsed.subcategory,
        confidence: parsed.confidence,
        location_city: coupleContext.locationCity,
        wedding_date: coupleContext.weddingDate,
        budget_total: coupleContext.budget,
        guest_count: coupleContext.guestCount,
        raw_message: message,
      });
    }
  } catch {
    // Silent — analytics, never critical
  }
}
```

### Pattern 3: Server-Side Tier Gate

**What:** Check `couple.tier` in Server Components and API route handlers. Client-side checks are UI only — never security boundaries.

**When to use:** Any feature behind the paywall: wedding website publishing, any future premium-only views.

**Trade-offs:** One extra field loaded on every dashboard request (negligible — already querying couples table).

```typescript
// src/lib/tier.ts
import { Couple } from '@/lib/types';

export function isPremium(couple: Couple): boolean {
  return (
    couple.tier === 'premium' &&
    couple.subscription_status === 'active' &&
    (couple.subscription_period_end === null ||
      new Date(couple.subscription_period_end) > new Date())
  );
}

export function checkFeatureAccess(couple: Couple, feature: 'wedding_web_publish') {
  const gates: Record<string, (c: Couple) => boolean> = {
    wedding_web_publish: isPremium,
  };
  return gates[feature]?.(couple) ?? true;
}

// src/app/(dashboard)/layout.tsx — load tier alongside couple data
// Server Component:
const { data: couple } = await supabase
  .from('couples')
  .select('partner1_name, partner2_name, tier, subscription_status, subscription_period_end, onboarding_completed')
  .eq('id', user.id)
  .single();

// Pass tier to client via a React Context or props
```

### Pattern 4: DB-Based Rate Limiting (no Redis)

**What:** Use `rate_limit_usage` + a Postgres function for atomic increment + check. One extra write per chat message. No external service needed at this scale.

**When to use:** Free tier 15 messages/day limit. Upgrade to Upstash Redis when DAU exceeds ~2000 active chat users.

**Trade-offs:** One DB round-trip added to the chat API. At early scale this is under 5ms on Supabase. The Postgres function is atomic — no race conditions from concurrent requests.

```typescript
// src/app/api/chat/route.ts — add before calling Claude
async function checkRateLimit(coupleId: string, tier: string): Promise<boolean> {
  if (tier === 'premium') return true;
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase.rpc('increment_and_check_rate_limit', {
    p_couple_id: coupleId,
    p_date: today,
    p_limit: 15,
  });
  return data === true;
}

// In route handler:
const { data: couple } = await supabase.from('couples')
  .select('tier, subscription_status')
  .eq('id', user.id)
  .single();

const allowed = await checkRateLimit(coupleId, couple.tier);
if (!allowed) {
  return NextResponse.json(
    { error: 'Překročili jste denní limit 15 zpráv. Přejděte na Premium pro neomezený přístup.' },
    { status: 429 }
  );
}
```

### Pattern 5: Google OAuth Callback Route

**What:** Supabase handles the OAuth redirect flow. The app needs one new route `/auth/callback` to exchange the code for a session.

**When to use:** Google OAuth login. Required for any Supabase OAuth provider.

```typescript
// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/onboarding';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if onboarding completed — redirect accordingly
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}

// src/components/auth/GoogleOAuthButton.tsx
'use client';
import { createClient } from '@/lib/supabase/client';

export function GoogleOAuthButton() {
  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }
  return (
    <button onClick={handleGoogleLogin} className="...">
      Přihlásit se přes Google
    </button>
  );
}
```

---

## Data Flow

### Payment Flow (Stripe)

```
User clicks "Upgrade" in dashboard
    ↓
POST /api/stripe/checkout
    → Read couple.stripe_customer_id — create if null, persist if new
    → stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: stripeCustomerId,
        line_items: [{ price: PRICE_ID }],
        metadata: { coupleId },
        success_url: '/dashboard?upgraded=1',
        cancel_url: '/dashboard/upgrade',
      })
    → Return { url }
    ↓
Client: window.location.href = url (redirect to Stripe hosted page)
    ↓
User pays on Stripe
    ↓
Stripe → POST /api/stripe/webhook (customer.subscription.created)
    → Verify Stripe-Signature header
    → Update couples.tier = 'premium'
    → Upsert subscriptions row
    ↓
User lands on /dashboard?upgraded=1
    → Server Component re-reads couple.tier = 'premium'
    → Renders premium UI
```

### GoPay Flow (Czech alternative)

```
POST /api/gopay/create
    → Fetch GoPay OAuth2 token (client_credentials grant)
      POST https://gate.gopay.cz/api/oauth2/token
    → Create payment
      POST https://gate.gopay.cz/api/payments
      { payer, amount, currency: 'CZK', order_description, ... }
    → Return { gw_url }
    ↓
Client redirects to GoPay payment page
    ↓
GoPay POSTs to /api/gopay/notify (IPN)
    → Verify by querying payment state:
      GET https://gate.gopay.cz/api/payments/{id}
    → On state=PAID: update couples.tier='premium', insert subscriptions row
    ↓
User returns to /dashboard?gopay=paid
```

Note: GoPay recurring subscriptions require separate "recurrence" setup. For v2.0, treat GoPay as annual one-time payment only. Stripe handles recurring monthly/yearly plans.

### AI Intent Classification Flow

```
User sends chat message
    ↓
POST /api/chat (existing route — modified)
    → Auth check (existing)
    → Rate limit check  ← NEW
      If free tier AND count >= 15 → 429 response
    → Build system prompt (existing)
    → Call Claude Sonnet for response (existing)
    → Save user + assistant messages to chat_messages (existing)
    → void classifyAndLogIntent(...)  ← NEW fire-and-forget
    → Return chat response to client (same timing as before)
    ↓ (async, non-blocking, ~200-500ms later)
classifyAndLogIntent()
    → Call Claude Haiku with intent classification prompt
    → Parse JSON response: { category, subcategory, confidence }
    → If confidence > 0.6:
      INSERT demand_signals (with denormalized couple context)
```

### Engagement Metrics Flow

```
Client component action (page view, button click, onboarding step, upgrade click)
    ↓
POST /api/metrics/event
    { event_type, event_data, session_id, utm_source, utm_medium, utm_campaign }
    → Reads user from session if authenticated (optional — some events pre-auth)
    → INSERT engagement_events
    → Return 200

UTM capture (landing page):
    → LandingNav/Hero reads ?utm_* from URL on mount
    → Stores in sessionStorage
    → On registration: send 'registration' event with utm fields
```

### Google OAuth Flow

```
User clicks "Přihlásit se přes Google"
    ↓
GoogleOAuthButton.tsx → supabase.auth.signInWithOAuth({ provider: 'google' })
    ↓
Browser redirects to Google consent screen
    ↓
Google redirects back to /auth/callback?code=xxx
    ↓
/auth/callback route: supabase.auth.exchangeCodeForSession(code)
    → Creates Supabase user if new (auto-inserts into auth.users)
    → Sets session cookie
    ↓
Check if couple row exists (onboarding_completed)
    → New user: redirect to /onboarding
    → Returning user: redirect to /dashboard
```

---

## New vs. Modified: Complete List

### Modified (existing files change)

| File | What changes |
|------|--------------|
| `src/app/api/chat/route.ts` | Add rate limit check; add fire-and-forget `void classifyAndLogIntent()` after save |
| `src/app/(dashboard)/layout.tsx` | Load `couple.tier + subscription_status`; remove `isDemoMode = true` hardcode; pass tier to client via context |
| `src/components/providers/Providers.tsx` | Add `TierContext.Provider` so client components can read tier without prop drilling |
| `src/lib/types.ts` | Add `tier`, `stripe_customer_id`, `subscription_status`, `subscription_period_end`, `location_city`, `location_radius_km`, `guest_count` to `Couple`; add `Subscription`, `DemandSignal`, `EngagementEvent` interfaces |
| `src/middleware.ts` | Remove `DEMO_MODE = true`; activate real session refresh logic |
| `src/app/(auth)/onboarding/page.tsx` | Expand from 3 to 4 steps using StepGuests and StepLocation components |
| `src/app/(public)/w/[slug]/page.tsx` | Show "preview mode" banner for unpublished sites; enforce `published=true` for public access |
| `src/app/(dashboard)/settings/page.tsx` | Add billing section or link to `/settings/billing` |
| `src/components/dashboard/DashboardNav.tsx` | Add `TierBadge` component |

### New (net-new files)

| File | Purpose |
|------|---------|
| `src/app/auth/callback/route.ts` | OAuth code exchange |
| `src/app/api/stripe/checkout/route.ts` | Checkout session creation |
| `src/app/api/stripe/webhook/route.ts` | Subscription state sync (raw body required) |
| `src/app/api/stripe/portal/route.ts` | Customer Portal session |
| `src/app/api/gopay/create/route.ts` | GoPay payment creation |
| `src/app/api/gopay/notify/route.ts` | GoPay IPN handler |
| `src/app/api/metrics/event/route.ts` | Engagement event logging |
| `src/app/(dashboard)/upgrade/page.tsx` | Pricing / upgrade page |
| `src/app/(dashboard)/settings/billing/page.tsx` | Subscription management |
| `src/components/paywall/UpgradePrompt.tsx` | Inline paywall gate component |
| `src/components/paywall/TierBadge.tsx` | FREE/PREMIUM indicator in nav |
| `src/components/auth/GoogleOAuthButton.tsx` | Google OAuth trigger button |
| `src/components/onboarding/StepGuests.tsx` | Onboarding step 2 |
| `src/components/onboarding/StepLocation.tsx` | Onboarding step 3 |
| `src/lib/stripe.ts` | Stripe singleton (`new Stripe(process.env.STRIPE_SECRET_KEY!)`) |
| `src/lib/gopay.ts` | GoPay REST helpers: `getToken()`, `createPayment()`, `getPaymentState()` |
| `src/lib/tier.ts` | `isPremium()`, `checkFeatureAccess()` |
| `src/lib/intent-classifier.ts` | `classifyAndLogIntent()` with Claude Haiku |
| `src/lib/supabase/admin.ts` | Service-role client for webhooks and server-side writes that bypass RLS |
| `supabase/migrations/004_subscriptions.sql` | subscriptions table + RLS |
| `supabase/migrations/005_demand_signals.sql` | demand_signals table + RLS |
| `supabase/migrations/006_engagement_events.sql` | engagement_events table + RLS |
| `supabase/migrations/007_rate_limits.sql` | rate_limit_usage table + atomic Postgres function |

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-500 active users | Current approach fine. DB rate limiting is adequate. No queues needed. |
| 500-5k active users | Add Upstash Redis for rate limiting to reduce DB write pressure. Stripe webhooks may need idempotency key tracking. |
| 5k-50k active users | Separate analytics writes. Consider Posthog/Plausible for engagement_events instead of rolling your own. Intent classification cost may need batching. |
| 50k+ | demand_signals becomes a dedicated analytics service. Event streaming (Kafka/Supabase Realtime) for real-time signals. |

### Scaling Priorities

1. **First bottleneck: chat API** — two Claude calls per message (Sonnet + Haiku) doubles AI cost. Haiku is cheap (~$0.00025/1k tokens) but at scale consider batching classification with a queue.
2. **Second bottleneck: engagement_events writes** — high frequency if tracking page views. Partition by month early (`CREATE TABLE engagement_events_2026_03 PARTITION OF ...`) or move to an external analytics tool.

---

## Anti-Patterns

### Anti-Pattern 1: Trusting Client-Side Tier Checks

**What people do:** Read tier from React context, hide premium UI, assume that's enough protection.
**Why it's wrong:** Any user can override client state. Premium features (publishing wedding web) must also be gated server-side in the API handler.
**Do this instead:** Check `isPremium(couple)` in Server Components and API routes. Client checks are UI polish only.

### Anti-Pattern 2: Awaiting Intent Classification in Chat Handler

**What people do:** `await classifyAndLogIntent(...)` before returning the chat response.
**Why it's wrong:** Adds 200-800ms latency to every chat message. Users perceive the AI as slow.
**Do this instead:** `void classifyAndLogIntent(...)` — fire and forget. It is analytics, never user-facing.

### Anti-Pattern 3: Parsing Request Body as JSON in Stripe Webhook

**What people do:** Let Next.js auto-parse `request.body` as JSON in the webhook handler.
**Why it's wrong:** Stripe signature verification requires the raw body bytes. JSON serialization/deserialization changes the exact byte sequence.
**Do this instead:** `const body = await request.text()` before `stripe.webhooks.constructEvent()`.

### Anti-Pattern 4: Creating Stripe Customer on Every Checkout

**What people do:** Always call `stripe.customers.create()` in the checkout handler without checking existing ID.
**Why it's wrong:** Creates duplicate customer records. Makes billing history fragmented.
**Do this instead:** Read `couples.stripe_customer_id` first. If null, create and persist. If exists, reuse.

### Anti-Pattern 5: Using Supabase Anon Client in Webhook Handlers

**What people do:** Use the public browser-side Supabase client (anon key) in `/api/stripe/webhook`.
**Why it's wrong:** Webhook requests are unauthenticated (no user session cookie). RLS blocks all writes.
**Do this instead:** Use `createAdminClient()` (service_role key) in all webhook handlers. Never expose the service_role key to the browser.

---

## Integration Points: External Services

| Service | Integration Pattern | Key Gotcha |
|---------|---------------------|------------|
| Stripe | Hosted Checkout + webhook for state sync | Raw body required; never trust redirect for tier update |
| GoPay | Custom REST client with OAuth2 client_credentials | No JS SDK; poll payment state on IPN; recurring = complex |
| Google OAuth | Supabase built-in provider + `/auth/callback` route | Redirect URL registered in both Google Cloud Console AND Supabase dashboard |
| Anthropic (chat) | Existing — claude-sonnet for responses | Keep as-is |
| Anthropic (intent) | New — claude-haiku for classification | Fire-and-forget; parse as JSON; fail silently |
| Supabase Auth | Existing — add Google provider + admin client | Service-role key only server-side, never in browser |

---

## Build Order (Dependency-Driven)

Build in this order — each step unblocks the next:

1. **DB migrations 004-007** — all new features depend on the schema
2. **`src/lib/supabase/admin.ts`** — webhooks and server-side writes depend on this
3. **`src/lib/tier.ts`** — paywall gates depend on this; build once, use everywhere
4. **Update `src/lib/types.ts`** — all new code needs updated Couple interface
5. **Google OAuth** (`/auth/callback`, `GoogleOAuthButton`) — auth improvement, no payment dependency; unblocks user acquisition work in parallel
6. **Enhanced onboarding** (4 steps) — depends on schema additions (location, guest_count)
7. **Remove `isDemoMode = true`** from layout and middleware — unblocks real auth flow
8. **Stripe integration** (checkout + webhook + portal + `lib/stripe.ts`) — core monetization; must be live before paywall gates
9. **Freemium tier gates** (`UpgradePrompt`, tier checks in layout, wedding web paywall) — depends on Stripe being live and returning real `couple.tier`
10. **Rate limiting** (free tier 15 msg/day) — depends on `rate_limit_usage` table and `increment_and_check_rate_limit` Postgres function
11. **AI intent classification** (fire-and-forget in chat route, `intent-classifier.ts`) — depends on chat route stability; independent of payments
12. **Demand signal logging** — depends on intent classification
13. **Engagement metrics** (`/api/metrics/event`, UTM capture) — mostly independent; add after core flows are stable
14. **GoPay** — last; more complex REST integration, CZ-specific; Stripe proves the payment model first

---

## Sources

- Stripe Next.js App Router integration: [Stripe + Next.js 15 Complete Guide](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/)
- Stripe + Supabase webhook sync: [Supabase Stripe Webhooks Docs](https://supabase.com/docs/guides/functions/examples/stripe-webhooks)
- Stripe + Supabase subscription starter: [KolbySisk/next-supabase-stripe-starter](https://github.com/KolbySisk/next-supabase-stripe-starter)
- Supabase Google OAuth: [Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- Supabase Next.js Auth Quickstart: [Supabase Docs](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- GoPay REST API: [GoPay Technical Documentation](https://doc.gopay.com/)
- Supabase rate limiting patterns: [Rate Limiting Edge Functions](https://supabase.com/docs/guides/functions/examples/rate-limiting)
- Vercel subscription payments reference: [nextjs-subscription-payments](https://github.com/vercel/nextjs-subscription-payments)

---

*Architecture research for: Svoji v2.0 — freemium, payments, AI pipeline, engagement*
*Researched: 2026-03-01*
