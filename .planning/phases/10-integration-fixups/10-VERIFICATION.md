---
phase: 10-integration-fixups
verified: 2026-03-12T22:00:00Z
status: gaps_found
score: 3/4 must-haves verified
re_verification: false
gaps:
  - truth: "User who clicks password reset email lands on /settings with password form visible -- not /checklist"
    status: failed
    reason: "Route /auth/confirm defaults next to '/dashboard' at line 10. The fallback '/settings' on line 36 is dead code because next is never null -- it already resolved to '/dashboard'. Password reset email click lands on /dashboard?recovered=true, not /settings?recovered=true. The password change card is only on /settings."
    artifacts:
      - path: "src/app/auth/confirm/route.ts"
        issue: "Line 10: next defaults to '/dashboard'. Line 36: 'next ?? /settings' -- next is always '/dashboard' at this point, so fallback never fires."
    missing:
      - "Change line 10 from `const next = searchParams.get('next') ?? '/dashboard'` to `const next = searchParams.get('next')`"
      - "Line 36 `new URL(next ?? '/settings', request.url)` then correctly defaults to /settings when no next param is present in the reset email link"
      - "This makes the recovery redirect always land on /settings?recovered=true unless a ?next= override is provided"
human_verification:
  - test: "Send real password reset email and click the link"
    expected: "User lands on /settings with password card highlighted (ring-2 visible)"
    why_human: "Cannot trigger real Supabase email flow programmatically during verification"
  - test: "Enter mismatched passwords in the password change form and submit"
    expected: "Czech error message 'Hesla se neshoduji.' appears inline"
    why_human: "Requires browser interaction to verify form validation UX"
  - test: "Enter valid matching password of 8+ characters and submit"
    expected: "Czech success message 'Heslo bylo uspesne zmeneno.' appears, fields clear, ring highlight disappears"
    why_human: "Requires live Supabase session with active recovery token"
  - test: "Send 50 chat messages in a session and observe the 51st attempt"
    expected: "Czech bubble appears: 'Dnesni limit 50 zprav byl vycerpan. Novy limit zacina o pulnoci (HH:mm).' Input and button go disabled."
    why_human: "Rate limit state requires 50 real API calls to trigger"
---

# Phase 10: Integration Fixups Verification Report

**Phase Goal:** Password reset flow works end-to-end and rate limit UX shows meaningful feedback instead of generic errors
**Verified:** 2026-03-12T22:00:00Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User who clicks password reset email lands on /settings with password form visible | FAILED | `/auth/confirm` line 10 defaults `next` to `/dashboard`; the `?? '/settings'` on line 36 is dead code. User lands on `/dashboard?recovered=true`, not `/settings?recovered=true`. Password card only exists on `/settings`. |
| 2 | User can set a new password via the settings page after arriving from reset email | VERIFIED (conditional) | `changePassword` handler exists at settings/page.tsx:138, validates match + length, calls `supabase.auth.updateUser`, shows Czech messages. Works correctly once user reaches /settings -- but truth #1 failure means they won't get there via email link. |
| 3 | User who hits 50-message rate limit sees Czech message with reset time, not a generic error | VERIFIED | `ChatInterface.tsx` line 91: `if (response.status === 429)` branch parses `resetAt`, formats to `HH:mm` using `format + cs`, inserts assistant-role bubble with Czech copy including reset time. |
| 4 | Input and send button are disabled when rate-limited | VERIFIED | Line 219: `disabled={isLoading \|\| isRateLimited}`. Line 226: `disabled={isLoading \|\| isRateLimited \|\| !input.trim()}`. Line 54 guard: `if (!input.trim() \|\| isLoading \|\| isRateLimited) return`. All three gates confirmed. |

