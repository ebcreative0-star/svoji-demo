---
phase: 05-auth-foundation
plan: 02
subsystem: auth
tags: [supabase, google-oauth, next.js, route-handlers, pkce, email-verification]

# Dependency graph
requires:
  - 05-01 (isDemoMode env-var, real middleware, SEC-02 audit)
provides:
  - OAuth PKCE callback route (/auth/callback) with new-vs-returning redirect
  - Email verification OTP route (/auth/confirm) with new-vs-returning redirect
  - Premium login page with Google OAuth + email/password
  - Premium register page with Google OAuth + email/password
affects:
  - 05-auth-foundation (plan 03+)
  - Phase 7 onboarding (new users land at /onboarding from callback)
  - Phase 6 password reset (already wired via resetPasswordForEmail)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - exchangeCodeForSession() for PKCE OAuth code exchange (not implicit flow)
    - verifyOtp() for email OTP verification in /auth/confirm
    - New-vs-returning detection via couples table presence check after auth
    - signInWithOAuth redirectTo points to /auth/callback (browser-side)
    - signUp emailRedirectTo points to /auth/confirm (browser-side)
    - Inline Google G SVG (multi-color, brand-compliant, no lucide-react)
    - Google button uses leadingIcon prop on Button component

key-files:
  created:
    - src/app/auth/callback/route.ts
    - src/app/auth/confirm/route.ts
  modified:
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/register/page.tsx

key-decisions:
  - "exchangeCodeForSession() used for PKCE -- required for server-side OAuth code exchange"
  - "New user detection via couples table (no row = new user going to /onboarding)"
  - "Both callback and confirm routes do new-vs-returning detection independently"
  - "Google SVG inline not from lucide-react -- brand guidelines require multi-color G"
  - "Password reset wired via resetPasswordForEmail on login page -- Phase 6 will handle the reset UI"
  - "Demo shortcuts fully removed from login page -- middleware handles demo mode bypass"

requirements-completed:
  - AUTH-01
  - AUTH-02

# Metrics
duration: ~2min (auto tasks only; checkpoint pending human verification)
completed: 2026-03-01
---

# Phase 5 Plan 02: OAuth Callback Routes + Premium Auth Pages Summary

**OAuth PKCE callback route, email OTP confirmation route, and rebuilt login/register pages with Google OAuth + email/password in premium card layout**

## Performance

- **Duration:** ~2 min (auto tasks)
- **Started:** 2026-03-01
- **Completed:** 2026-03-01 (auto tasks; checkpoint pending)
- **Tasks:** 2 auto complete + 1 checkpoint awaiting human verification
- **Files created/modified:** 4

## Accomplishments

- /auth/callback route: PKCE code exchange via exchangeCodeForSession(), detects new vs returning user by querying couples table, redirects new users to /onboarding and returning users to /dashboard
- /auth/confirm route: email OTP verification via verifyOtp(), same new-vs-returning detection logic, handles both email confirmation and password reset flows
- Login page rebuilt: Google button on top (full-width, large, prominent with colored Google G SVG), "nebo" divider, email/password form using Input/Button UI primitives, "Zapomenuté heslo?" inline password reset, warm radial gradient background with Card layout
- Register page rebuilt: same Google OAuth + "nebo" divider + email/password layout, signUp with emailRedirectTo to /auth/confirm, confirmation message after signup
- All demo mode shortcuts removed from auth pages

## Task Commits

1. **Task 1: Create /auth/callback and /auth/confirm route handlers** - `f0b074e` (feat)
2. **Task 2: Rebuild login and register pages with Google OAuth + premium card layout** - `1b38d2f` (feat)
3. **Task 3: Checkpoint human-verify** - Awaiting user verification

## Files Created/Modified

- `src/app/auth/callback/route.ts` - OAuth PKCE code exchange + new-vs-returning user redirect
- `src/app/auth/confirm/route.ts` - Email OTP verification + new-vs-returning user redirect
- `src/app/(auth)/login/page.tsx` - Rebuilt with Google OAuth button, "nebo" divider, email/password form, password reset, Card layout, warm gradient background
- `src/app/(auth)/register/page.tsx` - Rebuilt with Google OAuth button, "nebo" divider, email/password form with confirm field, emailRedirectTo /auth/confirm, Card layout

## Decisions Made

- Used exchangeCodeForSession() for PKCE -- required for server-side OAuth code exchange (not implicit flow)
- Both /auth/callback and /auth/confirm perform independent new-vs-returning detection. This is intentional: email users arrive at /confirm while OAuth users arrive at /callback
- Google SVG icon is inline multi-color (brand-compliant) rather than using lucide-react
- Password reset on login page calls resetPasswordForEmail inline -- Phase 6 will build the actual reset password UI page
- Demo shortcuts fully removed; middleware already handles demo mode bypass transparently

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required (before Google OAuth works end-to-end)

Google Cloud setup (one-time):
1. Create/select Google Cloud project, enable Google Identity API
2. Create OAuth 2.0 Client ID (Web application type)
3. Add Supabase callback URL to Authorized Redirect URIs: `https://[project-ref].supabase.co/auth/v1/callback`

Supabase setup (one-time):
4. Go to Supabase Dashboard > Authentication > Providers > Google
5. Enable and paste Client ID + Client Secret from Google Cloud Console

## Self-Check

All created/modified files verified to exist and contain expected content.

## Self-Check: PASSED

- src/app/auth/callback/route.ts: FOUND with exchangeCodeForSession
- src/app/auth/confirm/route.ts: FOUND with verifyOtp
- src/app/(auth)/login/page.tsx: FOUND with signInWithOAuth
- src/app/(auth)/register/page.tsx: FOUND with signInWithOAuth
- Commit f0b074e: FOUND
- Commit 1b38d2f: FOUND

---
*Phase: 05-auth-foundation*
*Completed: 2026-03-01 (auto tasks complete, checkpoint pending)*
