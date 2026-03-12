---
phase: 10
slug: integration-fixups
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-12
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None -- project uses UAT-based verification |
| **Config file** | N/A |
| **Quick run command** | Manual browser verification |
| **Full suite command** | Full UAT scenario walkthrough via `/gsd:verify-work` |
| **Estimated runtime** | ~5 minutes (manual) |

---

## Sampling Rate

- **After every task commit:** Manual browser verification of changed behavior
- **After every plan wave:** Full UAT scenario walkthrough
- **Before `/gsd:verify-work`:** All 4 success criteria confirmed manually
- **Max feedback latency:** N/A (manual verification)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | AUTH-01 | manual | Browser: trigger reset, verify /settings redirect | N/A | ⬜ pending |
| 10-01-02 | 01 | 1 | AUTH-01 | manual | Browser: set new password on /settings | N/A | ⬜ pending |
| 10-01-03 | 01 | 1 | AI-03 | manual | Browser: exhaust 50 messages, verify 429 UX | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework to install -- project convention is UAT-based verification via `/gsd:verify-work`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Password reset email -> /settings redirect | AUTH-01 | Requires Supabase email + browser session | 1. Click "Zapomenuté heslo?" on login 2. Check email 3. Click link 4. Verify lands on /settings with password form visible |
| Password change form submission | AUTH-01 | Requires active recovery session | 1. Arrive at /settings via reset link 2. Enter new password + confirm 3. Verify success message 4. Verify can login with new password |
| Rate limit 429 UX | AI-03 | Requires sending 50+ messages to trigger | 1. Send messages until limit 2. Verify specific Czech error with reset time 3. Verify input is disabled |
| Full password reset E2E flow | AUTH-01 | End-to-end browser flow | 1. Login page -> forgot password -> email -> click link -> /settings -> new password -> login with new password |

---

## Validation Sign-Off

- [x] All tasks have manual verify instructions
- [x] Sampling continuity: manual verification after each task
- [x] Wave 0 covers all MISSING references (none needed)
- [x] No watch-mode flags
- [x] Feedback latency: manual (acceptable for 3-task phase)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
