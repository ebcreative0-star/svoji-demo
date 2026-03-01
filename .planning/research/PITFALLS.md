# Pitfalls Research

**Domain:** Adding freemium tiers, payments (Stripe/GoPay), Google OAuth, AI intent classification, and demand signal logging to existing Next.js + Supabase wedding SaaS
**Researched:** 2026-03-01
**Confidence:** HIGH (payments/OAuth/RLS), MEDIUM (GoPay specifics, AI pipeline), LOW (GoPay webhook reliability specifics — no public post-mortems found)

---

## Critical Pitfalls

### Pitfall 1: Webhook Race Condition — User Sees Stale "Free" Status After Payment

**What goes wrong:**
User completes Stripe/GoPay checkout and is redirected to the success page. The frontend immediately calls the API to check subscription status, but the payment webhook hasn't arrived yet (typical delay: 1-5 seconds). The user is shown "free tier" even though they just paid. They may double-click, refresh, or abandon — assuming payment failed.

**Why it happens:**
Webhooks are asynchronous and not guaranteed to arrive before the user's browser. Developers assume the `successUrl` redirect and webhook arrival are synchronized. They are not.

**How to avoid:**
On the `success` redirect page, synchronously query the payment provider API (Stripe SDK: `stripe.checkout.sessions.retrieve(session_id)`) to verify payment status immediately, then update the `subscription_tier` in Supabase before rendering the page. Use the webhook as an idempotent backup, not the primary signal. Add exponential-backoff polling (3 retries, 2s intervals) as a fallback.

Stripe-specific: listen to `customer.subscription.created` and `invoice.paid` (the latter covers all billing scenarios). GoPay-specific: check `state: PAID` via GET `/api/payments/{id}` on redirect, since GoPay's notify URL (webhook) arrives after the return URL.

**Warning signs:**
- Users reporting "paid but still on free tier"
- Success page shows freemium content immediately after checkout
- No polling or sync fetch on the `?success=true` redirect page

**Phase to address:**
Payment integration phase. Must be verified end-to-end before any tier enforcement goes live.

---

### Pitfall 2: Tier Enforcement Only in Middleware — RLS Left Open

**What goes wrong:**
Freemium access is enforced in Next.js middleware (checking `subscription_tier` from session) but RLS policies in Supabase are left permissive. A user manipulates the session cookie or calls Supabase directly (the anon key is public) and accesses premium data. The svatební web endpoint and premium API routes are protected by middleware, but direct Supabase calls bypass the entire Next.js layer.

**Why it happens:**
Middleware feels like "the" security layer because it's the most visible. Supabase's JavaScript client is accessible to any client-side code with the anon key. Developers forget that RLS is the only defense against direct database access.

**How to avoid:**
Implement defense in depth:
1. RLS as the ground truth: add a `subscription_tier` column to the `couples` table and write RLS policies that restrict premium-only operations based on it.
2. Middleware as UX: redirect free users away from premium pages for experience, but don't rely on it for data security.
3. API routes: verify tier server-side in every route that returns or mutates premium data.

Example RLS policy for premium-gated public web publishing:
```sql
CREATE POLICY "only_premium_can_publish" ON wedding_sites
  FOR UPDATE USING (
    auth.uid() = couple_id AND
    (SELECT subscription_tier FROM couples WHERE id = couple_id) = 'premium'
  );
```

**Warning signs:**
- RLS policies are `FOR ALL USING (auth.uid() = couple_id)` with no tier check
- Middleware is the only place where `subscription_tier` is checked
- Direct Supabase queries from client components bypass the tier gate

**Phase to address:**
Freemium tier system phase (must precede payment integration). Database schema and RLS must be correct before any payment UI ships.

---

### Pitfall 3: Google OAuth Creates Duplicate Accounts for Existing Email Auth Users

