# Phase 6: UI Redesign - Research

**Researched:** 2026-03-01
**Domain:** Next.js 16 / Tailwind 4 / Framer Motion 12 UI component redesign
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Auth pages (login, register):**
- Full visual upgrade, not just token alignment
- Centered card on subtle gradient background
- Subtle entrance animation: card fade-in + upward slide on load (Framer Motion)
- No structural layout changes (no split layout)

**Dashboard navigation:**
- Keep top nav bar on desktop, polish styling to match design system
- Mobile: replace hamburger dropdown with fixed bottom tab bar (5 main sections)
- Desktop nav items: Checklist, Budget, Guests, AI Chat, Settings + "Web pro hosty" link

**Public wedding web (/w/[slug]):**
- High polish level -- this is what guests see, the product showcase
- Parallax scroll effects: background images move at different speeds, Hero and Gallery get depth
- Section-by-section animations with parallax layers
- All sections (Hero, About, Timeline, Gallery, Locations, Contacts, RSVP) get design token treatment

**Footer:**
- Multi-column layout (Product, Legal, Social, Contact)
- Social media: Instagram only
- Legal: TOS link + GDPR/privacy link, pointing to actual pages with generated Czech content
- Contact: link to /contact page with contact form
- Create three new pages: /tos, /privacy, /contact

### Claude's Discretion

- Auth form error state pattern (inline vs banner)
- Dashboard view styling (cards vs flat with dividers)
- Dashboard page-level transitions between views
- RSVP form approach (inline section vs modal)
- Gallery display style (masonry vs grid vs carousel)
- Exact parallax intensity and animation timing
- Loading states and skeleton designs

### Deferred Ideas (OUT OF SCOPE)

- Custom subdomains for wedding pages (`adam-eva.svoji.cz`) -- requires DNS/routing infrastructure, separate phase
- Supabase `couples` table not found in schema cache during onboarding -- bug, separate fix needed
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UI-01 | Auth pages (login, register) redesigned with new design system primitives | Card + Button + Input components exist and are ready; Framer Motion animate-on-mount pattern documented below |
| UI-02 | Dashboard full redesign (navigation, checklist, budget, guests, chat, settings views) | DashboardNav refactor + bottom tab bar pattern; all dashboard views use raw HTML inputs/divs needing primitive substitution |
| UI-03 | Public wedding web visual refresh with new design tokens and primitives | useScroll/useTransform confirmed in FM 12.34.3; ScrollReveal already present; all section components identified |
| UI-04 | Footer expanded with standard content (TOS link, GDPR/privacy link, social media icons, contact placeholder) | Footer.tsx is a minimal 30-line component; three new route pages needed (/tos, /privacy, /contact) |
</phase_requirements>

---

## Summary

Phase 6 is a pure visual layer upgrade -- no new data models, no new API endpoints, no new business logic. The design system foundation is complete (OKLCH tokens, Cormorant Garamond + Inter, all UI primitives). The work is applying that foundation to the surfaces that were not touched in v1.0: auth pages, dashboard, and the public wedding web.

The codebase audit reveals a clear split: auth pages already use the design primitives (Button, Card, Input) and the gradient background. They are 80% there -- the main gap is adding Framer Motion entrance animation and minor polish. Dashboard and Settings pages are the opposite: they use raw `<input>`, `<button>`, `<select>`, and `<textarea>` HTML with ad-hoc Tailwind classes instead of the typed UI primitives. These need systematic substitution. The public wedding web's section components (Hero, About, Gallery etc.) use basic CSS animation keyframes and the `ScrollReveal` wrapper -- parallax via Framer Motion `useScroll` + `useTransform` is the primary new pattern needed there.

The three new pages (/tos, /privacy, /contact) are new routes with no data dependencies -- static content pages that need proper legal text in Czech and a contact form respectively.

