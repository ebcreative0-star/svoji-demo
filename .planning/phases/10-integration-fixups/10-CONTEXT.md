# Phase 10: Integration Fix-ups - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix two broken integration flows from v2.0 audit: (1) password reset E2E flow that currently dead-ends because `/auth/callback` ignores the `next` searchParam and `/settings` has no password change form, and (2) rate limit UX that shows generic errors instead of meaningful feedback when users hit the 50-message daily cap.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

User explicitly delegated all decisions for this phase -- "nechám všechno na tobě, je to celkem straightforward, udělej to dle best practice."

#### Password reset form
- Add inline "Zmena hesla" section to `/settings` page (not modal, not separate page)
- Place it between the wedding info card and the danger zone card
- Use existing Card, Input, Button primitives
- Fields: new password + confirm password
- Detect password reset session via Supabase `onAuthStateChange` PASSWORD_RECOVERY event or URL hash params
- Auto-expand/highlight the password section when user arrives from reset email
- Show success toast/message after password change, then collapse the section

#### Post-reset redirect flow
- `/auth/callback` must read and honor the `next` searchParam (currently ignores it)
- Password reset emails use `/auth/callback?next=/settings` (already configured in login page)
- But `/auth/callback` uses PKCE code exchange -- password resets go through `/auth/confirm` (token_hash + type=recovery)
- Fix `/auth/confirm`: when `type=recovery`, honor the `next` param (default `/settings`) instead of overriding with new-vs-returning detection
- For non-recovery types (email confirmation), keep existing behavior (check couples table, redirect to /checklist or /onboarding)

#### Rate limit feedback
- Chat UI must handle 429 status specifically (not fall through to generic error)
- Hard stop (429): show inline chat bubble styled as system message with: "Dnesni limit zprav byl vycerpan. Limit se obnovi o pulnoci."
- Include remaining time until reset (from resetAt in response) if feasible
- Warning (already appended to AI response): keep existing approach, it works
- Disable the input/send button when rate limited (prevent repeated failed sends)

#### Error copy
- Rate limit hard stop: "Dnesni limit 50 zprav byl vycerpan. Novy limit zacina o pulnoci."
- Rate limit warning: keep existing copy (already has Czech pluralization)
- Password reset success: "Heslo bylo uspesne zmeneno."
- Password reset error: "Nepodarilo se zmenit heslo. Zkuste to znovu."
- Expired reset link: handled by Supabase (redirects to /login with error param)

</decisions>

<specifics>
## Specific Ideas

No specific requirements -- open to standard approaches. User wants best practices applied.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Card`, `Input`, `Button` components: use for password form on settings page
- `src/lib/rate-limit.ts`: already returns `resetAt`, `remaining`, `warning` -- chat route already includes these in 429 response body
- `src/app/(dashboard)/settings/page.tsx`: existing settings page, add password section here
- `src/app/(auth)/login/page.tsx`: `handlePasswordReset` already sends reset email with `redirectTo: /auth/callback?next=/settings`

### Established Patterns
- Supabase `resetPasswordForEmail()` sends email with link to `/auth/confirm?token_hash=...&type=recovery`
- Note: login page uses `/auth/callback?next=/settings` but Supabase reset emails actually hit `/auth/confirm` -- need to verify which route receives the reset click
- Settings page uses inline success/error messages (green/red text next to save buttons)
- Chat API returns structured error JSON with `error`, `resetAt`, `count`, `limit` fields on 429

### Integration Points
- `/auth/confirm/route.ts` (line 10): reads `next` param but overrides with couples table check -- needs conditional logic for `type=recovery`
- `/auth/callback/route.ts`: does NOT read `next` param at all -- may need fix too if Supabase routes resets here
- `src/app/(dashboard)/chat/page.tsx` or `ChatInterface.tsx`: needs 429-specific error handling in fetch response
- `src/app/(dashboard)/settings/page.tsx`: needs new password change Card section
- `supabase.auth.updateUser({ password })`: Supabase method for setting new password after recovery

</code_context>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope.

</deferred>

---

*Phase: 10-integration-fixups*
*Context gathered: 2026-03-12*
