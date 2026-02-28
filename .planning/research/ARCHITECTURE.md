# Architecture Research

**Domain:** Design system integration — Next.js 16 App Router + Tailwind CSS 4 + Framer Motion 12
**Researched:** 2026-02-28
**Confidence:** HIGH (based on existing codebase analysis + official docs)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Design Token Layer                          │
│  globals.css @theme block — single source of truth              │
│  --color-*, --font-*, --radius-*, --shadow-*, --spacing-*       │
│  Tailwind generates utility classes from these tokens            │
├─────────────────────────────────────────────────────────────────┤
│                    Component Architecture                         │
│  ┌───────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  ui/ (atoms)  │  │ sections/    │  │  dashboard/           │ │
│  │  Button       │  │ Landing page │  │  Nav, Views           │ │
│  │  Card         │  │ sections     │  │  Dashboard components │ │
│  │  Input        │  └──────────────┘  └───────────────────────┘ │
│  │  Badge        │  ┌──────────────┐                            │
│  └───────────────┘  │ w/ (wedding) │                            │
│                     │ Public web   │                            │
│                     │ sections     │                            │
│                     └──────────────┘                            │
├─────────────────────────────────────────────────────────────────┤
│                    Animation Layer                                │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  AnimationWrapper (client component, reusable)          │     │
│  │  whileInView + viewport={{ once: true }}                │     │
│  │  Variants defined centrally in lib/animations.ts        │     │
│  └────────────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────────┤
│                    Font Loading Layer                             │
│  layout.tsx → next/font/google → CSS variables injected          │
│  --font-heading, --font-body → referenced in @theme + globals    │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `globals.css @theme` | Token definitions — Tailwind utility generation | CSS-first, replaces tailwind.config.ts |
| `layout.tsx` | Font loading, CSS variable injection via className | next/font/google, server component |
| `ui/Button.tsx` | Typed button primitive, all variants | Replaces `.btn-primary`, `.btn-outline` CSS classes |
| `ui/Card.tsx` | Surface primitive with consistent border/shadow | Token-driven, no hardcoded colors |
| `AnimationWrapper` | Scroll-triggered animation client component wrapper | Framer Motion whileInView |
| `lib/animations.ts` | Shared Framer Motion variants | Single definition, imported everywhere |
| `sections/` | Landing page sections (pure layout, no logic) | Server components, wrap with AnimationWrapper |
| `dashboard/` | App views — state-heavy, all client | Keep existing structure, reskin tokens |
| `w/[slug]` | Public wedding web | Server-rendered, reskin tokens |

## Recommended Project Structure

The existing structure is sound. Changes are additive — new files, not reorganization.

```
src/
├── app/
│   ├── globals.css          # MODIFIED: replace :root colors with @theme block
│   ├── layout.tsx           # MODIFIED: swap font imports (Playfair → new heading font)
│   ├── page.tsx             # MODIFIED: redesigned landing page sections
│   ├── (auth)/              # MODIFIED: reskin login, register, onboarding pages
│   ├── (dashboard)/         # MODIFIED: reskin all dashboard views
│   └── w/[slug]/            # MODIFIED: reskin public wedding web
│
├── components/
│   ├── ui/                  # MODIFIED + EXPANDED: proper primitives
│   │   ├── Button.tsx       # NEW: typed component replacing .btn-* CSS classes
│   │   ├── Card.tsx         # NEW: surface primitive
│   │   ├── Input.tsx        # NEW: form input primitive
│   │   ├── Badge.tsx        # NEW: status/tag primitive
│   │   ├── Footer.tsx       # EXISTING: reskin
│   │   └── Navigation.tsx   # EXISTING: reskin (landing nav)
│   │
│   ├── sections/            # EXISTING: all modified for redesign
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Gallery.tsx
│   │   ├── Timeline.tsx
│   │   ├── Locations.tsx
│   │   ├── Contacts.tsx
│   │   └── RSVP.tsx
│   │
│   ├── dashboard/           # EXISTING: all modified for redesign
│   │   ├── DashboardNav.tsx
│   │   ├── ChecklistView.tsx
│   │   ├── BudgetView.tsx
│   │   ├── GuestsView.tsx
│   │   └── ChatInterface.tsx
│   │
│   └── motion/              # NEW: animation wrappers
│       ├── AnimateIn.tsx    # Scroll-triggered reveal wrapper
│       ├── AnimateStagger.tsx # Staggered children animation
│       └── variants.ts      # Shared motion variant definitions
│
└── lib/
    └── (existing lib files unchanged)
```

### Structure Rationale

