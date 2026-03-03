# Phase 9: Data Collection - Research

**Researched:** 2026-03-03
**Domain:** Server-side event tracking, UTM attribution, Supabase schema extension
**Confidence:** HIGH

## Summary

Phase 9 adds structured data collection on top of the already-working AI pipeline from Phase 8. The three requirements are tightly scoped: extend the existing demand signal logger to cover budget_add intents (DATA-01), add a new engagement_events table logging 4 specific user actions (DATA-02), and capture UTM parameters from the landing page through the full auth flow (DATA-03). An admin JSON endpoint ties all three together for quick stats checks.

The project already has all the patterns needed: fire-and-forget async DB inserts (demand-logger.ts, rate-limit.ts), Supabase RLS on every table (migration 005), and a working API route structure (src/app/api/). This phase is almost entirely additive -- new migration, new utility modules, new API route -- with minimal changes to existing files.

**Primary recommendation:** Add migration 007 with engagement_events table and utm_attribution column on couples, extend isDemandSignal() and logDemandSignal() for budget_add, wire engagement logging as fire-and-forget at the 4 integration points, and capture UTM params client-side in localStorage before auth, writing to DB at account creation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Track exactly 4 actions: message_sent, checklist_item_completed, onboarding_step_completed, upgrade_cta_clicked
- New `engagement_events` Supabase table (one row per event, not aggregated)
- Server-side only -- all tracking goes through API routes, no client-side analytics
- Fire-and-forget pattern (consistent with demand signal logging)
- Extend demand signal logging to also trigger on `budget_add` intents (not just `vendor_search`)
- Add `source_intent` column to `demand_signals` table to distinguish signal origin (vendor_search vs budget_add)
- Existing schema (category, region, budget_hint, urgency, raw_message) is sufficient otherwise
- Simple API endpoint returning JSON aggregates (no admin UI)
- Secured with secret API key in X-Admin-Key header (env var)
- Returns: total counts (signals, events, UTM users), top 5 demand categories, daily breakdown for last 30 days
- Single endpoint covering all three data types

### Claude's Discretion
- UTM implementation details (how to persist through auth/onboarding flow)
- Engagement event metadata schema (what extra fields per event type)
- Admin endpoint route structure and response shape
- Database indexing strategy for engagement_events table

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DATA-01 | Demand signal logging from AI conversations (structured: category, region, budget, urgency) | Extend isDemandSignal() + logDemandSignal() to include budget_add intent; add source_intent column to demand_signals table |
| DATA-02 | Engagement metrics tracking (messages, sessions, checklist completion, days until wedding) | New engagement_events table; fire-and-forget logging at 4 integration points: chat route, checklist action, onboarding finish, CTA click API |
| DATA-03 | UTM parameter tracking on landing page | Client-side localStorage capture at landing page, pass through onboarding URL params, write to couples table at account creation |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | already installed | DB inserts, RLS | All existing tables use this pattern |
| Next.js API Routes | 15 (already installed) | Server-side event endpoints | Matches existing api/chat/route.ts pattern |
| TypeScript | already installed | Type-safe event interfaces | Project-wide standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| localStorage (browser) | native | Persist UTM params before auth | Client component on landing page only |
| next/headers cookies | Next.js 15 | Alternative UTM persistence | If localStorage proves unreliable across redirects |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| localStorage for UTM | Cookie-based UTM storage | Cookies survive server redirects better but require more setup; localStorage is simpler given client-side onboarding flow |
| Single source_intent column | Separate budget_signals table | Column is simpler, sufficient for v2.0 -- planner decision already locked |

**Installation:** No new packages needed. All dependencies already present.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── ai/
│   │   ├── demand-logger.ts       # MODIFY: add source_intent param
│   │   └── intent-classifier.ts   # MODIFY: isDemandSignal() includes budget_add
│   └── engagement-logger.ts       # NEW: logEngagementEvent() fire-and-forget
├── app/
│   └── api/
│       ├── chat/route.ts          # MODIFY: wire message_sent event + budget_add demand signal
│       ├── track/route.ts         # NEW: server endpoint for client-triggered events (CTA click)
│       └── admin/stats/route.ts   # NEW: admin JSON endpoint
supabase/
└── migrations/
    └── 007_data_collection.sql    # NEW: engagement_events, UTM column, demand_signals alteration
