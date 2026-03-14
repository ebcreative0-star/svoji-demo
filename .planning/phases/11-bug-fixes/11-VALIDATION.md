---
phase: 11
slug: bug-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None detected -- Wave 0 skipped (surgical bug fixes, manual verification sufficient) |
| **Config file** | none |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit && npx next build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npx next build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | BUG-01 | manual visual + tsc | `npx tsc --noEmit` | n/a | ⬜ pending |
| 11-01-02 | 01 | 1 | BUG-04 | manual visual + tsc | `npx tsc --noEmit` | n/a | ⬜ pending |
| 11-01-03 | 01 | 1 | BUG-03 | manual visual + tsc | `npx tsc --noEmit` | n/a | ⬜ pending |
| 11-01-04 | 01 | 1 | BUG-02 | manual + tsc | `npx tsc --noEmit` | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. These are surgical bug fixes verified via TypeScript compilation and manual visual inspection.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Partner names render in mobile nav | BUG-01 | Pure UI render, no logic | Load /checklist on mobile viewport, verify partner names appear in top nav |
| First login redirects to /chat | BUG-02 | OAuth flow requires real browser | Complete onboarding, verify redirect to /chat; log out, log back in, verify /checklist |
| AI budget items show Sparkles badge, editable/deletable | BUG-03 | Visual + interaction verification | Create budget item via chatbot, verify Sparkles icon, edit amount, delete item |
| Checklist shows 3 stat cards with days countdown | BUG-04 | Visual layout change | Load /checklist, verify 3 cards (Hotovo, Zbývá with days, Po termínu), no Progres card |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
