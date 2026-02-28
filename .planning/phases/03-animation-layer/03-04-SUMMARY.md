---
phase: 03-animation-layer
plan: "04"
subsystem: animation
tags: [scroll-animations, scroll-reveal, stagger, accessibility, lenis, css-fix]
dependency_graph:
  requires: [03-03]
  provides: [ANIM-01, ANIM-02, ANIM-05]
  affects: [src/app/(public)/page.tsx, src/app/(public)/w/[slug]/page.tsx, src/app/globals.css]
tech_stack:
  added: []
  patterns:
    - ScrollReveal wrapping major section content inside outer section padding elements
    - StaggerContainer wrapping feature grid with ScrollReveal per card for sequential entrance
    - Client components (ScrollReveal) imported directly into Server Components (page files)
key_files:
  created: []
  modified:
    - src/app/(public)/page.tsx
    - src/app/(public)/w/[slug]/page.tsx
    - src/app/globals.css
    - .planning/REQUIREMENTS.md
decisions:
  - ScrollReveal wraps inner content div rather than outer section to avoid animating background/padding
  - Hero sections on both pages not wrapped (visible above the fold on load)
  - Navigation and footer not wrapped (fixed header; footer not a major content section per roadmap criteria)
  - scroll-behavior: smooth removed from CSS; Lenis handles smooth scroll via JS
metrics:
  duration: ~5 min
  completed_date: "2026-02-28"
  tasks_completed: 2
  files_modified: 4
---

# Phase 03 Plan 04: Scroll Animation Wiring Summary

ScrollReveal and StaggerContainer wired into landing page (5 sections + feature stagger) and public wedding web (6 sections); CSS scroll-behavior conflict with Lenis removed.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wire ScrollReveal into landing page and public wedding web | 1038eef | src/app/(public)/page.tsx, src/app/(public)/w/[slug]/page.tsx |
| 2 | Remove scroll-behavior: smooth and update REQUIREMENTS.md | e36992d | src/app/globals.css, .planning/REQUIREMENTS.md |

## What Was Built

**Landing page (src/app/(public)/page.tsx):**
- Added imports for ScrollReveal and StaggerContainer
- Hero: ScrollReveal wraps the inner `grid lg:grid-cols-2` content div
- Features: ScrollReveal on heading block; StaggerContainer wraps the 3 feature cards, each card wrapped in ScrollReveal (sequential stagger)
- Social proof banner: ScrollReveal on stats flex container
- How-it-works: ScrollReveal on inner grid div
- CTA section: ScrollReveal on inner max-w-3xl content div

**Public wedding web (src/app/(public)/w/[slug]/page.tsx):**
- Added import for ScrollReveal
- About, Timeline, Locations, Gallery, Contacts, RSVP: each conditionally-rendered section wrapped in ScrollReveal
- Conditional `&&` guards remain outside ScrollReveal (guards rendering, ScrollReveal wraps the component)
- Hero not wrapped (above the fold)

**CSS fix (src/app/globals.css):**
- Removed `scroll-behavior: smooth` from html rule
- Lenis handles smooth scroll via JS; native CSS smooth scroll would conflict and bypass reduced-motion

**REQUIREMENTS.md:**
- ANIM-01, ANIM-02, ANIM-05 marked [x] Complete in both checkbox list and traceability table

## Decisions Made

1. **ScrollReveal wraps inner content, not outer section**: Keeps section background/padding static; only the visible content animates in. Cleaner visual result.

2. **StaggerContainer on features grid**: The 3 feature cards already had a map() so wrapping the grid in StaggerContainer and each card in ScrollReveal gives the sequential stagger the plan specified.

3. **Hero not wrapped on either page**: Hero content is above the fold on initial load. ScrollReveal uses `whileInView` with `once: true` -- wrapping it would mean it never triggers (already in view). Leaving it unwrapped keeps it immediately visible.

4. **scroll-behavior: smooth removed**: With Lenis active, CSS smooth scroll creates a double-smooth effect. With reduced-motion enabled, LenisProvider skips Lenis but the CSS rule would still animate native scroll, violating `prefers-reduced-motion`.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. `npx tsc --noEmit` - PASS (no TypeScript errors)
2. `grep -r "ScrollReveal" src/app/` - PASS (matches in both page files, 26 total)
3. `grep -r "StaggerContainer" src/app/` - PASS (3 matches in landing page)
4. `grep "scroll-behavior" src/app/globals.css` - PASS (0 matches)
5. `grep "ANIM-01.*Complete" .planning/REQUIREMENTS.md` - PASS
6. `grep "ANIM-02.*Complete" .planning/REQUIREMENTS.md` - PASS
7. `grep "ANIM-05.*Complete" .planning/REQUIREMENTS.md` - PASS
8. Neither page has 'use client' directive - PASS

## Self-Check: PASSED

Files verified:
- FOUND: src/app/(public)/page.tsx
- FOUND: src/app/(public)/w/[slug]/page.tsx
- FOUND: src/app/globals.css
- FOUND: .planning/REQUIREMENTS.md

Commits verified:
- FOUND: 1038eef (feat 03-04: wire ScrollReveal and StaggerContainer)
- FOUND: e36992d (fix 03-04: remove scroll-behavior and mark ANIM requirements complete)
