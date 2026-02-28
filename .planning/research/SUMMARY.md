# Project Research Summary

**Project:** Svoji — Design Overhaul v1.0
**Domain:** Premium SaaS visual redesign — wedding planning app (Czech market)
**Researched:** 2026-02-28
**Confidence:** HIGH

## Executive Summary

Svoji is a functional Next.js 16 wedding planning SaaS getting a full visual overhaul to compete in the Czech premium wedding market. The existing stack (Next.js 16, Tailwind 4, Framer Motion 12, React 19) is sound and stays. Only two packages need adding: `lenis` for smooth scroll physics and `tw-animate-css` for Tailwind 4-compatible CSS animation utilities. The design direction is "warm premium" — cream/terracotta/charcoal palette replacing the existing mocha scheme, Cormorant Garamond replacing Playfair Display for headings, generous whitespace, and tasteful scroll-triggered animations via Framer Motion.

The recommended approach is a strict dependency-ordered build: design tokens first (single atomic commit that shifts the palette everywhere), then UI primitives, then surface-by-surface redesign in order of user-facing priority (landing, auth, dashboard, public wedding web). This order prevents the primary pitfall of partial rollouts where authenticated users see a mismatched product — once the token layer ships, all surfaces shift to the new palette simultaneously even before component-level polish is applied.

The key risks are all known and preventable. The codebase has 196 CSS variable references that will silently fail if variable names change (use Strategy A: keep names, change values). Font swaps require three simultaneous file changes to avoid CLS. Framer Motion must be wrapped in thin client components to preserve RSC boundaries. Dashboard animations require performance gating — what looks fine in dev jank on mobile with real data volumes.

## Key Findings

### Recommended Stack

The existing stack requires no major changes. Tailwind 4's `@theme` block handles design tokens natively — no library needed. Framer Motion already installed handles all animation needs. Only `lenis` (2kb smooth scroll) and `tw-animate-css` (Tailwind 4-native animation utilities) need to be added. `tailwindcss-animate` (shadcn default) is a Tailwind v3-only JS plugin and must not be used.

Font pairing: **Cormorant Garamond** (headings, hero, editorial moments) + **Inter** (body copy, UI, forms). Both loaded via `next/font/google` already available — zero new packages. Color tokens use OKLCH format, Tailwind 4's native color space, for perceptually uniform palette with wider gamut on P3 displays.

**Core technologies:**
- Next.js 16 + React 19: keep as-is, no changes
- Tailwind 4 `@theme`: CSS-first design tokens, replaces `:root` color block — generates Tailwind utilities automatically
- Framer Motion 12: `whileInView` for scroll reveals, `AnimatePresence` for UI state transitions
- Lenis 1.3.17: smooth scroll physics, wraps root layout, integrates with Framer Motion's `useScroll`
- tw-animate-css 1.4.0: import via CSS `@import`, not JS plugin — provides `animate-in`/`animate-out` variants for modals and dropdowns
- Cormorant Garamond (Google Fonts): replaces Playfair Display via `next/font/google`, no new package

**Explicitly avoid:** GSAP (30kb+, two competing animation systems), Radix UI/shadcn (component library overhead on a design overhaul), styled-components (breaks Tailwind 4 CSS-first model), tailwindcss-animate (Tailwind v3-only).

### Expected Features

This is a redesign milestone on a functional product. MVP means "minimum to look premium across all surfaces" — not new features.

**Must have (table stakes):**
- Semantic color token system via Tailwind 4 `@theme` — foundation for all other work
- Typography scale with clear hierarchy — Cormorant Garamond headings + Inter body, 5-6 size steps
- Consistent hover/focus states on all interactive elements — 150ms ease-out, branded focus rings
- Loading states (skeleton screens) for all async dashboard sections — prevents broken-feeling UI
- Empty states with contextual CTAs for checklist, guests, budget views — critical for new user activation
- Error states — inline form validation, async error toasts
- Mobile responsive across all views — 375px/768px/1024px breakpoints, dashboard nav collapses appropriately
- Consistent button hierarchy — 4 typed variants (primary, secondary, ghost, destructive)

