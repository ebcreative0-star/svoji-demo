---
phase: 05-auth-foundation
plan: 01
subsystem: auth
tags: [supabase, next.js, middleware, demo-mode, env-var, sql]

# Dependency graph
requires: []
provides:
  - isDemoMode() env-var-driven function replacing hardcoded true
  - Real Supabase SSR middleware with protected route redirect to /login
  - Build guard preventing production deploy with demo mode on
  - SEC-02 email audit SQL script for OAuth readiness check
affects:
  - 05-auth-foundation (plans 02+)
  - all future phases using auth middleware

# Tech tracking
tech-stack:
  added: []
  patterns:
    - isDemoMode() reads NEXT_PUBLIC_DEMO_MODE env var (not hardcoded)
    - Middleware uses getUser() not getSession() for server-side JWT validation
    - Demo mode check in middleware runs after Supabase client setup but before redirect logic

key-files:
  created:
    - scripts/audit-unverified-emails.sql
  modified:
    - src/lib/demo-data.ts
    - src/lib/supabase/middleware.ts
    - src/app/(dashboard)/layout.tsx
    - src/app/(dashboard)/chat/page.tsx
    - src/app/(dashboard)/checklist/page.tsx
    - src/app/(dashboard)/budget/page.tsx
    - src/app/(dashboard)/guests/page.tsx
    - next.config.ts

key-decisions:
  - "Use getUser() not getSession() in middleware -- getSession() does not validate JWT server-side"
  - "Demo mode check in middleware runs after Supabase client setup so cookies still refresh in dev"
  - "NEXT_PUBLIC_DEMO_MODE=true in .env.local preserves dev workflow; build guard catches accidental production use"
  - "SEC-02 audit script is a manual prerequisite before enabling Google OAuth -- run before Plan 02"

patterns-established:
  - "isDemoMode(): reads process.env.NEXT_PUBLIC_DEMO_MODE === 'true'"
  - "Protected paths list in middleware: /dashboard, /checklist, /budget, /guests, /chat, /settings"

requirements-completed:
  - SEC-01
  - SEC-02

# Metrics
duration: ~30min
completed: 2026-03-01
---

# Phase 5 Plan 01: Auth Foundation Summary

**isDemoMode() converted from hardcoded `return true` to NEXT_PUBLIC_DEMO_MODE env var, real Supabase SSR middleware with /login redirect wired up, and SEC-02 email audit SQL script created**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-01
- **Completed:** 2026-03-01
- **Tasks:** 2 auto + 1 checkpoint (verified by user)
- **Files modified:** 9

## Accomplishments

- All 8 files with hardcoded demo bypasses converted to env-var-driven isDemoMode()
- Middleware now creates real Supabase SSR client and redirects unauthenticated users on protected paths to /login (when NEXT_PUBLIC_DEMO_MODE is not 'true')
- Build guard in next.config.ts throws fatal error if NEXT_PUBLIC_DEMO_MODE=true in production
- SEC-02 audit script ready to run in Supabase SQL Editor before enabling Google OAuth

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace all hardcoded demo mode with env-var-driven isDemoMode() + real middleware + build guard** - `2aa8d18` (feat)
2. **Task 2: Create SEC-02 email audit script** - `e49933c` (chore)
3. **Task 3: Checkpoint -- human-verify** - verified by user ("approved")

## Files Created/Modified

- `src/lib/demo-data.ts` - isDemoMode() now reads NEXT_PUBLIC_DEMO_MODE env var instead of hardcoded true
- `src/lib/supabase/middleware.ts` - Real Supabase SSR client, getUser() for server-side validation, redirect to /login for unauthenticated protected-path requests
- `src/app/(dashboard)/layout.tsx` - Replaced local const with isDemoMode() import
- `src/app/(dashboard)/chat/page.tsx` - Replaced local const with isDemoMode() import
- `src/app/(dashboard)/checklist/page.tsx` - Replaced local const with isDemoMode() import
- `src/app/(dashboard)/budget/page.tsx` - Replaced local const with isDemoMode() import
- `src/app/(dashboard)/guests/page.tsx` - Replaced local const with isDemoMode() import
- `next.config.ts` - Build-time guard: throws if NEXT_PUBLIC_DEMO_MODE=true in NODE_ENV=production
- `scripts/audit-unverified-emails.sql` - SEC-02 query to find unverified emails before OAuth enablement

## Decisions Made

- Used getUser() not getSession() in middleware. getSession() does not validate the JWT server-side; getUser() sends a network request to Supabase auth server to validate the token.
- Demo mode check placed after Supabase client setup in middleware so cookies still get refreshed during local dev with demo mode active.
- .env.local keeps NEXT_PUBLIC_DEMO_MODE=true so dev workflow is uninterrupted. .env.example documents the variable defaulting to false.
- SEC-02 audit script is intentionally manual -- it must be run by a human with Supabase dashboard access before OAuth is enabled.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Before enabling Google OAuth in the Supabase dashboard (Plan 02 prerequisite):

1. Open Supabase Dashboard -> SQL Editor -> New Query
2. Paste and run `scripts/audit-unverified-emails.sql`
3. If zero rows returned: safe to enable OAuth
4. If rows returned: clean up unverified accounts using options in the script comments (delete test data, manually confirm real users, or send re-verification emails)

User confirmed (checkpoint): demo mode toggle verified working, SEC-02 audit reviewed.

## Next Phase Readiness

- SEC-01 and SEC-02 are done. Plan 02 (Google OAuth) can proceed.
- .env.local has NEXT_PUBLIC_DEMO_MODE=true -- dev workflow intact.
- Middleware will enforce real auth as soon as NEXT_PUBLIC_DEMO_MODE is removed or set to false.
- Login page (`src/app/(auth)/login/page.tsx`) still has the demo/demo shortcut -- that gets replaced in Plan 02 when the real OAuth login UI is built.

---
*Phase: 05-auth-foundation*
*Completed: 2026-03-01*