```

### Pattern 1: Fire-and-Forget Engagement Logging
**What:** Async log call wrapped in void/catch, never awaited on the response path
**When to use:** All 4 engagement event types -- never block user response
**Example:**
```typescript
// Source: established in src/app/api/chat/route.ts (demand signal pattern)
// Log engagement event -- fire-and-forget, never blocks response
logEngagementEvent(supabase, coupleId, 'message_sent', {
  message_length: message.length,
}).catch((error) => {
  console.error('Engagement logging failed:', error);
});
```

### Pattern 2: UTM Capture + Passthrough
**What:** Read UTM params in landing page client component, store in localStorage, forward through onboarding URL params to register page, write to DB at account creation
**When to use:** DATA-03 only
**Example:**
```typescript
// In landing page client component (e.g., Hero or LandingNav)
// Runs once on landing page load
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const utm = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
  };
  if (utm.utm_source) {
    localStorage.setItem('svoji_utm', JSON.stringify(utm));
  }
}, []);

// In onboarding page finish() function -- read from localStorage
const utmRaw = localStorage.getItem('svoji_utm');
const utm = utmRaw ? JSON.parse(utmRaw) : {};

// Forward through existing URL params pattern (matches Phase 7 pattern)
const params = new URLSearchParams({
  ...existingParams,
  utm_source: utm.utm_source || '',
  utm_medium: utm.utm_medium || '',
  utm_campaign: utm.utm_campaign || '',
});
router.push(`/register?${params.toString()}`);
```

```typescript
// In register/page.tsx -- read from searchParams and include in upsert
const utmData = {
  utm_source: searchParams.get('utm_source') || null,
  utm_medium: searchParams.get('utm_medium') || null,
  utm_campaign: searchParams.get('utm_campaign') || null,
};
// Add to couples upsert alongside existing onboardingData
await supabase.from('couples').upsert({
  id: signUpData.user.id,
  ...onboardingData,
  ...utmData,
  onboarding_completed: true,
});
```

### Pattern 3: Demand Signal Extension
**What:** Extend isDemandSignal() to return true for budget_add, pass source_intent to logDemandSignal()
**When to use:** DATA-01
**Example:**
```typescript
// intent-classifier.ts change
export function isDemandSignal(intent: string): boolean {
  return intent === 'vendor_search' || intent === 'budget_add';
}

// demand-logger.ts change -- add source_intent param
export async function logDemandSignal(
  supabase: SupabaseClient,
  coupleId: string,
  signal: DemandSignal,
  rawMessage: string,
  sourceIntent: 'vendor_search' | 'budget_add' = 'vendor_search'
): Promise<void> {
  await supabase.from('demand_signals').insert({
    ...signal fields...,
    source_intent: sourceIntent,
  });
}

