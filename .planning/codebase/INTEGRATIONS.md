# External Integrations

**Analysis Date:** 2026-02-28

## APIs & External Services

**AI & Chatbot:**
- Anthropic Claude - AI wedding planning assistant
  - SDK: `@anthropic-ai/sdk` 0.78.0
  - Auth: `ANTHROPIC_API_KEY` environment variable
  - Model used: `claude-sonnet-4-20250514`
  - Endpoint: `src/app/api/chat/route.ts`
  - Purpose: Provides context-aware wedding planning advice in Czech

## Data Storage

**Databases:**
- Supabase PostgreSQL - Primary database for all application data
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Client: `@supabase/supabase-js` 2.98.0 for browser, `@supabase/ssr` 0.8.0 for server
  - Authentication: Supabase Auth (native)

**Database Schema:**
Schema defined in `supabase/migrations/`:
- `001_initial_schema.sql` - Core tables: weddings, rsvp_responses, content_sections, gallery_photos, locations, timeline_items, contacts
- `002_couples_and_planning.sql` - User planning tables: couples, checklist_items, budget_items, guests, chat_messages, vendors
- `003_wedding_websites.sql` - Website-specific data: wedding_websites table

**File Storage:**
- Supabase Storage (integrated) - For hero images and gallery photos via Supabase
- Configuration: URLs stored as text fields in database (`hero_image_url`, `image_url`)

**Caching:**
- None detected - Application uses client-side React state and server-side session management

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Native authentication
  - Implementation: `src/lib/supabase/middleware.ts` for session management
  - Server-side auth: `src/lib/supabase/server.ts` using `createServerClient`
  - Client-side auth: `src/lib/supabase/client.ts` using `createBrowserClient`
  - Protected routes: `(dashboard)` route group requires authenticated session
  - Auth flow: Registration → Onboarding → Dashboard access

**Session Handling:**
- Middleware at `src/middleware.ts` updates Supabase session on each request
- Cookie-based session storage (configured in SSR client)
- Demo mode available via `NEXT_PUBLIC_DEMO_MODE` for testing without authentication

## Monitoring & Observability

**Error Tracking:**
- Console logging only - No external error tracking service detected
- Error handling in API routes: `src/app/api/chat/route.ts` and `src/app/api/rsvp/route.ts`

**Logs:**
- Server-side: `console.error()` and `console.warn()` for debugging
- API error responses include error messages for client-side handling

## CI/CD & Deployment

**Hosting:**
- Vercel (implied) - Standard Next.js deployment platform
- Environment variables configured in Vercel dashboard

**CI Pipeline:**
- GitHub Actions (detected via `.git/` directory)
- No explicit CI config found in repository

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous API key for browser
- `ANTHROPIC_API_KEY` - Anthropic Claude API key (optional, gracefully disabled if missing)

**Optional env vars:**
- `NEXT_PUBLIC_DEMO_MODE` - Boolean to enable demo mode with mock data

**Secrets location:**
- `.env.local` - Local development (git-ignored)
- Vercel dashboard - Production environment variables
- Reference: `.env.example` contains template with placeholder values

## Webhooks & Callbacks

**Incoming:**
- RSVP form submissions: `src/app/api/rsvp/route.ts`
  - Accepts POST requests with guest RSVP data
  - Validates with Zod schema
  - Stores in `guests` or legacy `rsvp_responses` table

**Outgoing:**
- None detected - No outgoing webhooks or callbacks to external services

## Form Validation & Data Handling

**Validation Framework:**
- Zod 4.3.6 for schema definition and runtime validation
- Server-side: `src/app/api/rsvp/route.ts` validates RSVP data
- Client-side: `src/components/sections/RSVP.tsx` uses react-hook-form + zod resolver

**Validation Schemas:**
```
RSVP Form (src/components/sections/RSVP.tsx):
- name: string (min 2 chars)
- email: string (valid email)
- attending: enum ['yes', 'no']
- guestCount: number (1-5, optional)
- dietary: string (optional)
- notes: string (optional)
```

## Integration Points

**Chat API (`src/app/api/chat/route.ts`):**
1. Receives user message + couple context
2. Verifies authentication with Supabase
3. Retrieves chat history from `chat_messages` table
4. Calls Anthropic Claude API with system prompt
5. Stores conversation in database

**RSVP API (`src/app/api/rsvp/route.ts`):**
1. Validates incoming RSVP data
2. Looks up wedding website by ID
3. Creates or updates guest record in `guests` table
4. Falls back to legacy `rsvp_responses` for backward compatibility

---

*Integration audit: 2026-02-28*
