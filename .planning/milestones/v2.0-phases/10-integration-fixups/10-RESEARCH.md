# Phase 10: Integration Fix-ups - Research

**Researched:** 2026-03-12
**Domain:** Supabase auth flows (password reset), Next.js route handlers, React state management for rate-limit UX
**Confidence:** HIGH

## Summary

Phase 10 fixes two broken integration flows that were discovered during v2.0 audit. Both are surgical fixes with no new dependencies required -- the entire implementation uses code already present in the project.

**Flow 1 -- Password reset:** The login page sends `resetPasswordForEmail` with `redirectTo: /auth/callback?next=/settings`. However, Supabase password reset emails use token-hash format, so they hit `/auth/confirm` (not `/auth/callback`). The `/auth/confirm` route reads `next` from the URL but then unconditionally overrides it with couples-table new-vs-returning detection. Fix: add `if (type === 'recovery')` branch that honors `next` directly. Also add a password change form to the settings page, detected via Supabase `PASSWORD_RECOVERY` auth event or URL hash.

**Flow 2 -- Rate limit UX:** The `/api/chat` route already returns a structured 429 body with `{ error, resetAt, count, limit }`. However, `ChatInterface.tsx` catches only generic non-ok responses and throws a plain error string -- it never inspects the status code or the structured body. Fix: check `response.status === 429` before throwing, parse the JSON body, and render a system-style chat bubble with the copy from CONTEXT.md. Disable the input while rate-limited.

**Primary recommendation:** Two isolated changes, one per flow. Zero new libraries. Start with the auth/confirm route fix (pure server-side, no state), then password form on settings, then rate-limit UX in ChatInterface.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Add inline "Zmena hesla" section to /settings page (not modal, not separate page), between the wedding info card and the danger zone card
- Use existing Card, Input, Button primitives
- Fields: new password + confirm password
- Detect password reset session via Supabase `onAuthStateChange` PASSWORD_RECOVERY event or URL hash params
- Auto-expand/highlight the password section when user arrives from reset email
- Show success toast/message after password change, then collapse the section
- Fix `/auth/confirm`: when `type=recovery`, honor the `next` param (default `/settings`) instead of couples-table detection
- For non-recovery types (email confirmation), keep existing behavior unchanged
- Chat UI must handle 429 specifically (not fall through to generic error)
- Hard stop (429): inline system chat bubble: "Dnesni limit zprav byl vycerpan. Limit se obnovi o pulnoci."
- Include remaining time until reset (from resetAt) if feasible
- Disable the input/send button when rate limited

### Error copy (exact strings)
- Rate limit hard stop: "Dnesni limit 50 zprav byl vycerpan. Novy limit zacina o pulnoci."
- Password reset success: "Heslo bylo uspesne zmeneno."
- Password reset error: "Nepodarilo se zmenit heslo. Zkuste to znovu."
- Expired reset link: handled by Supabase (redirects to /login with error param -- no action needed)

### Claude's Discretion
- User explicitly delegated all decisions: "nechám všechno na tobě, je to celkem straightforward, udělej to dle best practice."

### Deferred Ideas (OUT OF SCOPE)
None.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 (partial) | User can register/login via Google OAuth -- gap: password reset E2E flow must complete end-to-end without dead-end redirect | Fix `/auth/confirm` recovery branch + add password change form to settings page |
| AI-03 (partial) | Rate limiting with UI feedback -- gap: 429 currently falls to generic error handler, not specific Czech message with reset time | Handle `response.status === 429` explicitly in `ChatInterface.tsx`, render system bubble, disable input |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | already installed | `supabase.auth.updateUser({ password })` for changing password after recovery | Only Supabase method for server-side password update in authenticated session |
| @supabase/ssr | already installed | `createServerClient` in route handlers | Already used in /auth/confirm and /auth/callback |
| React `useState` / `useEffect` | already installed | Rate-limit state, password form state, PASSWORD_RECOVERY detection | Consistent with existing settings page pattern |

### No New Dependencies
This phase adds zero new packages. All required APIs are already in the installed versions.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `onAuthStateChange` PASSWORD_RECOVERY | Check URL hash `#access_token` + `type=recovery` | Hash approach is simpler but deprecated in newer Supabase; event listener is the documented current approach |
| Inline system bubble for 429 | Toast notification | Toast can be dismissed and missed; inline chat bubble is persistent and contextual -- matches the chat UI pattern |

