---
phase: 9
slug: data-collection
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-03
---

# Phase 9 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None -- no test framework in project |
| **Config file** | none |
| **Quick run command** | Manual: check Supabase dashboard for new rows |
| **Full suite command** | Manual: full flow UTM landing -> onboarding -> chat -> check all 3 tables |
| **Estimated runtime** | ~120 seconds (manual) |

---

## Sampling Rate

- **After every task commit:** Manual smoke test (Supabase SQL editor)
- **After every plan wave:** Full manual walkthrough
- **Before `/gsd:verify-work`:** All 3 data types queryable and non-empty
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | DATA-01 | manual | Supabase SQL: `select * from demand_signals where source_intent is not null` | N/A | ⬜ pending |
| 09-01-02 | 01 | 1 | DATA-01 | manual | Chat test: send budget message, verify demand_signals row | N/A | ⬜ pending |
| 09-02-01 | 02 | 1 | DATA-02 | manual | Supabase SQL: `select * from engagement_events` | N/A | ⬜ pending |
| 09-02-02 | 02 | 1 | DATA-02 | manual | Chat test: send message, verify engagement_events row | N/A | ⬜ pending |
| 09-03-01 | 03 | 1 | DATA-03 | manual | Visit `/?utm_source=test&utm_medium=cpc&utm_campaign=test`, register, check couples row | N/A | ⬜ pending |
| 09-04-01 | 04 | 2 | ALL | manual | `curl -H "X-Admin-Key: $KEY" /api/admin/stats` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework to install -- validation is manual smoke testing via Supabase dashboard and admin endpoint.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| budget_add creates demand signal | DATA-01 | No test framework, requires live Supabase | Send "Mame 50000 na catering" in chat, check demand_signals table |
| Engagement events logged | DATA-02 | Requires auth flow + live DB | Send message, complete checklist item, check engagement_events |
| UTM persists through OAuth | DATA-03 | Requires Google OAuth redirect flow | Visit with UTM params, register via Google, check couples.utm_source |
| Admin endpoint auth | ALL | Requires running server | curl without key -> 401, curl with key -> JSON |

---

## Validation Sign-Off

- [ ] All tasks have manual verify instructions
- [ ] Sampling continuity: manual check after each task
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