**What goes wrong:**
A user registered with `jan@example.com` via email/password. Later they click "Sign in with Google" using the same Google account (`jan@example.com`). Supabase Auth's automatic identity linking should merge them — but only if the email was verified. If the original email/password account was registered without verifying the email, Supabase cannot safely auto-link and creates a second account. The user now has two `couples` records with split data history.

**Why it happens:**
The current v0 auth flow (email/password) may have been built with email confirmation disabled (common in early prototyping). Users with unconfirmed email addresses cannot benefit from automatic identity linking. The distinction is invisible to users but fatal for data integrity.

**How to avoid:**
1. Before shipping Google OAuth, enable email confirmation in Supabase Auth settings and verify existing users have confirmed emails.
2. Check for existing users with unconfirmed emails: `SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL`. Handle them before launch.
3. In the sign-in UI, if Google OAuth fails with a duplicate account error, surface a clear message: "Tento e-mail je registrován. Přihlaš se e-mailem nebo potvrď svůj účet."
4. After Google OAuth succeeds, check if `auth.user.identities` has both `email` and `google` entries to confirm linking worked.

**Warning signs:**
- Two `couples` rows with same email prefix after a user tries both auth methods
- Users losing their checklist/budget data after "signing in again"
- `auth.identities` table has multiple rows for the same user with different providers

**Phase to address:**
Google OAuth phase. Run the unconfirmed email audit before enabling OAuth in production.

---

### Pitfall 4: Rate Limiting Free Tier Across Multiple Devices / Sessions

**What goes wrong:**
The 15 messages/day free tier limit is checked per-request against a counter in Supabase. A user opens the app on three browser tabs simultaneously and fires messages. Because each tab fires before the count updates (race condition), they send 45 messages in the time it takes for the counter to increment. Or, a determined user clears cookies and re-registers to reset the counter.

**Why it happens:**
Simple `SELECT count WHERE date = today` + `INSERT` is not atomic. Concurrent requests read the same count (14) and all decide "under limit", then all increment. Counter-based rate limiting without atomic increments fails under concurrency.

**How to avoid:**
Use a Postgres function with `RETURNING` to atomically increment and check:
```sql
-- Atomic increment, returns new count
UPDATE message_counts
SET count = count + 1
WHERE couple_id = $1 AND date = CURRENT_DATE
RETURNING count;
```
If no row exists yet, INSERT with `ON CONFLICT DO UPDATE`. Call this via a server-side API route only (never client-side). The API route returns 429 if the returned count exceeds 15.

For re-registration abuse: rate limit by device fingerprint or IP at the Supabase Edge Function level (Upstash Redis works well here).

**Warning signs:**
- Users occasionally getting more than 15 messages per day
- `SELECT COUNT(*) FROM chat_messages WHERE couple_id = X AND created_at > today` sometimes returns 16-20 even after the limit should have kicked in
- No atomic transaction around the limit check + message insert

**Phase to address:**
Rate limiting phase, before or alongside freemium tier system. Must be tested with concurrent requests (use Artillery or k6).

---

### Pitfall 5: DEMO_MODE Flag Left Enabled in Middleware — All Auth Bypassed in Production

**What goes wrong:**
The current `src/lib/supabase/middleware.ts` has `const DEMO_MODE = true` hardcoded, which skips all authentication checks. When shipping tier enforcement, rate limiting, and payment gates, every route is wide open to unauthenticated requests. Premium feature gates, rate limits, and tier checks in downstream API routes assume the middleware validated the user — but it never did.

**Why it happens:**
This is a leftover from the dev prototype. It's easy to miss because the app "works" with it on. The risk only materializes in production when auth is actually enforced.

**How to avoid:**
Before any v2.0 feature development starts, flip `DEMO_MODE = false` and implement proper Supabase SSR session validation in the middleware. The actual implementation pattern from Supabase docs:
```typescript
import { createServerClient } from '@supabase/ssr'
// ... validate session, refresh tokens, redirect unauthenticated users
```
This is a prerequisite for all other v2.0 features. No payment gate, rate limit, or tier check is meaningful while DEMO_MODE is active.