## Architecture Patterns

### File Map for This Phase
```
src/app/auth/confirm/route.ts          # Fix: add type=recovery branch (server, no UI)
src/app/(dashboard)/settings/page.tsx  # Add: password change Card section + recovery detection
src/components/dashboard/ChatInterface.tsx  # Fix: 429-specific handling + disable state
```

No new files needed.

### Pattern 1: Supabase PASSWORD_RECOVERY detection in Client Component

**What:** On page mount (and when auth state changes), check for `PASSWORD_RECOVERY` event from Supabase. This fires when the user lands with a valid recovery session.

**When to use:** Settings page `useEffect` -- listen once, set `isRecoveryMode` state to true, auto-expand the password section.

**Example:**
```typescript
// Source: Supabase SSR auth docs -- onAuthStateChange
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      setIsRecoveryMode(true);
    }
  });
  return () => subscription.unsubscribe();
}, []);
```

### Pattern 2: updateUser for password change

**What:** `supabase.auth.updateUser({ password: newPassword })` -- works when user has an active PASSWORD_RECOVERY session.

**When to use:** Password form submit handler. Must validate new === confirm before calling.

**Example:**
```typescript
// Source: Supabase JS docs -- updateUser
const { error } = await supabase.auth.updateUser({ password: newPassword });
if (error) {
  setPasswordError('Nepodarilo se zmenit heslo. Zkuste to znovu.');
} else {
  setPasswordSuccess('Heslo bylo uspesne zmeneno.');
  setIsRecoveryMode(false); // collapse section
}
```

### Pattern 3: /auth/confirm route fix

**What:** Add early-return branch for `type === 'recovery'` before the couples-table new-vs-returning check.

**Current flow (broken):**
1. `verifyOtp({ token_hash, type })` -- establishes session
2. `getUser()` -- gets user
3. couples table check -- returns /checklist or /onboarding (ignores `next`)

**Fixed flow:**
1. `verifyOtp({ token_hash, type })` -- establishes session
2. `if (type === 'recovery') return NextResponse.redirect(new URL(next || '/settings', request.url))`
3. (else) existing couples table check for email confirmations

```typescript
// After verifyOtp succeeds, before getUser:
if (type === 'recovery') {
  return NextResponse.redirect(new URL(next ?? '/settings', request.url));
}
// existing email confirmation logic follows
```

### Pattern 4: ChatInterface 429 handling

**What:** Before throwing, check `response.status`. If 429, parse the JSON body, extract `resetAt`, compute human-readable time, render a system-style message bubble (role: 'assistant' with distinct styling), and set `isRateLimited` state to disable input.

**Current broken flow:**
```typescript
if (!response.ok) {
  throw new Error('Chyba pri komunikaci s AI');
}
```

**Fixed flow:**
```typescript
if (response.status === 429) {
  const rateLimitData = await response.json();
  const resetTime = rateLimitData.resetAt
    ? format(new Date(rateLimitData.resetAt), 'HH:mm', { locale: cs })
    : 'pulnoc';
  const limitMsg: Message = {
    id: `ratelimit-${Date.now()}`,
    role: 'assistant',
    content: `Dnesni limit 50 zprav byl vycerpan. Novy limit zacina o pulnoci (${resetTime}).`,
    created_at: new Date().toISOString(),
  };
  setMessages((prev) => [...prev, limitMsg]);
  setIsRateLimited(true);
  setIsLoading(false);
  return; // don't throw
}
if (!response.ok) {
  throw new Error('Chyba pri komunikaci s AI');
}
```

Input disabled when `isRateLimited === true`. Since rate limit resets at midnight Prague time, the page reload after midnight clears the state naturally (no need for countdown timer unless desired).

