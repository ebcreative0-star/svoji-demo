# Feature Research

**Domain:** Premium SaaS Design Overhaul — Wedding Planning App (Czech market)
**Researched:** 2026-02-28
**Confidence:** MEDIUM-HIGH

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in any 2026 premium SaaS. Missing these makes the product feel unfinished or dated.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Semantic color token system | All modern design systems use primitive + semantic tokens; enables theming consistency across 30+ components | LOW | Tailwind 4 CSS variables make this native; define `--color-surface`, `--color-text-primary`, `--color-accent` etc. as CSS custom props |
| Consistent spacing scale | Arbitrary spacing creates visual noise; users feel inconsistency even if they can't name it | LOW | Tailwind 4's `@theme` block; 4pt base grid (4/8/12/16/24/32/48/64/96) |
| Typography scale with clear hierarchy | H1-H6 + body + caption must feel intentional; mismatched sizes signal prototype quality | LOW | Define 5-6 steps max; replace Playfair with DM Serif Display or Cormorant Garamond |
| Hover states on all interactive elements | Clickable things must respond; flat static buttons feel broken in 2026 | LOW | Consistent 150ms ease-out transitions on bg, border, shadow; existing Tailwind `hover:` utilities |
| Focus states (accessibility) | Required for keyboard nav; also signals quality to developers and technical buyers | LOW | Custom focus rings using brand accent color, not default browser blue |
| Loading states / skeleton screens | Users expect visual feedback during async operations (checklist load, budget fetch, guest list) | MEDIUM | Framer Motion `animate` with shimmer effect; apply to dashboard views that fetch from Supabase |
| Empty states with CTAs | Every list view (guests, checklist, budget) starts empty; blank screens kill activation | MEDIUM | Illustration or icon + headline + action button; unique per section, not generic |
| Error states | Network failures, Supabase errors, form validation; silent failures destroy trust | LOW | Inline error messages (forms), toast notifications (async ops), full-page fallback for auth errors |
| Mobile-responsive layouts | 60%+ of Czech users check wedding apps on mobile; dashboard must not be desktop-only | MEDIUM | Mobile-first breakpoints: 375px base, 768px tablet, 1024px desktop; dashboard navigation collapses to bottom nav or hamburger |
| Consistent button hierarchy | Primary / secondary / ghost / destructive variants used consistently across all flows | LOW | Define 4 button variants in a single component; existing shadcn/ui base likely usable |
| Form validation feedback | Inline real-time validation on auth, onboarding, RSVP forms | LOW | Already functional; redesign the visual treatment (red border, icon, message below field) |

### Differentiators (Competitive Advantage)

