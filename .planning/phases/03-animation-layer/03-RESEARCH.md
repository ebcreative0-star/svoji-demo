# Phase 3: Animation Layer - Research

**Researched:** 2026-02-28
**Domain:** Scroll animation, smooth scroll, micro-interactions, page transitions, accessibility
**Confidence:** HIGH (core stack verified via official docs and npm registry)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scroll-triggered reveals**
- Entrance style: fade + slide up (~20-30px translateY)
- Stagger: yes, child elements stagger in sequence (~100ms apart)
- Speed: moderate (400-500ms duration)
- Replay: fire once only -- elements stay visible after first reveal (`once: true`)
- Implementation: Framer Motion `whileInView`

**Micro-interactions**
- Button hover: lift (-1 to -2px translateY) AND scale (1.02-1.05x) combined
- Button active/press: scale down to 0.97-0.98 for tactile press feedback
- Card hover: deepen existing shadow effect
- Input focus: neutral soft glow (light gray/white, NOT brand primary color)
- Implementation: Framer Motion for all micro-interactions (consistent API, spring physics)

**Page transitions**
- Style: crossfade -- pozvolny, satenovy pocit (~350-450ms)
- Scope: only public-facing pages (landing page + public wedding web). Dashboard and auth skip transitions for speed
- Loading indicator: none -- rely on crossfade alone
- Implementation: Next.js App Router `template.tsx` + Framer Motion `AnimatePresence` in public route groups only

**Smooth scroll (Lenis)**
- Smoothing intensity: moderate (lerp ~0.1, duration ~1.2)
- Anchor links: smooth animated scroll to target section
- Dashboard scope: Claude's discretion (weigh smooth feel vs snappy list interaction)
- Mobile: Claude's discretion (weigh consistent feel vs potential jank on older devices)

**Reduced motion (ANIM-05)**
- All animations respect `prefers-reduced-motion` via `useReducedMotion` hook
- When enabled: no motion -- all animations suppressed

### Claude's Discretion
- Exact spring/easing curves for each animation type
- Lenis on dashboard: enable or disable based on UX trade-offs
- Lenis on mobile: enable or disable based on performance
- Lenis configuration fine-tuning (exact lerp, duration, wheel multiplier)
- How to handle reduced-motion for page transitions (instant swap vs still crossfade)
- Stagger timing per section type

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANIM-01 | Scroll-triggered entrance animations on all major sections (fade + slide, Framer Motion whileInView) | Framer Motion `whileInView` + variants + staggerChildren verified via official docs |
| ANIM-02 | Smooth scroll across entire site via Lenis | `lenis` v1.3.17 with `ReactLenis` component from `lenis/react` verified via npm + GitHub README |
| ANIM-03 | Micro-interactions on buttons (hover lift/scale), cards (hover shadow), inputs (focus glow) | Framer Motion `whileHover`, `whileTap` spring physics verified via official docs |
| ANIM-04 | Page transitions between routes using Next.js App Router template.js pattern | `AnimatePresence` + `FrozenRouter` pattern for App Router verified via community sources |
| ANIM-05 | All animations respect prefers-reduced-motion via useReducedMotion | `MotionConfig reducedMotion="user"` and `useReducedMotion()` hook verified via motion.dev |
</phase_requirements>

---

## Summary

Framer Motion (already installed at v12.34.3) covers ANIM-01, ANIM-03, ANIM-04, and ANIM-05. Lenis (not yet installed, current version 1.3.17) covers ANIM-02. Both libraries are mature and well-documented. The Stack is locked by CONTEXT.md decisions -- no library selection needed here.

The primary architectural challenge is threading reduced-motion support consistently across all animation sites. The cleanest approach is `MotionConfig reducedMotion="user"` at a high level in the tree, which automatically suppresses transform and layout animations for all nested `motion.*` components when the OS setting is enabled. For Lenis, a separate check against `prefers-reduced-motion` media query is needed to skip initialization.