### Anti-Patterns to Avoid
- **Don't use URL hash parsing for recovery detection:** `window.location.hash` parsing is fragile and Supabase recommends `onAuthStateChange` as the canonical approach.
- **Don't redirect `/auth/callback` for password resets:** Supabase's `resetPasswordForEmail` with a custom `redirectTo` sets that URL as the recovery link, BUT Supabase token-hash emails always go to `/auth/confirm` internally. The login page currently sends `redirectTo: /auth/callback?next=/settings` which Supabase may or may not honor depending on the project's email template. Verify in Supabase dashboard email templates -- but fixing `/auth/confirm` covers the confirmed code path.
- **Don't disable submit with CSS only:** Use both `disabled` prop and check `isRateLimited` in `sendMessage` guard to prevent race conditions.
- **Don't forget to remove the optimistic user message on 429:** The user message was already added optimistically before the fetch. On 429, remove it or leave it -- leaving it is fine (the user did type that message), but the design decision should be explicit.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password change after recovery | Custom token parsing | `supabase.auth.updateUser({ password })` | Supabase manages session state internally; the updateUser call is only valid when the recovery session is active |
| Reset time display | Custom timezone math | `date-fns format()` with `cs` locale (already imported in ChatInterface.tsx) | Already in scope, handles locale formatting |
| Rate limit state persistence | localStorage / cookie | React `useState` (`isRateLimited`) | Intentionally ephemeral -- resets on page reload, which is the correct UX after midnight |

## Common Pitfalls

### Pitfall 1: The /auth/callback vs /auth/confirm confusion

**What goes wrong:** Developer fixes `/auth/callback` to read `next`, but password reset emails actually hit `/auth/confirm` (token_hash format), so the fix has no effect.

**Why it happens:** `resetPasswordForEmail` sends an email with Supabase's own token-hash URL. The `redirectTo` parameter in `resetPasswordForEmail` is used as the post-confirmation redirect, but in older Supabase versions it was the email link itself. Current Supabase uses its own hosted email link pointing to `/auth/confirm`.

**How to avoid:** Fix `/auth/confirm/route.ts` (the token-hash handler). The `next` param is already read from the URL there (line 10 in the current file: `const next = searchParams.get('next') ?? '/dashboard'`). The problem is that `next` is read but then ignored when `type=recovery` because the couples-table branch runs unconditionally.

**Warning signs:** After "fix", password reset still goes to /checklist. That means /auth/callback was fixed but /auth/confirm was not.

### Pitfall 2: PASSWORD_RECOVERY event fires before settings page mounts

**What goes wrong:** `onAuthStateChange` subscription is set up in `useEffect`, but if the event fires during SSR or very early client hydration, it may be missed.

**Why it happens:** Next.js client components hydrate after SSR. The auth state change event from Supabase fires once when the session is established.

**How to avoid:** Also check `supabase.auth.getSession()` on mount and inspect `session?.user?.aud` or use `supabase.auth.getUser()` -- if the user has a recovery session, Supabase will surface it. Alternatively: check URL search params for a `recovered=true` flag added by `/auth/confirm` in the recovery redirect (e.g., redirect to `/settings?recovered=true`). This is the most reliable pattern -- the route handler appends the flag, the settings page reads `useSearchParams()` to detect it.

**Recommended approach:** Use BOTH -- `?recovered=true` searchParam from the route handler (reliable) AND `onAuthStateChange` as fallback.

### Pitfall 3: Optimistic user message left stranded on 429

**What goes wrong:** The chat optimistically adds the user message to the list before the fetch. On 429, if the handler just appends a rate-limit bubble, the UI shows: [user message] [rate limit bubble]. This is actually fine -- the user did send that message.

**What is wrong:** If you `return` without cleaning up `isLoading`, the spinner stays forever.

**How to avoid:** In the 429 handler, always call `setIsLoading(false)` before returning.

### Pitfall 4: Password confirm mismatch not caught client-side

**What goes wrong:** User types mismatched passwords, form submits, Supabase accepts the first password (no server-side confirm validation), confirm field is ignored.

**How to avoid:** Validate `newPassword === confirmPassword` in the submit handler before calling `updateUser`. Show inline error: "Hesla se neshoduji."

## Code Examples