Features that elevate Svoji above WeMarry.io and Brzy-svoji.cz aesthetically and experientially.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Warm premium color system | Czech competitors use generic SaaS blue or outdated rustic brown; warm cream + terracotta + deep charcoal reads as editorial and premium | MEDIUM | Palette: `--cream: #FBF8F4`, `--sand: #EDE5D8`, `--terracotta: #C8644A`, `--charcoal: #2A2622`, `--sage: #8A9E8C`; replaces existing mocha scheme entirely |
| Modern typography pairing | Playfair Display is used by every Czech wedding site; DM Serif Display (headings) + Inter (body) signals 2026, not 2018 | LOW | DM Serif Display: editorial, slightly quirky serifs that read as premium not rustic; Inter stays for body (already installed); load via next/font |
| Scroll-triggered entrance animations | Static pages feel flat in 2026; tasteful reveals create a sense of craft and attention to detail | MEDIUM | Framer Motion `whileInView` with `once: true`; staggered children on feature grids and checklist items; fade + slight upward translate (y: 20 → 0); 0.4s duration |
| Landing page hero animation | Hero is first impression; static hero in 2026 = dated | MEDIUM | Text stagger on load (headline words animate in sequence), subtle background gradient shift; NOT parallax (performance risk on mobile) |
| Micro-interactions on key actions | Completing a checklist task, adding a guest, saving budget entry — each should feel satisfying | MEDIUM | Framer Motion `AnimatePresence` for list item add/remove; checkmark completion animation (scale + color pulse); Supabase mutation triggers animation, not optimistic |
| Page transitions (route changes) | Dashboard navigation between checklist/budget/guests/chat feels choppy without transitions | MEDIUM | Framer Motion `AnimatePresence` + `template.js` pattern for Next.js App Router; simple opacity fade (0.2s) is enough; avoid complex slides that delay UX |
| Public wedding web premium feel | Guests judge the couple's taste by this page; it must feel like a bespoke wedding invitation, not a form | HIGH | Full-bleed photo header, elegant serif display font, smooth scroll sections, RSVP form with proper animation; the most brand-visible surface |
| Glassmorphism / surface layering | Cards that feel elevated vs flat; creates depth without shadows | LOW | `backdrop-blur` + semi-transparent white over cream background; subtle, not the heavy 2021 style; use on dashboard cards, modals |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Dark mode | Users expect it from modern apps; some devs want to show off the work | Wedding domain is fundamentally a warm, light, image-forward aesthetic; dark mode on terracotta/cream palette is hard to execute without the palette feeling wrong; adds ~40% design/dev overhead to a milestone already scoped as full overhaul | Defer to v2; if needed, implement system preference detection only, not a toggle; the light mode must be perfect first |
| Heavy parallax scrolling | Looks impressive in demos; differentiates from static sites | Performance disaster on mobile Safari; causes layout jank, increases CLS score, breaks accessibility for motion-sensitive users | Use `whileInView` scroll-triggered entrance animations instead — same "alive" feeling without the performance cost |
| Complex page transition choreography (slide in/out, etc.) | Looks polished in design portfolios | Adds perceived latency; users want the next page NOW, not to watch the current page slide away; App Router makes complex exit animations technically painful | Simple opacity fade (0.15-0.2s) only; exit and enter overlap briefly; nearly imperceptible but removes the jarring hard cut |
| Custom cursor or cursor effects | Popular on agency/portfolio sites; signals creative ambition | Actively confuses and frustrates SaaS users; cursor is a productivity tool in a planning app | Skip entirely |
| Animated backgrounds (gradients, particles, blobs) | Trendy; seen on AI SaaS sites | Performance impact on mobile; visually distracting during actual planning tasks; ages quickly | Static gradient backgrounds, or very slow (8-12s) CSS gradient transitions on hero only |
| Full-page loaders between routes | "Looks premium" | Adds friction; users feel blocked; not needed with Next.js App Router's streaming | Use skeleton screens per-section; Suspense boundaries with inline skeletons |
| Extensive onboarding animations | App feels "alive" | 3-step onboarding is already simple; heavy animation adds perceived length and delays task completion | Single entrance animation per step (slide in from right); progress bar; that's it |

---

## Feature Dependencies

```
Semantic color token system
    └──required by──> All component redesigns (buttons, cards, forms, nav)
                          └──required by──> Dashboard redesign
                          └──required by──> Landing page redesign
                          └──required by──> Public wedding web refresh

Typography scale
    └──required by──> Landing page redesign
    └──required by──> Auth pages redesign
    └──required by──> Dashboard redesign

Loading states / skeleton screens
    └──required by──> Dashboard redesign (checklist, budget, guests all load async)

Empty states
    └──required by──> Dashboard redesign (all list views)

Error states
    └──required by──> Auth pages redesign
    └──required by──> Dashboard redesign

Mobile-responsive layouts
    └──required by──> Dashboard redesign
    └──required by──> Public wedding web refresh

Scroll-triggered animations
    └──depends on──> Landing page layout structure (must know section order before animating)

Page transitions
    └──depends on──> Next.js App Router layout structure (template.js placement)

Micro-interactions (checklist, guests)
    └──depends on──> Dashboard redesign (components must exist first)
```