**Score:** 3/4 truths verified (truth #1 failed, truth #2 conditionally verified but dependent on #1)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/auth/confirm/route.ts` | Recovery-type branch that redirects to /settings?recovered=true | PARTIAL | Branch exists at line 35 (`if (type === 'recovery')`). Redirect sets `recovered=true`. But destination base is `/dashboard` not `/settings` due to line 10 default. Pattern `type === 'recovery'` is present but destination is wrong. |
| `src/app/(dashboard)/settings/page.tsx` | Password change Card section with recovery detection | VERIFIED | Card exists at line 522-566. `isRecoveryMode` state at line 43. Detection via URLSearchParams (line 59-62) and `onAuthStateChange` (line 66-69). `changePassword` handler at line 138. Ring highlight at line 523. |
| `src/components/dashboard/ChatInterface.tsx` | 429-specific rate limit handling with system bubble | VERIFIED | `response.status === 429` at line 91. `isRateLimited` state at line 40. Czech bubble with `HH:mm` format at lines 96-103. `setIsLoading(false)` before `return` at line 106. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/auth/confirm/route.ts` | `src/app/(dashboard)/settings/page.tsx` | redirect with ?recovered=true searchParam | BROKEN | Redirect goes to `/dashboard?recovered=true` not `/settings?recovered=true`. Pattern `recovered.*true` is present in the redirect (line 37) but the destination URL base resolves to `/dashboard` because `next` is never null at line 36 (already defaulted to `/dashboard` at line 10). |
| `src/components/dashboard/ChatInterface.tsx` | `/api/chat` | 429 status check before generic error | VERIFIED | Line 91 `response.status === 429` fires before the generic `!response.ok` throw at line 110. Response JSON parsed, `resetAt` extracted and formatted. |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| AUTH-01 | 10-01-PLAN.md | User can register/login via Google OAuth (Supabase built-in) | PARTIALLY ADDRESSED | Phase 10 extends AUTH-01 to cover the password reset sub-flow. The recovery route branch is implemented but has a redirect destination bug. AUTH-01 core (OAuth login) was complete in Phase 5. |
| AI-03 | 10-01-PLAN.md | Rate limiting with UI feedback | SATISFIED | 429 handling in ChatInterface delivers Czech feedback with reset time, disabled input/button. The rate limit itself was implemented in Phase 8; Phase 10 fixed the UX gap. |

**Requirement scope note:** AUTH-01 as defined in REQUIREMENTS.md is "User can register/login via Google OAuth." Phase 10 addresses the password reset sub-flow which extends AUTH-01 scope. The PLAN correctly marks this as `partial`. AI-03 is fully satisfied by Phase 10 changes.

**No orphaned requirements found.** REQUIREMENTS.md maps AUTH-01 to Phase 5 and AI-03 to Phase 8. Phase 10 extends both as fixups, consistent with its integration-fixup nature.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/auth/confirm/route.ts` | 10 | `?? '/dashboard'` default makes line-36 fallback unreachable | Blocker | Password reset flow redirects to `/dashboard` instead of `/settings` |
| `src/app/auth/confirm/route.ts` | 36 | `next ?? '/settings'` is dead code | Warning | Misleading -- the intent was `/settings` as fallback but it never fires |

All `placeholder` strings in settings/page.tsx and ChatInterface.tsx are standard HTML input placeholder attributes, not stub code.

### Human Verification Required

#### 1. Password Reset Email Flow (blocked by gap -- fix first)

**Test:** Request password reset from login page, click email link
**Expected:** Land on /settings with password card highlighted (ring-2 border visible)
**Why human:** Requires real Supabase email delivery and browser navigation

#### 2. Password Change Form Validation

**Test:** Navigate to /settings?recovered=true, enter mismatched passwords, submit
**Expected:** Inline error "Hesla se neshoduji." in red below button
**Why human:** Requires browser interaction with live Supabase session

#### 3. Password Change Success

**Test:** Enter matching passwords of 8+ characters on /settings in recovery mode, submit
**Expected:** "Heslo bylo uspesne zmeneno." in green, fields clear, ring highlight disappears after 4 seconds
**Why human:** Requires active Supabase recovery session token

#### 4. Rate Limit Chat Bubble

**Test:** Send 50 chat messages, send 51st
**Expected:** Assistant bubble appears: "Dnesni limit 50 zprav byl vycerpan. Novy limit zacina o pulnoci (HH:mm)." Input and send button disabled.
**Why human:** Rate limit state requires 50 real API calls to trigger (cannot mock during static verification)

## Gaps Summary

One gap is blocking full goal achievement.

**Root cause:** In `src/app/auth/confirm/route.ts`, the `next` variable is assigned at line 10 with a default fallback of `'/dashboard'`:

```typescript
const next = searchParams.get('next') ?? '/dashboard'
```

When Supabase delivers a password reset email, the link goes to `/auth/confirm?token_hash=XXX&type=recovery` -- there is no `?next=` param in that URL (Supabase does not forward the `redirectTo` path into `/auth/confirm` query params). So `next` resolves to `/dashboard`.

Line 36 then tries to use `/settings` as a fallback:

```typescript
const destination = new URL(next ?? '/settings', request.url);
```

But `next` is already `'/dashboard'` at this point -- the `?? '/settings'` never fires. The user lands on `/dashboard?recovered=true`, where the password change card does not exist.

**Fix is minimal:** Change line 10 to not default `next`, and let line 36 provide the correct default:

```typescript
// Line 10 -- remove the default:
const next = searchParams.get('next')

// Line 36 already has the right fallback:
const destination = new URL(next ?? '/settings', request.url);
```

This one-line change makes password reset emails redirect to `/settings?recovered=true` by default, while still honoring any explicit `?next=` override.

---

_Verified: 2026-03-12T22:00:00Z_
_Verifier: Claude (gsd-verifier)_