### /auth/confirm route fix
```typescript
// src/app/auth/confirm/route.ts
// After: const { error } = await supabase.auth.verifyOtp({ token_hash, type })
// If no error:

if (!error) {
  // PASSWORD_RECOVERY: honor the next param directly
  if (type === 'recovery') {
    return NextResponse.redirect(new URL(next ?? '/settings', request.url));
  }

  // EMAIL CONFIRMATION: existing new-vs-returning detection
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: couple } = await supabase
      .from('couples')
      .select('id')
      .eq('id', user.id)
      .single();
    const redirectTo = couple ? '/checklist' : '/onboarding';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }
  return NextResponse.redirect(new URL(next, request.url));
}
```

Note: also change the recovery redirect to include `?recovered=true` for reliable client-side detection:
```typescript
if (type === 'recovery') {
  const destination = new URL(next ?? '/settings', request.url);
  destination.searchParams.set('recovered', 'true');
  return NextResponse.redirect(destination);
}
```

### Settings page -- password section state additions
```typescript
// New state variables to add to SettingsPage
const [isRecoveryMode, setIsRecoveryMode] = useState(false);
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [passwordSaving, setPasswordSaving] = useState(false);
const [passwordMessage, setPasswordMessage] = useState('');

// In useEffect (or separate useEffect):
// 1. Check URL searchParam
const searchParams = useSearchParams(); // needs 'use client' + Suspense wrapping or already there
if (searchParams.get('recovered') === 'true') {
  setIsRecoveryMode(true);
}
// 2. Supabase event as fallback
const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') setIsRecoveryMode(true);
});
```

### Settings page -- password change handler
```typescript
const changePassword = async () => {
  if (newPassword !== confirmPassword) {
    setPasswordMessage('Hesla se neshoduji.');
    return;
  }
  if (newPassword.length < 8) {
    setPasswordMessage('Heslo musi mit alespon 8 znaku.');
    return;
  }
  setPasswordSaving(true);
  setPasswordMessage('');
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    setPasswordMessage('Nepodarilo se zmenit heslo. Zkuste to znovu.');
  } else {
    setPasswordMessage('Heslo bylo uspesne zmeneno.');
    setIsRecoveryMode(false);
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMessage(''), 4000);
  }
  setPasswordSaving(false);
};
```