- **`@theme` in globals.css:** Tailwind 4 CSS-first config. No tailwind.config.ts needed. Tokens declared once, utility classes auto-generated, CSS variables available at runtime.
- **`components/motion/`:** Isolates all Framer Motion client-component concerns. Server components import and wrap with these — avoids sprinkling `'use client'` across every section.
- **`components/ui/` expanded:** Typed React primitives replace one-off utility class strings like `className="btn-primary !text-base !px-8"`. Consistent API, single place to update.

## Architectural Patterns

### Pattern 1: CSS-First Design Tokens via `@theme`

**What:** Replace the current `:root { --color-primary: ... }` block with a Tailwind 4 `@theme` block. This makes tokens available both as CSS variables AND as Tailwind utility classes (`bg-primary`, `text-primary`, etc.).

**When to use:** All color, spacing, radius, and shadow tokens that need Tailwind utilities. Keep `:root` only for non-Tailwind values (safe-area insets, section-padding).

**Trade-offs:** Tailwind 4 `@theme` generates utility classes automatically — you get both `var(--color-primary)` in CSS and `bg-primary` in className. The downside is that `@theme` variables cannot reference other CSS variables defined outside `@theme`, so keep the token set self-contained.

**Example:**
```css
/* globals.css */

@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: #6B5E4E;
  --color-primary-light: #897465;
  --color-primary-dark: #4E4539;
  --color-secondary: #F7F4F0;
  --color-accent: #C9A97A;
  --color-surface: #FFFFFF;
  --color-border: #E8E3DB;
  --color-text: #1A1A1A;
  --color-text-muted: #6B6B6B;

  /* Typography */
  --font-heading: var(--font-heading-loaded), 'Georgia', serif;
  --font-body: var(--font-body-loaded), 'system-ui', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;

  /* Radius */
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.08);
  --shadow-md: 0 4px 16px 0 rgb(0 0 0 / 0.08);
  --shadow-lg: 0 8px 32px 0 rgb(0 0 0 / 0.12);
}

/* Non-token globals — stay in :root */
:root {
  --section-padding: 6rem;
  --section-padding-mobile: 4rem;
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
}
```

### Pattern 2: Font Loading — CSS Variable Bridge

**What:** Next.js `next/font` injects font classes on `<html>`. The font variable name must bridge to the `@theme` token. Use a two-step naming: `next/font` produces `--font-heading-loaded`, `@theme` references it in `--font-heading`.

**When to use:** Always — this is the correct Next.js 16 font pattern.

**Trade-offs:** No font flash, zero layout shift, self-hosted from Google Fonts CDN at build time. The bridge variable approach means changing the font is a one-line change in layout.tsx.