**Warning signs:**
- `DEMO_MODE = true` in middleware.ts
- Unauthenticated GET to `/dashboard` returns 200 instead of redirecting to `/login`
- `supabase.auth.getUser()` in API routes returns null but requests still succeed

**Phase to address:**
Auth/onboarding phase — first thing. Gate everything else behind this fix.

---

### Pitfall 6: GoPay Requires Sandbox Testing Before Go-Live, Contact Required

**What goes wrong:**
GoPay's integration requires contacting their technical team (`integrace@gopay.cz`) to verify inline gateway settings before going live. Developers build the full integration against the sandbox, go to flip the switch to production, and discover the go-live requires a manual approval step that takes 1-5 business days. Launch schedule slips.

**Why it happens:**
Unlike Stripe (self-serve go-live), GoPay has a merchant approval process. The API credentials differ between sandbox and production. Documentation mentions this but it's easy to miss when focused on technical integration.

**How to avoid:**
Contact GoPay for production credentials and go-live approval at the start of the payment integration phase, not at the end. Plan for a 5-business-day buffer. Test with Stripe first if timeline is tight — Stripe is fully self-serve.

If Stripe is chosen instead of GoPay: Stripe supports CZK natively and Czech payment methods (BLIK, Sofort). Czech businesses can create a Stripe account and go live immediately without manual approval.

**Warning signs:**
- GoPay credentials are sandbox-only and production merchant ID has not been requested
- Go-live date is set but GoPay production approval hasn't started
- No email thread with `integrace@gopay.cz`

**Phase to address:**
Payment integration phase. Start GoPay approval process on day 1 of the phase, not at the end.

---

### Pitfall 7: Webhook Idempotency Not Implemented — Duplicate Tier Upgrades or Downgrades

**What goes wrong:**
Stripe (and GoPay) guarantee "at-least-once" webhook delivery. The same `customer.subscription.created` or `payment.PAID` event can arrive twice. Without idempotency checks, processing a payment event twice could double-credit an account, send a welcome email twice, or — in the opposite direction — if a cancel event is processed twice in the wrong order, a paying user gets downgraded to free.

**Why it happens:**
Webhook handlers are written to process one event. The "at-least-once" guarantee is a footnote. Under normal conditions, duplicates are rare so the bug never surfaces in testing.

**How to avoid:**
Store processed webhook event IDs in a `webhook_events` table:
```sql
CREATE TABLE webhook_events (
  id TEXT PRIMARY KEY,  -- Stripe event ID or GoPay payment ID
  processed_at TIMESTAMPTZ DEFAULT NOW()
);
```
At the start of each handler: `INSERT INTO webhook_events (id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id`. If nothing is returned, the event was already processed — skip and return 200.

**Warning signs:**
- No `webhook_events` or equivalent idempotency table in the schema
- Webhook handler directly updates `subscription_tier` without checking if event was processed before
- Duplicate welcome emails or tier change notifications reported

**Phase to address:**
Payment integration phase. Implement before first end-to-end payment test.

---

### Pitfall 8: AI Intent Classification Fired on Every Message — Latency and Cost Spike

**What goes wrong:**
Intent classification is added as a secondary Claude API call on every chat message to categorize user intent (e.g., "venue inquiry", "catering question", "budget concern"). With 15 free messages/day across all users, even modest traffic generates a large number of classification calls. Each classification call adds 300-800ms to chat response latency. Users experience noticeably slower responses compared to v0.

**Why it happens:**
Intent classification feels lightweight. In prototypes with 10 users it is. At 100 concurrent active conversations it becomes a cost and latency problem.