**Should have (differentiators over WeMarry.io and Brzy-svoji.cz):**
- Scroll-triggered entrance animations on landing page via Framer Motion `whileInView`
- Micro-interactions on key actions (checklist completion, guest add) via `AnimatePresence`
- Warm premium color system — cream `#FBF8F4` + terracotta `#C8644A` + charcoal `#2A2622` + sage `#8A9E8C`
- Glassmorphism surface layering on dashboard cards and modals (subtle, not 2021-style heavy)
- Public wedding web editorial quality — full-bleed photo header, smooth scroll sections, premium RSVP form

**Defer (v2+):**
- Dark mode — adds 40% overhead, light mode must be perfect first; defer until demand confirmed
- Page transitions (route changes) — use simple opacity fade in v1 only if tested as needed
- Advanced hover animations on public gallery — defer until gallery feature exists
- Custom email templates matching new visual system — separate milestone

**Anti-features to explicitly avoid:**
- Heavy parallax scrolling — mobile Safari performance disaster, breaks accessibility
- Custom cursor effects — actively frustrating in a planning SaaS context
- Animated gradient backgrounds — distracting during planning tasks, ages quickly
- Full-page loaders between routes — use per-section skeleton screens instead

### Architecture Approach

The architecture is additive — no reorganization of existing structure. New files are created, existing files are modified. The design token layer (`globals.css @theme`) is the single source of truth; Tailwind generates utility classes from it automatically. Animation logic is isolated in a dedicated `components/motion/` directory with thin client wrapper components (`AnimateIn`, `AnimateStagger`) so server components stay server components. UI primitives (`components/ui/Button`, `Card`, `Input`, `Badge`) replace one-off CSS classes and eliminate the `!important` override pattern already present in the codebase.

**Major components:**
1. `globals.css @theme block` — all design tokens (color, typography, radius, shadow, motion timing); single file change propagates to all surfaces
2. `components/motion/AnimateIn` + `AnimateStagger` — client-side Framer Motion wrappers; keeps RSC boundaries clean; shared variant definitions in `variants.ts`
3. `components/ui/` primitives (`Button`, `Card`, `Input`, `Badge`) — typed React components replacing `.btn-primary`, `.btn-outline` CSS class strings; variant + size props replace `!important` overrides
4. `app/layout.tsx` — font loading via `next/font/google` with CSS variable bridge pattern (`--font-heading-loaded` fed into `@theme --font-heading`)
5. Existing `dashboard/`, `sections/`, `w/[slug]` components — all modified (reskin), not restructured

### Critical Pitfalls

1. **CSS variable rename silently breaks 196 references** — Keep all existing `--color-*` variable names, change only their values. Strategy A eliminates the failure mode entirely. If renaming is needed, run `grep -r "var(--color-old-name)" src/ --include="*.tsx" -l` and batch-replace before running the dev server.

2. **Font swap causes CLS across all headings** — Three files must change atomically when swapping the heading font: `layout.tsx` (new font import + `adjustFontFallback: true`), `globals.css` h1-h6 rule (fallback stack), and `.font-serif` utility class. Missing any one causes layout shift on page load.

3. **Framer Motion in RSC causes runtime errors and large client bundles** — Never add `motion.*` directly to page-level components. Always use the `AnimateIn`/`AnimateStagger` wrapper pattern from `components/motion/` — the client boundary stays at the animation shell, not the page.

4. **Layout animations jank on dashboard with real data** — `layout` prop on dashboard list items causes synchronous reflow. With 20-50 checklist items on a mid-range Android, this produces 100-300ms freezes. Use CSS `transition` on `opacity`/`transform` in dashboard views; reserve Framer Motion's `layout` for marketing pages only.

5. **Visual inconsistency during phased rollout** — Authenticated users skip the landing page and land directly in dashboard. If dashboard ships last, they see "new landing, old dashboard" indefinitely. Mitigation: ship the design token layer as one atomic commit first — this propagates the new palette everywhere simultaneously before any component-level work begins.

## Implications for Roadmap

Based on combined research, 7 phases in strict dependency order:

### Phase 1: Design System Foundation
**Rationale:** Every other phase depends on tokens and primitives. Ship this atomically to avoid visual inconsistency during rollout. Color token strategy (Strategy A: keep names, change values) must be decided here.
**Delivers:** Complete `@theme` token block in `globals.css`, font swap (Cormorant Garamond + Inter) with `adjustFontFallback`, `components/motion/AnimateIn` + `AnimateStagger`, `lib/utils.ts` with `cn()` helper. After this phase: all existing components automatically inherit the new palette without any JSX changes.
**Addresses:** Color token system, typography scale, motion token definitions
**Avoids:** CSS variable rename failures (196 references), font CLS, visual inconsistency during phased rollout, Tailwind CSS import order breakage

