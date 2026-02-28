# Phase 3: Animation Layer - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire Lenis smooth scroll, Framer Motion scroll-triggered reveals, micro-interactions, page transitions, and reduced-motion support. This phase creates reusable animation primitives and hooks that all subsequent surface phases (4-7) will consume. No surface redesign happens here -- only the animation infrastructure.

</domain>

<decisions>
## Implementation Decisions

### Scroll-triggered reveals
- Entrance style: fade + slide up (~20-30px translateY)
- Stagger: yes, child elements stagger in sequence (~100ms apart)
- Speed: moderate (400-500ms duration)
- Replay: fire once only -- elements stay visible after first reveal (`once: true`)
- Implementation: Framer Motion `whileInView`

### Micro-interactions
- Button hover: lift (-1 to -2px translateY) AND scale (1.02-1.05x) combined
- Button active/press: scale down to 0.97-0.98 for tactile press feedback
- Card hover: deepen existing shadow effect
- Input focus: neutral soft glow (light gray/white, NOT brand primary color)
- Implementation: Framer Motion for all micro-interactions (consistent API, spring physics)

### Page transitions
- Style: crossfade -- pozvolny, satenovy pocit (not fast, not slow -- smooth and silky ~350-450ms)
- Scope: only public-facing pages (landing page + public wedding web). Dashboard and auth skip transitions for speed
- Loading indicator: none -- rely on crossfade alone
- Implementation: Next.js App Router `template.tsx` + Framer Motion `AnimatePresence` in public route groups only

### Smooth scroll (Lenis)
- Smoothing intensity: moderate (lerp ~0.1, duration ~1.2)
- Anchor links: smooth animated scroll to target section
- Dashboard scope: Claude's discretion (weigh smooth feel vs snappy list interaction)
- Mobile: Claude's discretion (weigh consistent feel vs potential jank on older devices)

### Reduced motion (ANIM-05)
- All animations respect `prefers-reduced-motion` via `useReducedMotion` hook
- When enabled: no motion -- all animations suppressed

### Claude's Discretion
- Exact spring/easing curves for each animation type
- Lenis on dashboard: enable or disable based on UX trade-offs
- Lenis on mobile: enable or disable based on performance
- Lenis configuration fine-tuning (exact lerp, duration, wheel multiplier)
- How to handle reduced-motion for page transitions (instant swap vs still crossfade)
- Stagger timing per section type

</decisions>

<specifics>
## Specific Ideas

- Page transitions should feel "satenovy" (satiny/silky) -- smooth and pozvolny, not instant and not sluggish
- Button hover combines both lift AND scale for maximum premium feel
- Micro-interactions all through Framer Motion for consistent spring physics across the app
- Input focus glow deliberately neutral -- should not compete with form content visually
- Dashboard should stay snappy for data work (no heavy animations on lists)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` (src/components/ui/Button.tsx): cva-based with `transition-colors`, needs Framer Motion wrapping for hover lift+scale and active press
- `Card` (src/components/ui/Card.tsx): has `interactive` prop with `hover:shadow-md transition-shadow`, enhance shadow depth
- `Input` (src/components/ui/Input.tsx): has focus transitions, needs neutral soft glow ring
- `framer-motion` 12.34.3: installed in package.json but completely unused -- ready to wire
- `cn()` utility (src/lib/cn.ts): clsx + twMerge for conditional classes

### Established Patterns
- Tailwind CSS transitions already in place (`transition-colors`, `transition-shadow`)
- cva + cn() pattern for component variants
- 'use client' directive for all interactive components
- `@/*` path aliases for all imports

### Integration Points
- `src/app/layout.tsx`: root layout for Lenis provider wrapping
- `src/app/template.tsx`: does not exist yet -- needs creation for page transitions (only in public route groups)
- Route groups: `(auth)`, `(dashboard)` -- these skip page transitions
- Landing page sections: Hero, Gallery, Locations, Contacts, RSVP -- scroll reveal targets
- Public wedding web sections: similar scroll reveal targets

</code_context>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 03-animation-layer*
*Context gathered: 2026-02-28*
