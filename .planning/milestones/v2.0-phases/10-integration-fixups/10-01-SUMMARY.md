---
phase: 10-integration-fixups
plan: "01"
subsystem: auth-and-chat
tags: [auth, password-reset, rate-limiting, chat]
dependency_graph:
  requires: []
  provides: [password-reset-e2e, chat-rate-limit-ux]
  affects: [src/app/auth/confirm/route.ts, src/app/(dashboard)/settings/page.tsx, src/components/dashboard/ChatInterface.tsx]
tech_stack:
  added: []
  patterns: [recovery-redirect, onAuthStateChange, 429-status-branch]
key_files:
  created: []
  modified:
    - src/app/auth/confirm/route.ts
    - src/app/(dashboard)/settings/page.tsx
    - src/components/dashboard/ChatInterface.tsx
decisions:
  - "/auth/confirm recovery branch redirects to /settings?recovered=true before couples-table check"
  - "isRecoveryMode detected via both URLSearchParams and onAuthStateChange for dual coverage"
  - "Rate limit message uses assistant role bubble not a UI banner -- consistent with chat UX"
  - "isRateLimited state is ephemeral -- resets on page reload (resets naturally after midnight)"
metrics:
  duration: "~23 minutes"
  completed: "2026-03-12"
  tasks_completed: 2
  files_modified: 3
---

# Phase 10 Plan 01: Integration Fixups Summary

One-liner: Password reset E2E fixed via recovery branch in /auth/confirm plus Czech 429 rate-limit UX in ChatInterface.

## What Was Built

**Task 1 -- Password reset E2E flow:**

The `/auth/confirm` route handler now branches on `type === 'recovery'` immediately after `verifyOtp` succeeds, redirecting to `/settings?recovered=true`. Previously, all verify types fell through to the couples-table check and redirected to `/checklist` or `/onboarding`, dead-ending the password reset flow.

Settings page gained a "Zmena hesla" Card section between the wedding website Card and the danger zone Card. Recovery mode is detected two ways: `URLSearchParams('recovered') === 'true'` for the redirect path, and `supabase.auth.onAuthStateChange` for the `PASSWORD_RECOVERY` event as fallback. When in recovery mode the card gets a `ring-2 ring-[var(--color-primary)]` highlight. The `changePassword` handler validates match + length >= 8, calls `updateUser`, shows Czech success/error inline messages.

**Task 2 -- Chat 429 rate-limit UX:**

`ChatInterface` now handles HTTP 429 responses with a dedicated branch before the generic `!response.ok` throw. It parses `resetAt` from the response body, formats it to `HH:mm` using already-imported `format + cs`, and inserts an assistant-role system bubble with Czech copy. `isRateLimited` state disables the input field, send button, and `sendMessage` guard. `setIsLoading(false)` is called before early return to prevent a stuck spinner.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 49dccec | feat(10-01): fix password reset flow + add password change section |
| 2 | eee982c | feat(10-01): handle 429 rate limit in ChatInterface with Czech UX |

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] src/app/auth/confirm/route.ts -- `type === 'recovery'` branch at line 35
- [x] src/app/(dashboard)/settings/page.tsx -- `isRecoveryMode`, `changePassword`, `updateUser` present
- [x] src/components/dashboard/ChatInterface.tsx -- `response.status === 429`, `isRateLimited` present
- [x] Build passes with no errors (all 21 routes compiled clean)
- [x] Commits 49dccec and eee982c exist in git log