// chat/route.ts call site -- pass intent as sourceIntent
if (isDemandSignal(intentResult.intent) && intentResult.confidence > 0.6) {
  const demandSignal = extractDemandSignal(intentResult.params);
  if (demandSignal) {
    logDemandSignal(supabase, coupleId, demandSignal, message, intentResult.intent as 'vendor_search' | 'budget_add').catch(...);
  }
}
```

### Pattern 4: Admin Endpoint Security
**What:** Check X-Admin-Key header against env var ADMIN_API_KEY before returning any data
**When to use:** admin/stats route only
**Example:**
```typescript
// src/app/api/admin/stats/route.ts
export async function GET(request: NextRequest) {
  const adminKey = request.headers.get('X-Admin-Key');
  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... query aggregates
}
```

### Anti-Patterns to Avoid
- **Awaiting engagement logs:** Never await logEngagementEvent() on the response path -- same rule as demand signals
- **Client-side direct DB writes:** No Supabase inserts from browser for tracking -- everything goes through API routes (locked decision)
- **Blocking CTA clicks:** The /api/track endpoint must return 200 immediately before doing DB work
- **Storing raw UTM in engagement_events:** UTM belongs in couples table, not repeated per event

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UTM persistence across redirects | Custom cookie/session scheme | localStorage + URL param forwarding (established Phase 7 pattern) | Matches existing btoa(JSON.stringify()) passthrough for onboarding data |
| Aggregate queries | Application-side aggregation | Postgres COUNT/GROUP BY in single query | DB is the right place for aggregates |
| Admin auth | JWT-based admin auth | Static secret header (locked decision) | Simpler, callable from Telegram bot without OAuth |

**Key insight:** The entire tracking stack is modeled on the fire-and-forget demand signal pattern already in production. No new architectural concepts needed -- just new tables and new call sites.

## Common Pitfalls

### Pitfall 1: OAuth UTM Loss
**What goes wrong:** UTM params captured in localStorage get lost during Google OAuth redirect because the OAuth flow redirects the browser away from the origin, potentially clearing localStorage depending on browser/security settings.
**Why it happens:** Google OAuth involves a full browser redirect chain: /register -> Google -> /auth/callback. localStorage survives cross-origin redirects on the same origin but the btoa onboarding param in the redirectTo URL is the actual persistence mechanism.
**How to avoid:** Store UTM inside the onboarding data that gets btoa-encoded into the OAuth redirectTo URL. The existing pattern in register/page.tsx already passes onboarding data this way -- UTM fields just need to be added to that object.
**Warning signs:** UTM shows null in couples table for OAuth users but not email users.

```typescript
// register/page.tsx -- include UTM in the btoa blob for OAuth
const callbackUrl = new URL('/auth/callback', window.location.origin);
if (hasOnboardingData) {
  callbackUrl.searchParams.set('onboarding', btoa(JSON.stringify({
    ...onboardingData,
    utm_source: utm.utm_source || null,
    utm_medium: utm.utm_medium || null,
    utm_campaign: utm.utm_campaign || null,
  })));
}
```

Then in auth/callback/route.ts, extract UTM from parsed onboardingData and include in the upsert.

### Pitfall 2: budget_add Demand Signal Missing Category
**What goes wrong:** budget_add intent params have `name` and `amount` but not necessarily `category`. extractDemandSignal() requires `category` to return non-null.
**Why it happens:** The intent classifier for budget_add extracts `name` (e.g., "catering"), not `category`. The category field in the classifier is only guaranteed for vendor_search.
**How to avoid:** When extracting demand signal from budget_add, map `params.name` to `category` if `params.category` is absent.
**Warning signs:** logDemandSignal called but extractDemandSignal returns null for all budget_add intents.

```typescript
export function extractDemandSignal(
  params: Record<string, any>,
  sourceIntent?: string
): DemandSignal | null {
  const category = params.category || (sourceIntent === 'budget_add' ? params.name : null);
  if (!category) return null;
  return { category, region: params.region, budget_hint: params.amount || params.budget_hint, urgency: ... };
}
```

### Pitfall 3: engagement_events RLS Blocks Server Writes
**What goes wrong:** Supabase RLS policy using `auth.uid()` blocks server-side inserts when the supabase client is server-side (service role vs anon key).
**Why it happens:** The server supabase client uses the anon key with the user's JWT. Fire-and-forget inserts happen after the response is sent, so if the user JWT has expired by then, the insert silently fails.
**How to avoid:** Design the RLS insert policy with `with check (true)` like the rate limits table, or use `couple_id = auth.uid()` and ensure inserts happen within the request lifecycle (before response). Since fire-and-forget runs during the same request handling, the JWT should still be valid.
**Warning signs:** engagement_events inserts silently fail (check error logs).

### Pitfall 4: Admin Endpoint Leaks Data Without Key Check
**What goes wrong:** Missing or incorrect header check means data is publicly accessible.
**Why it happens:** Easy to forget to check early return on missing key.
**How to avoid:** Check header as FIRST thing in the route handler, before any DB queries.

### Pitfall 5: Checklist_item_completed Event -- Server vs Client
**What goes wrong:** Checklist completion may happen via a client-side toggle that calls a server API, or directly via Supabase client. If it's a direct Supabase client update, there's no server route to instrument.
**Why it happens:** Need to verify whether checklist toggles go through an API route or direct Supabase from the browser.
**How to avoid:** Check ChecklistView component. If direct Supabase: add a thin API route `/api/track` that the client calls alongside the Supabase write. If already through a route: add logging there.
**Warning signs:** No server-side integration point for checklist_item_completed.

## Code Examples

### Migration 007 Schema
```sql
-- 007_data_collection.sql