**Primary recommendation:** Work in four sequential plan units -- (1) auth pages, (2) dashboard nav + mobile tab bar, (3) dashboard views + settings, (4) public wedding web sections + new footer pages.

---

## Standard Stack

### Core (already installed -- no new packages needed)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| framer-motion | 12.34.3 | Entrance animations, parallax via useScroll/useTransform | Confirmed: useScroll, useTransform, motion.div all present |
| tailwindcss | ^4 | Utility styling with OKLCH @theme tokens | Already configured in globals.css |
| class-variance-authority | ^0.7.1 | Typed component variants (Button, etc.) | Already used in Button.tsx |
| lucide-react | ^0.575.0 | Icons for nav, footer social | Already used throughout |
| lenis | ^1.3.17 | Smooth scroll (works with FM parallax) | Already installed |
| react-hook-form + zod | ^7.71 / ^4.3.6 | Form validation in RSVP + /contact | Already used in RSVP.tsx |

### No new packages required

All needed tools are already installed. Do NOT add:
- Any parallax library (react-scroll-parallax, etc.) -- Framer Motion `useScroll` covers this
- Any animation library beyond Framer Motion
- Any form library beyond react-hook-form

---

## Architecture Patterns

### Existing Design Token Reference

```css
/* globals.css -- @theme block */
--color-primary: oklch(55% 0.045 55)        /* warm brown */
--color-primary-light: oklch(64% 0.040 57)
--color-secondary: oklch(98.1% 0.012 80)    /* warm off-white */
--color-accent: oklch(72% 0.055 65)         /* gold */
--color-accent-rose: oklch(76.5% 0.056 18)
--color-accent-sage: oklch(75.7% 0.033 134)
--color-text: oklch(21.8% 0.000 0)
--color-text-light: oklch(47.5% 0.000 0)
--color-border: oklch(90.8% 0.012 80)
--color-background: oklch(100% 0 0)
```

Always use CSS variable references: `var(--color-primary)` not hardcoded values.
In Tailwind classes: use `text-[var(--color-primary)]` pattern (established throughout codebase).

### Pattern 1: Framer Motion Entrance Animation (Auth pages)

```typescript
// Card fade-in + upward slide on mount
// Use initial + animate (not whileInView) since it's above the fold
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
  <Card> ... </Card>
</motion.div>
```

This is the correct pattern for above-the-fold mount animations. `whileInView` is for scroll-triggered -- wrong for auth cards that are immediately visible.

### Pattern 2: Parallax with useScroll + useTransform (Public wedding web)

```typescript
// Source: framer-motion v12 -- useScroll confirmed available
'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function HeroWithParallax() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  // Background moves at 50% scroll speed (parallax depth)
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[var(--color-secondary)]"
        style={{ y: backgroundY }}
      />
      <div className="relative z-10">
        {/* content */}
      </div>
    </section>
  );
}
```

Key: the parallax element must be `position: absolute` inside a `position: relative overflow-hidden` container. The content layer sits on `z-10` above. Intensity control: background at 30-50% of scroll speed feels natural; avoid >60% which looks cheap.

The existing `useScroll` with `offset: ['start start', 'end start']` tracks from when the element enters the viewport top until it exits the top. This is the standard recipe for section-level parallax.

### Pattern 3: Mobile Bottom Tab Bar (Dashboard)

```typescript
// Fixed bottom nav -- replaces hamburger on mobile only
// Tailwind: fixed bottom-0 left-0 right-0 md:hidden
// Must account for safe-area-inset-bottom (notches)
// safe area already defined in globals.css
<nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t"
     style={{ paddingBottom: 'var(--safe-area-inset-bottom)' }}>
  <div className="flex items-center justify-around h-16">
    {navItems.map(item => (
      <Link key={item.href} href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-2 ${
              isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-light)]'
            }`}>
        <Icon className="w-5 h-5" />
        <span className="text-xs">{item.label}</span>
      </Link>
    ))}
  </div>
