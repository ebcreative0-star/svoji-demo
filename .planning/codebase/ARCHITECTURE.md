# Architecture

**Analysis Date:** 2026-02-28

## Pattern Overview

**Overall:** Next.js 16 full-stack application following App Router pattern with layered architecture separating presentation, API logic, and data access.

**Key Characteristics:**
- Server and Client Components coexist for optimal rendering
- API routes handle external integrations (Anthropic Claude, Supabase)
- Demo mode toggle allows offline development without external dependencies
- Route groups organize auth and dashboard flows
- Middleware handles session management

## Layers

**Presentation Layer (Components & Pages):**
- Purpose: Render UI and handle user interactions
- Location: `src/app/`, `src/components/`
- Contains: Page components, Client Components for interactivity, UI sections
- Depends on: Library utilities, API routes, Supabase client
- Used by: Browser rendering, Next.js App Router

**API Layer (Server-side Logic):**
- Purpose: Handle external API calls, business logic, authentication checks
- Location: `src/app/api/`
- Contains: Route handlers for `/chat`, `/rsvp` endpoints
- Depends on: Anthropic SDK, Supabase server client, validation schemas
- Used by: Client components via fetch(), form submissions

**Data Access Layer (Supabase Integration):**
- Purpose: Database abstraction and session management
- Location: `src/lib/supabase/`
- Contains: Server client, browser client, middleware auth flow
- Depends on: @supabase/ssr, @supabase/supabase-js
- Used by: API routes, Server Components, Client Components

**Business Logic Layer (Utilities & Helpers):**
- Purpose: Generate content, prepare data, application state logic
- Location: `src/lib/`, `src/data/`
- Contains: Type definitions, demo data, checklist generation, wedding data structures
- Depends on: External libraries (date-fns, zod)
- Used by: Components and API routes

## Data Flow

**Chat Message Flow:**

1. User types in ChatInterface (`src/components/dashboard/ChatInterface.tsx`)
2. Form submission sends POST to `/api/chat` with message, coupleId, context
3. API route validates auth, builds system prompt with couple context
4. Claude API called with conversation history + new message
5. Response saved to Supabase `chat_messages` table
6. API returns message to client
7. ChatInterface appends message to local state and updates UI

**RSVP Flow:**

1. Guest submits form on public wedding page (`src/app/w/[slug]/page.tsx` or similar)
2. POST to `/api/rsvp` with guest data and optional websiteId
3. API validates with zod schema
4. Looks up couple from wedding website, checks existing guest
5. Insert or update guest record in Supabase `guests` table
6. Fallback to `rsvp_responses` table if no websiteId
7. Returns success/error to client

**Dashboard Data Load:**

1. User accesses dashboard route (`src/app/(dashboard)/*`)
2. Server Component checks auth via middleware + server-side session
3. Demo mode bypasses auth - returns hardcoded DEMO_COUPLE + demo data
4. Layout renders DashboardNav with couple names
5. Child pages fetch additional data (checklist, budget, guests) from Supabase or demo
6. Client Components manage local state mutations (add/delete/update)

**State Management:**

- Components use React `useState` for local UI state (form inputs, loading states)
- Supabase client handles optimistic updates where possible
- No global state management (Redux/Zustand) - kept simple for prototype
- Demo data (`src/lib/demo-data.ts`) provides fallback when database unavailable

## Key Abstractions

**Couple Context:**
- Purpose: Represent wedding planning unit with partner names, dates, budget
- Examples: `src/lib/types.ts` (Couple interface), `src/lib/demo-data.ts` (DEMO_COUPLE)
- Pattern: Passed through component props, used to build AI system prompts, filters database queries

**Chat System Prompt Builder:**
- Purpose: Generate contextual Claude instructions based on couple details
- Examples: `src/app/api/chat/route.ts` buildSystemPrompt()
- Pattern: Takes ChatContext, calculates days/months until wedding, formats couple info, returns system prompt string

**Budget Category Groups:**
- Purpose: Organize expenses by type with icons and calculations
- Examples: `src/components/dashboard/BudgetView.tsx` BUDGET_CATEGORIES
- Pattern: Static array of {value, label, icon}, dynamically grouped in UI, filtered by items

**Validation Schemas:**
- Purpose: Runtime type checking and API input validation
- Examples: `src/app/api/rsvp/route.ts` rsvpSchema (zod schema)
- Pattern: Defined with zod, .safeParse() on request.json(), return error details if invalid

## Entry Points

**Public Landing Page:**
- Location: `src/app/page.tsx`
- Triggers: Direct navigation to `/`
- Responsibilities: Display marketing content, hero section, features, CTA, link to auth flows

**Auth Routes:**
- Location: `src/app/(auth)/login/page.tsx`, `/register/page.tsx`, `/onboarding/page.tsx`
- Triggers: User authentication flows
- Responsibilities: Collect credentials, validate with Supabase, store session in cookies

**Dashboard Layout:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: Access to `/checklist`, `/budget`, `/guests`, `/chat`, `/settings`
- Responsibilities: Check authentication, load couple data, render navigation sidebar

**Middleware:**
- Location: `src/middleware.ts`
- Triggers: Every request (configured via matcher)
- Responsibilities: Call updateSession() to refresh Supabase session, skip for static assets

## Error Handling

**Strategy:** Try-catch blocks in API routes with structured error responses; optimistic UI updates with error messages.

**Patterns:**

- **API Errors:** Catch blocks return NextResponse.json with {error, status} tuple
  - 400: Validation failed (bad input)
  - 401: Unauthorized (not logged in)
  - 403: Forbidden (wrong couple access)
  - 500: Server error (log and return generic message)

- **Database Errors:** Check `error` field in Supabase response, log details, show user-friendly message
  - Example: BudgetView.addItem() checks `if (!error && data)` before updating local state

- **API Call Failures:** ChatInterface catches fetch() errors, appends error message to chat UI
  - User sees: "Omlouvám se, něco se pokazilo. Zkuste to prosím znovu."

## Cross-Cutting Concerns

**Logging:** `console.log()` and `console.error()` in API routes and components - no structured logger configured

**Validation:**
- Zod for API input validation (`src/app/api/rsvp/route.ts`)
- HTML5 form attributes (required, type) for client-side validation
- TypeScript interfaces for type safety

**Authentication:**
- Middleware checks Supabase session via cookies
- Demo mode (isDemoMode()) bypasses all auth checks
- API routes verify user ownership before accessing couple data (see `/api/chat` SECURITY comment)

**Styling:**
- Tailwind CSS for component styling
- CSS variables for theme colors (--color-primary, --color-secondary, etc.)
- CSS custom properties referenced in globals.css

---

*Architecture analysis: 2026-02-28*
