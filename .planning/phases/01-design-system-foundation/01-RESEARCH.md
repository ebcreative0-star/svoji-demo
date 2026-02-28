# Phase 1: Design System Foundation - Research

**Researched:** 2026-02-28
**Domain:** Tailwind CSS 4 @theme tokens, OKLCH colors, Next.js font loading
**Confidence:** HIGH

---

## Summary

Phase 1 converts the existing prototype-level design system (mocha brown hex palette, Playfair Display headings, scattered `:root` variables) to a production-grade warm-premium system anchored in Tailwind 4 `@theme` tokens and OKLCH colors. The challenge is threefold: (1) migrate the CSS entry point from `@tailwind` directives to `@import "tailwindcss"` to unlock `@theme`, (2) define a new OKLCH warm-premium palette as `@theme` tokens so Tailwind generates utility classes AND the tokens propagate to all 196+ existing `var(--color-*)` references in TSX without touching those files, (3) swap Playfair Display for Cormorant Garamond in `layout.tsx` and update the three CSS fallback strings.

The key insight is **Strategy A** (identified pre-roadmap, confirmed correct): keep all existing CSS variable names (`--color-primary`, `--color-text-light`, etc.) but change their values. The 208 existing `var(--color-*)` references will pick up new values for free. No TSX file touching needed for color. Font references are slightly more involved: 21 `font-serif` Tailwind class usages, plus 4 `var(--font-heading)` and 5 `var(--font-body)` references in globals.css — all handled by changing the `next/font` import in layout.tsx and updating the CSS fallback strings.

**Primary recommendation:** Migrate globals.css to `@import "tailwindcss"` + `@theme inline { ... }` pattern. Define all existing variable names under `@theme inline` pointing at new OKLCH values. Replace `Playfair_Display` with `Cormorant_Garamond` in layout.tsx. One atomic commit ships everything.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DSGN-01 | Color palette uses OKLCH color space with warm premium tones (champagne, blush, stone, charcoal) | @theme tokens support OKLCH natively; palette values derived from existing hex codes converted to OKLCH + new warm hues |
| DSGN-02 | Typography uses modern serif heading font replacing Playfair Display, paired with Inter body | Cormorant Garamond confirmed in next/font/google with weights 300-700 + variable axis; swap is a 3-line layout.tsx change |
| DSGN-03 | Spacing and sizing follow a consistent token scale defined in Tailwind 4 @theme | @theme supports --spacing-*, --text-*, --radius-* namespaces that generate utility classes |
| DSGN-04 | All color tokens propagate via CSS variables to existing 196+ references without breakage | @theme variables compile to :root CSS vars; keeping existing --color-* names means zero TSX changes needed |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tailwindcss | 4.2.1 (installed) | Utility CSS + @theme token system | Already in project, v4 is the target |
| @tailwindcss/postcss | 4.2.1 (installed) | PostCSS integration | Already wired in postcss.config.mjs |
| next/font/google | (Next.js 16.1.6 built-in) | Zero-CLS font loading | Self-hosts fonts at build time, eliminates FOUT |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| oklch.com converter | (web tool) | Hex-to-OKLCH conversion during palette design | Use to verify final OKLCH values before committing |
| @fontsource-variable/cormorant-garamond | (optional) | Self-hosted variable font alternative | Only if Google CDN blocking is needed; next/font handles it better |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Cormorant Garamond | DM Serif Display | DM Serif only ships weight 400, no italic — insufficient for heading hierarchy. Cormorant Garamond has 300-700 + italic via variable font. |
| @theme inline | plain :root | @theme generates Tailwind utility classes (bg-primary, text-stone-600 etc.); :root doesn't. Use @theme. |
| OKLCH | HSL or hex | OKLCH is perceptually uniform (equal chroma steps look equal to human eye), P3 gamut support on modern displays, required by Tailwind v4's default palette system. |