</nav>
```

The existing `DashboardNav` already uses `hidden md:flex` / `md:hidden` breakpoint logic. The mobile hamburger section can be stripped and replaced with this fixed bottom nav component. The dashboard `<main className="pt-16">` will also need `pb-20` on mobile to prevent content from hiding behind the tab bar.

### Pattern 4: Dashboard View Primitive Substitution

The Settings page and dashboard views use raw HTML `<input>`, `<button>`, `<select>`, `<textarea>` with ad-hoc classes. The correct approach is systematic substitution:

```typescript
// Before (settings page pattern):
<input type="text" className="w-full px-4 py-2 border rounded-lg" />
<button className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg ...">

// After:
import { Input, Button, Select, Textarea, Card } from '@/components/ui';
<Input label="Partner 1" value={...} onChange={...} />
<Button variant="primary" isLoading={saving}>Uložit změny</Button>
```

The UI primitives already exist with full typing. This is substitution work, not new component creation.

### Pattern 5: Auth Error State (Claude's Discretion -- Recommendation: Inline banner)

Current login.tsx already uses the inline banner pattern:
```typescript
{error && (
  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
    {error}
  </div>
)}
```

This is clean and already aligned. Keep this pattern. Upgrade it to use design tokens:
```typescript
// Upgraded: use border-l accent + semantic color
<div className="border-l-2 border-red-400 bg-red-50/70 text-red-700 px-4 py-3 rounded-r-lg text-sm mb-4">
```

### Pattern 6: Multi-column Footer

```typescript
// Footer columns: Product | Legal | Social | Contact
// Responsive: single column on mobile, 4-column on lg
<footer className="bg-[var(--color-text)] text-white">
  <div className="container py-12 lg:py-16">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      {/* Brand column */}
      {/* Legal column: TOS + Privacy links */}
      {/* Social column: Instagram icon + link */}
      {/* Contact column: link to /contact */}
    </div>
    <div className="border-t border-white/10 pt-8 text-center text-sm text-white/50">
      © {year} Svoji.cz
    </div>
  </div>