### Dependency Notes

- **Color token system required first:** Every other design decision references these tokens. Define the palette before touching any component, or you'll refactor twice.
- **Typography before layout:** Font metrics (line-height, letter-spacing) affect layout spacing. Lock the type scale before finalizing component padding.
- **Mobile layout is a constraint, not a phase:** Responsive behavior must be designed alongside desktop, not added after. The dashboard navigation pattern (bottom nav vs sidebar) determines component structure for all dashboard views.
- **Animations depend on stable component structure:** Adding `whileInView` to a component that will be structurally refactored means the animation work is thrown away. Animate after component markup is locked.
- **Public wedding web is independent:** No shared components with the dashboard; can be redesigned in parallel with auth pages.

---

## MVP Definition

This is a redesign milestone on an existing functional product, so MVP = "minimum to look premium across all surfaces."

### Launch With (v1.0)

- [ ] Semantic color token system (CSS custom properties, warm premium palette) — foundation for everything else
- [ ] Typography pairing: DM Serif Display for headings, Inter for body — replaces Playfair Display throughout
- [ ] Landing page redesign: hero, features section, pricing, footer — highest marketing visibility
- [ ] Auth pages redesign: login, register, onboarding steps — first impression post-landing
- [ ] Dashboard redesign: nav, checklist, budget, guests, chat views — daily use surface
- [ ] Loading states: skeleton screens for all async data sections — prevents broken-feeling UI
- [ ] Empty states: checklist, guests, budget sections — critical for new user activation
- [ ] Error states: form validation, async error toasts — quality signal
- [ ] Scroll-triggered entrance animations on landing page — differentiates from competitors
- [ ] Micro-interactions: checklist task completion, button hover states — Polish layer
- [ ] Public wedding web visual refresh — guest-facing brand surface
- [ ] Mobile responsive: all views work on 375px + 768px + 1024px

### Add After Validation (v1.x)

- [ ] Page transitions (route changes) — trigger: if user research shows perceived navigation sluggishness
- [ ] Richer empty state illustrations — trigger: when illustration assets are available
- [ ] Animation refinement pass — trigger: after real-device performance testing

### Future Consideration (v2+)

- [ ] Dark mode — defer until light mode is perfected and demand is confirmed
- [ ] Advanced hover animations on public wedding web gallery — defer until gallery feature exists
- [ ] Custom email templates matching new visual system — separate milestone

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Semantic color token system | HIGH | LOW | P1 |
| Typography pairing | HIGH | LOW | P1 |
| Landing page redesign | HIGH | MEDIUM | P1 |
| Dashboard redesign | HIGH | HIGH | P1 |
| Empty states | HIGH | MEDIUM | P1 |
| Loading states (skeletons) | HIGH | MEDIUM | P1 |
| Error states | MEDIUM | LOW | P1 |
| Auth pages redesign | MEDIUM | MEDIUM | P1 |
| Public wedding web refresh | HIGH | MEDIUM | P1 |
| Scroll-triggered animations (landing) | MEDIUM | MEDIUM | P2 |
| Micro-interactions (checklist, forms) | MEDIUM | MEDIUM | P2 |
| Mobile responsive polish | HIGH | MEDIUM | P1 |
| Page transitions | LOW | MEDIUM | P3 |
| Dark mode | LOW | HIGH | P3 |

**Priority key:**
- P1: Required for this milestone to feel "done"
- P2: Should include, meaningful quality lift
- P3: Nice to have, defer or cut under time pressure

---

## Competitor Feature Analysis

