# Phase 5: Auth Foundation - Research

**Researched:** 2026-03-01
**Domain:** Supabase SSR Auth, Google OAuth, Next.js middleware, demo mode removal
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Auth methods:** Google OAuth + email/password -- both available for login and registration
- New users can register via Google OR email/password (both paths supported)
- Email verification required for new email/password signups (Supabase built-in)
- Password reset flow included ("Zapomenuté heslo?" link on login page, Supabase built-in reset via email)
- Google OAuth must link with existing email accounts -- no duplicate accounts for same email (AUTH-02)
- **Login page presentation:** Google button on top, prominent and large; "nebo" divider; email/password form below; premium centered card layout on subtle gradient/pattern background (Stripe/Linear style); card-only design, no split layout; consistent with Svoji design system (OKLCH palette, Cormorant headings, rounded corners)
- **Post-login routing:** Returning users redirect to /dashboard; new users (first sign-up) redirect to /onboarding; Phase 5 only wires new-vs-returning detection and redirect logic
- **Demo mode transition:** Replace hardcoded `DEMO_MODE = true` with `NEXT_PUBLIC_DEMO_MODE` env var; when true (dev) demo shortcuts visible; when false/absent (prod) no demo shortcuts, real auth enforced; build-time safeguard: fail the build if DEMO_MODE is accidentally true in production

### Claude's Discretion

- Login vs register as separate pages or single page with toggle
- Exact gradient/pattern for auth page background
- OAuth callback route structure
- Account linking implementation details (Supabase handles most of this)
- Error message copy for auth failures
- Loading states during OAuth redirect

### Deferred Ideas (OUT OF SCOPE)

- Onboarding-before-registration flow (pre-auth onboarding steps) -- Phase 7 builds the actual onboarding UI; Phase 5 only wires redirect logic
- Note for Phase 7: onboarding must work in anonymous mode (localStorage) and persist to DB after registration
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SEC-01 | DEMO_MODE disabled in production middleware (all auth works for real) | Demo mode removal pattern documented; env var approach verified; build-time guard via next.config.js |
| SEC-02 | Existing email accounts audited for unverified emails before OAuth enablement | SQL audit query against auth.users where email_confirmed_at IS NULL; Supabase dashboard or service role client access |
| AUTH-01 | User can register/login via Google OAuth (Supabase built-in) | signInWithOAuth pattern documented; /auth/callback route code examples verified; Google Cloud Console setup steps identified |
| AUTH-02 | Google OAuth correctly links with existing email accounts (no duplicates) | Supabase automatic identity linking verified from official docs -- works when existing account has verified email |
</phase_requirements>

---

## Summary

Phase 5 is a security-critical cleanup and real auth activation phase. The codebase already has all the Supabase SSR infrastructure in place (`@supabase/ssr` 0.8.0, server/client clients, middleware skeleton) -- the hard part is not implementing from scratch but correctly removing the demo mode bypass that currently short-circuits everything, then wiring the real flows.

The most important sequencing constraint: SEC-02 (audit unverified emails) must run before enabling Google OAuth in production. Supabase's automatic identity linking only works for accounts where `email_confirmed_at IS NOT NULL`. If unverified email accounts exist, enabling OAuth could create duplicate accounts (the very problem AUTH-02 prohibits). The audit is a one-time SQL check before deployment.

For Google OAuth itself, Supabase handles the hard parts (PKCE flow, session exchange, identity deduplication) -- the work is: configure provider in Supabase dashboard, add /auth/callback route, update middleware to enforce real redirects, and update signInWithOAuth calls in the login page. The new-vs-returning user detection for redirect routing is done by checking whether a `couples` row exists for the authenticated user id.