**Example:**
```typescript
// layout.tsx
import { Inter, DM_Serif_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body-loaded",   // feeds into @theme --font-body
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-heading-loaded", // feeds into @theme --font-heading
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="cs" className={`${inter.variable} ${dmSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Pattern 3: Animation Wrapper Components

**What:** Framer Motion requires `'use client'`. Server components (all App Router pages by default) cannot use it directly. Create thin client wrapper components that accept `children` and apply motion — server components stay server, animations still work.

**When to use:** Any scroll-triggered reveal animation on landing page sections, dashboard cards, public wedding web.

**Trade-offs:** Slight indirection. The benefit is keeping RSC benefits (streamed HTML, no client JS for static content) while still having animations. Critical for SEO — content renders in initial HTML, animation is progressive enhancement.

**Example:**
```typescript
// components/motion/AnimateIn.tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimateInProps {
  children: ReactNode;
  delay?: number;
  variant?: 'fadeUp' | 'fadeIn' | 'slideLeft';
  className?: string;
}

const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
  },
};

export function AnimateIn({
  children,
  delay = 0,
  variant = 'fadeUp',
  className,
}: AnimateInProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      variants={variants[variant]}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

```typescript
// Usage in server component (page.tsx section)
import { AnimateIn } from '@/components/motion/AnimateIn';

// No 'use client' needed here
export default function HeroSection() {
  return (
    <section>
      <AnimateIn>
        <h1>Naplánujte svatbu bez stresu</h1>
      </AnimateIn>
      <AnimateIn delay={0.1}>
        <p>Subtitle text...</p>
      </AnimateIn>
    </section>
  );
}
```

### Pattern 4: Typed UI Primitives

**What:** Replace one-off Tailwind utility strings and CSS classes (`.btn-primary`, `className="btn-primary !text-base !px-8"`) with typed React components. All styling logic lives in the component, callers just use props.

**When to use:** Any element that appears more than twice with consistent behavior (Button, Card, Input, Badge).

**Trade-offs:** More files upfront, but eliminates style drift. The current codebase has `!important` overrides on `.btn-primary` which is a signal the CSS-class approach is already breaking down.

**Example:**
```typescript
// components/ui/Button.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-light',
  outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-text-muted hover:text-primary hover:bg-secondary',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium',
          'min-h-[44px] transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
          '-webkit-tap-highlight-color-transparent',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
```

## Data Flow

### Theme Token Flow

```
globals.css @theme block
    ↓ (Tailwind generates utilities at build)
CSS custom properties in :root (browser exposes these)
    ↓
layout.tsx injects font variables via next/font className on <html>
    ↓
All components consume via:
  - Tailwind utility: bg-primary, text-text-muted
  - CSS variable: var(--color-primary) for inline styles, gradients
  - Component prop: <Button variant="primary">
```

### Animation Trigger Flow

```
User scrolls → Viewport intersection observed (IntersectionObserver via Framer)
    ↓
AnimateIn/AnimateStagger whileInView fires
    ↓
Framer Motion applies CSS transforms (GPU-composited, no reflow)
    ↓
viewport={{ once: true }} — animation does not replay on scroll-back
```

### Font Loading Flow

```
Build time: next/font downloads Google Font, generates @font-face
    ↓
layout.tsx: inter.variable + dmSerif.variable classNames on <html>
    ↓
Browser: CSS variable --font-body-loaded and --font-heading-loaded available
    ↓
@theme: --font-heading references --font-heading-loaded
    ↓
globals.css h1-h6: font-family: var(--font-heading) applied
```

## Integration Points

### Existing Architecture — What Changes vs What Stays

| Element | Status | Change |
|---------|--------|--------|
| `app/globals.css` `:root` color block | MODIFIED | Migrate colors to `@theme`, keep spacing/safe-area in `:root` |
| `app/layout.tsx` font imports | MODIFIED | Replace `Playfair_Display` with chosen heading font |
| `.btn-primary`, `.btn-outline` CSS classes | DEPRECATED | Replace with `<Button>` component. Remove from globals.css after migration. |
| `.animate-fade-in-up` CSS keyframe | DEPRECATED | Replace with Framer Motion AnimateIn wrapper |
| `var(--color-*)` inline styles in components | KEPT AS-IS or migrated | `var(--color-primary)` still works after @theme migration. Can migrate to Tailwind utilities incrementally. |
| `DashboardNav` | MODIFIED | Reskin colors, font classes |
| All dashboard views | MODIFIED | Reskin — no structural change |
| Auth pages | MODIFIED | Reskin + layout improvements |
| `w/[slug]` public web | MODIFIED | Reskin all sections |
| Supabase integration | UNTOUCHED | Not in scope |
| Route structure | UNTOUCHED | No route changes |

### New Components Needed

| Component | Path | Priority | Notes |
|-----------|------|----------|-------|
| `AnimateIn` | `components/motion/AnimateIn.tsx` | P0 | Needed before any landing page section work |
| `AnimateStagger` | `components/motion/AnimateStagger.tsx` | P1 | For feature grids, benefit lists |
| `Button` | `components/ui/Button.tsx` | P0 | Replace .btn-* everywhere |
| `Card` | `components/ui/Card.tsx` | P1 | Dashboard cards, feature cards |
| `Input` | `components/ui/Input.tsx` | P1 | Auth forms, RSVP form |
| `Badge` | `components/ui/Badge.tsx` | P2 | Checklist status, guest RSVP status |
| `cn` util | `lib/utils.ts` | P0 | `clsx` + `tailwind-merge` for className composition |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server components ↔ AnimateIn | children prop pattern | Server renders content, AnimateIn wraps for animation |
| @theme tokens ↔ Tailwind utilities | Auto-generated by Tailwind 4 | `--color-primary` → `bg-primary`, `text-primary` |
| next/font ↔ @theme fonts | CSS variable bridge | `--font-heading-loaded` injected by next/font, consumed in @theme |
| Dashboard layout ↔ views | `pt-16` main, fixed nav | Existing pattern, keep — just reskin |

## Build Order (Dependency-Aware)

The design system has hard dependencies. Build in this order to avoid rework:

**Stage 1 — Foundation (no existing components broken)**
1. Update `globals.css`: migrate `:root` colors to `@theme`, add new color palette, add new token namespaces (radius, shadow). Old `var(--color-*)` references in existing components still resolve — zero breakage.
2. Update `layout.tsx`: swap font imports. Replace `Playfair_Display` with chosen heading font. The `--font-heading` CSS variable chain means all `font-serif` usage in the DOM gets the new font automatically.
3. Create `lib/utils.ts` with `cn()` helper.
4. Create `components/motion/AnimateIn.tsx` and `AnimateStagger.tsx`.

**Stage 2 — UI Primitives**
5. Create `components/ui/Button.tsx` — typed primitive.
6. Create `components/ui/Card.tsx`.
7. Create `components/ui/Input.tsx`.

**Stage 3 — Landing Page**
8. Redesign `app/page.tsx` using new tokens + AnimateIn + Button primitive. Remove all `.btn-primary !important` overrides.

**Stage 4 — Auth**
9. Redesign login, register, onboarding pages using Input + Button primitives.

**Stage 5 — Dashboard**
10. Reskin `DashboardNav`, then each view (ChecklistView, BudgetView, GuestsView, ChatInterface). Card primitive usable here.

**Stage 6 — Public Wedding Web**
11. Reskin all `components/sections/` components. AnimateIn usable on all of them.
12. Reskin `w/[slug]/page.tsx`.

**Stage 7 — Cleanup**
13. Remove deprecated `.btn-primary`, `.btn-outline`, `.animate-fade-in-up` from `globals.css` once no references remain.

## Anti-Patterns

### Anti-Pattern 1: Mixing @theme and tailwind.config.ts

**What people do:** Keep a `tailwind.config.ts` with `theme.extend.colors` while also adding colors to `@theme` in CSS.

**Why it's wrong:** Tailwind 4 dropped the JS config file as the primary mechanism. Running both creates duplicate utility classes with different names and confuses which source wins. The project has no `tailwind.config.ts` — keep it that way.

**Do this instead:** All tokens in `@theme` in `globals.css`. Single source of truth.

### Anti-Pattern 2: `'use client'` on Section Components

**What people do:** Add `'use client'` to every section component that needs animation, effectively making the entire landing page a client bundle.

**Why it's wrong:** Eliminates RSC benefits. Full HTML is not streamed — it's JS-rendered on client. SEO impact on slow connections. Bundle size grows with every animation import.

**Do this instead:** Keep sections as server components. Wrap content with `<AnimateIn>` and `<AnimateStagger>` client components. The boundary is at the animation wrapper, not the section.

### Anti-Pattern 3: Hardcoded Colors in Component Files

**What people do:** Continue the existing pattern of `text-[var(--color-primary)]` or `style={{ color: '#8B7355' }}` inline in components rather than using generated Tailwind utilities.

**Why it's wrong:** After the @theme migration, `bg-primary` and `text-primary` work directly. Hardcoded hex strings mean a palette change requires grep-and-replace across all files.

**Do this instead:** Use Tailwind utilities generated from @theme tokens: `bg-primary`, `text-text-muted`, `border-border`, `shadow-md`. Reserve `var(--color-*)` only for CSS contexts where Tailwind utilities can't be used (gradients in CSS, pseudo-element content).

### Anti-Pattern 4: Animating Layout-Affecting Properties

**What people do:** Animate `height`, `padding`, `margin`, or `width` with Framer Motion for reveal effects.

**Why it's wrong:** These properties trigger reflow on every frame. On mobile Safari, this causes jank and dropped frames — especially on the public wedding web where guests may be on older phones.

**Do this instead:** Animate only `opacity` and `transform` (translateY, scale). These are GPU-composited and never cause reflow. The `fadeUp` variant in AnimateIn uses `y: 24` (transform), not `marginTop`.

### Anti-Pattern 5: !important Overrides on Design System Classes

**What people do:** The current codebase already shows this: `className="btn-primary !text-base !px-8 !py-4"`.

**Why it's wrong:** Signals the abstraction is wrong. If callers need to override, the component API is insufficient.

**Do this instead:** The `Button` component `size` prop handles this. `<Button size="lg">` applies the right padding without overrides.

## Scaling Considerations

This is a design-only milestone — no architectural scaling concerns. For completeness:

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current monolith is fine. Design system changes have no scaling impact. |
| 1k-100k users | No design system changes needed. Supabase connection pooling is the first bottleneck. |
| 100k+ users | CDN caching for the public wedding web pages becomes relevant. |

## Sources

- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) — official docs, HIGH confidence
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) — official blog, HIGH confidence
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) — official docs, HIGH confidence
- [Framer Motion useScroll](https://www.framer.com/motion/use-scroll/) — official docs, HIGH confidence
- [Framer Motion Scroll Animations](https://www.framer.com/motion/scroll-animations/) — official docs, HIGH confidence
- [Building a Production Design System with Tailwind CSS v4](https://dev.to/saswatapal/building-a-production-design-system-with-tailwind-css-v4-1d9e) — MEDIUM confidence

---
*Architecture research for: Design system integration — Next.js 16 + Tailwind 4 + Framer Motion 12*
*Researched: 2026-02-28*