Page transitions have a known App Router complexity: `AnimatePresence` in `layout.tsx` does not work reliably because the App Router updates context during navigation, causing premature unmounting of exiting components. The established workaround (FrozenRouter pattern) stabilizes the router context for the duration of exit animations. Scope is intentionally narrow: only public route groups get `template.tsx`, dashboard and auth are excluded.

**Primary recommendation:** Install `lenis`, wire `ReactLenis root` in root layout, scope `template.tsx` with FrozenRouter pattern to the public route group only, add `MotionConfig reducedMotion="user"` at root, and build reusable `ScrollReveal` and `FadeIn` wrapper components for phases 4-7 to consume.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | 12.34.3 (installed) | Scroll reveals, micro-interactions, page transitions | Already in package.json; covers all four animation requirement types with one API |
| lenis | 1.3.17 (not yet installed) | Smooth scroll physics across site | Canonical smooth scroll library; darkroom.engineering; replaces deprecated @studio-freight/lenis |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lenis/react | bundled with lenis | `ReactLenis` component + `useLenis` hook | React context-based Lenis integration; eliminates manual instance management |
| next/navigation | bundled with Next.js | `useSelectedLayoutSegment`, `usePathname` | Required for FrozenRouter pattern and keying AnimatePresence transitions |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| lenis | native CSS `scroll-behavior: smooth` | No easing control, no spring physics, no anchor-scroll integration |
| framer-motion AnimatePresence | View Transitions API | Firefox support incomplete as of early 2026 (listed in REQUIREMENTS out-of-scope) |
| MotionConfig reducedMotion | Manual useReducedMotion everywhere | MotionConfig is a one-line global solution; manual approach risks missing animation sites |

**Installation:**
```bash
npm install lenis
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── ui/                    # Existing -- Button, Card, Input get motion. wrappers
│   ├── animation/             # New -- reusable animation primitives
│   │   ├── ScrollReveal.tsx   # whileInView fade+slide wrapper
│   │   ├── StaggerContainer.tsx # Parent variants for stagger sequences
│   │   └── FrozenRouter.tsx   # App Router context freeze for page transitions
│   └── providers/
│       └── LenisProvider.tsx  # ReactLenis root wrapper
├── app/
│   ├── layout.tsx             # Add LenisProvider + MotionConfig here
│   ├── template.tsx           # Do NOT create here -- wrong scope
│   ├── (public)/              # New route group for landing + public wedding web
│   │   ├── template.tsx       # AnimatePresence crossfade -- ONLY here
│   │   ├── page.tsx           # Landing page (moved from app/page.tsx)
│   │   └── w/[slug]/page.tsx  # Public wedding web (moved from app/w/[slug])
│   ├── (auth)/                # No template.tsx -- skip transitions
│   └── (dashboard)/           # No template.tsx -- skip transitions
└── hooks/
    └── useReducedMotion.ts    # Re-export or thin wrapper -- optional
```

**Route group restructuring note:** Currently landing page is at `app/page.tsx` and public wedding web is at `app/w/[slug]/page.tsx`. To scope `template.tsx` to public routes only, these should move into an `(public)` route group. The route group name is parenthesized so it doesn't appear in URLs -- `app/(public)/page.tsx` still maps to `/`.

### Pattern 1: ReactLenis Root Provider

**What:** Wrap the entire app with `ReactLenis root` so smooth scroll applies globally. Dashboard exclusion is handled via `data-lenis-prevent` attribute on scroll containers, not by excluding from the provider.

**When to use:** Single provider at root; let Lenis handle all wheel scroll globally.

```typescript
// src/components/providers/LenisProvider.tsx
'use client';

import { ReactLenis } from 'lenis/react';
import { useReducedMotion } from 'framer-motion';

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  // Skip Lenis entirely when user prefers reduced motion
  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,          // Moderate smoothing (user decision)
        duration: 1.2,      // Scroll duration in seconds (user decision)
        smoothWheel: true,  // Smooth mouse wheel (default)
        syncTouch: false,   // Disable on touch (Claude discretion: avoid jank)
      }}
    >
      {children}
    </ReactLenis>
  );
}
```