### Phase 2: UI Primitives
**Rationale:** Typed `Button`, `Card`, `Input`, `Badge` components must exist before any surface can be redesigned without duplicating styles. Eliminates the `!important` override pattern.
**Delivers:** `components/ui/Button.tsx` (4 variants, 3 sizes), `components/ui/Card.tsx`, `components/ui/Input.tsx`, `components/ui/Badge.tsx`. Deprecates `.btn-primary`, `.btn-outline` CSS classes.
**Uses:** Tailwind 4 `@theme` tokens from Phase 1, `cn()` utility from Phase 1
**Implements:** UI primitive layer of the architecture

### Phase 3: Landing Page
**Rationale:** Highest marketing visibility surface. Showcases the full design direction. Validates scroll animations before applying them elsewhere.
**Delivers:** Redesigned `app/page.tsx` with hero, features section, pricing, footer. Scroll-triggered `AnimateIn` on all sections. New CTA buttons using `Button` primitive. Semantic typography hierarchy applied.
**Uses:** All Phase 1 + 2 outputs; Lenis (install here, configure in layout.tsx); `whileInView` animations
**Avoids:** Framer Motion in RSC (AnimateIn wrapper pattern), heavy parallax (use `whileInView` fade-up instead)

### Phase 4: Auth Pages
**Rationale:** First impression post-landing. Low complexity, good test of `Input` + `Button` primitives in form context.
**Delivers:** Redesigned login, register, onboarding pages. Inline form validation visual treatment. Error states. Single entrance animation per onboarding step.
**Avoids:** AnimatePresence exit animations on auth redirect targets (doubles perceived auth time); full-page loaders (use in-place loading state)

### Phase 5: Dashboard
**Rationale:** Daily-use surface for paying users. Most complex — state-heavy components, async data, multiple views. Must include skeleton screens, empty states, and performance-gated animations.
**Delivers:** Redesigned DashboardNav, ChecklistView, BudgetView, GuestsView, ChatInterface. Skeleton screens for all async sections. Empty states with contextual CTAs. Micro-interactions on task completion and item add/remove.
**Avoids:** `layout` prop on list items (CSS transitions instead); AnimatePresence exit animations blocking nav; mobile Safari backdrop-filter animation bugs
**Performance gate:** CPU throttle 4x test with 50 checklist items before considering dashboard animations done

### Phase 6: Public Wedding Web
**Rationale:** Guest-facing brand surface — guests judge the couple's taste here. Independent from dashboard components; can ship after dashboard or in parallel. Most brand-visible to external users.
**Delivers:** Redesigned `w/[slug]` public wedding pages, all `components/sections/` (Hero, About, Gallery, Timeline, Locations, Contacts, RSVP). Editorial typography, smooth scroll, premium RSVP form.
**Uses:** `AnimateIn` throughout, Lenis already configured from Phase 3

### Phase 7: Cleanup and Polish
**Rationale:** Remove deprecated code, verify accessibility, confirm mobile and iOS Safari across all surfaces.
**Delivers:** Removal of `.btn-primary`, `.btn-outline`, `.animate-fade-in-up` from `globals.css`. Contrast ratio documentation for all new color pairs. `useReducedMotion()` verified in all animated components. iOS Safari test pass.

### Phase Ordering Rationale

- Phase 1 (tokens) before everything: 196 CSS variable references and all component styling depends on this foundation being stable.
- Phase 2 (primitives) before surfaces: every surface redesign uses `Button`, `Card`, `Input` — building them once prevents style duplication across phases.
- Phase 3 (landing) before auth/dashboard: establishes visual direction, validates animation patterns at lowest risk (marketing page has no async state complexity).
- Phase 5 (dashboard) is longest and riskiest: leave after simpler surfaces are validated.
- Phase 6 (public web) can run in parallel with Phase 5 if bandwidth allows — independent component tree, same design tokens.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Dashboard):** Micro-interaction performance on mobile with real data volumes is not fully benchmarked. Needs explicit testing plan with device targets before implementation starts.
- **Phase 6 (Public Wedding Web):** RSVP form animation on submit + Supabase mutation timing is not detailed in research. Needs brief investigation of optimistic UI vs confirmed-state animation timing.