</footer>
```

The existing `Footer.tsx` takes `partner1` + `partner2` props because it's the public wedding page footer (shows couple names). The new SaaS footer is a separate component or a conditional version -- the `/w/[slug]` page uses the couple-specific footer; the main landing page and new legal pages use the SaaS footer.

### Pattern 7: New Static Pages (/tos, /privacy, /contact)

```
src/app/(public)/tos/page.tsx       -- static content, Czech TOS text
src/app/(public)/privacy/page.tsx   -- static content, Czech GDPR/privacy text
src/app/(public)/contact/page.tsx   -- react-hook-form + zod, no backend yet (mailto: fallback ok)
```

These live in the `(public)` route group and inherit the `PublicTransitionProvider` layout -- page transitions included for free.

The /contact page can use `mailto:` link as the action for now (no email sending API in scope). Form with: name, email, message fields. Submit opens `mailto:` with pre-filled subject/body, or shows a "Děkujeme, brzy se ozveme" message if a `/api/contact` endpoint is added later.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Parallax scroll effects | Custom scroll listener + state | `useScroll` + `useTransform` from framer-motion | FM handles rAF scheduling, spring physics, reduced-motion |
| Form validation (/contact) | Manual validation logic | react-hook-form + zod (already installed) | Type-safe, reuses exact same pattern as RSVP.tsx |
| Button/Input/Select styling | New CSS classes | Existing `Button`, `Input`, `Select`, `Textarea` primitives from `src/components/ui/` | Already typed, CVA variants, accessible |
| Mobile nav | Custom gesture detection | CSS `md:hidden` + fixed position | No JS needed for show/hide |
| Icon set | SVG sprites or custom icons | lucide-react (already installed) | Instagram icon: `Instagram` from lucide-react |

**Key insight:** The entire primitive library is ready. The "work" in this phase is applying existing tools to new surfaces, not building new tools.

---

## Common Pitfalls

### Pitfall 1: Parallax on Mobile Performance

**What goes wrong:** Heavy parallax on mobile causes jank and drains battery. The REQUIREMENTS.md explicitly lists "Heavy parallax effects: Mobile performance penalty" in Out of Scope -- but the CONTEXT.md decisions require parallax on the public wedding page. This is a resolved conflict: parallax is OK on the public wedding page but must be mobile-aware.

**How to avoid:** Wrap parallax motion values in a `useReducedMotion()` check from Framer Motion AND disable on mobile with a `window.matchMedia('(max-width: 768px)')` check or `md:` Tailwind breakpoint. On mobile, fall back to `ScrollReveal` (simple fade-in) instead of parallax.

```typescript
import { useScroll, useTransform, useReducedMotion } from 'framer-motion';
const prefersReducedMotion = useReducedMotion();
const backgroundY = useTransform(scrollYProgress, [0, 1],
  prefersReducedMotion ? ['0%', '0%'] : ['0%', '40%']
);
```

The existing `prefers-reduced-motion` support (ANIM-05, already complete) uses this same hook.

### Pitfall 2: Dashboard layout breaking with bottom tab bar

**What goes wrong:** Adding `fixed bottom-0` nav causes content to be obscured on mobile. The current `<main className="pt-16">` only accounts for the top nav.

**How to avoid:** In `src/app/(dashboard)/layout.tsx`, add conditional bottom padding:
```typescript
<main className="pt-16 pb-20 md:pb-0">{children}</main>
```
Also: the desktop top nav `DashboardNav` must be hidden on mobile (`hidden md:flex` for its main content) while the mobile bottom tab bar shows (`md:hidden`). The current `DashboardNav` already uses this pattern for the hamburger -- it just needs replacing.

### Pitfall 3: Footer prop mismatch

**What goes wrong:** The current `Footer.tsx` is couple-specific (requires `partner1` + `partner2` props). It appears on `/w/[slug]` (public wedding page). The new SaaS footer (for landing page + legal pages) is structurally different -- no couple props.

**How to avoid:** Create `SaasFooter.tsx` as a new component. Keep existing `Footer.tsx` for the public wedding page. The landing page (`src/app/(public)/page.tsx`) currently imports `Footer` from the landing page components -- check which footer it uses and update accordingly.

### Pitfall 4: Framer Motion `motion.div` in Server Components

**What goes wrong:** Framer Motion components require `'use client'`. Server component pages that try to use `motion.div` directly will throw.

**How to avoid:** All section components in `src/components/sections/` already have `"use client"` at the top. The pattern is correct. When adding parallax to Hero, About, Gallery -- they're already client components. The `/w/[slug]/page.tsx` is a Server Component -- it stays as a Server Component; it just imports client section components.

### Pitfall 5: `useScroll` with SSR

**What goes wrong:** `useScroll` accesses browser APIs. In Next.js App Router, if a component renders on server, it will throw.

**How to avoid:** The `'use client'` directive on section components handles this. No `typeof window` guards needed as long as the directive is present (already is).

### Pitfall 6: Tailwind 4 -- no `bg-opacity`, no shorthand opacity

**What goes wrong:** Tailwind 4 dropped some v3 utilities. `bg-opacity-50` doesn't work. The codebase uses the correct v4 pattern: `bg-black/40`, `bg-white/95`, `text-white/60` etc.

**How to avoid:** Continue using the slash notation. Check any new classes added for v3 patterns.

---

## Code Examples

### Auth page entrance animation (complete pattern)

```typescript
// src/app/(auth)/login/page.tsx -- addition to existing structure
'use client';
import { motion } from 'framer-motion';

// Wrap the existing card div:
<div className="min-h-screen flex items-center justify-center px-4 py-12"
     style={{ background: 'radial-gradient(ellipse at top, var(--color-secondary) 0%, var(--color-background) 70%)' }}>
  <motion.div
    className="w-full max-w-md"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
  >
    <Card className="shadow-lg">
      {/* existing content unchanged */}
    </Card>
  </motion.div>