**How to avoid:**
Run intent classification asynchronously, decoupled from the chat response path:
1. Chat API route returns the assistant message immediately (as today).
2. A background job (Supabase Edge Function or a queued task) processes the message for intent classification after the response is sent.
3. Demand signals are written to the `demand_signals` table asynchronously.

Users never wait for classification. Latency is unchanged. Cost is isolated to the background job budget.

For the classification itself: use a cheap/fast model (Claude Haiku or a small local classifier) rather than Sonnet. The input is short (one user message), the taxonomy is small (~10 categories), and accuracy requirements are low (this data feeds future vendor pitches, not real-time decisions).

**Warning signs:**
- Classification call is `await`ed before the HTTP response is sent
- Chat response latency increased after adding classification
- Classification uses `claude-sonnet-*` instead of `claude-haiku-*`

**Phase to address:**
AI pipeline phase. Design the async pattern from the start; never block the user-facing response on classification.

---

### Pitfall 9: Demand Signal Data Is Useless Without Structured Schema Designed Upfront

**What goes wrong:**
Demand signals are logged as raw JSON blobs: `{ message: "...", timestamp: "...", coupleId: "..." }`. Six months later, when building the vendor marketplace (v3.0), the data cannot be queried: "How many Prague couples asked about photographers in the last 3 months?" requires full-text search on raw JSON rather than indexed queries on structured fields.

**Why it happens:**
"We'll figure out the schema later" is a common data collection antipattern. Logging raw data feels comprehensive but delivers no analytical value without structure.

**How to avoid:**
Design the demand signal schema now, even though the vendor marketplace is v3.0. Minimum required fields:
```sql
CREATE TABLE demand_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID REFERENCES couples(id),
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  category TEXT NOT NULL,           -- 'fotograf', 'catering', 'kapela', 'misto', etc.
  region TEXT,                      -- 'Praha', 'Brno', null if not mentioned
  budget_range TEXT,                -- 'budget', 'mid', 'premium', null
  raw_message TEXT,                 -- original user message for audit
  confidence NUMERIC(3,2),          -- 0.0-1.0 from classifier
  source TEXT DEFAULT 'chat'        -- 'chat', 'checklist', 'budget'
);
CREATE INDEX ON demand_signals(category, region, detected_at);
```

**Warning signs:**
- Demand signals stored as JSONB without a structured schema
- No `category` or `region` column (or equivalent indexed field)
- No index on the table — full scans required for any analytics query

**Phase to address:**
AI pipeline / demand signal logging phase. Schema design is the first task; logging implementation second.

---

### Pitfall 10: GDPR — Behavioral Data Logging Without Explicit Consent in Czech Republic

**What goes wrong:**
Demand signal logging, chat history storage, engagement metrics, and UTM tracking all process personal data (chat content, user behavior, IP addresses). Under GDPR as applied in Czech Republic (Act No. 110/2019 Coll.), logging AI conversation content for commercial purposes (future vendor targeting) requires either explicit consent or a legitimate interest basis that can withstand scrutiny. Collecting this data silently and using it for vendor outreach without disclosure is a compliance violation.

**Why it happens:**
Developers treat analytics and demand signals as "just logs." GDPR applies to any data that can be linked to an identified individual — and `couple_id` makes chat messages directly linkable.

**How to avoid:**
1. Privacy policy must explicitly disclose: chat message analysis for service improvement and (future) vendor recommendations.
2. For demand signals: legitimate interest basis is defensible if data is used to improve the product, but requires a Legitimate Interest Assessment (LIA). If data will be sold or shared with vendors, explicit consent is required.
3. Engagement metrics: use aggregated/anonymized metrics where possible. Per-user engagement tracking requires disclosure.
4. Chat history retention: define and enforce a retention period (e.g., 12 months) with automated deletion.
5. On onboarding or in settings: make it clear that AI conversations are stored and used to improve recommendations.