```typescript
// src/app/layout.tsx -- add LenisProvider + MotionConfig
import { LenisProvider } from '@/components/providers/LenisProvider';
import { MotionConfig } from 'framer-motion';

export default function RootLayout({ children }) {
  return (
    <html lang="cs" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="antialiased">
        <MotionConfig reducedMotion="user">
          <LenisProvider>
            {children}
          </LenisProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
```

### Pattern 2: Scroll-Triggered Reveal (ANIM-01)

**What:** A reusable `ScrollReveal` wrapper component that applies fade + slide-up entrance animation when scrolled into view, fires once, and supports stagger.

**When to use:** Wrap any major section or grid of cards in phases 4-7.

```typescript
// src/components/animation/ScrollReveal.tsx
'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

const variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function ScrollReveal({ children, delay = 0, className }: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={variants}
      transition={{ duration: 0.45, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

// Stagger container for child sequences
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

const containerVariants = (staggerDelay: number) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: staggerDelay },
  },
});

export function StaggerContainer({ children, className, staggerDelay = 0.1 }: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={containerVariants(staggerDelay)}
    >
      {children}
    </motion.div>
  );
}
```

### Pattern 3: Micro-interactions on Primitives (ANIM-03)

**What:** Wrap existing Button and Card with `motion.*` to add whileHover and whileTap. Input focus glow added via Tailwind (Framer Motion does not animate CSS `ring` utilities well -- Tailwind transition is better here).

**When to use:** Button gets motion.button wrapper. Card (interactive prop) gets motion.div. Input keeps Tailwind for focus glow but changes ring color to neutral.

```typescript
// Button.tsx -- replace <button> with <motion.button>
import { motion } from 'framer-motion';

// In the return:
<motion.button
  ref={ref}
  disabled={disabled || isLoading}
  className={cn(buttonVariants({ variant, size }), className)}
  whileHover={{ y: -1.5, scale: 1.03 }}
  whileTap={{ scale: 0.975 }}
  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
  aria-label={ariaLabel}
  {...props}
>
```

```typescript
// Card.tsx -- interactive variant gets motion
import { motion } from 'framer-motion';

// Interactive cards use motion.div:
{interactive ? (
  <motion.div
    className={cn('bg-white border ...', className)}
    whileHover={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    {...props}
  >
    {children}
  </motion.div>
) : (
  <div className={cn('bg-white border ...', className)} {...props}>
    {children}
  </div>
)}
```

```typescript
// Input.tsx -- change focus ring to neutral soft glow
// Replace focus:ring-[var(--color-primary)] with:
'focus:ring-2 focus:ring-gray-300 focus:ring-opacity-70'
// This is pure Tailwind -- no Framer Motion needed for CSS ring transitions
```

### Pattern 4: Page Transitions -- FrozenRouter (ANIM-04)

**What:** App Router updates router context during navigation, which causes `AnimatePresence` to unmount exiting components before their exit animation completes. `FrozenRouter` captures the previous context and holds it stable until navigation is complete.

**When to use:** Only in the `(public)` route group's `template.tsx`.

```typescript
// src/components/animation/FrozenRouter.tsx
'use client';

import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useContext, useEffect, useRef } from 'react';

function usePreviousValue<T>(value: T): T | undefined {
  const prevValue = useRef<T>();
  useEffect(() => {
    prevValue.current = value;
    return () => { prevValue.current = undefined; };
  });
  return prevValue.current;
}

export function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const prevContext = usePreviousValue(context) || null;
  const segment = useSelectedLayoutSegment();
  const prevSegment = usePreviousValue(segment);
  const changed = segment !== prevSegment && segment !== undefined && prevSegment !== undefined;

  return (
    <LayoutRouterContext.Provider value={changed ? prevContext : context}>
      {children}
    </LayoutRouterContext.Provider>
  );
}
```

```typescript
// src/app/(public)/template.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSelectedLayoutSegment } from 'next/navigation';
import { FrozenRouter } from '@/components/animation/FrozenRouter';

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={segment}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
```

