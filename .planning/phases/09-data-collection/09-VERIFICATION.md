---
phase: 09-data-collection
verified: 2026-03-03T00:00:00Z
status: passed
score: 12/12 must-haves verified
re_verification: false
---

# Phase 9: Data Collection Verification Report

**Phase Goal:** Demand signals, engagement events, and UTM attribution are captured from the first real user session
**Verified:** 2026-03-03
**Status:** passed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | isDemandSignal() returns true for both vendor_search and budget_add | VERIFIED | Line 224 of intent-classifier.ts: `return intent === 'vendor_search' \|\| intent === 'budget_add'` |
| 2 | logDemandSignal() inserts a source_intent column value distinguishing signal origin | VERIFIED | demand-logger.ts line 36: `source_intent: sourceIntent` in insert |
| 3 | extractDemandSignal() maps params.name to category when sourceIntent is budget_add | VERIFIED | demand-logger.ts line 57: `params.category \|\| (sourceIntent === 'budget_add' ? params.name : null)` |
| 4 | logEngagementEvent() inserts a row into engagement_events with correct event_type and metadata | VERIFIED | engagement-logger.ts lines 25-29: full Supabase insert with all fields |
| 5 | engagement_events table exists with RLS enabled and correct CHECK constraint on event_type | VERIFIED | 007_data_collection.sql: CREATE TABLE with 4-value CHECK + ENABLE ROW LEVEL SECURITY |
| 6 | demand_signals table has source_intent column with CHECK constraint | VERIFIED | 007_data_collection.sql: ALTER TABLE demand_signals ADD COLUMN source_intent CHECK (IN ('vendor_search', 'budget_add')) |
| 7 | Every chat message produces a message_sent engagement event in the database | VERIFIED | chat/route.ts lines 238-243: logEngagementEvent called fire-and-forget after chat_messages insert |
| 8 | budget_add intents produce demand signals with source_intent='budget_add' and category mapped from params.name | VERIFIED | chat/route.ts lines 245-254: sourceIntent cast + extractDemandSignal(..., sourceIntent) + logDemandSignal(..., sourceIntent) |
| 9 | Checklist toggle calls /api/track to log checklist_item_completed event | VERIFIED | ChecklistView.tsx lines 74-90: fetch('/api/track') with eventType: 'checklist_item_completed' on completion |
| 10 | Admin endpoint returns 401 without X-Admin-Key header | VERIFIED | admin/stats/route.ts lines 6-8: auth check first, returns 401 on mismatch |
| 11 | Admin endpoint returns aggregated stats with valid key | VERIFIED | admin/stats/route.ts: parallel queries return totals, top_categories, daily_breakdown |
| 12 | UTM params survive full flow: landing -> onboarding -> register -> couples table | VERIFIED | Hero.tsx captures to localStorage; onboarding finish() reads and appends to URL params; register/page.tsx includes utm_* in onboardingData; auth/callback/route.ts writes utm_* to couples upsert |

