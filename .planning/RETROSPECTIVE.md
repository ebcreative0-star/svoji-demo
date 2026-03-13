# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v2.0 -- B2C Product

**Shipped:** 2026-03-13
**Phases:** 6 | **Plans:** 23 | **Timeline:** 12 days

### What Was Built
- Real authentication (Google OAuth + email) replacing demo mode
- Full UI redesign across all surfaces (auth, dashboard, public web)
- 5-step personalized onboarding with GDPR consent
- AI pipeline overhaul: Kilo gateway, Haiku intent classification, action execution (CRUD via chat)
- Data collection foundation: demand signals, engagement metrics, UTM tracking
- Integration fixups: password reset E2E, rate limit UX

### What Worked
- Fire-and-forget pattern for intent classification and demand signals -- never blocks UX
- DB atomic functions for rate limiting -- no Redis dependency, simpler infra
- Onboarding data via URL params instead of DB writes -- clean OAuth flow
- Milestone audit caught real gaps (phases 9-10 created from audit findings)
- Phase 8 gap closure (plans 05-08) iteratively fixed issues found during UAT

### What Was Inefficient
- Phase 8 needed 4 gap closure plans (08-05 through 08-08) -- initial intent classification was too naive
- ROADMAP.md progress table got out of sync with actual state (milestone column missing for phases 8-10)
- v2.0 scope expanded from original 5 phases to 6 (phase 10 added for integration fixes found during audit)
- Some UAT tests couldn't be fully automated -- relied on code review + static analysis

### Patterns Established
- Kilo gateway as AI abstraction layer (model switching without code changes)
- Three-way system prompt branching (actionResult / low-confidence / no action)
- Czech few-shot examples for intent classification (11 examples, temperature 0.1)
- btoa(JSON.stringify()) pattern for passing structured data through OAuth redirects
- Fire-and-forget async logging (engagement, demand signals) -- `void fn()` pattern

### Key Lessons
1. Intent classification needs domain-specific few-shot examples from day one -- generic prompts fail for Czech wedding context
2. Milestone audits are worth the time -- they caught real integration gaps that would have shipped broken
3. DB atomic functions (Postgres) can replace Redis for simple rate limiting scenarios
4. Onboarding data flow through OAuth is tricky -- URL params + btoa is pragmatic but has size limits

### Cost Observations
- Model mix: mostly sonnet for execution, haiku for classification agents
- 12 days wall clock, ~58 commits
- Notable: gap closure plans (iterative UAT fixes) were the most expensive pattern -- worth investing in better initial classification specs

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Timeline | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~7 days | 4 | Design system foundation, first GSD milestone |
| v2.0 | 12 days | 6 | Full product build, milestone audit introduced |

### Top Lessons (Verified Across Milestones)

1. Start with concrete examples/specs for AI-dependent features -- vague requirements lead to iterative gap closure
2. Milestone audits before completion catch integration issues between phases