**Installation:** No new packages needed. All dependencies are already installed.

---

## Architecture Patterns

### Recommended File Structure

```
src/app/
├── globals.css          # Primary change: migrate to @import + @theme
├── layout.tsx           # Font swap: Playfair_Display → Cormorant_Garamond
```

No new files. All changes are in these two existing files.

### Pattern 1: @theme inline for next/font variables

**What:** When `@theme` references a CSS variable set by next/font (injected on `<html>` via className), you MUST use `@theme inline` — not bare `@theme`. Without `inline`, Tailwind resolves the variable reference at build time (when the next/font var doesn't exist yet), producing broken output.

**When to use:** Any time a `@theme` token's value is `var(--something-injected-at-runtime)`.

**Example:**
```css
/* Source: https://www.owolf.com/blog/how-to-use-custom-fonts-in-a-nextjs-15-tailwind-4-app */
@import "tailwindcss";

@theme inline {
  --font-heading: var(--font-heading);   /* maps next/font CSS var to @theme token */
  --font-body: var(--font-body);
}
```

This is required for the Cormorant Garamond + Inter integration.

### Pattern 2: Keep existing --color-* names, change values

**What:** Define the new OKLCH palette using the exact same CSS variable names that exist in `:root` today. When @theme compiles, it outputs these to `:root`, overriding or replacing the existing values. All 208 `var(--color-*)` references in TSX pick up the new values automatically.

**When to use:** Migration where existing component references must not break.

**Example:**
```css
@theme {
  /* Keep name, change value */
  --color-primary: oklch(57.1% 0.048 68);        /* replaces: #8B7355 */
  --color-primary-light: oklch(66.0% 0.042 70);  /* replaces: #A69076 */
  --color-primary-dark: oklch(47.0% 0.038 70);   /* replaces: #6B5A45 */
  --color-secondary: oklch(98.1% 0.012 79.8);    /* replaces: #FAF8F5 */
  --color-accent: oklch(74.4% 0.066 76.6);       /* replaces: #C4A77D */
  --color-accent-rose: oklch(76.5% 0.056 18.4);  /* replaces: #D4A5A5 */
  --color-accent-sage: oklch(75.7% 0.033 133.5); /* replaces: #A8B5A0 */
  --color-text: oklch(21.8% 0.000 0);            /* replaces: #1A1A1A */
  --color-text-light: oklch(47.5% 0.000 0);      /* replaces: #5C5C5C */
  --color-background: oklch(100% 0 0);           /* replaces: #FFFFFF */
  --color-white: oklch(100% 0 0);                /* replaces: #FFFFFF */
  --color-border: oklch(90.8% 0.012 79.8);       /* replaces: #E5E0D8 */
}
```

The "warm premium" shift happens by adjusting the hue/chroma in these values. The STATE.md notes the final values need to be reconciled — the OKLCH values above are approximations from the current hex values; the planner should treat exact values as a decision point.

### Pattern 3: Spacing scale via @theme

**What:** Define spacing/sizing tokens that generate Tailwind utilities.

**When to use:** When you want `pt-section` or `gap-content` utilities for consistent section spacing.

**Example:**
```css
@theme {
  --spacing-section: 6rem;           /* generates: p-section, pt-section, etc. */
  --spacing-section-mobile: 4rem;
  --spacing-content-gap: 3rem;
}
```

Note: The existing `--section-padding`, `--section-padding-mobile`, `--content-gap` in `:root` do NOT generate Tailwind utilities. Moving them to `@theme` under the `--spacing-*` namespace gives you utility classes.

### Anti-Patterns to Avoid

- **Mixing @tailwind directives with @theme:** The project currently uses `@tailwind base/components/utilities` (v3 style). While Tailwind v4 technically still processes `@tailwind` as a recognized at-rule, `@theme` requires the CSS-first approach (`@import "tailwindcss"`). Do not add `@theme` to a file that still has `@tailwind` directives — migrate the entry point first.
- **@theme without inline for runtime vars:** `@theme { --font-heading: var(--font-heading); }` will resolve to an empty/broken value. Always use `@theme inline` for variables that reference next/font injected custom properties.
- **Defining new --color-* names that don't match existing var() references:** If you add `--color-champagne` but components use `var(--color-primary)`, the new token won't help existing code. Either keep existing names (recommended) or update component references too (out of scope for Phase 1).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hex-to-OKLCH conversion | Manual math | oklch.com or the built-in Node script shown in research | OKLCH conversion requires multiple matrix transforms; one rounding error breaks the color |
| Font loading with fallback metrics | Custom CSS | next/font/google `display: "swap"` + automatic size-adjust | Next.js calculates `size-adjust` from actual font metrics, preventing CLS on swap |
| CSS variable → utility class mapping | Custom PostCSS plugin | @theme directive | Tailwind does this natively; custom plugin would fight the framework |
| Font preloading | `<link rel="preload">` tags | next/font (it preloads automatically) | next/font handles preload, self-hosting, and cache headers automatically |

**Key insight:** The entire "propagate tokens everywhere" problem is solved by keeping CSS variable names identical. Don't create a mapping layer — just reuse names.

---

## Common Pitfalls

### Pitfall 1: Forgetting to migrate @tailwind directives

**What goes wrong:** Adding `@theme` blocks to a file that still uses `@tailwind base/components/utilities`. The `@theme` block may be silently ignored or cause build errors.

**Why it happens:** The project has Tailwind v4 installed but globals.css was written with v3 syntax. The postcss plugin recognizes `@tailwind` as valid and processes the file, but the `@theme` at-rule requires the v4 CSS-first mode which is activated by `@import "tailwindcss"`.

**How to avoid:** The very first change in the plan must be: replace `@tailwind base; @tailwind components; @tailwind utilities;` with `@import "tailwindcss";`.

**Warning signs:** Build succeeds but @theme-defined utilities like `bg-primary` don't appear in generated CSS.

### Pitfall 2: @theme without inline for next/font variables

**What goes wrong:** Headings render in fallback font instead of Cormorant Garamond despite correct layout.tsx setup.

**Why it happens:** `@theme { --font-heading: var(--font-heading); }` — Tailwind resolves this at build time, but the `--font-heading` CSS variable is only injected at runtime by next/font (as a className on `<html>`). The build-time value is empty string.

**How to avoid:** Always use `@theme inline { --font-heading: var(--font-heading); }`. The `inline` keyword tells Tailwind to keep the `var()` reference as-is in the output rather than resolving it at build time.

**Warning signs:** `font-family: ` (empty value) in computed styles for heading elements.

### Pitfall 3: OKLCH gamut clipping on older displays

**What goes wrong:** Colors look different (washed out or shifted) on non-P3 displays.

**Why it happens:** High-chroma OKLCH values (chroma > 0.2) can exceed the sRGB gamut. Browsers automatically gamut-map to sRGB for non-P3 displays, but the result may not match design intent.

**How to avoid:** Keep chroma below 0.15 for all warm neutral tones (champagne, stone, charcoal). Only allow chroma 0.15-0.25 for accent colors (blush, accent rose) that are meant to be vivid. The current palette's chroma values (0.004-0.066) are all safely within sRGB.

**Warning signs:** Check oklch.com's gamut visualization — any value shown outside the sRGB boundary needs chroma reduction.

### Pitfall 4: Cormorant Garamond subsets missing Czech characters

**What goes wrong:** Some Czech diacritics (á, č, ě, í, ř, š, ž, ů) render in fallback font.

**Why it happens:** The project uses Czech UI (`lang="cs"`). Cormorant Garamond requires `latin-ext` subset for full Czech character coverage. Playfair Display was also loaded with `latin-ext` in the current setup.

**How to avoid:** Always include `subsets: ["latin", "latin-ext"]` in the Cormorant Garamond font configuration. The font data confirms it supports `latin-ext`.

**Warning signs:** Individual characters appearing in a different font weight/style within Czech headings.

### Pitfall 5: --spacing-* namespace collision

**What goes wrong:** Adding `--spacing-section` to `@theme` generates a `section` utility that conflicts with HTML `<section>` element or existing class names.

**Why it happens:** `--spacing-*` generates utilities like `p-{name}`, `m-{name}`, `w-{name}` etc. The name part is derived from everything after `--spacing-`.

**How to avoid:** Use descriptive multi-word names: `--spacing-page-section: 6rem` generates `pt-page-section`, not `pt-section`.

---

## Code Examples

Verified patterns from official sources and project-specific analysis:

### Complete globals.css migration

```css
/* Source: https://tailwindcss.com/docs/theme */
@import "tailwindcss";

/* Step 1: Wire next/font CSS vars into @theme (must use 'inline') */
@theme inline {
  --font-heading: var(--font-heading);
  --font-body: var(--font-body);
}

/* Step 2: Define color tokens (keep existing names, change to OKLCH values) */
@theme {
  /* Warm premium palette — OKLCH values need final design decision */
  --color-primary: oklch(57.1% 0.048 68);
  --color-primary-light: oklch(66.0% 0.042 70);
  --color-primary-dark: oklch(47.0% 0.038 70);
  --color-secondary: oklch(98.1% 0.012 79.8);
  --color-accent: oklch(74.4% 0.066 76.6);
  --color-accent-rose: oklch(76.5% 0.056 18.4);
  --color-accent-sage: oklch(75.7% 0.033 133.5);
  --color-text: oklch(21.8% 0.000 0);
  --color-text-light: oklch(47.5% 0.000 0);
  --color-background: oklch(100% 0 0);
  --color-white: oklch(100% 0 0);
  --color-border: oklch(90.8% 0.012 79.8);

  /* Spacing tokens (optional — adds utility class generation) */
  --spacing-page-section: 6rem;
  --spacing-page-section-mobile: 4rem;
  --spacing-content-gap: 3rem;
}

/* Step 3: Keep non-token :root vars that don't need utility classes */
:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
}

/* Step 4: Update font fallback strings (Playfair Display → Cormorant Garamond) */
body {
  font-family: var(--font-body), 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading), 'Cormorant Garamond', Georgia, serif;
}

.font-serif {
  font-family: var(--font-heading), 'Cormorant Garamond', Georgia, serif !important;
}
```

### layout.tsx font swap

```tsx
/* Source: next/font/google — Cormorant_Garamond confirmed in font-data.json */
import { Inter, Cormorant_Garamond } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// In JSX (same pattern as before):
<html lang="cs" className={`${inter.variable} ${cormorant.variable}`}>
```

Note: `Cormorant_Garamond` (underscore, not hyphen) is the correct import name for `next/font/google`. The font data confirms weights 300-700 and `latin-ext` subset are available.

### Verifying @theme output

After applying changes, running dev server and inspecting `<head>` computed styles should show:
```css
:root {
  --color-primary: oklch(57.1% 0.048 68);
  --font-heading: var(--font-heading);  /* with @theme inline */
  /* ... all other tokens ... */
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js | @theme in CSS | Tailwind v4 (Jan 2025) | No JS config file needed |
| @tailwind base/components/utilities | @import "tailwindcss" | Tailwind v4 | Single line replaces three |
| RGB/Hex colors in default palette | OKLCH colors | Tailwind v4 | Wider P3 gamut on modern displays |
| theme() function in CSS | var(--color-*) | Tailwind v4 | All tokens auto-exposed as CSS vars |
| Playfair Display (common wedding font) | Cormorant Garamond (2026 editorial) | This phase | Less crowded, higher contrast, more elegant |

**Deprecated/outdated in this project:**
- `@tailwind base/components/utilities`: Works in v4 (the postcss plugin still recognizes `@tailwind` as a trigger), but `@theme` requires `@import "tailwindcss"`. Must migrate.
- Hex values in `:root`: Valid CSS but loses Tailwind utility class generation and P3 gamut benefits.
- `Playfair_Display` import in layout.tsx: Replaced by `Cormorant_Garamond`.

---

## Open Questions

1. **Final OKLCH palette values for the warm-premium shift**
   - What we know: Current palette is mocha brown (`oklch(57.1% 0.053 72.7)` for primary). It reads as rustic, not premium.
   - What's unclear: The exact target hues for champagne, blush, stone, charcoal. The requirements name these color families but don't specify exact values.
   - Recommendation: Planner should make this a discrete decision task. A reasonable starting palette: shift primary hue from 72 (yellow-brown) toward 45-55 (warm gold/champagne range), reduce chroma slightly (0.053 → 0.040-0.045) for more muted premium feel. But the designer/developer should verify against actual browser rendering before committing.

2. **Cormorant Garamond vs DM Serif Display: final call**
   - What we know: STATE.md lists this as an open blocker. DM Serif Display only has weight 400 (no italics in Display variant, no 300/600/700). Cormorant Garamond has 300-700 + italic + variable axis — far more flexible for heading hierarchy.
   - What's unclear: Whether Evgenij has seen both rendered and has a preference.
   - Recommendation: Cormorant Garamond is the clearly superior choice technically. DM Serif Display's single weight would require DM Serif Text for regular weight. Cormorant Garamond handles everything in one font. Planner should assume Cormorant Garamond unless explicitly overridden.

3. **Whether safe-area-inset vars should move to @theme**
   - What we know: `--safe-area-inset-*` variables use `env()` values which are runtime browser values.
   - What's unclear: Whether `env()` values work as @theme token values.
   - Recommendation: Keep `--safe-area-inset-*` in `:root` only. They don't need utility class generation and `env()` values at build time would resolve incorrectly.

---

## Sources

### Primary (HIGH confidence)
- Tailwind CSS official docs (tailwindcss.com/docs/theme) — @theme directive, @theme inline, namespace conventions, CSS variable output format
- Tailwind CSS v4 blog post (tailwindcss.com/blog/tailwindcss-v4) — migration from @tailwind directives, @import "tailwindcss", OKLCH palette
- Tailwind CSS upgrade guide (tailwindcss.com/docs/upgrade-guide) — @tailwind → @import migration confirmed as breaking change
- Tailwind CSS compatibility docs (tailwindcss.com/docs/compatibility) — browser support, Safari 16.4+ confirmed, OKLCH support
- next/font/google font-data.json (verified in node_modules) — Cormorant_Garamond weights, styles, subsets confirmed
- @tailwindcss/postcss dist/index.js (inspected directly) — confirmed `@tailwind` at-rule still recognized as trigger in v4

### Secondary (MEDIUM confidence)
- owolf.com blog (Jan 2026) — @theme inline pattern for next/font integration, code examples verified against official docs
- GitHub discussion tailwindlabs/tailwindcss #13410 — next/font variable not applying without @theme inline; consistent with official docs

### Tertiary (LOW confidence)
- WebSearch findings on Cormorant Garamond vs DM Serif Display — multiple sources agree DM Serif Display only has weight 400, but cross-verified against font-data.json (confirmed in node_modules)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed and version-verified
- Architecture: HIGH — @theme patterns verified against official Tailwind v4 docs
- Font loading: HIGH — next/font confirmed in node_modules, font weights/subsets verified
- Exact OKLCH palette values: MEDIUM — conversion math is correct, but final warm-premium target values need design decision
- Pitfalls: HIGH — sourced from official docs and direct source code inspection

**Research date:** 2026-02-28
**Valid until:** 2026-08-28 (stable APIs, 6 months)