| Design Feature | WeMarry.io | Brzy-svoji.cz | Svoji Target |
|----------------|------------|---------------|--------------|
| Color palette | Generic SaaS blue/purple | Muted pink/beige rustic | Warm premium: cream + terracotta + charcoal |
| Heading font | Standard sans | Playfair Display variant | DM Serif Display (fresh, not overused) |
| Animations | Minimal/none | None | Scroll reveals + micro-interactions via Framer Motion |
| Dashboard UI | Functional, generic | Basic | Refined card-based, glassmorphism accents |
| Empty states | Generic text | Generic text | Contextual CTAs with illustration |
| Public guest web | Basic form page | Not noted | Editorial-quality invitation feel |
| Mobile experience | Adequate | Basic | Optimized bottom nav, touch-friendly |
| Loading feedback | Spinner | Spinner | Skeleton screens |

---

## Warm Premium Aesthetic: What It Means in Practice

This is a design direction decision, not just a color picker choice.

**Color language:**
- Background: `#FBF8F4` (warm off-white, not pure white — pure white reads clinical)
- Surface (cards): `#F5EFE6` (warm sand, gives cards gentle lift without harsh shadow)
- Primary text: `#2A2622` (dark warm brown, not black — avoids harsh contrast)
- Accent / CTA: `#C8644A` (terracotta — warm, confident, not pink/rose which reads bridal-generic)
- Secondary accent: `#8A9E8C` (sage — used sparingly; counterpoints terracotta)
- Border/divider: `#E8DDD0` (warm light gray)

**Typography language:**
- Display headings: DM Serif Display — editorial, slightly quirky serifs signal craft without nostalgia
- Subheadings: DM Serif Display italic variant or Inter Semibold
- Body: Inter Regular 16px/1.6 line-height
- Captions / labels: Inter 12px, 0.05em letter-spacing, warm gray `#8B7F76`

**Spacing language:**
- Generous whitespace signals premium; tight spacing signals budget/generic
- Section padding on landing: 96-128px vertical
- Card padding: 24-32px
- Form field gaps: 20px (not 12-16px which reads cramped)

**Texture language:**
- Avoid gradients that feel "tech startup"; prefer solid warm neutrals
- Subtle grain texture on hero background (CSS SVG filter or background-image) adds tactility
- `backdrop-blur` glassmorphism only on overlaid modals and sticky nav; not on every card

---

## Sources

- [SaaS Design Trends 2026 — Jetbase](https://jetbase.io/blog/saas-design-trends-best-practices)
- [12 UI/UX Design Trends 2026 — index.dev](https://www.index.dev/blog/ui-ux-design-trends)
- [7 Emerging Web Design Trends for SaaS 2026 — Enviznlabs](https://enviznlabs.com/blogs/7-emerging-web-design-trends-for-saas-in-2026-ai-layouts-glow-effects-and-beyond)
- [Framer Motion Scroll Animations — Official Docs](https://www.framer.com/motion/scroll-animations/)
- [Empty State UX in SaaS — SaasFactor](https://www.saasfactor.co/blogs/empty-state-ux-turn-blank-screens-into-higher-activation-and-saas-revenue)
- [Design Tokens and Theming 2025 — MaterialUI](https://materialui.co/blog/design-tokens-and-theming-scalable-ui-2025)
- [Dark Mode Pros/Cons 2025 — FuelItOnline](https://www.fuelitonline.com/blogs/dark-mode-design-pros-cons-and-best-practices-2025/)
- [Advanced Page Transitions Next.js + Framer Motion — LogRocket](https://blog.logrocket.com/advanced-page-transitions-next-js-framer-motion/)
- [Best Fonts for Websites 2026 — Figma](https://www.figma.com/resource-library/best-fonts-for-websites/)
- [10 Must-Have Typefaces 2026 — I Love Typography](https://ilovetypography.com/2025/12/19/10-must-have-fonts-for-2026/)
- [Responsive Design Breakpoints 2025 — BrowserStack](https://www.browserstack.com/guide/responsive-design-breakpoints)
- [Dashboard Design Best Practices SaaS 2025 — brand.dev](https://www.brand.dev/blog/dashboard-design-best-practices)

---
*Feature research for: Svoji — Design Overhaul v1.0*
*Researched: 2026-02-28*