**Warning signs:**
- Privacy policy does not mention AI conversation analysis
- No data retention policy for chat messages or demand signals
- Demand signal logging starts silently without any user-facing disclosure
- UTM tracking fires on landing page without cookie consent banner

**Phase to address:**
Freemium/onboarding phase. Legal copy and consent flows must ship before demand signal logging or engagement tracking goes live.

---

### Pitfall 11: Free Tier Limits Enforced Client-Side or Via UX Only

**What goes wrong:**
The "15 messages/day" limit and the "svatební web is premium" gate are enforced by hiding UI elements or showing upgrade prompts in the frontend. A motivated user inspects the API, calls `/api/chat` directly with their auth token, and bypasses the limit entirely. The svatební web publish endpoint is called directly, bypassing the "premium only" modal.

**Why it happens:**
Frontend enforcement is fast to implement and sufficient for honest users. It feels complete during development. The API is assumed to be "internal."

**How to avoid:**
Every tier limit and gate must be enforced in the API route or Supabase RLS:
- `/api/chat` route: check message count server-side before calling Claude. Return 429 with `{ error: "Denní limit dosažen", upgradeUrl: "/pricing" }`.
- `/api/wedding-site/publish` route: check `subscription_tier === 'premium'` before publishing. RLS policy also blocks direct Supabase mutation.
- Frontend enforcement is UX, not security. Both layers must exist.

**Warning signs:**
- The only place `subscription_tier` is checked before a feature is used is in a React component
- API routes call Claude or mutate premium data without verifying tier
- No 402 or 429 responses from any API endpoint during load testing of free user paths

**Phase to address:**
Freemium tier system phase. API-level enforcement must be in place before the premium UX is built.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| DEMO_MODE flag left on | Auth skipped during dev | All security features inert in production | Dev only, must flip before any v2.0 feature is tested |
| Storing webhook events without idempotency key | Simpler handler | Double-processing events on retry causes data corruption | Never |
| Client-side tier enforcement only | Faster to build | Free users bypass limits via direct API calls | Never for security-relevant limits |
| Intent classification blocking chat response | Simpler code path | Adds 300-800ms perceived latency | Prototype only |
| Raw JSON demand signals | Flexible at log time | Unqueryable for v3.0 vendor analytics | Never — schema first |
| Skip GDPR disclosure "until launch" | Unblocks feature dev | Legal liability; Czech DPA can fine before launch | Never |
| Rate limit by session only, not user ID | Faster to implement | Users bypass by opening new session | Never for paid tier limits |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Stripe Checkout | Relying on webhook for first status update | Sync-fetch session status from Stripe API on `?success=true` redirect; use webhook as backup |
| GoPay | Starting implementation, testing sandbox, then contacting GoPay for production access | Contact `integrace@gopay.cz` on day 1 for production merchant account; 5-day approval window |
| Supabase Google OAuth | Adding Google OAuth without auditing existing users for unverified emails | Run `SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL` first; handle existing unverified accounts |
| Supabase RLS for tiers | Writing RLS as `FOR ALL USING (auth.uid() = couple_id)` without tier checks | Add tier check to premium-data policies; `subscription_tier` must be queryable within RLS context |
| Claude API for classification | Using Sonnet for intent classification | Use Haiku model for classification (same task, 5x cheaper, 2x faster) |
| Supabase rate limiting | Using `SELECT COUNT(*)` then `INSERT` for rate limits | Use atomic `UPDATE ... RETURNING count` in a single SQL statement to prevent race conditions |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Intent classification in chat response path | Chat responses 300-800ms slower than v0 | Move classification to async background job | Immediately at any traffic level |
| Supabase RLS with JOIN to `couples.subscription_tier` on every query | Slow queries on all premium-gated tables | Add `subscription_tier` to JWT claims via Supabase Auth hook to avoid per-row JOIN | 1000+ rows in chat_messages |
| Eager subscription status check on every page load | Supabase queried on every navigation | Cache `subscription_tier` in session/cookie, refresh only on payment events | High-frequency navigation patterns |
| Demand signal table without indexes | Analytics queries for vendor pitch prep run full scans | Index `(category, region, detected_at)` from creation | 10,000+ demand signal rows |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Stripe webhook endpoint without signature verification | Malicious actor sends fake "payment succeeded" events, upgrades users without payment | Always verify `stripe.webhooks.constructEvent(body, sig, secret)` before processing |
| GoPay payment verification without checking `state: PAID` | Redirect URL spoofing — attacker constructs a success URL without actual payment | Always verify payment state via GoPay API GET, never trust URL parameters alone |
| Supabase anon key exposed + RLS not enforcing tiers | Direct database calls from browser bypass all middleware tier checks | RLS is mandatory for any premium data gate; anon key is always public |
| `service_role` key used in client components | Bypasses all RLS, grants full database access to browser | `service_role` key only in server-side code (API routes, Edge Functions) |
| User session containing `subscription_tier` without server validation | Tier claim in cookie can be tampered with | Always re-validate tier from DB in API routes for premium operations |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing generic "Upgrade" CTA without context | Users don't know what they're upgrading to gain | Show specific blocked feature: "Zveřejni svůj svatební web — přejdi na Premium" |
| Blocking free users from seeing the svatební web at all | No motivation to upgrade; users churn | Show full preview in free tier, blur/lock the "Zveřejnit" action specifically |
| Asking for payment before onboarding is complete | Friction before value is demonstrated | Free tier first, upgrade prompt after user has populated checklist and budget |
| OAuth button with no indication of what data is accessed | Czech users are privacy-aware; vague OAuth prompts reduce trust | Add copy: "Použijeme pouze tvůj e-mail a jméno. Nic jiného." |
| Rate limit message with no upgrade path | Users hit 15-message limit and have nowhere to go | Rate limit response includes direct link to pricing page; "Chceš pokračovat? Odemkni Premium." |
| Onboarding flow reset when Google OAuth is added | Existing email users who link Google lose their onboarding context | Preserve onboarding data tied to `couple_id`, which persists through identity linking |