### ChatInterface -- rate limit state and 429 handler
```typescript
// Add to component state:
const [isRateLimited, setIsRateLimited] = useState(false);

// In sendMessage, replace generic non-ok check:
if (response.status === 429) {
  const rateLimitData = await response.json();
  const resetTime = rateLimitData.resetAt
    ? format(new Date(rateLimitData.resetAt), 'HH:mm', { locale: cs })
    : null;
  const limitMsg: Message = {
    id: `ratelimit-${Date.now()}`,
    role: 'assistant',
    content: resetTime
      ? `Dnesni limit 50 zprav byl vycerpan. Novy limit zacina o pulnoci (${resetTime}).`
      : 'Dnesni limit 50 zprav byl vycerpan. Novy limit zacina o pulnoci.',
    created_at: new Date().toISOString(),
  };
  setMessages((prev) => [...prev, limitMsg]);
  setIsRateLimited(true);
  setIsLoading(false);
  return;
}
if (!response.ok) {
  throw new Error('Chyba pri komunikaci s AI');
}

// Update Input and Button disabled conditions:
// Input: disabled={isLoading || isRateLimited}
// Button: disabled={isLoading || isRateLimited || !input.trim()}
// sendMessage guard: if (!input.trim() || isLoading || isRateLimited) return;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| URL hash parsing for recovery | `onAuthStateChange` PASSWORD_RECOVERY | Supabase v2 | More reliable, no manual hash parsing |
| `exchangeCodeForSession` for all auth | `verifyOtp({ token_hash, type })` for email OTP | Supabase v2 SSR | Separate routes: /auth/callback (PKCE), /auth/confirm (OTP) |

## Open Questions

1. **Does Supabase use /auth/callback or /auth/confirm for the reset email link?**
   - What we know: `resetPasswordForEmail(email, { redirectTo: '...' })` sets a redirect. Current Supabase sends its own hosted email with token_hash format, landing on `/auth/confirm`. The `redirectTo` param in `resetPasswordForEmail` is set as the post-OTP redirect destination in the email link, NOT as the email link itself.
   - What's unclear: Whether the Supabase project's email template has been customized to use the `redirectTo` directly as the email link (which would make it hit `/auth/callback`).
   - Recommendation: Fix BOTH routes for robustness. `/auth/confirm` gets the recovery branch. `/auth/callback` can also be updated to read `next` param (trivial change, no harm). Fixing both covers all scenarios.

2. **Should isRateLimited reset automatically at midnight?**
   - What we know: Prague midnight reset is in the DB. The UI state is ephemeral.
   - What's unclear: Whether users expect a countdown timer or just a message.
   - Recommendation: No countdown timer (out of scope per CONTEXT). Show static message with the reset time (HH:mm format from resetAt). User can reload after midnight to continue.

## Validation Architecture

> `workflow.nyquist_validation` is absent from config.json -- treated as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed -- no jest.config, no vitest.config, no test scripts in package.json |
| Config file | None -- Wave 0 must create if tests are to be automated |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -- Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | `/auth/confirm` with `type=recovery` redirects to `/settings` (not /checklist) | unit (route handler logic) | manual-only -- requires Supabase session | N/A |
| AUTH-01 | Password change form submits and calls `updateUser` | manual-only | Requires active recovery session | N/A |
| AUTH-01 | Password mismatch shows error without calling API | unit (client logic) | manual-only | N/A |
| AI-03 | ChatInterface renders rate-limit bubble on 429 | unit (component) | manual-only -- no test framework | N/A |
| AI-03 | ChatInterface disables input when rate-limited | unit (component) | manual-only | N/A |

**Note:** All tests for this phase are manual-only. There is no test framework installed in this project. The prior phases (8, 9) were verified through UAT (manual user acceptance testing via `/gsd:verify-work`), which is the established pattern for this project.

### Sampling Rate
- Per task commit: Manual browser verification
- Per wave merge: Full UAT scenario walkthrough
- Phase gate: All 4 success criteria from phase description met before `/gsd:verify-work`

### Wave 0 Gaps
None -- no test framework to install given project convention of UAT-based verification.

*(If test coverage is desired in the future, Playwright E2E would be the appropriate choice for auth flows. Not in scope for this phase.)*

## Sources

### Primary (HIGH confidence)
- Code inspection: `/Users/eb-vm/Documents/claw/wedding-web/svoji/src/app/auth/confirm/route.ts` -- confirmed `next` is read but ignored for recovery type
- Code inspection: `/Users/eb-vm/Documents/claw/wedding-web/svoji/src/components/dashboard/ChatInterface.tsx` -- confirmed generic `!response.ok` check with no 429 branch
- Code inspection: `/Users/eb-vm/Documents/claw/wedding-web/svoji/src/app/api/chat/route.ts` -- confirmed 429 body includes `resetAt`, `count`, `limit`
- Code inspection: `/Users/eb-vm/Documents/claw/wedding-web/svoji/src/lib/rate-limit.ts` -- confirmed `resetAt` is Prague midnight ISO string
- Code inspection: `/Users/eb-vm/Documents/claw/wedding-web/svoji/src/app/(auth)/login/page.tsx` -- confirmed `redirectTo: /auth/callback?next=/settings` in resetPasswordForEmail call

### Secondary (MEDIUM confidence)
- Supabase SSR auth pattern: `onAuthStateChange` for `PASSWORD_RECOVERY` event is the documented approach in @supabase/ssr v0.5+
- `supabase.auth.updateUser({ password })` is the documented method for updating password in an active recovery session

### Tertiary (LOW confidence)
- Assumption that Supabase sends token-hash emails that land on `/auth/confirm` (not `/auth/callback`). This is the standard behavior but could differ if custom email templates are used in this Supabase project. Verification: check Supabase dashboard > Authentication > Email Templates.

## Metadata

**Confidence breakdown:**
- Route fix (auth/confirm): HIGH -- code is directly inspected, change is a 4-line conditional
- Password form (settings): HIGH -- settings page is fully readable, pattern matches existing save handlers
- Rate limit UX (ChatInterface): HIGH -- API contract confirmed, both sides of the fetch fully read
- Supabase recovery session detection: MEDIUM -- `onAuthStateChange` is documented, but `?recovered=true` param approach adds reliability hedge

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable -- Supabase auth APIs don't change frequently)