-- 1. Add source_intent to demand_signals
ALTER TABLE demand_signals
  ADD COLUMN IF NOT EXISTS source_intent TEXT
    CHECK (source_intent IN ('vendor_search', 'budget_add'))
    DEFAULT 'vendor_search';

-- 2. Add UTM columns to couples
ALTER TABLE couples
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- 3. New engagement_events table
CREATE TABLE IF NOT EXISTS engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'message_sent',
    'checklist_item_completed',
    'onboarding_step_completed',
    'upgrade_cta_clicked'
  )),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_engagement_couple_id ON engagement_events(couple_id);
CREATE INDEX IF NOT EXISTS idx_engagement_event_type ON engagement_events(event_type);
CREATE INDEX IF NOT EXISTS idx_engagement_created_at ON engagement_events(created_at DESC);

-- RLS
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
  ON engagement_events FOR SELECT
  USING (auth.uid() = couple_id);

CREATE POLICY "System can insert events"
  ON engagement_events FOR INSERT
  WITH CHECK (true);
```

### Engagement Logger Module
```typescript
// src/lib/engagement-logger.ts
import { SupabaseClient } from '@supabase/supabase-js';

export type EngagementEventType =
  | 'message_sent'
  | 'checklist_item_completed'
  | 'onboarding_step_completed'
  | 'upgrade_cta_clicked';

export async function logEngagementEvent(
  supabase: SupabaseClient,
  coupleId: string,
  eventType: EngagementEventType,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const { error } = await supabase.from('engagement_events').insert({
      couple_id: coupleId,
      event_type: eventType,
      metadata: metadata || null,
    });
    if (error) {
      console.error('Failed to log engagement event:', error);
    }
  } catch (error) {
    console.error('Engagement event logging error:', error);
    // Never throw -- fire-and-forget
  }
}
```

### Admin Stats Query Pattern
```typescript
// Parallel queries for admin endpoint
const [signalsResult, eventsResult, utmResult, topCategoriesResult, dailyResult] =
  await Promise.all([
    supabase.from('demand_signals').select('id', { count: 'exact', head: true }),
    supabase.from('engagement_events').select('id', { count: 'exact', head: true }),
    supabase.from('couples').select('id', { count: 'exact', head: true }).not('utm_source', 'is', null),
    supabase.rpc('get_top_demand_categories', { limit_n: 5 }), // or raw SQL via .rpc()
    // daily breakdown -- last 30 days
    supabase.rpc('get_daily_event_counts', { days_back: 30 }),
  ]);
