# Phase 9: Data Collection - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Demand signals, engagement events, and UTM attribution are captured from the first real user session. No admin UI -- data queryable via API endpoint and raw SQL. GDPR consent already handled in Phase 7.

</domain>

<decisions>
## Implementation Decisions

### Engagement Events (DATA-02)
- Track exactly 4 actions: message_sent, checklist_item_completed, onboarding_step_completed, upgrade_cta_clicked
- New `engagement_events` Supabase table (one row per event, not aggregated)
- Server-side only -- all tracking goes through API routes, no client-side analytics
- Fire-and-forget pattern (consistent with demand signal logging)

### Demand Signal Expansion (DATA-01)
- Extend demand signal logging to also trigger on `budget_add` intents (not just `vendor_search`)
- Add `source_intent` column to `demand_signals` table to distinguish signal origin (vendor_search vs budget_add)
- Existing schema (category, region, budget_hint, urgency, raw_message) is sufficient otherwise

### UTM Tracking (DATA-03)
- Claude's Discretion -- not discussed in detail
- Must capture source, medium, campaign from landing page URL params
- Must persist through auth flow and associate with user account

### Admin Data Access
- Simple API endpoint returning JSON aggregates (no admin UI)
- Secured with secret API key in X-Admin-Key header (env var)
- Returns: total counts (signals, events, UTM users), top 5 demand categories, daily breakdown for last 30 days
- Single endpoint covering all three data types

### Claude's Discretion
- UTM implementation details (how to persist through auth/onboarding flow)
- Engagement event metadata schema (what extra fields per event type)
- Admin endpoint route structure and response shape
- Database indexing strategy for engagement_events table

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/ai/demand-logger.ts`: logDemandSignal() and extractDemandSignal() already built and wired
- `src/lib/ai/intent-classifier.ts`: isDemandSignal() check exists, can extend for budget_add
- `src/lib/rate-limit.ts`: fire-and-forget DB pattern already established
- `supabase/migrations/005_demand_signals.sql`: demand_signals table with RLS already deployed

### Established Patterns
- Fire-and-forget async logging (demand signals, rate limiting) -- never blocks user response
- Supabase RLS on all tables -- engagement_events needs same pattern
- API routes in `src/app/api/` with NextResponse
- Czech error messages in user-facing code

### Integration Points
- Chat API route (`src/app/api/chat/route.ts`) -- add engagement event logging for message_sent
- Intent classifier result handling -- extend isDemandSignal() to include budget_add
- Onboarding flow -- add server-side tracking for step completion
- Landing page CTAs -- need new API route for CTA click tracking

</code_context>

<specifics>
## Specific Ideas

- budget_add intent as demand signal source -- when a couple budgets for a category, it signals demand just like a vendor search
- Admin endpoint should be callable from Claw (Telegram bot) for quick stats checks

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 09-data-collection*
*Context gathered: 2026-03-03*