## "Looks Done But Isn't" Checklist

- [ ] **DEMO_MODE disabled:** `src/lib/supabase/middleware.ts` has `DEMO_MODE = false` and real session validation — verify unauthenticated GET to `/dashboard` returns 302 to `/login`
- [ ] **Webhook idempotency:** `webhook_events` table exists; all handlers check for duplicate event IDs before processing
- [ ] **Webhook race condition:** Success redirect page syncs payment status directly from Stripe/GoPay API, not waiting for webhook
- [ ] **RLS tier enforcement:** Premium-gated Supabase tables have RLS policies that check `subscription_tier`, not just `auth.uid() = couple_id`
- [ ] **API-level rate limit:** `/api/chat` returns 429 with atomic counter check for free users at 15 messages; not just UI-gated
- [ ] **Google OAuth email audit:** All existing `auth.users` have `email_confirmed_at IS NOT NULL` before OAuth is enabled in production
- [ ] **GoPay production approval:** Merchant account approved or Stripe chosen as alternative — not sandbox-only at launch
- [ ] **Demand signal schema:** `demand_signals` table has `category`, `region`, `budget_range`, `confidence` columns and indexes — not raw JSON
- [ ] **GDPR disclosure:** Privacy policy updated to disclose chat analysis, demand signal logging, engagement metrics; cookie consent for UTM
- [ ] **Classification async:** Intent classification does NOT add to chat response latency — verify with timing logs that response returns before classification runs
- [ ] **Tier limits server-enforced:** Direct API call from curl with a free-tier auth token cannot exceed rate limits or access premium features

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Duplicate accounts from OAuth linking failure | HIGH | Identify split couples rows; merge data manually; deduplicate auth.identities; notify affected users |
| Webhook event processed twice (subscription state corrupted) | MEDIUM | Add idempotency table retroactively; write migration to detect and fix duplicate state changes; implement correct handler |
| Rate limit race condition — users sent 30+ messages | LOW | Add atomic SQL update retroactively; audit past message counts for anomalies |
| GoPay production approval not started — launch blocked | HIGH | Switch to Stripe (self-serve, supports CZK, Czech cards); GoPay can be added later |
| Demand signals logged as raw JSON — unqueryable | MEDIUM | Write migration to parse and normalize existing JSON into structured columns; add indexes |
| GDPR complaint filed before consent flow added | HIGH | Add consent flow immediately; conduct Data Protection Impact Assessment; document legitimate interest bases |
| DEMO_MODE in production — auth bypassed | CRITICAL | Hotfix: flip flag, deploy immediately; audit logs for unauthorized access during exposure window |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| DEMO_MODE auth bypass | Phase: Auth/onboarding (first) | Unauthenticated request to `/dashboard` returns 302; curl test with no cookie |
| RLS not enforcing tiers | Phase: Freemium tier system | Direct supabase-js call from browser with free-tier token cannot publish wedding site |
| API-level rate limit missing | Phase: Freemium tier system | curl POST to `/api/chat` 16 times with free-tier token — 16th returns 429 |
| Google OAuth duplicate accounts | Phase: Google OAuth | Audit `auth.users` before enabling; test with existing email/password user linking Google |
| Webhook race condition | Phase: Payment integration | Manual test: complete checkout, immediately load success page before webhook arrives |
| Webhook idempotency missing | Phase: Payment integration | Replay same Stripe event twice in CLI; verify `subscription_tier` not changed twice |
| GoPay approval delay | Phase: Payment integration (start of) | Merchant account email sent to GoPay on phase day 1 |
| Classification blocking response | Phase: AI pipeline | Timing log shows chat response returns before classification completes |
| Demand signal schema underdesigned | Phase: AI pipeline (schema first) | Query "top vendor categories in Praha last 30 days" returns indexed result under 100ms |
| GDPR — behavioral logging without consent | Phase: Freemium/onboarding | Privacy policy reviewed; cookie consent fires before UTM tracking; demand logging disclosed |
| Client-side only tier enforcement | Phase: Freemium tier system | curl with free-tier bearer token returns 402 from premium endpoints |