### Pattern 5: Reduced Motion (ANIM-05)

**What:** `MotionConfig reducedMotion="user"` at root automatically disables transform and layout animations for all nested motion components when `prefers-reduced-motion: reduce` is set. LenisProvider independently checks `useReducedMotion()` to skip smooth scroll initialization.

**Behavior when reduced motion is on:**
- `whileInView` animations: enter/exit states collapse to `opacity` only (transforms suppressed)
- `whileHover`, `whileTap`: suppressed
- `AnimatePresence`: still runs but uses instant/no-duration transition
- Lenis: skipped entirely -- native scroll resumes

**Claude's discretion resolved:** For page transitions under reduced motion, the crossfade opacity transition is acceptable to keep (it doesn't cause vestibular issues). Instant swap is also fine -- recommend keeping a very short 150ms opacity-only transition to avoid jarring flash.

```typescript
// MotionConfig placement in layout.tsx handles everything automatically:
<MotionConfig reducedMotion="user">
  {/* All motion.* children respect user's OS setting */}
</MotionConfig>
```

### Anti-Patterns to Avoid

- **AnimatePresence in layout.tsx directly:** Does not work with App Router. Use `template.tsx` in the route group.
- **Multiple AnimatePresence wrappers:** Only one per route group. Nested AnimatePresence breaks exit animations.
- **Lenis + Framer Motion RAF conflict:** When using ReactLenis with `autoRaf: true` (default), no additional RAF management needed. Do not manually call `lenis.raf()` alongside Framer Motion's internal scheduler.
- **motion.div wrapping Server Components:** Server Components cannot use Framer Motion. Animation wrappers must be `'use client'`. Wrap at the layout/section level, not deep in server-rendered trees.
- **Animating Tailwind ring utilities with Framer Motion:** Framer Motion cannot animate Tailwind `ring-*` classes. Use CSS transitions (Tailwind `transition-shadow`, `transition-colors`) for focus/hover states that rely on utility classes. Reserve Framer Motion for transform and opacity.
- **Including options object directly in useEffect deps:** Causes infinite re-renders. Use `useRef` for Lenis options.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth scroll physics | Custom easeInOut requestAnimationFrame loop | `lenis` | RAF timing, touch normalization, anchor scroll, modal prevention, cleanup -- all handled |
| Scroll detection | Intersection Observer wiring | `framer-motion whileInView` | Threshold, margin, once logic, SSR safety -- all built in |
| Page transition timing | Route change event listeners | `AnimatePresence mode="wait"` + `template.tsx` | Correctly sequences exit-before-enter without lifecycle hacks |
| Reduced motion detection | `window.matchMedia('prefers-reduced-motion')` listener | `MotionConfig reducedMotion="user"` | Reactive, SSR-safe, propagates to all motion components automatically |
| Spring physics | Custom bezier approximations | Framer Motion `type: 'spring'` | Velocity-aware, physically accurate, integrates with gesture state |

**Key insight:** This entire animation layer has no genuinely novel problems. Every requirement maps to a documented library feature. The work is integration, not invention.

---

## Common Pitfalls

### Pitfall 1: AnimatePresence Exit Timing in App Router

**What goes wrong:** Exit animation starts but the new page renders before it completes, causing a flash or both pages visible simultaneously.

**Why it happens:** Next.js App Router updates `LayoutRouterContext` aggressively during navigation, triggering React to unmount the exiting component tree early.

**How to avoid:** Use the `FrozenRouter` component to hold the previous context value during exit animations. Apply in `template.tsx`, not `layout.tsx` (layout does not remount on navigation).

**Warning signs:** If you see both old and new page content visible simultaneously, or exit animation cuts off abruptly.

### Pitfall 2: Lenis and Scroll Containers (Dashboard)

**What goes wrong:** Lenis intercepts scroll events on overflow containers (e.g., the chat message list, budget table), preventing them from scrolling independently.

**Why it happens:** Lenis captures all wheel events globally when `root: true`.

