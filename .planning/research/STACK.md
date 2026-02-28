# Stack Research

**Domain:** Premium SaaS design overhaul — wedding planning app (Czech market)
**Researched:** 2026-02-28
**Confidence:** HIGH (core decisions verified via official docs + npm; font pairings MEDIUM via community sources)

---

## Context: What Already Exists

Do not re-install or reconfigure:

| Already Installed | Version | Status |
|-------------------|---------|--------|
| Next.js | 16.1.6 | Keep |
| Tailwind CSS | ^4 | Keep |
| Framer Motion | ^12.34.3 | Keep — use more aggressively |
| React | 19.2.3 | Keep |
| Inter (next/font) | — | Keep as body font |
| Lucide React | ^0.575.0 | Keep |

---

## Recommended Additions

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| lenis | 1.3.17 | Smooth scroll physics | Native browser scroll feels janky on premium sites. Lenis adds momentum-based scroll that makes the whole experience feel polished. ~2kb gzipped, works with Framer Motion's useScroll, officially supports React 19 + Next.js 15/16. Replaces nothing, enhances everything. |
| tw-animate-css | 1.4.0 | CSS animation utilities (Tailwind 4 compatible) | `tailwindcss-animate` (the shadcn default) is a v3 JS plugin — incompatible with Tailwind 4's CSS-first architecture. `tw-animate-css` is the v4-native replacement: pure CSS, imported directly into globals.css, provides `animate-in`/`animate-out` with fade/slide/zoom variants. Needed for entry animations on modals, dropdowns, and page elements. |

### Typography (font swap only — no new package)

| Decision | Details | Why |
|----------|---------|-----|
| Replace Playfair Display | Use **Cormorant Garamond** (Google Fonts, free) | Playfair is overused in wedding — Cormorant is a high-contrast display serif inspired by 16th-century Garamond. More distinctive, still premium. Load via `next/font/google` already available in the project. Use `display: swap`. |
| Keep Inter | Body font — already installed | Inter is optimal for dashboards and functional UI. Don't change it. |
| Body alternative if Inter feels too corporate | **Plus Jakarta Sans** | Slightly warmer than Inter, same excellent screen rendering, geometric forms. Drop-in replacement via `next/font/google`. Consider only if redesign feels too cold. |

Font pairing: `Cormorant Garamond` (headings, hero text, editorial moments) + `Inter` (all UI, body copy, forms).

### Design Tokens (no new package — native Tailwind 4 feature)

Tailwind 4 already supports design tokens natively via `@theme` in CSS. No library needed. The full color palette lives in `globals.css`:

```css
@import "tailwindcss";

@theme {
  /* Color palette — warm premium, not rustic */
  --color-champagne-50: oklch(0.98 0.01 80);
  --color-champagne-100: oklch(0.95 0.02 78);
  --color-champagne-200: oklch(0.90 0.04 75);
  --color-champagne-500: oklch(0.72 0.08 72);
  --color-champagne-900: oklch(0.30 0.04 68);

  --color-blush-50: oklch(0.98 0.01 10);
  --color-blush-300: oklch(0.85 0.06 15);
  --color-blush-500: oklch(0.72 0.10 14);

  --color-stone-50: oklch(0.98 0.005 100);
  --color-stone-900: oklch(0.20 0.01 95);

  /* Motion tokens — consistent across Framer Motion and CSS */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* Typography */
  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;

  /* Radius */
  --radius-card: 1.25rem;
  --radius-button: 0.625rem;
}
```

OKLCH is Tailwind 4's native color format — perceptually uniform, wider gamut on P3 displays. Use it for the entire custom palette.

---

## Scroll Animation Strategy

Framer Motion already installed handles all scroll-triggered animations. The pattern for this project:

| Use Case | Tool | Pattern |
|----------|------|---------|
| Element enter on scroll | Framer Motion `whileInView` | `initial={{ opacity: 0, y: 20 }}` + `whileInView={{ opacity: 1, y: 0 }}` + `viewport={{ once: true }}` |
| Parallax / scroll-linked values | Framer Motion `useScroll` + `useTransform` | Attach to section refs |
| Scroll progress indicator | Framer Motion `useScroll` | `scrollYProgress` on window |
| Smooth scroll physics | Lenis | Wrap root layout, integrates with Framer Motion |
| CSS-only entrance (modals, dropdowns) | `tw-animate-css` | `animate-in fade-in-0 slide-in-from-bottom-4` |

Do NOT add GSAP. It adds 30kb+ and creates two competing animation systems. Framer Motion handles everything needed for this project scope.

CSS scroll-driven animations (native browser) are tempting but Firefox support is incomplete as of early 2026 — Framer Motion's `useScroll` is the safe cross-browser choice.

---

## Installation

```bash
# New additions only
npm install lenis

# Dev / CSS tooling
npm install tw-animate-css
```

