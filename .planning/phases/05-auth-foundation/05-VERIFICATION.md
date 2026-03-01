---
phase: 05-auth-foundation
verified: 2026-03-01T00:00:00Z
status: human_needed
score: 10/10 automated must-haves verified
re_verification: false
human_verification:
  - test: "Google OAuth end-to-end flow"
    expected: "Clicking 'Pokracovat pres Google' on /login redirects through Google sign-in and lands at /onboarding (new user) or /dashboard (returning user)"
    why_human: "Requires live Google Cloud OAuth credentials and Supabase provider enabled in dashboard. Cannot verify externally without real credential setup."
  - test: "Email/password registration and verification"
    expected: "Register with a real email, receive verification email, click link, confirm redirect to /onboarding or /dashboard"
    why_human: "Requires SMTP delivery and live Supabase instance. Cannot verify email delivery programmatically."
  - test: "AUTH-02 identity linking (no duplicate accounts)"
    expected: "User who already has an email account can sign in via Google with the same email without a second account being created"
    why_human: "Requires live Supabase with Google OAuth configured and two sign-in attempts to compare auth.users rows."
  - test: "Protected route redirect when demo mode is off"
    expected: "Setting NEXT_PUBLIC_DEMO_MODE=false in .env.local and visiting /dashboard while unauthenticated redirects to /login"
    why_human: "Requires running the dev server with modified env var. Cannot verify middleware redirect behavior without a running server."
  - test: "Password reset flow"
    expected: "Entering email on /login and clicking 'Zapomenute heslo?' triggers email delivery, link redirects to auth callback at /settings"
    why_human: "Requires SMTP delivery and live Supabase to confirm email receipt."
---

# Phase 5: Auth Foundation Verification Report

**Phase Goal:** Real authentication is active in production and users can sign in with Google
**Verified:** 2026-03-01
**Status:** human_needed
**Re-verification:** No -- initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | isDemoMode() returns false when NEXT_PUBLIC_DEMO_MODE env var is absent or 'false' | VERIFIED | `src/lib/demo-data.ts:86-88` -- `return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'` |
| 2 | isDemoMode() returns true only when NEXT_PUBLIC_DEMO_MODE is explicitly 'true' | VERIFIED | Same implementation -- strict equality check |
| 3 | Middleware redirects unauthenticated requests on protected paths to /login when not in demo mode | VERIFIED | `src/lib/supabase/middleware.ts:39-43` -- `NextResponse.redirect(url)` where `url.pathname = '/login'` |
| 4 | Dashboard layout loads real user data from Supabase when not in demo mode | VERIFIED | All 5 dashboard files use `isDemoMode()` function call from `@/lib/demo-data` |
| 5 | Build fails if NEXT_PUBLIC_DEMO_MODE=true in production environment | VERIFIED | `next.config.ts:3-6` -- throws FATAL error in production build |
| 6 | An SQL audit script exists to find unverified email accounts before OAuth enablement | VERIFIED | `scripts/audit-unverified-emails.sql` exists with `email_confirmed_at IS NULL` query |
| 7 | User can click Google button on login page and initiate OAuth flow | VERIFIED | `src/app/(auth)/login/page.tsx:45-56` -- `signInWithOAuth({ provider: 'google', options: { redirectTo: '.../auth/callback' } })` |
| 8 | OAuth PKCE code exchange handled at /auth/callback with new-vs-returning redirect | VERIFIED | `src/app/auth/callback/route.ts:28-40` -- `exchangeCodeForSession(code)` + couples table check |
| 9 | Email verification OTP handled at /auth/confirm | VERIFIED | `src/app/auth/confirm/route.ts:31` -- `supabase.auth.verifyOtp({ token_hash, type })` |
| 10 | Login page has Google button on top, 'nebo' divider, email/password form below, password reset link | VERIFIED | `src/app/(auth)/login/page.tsx:127-186` -- layout matches spec exactly |