**How to avoid:** Add `data-lenis-prevent` attribute to any overflow scroll container that should not be intercepted by Lenis. For dashboard, consider disabling Lenis on the dashboard layout entirely by rendering `LenisProvider` conditionally, or using `data-lenis-prevent` on all dashboard scroll containers.

**Claude's discretion resolved:** Recommend disabling Lenis on dashboard layout (`(dashboard)/layout.tsx`) entirely. Dashboard has multiple scroll containers (chat, budget table, guest list) and list interaction benefits from snappy native scroll. Add `data-lenis-prevent` as a safety net on the root dashboard layout wrapper anyway.

### Pitfall 3: SSR Hydration with Motion Components

**What goes wrong:** `motion.*` components that read browser APIs (e.g., `useReducedMotion` checking `matchMedia`) cause hydration mismatch between server and client renders.

**Why it happens:** `matchMedia` is not available during SSR; server renders without reduced motion consideration.

**How to avoid:** `MotionConfig reducedMotion="user"` is SSR-safe -- Framer Motion handles this internally. `useReducedMotion()` hook is also SSR-safe (returns `null` on server). The manual `useReducedMotion` check in `LenisProvider` is fine because `LenisProvider` is `'use client'` and runs only after hydration.

**Warning signs:** Next.js hydration error console warnings.

### Pitfall 4: `once: true` and Viewport Margin

