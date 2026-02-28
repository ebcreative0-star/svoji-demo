# Codebase Structure

**Analysis Date:** 2026-02-28

## Directory Layout

```
svoji/
├── src/
│   ├── app/                      # Next.js App Router pages and API routes
│   │   ├── (auth)/              # Route group: auth flows
│   │   │   ├── login/           # Login page
│   │   │   ├── register/        # Registration page
│   │   │   └── onboarding/      # Post-signup setup flow
│   │   ├── (dashboard)/         # Route group: authenticated dashboard
│   │   │   ├── layout.tsx       # Dashboard wrapper (auth check, nav)
│   │   │   ├── chat/            # Chat interface page
│   │   │   ├── checklist/       # Wedding checklist page
│   │   │   ├── budget/          # Budget tracking page
│   │   │   ├── guests/          # Guest list page
│   │   │   └── settings/        # Settings page
│   │   ├── api/                 # API route handlers
│   │   │   ├── chat/            # POST /api/chat - Claude integration
│   │   │   └── rsvp/            # POST /api/rsvp - RSVP submissions
│   │   ├── w/                   # Public wedding page route
│   │   │   └── [slug]/          # Dynamic wedding website by slug
│   │   ├── page.tsx             # Landing page (/)
│   │   ├── layout.tsx           # Root layout wrapper
│   │   └── globals.css          # Tailwind CSS and global styles
│   │
│   ├── components/              # Reusable React components
│   │   ├── ui/                  # Generic UI components
│   │   │   ├── Navigation.tsx   # Top navigation bar
│   │   │   └── Footer.tsx       # Footer section
│   │   ├── sections/            # Landing page sections
│   │   │   ├── Hero.tsx         # Hero section
│   │   │   ├── About.tsx        # About couple section
│   │   │   ├── Timeline.tsx     # Wedding timeline section
│   │   │   ├── Gallery.tsx      # Photo gallery
│   │   │   ├── Locations.tsx    # Venue/location maps
│   │   │   ├── RSVP.tsx         # RSVP form
│   │   │   └── Contacts.tsx     # Contact info
│   │   └── dashboard/           # Dashboard-specific components
│   │       ├── DashboardNav.tsx      # Sidebar navigation
│   │       ├── ChatInterface.tsx     # AI chat component
│   │       ├── ChecklistView.tsx     # Checklist UI and logic
│   │       ├── BudgetView.tsx        # Budget tracking UI
│   │       └── GuestsView.tsx        # Guest management UI
│   │
│   ├── lib/                     # Utilities and helpers
│   │   ├── supabase/            # Database client setup
│   │   │   ├── server.ts        # Server-side Supabase client
│   │   │   ├── client.ts        # Browser-side Supabase client
│   │   │   └── middleware.ts    # Auth middleware (demo mode)
│   │   ├── types.ts             # TypeScript database interfaces
│   │   ├── demo-data.ts         # Hardcoded demo data and isDemoMode()
│   │   ├── checklist-generator.ts   # Generate checklist items
│   │   └── supabase.ts          # Legacy/fallback Supabase setup
│   │
│   ├── data/                    # Static data and content
│   │   └── wedding.ts           # Sample wedding data structure
│   │
│   └── middleware.ts            # Next.js middleware for auth flow

├── supabase/                    # Supabase configuration
│   └── migrations/              # Database migration files
│
├── public/                      # Static assets
│   ├── images/                  # Placeholder images
│   └── favicon.ico
│
├── .env.example                 # Example env variables (secrets redacted)
├── .env.local                   # Local env config (git-ignored)
├── .gitignore                   # Git exclusions
├── eslint.config.mjs            # ESLint rules
├── next.config.ts               # Next.js build config
├── postcss.config.mjs           # PostCSS/Tailwind setup
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
├── package-lock.json            # Locked versions
└── README.md                    # Project docs
```

## Directory Purposes

