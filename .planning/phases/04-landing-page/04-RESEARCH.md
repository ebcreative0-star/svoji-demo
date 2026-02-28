# Phase 4: Landing Page - Research

**Researched:** 2026-02-28
**Domain:** Next.js component architecture, Framer Motion chat animation, CSS grain texture, scroll-driven nav, mobile nav patterns
**Confidence:** HIGH (codebase is live on disk; no external library uncertainty -- all libraries already installed)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Hero section**
- Full viewport height (100vh) with centered content
- Chat mockup stays but with animated conversation -- messages appear progressively (typewriter or sequential reveal via Framer Motion)
- Background treatment: subtle paper/linen grain texture instead of gradient blobs
- Floating stats card stays as secondary visual element

**Section structure**
- Keep all 4 existing sections: Features, Social Proof, How-it-Works, Final CTA
- No sections added or removed

**Features cards**
- 3 features updated: AI Asistent, Interaktivní management plánování, Web pro hosty
- Each feature gets a Card component with icon, title, description
- Replace old feature definitions (AI Asistent, Chytrý checklist, Rozpočet a hosté)

**Copy & tone**
- Czech language, přátelský a přímý tón, tykání
- No change from current approach

**Navigation**
- Transparent over hero -> solid white with backdrop-blur + shadow on scroll
- Only auth links: logo + "Přihlásit se" + "Začít zdarma" CTA button
- No section anchor links

**Component architecture**
- Split page.tsx into separate components in `src/components/landing/` -- Hero.tsx, Features.tsx, SocialProof.tsx, HowItWorks.tsx, FinalCTA.tsx, LandingNav.tsx, LandingFooter.tsx
- All CTA buttons use `<Button>` from `@/components/ui/Button`
- Feature cards use `<Card>` from `@/components/ui/Card`
- Keep using `ScrollReveal` and `StaggerContainer` from animation layer

**Visual direction**
- Teplý minimal: lots of whitespace, warm colors (champagne, blush, stone), rounded corners, soft shadows
- Modern wedding magazine aesthetic
- Serif headings (Cormorant Garamond) + Inter body copy

### Claude's Discretion

- Exact CTA layout (single vs dual, social proof placement)
- Social proof metrics and visual treatment
- Mobile nav approach (hamburger vs minimal)
- Exact spacing scale between sections
- How-it-works visual treatment refinement
- Footer content and layout
- Grain texture implementation approach

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LAND-01 | Hero section with compelling headline, CTA, and animated entrance | Framer Motion sequential reveal for chat messages; useEffect-driven stagger for message appearance; ScrollReveal for hero content entrance |
| LAND-02 | Features section with visual cards showcasing product capabilities | Card component already exists with interactive variant; StaggerContainer for stagger reveal; updated feature definitions locked in CONTEXT.md |
| LAND-03 | Social proof section (stats, testimonials) | ScrollReveal wrapping stats block; Claude's discretion on metrics and layout |
| LAND-04 | How-it-works section with step-by-step visual flow | Existing 3-step structure; ScrollReveal wrapping; visual treatment is Claude's discretion |
| LAND-05 | Final CTA section with gradient or accent background | Existing gradient bg already in page.tsx; ScrollReveal wrapping; Button component for CTA |
| LAND-06 | Navigation bar with scroll behavior and mobile menu | useScroll from Framer Motion OR window scroll listener (existing Navigation.tsx uses scroll listener pattern); mobile nav is Claude's discretion |
| LAND-07 | Footer with consistent brand styling | LandingFooter component; simple brand logo + copyright; distinct from public wedding web Footer.tsx |
</phase_requirements>

---

## Summary

Phase 4 is primarily a refactoring and visual upgrade task, not a new-feature build. The current `src/app/(public)/page.tsx` is a 363-line monolith containing all sections inline. The work is to split this into separate components under `src/components/landing/`, update the visual design to match the warm minimal direction, animate the hero chat mockup, add a scroll-aware nav, and wire grain texture behind the hero.