Then in `app/globals.css`:
```css
@import "tailwindcss";
@import "tw-animate-css";

@theme { /* ...tokens above... */ }
```

Lenis setup in `app/layout.tsx`:
```tsx
import { ReactLenis } from 'lenis/react'

export default function RootLayout({ children }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
      {children}
    </ReactLenis>
  )
}
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Cormorant Garamond | DM Serif Display | Cormorant has more character range and optical weights; DM Serif is flat by comparison |
| Cormorant Garamond | Libre Baskerville | Too heavy, web-text feel rather than display |
| Lenis | No smooth scroll | Default browser scroll feels abrupt on landing pages; Lenis is the lightest correct fix |
| Lenis | GSAP ScrollSmoother | Requires GSAP Club license for production use; 30kb overhead vs 2kb |
| tw-animate-css | tailwindcss-animate | tailwindcss-animate is a v3 JS plugin, breaks with Tailwind 4 |
| Framer Motion whileInView | AOS (Animate on Scroll) | AOS is a separate system — redundant when Framer Motion is already installed |
| @theme tokens | CSS-in-JS (styled-components, etc.) | Zero compatibility with Tailwind 4 utility classes; contradicts the existing stack |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| GSAP | 30kb+ bundle hit, creates two animation systems alongside Framer Motion | Framer Motion `useScroll` + `useTransform` |
| React Spring | Third animation library with different API — split mental model | Framer Motion already covers the use cases |
| Styled Components / Emotion | CSS-in-JS breaks Tailwind 4's CSS-first model, adds runtime cost | Tailwind `@theme` tokens + `cn()` utility |
| Radix UI / shadcn | Adds significant component overhead; this is a design overhaul, not a component library migration | Custom components with Tailwind 4 |
| Adobe Fonts / Typekit | Paid, adds external network request | Google Fonts via `next/font` (self-hosted, zero layout shift, free) |
| ScrollMagic | Unmaintained, jQuery-era library | Framer Motion `useScroll` |
| tailwindcss-animate | Incompatible with Tailwind 4 (v3 JS plugin only) | `tw-animate-css` |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| lenis@1.3.17 | React 19, Next.js 15/16 | Use `lenis/react` subpath for ReactLenis component; add `'use client'` to wrapper |
| tw-animate-css@1.4.0 | Tailwind CSS 4 | Import via CSS `@import`, not JS `plugins[]` |
| Cormorant Garamond | next/font/google (already in project) | Use `weight: ['300', '400', '500', '600']`, `style: ['normal', 'italic']`, `subsets: ['latin']` |
| Framer Motion@12 | React 19, Next.js 16 | Already installed; `whileInView` + `useScroll` are stable |

---

## Tailwind 4 CSS Features Available Without Libraries

These are already available in the existing Tailwind 4 install — no additions needed:

| Feature | How to Use | Use Case |
|---------|-----------|----------|
| `@theme` design tokens | Define in globals.css | Color palette, spacing, motion timing |
| OKLCH color space | `oklch(0.72 0.08 72)` values in `@theme` | Richer, perceptually uniform colors |
| `@custom-variant` | `@custom-variant dark (&:where([data-theme="dark"] *))` | Theme switching without rebuild |
| `@utility` | Define custom utility classes | One-off component helpers |
| CSS `color-mix()` | `color-mix(in oklch, var(--color-blush-500) 20%, white)` | Tints and shades inline |
| `backdrop-blur-*` | Already a utility | Frosted glass cards |
| `text-balance` | `text-balance` class | Heading line wrapping |

---

## Sources

- [Tailwind CSS v4.0 Official Blog](https://tailwindcss.com/blog/tailwindcss-v4) — OKLCH colors, @theme tokens, CSS-first config
- [Tailwind CSS Theme Variables Docs](https://tailwindcss.com/docs/theme) — @theme directive behavior
- [Motion (Framer Motion) Scroll Animations](https://motion.dev/docs/react-scroll-animations) — useScroll, whileInView patterns
- [Lenis GitHub](https://github.com/darkroomengineering/lenis) — version, React 19 support, Next.js integration
- [tw-animate-css GitHub](https://github.com/Wombosvideo/tw-animate-css) — Tailwind v4 replacement for tailwindcss-animate
- [next/font Optimization Docs](https://nextjs.org/docs/app/getting-started/fonts) — self-hosting, zero layout shift
- [Cormorant Garamond — Google Fonts](https://fonts.google.com/specimen/Cormorant+Garamond) — weights, character set
- [GSAP vs Motion comparison](https://motion.dev/docs/gsap-vs-motion) — bundle size, use case boundaries
- [Can I Use — animation-timeline scroll()](https://caniuse.com/mdn-css_properties_animation-timeline_scroll) — Firefox support gap confirming JS fallback needed

---

*Stack research for: Svoji design overhaul (v1.0)*
*Researched: 2026-02-28*