**Primary recommendation:** Execute in strict order: (1) remove DEMO_MODE hardcoding, (2) run email audit, (3) implement real middleware redirect, (4) add /auth/callback and /auth/confirm routes, (5) rebuild login/register pages with Google OAuth, (6) wire new-vs-returning redirect logic.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/ssr | ^0.8.0 (installed) | Cookie-based auth for SSR, PKCE flow, session management | Official Supabase SSR package; handles token refresh in middleware |
| @supabase/supabase-js | ^2.98.0 (installed) | signInWithOAuth, signInWithPassword, signUp, getUser | Core Supabase client |
| next | 16.1.6 (installed) | Route handlers at /auth/callback and /auth/confirm | App Router route handlers are the standard callback pattern |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | ^4.3.6 (installed) | Env var validation in next.config.js | Build-time safeguard to fail build if DEMO_MODE=true in prod |
| react-hook-form | ^7.71.2 (installed) | Form state for login/register forms | Already in project; use instead of raw useState for form handling |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase automatic identity linking | Manual linkIdentity() call | Manual is more control but requires the user to be logged in first; automatic linking (default) is correct here |
| /auth/callback route handler | Client-side code exchange | Server-side route is required for PKCE security; client-side is insecure |
| next.config.js build guard | Runtime check only | Runtime check allows a broken deploy to reach production; build-time guard stops it at CI |

**Installation:** No new packages needed. All required libraries are already installed.

---

## Architecture Patterns

### Current State (what exists)

```
src/
├── middleware.ts                    # Calls updateSession() -- currently a passthrough
├── lib/supabase/
│   ├── middleware.ts                # DEMO_MODE = true hardcoded -- main bypass to remove
│   ├── server.ts                   # createServerClient() -- correct implementation
│   └── client.ts                   # createBrowserClient() -- correct implementation
├── lib/demo-data.ts                # isDemoMode() always returns true -- must fix
├── app/(auth)/
│   ├── login/page.tsx              # Has demo bypass and basic signInWithPassword -- needs rebuild
│   └── register/page.tsx          # Has basic signUp -- needs rebuild with Google OAuth
└── app/(dashboard)/layout.tsx     # const isDemoMode = true hardcoded -- must fix
```

### Target State (after Phase 5)

```
src/
├── middleware.ts                    # Unchanged
├── lib/supabase/
│   └── middleware.ts                # Real updateSession with redirect to /login for protected routes
├── lib/demo-data.ts                # isDemoMode() reads NEXT_PUBLIC_DEMO_MODE env var
├── app/(auth)/
│   ├── login/page.tsx              # Google OAuth button + email/password form
│   └── register/page.tsx          # Google OAuth button + email/password form
├── app/auth/
│   ├── callback/route.ts          # NEW: exchanges OAuth code for session
│   └── confirm/route.ts           # NEW: handles email verification OTP link
└── app/(dashboard)/layout.tsx     # Reads real user; redirects to /login if no session
```

### Pattern 1: Real Middleware with Protected Routes

**What:** updateSession creates a Supabase client from request cookies, calls getUser(), redirects to /login if no user on protected paths.

**When to use:** Every request that touches a protected route.

```typescript
// Source: Supabase docs -- server-side advanced guide
// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/checklist', '/budget', '/guests', '/chat', '/settings']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value, options)
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: getUser() not getSession() -- getSession() is not safe server-side
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = PROTECTED_PATHS.some(p => path.startsWith(p))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // In demo mode (dev only), allow demo shortcut paths
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return supabaseResponse
  }

  return supabaseResponse
}
```

**Critical note:** Always use `supabase.auth.getUser()` in middleware, NOT `getSession()`. `getSession()` does not validate the JWT against the server and can be spoofed. This is an official Supabase recommendation.

### Pattern 2: OAuth Callback Route (PKCE)

**What:** Route handler at /auth/callback exchanges the one-time code from Google's redirect for a real session. Required for PKCE flow (which @supabase/ssr uses by default).

**When to use:** Every OAuth sign-in flow; also handles the `next` parameter for post-login redirect destination.

```typescript
// Source: Supabase docs -- auth callback pattern
// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Detect new vs returning user
      const { data: couple } = await supabase
        .from('couples')
        .select('id')
        .eq('id', data.user.id)
        .single()

      const redirectTo = couple ? '/dashboard' : '/onboarding'
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  // Return to login with error indicator
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
```

### Pattern 3: Email Confirmation Route

**What:** Handles the link Supabase sends after email/password signup. User clicks the link, lands here, OTP is verified, session established.

```typescript
// Source: Supabase docs -- email OTP verification
// src/app/auth/confirm/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({ token_hash, type })

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL('/login?error=email_confirm_failed', request.url))
}
```