All required libraries (Framer Motion 12.34.3, Lenis 1.3.17, lucide-react, cva) are already installed. The UI primitive layer (Button, Card, ScrollReveal, StaggerContainer) is complete from Phases 2 and 3. No new installs are needed.

The two technically interesting subproblems are: (1) the animated chat conversation in the hero mockup, which requires a sequenced reveal of messages using either `useEffect + setTimeout` or Framer Motion variants with explicit delays, and (2) the grain texture for the hero background, which is a pure CSS technique using an SVG data URI or a pseudo-element with a noise filter.

**Primary recommendation:** Split page.tsx into 7 components, update visuals + copy, implement chat animation with Framer Motion stagger delays, add CSS grain texture via SVG noise filter on a pseudo-element, and wire scroll-detection for the nav using a window scroll listener (same pattern as existing Navigation.tsx -- no need to reach for Framer Motion's useScroll for this simple boolean toggle).

---

## Standard Stack

### Core (all already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | 12.34.3 | Chat message animation, ScrollReveal, nav transition | Already the project animation library; useEffect + motion variants handle sequential chat reveal |
| tailwindcss | 4.x | Utility classes for layout, spacing, color tokens | Project-wide -- all tokens in globals.css @theme |
| class-variance-authority | 0.7.1 | buttonVariants already uses it; not needed for new landing components | Already wired in Button.tsx |
| lucide-react | 0.575.0 | Icons (Heart, ArrowRight, MessageCircle, etc.) | Already used throughout page.tsx |

### Supporting (no installs needed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ScrollReveal | project component | Scroll-triggered fade+slide on all sections | Wrap each major section |
| StaggerContainer | project component | Staggered child reveals for features grid | Wrap features grid children |
| Button | project component | All CTAs -- primary and secondary variants | Every call-to-action link/button |
| Card | project component | Feature cards with icon, title, description | Features section cards |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS grain texture via SVG data URI | External PNG texture file | SVG data URI requires no asset file, is inline, scales to any size -- preferred |
| window scroll listener for nav | Framer Motion useScroll | useScroll adds complexity; boolean isScrolled state via window.scrollY > 50 is simpler and sufficient (existing Navigation.tsx uses this pattern) |
| Framer Motion stagger with parent variants | useEffect + setTimeout chain | Variants approach is cleaner and respects MotionConfig reducedMotion; preferred |

**Installation:**
```bash
# No new installs needed. All dependencies already in package.json.
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── landing/                  # NEW -- Phase 4 creates this directory
│   │   ├── LandingNav.tsx        # Scroll-aware nav (transparent -> solid)
│   │   ├── Hero.tsx              # 100vh hero with animated chat mockup + grain texture
│   │   ├── Features.tsx          # 3 updated feature cards
│   │   ├── SocialProof.tsx       # Stats/testimonial block
│   │   ├── HowItWorks.tsx        # 3-step visual flow
│   │   ├── FinalCTA.tsx          # Full-width CTA with accent bg
│   │   └── LandingFooter.tsx     # Brand footer for landing (not wedding web footer)
│   ├── animation/                # Phase 3 complete -- ScrollReveal, StaggerContainer exist
│   └── ui/                       # Phase 2 complete -- Button, Card exist
├── app/
│   └── (public)/
│       └── page.tsx              # Simplified: imports 7 landing components, renders in order
```

### Pattern 1: Sequential Chat Message Animation

**What:** Hero chat mockup shows messages appearing one by one, as if a real conversation is happening. Each message fades in with a slight slide from below, with delays staggered per message.

**When to use:** Hero chat mockup in Hero.tsx only.

**Approach:** Use Framer Motion `variants` with explicit `delay` per message item. This is simpler than `staggerChildren` for a fixed list of 4-5 messages because individual delays can be tuned per message length (longer messages get slightly longer pre-delay to simulate typing time).

```typescript
// Hero.tsx -- animated chat messages
'use client';

import { motion } from 'framer-motion';

const chatMessages = [
  { id: 1, from: 'user', text: 'Kolik stojí svatební fotograf v Praze?', delay: 0.3 },
  { id: 2, from: 'ai', text: 'Ceny se pohybují mezi 15-40 tisíci Kč...', delay: 1.0 },
  { id: 3, from: 'user', text: 'A co videograf?', delay: 2.0 },
  { id: 4, from: 'ai', text: 'Videograf vyjde na 20-50 tisíc Kč...', delay: 2.8 },
];

const messageVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// In JSX:
{chatMessages.map((msg) => (
  <motion.div
    key={msg.id}
    variants={messageVariant}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.4, ease: 'easeOut', delay: msg.delay }}
  >
    {/* message bubble */}
  </motion.div>
))}
```

**Reduced motion behavior:** `MotionConfig reducedMotion="user"` at root suppresses y transform. Opacity fade still runs (non-vestibular). Messages appear sequentially but without movement.

### Pattern 2: CSS Grain Texture for Hero Background

**What:** Subtle paper/linen noise texture overlaid on the hero section background. Replaces the current decorative blob divs.

**Approach:** SVG feTurbulence filter as a CSS `background-image` data URI, applied via a pseudo-element (`::before`) or a dedicated `<div>` overlay with `pointer-events: none` so it doesn't block clicks.

```css
/* Option A: Tailwind arbitrary CSS via @layer or direct style attribute */
/* The grain overlay sits on top of the warm background color */
.hero-grain::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  pointer-events: none;
}
```

**Tailwind 4 approach (preferred -- no extra CSS file):** Add a `style` prop to a positioned div inside the hero:

```tsx
// Hero.tsx -- grain overlay div
<div
  aria-hidden="true"
  className="absolute inset-0 pointer-events-none"
  style={{
    opacity: 0.04,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
  }}
/>
```

**Opacity tuning:** 0.03-0.05 is the right range for "subtle" on a warm off-white background. Lower than 0.03 is invisible; higher than 0.06 becomes distracting on mobile.

### Pattern 3: Scroll-Aware Navigation

**What:** Nav starts transparent over the hero, transitions to white + backdrop-blur + shadow once user scrolls past the fold. Only auth links (logo, "Přihlásit se", "Začít zdarma" Button).

**Approach:** Same window scroll listener pattern as existing `Navigation.tsx` (public wedding web). Boolean `isScrolled` state. CSS `transition-all duration-300` for smooth visual change.

```typescript
// LandingNav.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[var(--color-border)]'
          : 'bg-transparent'
      )}
    >
      {/* ... */}
    </nav>
  );
}
```

**Note:** `{ passive: true }` on scroll listener is a performance best practice -- prevents scroll jank on mobile.

**Mobile nav (Claude's Discretion):** Recommendation is a minimal hamburger with a slide-down panel (same pattern as existing Navigation.tsx). Keep it simple -- no full-screen overlay, no complex animation. The nav has only 2 links so the mobile treatment can be minimal: a single hamburger that reveals both links inline below the bar. Animated with Framer Motion `AnimatePresence` + `motion.div` slide-down variant.

### Pattern 4: Component Split from page.tsx

**What:** Disassemble the 363-line monolith into 7 dedicated components. page.tsx becomes a clean composition file.

```typescript
// src/app/(public)/page.tsx -- after split
import { LandingNav } from '@/components/landing/LandingNav';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { SocialProof } from '@/components/landing/SocialProof';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <LandingNav />
      <Hero />
      <Features />
      <SocialProof />
      <HowItWorks />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
```

All 7 components are `'use client'` (they use Framer Motion or scroll state). The page.tsx itself can remain a Server Component since it only imports and renders.

### Pattern 5: Button and Card Component Usage

**Button:** All CTAs use `<Button>` with `asChild`-style wrapping via a Link wrapper. Since `Button` is a `motion.button` with `forwardRef`, it cannot render as `<a>`. The correct pattern is to wrap `<Link>` with the Button's visual classes applied directly, OR use a thin Link wrapper. Current page.tsx already does inline Links with hard-coded classes -- replace these with proper Button component.

**Important:** Button is `motion.button`, not `motion.a`. For navigation links that should be `<a>` elements, two options:
1. Use Link as the outer element with `className={buttonVariants({ variant: 'primary', size: 'lg' })}` directly -- this is the pattern the codebase already uses for Link-rendered CTAs.
2. The Button component does NOT support `asChild` (noted in STATE.md: "Link elements use direct Tailwind classes (no Button asChild) -- asChild not implemented in Phase 2"). Stick with option 1.

```typescript
// CTA link pattern (not using Button component, using buttonVariants directly):
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/Button'; // if exported
// OR just apply classes manually for now -- matches existing pattern

// Feature card pattern (using Card component):
import { Card } from '@/components/ui/Card';

<Card className="p-8 lg:p-10">
  <div className="w-14 h-14 rounded-2xl ...">
    <Icon className="w-7 h-7 text-white" />
  </div>
  <h3 className="text-xl font-semibold mt-6 mb-3">{feature.title}</h3>
  <p className="text-[var(--color-text-light)]">{feature.description}</p>
</Card>
```

**Note on buttonVariants export:** Check if `buttonVariants` is exported from Button.tsx. Currently it is NOT exported (only `Button` and `ButtonProps` are exported). Options: export `buttonVariants` from Button.tsx, or apply the needed classes inline on Link elements. Exporting `buttonVariants` is the cleaner approach and should be done in the same plan.

### Anti-Patterns to Avoid

- **Putting scroll state in page.tsx:** page.tsx should be a Server Component (import-only). Scroll state belongs in LandingNav.tsx.
- **Using `animate` instead of `whileInView` for scroll reveals:** `animate` fires immediately on mount, not on scroll. For below-the-fold sections, use `ScrollReveal` (whileInView) consistently.
- **Using inline motion for chat messages with `whileInView`:** Chat mockup is in the hero -- it's visible on initial load, not scroll-triggered. Use `animate` with explicit `delay` values, NOT `whileInView`.
- **Grain texture with a large PNG:** PNG texture files require an HTTP request and add to bundle size. SVG data URI is inline, no request, scales infinitely.
- **Animating layout with chat messages:** `AnimatePresence` with exit animations on chat messages adds complexity with no UX value. Messages only appear, never disappear. Use simple enter-only variants.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Grain texture | Custom canvas noise | SVG feTurbulence data URI | CSS-only, no request, scales perfectly, no JS |
| Scroll detection for nav | IntersectionObserver on hero | `window.scrollY > N` listener | Boolean state is sufficient; IntersectionObserver has thresholds that feel unpredictable |
| Chat animation | Custom timer class | Framer Motion `animate` + `delay` per item | Automatic reduced-motion support; no cleanup edge cases |
| Section entrance animations | Custom Intersection Observer | `ScrollReveal` component (already built in Phase 3) | It's already built |
| Feature cards | Custom div | `Card` component (already built in Phase 2) | It's already built |
| CTA buttons | Inline Link with hardcoded classes | Link + `buttonVariants()` OR export buttonVariants | Consistent styling with global button token updates |

**Key insight:** Phases 1-3 front-loaded the primitives. Phase 4 is assembly, not invention. The research question is "how do I use what exists", not "what do I build".

---

## Common Pitfalls

### Pitfall 1: Chat Animation Fires on Scroll Instead of Mount

**What goes wrong:** Developer wraps chat mockup in `ScrollReveal` (whileInView). On load the hero is already visible, so it fires immediately -- but on mobile where the hero might be partially off-screen, behavior is inconsistent.

**Why it happens:** Mixing scroll-reveal (for below-fold content) with mount animation (for above-fold content).

**How to avoid:** Hero chat messages use `initial="hidden" animate="visible"` with per-message `delay` values. NOT `whileInView`. The hero section itself uses `ScrollReveal` only if CONTEXT.md calls for an entrance fade -- the existing page.tsx wraps the hero in `ScrollReveal`, which fires on page load since it's at the top. This is fine for a subtle entrance fade.

**Warning signs:** Chat messages not appearing on mobile, or appearing all at once.

### Pitfall 2: Nav z-index Conflict with AnimatePresence

**What goes wrong:** LandingNav at `z-50` renders behind page transition overlay from `template.tsx`.

**Why it happens:** The `motion.div` in `template.tsx` wraps all page content including the nav if nav is inside the page component. If LandingNav is inside `(public)/page.tsx`, it gets wrapped by the template transition and fades with the page.

**How to avoid:** This is actually fine behavior -- the nav fades out on navigation, which matches the crossfade transition. No action needed. If the nav should persist across page transitions (e.g., the nav stays visible while page content transitions), it would need to live in `layout.tsx` not `page.tsx`. For this phase, LandingNav inside page.tsx is correct since it only exists on the landing page.

**Warning signs:** Nav flickers or partially visible during page transitions.

### Pitfall 3: Button Component Cannot Render as `<a>`

**What goes wrong:** Developer tries to use `<Button href="/register">` or `asChild` pattern. Button is a `motion.button` -- it cannot change tag.

**Why it happens:** Button.tsx uses `motion.button` which renders HTML `<button>`. No asChild support (confirmed in STATE.md).

**How to avoid:** For CTA links, use `Link` from `next/link` with button classes applied manually. Export `buttonVariants` from `Button.tsx` so classes are imported from the single source of truth rather than duplicated.

**Warning signs:** TypeScript error "Property 'href' does not exist on type ButtonProps".

### Pitfall 4: Grain Texture Too Heavy on Mobile

**What goes wrong:** High-frequency noise (baseFrequency > 0.9) at high opacity looks good on desktop Retina but renders as visible static on mobile OLED screens.

**Why it happens:** Mobile browsers render SVG filters at physical pixel resolution. High DPI screens amplify noise.

**How to avoid:** Keep opacity at 0.03-0.04. Use `baseFrequency='0.65'` for slightly coarser grain that reads as paper texture. Test on iOS Safari (noted in STATE.md as required for Phase 4 QA).

**Warning signs:** Grain texture looks like TV static rather than paper.

### Pitfall 5: Hero Height 100vh on iOS Safari

**What goes wrong:** `h-screen` (100vh) cuts off content at the bottom on iOS Safari due to the dynamic browser chrome (URL bar shows/hides).

**Why it happens:** iOS Safari's 100vh does not account for the collapsible URL bar. Content is clipped.

**How to avoid:** Use `min-h-screen` instead of `h-screen` for the hero. This lets the hero be AT LEAST 100vh but expand if needed. Alternatively use the CSS `dvh` unit: `min-h-[100dvh]` (dynamic viewport height). The `dvh` unit is supported in iOS Safari 16+ and automatically adjusts to the visible viewport. CONTEXT.md specifies "full viewport height (100vh)" but `min-h-[100dvh]` is the modern equivalent that avoids the iOS clipping bug.

**Warning signs:** Hero CTA button clipped below the fold on iPhone, invisible unless user scrolls.

---

## Code Examples

Verified patterns from codebase inspection:

### Existing Token Usage (globals.css)

```css
/* Available tokens -- use these, not hardcoded hex */
--color-primary: oklch(55% 0.045 55);       /* warm brown/taupe */
--color-primary-light: oklch(64% 0.040 57);
--color-primary-dark: oklch(45% 0.038 55);
--color-secondary: oklch(98.1% 0.012 80);   /* warm off-white -- hero bg */
--color-accent-rose: oklch(76.5% 0.056 18); /* blush pink */
--color-accent-sage: oklch(75.7% 0.033 134);/* sage green */
--color-text: oklch(21.8% 0.000 0);         /* near-black */
--color-text-light: oklch(47.5% 0.000 0);   /* medium gray */
--color-border: oklch(90.8% 0.012 80);      /* warm light border */
```

### ScrollReveal Usage (Phase 3 pattern)

```typescript
// Section-level reveal (below fold):
import { ScrollReveal } from '@/components/animation/ScrollReveal';

<ScrollReveal>
  <div className="text-center mb-16">
    <h2>...</h2>
  </div>
</ScrollReveal>

// Features grid with stagger:
import { StaggerContainer } from '@/components/animation/StaggerContainer';

<StaggerContainer className="grid md:grid-cols-3 gap-6">
  {features.map(f => (
    <ScrollReveal key={f.title}>
      <Card>...</Card>
    </ScrollReveal>
  ))}
</StaggerContainer>
```

### buttonVariants Export (needs adding to Button.tsx)

```typescript
// Add export to Button.tsx -- currently only Button and ButtonProps are exported:
export { buttonVariants };

// Usage in LandingNav and Hero CTAs:
import { buttonVariants } from '@/components/ui/Button';
import Link from 'next/link';

<Link href="/register" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
  Začít zdarma
</Link>
```

### Mobile Nav with AnimatePresence

```typescript
// LandingNav.tsx -- mobile menu toggle
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const [isMenuOpen, setIsMenuOpen] = useState(false);

// Hamburger button:
<button
  onClick={() => setIsMenuOpen(!isMenuOpen)}
  className="sm:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
  aria-label={isMenuOpen ? 'Zavřít menu' : 'Otevřít menu'}
  aria-expanded={isMenuOpen}
>
  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
</button>

// Mobile menu panel:
<AnimatePresence>
  {isMenuOpen && (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="sm:hidden bg-white border-t border-[var(--color-border)] py-4"
    >
      <Link href="/login" onClick={() => setIsMenuOpen(false)} ...>Přihlásit se</Link>
      <Link href="/register" onClick={() => setIsMenuOpen(false)} ...>Začít zdarma</Link>
    </motion.div>
  )}
</AnimatePresence>
```

### CTA Layout Recommendation (Claude's Discretion resolved)

**Decision:** Dual CTA with inline social proof nudge. Primary: "Vyzkoušet zdarma" (primary Button variant, lg size). Secondary: "Přihlásit se" (secondary/ghost variant). Below CTAs: small inline social proof line: "Přidalo se 500+ párů · Zdarma · Bez karty". This pattern is used by reflow.ai and jace.ai (reference sites from CONTEXT.md).

### Social Proof Recommendation (Claude's Discretion resolved)

**Decision:** Keep the existing 3 stats (500+ párů, 40h ušetřeného času, 4.9 hvězdiček) but present them as a warm strip section on `--color-secondary` background (warm off-white) rather than the current dark primary-colored banner. This is warmer and fits the "wedding magazine" aesthetic better. Optionally add 1-2 short testimonial pull-quotes in the same section.

### How-it-Works Recommendation (Claude's Discretion resolved)

**Decision:** Keep the existing 3-step list visual (register, setup, AI generates plan). Upgrade: animate each step card in sequence with `StaggerContainer`. The center illustration panel stays on `--color-secondary` background with rounded corners. Consider adding a subtle arrow or connector line between steps.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| CSS `@keyframes` for scroll animations | Framer Motion `whileInView` | Already migrated in Phase 3; use ScrollReveal |
| Hardcoded hex colors in components | CSS variable tokens from globals.css @theme | Tokens defined in Phase 1; use `var(--color-*)` |
| Plain `<button>` with Tailwind | `<Button>` component (cva + motion) | Phase 2 complete; use Button consistently |
| Plain `<div>` for cards | `<Card>` component | Phase 2 complete; use Card for feature cards |
| Inline blob divs for hero bg | CSS grain texture via SVG data URI | Phase 4 change -- warmer, more refined |

---

## Open Questions

1. **buttonVariants export**
   - What we know: `buttonVariants` is currently not exported from Button.tsx. CTAs in page.tsx use inline Tailwind classes that duplicate the button styling.
   - What's unclear: Whether to add the export in Phase 4 or accept inline class duplication temporarily.
   - Recommendation: Export `buttonVariants` as part of Phase 4 (Plan 04-01 or whichever plan covers LandingNav first). It's a one-line change and keeps styling DRY.

2. **Hero layout: centered vs split**
   - What we know: CONTEXT.md says "full viewport height (100vh) with centered content" but current page.tsx uses a 2-column split grid.
   - What's unclear: "Centered content" might mean centered vertically within 100vh (not single-column centered). Reference sites (reflow.ai, jace.ai) use centered single-column heroes.
   - Recommendation: Interpret as vertically centered within 100vh with a split layout still possible. If going single-column centered, the chat mockup becomes a below-headline element (like jace.ai product demo). Planner should choose -- both are valid. Single-column centered with chat mockup below headline is more "modern wedding magazine"; split is more "product SaaS". Given the reference sites, single-column centered is recommended.

3. **iOS Safari real-device testing**
   - What we know: STATE.md notes "iOS Safari real-device access: required before Phase 4 ships".
   - What's unclear: Whether access exists now.
   - Recommendation: Flag this as a QA gate in the verification plan. The grain texture and 100dvh fix are the two iOS-specific risks.

---

## Validation Architecture

> `nyquist_validation` not present in config.json -- section skipped.

---

## Sources

### Primary (HIGH confidence)

- `/Users/eb-vm/Documents/claw/wedding-web/svoji/src/app/(public)/page.tsx` -- current landing page source, 363 lines
- `/Users/eb-vm/Documents/claw/wedding-web/svoji/src/components/ui/Button.tsx` -- Button API, missing buttonVariants export confirmed
- `/Users/eb-vm/Documents/claw/wedding-web/svoji/src/components/ui/Card.tsx` -- Card API with dot notation subcomponents
- `/Users/eb-vm/Documents/claw/wedding-web/svoji/src/components/animation/ScrollReveal.tsx` -- whileInView component API
- `/Users/eb-vm/Documents/claw/wedding-web/svoji/src/components/animation/StaggerContainer.tsx` -- stagger component API
- `/Users/eb-vm/Documents/claw/wedding-web/svoji/src/components/ui/Navigation.tsx` -- scroll listener pattern for nav
- `/Users/eb-vm/Documents/claw/wedding-web/svoji/src/app/globals.css` -- @theme token definitions
- `/Users/eb-vm/Documents/claw/wedding-web/svoji/package.json` -- confirmed installed versions
- `.planning/STATE.md` -- Button asChild not implemented; iOS Safari QA requirement

### Secondary (MEDIUM confidence)

- SVG feTurbulence grain technique: standard CSS pattern, widely documented, no external source needed -- HIGH confidence for the technique itself
- `dvh` unit for iOS Safari viewport: documented in MDN and webkit release notes -- MEDIUM (confirmed in webkit blog but not re-verified live)

### Tertiary (LOW confidence)

- None -- all findings are from codebase inspection (HIGH) or well-established CSS techniques

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries confirmed installed via package.json; all component APIs read from source
- Architecture: HIGH -- patterns derived from reading actual source files, not documentation guesses
- Pitfalls: HIGH for Button/asChild and iOS Safari (confirmed from STATE.md); MEDIUM for grain texture opacity tuning (empirical, may need iteration)

**Research date:** 2026-02-28
**Valid until:** 2026-04-30 (stack is stable; no upcoming breaking changes expected in Framer Motion 12.x or Next.js 16.x)