```

**Note:** For the aggregate queries, use Postgres functions (via supabase.rpc()) or raw SQL via the service client, since the admin endpoint uses a static key and is not bound by user RLS. Alternatively, use the service role key (SUPABASE_SERVICE_ROLE_KEY) in the admin endpoint to bypass RLS entirely.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side analytics (GA, Mixpanel) | Server-side API route logging | Decision in CONTEXT.md | Full control, no third-party deps, GDPR clean |
| Aggregated counters per session | One row per event (normalized) | Locked decision | Queryable by type, time, user |

## Open Questions

1. **ChecklistView action path (for checklist_item_completed)**
   - What we know: checklist_items are toggled in ChecklistView component; likely direct Supabase client update
   - What's unclear: whether there is already an API route intermediary, or if it's a direct browser -> Supabase write
   - Recommendation: Check ChecklistView before writing the plan. If direct Supabase, create `/api/track` endpoint that the client calls alongside (or replaces) the direct write, matching the "server-side only" constraint.

2. **Service role key for admin endpoint vs anon key**
   - What we know: RLS blocks reads on demand_signals for non-owners. Admin needs cross-user aggregate reads.
   - What's unclear: Whether SUPABASE_SERVICE_ROLE_KEY is already in env or needs to be documented
   - Recommendation: Admin endpoint should use service role key (bypasses RLS for aggregate queries). Plan should include confirming this env var exists.

3. **onboarding_step_completed -- which step?**
   - What we know: 5 onboarding steps exist; "step completed" could mean each step individually or just the final finish()
   - What's unclear: Whether to log once at finish() or per step advancement
   - Recommendation: Log once at finish() (the onboarding form submits to /register via router.push). A thin API call from the register page after successful couples upsert is the cleanest integration point.

## Validation Architecture

Config does not set nyquist_validation to false, so this section is included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected (no jest.config, vitest.config, or test directories found) |
| Config file | None -- Wave 0 must create if tests are added |
| Quick run command | N/A until framework installed |
| Full suite command | N/A until framework installed |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | isDemandSignal() returns true for budget_add | unit | N/A -- no test framework | Wave 0 gap |
| DATA-01 | extractDemandSignal() maps params.name to category for budget_add | unit | N/A | Wave 0 gap |
| DATA-01 | logDemandSignal() inserts source_intent column | integration (Supabase) | manual-only (no test infra) | Wave 0 gap |
| DATA-02 | logEngagementEvent() inserts correct event_type | unit/integration | N/A | Wave 0 gap |
| DATA-02 | message_sent fires after chat response | integration | manual smoke test | N/A |
| DATA-03 | UTM params stored in couples table after registration | integration | manual smoke test | N/A |
| ALL | Admin endpoint returns 401 without key | unit | N/A | Wave 0 gap |
| ALL | Admin endpoint returns aggregates with valid key | integration | manual | N/A |

### Sampling Rate
- **Per task commit:** Manual smoke test (send a message, check demand_signals and engagement_events rows in Supabase dashboard)
- **Per wave merge:** Full manual walkthrough: UTM landing -> onboarding -> register -> check couples row has utm_source
- **Phase gate:** All 3 data types queryable and non-empty before /gsd:verify-work

### Wave 0 Gaps
Given no existing test framework, formal automated tests are out of scope for this phase. Validation is manual smoke testing via Supabase SQL editor and the admin endpoint. If the planner adds automated tests, they would need:

- [ ] Install vitest or jest: `npm install -D vitest` or `npm install -D jest @types/jest ts-jest`
- [ ] `src/lib/__tests__/engagement-logger.test.ts` -- covers DATA-02 unit logic
- [ ] `src/lib/ai/__tests__/intent-classifier.test.ts` -- covers DATA-01 isDemandSignal() extension
- [ ] `src/lib/ai/__tests__/demand-logger.test.ts` -- covers DATA-01 extractDemandSignal() mapping

*(If no test framework is added in Wave 0: "None -- validation is manual smoke testing as established by Phase 8 UAT pattern")*

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `src/lib/ai/demand-logger.ts` -- fire-and-forget pattern verified
- Direct code inspection: `src/lib/ai/intent-classifier.ts` -- isDemandSignal() and isDemandSignal() confirmed
- Direct code inspection: `src/app/api/chat/route.ts` -- integration point for message_sent and demand signal call sites
- Direct code inspection: `src/app/(auth)/onboarding/page.tsx` -- UTM capture entry point, finish() passthrough pattern
- Direct code inspection: `src/app/(auth)/register/page.tsx` -- onboardingData upsert pattern, OAuth btoa passthrough
- Direct code inspection: `src/app/auth/callback/route.ts` -- OAuth callback upsert with onboarding data
- Direct code inspection: `supabase/migrations/005_demand_signals.sql` -- existing schema and RLS pattern
- Direct code inspection: `supabase/migrations/006_rate_limits.sql` -- `WITH CHECK (true)` RLS insert pattern
- Direct code inspection: `.planning/phases/09-data-collection/09-CONTEXT.md` -- all locked decisions

### Secondary (MEDIUM confidence)
- Supabase RLS documentation pattern: service role key bypasses RLS for admin reads (widely established)
- localStorage persistence through same-origin navigation: standard browser behavior, survives Next.js router.push() calls

### Tertiary (LOW confidence)
- ChecklistView action path (direct Supabase vs API route): not inspected, flagged as Open Question 1

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed, patterns already in use
- Architecture: HIGH -- all patterns derived from existing codebase, not from external sources
- Pitfalls: HIGH for items 1-4 (derived from code reading), MEDIUM for item 5 (ChecklistView not inspected)
- UTM persistence: MEDIUM -- localStorage approach is standard but OAuth redirect edge case needs verification during implementation

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (stable tech stack, no fast-moving dependencies)