### Pattern 4: Client-Side Google OAuth Initiation

**What:** Called from the login page when user clicks "Přihlásit se přes Google".

```typescript
// Source: Supabase docs -- signInWithOAuth
// In login/page.tsx or register/page.tsx
const handleGoogleSignIn = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) {
    setError('Přihlášení přes Google selhalo')
  }
}
```

### Pattern 5: New vs Returning User Detection

**What:** In /auth/callback, after session exchange, check if `couples` row exists for user.id. If yes, user is returning. If no, user is new.

```typescript
const { data: couple } = await supabase
  .from('couples')
  .select('id')
  .eq('id', data.user.id)
  .single()

const redirectTo = couple ? '/dashboard' : '/onboarding'
```

This works for both email/password and Google OAuth since both go through /auth/callback for the first session establishment (email/password via the confirmation link which also lands at /auth/confirm, then redirect to /dashboard or /onboarding).

**Edge case for email/password:** After signUp(), Supabase sends a confirmation email. The user is NOT logged in yet. The /auth/confirm route handles the link click and does the new-vs-returning check there.

### Pattern 6: isDemoMode() Fix

**What:** Replace the hardcoded `return true` in src/lib/demo-data.ts with an env var check.

```typescript
// src/lib/demo-data.ts
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}
```

All 8 files that currently use `isDemoMode()` or hardcode `DEMO_MODE = true` will automatically respect the env var after this change.

### Pattern 7: Build-Time Production Safeguard

**What:** In next.config.js (or next.config.ts), check at build time that DEMO_MODE is not true in production.

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // ...existing config
}

// Fail build if DEMO_MODE is accidentally enabled in production
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
  throw new Error('FATAL: NEXT_PUBLIC_DEMO_MODE=true in production build. Aborting.')
}

export default nextConfig
```

### Pattern 8: Email Audit SQL Query (SEC-02)

**What:** Run before enabling Google OAuth in production. Identifies accounts that Supabase would refuse to auto-link (because email is unverified).

```sql
-- Run in Supabase SQL editor (uses service role access to auth schema)
SELECT
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email_confirmed_at IS NULL
  AND email IS NOT NULL
ORDER BY created_at DESC;
```

If results come back: either manually confirm these users (via Supabase admin), delete test accounts, or send them re-verification emails before enabling OAuth. This is a prerequisite gate for enabling Google provider in the Supabase dashboard.

### Anti-Patterns to Avoid

- **Using `getSession()` in middleware:** Returns the session from the cookie without server validation. A crafted cookie can bypass auth. Always use `getUser()` in middleware.
- **Redirecting in dashboard Server Components instead of middleware:** Causes redirect waterfalls. Auth check belongs in middleware for protected routes.
- **Hardcoding demo bypass in multiple files:** The existing pattern (8 files hardcoding isDemoMode/DEMO_MODE) is what must be removed. After this phase, isDemoMode() is the single source of truth.
- **Forgetting to set callback URL in Google Cloud Console:** OAuth will fail with redirect_uri_mismatch if the Supabase callback URL is not added to the Google Cloud project's Authorized Redirect URIs.
- **Using signInWithOAuth without `redirectTo`:** Without redirectTo, Supabase uses the Site URL from dashboard settings. This works but is less explicit -- always set redirectTo to `/auth/callback` for predictability.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PKCE code exchange | Custom fetch to token endpoint | supabase.auth.exchangeCodeForSession(code) | PKCE has verifier/challenge cryptographic requirements; custom code will have security bugs |
| Session token refresh | setInterval to refresh | @supabase/ssr middleware updateSession | SSR package handles cookie rotation, expiry, and race conditions |
| Identity deduplication | Custom duplicate check + merge | Supabase automatic identity linking | Supabase handles this at the database level with proper locking; custom code risks race conditions |
| Password reset | Custom token generation + email | supabase.auth.resetPasswordForEmail() | Supabase generates cryptographically secure OTPs and handles expiry |
| Email verification | Custom confirmation tokens | Supabase built-in email OTP + /auth/confirm route | Same -- cryptographic token handling is error-prone |

**Key insight:** Supabase Auth is a complete auth server (GoTrue). Every flow (OAuth, OTP, password reset, identity linking) has a proper implementation. The project's job is to wire the callbacks and handle redirects, not re-implement the auth logic.

---

## Common Pitfalls

### Pitfall 1: Demo Mode Scattered in 8 Files

**What goes wrong:** Removing the hardcoded `DEMO_MODE = true` from only middleware.ts while other files still have their own hardcoded bypasses. Auth appears broken because dashboard layout still shows demo data.

**Why it happens:** The current codebase has DEMO_MODE bypasses in multiple locations: `src/lib/supabase/middleware.ts`, `src/lib/demo-data.ts`, `src/app/(dashboard)/layout.tsx`, and 5 dashboard page components.

**How to avoid:** Fix `isDemoMode()` in demo-data.ts FIRST (make it env-var driven). Then fix `src/lib/supabase/middleware.ts`. The dashboard layout and page components that use `isDemoMode()` or hardcode `const isDemoMode = true` must all be updated. Grep for both `DEMO_MODE` and `isDemoMode` to find all locations.

**Warning signs:** Dashboard loads without a real session. Auth middleware redirecting correctly to /login but dashboard still shows mock data.

### Pitfall 2: Google OAuth Callback URL Not Configured

**What goes wrong:** User clicks "Sign in with Google", goes to Google's consent screen, Google redirects back -- and gets a `redirect_uri_mismatch` error or a blank page.

**Why it happens:** Two separate configurations must match:
1. Supabase Dashboard > Authentication > Providers > Google: Client ID and Client Secret set, and the callback URL shown there (`https://[project].supabase.co/auth/v1/callback`) must be added to Google Cloud Console
2. Google Cloud Console > Credentials > OAuth 2.0 Client IDs: `https://[project].supabase.co/auth/v1/callback` in Authorized Redirect URIs