**Score:** 12/12 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/007_data_collection.sql` | Schema: engagement_events table, demand_signals source_intent, couples UTM columns | VERIFIED | All 3 schema changes present, 3 indexes, RLS with SELECT + INSERT policies |
| `src/lib/engagement-logger.ts` | Fire-and-forget engagement event logging | VERIFIED | Exports logEngagementEvent and EngagementEventType, never throws |
| `src/lib/ai/demand-logger.ts` | Extended demand signal logging with source_intent | VERIFIED | logDemandSignal has sourceIntent param with default, extractDemandSignal maps params.name for budget_add |
| `src/lib/ai/intent-classifier.ts` | isDemandSignal() extended for budget_add | VERIFIED | Line 224 handles both intents |
| `src/app/api/chat/route.ts` | message_sent engagement logging + budget_add demand signal wiring | VERIFIED | logEngagementEvent imported and called; demand signal block uses 0.6 threshold with sourceIntent |
| `src/app/api/track/route.ts` | Server endpoint for client-triggered events | VERIFIED | POST handler with auth check, 3 allowed event types, fire-and-forget logging |
| `src/app/api/admin/stats/route.ts` | Admin-only JSON aggregates endpoint | VERIFIED | X-Admin-Key auth, service role Supabase client, parallel queries for totals + top 5 categories + 30-day daily breakdown |
| `src/components/dashboard/ChecklistView.tsx` | Calls /api/track on checklist item toggle | VERIFIED | fetch('/api/track') called in toggleItem when completed=true, with item metadata |
| `src/components/landing/Hero.tsx` | UTM capture on landing page load | VERIFIED | useEffect in Hero() captures utm_source from window.location.search and stores to localStorage |
| `src/app/(auth)/onboarding/page.tsx` | UTM passthrough from localStorage to register URL params | VERIFIED | finish() reads svoji_utm from localStorage and appends utm_source, utm_medium, utm_campaign to URLSearchParams |
| `src/app/(auth)/register/page.tsx` | UTM data included in couples upsert for both email and OAuth paths | VERIFIED | onboardingData includes utm_* fields; email path uses spread (...onboardingData); OAuth path uses btoa(JSON.stringify(onboardingData)) |
| `src/app/auth/callback/route.ts` | UTM data extracted from onboarding blob for OAuth upsert | VERIFIED | Explicit utm_source, utm_medium, utm_campaign in couples upsert from decoded onboardingData |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| intent-classifier.ts | demand-logger.ts | isDemandSignal() gates logDemandSignal() calls | WIRED | chat/route.ts: isDemandSignal check at line 246, sourceIntent passed to both extract and log |
| engagement-logger.ts | supabase engagement_events | inserts into engagement_events table | WIRED | engagement-logger.ts line 25: supabase.from('engagement_events').insert(...) |
| chat/route.ts | engagement-logger.ts | fire-and-forget logEngagementEvent call | WIRED | Lines 238-243: logEngagementEvent(supabase, coupleId, 'message_sent', {...}).catch(...) |
| chat/route.ts | demand-logger.ts | logDemandSignal with intentResult.intent as sourceIntent | WIRED | Lines 245-254: sourceIntent cast from intentResult.intent, passed to both functions |
| ChecklistView.tsx | /api/track endpoint | fetch POST to /api/track after checklist toggle | WIRED | Lines 76-90: fetch('/api/track', {method: 'POST', ...}) on completed=true |
| admin/stats/route.ts | engagement_events + demand_signals tables | Supabase aggregate queries | WIRED | Parallel queries hit both tables with count, category aggregation, and 30-day slice |
| Hero.tsx | onboarding/page.tsx | localStorage svoji_utm key | WIRED | Hero sets svoji_utm; onboarding reads svoji_utm in finish() |
| onboarding/page.tsx | register/page.tsx | URLSearchParams utm_source, utm_medium, utm_campaign | WIRED | finish() appends utm_* to params; register reads via searchParams.get('utm_source') |
| register/page.tsx | auth/callback/route.ts | btoa-encoded onboarding blob with UTM fields | WIRED | btoa(JSON.stringify(onboardingData)) includes utm_* fields; callback decodes and writes them |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DATA-01 | 09-01, 09-03 | Demand signal logging from AI conversations (structured: category, region, budget, urgency) | SATISFIED | demand-logger.ts extended with source_intent; chat route wires budget_add with params.name->category mapping |
| DATA-02 | 09-01, 09-03 | Engagement metrics tracking (messages, sessions, checklist completion, days until wedding) | SATISFIED | engagement_events table + engagement-logger.ts + message_sent in chat route + checklist_item_completed in ChecklistView via /api/track |
| DATA-03 | 09-02 | UTM parameter tracking on landing page | SATISFIED | Full pipeline: Hero capture -> localStorage -> onboarding passthrough -> register persistence (email + OAuth) -> couples table |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| src/lib/ai/demand-logger.ts | 60 | return null | Info | Intentional: returns null when no category is extractable from params, caller checks before logging. Not a stub. |

No blockers or warnings found.

### Human Verification Required

#### 1. End-to-end UTM attribution flow

**Test:** Open landing page at `/?utm_source=google&utm_medium=cpc&utm_campaign=wedding-2026`, complete onboarding, register with email, then check the couples table row for utm_source, utm_medium, utm_campaign values.
**Expected:** All three UTM fields populated in the couples row.
**Why human:** localStorage behavior and multi-page form flow cannot be traced statically; requires browser execution.

#### 2. budget_add demand signal category mapping

**Test:** In the AI chat, type "Dáváme 50 000 na catering" (budget_add intent with params.name="catering"). Check demand_signals table for a new row with source_intent='budget_add' and category='catering'.
**Expected:** Row inserted with correct values and source_intent column set.
**Why human:** Requires live Kilo API call and database write; intent confidence threshold also depends on model output.

#### 3. Engagement event fire-and-forget (does not block response)

**Test:** Send a chat message and measure response latency before and after phase. Toggle a checklist item and confirm immediate UI update without wait.
**Expected:** No perceptible added latency; engagement events logged asynchronously.
**Why human:** Performance characteristics require runtime measurement.

### Gaps Summary

No gaps. All automated checks pass:

- All 12 observable truths verified against actual code
- All 12 artifacts exist, are substantive, and are wired
- All 9 key links confirmed present in the codebase
- All 3 requirements (DATA-01, DATA-02, DATA-03) satisfied with direct implementation evidence
- TypeScript compiles clean (npx tsc --noEmit passes with no output)
- No blocker anti-patterns found

Three human verification items are recommended for the first real user session to confirm end-to-end behavior, but none block automated verification.

---

_Verified: 2026-03-03_
_Verifier: Claude (gsd-verifier)_
