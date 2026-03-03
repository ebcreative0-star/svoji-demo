---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: B2C Product
status: completed
stopped_at: Completed 09-01-PLAN.md
last_updated: "2026-03-03T21:21:08.765Z"
last_activity: "2026-03-02 - Completed 08-08: guest_add_multi intent + bulk insert, group extraction examples"
progress:
  total_phases: 10
  completed_phases: 8
  total_plans: 34
  completed_plans: 33
  percent: 67
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Couples can plan their entire wedding from one place with AI guidance
**Current focus:** Phase 8 gap closure complete -- guest_add_multi implemented; ready for UAT re-test

## Current Position

Phase: 8 of 9 (AI Pipeline)
Plan: 08 of 08 complete (Guest group extraction and multi-name guest add)
Status: Phase 8 gap closure complete -- guest_add_multi implemented; UAT re-test pending
Last activity: 2026-03-02 - Completed 08-08: guest_add_multi intent + bulk insert, group extraction examples

Progress: [████████░░] ~67% (v2.0 milestone)

## Accumulated Context

### Decisions

Decisions logged in PROJECT.md Key Decisions table.
Key decisions for v2.0:

- DEMO_MODE removal is Phase 5 first task -- all security is inert until this is done
- Google OAuth email audit must run before OAuth is enabled in production (Supabase `email_confirmed_at IS NULL` check)
- Kilo gateway replaces direct Claude API calls in Phase 8
- Intent classification is fire-and-forget (`void classifyAndLogIntent()`) -- never blocking chat response
- Rate limiting via DB atomic function (no Redis) -- `increment_and_check_rate_limit` Postgres function
- Demand signals need structured schema from day one (category, region, budget, urgency) -- no raw JSON
- GDPR consent required in Phase 7 onboarding before Phase 9 data logging goes live
- No monetization (Stripe/paywall) in v2.0 -- deferred to v3.0
- Onboarding is 5 steps (added wedding style step vs original 4 steps)
- [Phase 05-auth-foundation]: getUser() used in middleware (not getSession()) -- server-side JWT validation requires network call to Supabase
- [Phase 05-auth-foundation]: NEXT_PUBLIC_DEMO_MODE env var drives isDemoMode() -- build guard prevents production use
- [Phase 05-auth-foundation]: exchangeCodeForSession() for PKCE OAuth -- both /auth/callback and /auth/confirm do independent new-vs-returning detection via couples table
- [Phase 06-ui-redesign]: SaasFooter separate from wedding page Footer.tsx
- [Phase 06-ui-redesign]: Parallax disabled on mobile and prefers-reduced-motion
- [Phase 06-ui-redesign]: Checkboxes kept as raw HTML (no primitive) with accent-color
- [Phase 06-ui-redesign]: DashboardNav gains optional slug prop for "Web pro hosty" link
- [Phase 06-ui-redesign]: SaasFooter uses --color-primary-dark (warm oklch brown) not --color-text (pure black)
- [Phase 06-ui-redesign]: wedding_websites queried in layout.tsx, slug passed as optional prop to DashboardNav
- [Phase 06-ui-redesign]: SaasFooter background changed to --color-secondary (warm cream) with border-t-2 separator to contrast dark FinalCTA section
- [Phase 07-enhanced-onboarding]: Onboarding does not write to DB -- all data passed via URLSearchParams to /register
- [Phase 07-enhanced-onboarding]: wedding_size kept in Couple interface as @deprecated for backward compat, superseded by guest_count_range
- [Phase 07-enhanced-onboarding]: OAuth onboarding passthrough uses btoa(JSON.stringify(data)) in redirectTo URL -- sessionStorage not viable server-side
- [Phase 07-enhanced-onboarding]: Email signup writes couples row before email confirmation so /auth/confirm redirects to /dashboard not /onboarding
- [Phase 07-enhanced-onboarding]: All landing CTAs funnel through /onboarding (not /register) -- personalization is mandatory entry point
- [Phase 07-enhanced-onboarding]: Post-auth default redirect is /checklist -- /dashboard does not exist as a standalone route
- [Phase 08-ai-pipeline]: Kilo Gateway uses OpenAI-compatible format with system messages prepended to conversation
- [Phase 08-ai-pipeline]: createChatCompletion() abstracts system prompt handling (separate param, auto-prepended)
- [Phase 08-ai-pipeline]: Intent classification uses Haiku model (faster/cheaper than Sonnet) with 0.7 confidence threshold
- [Phase 08-ai-pipeline]: Actions executed synchronously before AI response (not async) so AI can acknowledge the result
- [Phase 08-ai-pipeline]: Demand signals logged fire-and-forget (never blocking chat response)
- [Phase 08-ai-pipeline]: Rate limiting uses DB atomic function increment_chat_count() -- per-couple limit, 50 messages/day, warning at 45
- [Phase 08-ai-pipeline]: Rate limit warning appended to AI response with Czech pluralization (zprava/zpravy/zprav)
- [Phase 08-ai-pipeline]: Midnight reset in Prague timezone (Europe/Prague) via date_trunc('day', now() at time zone 'Europe/Prague')
- [Phase 08-ai-pipeline]: Phase 8 verification complete -- all requirements verified through code review and static analysis
- [Phase 08-ai-pipeline]: 11 Czech few-shot examples added to Haiku classifier (temperature 0.1) to fix UAT intent misclassification
- [Phase 08-ai-pipeline]: Three-way system prompt branching prevents AI fabricating action confirmations: actionResult -> confirm, low-confidence action -> ask clarification, no action -> ZADNA AKCE guard
- [Phase 08-ai-pipeline]: UAT re-test partial pass: tests 1, 2, single-guest-add pass; tests 3 (checklist complete), 4 (budget add), 6 (AI fabrication) still fail; guest multi-name add not implemented
- [Phase 08-ai-pipeline]: guest_add_multi intent added: names[] param, 3 few-shot examples, addGuests() bulk insert, group extraction for ze strany zenicha/nevesty patterns
- [Phase 08-ai-pipeline]: Neutral base prompt removes unconditional action-confirmation priming -- NIKDY nepotvrzuj guard ensures AI only confirms when actionResult is present
- [Phase 08-ai-pipeline]: Confidence threshold lowered to 0.6 -- catches borderline classifications at 0.61-0.69 that were silently dropped at 0.7
- [Phase 09-data-collection]: UTM stored in localStorage svoji_utm key as JSON -- empty strings coerced to null in DB, OAuth path reuses btoa blob pattern from Phase 7
- [Phase 09-data-collection]: extractDemandSignal() accepts optional sourceIntent to map params.name to category for budget_add (classifier uses name not category field)
- [Phase 09-data-collection]: logDemandSignal() sourceIntent defaults to vendor_search for backward compat with Phase 8 callers

### Pending Todos

None yet.

### Blockers/Concerns

- DEMO_MODE bypass RESOLVED (05-01) -- middleware now enforces real auth when NEXT_PUBLIC_DEMO_MODE != 'true'
- Pre-existing Turbopack build failure: CSS module resolution error in globals.css (from v1.0)
- Phase 2 RLS performance: check whether `couples.tier` inline RLS check vs JWT claims is needed before Phase 8 gates

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 1 | Fix footer top spacing - add large gap between footer and previous section | 2026-03-01 | 29163cf | [1-fix-footer-top-spacing](./quick/1-fix-footer-top-spacing-add-large-gap-bet/) |

## Session Continuity

Last session: 2026-03-03T21:21:08.762Z
Stopped at: Completed 09-01-PLAN.md
Resume file: None