**What goes wrong:** Elements reveal too early (before they're meaningfully visible) or too late (user has already scrolled past them).

**Why it happens:** Default `viewport={{ once: true }}` fires when any part of the element enters the viewport, including 1px. No margin means elements at the very bottom trigger immediately.

**How to avoid:** Use `viewport={{ once: true, margin: '-80px' }}` so elements fire when 80px inside the viewport. Adjust per section type.

### Pitfall 5: `motion.button` and `disabled` Prop

**What goes wrong:** `whileHover` still fires on disabled buttons, giving false interactivity feedback.

**Why it happens:** Framer Motion gesture handlers don't automatically check `disabled` HTML attribute.

**How to avoid:** Conditionally apply gesture props based on disabled/loading state:

```typescript
<motion.button
  whileHover={disabled || isLoading ? undefined : { y: -1.5, scale: 1.03 }}
  whileTap={disabled || isLoading ? undefined : { scale: 0.975 }}
  ...
/>
```

---

## Code Examples

Verified patterns from research:

### Lenis React Provider (lenis/react, v1.3.17)

```typescript
// Source: github.com/darkroomengineering/lenis/blob/main/packages/react/README.md
import { ReactLenis } from 'lenis/react';

<ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
  {children}
</ReactLenis>
```

### MotionConfig Reduced Motion (framer-motion v12)

```typescript
// Source: motion.dev/docs/react-accessibility
import { MotionConfig } from 'framer-motion';

<MotionConfig reducedMotion="user">
  {children}
</MotionConfig>
// When prefers-reduced-motion: reduce -- all transform/layout animations suppressed automatically
// opacity and color animations still run (non-vestibular)
```

### whileInView with Variants and Stagger

```typescript
// Source: motion.dev/docs/react-motion-component + framer.com/motion/animation
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

<motion.div
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-80px' }}
>
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Spring Micro-interaction

```typescript
// Source: motion.dev/docs/react-motion-component (gestures section)
<motion.button
  whileHover={{ y: -1.5, scale: 1.03 }}
  whileTap={{ scale: 0.975 }}
  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
>
  Click me
</motion.button>
```

### AnimatePresence Crossfade (template.tsx)

```typescript
// Source: imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router
// Pattern: template.tsx in scoped route group
'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelectedLayoutSegment } from 'next/navigation';

export default function Template({ children }) {
  const segment = useSelectedLayoutSegment();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={segment}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@studio-freight/lenis` | `lenis` (direct package) | 2023 | Old package deprecated; new package is `lenis`, React wrapper at `lenis/react` |
| `@studio-freight/react-lenis` | `lenis/react` (subpath export) | 2023 | Bundled in main `lenis` package; separate install no longer needed |
| CSS scroll-driven animations | Framer Motion / Lenis | Ongoing | Native CSS scroll animations excluded per REQUIREMENTS.md (Firefox support incomplete) |
| View Transitions API | AnimatePresence + template.tsx | Ongoing | View Transitions excluded per REQUIREMENTS.md (Firefox support incomplete) |
| `_app.js` AnimatePresence | `template.tsx` + FrozenRouter | Next.js 13+ | Pages Router pattern breaks in App Router; template.tsx is the correct integration point |

---

## Open Questions

1. **Route group restructuring for public template.tsx**
   - What we know: Currently `app/page.tsx` (landing) and `app/w/[slug]/page.tsx` (public wedding web) are at root, not in a route group
   - What's unclear: Moving them into `(public)/` requires restructuring. `/` maps to `app/(public)/page.tsx` correctly (route groups don't affect URL). `/w/[slug]` maps to `app/(public)/w/[slug]/page.tsx` correctly. No URL changes.
   - Recommendation: Create `(public)` route group and move files. This is the clean way to scope `template.tsx` without affecting URLs. Confirm no existing links or API routes reference these paths by structure.

2. **FrozenRouter and internal Next.js API**
   - What we know: `LayoutRouterContext` is imported from `next/dist/shared/lib/app-router-context.shared-runtime` -- this is an internal Next.js export, not a public API
   - What's unclear: Could break on Next.js version upgrades
   - Recommendation: Accept this for now. It's the only reliable community solution. Add a comment in the file flagging the internal import. Monitor on Next.js upgrades. Alternative is living without exit animations (opacity-in only, no opacity-out).

3. **Dashboard Lenis strategy**
   - What we know: Dashboard has multiple independent scroll containers (chat, guest list, budget table). Global Lenis intercepts these.
   - What's unclear: Whether `data-lenis-prevent` is sufficient or if full exclusion is cleaner
   - Recommendation (Claude's discretion): Exclude Lenis from dashboard entirely. Do not wrap `(dashboard)/layout.tsx` with LenisProvider. This is the safest approach and avoids per-element `data-lenis-prevent` auditing across all dashboard views.

---

## Validation Architecture

> `nyquist_validation` not present in config.json -- section skipped.

---

## Sources

### Primary (HIGH confidence)

- `github.com/darkroomengineering/lenis/blob/main/packages/react/README.md` -- ReactLenis API, root prop, useLenis hook, autoRaf
- `github.com/darkroomengineering/lenis/blob/main/README.md` -- Core config options (lerp, duration, autoRaf, smoothWheel, syncTouch)
- `npm show lenis version` -- confirmed v1.3.17 current
- `node_modules/framer-motion/package.json` -- confirmed v12.34.3 installed
- `motion.dev/docs/react-accessibility` -- MotionConfig reducedMotion="user", useReducedMotion hook
- `framer.com/motion/animation` -- whileInView, whileHover, whileTap, spring transition

### Secondary (MEDIUM confidence)

- `imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router` -- FrozenRouter pattern for App Router AnimatePresence (community, cross-referenced with GitHub discussions)
- `github.com/vercel/next.js/discussions/42658` -- App Router AnimatePresence limitation confirmed by community
- `bridger.to/lenis-nextjs` -- LenisProvider pattern, dependency array pitfall, syncTouch recommendation

### Tertiary (LOW confidence)

- WebSearch results on Framer Motion v12 stagger -- confirmed via official motion.dev docs cross-reference; elevated to MEDIUM

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- both libraries verified via npm, GitHub official README, installed package.json
- Architecture: HIGH -- Framer Motion patterns verified via official docs; FrozenRouter MEDIUM (community pattern for internal Next.js API)
- Pitfalls: MEDIUM -- combination of official docs and community-verified patterns

**Research date:** 2026-02-28
**Valid until:** 2026-04-01 (Lenis and Framer Motion both active; Next.js FrozenRouter pattern is fragile -- recheck on Next.js major upgrades)