**Score:** 10/10 truths verified (automated)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/demo-data.ts` | isDemoMode() reading env var | VERIFIED | Line 87: `return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'` |
| `src/lib/supabase/middleware.ts` | Real auth middleware with protected route redirect | VERIFIED | Full Supabase SSR client, `getUser()`, redirect to /login wired |
| `next.config.ts` | Build-time production safeguard | VERIFIED | Throws `FATAL: NEXT_PUBLIC_DEMO_MODE=true in production build` |
| `scripts/audit-unverified-emails.sql` | SEC-02 email audit query | VERIFIED | Contains `email_confirmed_at IS NULL`, remediation comments |
| `src/app/auth/callback/route.ts` | OAuth PKCE code exchange + new-vs-returning redirect | VERIFIED | `exchangeCodeForSession` + couples table check, exports GET |
| `src/app/auth/confirm/route.ts` | Email verification OTP handler | VERIFIED | `verifyOtp` + new-vs-returning redirect, exports GET |
| `src/app/(auth)/login/page.tsx` | Login page with Google OAuth + email/password | VERIFIED | `signInWithOAuth` present, full UI with Card/Button/Input primitives |
| `src/app/(auth)/register/page.tsx` | Register page with Google OAuth + email/password | VERIFIED | `signInWithOAuth` present, `signUp` with `emailRedirectTo: /auth/confirm` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/supabase/middleware.ts` | `/login` | `NextResponse.redirect` when no user on protected path | WIRED | Line 42: `url.pathname = '/login'` then `NextResponse.redirect(url)` |
| `src/app/(dashboard)/layout.tsx` | `src/lib/demo-data.ts` | `isDemoMode()` import | WIRED | Line 4: `import { isDemoMode, DEMO_COUPLE } from '@/lib/demo-data'` |
| `src/app/(auth)/login/page.tsx` | `src/app/auth/callback/route.ts` | `signInWithOAuth` redirectTo option | WIRED | Line 48: `redirectTo: '${window.location.origin}/auth/callback'` |
| `src/app/auth/callback/route.ts` | `supabase.from('couples')` | new-vs-returning user detection | WIRED | Lines 32-36: `.from('couples').select('id').eq('id', data.user.id)` |
| `src/app/auth/confirm/route.ts` | `supabase.auth.verifyOtp` | email verification token exchange | WIRED | Line 31: `supabase.auth.verifyOtp({ token_hash, type })` |
| `src/app/(auth)/register/page.tsx` | `src/app/auth/confirm/route.ts` | `signUp emailRedirectTo` | WIRED | Line 79: `emailRedirectTo: '${window.location.origin}/auth/confirm'` |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| SEC-01 | 05-01 | DEMO_MODE disabled in production middleware (all auth works for real) | SATISFIED | isDemoMode() env-var-driven, build guard in next.config.ts, middleware enforces real auth when demo mode off |
| SEC-02 | 05-01 | Existing email accounts audited for unverified emails before OAuth enablement | SATISFIED | `scripts/audit-unverified-emails.sql` exists, user confirmed running it (documented in 05-01-SUMMARY.md) |
| AUTH-01 | 05-02 | User can register/login via Google OAuth (Supabase built-in) | SATISFIED (code-complete, human needed for end-to-end) | Login and register pages have `signInWithOAuth` wired to `/auth/callback`; actual flow needs live Google + Supabase config |
| AUTH-02 | 05-02 | Google OAuth correctly links with existing email accounts (no duplicates) | SATISFIED (by Supabase automatic identity linking + SEC-02 audit) | SEC-02 audit ensures no unverified accounts before OAuth enabled; Supabase handles linking automatically for verified emails |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/(auth)/login/page.tsx` | 154, 163 | HTML `placeholder` attributes on Input | Info | Standard HTML -- not stubs, not blockers |
| `src/app/(auth)/register/page.tsx` | 151, 160, 169 | HTML `placeholder` attributes on Input | Info | Standard HTML -- not stubs, not blockers |

No blocker or warning anti-patterns found.

---

### Human Verification Required

These items require a live running environment or external services and cannot be verified programmatically.

#### 1. Google OAuth End-to-End Flow

**Test:** Visit `/login`, click "Pokracovat pres Google", complete Google sign-in
**Expected:** New user lands at `/onboarding`, returning user lands at `/dashboard`
**Why human:** Requires Google Cloud OAuth credentials and Supabase Google provider enabled in dashboard

#### 2. Email/Password Registration and Verification

**Test:** Register with a real email at `/register`, check inbox, click verification link
**Expected:** Redirect to `/onboarding` (new) or `/dashboard` (returning), account is active
**Why human:** Requires SMTP delivery and live Supabase instance

#### 3. AUTH-02 Identity Linking (No Duplicates)

**Test:** Register with email/password, verify email, then sign in via Google using same email
**Expected:** Single account in auth.users (no duplicate), session established normally
**Why human:** Requires two separate auth attempts against live Supabase to compare user records

#### 4. Protected Route Redirect with Demo Mode Off

**Test:** Set `NEXT_PUBLIC_DEMO_MODE=false` in `.env.local`, restart dev server, navigate to `/dashboard` while not logged in
**Expected:** Immediate redirect to `/login`
**Why human:** Requires running dev server with modified env; middleware behavior cannot be verified statically

#### 5. Password Reset Flow

**Test:** Enter email on `/login`, click "Zapomenute heslo?", check inbox for reset link
**Expected:** Email received, clicking link navigates to `/auth/callback?next=/settings`
**Why human:** Requires SMTP delivery and live Supabase

---

### Summary

All code-level must-haves are fully implemented and wired:

- SEC-01: isDemoMode() is env-var-driven (not hardcoded), middleware enforces real auth on protected routes, build guard prevents production deployment with demo mode on. Zero hardcoded `const isDemoMode = true` or `const DEMO_MODE = true` found across all 8 target files.
- SEC-02: Email audit SQL script exists with the correct query and remediation instructions.
- AUTH-01: Login and register pages have Google OAuth buttons wired via `signInWithOAuth` pointing to `/auth/callback`. The PKCE callback route exchanges codes, detects new vs returning users via couples table, and routes accordingly.
- AUTH-02: The SEC-02 audit removes the one scenario where Supabase cannot auto-link (unverified email accounts). The code relies on Supabase's built-in automatic identity linking for verified accounts.

The only remaining items are end-to-end flows that require live Google Cloud credentials, Supabase provider configuration, and SMTP. These are external setup steps, not code gaps. The code is ready for production use once those external services are configured.

---

_Verified: 2026-03-01_
_Verifier: Claude (gsd-verifier)_
