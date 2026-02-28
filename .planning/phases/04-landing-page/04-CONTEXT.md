# Phase 4: Landing Page - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign all landing page sections with new design tokens, UI primitives, and scroll animations. The landing page is a polished showcase of the new design direction that converts visitors to sign-ups. No new features or capabilities -- only visual upgrade of existing sections.

</domain>

<decisions>
## Implementation Decisions

### Hero section
- Full viewport height (100vh) with centered content
- Chat mockup stays but with **animated conversation** -- messages appear progressively (typewriter or sequential reveal via Framer Motion)
- Background treatment: subtle paper/linen **grain texture** instead of gradient blobs
- Floating stats card stays as secondary visual element

### Hero CTA & headline
- Claude's Discretion: choose optimal CTA layout for wedding SaaS conversion (single vs dual CTA, with or without inline social proof)

### Section structure
- Keep all 4 existing sections: Features, Social Proof, How-it-Works, Final CTA
- No sections added or removed

### Features cards
- **3 features updated**: AI Asistent, Interaktivní management plánování, Web pro hosty
- Each feature gets a Card component with icon, title, description
- Replace old feature definitions (AI Asistent, Chytrý checklist, Rozpočet a hosté)

### Copy & tone
- Czech language, přátelský a přímý tón, tykání
- No change from current approach -- keep it informal and direct

### Social proof
- Claude's Discretion: choose the most effective social proof metrics and presentation

### Navigation
- Transparent over hero → solid white with backdrop-blur + shadow on scroll
- Only auth links: logo + "Přihlásit se" + "Začít zdarma" CTA button
- No section anchor links
- Claude's Discretion: mobile nav treatment (hamburger vs minimal)

### Component architecture
- **Split page.tsx into separate components** in `src/components/landing/` -- Hero.tsx, Features.tsx, SocialProof.tsx, HowItWorks.tsx, FinalCTA.tsx, LandingNav.tsx, LandingFooter.tsx
- All CTA buttons use `<Button>` component from `@/components/ui/Button`
- Feature cards use `<Card>` component from `@/components/ui/Card`
- Keep using `ScrollReveal` and `StaggerContainer` from animation layer

### Visual direction
- Teplý minimal: lots of whitespace, warm colors (champagne, blush, stone), rounded corners, soft shadows
- Modern wedding magazine aesthetic
- Serif headings (Cormorant Garamond) + Inter body copy

### Claude's Discretion
- Exact CTA layout (single vs dual, social proof placement)
- Social proof metrics and visual treatment
- Mobile nav approach
- Exact spacing scale between sections
- How-it-works visual treatment refinement
- Footer content and layout
- Grain texture implementation approach

</decisions>

<specifics>
## Specific Ideas

- Chat mockup animation: messages should appear progressively as if a real conversation is happening -- not all visible at once
- Reference sites for feel: **reflow.ai** and **jace.ai** -- both share warm neutral palette, serif+sans-serif typography, generous whitespace, 100vh hero, subtle motion
- reflow.ai specifically uses Season Serif + Inter with earthy tones and refined micro-details -- very close to our existing token system
- jace.ai uses clear value proposition headline with product demo visual and progressive feature disclosure

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` component (`src/components/ui/Button.tsx`): cva-based with primary/secondary/ghost/danger variants, motion hover/tap built in
- `Card` component (`src/components/ui/Card.tsx`): with Header/Body/Footer subcomponents, interactive variant with hover shadow
- `ScrollReveal` (`src/components/animation/ScrollReveal.tsx`): Framer Motion scroll-triggered entrance
- `StaggerContainer` (`src/components/animation/StaggerContainer.tsx`): staggered child reveals
- `cn()` utility (`src/lib/cn.ts`): clsx + tailwind-merge helper

### Established Patterns
- CSS variables: `var(--color-primary)`, `var(--color-secondary)`, `var(--color-text-light)` etc.
- Tailwind 4 @theme tokens for spacing, colors, typography
- Framer Motion for all animations with useReducedMotion support
- Lenis smooth scroll active site-wide

### Integration Points
- Landing page lives at `src/app/(public)/page.tsx` (public route group)
- New components go in `src/components/landing/` (new directory)
- Navigation.tsx in `src/components/ui/` is for public wedding web, NOT landing -- landing needs its own LandingNav
- Footer.tsx in `src/components/ui/` is for public wedding web -- landing needs its own LandingFooter

</code_context>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 04-landing-page*
*Context gathered: 2026-02-28*
