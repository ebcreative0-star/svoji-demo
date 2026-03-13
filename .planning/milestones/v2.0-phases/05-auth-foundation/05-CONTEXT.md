# Phase 5: Auth Foundation - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Real authentication replaces demo mode. Users can sign in with Google OAuth or email/password. Existing email accounts link correctly with Google OAuth. Unauthenticated users are redirected to login. DEMO_MODE bypass is removed from production.

</domain>

<decisions>
## Implementation Decisions

### Auth methods
- Google OAuth + email/password -- both available for login and registration
- New users can register via Google OR email/password (both paths supported)
- Email verification required for new email/password signups (Supabase built-in)
- Password reset flow included ("Zapomenuté heslo?" link on login page, Supabase built-in reset via email)
- Google OAuth must link with existing email accounts -- no duplicate accounts for same email (AUTH-02)

### Login page presentation
- Google button positioned on top, prominent and large
- "nebo" divider between Google and email/password form
- Email/password form below the divider
- Premium centered card layout on subtle gradient/pattern background (Stripe/Linear style)
- Card-only design, no split layout with side panel
- Consistent with Svoji design system (OKLCH palette, Cormorant headings, rounded corners)

### Post-login routing
- Returning users redirect to /dashboard
- New users (first sign-up) redirect to /onboarding
- Phase 5 only wires the new-vs-returning detection and redirect logic
- Actual onboarding flow built in Phase 7
- Key UX decision: onboarding happens BEFORE registration -- user goes through onboarding steps, then gets prompted to register to save their choices
- Onboarding choices stored in localStorage pre-registration, persisted to DB on signup

### Demo mode transition
- Replace hardcoded `DEMO_MODE = true` with `NEXT_PUBLIC_DEMO_MODE` environment variable
- When DEMO_MODE is true (dev): demo/demo login shortcut visible, mock data (DEMO_COUPLE etc.) loads
- When DEMO_MODE is false/absent (production): no demo shortcuts, real auth enforced
- Build-time safeguard: fail the build if DEMO_MODE is accidentally set to true in production environment

### Claude's Discretion
- Login vs register as separate pages or single page with toggle
- Exact gradient/pattern for auth page background
- OAuth callback route structure
- Account linking implementation details (Supabase handles most of this)
- Error message copy for auth failures
- Loading states during OAuth redirect

</decisions>

<specifics>
## Specific Ideas

- Auth pages should feel like Stripe or Linear login -- clean premium centered card, not a traditional form page
- Onboarding-before-registration flow: Landing -> Onboarding steps -> "Zaregistrujte se pro ulozeni" -> Google/email signup -> Dashboard (localStorage bridges the gap)
- This pre-registration onboarding pattern means Phase 7 needs to account for both anonymous and authenticated onboarding paths

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/Button`: Button component with variants (primary, secondary) and isLoading prop -- use for auth buttons
- `src/components/ui/Input`: Input component with focus transitions -- use for email/password fields
- `src/components/ui/Card`: Card component with shadow/rounded variants -- use for auth card container
- `src/lib/supabase/server.ts`: Server-side Supabase client with cookie-based auth already configured
- `src/lib/supabase/client.ts`: Browser-side Supabase client ready for OAuth calls
- `src/lib/supabase/middleware.ts`: Middleware with session handling (currently bypassed by DEMO_MODE)

### Established Patterns
- Cookie-based session via @supabase/ssr -- middleware refreshes on each request
- `isDemoMode()` utility from `src/lib/demo-data.ts` -- used across components for conditional data loading
- Route groups: `(auth)` for login/register/onboarding, `(dashboard)` for protected routes
- API routes verify auth before data access (pattern in `/api/chat`)

### Integration Points
- `src/middleware.ts` -- Entry point for auth checks, currently delegates to updateSession()
- `src/app/(auth)/login/page.tsx` -- Existing login page to be rebuilt
- `src/app/(auth)/register/page.tsx` -- Existing register page to be rebuilt
- `src/app/(dashboard)/layout.tsx` -- Dashboard layout checks auth, loads couple data
- Need new: `/auth/callback` route for OAuth redirect handling
- Need new: `/auth/confirm` route for email verification

</code_context>

<deferred>
## Deferred Ideas

- Onboarding-before-registration flow (pre-auth onboarding steps) -- Phase 7 will build the actual onboarding UI, Phase 5 only wires redirect logic
- Note for Phase 7: onboarding must work in anonymous mode (localStorage) and persist to DB after registration

</deferred>

---

*Phase: 05-auth-foundation*
*Context gathered: 2026-03-01*
