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
- Stagger: Claude decides per section type -- stagger for grids/lists, single block for text-heavy sections
- Speed: moderate (400-500ms duration)
- Replay: fire once only -- elements stay visible after first reveal
- Implementation: Framer Motion `whileInView` with `once: true`

### Micro-interactions
- Button hover: subtle lift (translateY -1 to -2px) with slight shadow increase
- Button active/press: scale down to 0.97-0.98 for tactile feedback
- Card hover: existing `hover:shadow-md` pattern deepened
- Input focus: primary/accent color glow ring (warm champagne/gold from brand tokens)
- Implementation: CSS transitions only (no Framer Motion) -- zero JS overhead for simple state changes

### Page transitions
- Style: simple crossfade (opacity transition)
- Speed: quick (200-300ms)
- Scope: everywhere -- all route groups (landing, auth, dashboard, public web)
- Implementation: Next.js App Router `template.tsx` + Framer Motion `AnimatePresence`
- Loading indicator: thin top progress bar during navigation (YouTube/GitHub style)

### Smooth scroll (Lenis)
- Smoothing intensity: moderate (lerp ~0.1, duration ~1.2)
- Anchor links: smooth scroll to target section
- Scope: landing page + public wedding web only -- dashboard uses native scroll
- Mobile: keep Lenis enabled on mobile too (consistent feel + smooth anchors)

### Reduced motion (ANIM-05)
- All animations respect `prefers-reduced-motion` via `useReducedMotion` hook
- When enabled: no motion -- all animations suppressed

### Claude's Discretion
- Exact spring/easing curves for each animation type
- Stagger decision per section (grids/lists stagger vs text blocks as single unit)
- Loading progress bar implementation approach (NProgress, custom, or other)
- Lenis configuration fine-tuning (exact lerp, duration, wheel multiplier)
- How to handle reduced-motion for page transitions (instant swap vs still crossfade)

</decisions>

<specifics>
## Specific Ideas

- Button hover should feel like a subtle lift, not playful bounce
- Page transitions should be fast enough that navigation feels instant -- polish without slowing the user
- Lenis smooth scroll on landing/public web, but NOT dashboard (dashboard needs snappy list scrolling)
- Top progress bar similar to YouTube/GitHub pattern

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` (src/components/ui/Button.tsx): cva-based with `transition-colors`, needs `transition-all` + transform/shadow additions for hover lift and active press
- `Card` (src/components/ui/Card.tsx): has `interactive` prop with `hover:shadow-md transition-shadow`, enhance shadow depth
- `Input` (src/components/ui/Input.tsx): has focus transitions, needs focus glow ring in primary color
- `framer-motion` 12.34.3: installed in package.json but completely unused -- ready to wire
- `cn()` utility (src/lib/cn.ts): clsx + twMerge for conditional classes

### Established Patterns
- Tailwind CSS transitions already in place (`transition-colors`, `transition-shadow`)
- cva + cn() pattern for component variants -- micro-interactions should extend existing variant classes
- 'use client' directive for all interactive components
- `@/*` path aliases for all imports

### Integration Points
- `src/app/layout.tsx`: root layout for Lenis provider wrapping
- `src/app/template.tsx`: does not exist yet -- needs creation for page transitions
- Route groups: `(auth)`, `(dashboard)` -- page transitions scope via template.tsx placement
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