## Sources

- Stripe webhook race condition: https://www.pedroalonso.net/blog/stripe-webhooks-solving-race-conditions/
- Stripe SaaS freemium billing: https://www.indiehackers.com/post/how-to-build-a-saas-freemium-billing-flow-with-stripe-billing-805a6a63cd
- Stripe webhooks with subscriptions: https://docs.stripe.com/billing/subscriptions/webhooks
- Stripe Czech Republic: https://stripe.com/en-de/resources/more/payments-in-czech-republic
- GoPay technical docs: https://doc.gopay.com/
- Supabase identity linking: https://supabase.com/docs/guides/auth/auth-identity-linking
- Supabase RLS performance: https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv
- Supabase Google OAuth: https://supabase.com/docs/guides/auth/social-login/auth-google
- GDPR Czech Republic: https://www.termsfeed.com/blog/czech-republic-gdpr/
- Czech Cookie Law: https://secureprivacy.ai/blog/czech-cookie-law
- Intent classification pitfalls: https://www.vellum.ai/blog/how-to-build-intent-detection-for-your-chatbot
- AI chatbot implementation challenges: https://www.peerbits.com/blog/ai-chatbot-implementation-challenges-and-solution.html
- Direct codebase analysis: `src/middleware.ts`, `src/lib/supabase/middleware.ts`, `src/app/api/chat/route.ts`, `src/lib/types.ts`

---
*Pitfalls research for: Svoji v2.0 — freemium tiers, payments, Google OAuth, AI pipeline, demand signals*
*Researched: 2026-03-01*