**src/app/**
- Purpose: Contains all routes, pages, and API handlers following Next.js App Router convention
- Contains: TSX page files, route handlers, layout wrappers, CSS
- Key files: `page.tsx` is rendered for each route, `layout.tsx` wraps children

**src/app/(auth)/**
- Purpose: Authentication flow pages grouped with route group syntax
- Contains: Login, registration, onboarding forms
- Key files: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`

**src/app/(dashboard)/**
- Purpose: Protected routes for logged-in users
- Contains: Dashboard pages (checklist, budget, guests, chat, settings)
- Key files: `src/app/(dashboard)/layout.tsx` enforces auth check

**src/app/api/**
- Purpose: Server-side API endpoints for external integrations
- Contains: Route handlers that process POST/GET requests
- Key files: `src/app/api/chat/route.ts`, `src/app/api/rsvp/route.ts`

**src/components/ui/**
- Purpose: Generic, reusable UI components
- Contains: Navigation, footer, buttons, form elements
- Key files: `src/components/ui/Navigation.tsx`, `src/components/ui/Footer.tsx`

**src/components/sections/**
- Purpose: Landing page sections (marketing content)
- Contains: Hero, about, timeline, gallery, locations, RSVP, contacts
- Key files: Each section in its own file

**src/components/dashboard/**
- Purpose: Dashboard feature-specific components
- Contains: Chat interface, checklist view, budget tracking, guest management
- Key files: `src/components/dashboard/ChatInterface.tsx` (AI chat), `src/components/dashboard/BudgetView.tsx` (spending)

**src/lib/**
- Purpose: Shared utilities, type definitions, and business logic
- Contains: Supabase client setup, database types, demo data, checklist generation
- Key files: `src/lib/types.ts` (database schemas), `src/lib/demo-data.ts` (mock data)

**src/lib/supabase/**
- Purpose: Supabase configuration for both server and client
- Contains: SSR client factory, browser client, middleware auth
- Key files: `src/lib/supabase/server.ts` (server functions), `src/lib/supabase/client.ts` (browser)

**src/data/**
- Purpose: Static data and CMS-like content
- Contains: Wedding data structures, example wedding details
- Key files: `src/data/wedding.ts` (sample wedding info)

**supabase/**
- Purpose: Database schema and migrations
- Contains: SQL migration files
- Key files: Migration files in `supabase/migrations/`

**public/**
- Purpose: Static assets served directly by Next.js
- Contains: Images, icons, favicons
- Key files: `public/images/` (placeholder images), `public/favicon.ico`

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Landing page (public marketing site)
- `src/app/layout.tsx`: Root layout (fonts, metadata, globals)
- `src/middleware.ts`: Auth middleware (runs on every request)

**Configuration:**
- `src/app/globals.css`: Tailwind CSS setup and CSS variables
- `next.config.ts`: Next.js build and server options
- `tsconfig.json`: TypeScript compiler options and path aliases
- `.env.local`: Environment secrets (ANTHROPIC_API_KEY, Supabase keys)

**Core Logic:**
- `src/lib/types.ts`: Database type definitions (Couple, ChecklistItemDB, BudgetItem, Guest)
- `src/lib/supabase/server.ts`: Server-side Supabase client factory
- `src/app/api/chat/route.ts`: Claude API integration with system prompt builder
- `src/app/api/rsvp/route.ts`: RSVP form validation and submission

**Testing:**
- Not configured - no test files present

## Naming Conventions

**Files:**
- React components: PascalCase (e.g., `ChatInterface.tsx`, `BudgetView.tsx`)
- Utilities and helpers: camelCase (e.g., `checklist-generator.ts`, `demo-data.ts`)
- Page files: lowercase with hyphens (e.g., `page.tsx` in route directories)
- CSS: lowercase with `.css` extension (e.g., `globals.css`)

**Directories:**
- Feature grouping: lowercase with hyphens (e.g., `dashboard/`, `ui/`, `sections/`)
- Route groups (Next.js): wrapped in parentheses (e.g., `(auth)/`, `(dashboard)/`)
- Dynamic routes: wrapped in square brackets (e.g., `[slug]/`, `[id]/`)

**Components:**
- Page components: Always named `page.tsx` in their route directory
- Layout components: Always named `layout.tsx` in their route directory
- Feature components: Named by feature (e.g., `ChatInterface`, `BudgetView`, `DashboardNav`)

**Functions & Variables:**
- camelCase (e.g., `buildSystemPrompt()`, `isDemoMode()`, `calculateBudgetRemaining()`)
- Constants: UPPER_SNAKE_CASE (e.g., `BUDGET_CATEGORIES`, `DEMO_COUPLE`)
- React hooks: useXxx pattern (no custom hooks seen, uses React standard hooks)

## Where to Add New Code

**New Feature (e.g., Vendor Directory):**
- Primary code: `src/app/(dashboard)/vendors/page.tsx` (page) + `src/components/dashboard/VendorsView.tsx` (UI)
- API integration: `src/app/api/vendors/route.ts` (if querying external data)
- Types: Add interface to `src/lib/types.ts`
- Tests: Create `src/app/(dashboard)/vendors/page.test.tsx` (if testing added)

**New Component/Module:**
- Implementation: `src/components/dashboard/NewComponentName.tsx` (for dashboard) or `src/components/sections/NewComponentName.tsx` (for landing)
- Styling: Use Tailwind classes inline, reference CSS variables in `src/app/globals.css`
- Imports: Use `@/` path alias (configured in tsconfig.json)

**Utilities/Helpers:**
- Shared helpers: `src/lib/new-helper.ts`
- Feature-specific: `src/lib/subdirectory/feature.ts` (e.g., `src/lib/supabase/new-function.ts`)
- Demo data: Add to `src/lib/demo-data.ts` under DEMO_XXX exports

**Public-Facing Pages:**
- Landing page sections: Add component to `src/components/sections/`, import in `src/app/page.tsx`
- Custom wedding page: Add route to `src/app/w/[slug]/page.tsx`

**API Endpoints:**
- New endpoint: Create directory in `src/app/api/feature/` with `route.ts`
- Pattern: Export async `POST()`, `GET()`, etc.
- Use zod for validation, Supabase for data access, structured error responses

## Special Directories

**src/app/(auth)** (Route Group):
- Purpose: Groups auth-related routes without affecting URL
- Generated: No - hand-written route files
- Committed: Yes - part of source

**src/app/(dashboard)** (Route Group):
- Purpose: Groups dashboard routes, shares layout.tsx for auth checks
- Generated: No - hand-written route files
- Committed: Yes - part of source

**.next/**
- Purpose: Build artifacts and caches
- Generated: Yes - by `npm run build`
- Committed: No - in .gitignore

**supabase/migrations/**
- Purpose: SQL schema definition and version history
- Generated: Partially - by Supabase CLI
- Committed: Yes - for team collaboration

**node_modules/**
- Purpose: Installed dependencies
- Generated: Yes - by `npm install`
- Committed: No - in .gitignore

---

*Structure analysis: 2026-02-28*
