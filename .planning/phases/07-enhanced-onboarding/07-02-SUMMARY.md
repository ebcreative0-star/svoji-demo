---
phase: 07-enhanced-onboarding
plan: 02
subsystem: auth, ai
tags: [next.js, supabase, oauth, ai-chat, onboarding, registration]

# Dependency graph
requires:
  - phase: 07-enhanced-onboarding
    plan: 01
    provides: URLSearchParams handoff from /onboarding to /register, Couple interface with new fields, DB migration 004
provides:
  - Register page reads onboarding URL params and persists all fields to couples table on email signup
  - OAuth callback route decodes onboarding param and upserts to couples table post-Google-auth
  - Extended ChatContext with guestCountRange, location, searchRadiusKm, weddingStyle
  - buildSystemPrompt with null-safe date, location-aware vendor recommendations, personalized first-message template
affects:
  - 07-03 (any further onboarding improvements)
  - AI chat quality (richer context = more personalized responses)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Base64-encoded JSON via btoa/atob to pass onboarding data through OAuth redirect chain
    - Immediate couples upsert after signUp() before email confirmation (data persists before redirect)
    - Null-safe date handling in system prompt with Czech locale fallback string
    - Deprecated field backward compat via optional interface field (weddingSize?)

key-files:
  created: []
  modified:
    - src/app/(auth)/register/page.tsx
    - src/app/auth/callback/route.ts
    - src/app/api/chat/route.ts
    - src/components/dashboard/ChatInterface.tsx
    - src/app/(dashboard)/chat/page.tsx

key-decisions:
  - "OAuth onboarding passthrough uses btoa(JSON.stringify(data)) in redirectTo URL -- sessionStorage not viable since callback is a server route"
  - "Email signup writes couples row immediately after signUp() before email confirmation -- ensures row exists when user confirms and gets redirected"
  - "weddingSize kept as optional backward compat field in ChatContext; guestCountRange takes precedence in prompt generation"

requirements-completed: [ONBD-07]

# Metrics
duration: ~3min
completed: 2026-03-01
---

# Phase 7 Plan 02: Data Pipeline Wiring Summary

**Onboarding data flows end-to-end: /register reads URLSearchParams and persists to DB for both email and Google OAuth signup paths; AI chat system prompt enriched with location, style, guest count, and null-safe date handling**

## Performance

- **Duration:** ~3 min
- **Completed:** 2026-03-01
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Register page reads 10 URL params from onboarding (p1, p2, date, guests, location, radius, style, budget, gdpr, marketing)
- Email signup: upserts couples row immediately after `signUp()` with all onboarding fields and `onboarding_completed: true`
- Google OAuth: encodes onboarding data as base64 JSON in the `redirectTo` callback URL; auth callback route decodes and upserts
- Confirmation UI shows "Planujete svatbu jako X a Y" when onboarding params are present
- AI ChatContext extended with 4 new fields: `guestCountRange`, `location`, `searchRadiusKm`, `weddingStyle`
- `buildSystemPrompt()` handles null wedding date gracefully (shows 'datum zatim neni stanoveno')
- System prompt includes location + radius line for vendor recommendations and a PRVNI ZPRAVA template for personalized greetings
- All 5 files compile cleanly with `tsc --noEmit`

## Task Commits

1. **Task 1: Register page + auth callback** - `3317f53` (feat)
2. **Task 2: Extend AI chat context** - `e03157d` (feat)

## Files Created/Modified

- `src/app/(auth)/register/page.tsx` - Added useSearchParams, onboardingData parsing, BUDGET_MAP, confirmation UI, couples upsert after email signup, btoa-encoded onboarding in Google OAuth redirectTo
- `src/app/auth/callback/route.ts` - Reads `onboarding` param, decodes btoa, upserts to couples table before redirect decision
- `src/app/api/chat/route.ts` - New ChatContext interface with 4 fields, rewritten buildSystemPrompt with null-safe date, location/radius/style support, first-message template
- `src/components/dashboard/ChatInterface.tsx` - CoupleContext updated with 4 new fields, fetch body sends all fields
- `src/app/(dashboard)/chat/page.tsx` - Passes guest_count_range, location, search_radius_km, wedding_style from DB; demo mode updated with null defaults

## Decisions Made

- OAuth onboarding passthrough uses `btoa(JSON.stringify(data))` in the `redirectTo` URL. sessionStorage was the first instinct but auth callback is a server route -- can't read sessionStorage server-side. URL param survives the OAuth redirect chain.
- Email signup writes couples row before showing the success message. This ensures that when the user confirms their email and /auth/confirm runs, the couple row already exists and redirects to /dashboard (not /onboarding).
- `weddingSize` kept as optional backward compat field. ChatContext has `weddingSize?: string` so old clients still work. New field `guestCountRange` takes precedence.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- src/app/(auth)/register/page.tsx: FOUND
- src/app/auth/callback/route.ts: FOUND
- src/app/api/chat/route.ts: FOUND
- src/components/dashboard/ChatInterface.tsx: FOUND
- src/app/(dashboard)/chat/page.tsx: FOUND
- commit 3317f53 (Task 1): FOUND
- commit e03157d (Task 2): FOUND
