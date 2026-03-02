---
status: awaiting_human_verify
trigger: "onboarding-couples-table-missing"
created: 2026-03-01T00:00:00Z
updated: 2026-03-01T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - migrations were never applied to Supabase project (no config.toml, no CLI management)
test: N/A - root cause confirmed
expecting: N/A
next_action: Fix by (1) creating supabase/config.toml for CLI migration management, (2) fixing onboarding page to handle demo mode, (3) providing migration instructions

## Symptoms

expected: Onboarding completes successfully and saves couple data
actual: Error message "Nepodařilo se uložit data: Could not find the table 'public.couples' in the schema cache"
errors: Could not find the table 'public.couples' in the schema cache
reproduction: Click through onboarding to the end
started: First attempt ever, never worked

## Eliminated

- hypothesis: Wrong table name in code (e.g. 'couple' vs 'couples')
  evidence: Code references 'couples' which matches migration 002_couples_and_planning.sql exactly
  timestamp: 2026-03-01

- hypothesis: Migration file has wrong schema
  evidence: 002_couples_and_planning.sql has all required columns (partner1_name, partner2_name, wedding_date, wedding_size, budget_total, onboarding_completed)
  timestamp: 2026-03-01

## Evidence

- timestamp: 2026-03-01
  checked: supabase/migrations/ directory
  found: 3 raw SQL files (001, 002, 003) - NO config.toml, no Supabase CLI setup
  implication: These are manual SQL scripts that were never applied via CLI or SQL Editor

- timestamp: 2026-03-01
  checked: .env.local
  found: NEXT_PUBLIC_DEMO_MODE=true - demo mode is active
  implication: Auth is bypassed in middleware, but onboarding page doesn't handle demo mode at all

- timestamp: 2026-03-01
  checked: src/app/(dashboard)/layout.tsx
  found: All dashboard pages check isDemoMode() and short-circuit with demo data
  implication: Onboarding is missing this pattern - it's inconsistent

- timestamp: 2026-03-01
  checked: src/app/(auth)/onboarding/page.tsx line 58
  found: .from('couples').upsert(...) - direct Supabase call with no demo mode guard
  implication: In demo mode, getUser() returns null so it shows "Nejste přihlášeni". In real auth mode, couples table doesn't exist -> the reported error

## Resolution

root_cause: Migration SQL files (002_couples_and_planning.sql) were never applied to the Supabase project. The supabase/ directory has no config.toml, meaning there is no Supabase CLI project setup. The tables only exist as raw SQL files. Additionally, the onboarding page is missing demo mode handling that all dashboard pages have.
fix: (1) Add demo mode handling to onboarding page so demo flow works. (2) Create supabase/config.toml so migrations can be managed via CLI. (3) Provide clear instructions to run migrations against the live Supabase project.
verification: awaiting human confirm
files_changed:
  - src/app/(auth)/onboarding/page.tsx (added isDemoMode() import + demo mode guard in handleSubmit)
  - supabase/config.toml (created - enables Supabase CLI migration management)
