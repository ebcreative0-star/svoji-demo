# Technology Stack

**Analysis Date:** 2026-02-28

## Languages

**Primary:**
- TypeScript 5.x - All application source code in `src/`
- CSS via Tailwind - Styling in components

**Secondary:**
- JavaScript - Build configuration (ESLint, PostCSS)
- SQL - Database migrations in `supabase/migrations/`

## Runtime

**Environment:**
- Node.js (latest LTS) - Specified via deployment, not explicitly pinned in project

**Package Manager:**
- npm - Primary package manager
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework
  - App Router configured with `next.config.ts`
  - SSR for server components
  - API routes in `src/app/api/`

**UI & Components:**
- React 19.2.3 - UI library
- React DOM 19.2.3 - DOM rendering

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework
- @tailwindcss/postcss 4.x - PostCSS plugin for Tailwind
- PostCSS - CSS preprocessor via `postcss.config.mjs`

**Forms & Validation:**
- react-hook-form 7.71.2 - Form state management
- @hookform/resolvers 5.2.2 - Resolver for Zod validation
- zod 4.3.6 - Schema validation and type inference

**Motion & Animation:**
- framer-motion 12.34.3 - Animation library for React components

**Icons:**
- lucide-react 0.575.0 - Icon library

**Utilities:**
- date-fns 4.1.0 - Date manipulation and formatting with Czech locale support

## Key Dependencies

**Critical:**
- @anthropic-ai/sdk 0.78.0 - Anthropic Claude API for AI chatbot feature
- @supabase/supabase-js 2.98.0 - Browser client for Supabase authentication and database
- @supabase/ssr 0.8.0 - SSR support for Supabase authentication in Next.js

**Infrastructure:**
- next 16.1.6 - Next.js framework
- typescript 5.x - TypeScript compiler

## Dev Dependencies

**Linting & Code Quality:**
- eslint 9.x - JavaScript linter
- eslint-config-next 16.1.6 - ESLint config for Next.js best practices

**Type Definitions:**
- @types/node 20.x - Node.js type definitions
- @types/react 19.x - React type definitions
- @types/react-dom 19.x - React DOM type definitions

## Configuration

**Environment:**
- Configuration via environment variables prefixed with `NEXT_PUBLIC_` for client-side access
- Required vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`
- Optional: `NEXT_PUBLIC_DEMO_MODE` for testing without Supabase
- Loaded from `.env.local` and `.env.example` (reference)

**Build:**
- `next.config.ts` - Next.js configuration (minimal, extends defaults)
- `tsconfig.json` - TypeScript compiler options with path alias `@/*` → `./src/*`
- `eslint.config.mjs` - ESLint configuration with Next.js and TypeScript rules

**Runtime Paths:**
- `@/*` resolves to `./src/*` (configured in `tsconfig.json`)

## Platform Requirements

**Development:**
- Node.js with npm
- TypeScript 5+
- Modern browser with ES2017+ support

**Production:**
- Deployed on Vercel (implied by Next.js setup and deployment patterns)
- Supabase PostgreSQL database
- Anthropic API access for Claude integration

---

*Stack analysis: 2026-02-28*