Phases with standard patterns (can skip `/gsd:research-phase`):
- **Phase 1 (Design System):** All patterns are official-docs verified. Token migration and font loading are mechanical steps with zero ambiguity.
- **Phase 2 (UI Primitives):** Standard typed React component patterns, fully covered in architecture research.
- **Phase 3 (Landing):** `whileInView` scroll animations are well-documented, pattern is established in architecture research.
- **Phase 4 (Auth):** Straightforward form reskin using Phase 2 primitives. No novel patterns.
- **Phase 7 (Cleanup):** Mechanical verification steps, no research needed.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core decisions verified via official docs and npm. Font pairing is MEDIUM — community-sourced, but Cormorant Garamond is a safe, well-documented choice. |
| Features | MEDIUM-HIGH | Table stakes well-established from multiple sources. Differentiators (warm premium palette, specific color values) are design decisions with reasonable evidence but subjective judgment involved. |
| Architecture | HIGH | Based on direct codebase analysis + official Next.js, Tailwind 4, and Framer Motion docs. Patterns are battle-tested. |
| Pitfalls | HIGH | Pitfall 1 (196 CSS variable references) is a direct codebase count, not an inference. All other pitfalls are grounded in official doc warnings or known browser behavior. |

**Overall confidence:** HIGH

### Gaps to Address

- **Font pairing final decision:** Research recommends Cormorant Garamond (STACK.md) while FEATURES.md suggests DM Serif Display as primary alternative. Both are valid choices. Decide before Phase 1 — commit to one and don't revisit during implementation.
- **Exact terracotta CTA color vs OKLCH palette:** FEATURES.md uses hex values (`#C8644A`) while STACK.md uses OKLCH format. Need to reconcile into one canonical `@theme` block before Phase 1. The OKLCH values in STACK.md are the technically correct choice for Tailwind 4.
- **Dashboard mobile navigation pattern:** Research identifies bottom nav vs sidebar as the key decision but does not resolve it. Needs a decision before Phase 5 begins, as it determines component structure for all dashboard views.
- **iOS Safari real-device testing:** Research recommends testing on actual device, not simulator. Ensure access to a physical iPhone before Phase 3 ships.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4.0 Official Blog](https://tailwindcss.com/blog/tailwindcss-v4) — OKLCH colors, `@theme` tokens, CSS-first config
- [Tailwind CSS Theme Variables Docs](https://tailwindcss.com/docs/theme) — `@theme` directive behavior, utility generation
- [Next.js Font Optimization Docs](https://nextjs.org/docs/app/getting-started/fonts) — self-hosting, zero layout shift, `adjustFontFallback`
- [Framer Motion Scroll Animations](https://motion.dev/docs/react-scroll-animations) — `useScroll`, `whileInView` patterns
- [Lenis GitHub](https://github.com/darkroomengineering/lenis) — version, React 19 support, Next.js integration
- [tw-animate-css GitHub](https://github.com/Wombosvideo/tw-animate-css) — Tailwind v4 replacement for `tailwindcss-animate`
- [Next.js 16 App Router — Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components) — RSC boundaries, `'use client'` implications
- Direct codebase analysis — 20+ source files, 196 CSS variable references counted

### Secondary (MEDIUM confidence)
- [SaaS Design Trends 2026 — Jetbase](https://jetbase.io/blog/saas-design-trends-best-practices) — table stakes expectations
- [12 UI/UX Design Trends 2026 — index.dev](https://www.index.dev/blog/ui-ux-design-trends) — differentiator patterns
- [Dashboard Design Best Practices SaaS 2025 — brand.dev](https://www.brand.dev/blog/dashboard-design-best-practices) — dashboard UX patterns
- [Empty State UX in SaaS — SaasFactor](https://www.saasfactor.co/blogs/empty-state-ux-turn-blank-screens-into-higher-activation-and-saas-revenue) — activation impact
- [Cormorant Garamond — Google Fonts](https://fonts.google.com/specimen/Cormorant+Garamond) — weights, character set
- [10 Must-Have Typefaces 2026 — I Love Typography](https://ilovetypography.com/2025/12/19/10-must-have-fonts-for-2026/) — font pairing trends

### Tertiary (LOW confidence)
- [Can I Use — animation-timeline scroll()](https://caniuse.com/mdn-css_properties_animation-timeline_scroll) — confirms Firefox support gap; validates JS fallback recommendation

---
*Research completed: 2026-02-28*
*Ready for roadmap: yes*
