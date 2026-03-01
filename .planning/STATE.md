---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: B2C Product
status: unknown
last_updated: "2026-03-01T22:04:13.904Z"
progress:
  total_phases: 7
  completed_phases: 7
  total_plans: 23
  completed_plans: 23
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** Couples can plan their entire wedding from one place with AI guidance
**Current focus:** Phase 8 -- AI UX and Demand Signals (phase 7 complete)

## Current Position

Phase: 7 of 9 (Enhanced Onboarding) -- COMPLETE
Plan: 03 complete (end-to-end verification + routing/diacritics bug fixes)
Status: Phase 7 complete, ready for Phase 8
Last activity: 2026-03-01 - Completed 07-03: Verified full onboarding pipeline, fixed CTA routing (/register -> /onboarding), post-auth redirect (/dashboard -> /checklist), and Czech diacritics in onboarding

Progress: [████░░░░░░] ~38% (v2.0 milestone)

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

Last session: 2026-03-01
Stopped at: Completed 07-03-PLAN.md (verification: routing fixes + diacritics, phase 7 complete)
Resume file: None