**How to avoid:** Configure both before testing. For local dev, also add `http://localhost:3000/auth/callback` to Google Cloud Console (not the Supabase callback URL -- the Supabase one stays the same regardless of environment).

**Warning signs:** `redirect_uri_mismatch` error from Google. Or successful Google auth but no session established.

### Pitfall 3: Duplicate Account Risk from Unverified Emails

**What goes wrong:** A test user signed up with `user@gmail.com` but never verified their email. When Google OAuth is enabled and they sign in via Google with the same address, Supabase creates a SECOND auth.users record instead of linking.

**Why it happens:** Supabase automatic identity linking requires the existing account to have `email_confirmed_at IS NOT NULL`. Unverified accounts are explicitly excluded to prevent pre-account takeover attacks.

**How to avoid:** Run the SEC-02 SQL audit before enabling Google OAuth in Supabase Dashboard. Clean up or manually confirm any accounts where `email_confirmed_at IS NULL`. Only then enable the Google provider.

**Warning signs:** Users report "I already have an account" but can't log in. Duplicate rows in auth.users for the same email.

### Pitfall 4: getSession() vs getUser() in Server Context

**What goes wrong:** Middleware uses `supabase.auth.getSession()`, which reads the JWT from the cookie without verifying it against the Supabase server. A crafted cookie can bypass auth checks.

**Why it happens:** getSession() is documented but is explicitly not recommended for server-side auth checks. The Supabase docs warn about this.

**How to avoid:** Always use `supabase.auth.getUser()` in middleware and Server Components. getUser() validates the token with the Supabase Auth server on every call.

**Warning signs:** Auth seems to work but security audit flags the pattern.

### Pitfall 5: New User Detection Race Condition

**What goes wrong:** New user signs in via Google, /auth/callback checks for `couples` row, finds none, redirects to /onboarding. But a concurrent request or slow DB creates the row between the check and redirect, causing the user to land on onboarding twice.

**Why it happens:** The couples row might be created by a DB trigger or a previous partial request.

**How to avoid:** Onboarding page should handle the case where partial couples data already exists (idempotent onboarding). The detection logic is a best-effort redirect, not a hard gate. The actual "completed" state is `couples.onboarding_completed = true`.

---

## Code Examples

### Verified patterns from research

#### signInWithPassword (already exists, keep this pattern)
```typescript
// Source: existing src/app/(auth)/login/page.tsx -- already correct
const { error } = await supabase.auth.signInWithPassword({ email, password })
```