</div>
```

The login page already has the correct background gradient and card structure. The change is minimal: wrap the `<div className="w-full max-w-md">` in a `motion.div`.

### Bottom tab bar (complete component sketch)

```typescript
// New addition inside DashboardNav.tsx or separate BottomTabBar.tsx
// Show only on mobile (md:hidden)
<nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[var(--color-border)]"
     style={{ paddingBottom: 'var(--safe-area-inset-bottom)' }}>
  <div className="flex items-center justify-around h-16">
    {navItems.map(({ href, label, icon: Icon }) => {
      const isActive = pathname === href;
      return (
        <Link key={href} href={href}
              className={`flex flex-col items-center gap-1 px-2 py-1 min-w-[56px] transition-colors ${
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-light)]'
              }`}>
          <Icon className="w-5 h-5" />
          <span className="text-[10px] font-medium">{label}</span>
        </Link>
      );
    })}
  </div>
</nav>
```

### Gallery - recommended: masonry vs grid vs carousel

**Recommendation: responsive CSS grid with hover-reveal captions (keep current lightbox).** The existing gallery uses `grid-cols-2 md:grid-cols-3` which is solid. For the "wow" factor upgrade, add:
1. `aspect-square` cells with real `next/image` (when images available) or styled placeholders
2. Hover scale effect: `group-hover:scale-105 transition-transform duration-500 overflow-hidden`
3. Wrap each cell in `ScrollReveal` with staggered `delay` for entrance animation

Masonry is complex in CSS (requires JS measurement or CSS multi-column with fragmentation issues). Not worth the complexity for this phase. The grid approach with good spacing and hover effects achieves the premium feel without fragmentation bugs.

### RSVP form -- recommendation: keep inline section

The current RSVP is an inline section with good structure. Modal adds complexity without benefit for a public wedding page (guests scroll to it, no navigation interruption). Keep inline. Upgrade: add `Card` wrapper around the form, improve radio button styling with custom styled radio indicators, add entrance animation via `ScrollReveal`.

---

## State of the Art

| Old Approach | Current Approach in Codebase | Status |
|--------------|------------------------------|--------|
| Custom scroll listeners for parallax | `useScroll` + `useTransform` (FM 12) | FM 12 -- use this |
| `useViewportScroll` | `useScroll` (renamed in FM 4+) | `useViewportScroll` still exported as alias in FM 12 but deprecated -- use `useScroll` |
| CSS `@keyframes` animation on mount | `motion.div` with `initial` + `animate` | Hero.tsx still uses `animate-fade-in-up` CSS class -- upgrade to FM for consistency |
| Raw HTML inputs | Typed UI primitive components | Settings page still uses raw HTML -- needs upgrade |
| Hamburger dropdown | Fixed bottom tab bar (mobile) | DashboardNav has hamburger -- replace mobile portion |

---

## Open Questions

1. **Contact form backend**
   - What we know: No `/api/contact` endpoint exists. React-hook-form + zod for the form is clear.
   - What's unclear: Should the contact form actually send email in this phase, or is a `mailto:` link acceptable?
   - Recommendation: Implement the form UI fully with validation. Use `mailto:` as fallback action for now. A real email send (via Supabase Edge Function or Resend) can be a v2.0 data-phase addition. Document this as a known limitation.

2. **Dashboard view-level page transitions**
   - What we know: The public pages have `AnimatePresence` via `PublicTransitionProvider`. Dashboard has no equivalent.
   - What's unclear: CONTEXT.md marks "dashboard page-level transitions between views" as Claude's Discretion.
   - Recommendation: Add a simple `motion.div` fade (opacity 0→1, 0.2s) in each dashboard view component using `initial/animate`. Do NOT add `AnimatePresence` to the dashboard layout -- it requires a keyed child and can conflict with Next.js App Router prefetching. A local fade on each view is simpler and sufficient.

3. **Public wedding page Navigation bar for /w/[slug]**
   - What we know: `Navigation.tsx` is a basic component with hardcoded "A & T" as logo. It renders on `/w/[slug]` via the page.tsx import.
   - What's unclear: Should Navigation be updated to show couple names dynamically? Or is this out of phase 6 scope?
   - Recommendation: Navigation on wedding page can show a simple wordmark or be transparent-on-light. Update the hardcoded "A & T" to accept a prop from the page (couple names). This is a minor addition that makes the wedding page feel finished.

---

## Validation Architecture

> `workflow.nyquist_validation` not present in `.planning/config.json` (only `workflow.research: true` is set). Skipping this section.

---

## Sources

### Primary (HIGH confidence -- direct codebase inspection)

- `/Users/eb-vm/Documents/claw/wedding-web/svoji/src/` -- full component tree read directly
- `/Users/eb-vm/Documents/claw/wedding-web/svoji/src/app/globals.css` -- OKLCH token definitions verified
- `/Users/eb-vm/Documents/claw/wedding-web/svoji/package.json` -- all dependency versions confirmed
- `node_modules/framer-motion` v12.34.3 -- `useScroll`, `useTransform`, `useReducedMotion` exports confirmed via runtime check

### Secondary (HIGH confidence)

- Framer Motion documentation for `useScroll`/`useTransform` API (confirmed consistent with FM v10+ API, unchanged in v12)
- Existing codebase patterns: `ScrollReveal.tsx`, `Button.tsx`, `Card.tsx`, `DashboardNav.tsx` read in full

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages confirmed installed and version-verified
- Architecture patterns: HIGH -- derived from direct codebase reading, not assumptions
- Pitfalls: HIGH -- identified from actual code gaps (Settings raw HTML, missing pb-20, Footer prop mismatch)
- Open questions: LOW -- 3 items requiring a decision call, not blockers

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable stack, no fast-moving deps)

---

## File Map for Planner

Comprehensive list of files touched in this phase:

**Modified:**
- `src/app/(auth)/login/page.tsx` -- add entrance animation
- `src/app/(auth)/register/page.tsx` -- same as login
- `src/app/(dashboard)/layout.tsx` -- add `pb-20 md:pb-0` to main
- `src/components/dashboard/DashboardNav.tsx` -- desktop polish + mobile bottom tab bar
- `src/components/dashboard/ChecklistView.tsx` -- primitive substitution where raw HTML exists
- `src/components/dashboard/BudgetView.tsx` -- same
- `src/components/dashboard/GuestsView.tsx` -- same
- `src/components/dashboard/ChatInterface.tsx` -- same
- `src/app/(dashboard)/settings/page.tsx` -- full primitive substitution (biggest settings file)
- `src/components/ui/Footer.tsx` -- expand to multi-column SaaS footer OR create SaasFooter.tsx
- `src/components/sections/Hero.tsx` -- add parallax background layer
- `src/components/sections/About.tsx` -- design token treatment, typography
- `src/components/sections/Gallery.tsx` -- hover effects, staggered entrance
- `src/components/sections/Timeline.tsx` -- design token treatment
- `src/components/sections/Locations.tsx` -- design token treatment
- `src/components/sections/Contacts.tsx` -- design token treatment
- `src/components/sections/RSVP.tsx` -- Card wrapper, styled radio buttons
- `src/components/ui/Navigation.tsx` -- accept couple name prop, minor token polish
- `src/app/(public)/w/[slug]/page.tsx` -- pass names to Navigation, use SaasFooter or couple footer

**Created:**
- `src/app/(public)/tos/page.tsx` -- static TOS page (Czech content)
- `src/app/(public)/privacy/page.tsx` -- static GDPR/privacy page (Czech content)
- `src/app/(public)/contact/page.tsx` -- contact form page