#### signUp with redirect to confirmation (update register page)
```typescript
// Source: Supabase docs
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/confirm`,
  },
})
// After this: user gets email, clicks link, /auth/confirm handles session
```

#### Password reset flow
```typescript
// Source: Supabase docs -- supabase.auth.resetPasswordForEmail
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/confirm?next=/settings`,
})
```

#### Checking new vs returning in dashboard layout (fallback)
```typescript
// Source: existing pattern in src/app/(dashboard)/layout.tsx
const { data: couple } = await supabase
  .from('couples')
  .select('onboarding_completed, partner1_name, partner2_name')
  .eq('id', user.id)
  .single()

if (!couple?.onboarding_completed) {
  redirect('/onboarding')
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @supabase/auth-helpers | @supabase/ssr | 2023-2024 | auth-helpers deprecated; @supabase/ssr is the current package -- project already uses the correct one |
| getSession() server-side | getUser() server-side | 2024 | Security improvement; getUser() validates JWT with server |
| Implicit OAuth flow | PKCE flow (default in @supabase/ssr) | 2023 | More secure; exchangeCodeForSession required in callback |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Deprecated. Project correctly uses `@supabase/ssr` already.
- `supabase.auth.getSession()` in Server Components/middleware: Still works but flagged as insecure in official docs. Use `getUser()`.

---

## Open Questions

1. **Does next.config.js exist or only next.config.ts?**
   - What we know: Package has Next.js 16.1.6; project uses TypeScript throughout
   - What's unclear: The exact config file extension (was not found in file scan)
   - Recommendation: Check `ls /Users/eb-vm/Documents/claw/wedding-web/svoji/next.config.*` before implementing the build guard; create if missing

2. **Are there any real Supabase users in the production database?**
   - What we know: The project has been in demo mode; production Supabase keys are in .env.local
   - What's unclear: Whether anyone registered during v1.0 testing with real Supabase credentials
   - Recommendation: Run SEC-02 audit query early in the phase to know the scope

3. **Google Cloud Console project -- does one exist?**
   - What we know: AUTH-01 requires Google OAuth; no existing OAuth config visible in codebase
   - What's unclear: Whether a Google Cloud project has been created for this app
   - Recommendation: Create Google Cloud project, enable Google Identity API, create OAuth 2.0 credentials as first step

4. **Single auth page vs separate login/register pages?**
   - What we know: Currently separate pages exist at /login and /register; user left this to Claude's discretion
   - What's unclear: Whether to keep separate pages or merge into one with toggle
   - Recommendation: Keep separate pages -- cleaner URL structure, no toggle state complexity, Google OAuth button works the same on both; register page redirects first-time users to /onboarding, login page redirects returning users to /dashboard

---

## Sources

### Primary (HIGH confidence)
- Supabase official docs -- auth identity linking: https://supabase.com/docs/guides/auth/auth-identity-linking
- Supabase official docs -- server-side advanced guide: https://supabase.com/docs/guides/auth/server-side/advanced-guide
- Supabase official docs -- Google OAuth: https://supabase.com/docs/guides/auth/social-login/auth-google
- Supabase blog post -- identity linking announcement: https://supabase.com/blog/supabase-auth-identity-linking-hooks
- Existing codebase -- src/lib/supabase/*.ts, src/middleware.ts, src/lib/demo-data.ts (direct inspection)

### Secondary (MEDIUM confidence)
- WebSearch verified against official docs: getUser() vs getSession() distinction in middleware
- WebSearch: Next.js build-time env var validation using next.config.js throw pattern
- WebSearch: PKCE flow requirement for @supabase/ssr callback routes

### Tertiary (LOW confidence)
- /auth/confirm route OTP type parameter shape -- verified via docs but not tested against this exact Next.js 16 / @supabase/ssr 0.8.0 combination

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already installed, versions confirmed from package.json
- Architecture: HIGH -- patterns verified against official Supabase docs and existing codebase inspection
- Pitfalls: HIGH -- identity linking behavior verified from official docs; getUser() vs getSession() from official security guidance
- Demo mode removal scope: HIGH -- directly inspected all 8 affected files

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (Supabase SSR is stable; @supabase/ssr 0.8.x API unlikely to change in 30 days)
