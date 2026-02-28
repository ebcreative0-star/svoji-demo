# Pitfalls Research

**Domain:** Visual redesign of existing Next.js SaaS (wedding planning app)
**Researched:** 2026-02-28
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: CSS Custom Property Rename Leaves 196 Silent Failures

**What goes wrong:**
The entire codebase uses `var(--color-primary)` inline in Tailwind's arbitrary value syntax: `text-[var(--color-primary)]`, `bg-[var(--color-secondary)]` etc. There are 196 such references across 20+ files. If you rename or restructure the CSS variables in `globals.css` without updating every reference, components silently fall back to nothing — no errors, no warnings, just transparent/white elements. The dashboard nav, buttons, checklist, budget, guests, and public web all reference these variables directly.

**Why it happens:**
Tailwind 4 uses CSS-first configuration (no `tailwind.config.ts` exists). Colors live in `:root {}` in `globals.css`. When redesigning, the natural move is to update the root variables — but the inline `[var(--color-*)]` references in JSX aren't caught by TypeScript or ESLint.

**How to avoid:**
Strategy A (safest): Keep all existing variable names, only change their values. `--color-primary` becomes the new color, not a new name. Zero JSX changes needed.
Strategy B (if renaming): Do a project-wide find-and-replace for each renamed variable before the dev server runs. Script it: `grep -r "var(--color-old-name" src/ --include="*.tsx" -l` — then batch replace.
Prefer Strategy A. The variable names are generic enough (`primary`, `secondary`, `accent`) that they survive a palette change without renaming.

**Warning signs:**
- After updating globals.css, `text-[var(--color-primary)]` elements render in black (inherit) instead of the expected color
- No browser console errors — the failure is purely visual
- Run `grep -r "var(--color-" src/ --include="*.tsx" | wc -l` before and after — count should stay stable

**Phase to address:**
Design System phase (first). Establish variable rename policy before touching any component.

---

### Pitfall 2: Font Swap Causes Layout Shift and FOUT Across All Headings

**What goes wrong:**
`layout.tsx` loads Playfair Display via `next/font/google` with `display: "swap"`. Every `h1`–`h6` in the app falls back to `Georgia, serif` until the font loads. When Playfair Display is replaced with a new heading font (e.g., a variable font or different weight/width), the fallback geometry almost always differs from the new font — triggering Cumulative Layout Shift on initial render. This is visible as a "jump" on headings, which is especially bad on the landing page hero where the heading is large.

**Why it happens:**
`display: "swap"` is correct for performance but means the fallback font renders first. The new font's character width, cap height, and line-height differ from the fallback. Next.js `next/font` does support `adjustFontFallback` (automatically generates `size-adjust`, `ascent-override`, etc.) but only works reliably when you pass `adjustFontFallback: true` explicitly. If omitted, fallback metrics are guessed.

**How to avoid:**
1. When adding the new font in `layout.tsx`, pass `adjustFontFallback: true` on the new font declaration.
2. Also update the CSS fallback stack in `globals.css`: the `h1-h6` rule has `'Playfair Display', Georgia, serif` hardcoded — this must be updated to match the new font's fallback.
3. For the `.font-serif` utility class, same update needed.
4. Test CLS using Chrome DevTools Performance panel with network throttle on the landing page hero.

**Warning signs:**
- Heading text visibly jumps/reflows on page load, especially on slow connections
- Lighthouse CLS score above 0.1
- `font-family: 'Playfair Display', Georgia, serif` still appearing in computed styles after redesign

**Phase to address:**
Typography phase. First commit that changes the font must also update both `layout.tsx` (adjustFontFallback) and `globals.css` (h1-h6 fallback stack).

---

### Pitfall 3: Framer Motion on Server Components (Next.js 16 App Router)

**What goes wrong:**
The project uses Next.js 16 App Router. By default, all components are React Server Components (RSC). Framer Motion's `motion.*` components require client-side JS and cannot run in RSC context. If you add `motion.div` to a component that doesn't have `'use client'` at the top, you get a cryptic runtime error: "You're importing a component that needs X. It only works in a Client Component but none of its parents are marked with 'use client'."

The bigger trap: marking a large page-level component as `'use client'` just to add one animation propagates the client boundary too far up, disabling RSC benefits (server-side data fetching, reduced bundle) for the entire subtree.

**Why it happens:**
Developers add animations to existing page components without checking whether they're RSC. The error only surfaces at runtime, not at build time. And the "fix" of adding `'use client'` to the parent feels obvious but is architecturally wrong.

**How to avoid:**
Wrap animations in small dedicated client components. Pattern:
```tsx
// components/ui/AnimatedSection.tsx
'use client'
import { motion } from 'framer-motion'
export function AnimatedSection({ children, ...props }) {
  return <motion.div {...props}>{children}</motion.div>
}
```
Page-level RSC passes content as children into the client animation wrapper. Server components stay server components. Only the animation shell is client.

**Warning signs:**
- Runtime error mentioning "client component" boundary
- A page-level component being marked `'use client'` only because it contains an animation
- Bundle size jump after adding animations (indicates too-wide client boundary)

**Phase to address:**
Animation phase. Establish the AnimatedSection wrapper pattern as the standard before implementing any scroll-triggered animations.

---

### Pitfall 4: Framer Motion Layout Animations Cause Jank on Dashboard Views

**What goes wrong:**
`layoutId` and `layout` props in Framer Motion trigger browser layout recalculation on every render. In the dashboard's ChecklistView, BudgetView, and GuestsView — which re-render on each data mutation (checklist item toggle, budget entry add) — a `layout` prop on a list item causes the browser to recalculate layout for every sibling simultaneously. On mid-range Android phones this manifests as 100-300ms freezes during list interactions.

**Why it happens:**
`layout` animations look cheap in dev (fast machine, small dataset). Real users have 20-50 checklist items, slower CPUs, and often have background tabs open. The layout recalculation is synchronous and cannot be cancelled.

**How to avoid:**
- Use `layout` animations only on landing/auth pages (marketing content, rarely changes).
- For dashboard list items: use CSS `transition` on `transform` and `opacity` instead of Framer Motion `layout`. CSS transitions are compositor-thread only and don't trigger layout.
- If Framer Motion is needed in dashboard lists (e.g., item add/remove with AnimatePresence), animate `height` with `initial={{ height: 0 }}` / `animate={{ height: 'auto' }}` rather than using `layout`.
- Test on Chrome DevTools with CPU throttle 4x before shipping any dashboard animation.

**Warning signs:**
- DevTools Performance panel shows "Layout" blocks exceeding 16ms during user interactions
- List feels "sticky" when toggling checklist items or adding budget entries
- FPS drops below 60 during any animation in dashboard

**Phase to address:**
Dashboard redesign phase. Animations here require explicit performance gate: test with 50 checklist items on throttled CPU before considering it done.

---

### Pitfall 5: AnimatePresence Exit Animations Block Navigation

**What goes wrong:**
Framer Motion's `AnimatePresence` runs exit animations before unmounting components. If a page transition or auth redirect wraps components in `AnimatePresence` with an `exit` animation, the user experiences a 300-600ms delay before navigation completes. For auth flows (login → dashboard redirect), this reads as "the app is slow" even though it's intentional animation. On fast networks where Supabase auth resolves in 200ms, a 400ms exit animation means the total perceived auth time doubles.

**Why it happens:**
Exit animations feel great on the landing page but get applied globally. Router-level `AnimatePresence` in `layout.tsx` affects all navigations including utility ones (auth redirect, logout).

**How to avoid:**
- Keep `AnimatePresence` scoped to specific UI patterns (modals, drawers, toast notifications) not page transitions.
- For page-level transitions: animate `enter` only (fade/slide in) with no `exit`. Pages unmount immediately but mount with a subtle entrance. This is imperceptible and avoids the exit delay.
- If exit animations are used on landing sections: keep `duration` under 200ms.
- Never wrap Supabase auth callbacks or server-redirect paths in exit animations.

**Warning signs:**
- Navigation feels sluggish after animations are added
- Auth redirect from login to dashboard takes visibly longer than before
- `exit` prop appears on components that are direct children of router-level `AnimatePresence`

**Phase to address:**
Animation phase. Establish a rule: exit animations only in modals and drawers, never on page-level transitions.

---

### Pitfall 6: Tailwind 4 CSS-First Config Breaks If globals.css Import Order Changes

**What goes wrong:**
Tailwind 4 uses `@tailwind base; @tailwind components; @tailwind utilities;` in `globals.css`. The custom `:root` variables, button styles (`.btn-primary`, `.btn-outline`), and utility classes (`.section-padding`, `.container`, `.animate-fade-in-up`) are defined after the `@tailwind` directives. If during redesign someone adds a new CSS file import, restructures globals.css into multiple files, or changes the import order, Tailwind's generated utilities can override the custom classes or the custom classes can override Tailwind's — depending on specificity and order.

**Why it happens:**
Tailwind 4 processes CSS differently from v3. The `@layer` mechanism works differently. Developers split CSS into multiple files for organization, not realizing that import order determines specificity.

**How to avoid:**
- Keep all custom CSS in a single `globals.css` file for this project (it's not large enough to warrant splitting).
- Any new design tokens go into the `:root` block in `globals.css` — not a separate file.
- If a second CSS file is ever needed, import it via `@import` inside `globals.css`, not separately in `layout.tsx`.
- New utility classes should use `@layer utilities {}` to participate correctly in Tailwind's cascade.

**Warning signs:**
- Custom button styles stop working after adding a new CSS import
- `.container` class behaves differently than expected (Tailwind also has a `container` utility)
- Specificity battles: needing `!important` to override styles

**Phase to address:**
Design System phase. The `.container` naming conflict with Tailwind's built-in is a pre-existing issue — rename to `.content-container` during redesign to avoid confusion.

---

### Pitfall 7: Inconsistent Visual State During Phased Rollout

**What goes wrong:**
If redesign is done page by page (landing first, then auth, then dashboard), users who are already authenticated skip the landing page entirely. They land directly in the dashboard. If dashboard ships last, authenticated users see "new landing, old dashboard" indefinitely — creating a jarring inconsistency that reads as a broken product. The public wedding web (`/w/[slug]`) is seen by guests who never see the dashboard, so its visual consistency with the new aesthetic matters independently.

**Why it happens:**
Redesign phases naturally follow the user funnel (marketing → auth → dashboard). But returning users bypass the funnel.

**How to avoid:**
- Treat the design system (colors, fonts, spacing) as Phase 0. Define all new tokens before touching any component.
- Once the design system is in place, update `globals.css` CSS variables globally — this propagates the new palette to all pages simultaneously, even if component-level redesign is phased.
- The "all pages look different" problem is solved if the color palette and typography switch atomically.
- Component-level polish can be phased, but the base design system should ship as a single atomic change.

**Warning signs:**
- Old mocha brown appearing on dashboard while landing uses new palette
- Playfair Display headings remaining on auth pages while landing shows new font
- The public wedding web `/w/[slug]` still has old aesthetic after marketing page redesign

**Phase to address:**
Design System phase (must precede all other phases). Global token swap is a one-file change to `globals.css` that de-risks visual inconsistency.

---

### Pitfall 8: Color Contrast Failures on New Premium Palette

**What goes wrong:**
"Warm premium" palettes trend toward soft beige backgrounds with golden/cream text — combinations that frequently fail WCAG AA contrast (4.5:1 for normal text). The current palette has this risk: `--color-text-light: #5C5C5C` on `--color-secondary: #FAF8F5` is borderline (~5.5:1, passes AA but not AAA). A new premium palette with lighter backgrounds or lighter text tones can easily drop below 4.5:1 without anyone noticing until tested.

**Why it happens:**
Color tools like Figma and browser dev tools show colors visually — and to human eyes, light beige + off-white cream "looks fine." Contrast ratio is a mathematical computation that doesn't match intuition for warm tones.

**How to avoid:**
Before finalizing any color pair, check contrast at https://webaim.org/resources/contrastchecker/ or use browser DevTools accessibility panel.
Required minimums:
- Body text on background: 4.5:1
- Large headings (18px+ bold): 3:1
- UI elements (buttons, inputs): 3:1
Focus ring color (`--color-primary` is currently used for all focus outlines) must also maintain 3:1 against the element's background.

**Warning signs:**
- Chrome DevTools accessibility panel flags elements with "insufficient color contrast"
- The new accent color looks "soft and premium" on Figma but fails contrast check in browser
- Gray placeholder text in forms fails against new input background

**Phase to address:**
Design System phase. Each new color variable must have its contrast ratio documented against the backgrounds it's used on.

---

### Pitfall 9: Mobile Safari Animation Bugs with Framer Motion

**What goes wrong:**
Mobile Safari (iOS) has known issues with certain CSS properties when used via Framer Motion: `backdropFilter` in animated elements causes rendering artifacts; `position: fixed` elements inside animated containers lose fixed positioning during animations; `overflow: hidden` on animated parents clips child elements incorrectly during enter/exit on iOS 16 and below. The nav uses `bg-white/95 backdrop-blur-md` (backdrop filter) — animating near or around this element on iOS is risky.

**Why it happens:**
WebKit's compositing layer management differs from Chromium. Framer Motion uses `transform: translateZ(0)` (will-change promotion) internally which triggers new stacking contexts. On iOS, this interacts badly with `backdrop-filter` and `position: fixed`.

**How to avoid:**
- Do not animate the navigation bar itself — keep it static.
- For scroll-triggered animations on landing sections: use `opacity` and `translateY` only (compositor-friendly). Avoid `scale` animations on elements that contain `backdrop-filter`.
- Test on actual iOS device (not simulator) before shipping animation work. The simulator uses Mac's Chromium-based WebView in some modes.
- Add `will-change: transform` manually only when there's a proven performance benefit — don't add it preemptively to every animated element.

**Warning signs:**
- Fixed nav disappears or "jumps" during page scroll on iPhone
- Blurred glass effect elements show rendering artifacts during animation
- Content clips or overflow behaves differently on iPhone vs desktop

**Phase to address:**
Animation phase. iOS Safari must be in the test matrix from day one.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding new hex colors in JSX instead of CSS variables | Faster one-off styling | Creates a second source of truth; breaks global palette changes | Never — add to `:root` always |
| Using `!important` to override specificity conflicts | Unblocks immediately | Makes future CSS changes unpredictable; specificity debt compounds | Never in design system code |
| Skipping `adjustFontFallback` on new font | One less line of config | CLS on every page load until someone diagnoses it | Never |
| Marking page-level RSC as `'use client'` for one animation | Fixes error immediately | Disables RSC for entire subtree, increases bundle size | Never — use AnimatedSection wrapper |
| Adding `layout` prop to all list items for "polished" reorder | Looks smooth in dev | Jank on mobile with real data volumes | Never in dashboard views |
| Disabling animations globally with `transition: none` to "fix" a bug | Removes visual problem | Hides real issue; removes intentional animations too | MVP only, never in shipped product |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| next/font with new heading font | Forgetting to update `globals.css` h1-h6 fallback stack after changing font in `layout.tsx` | Update both files atomically: `layout.tsx` font declaration + `globals.css` h1-h6 rule + `.font-serif` class |
| Framer Motion + Next.js App Router | Importing `motion` in RSC without `'use client'` | Create client wrapper components; keep page components as RSC |
| Tailwind 4 + custom CSS classes | Naming custom class `.container` (conflicts with Tailwind's built-in container) | Rename to `.content-container` or use `@layer components {}` with careful specificity |
| Supabase auth redirects + AnimatePresence | Wrapping auth redirect targets in exit animations causing perceived slowness | Never add exit animations on components that are the destination of programmatic navigation |
| CSS variables in Tailwind arbitrary values | Renaming a CSS variable breaks all `[var(--old-name)]` references silently | Keep variable names stable; change values only; or run batch replace script |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Framer Motion `layout` on dashboard list items | Freezes during checklist toggle, guest add | Use CSS transitions in dashboard views; reserve Framer Motion for marketing pages | 20+ list items on mobile CPU |
| Animating `backdrop-filter` elements | Rendering artifacts, battery drain on iOS | Keep backdrop-filter elements static; animate surrounding elements only | Always on iOS Safari |
| Loading multiple Google Font weights unnecessarily | Slower font load, FOUT on slow connections | Load only the weights actually used (e.g., 400 and 600 only) | Always affects initial paint |
| `useAnimation` + complex stagger sequences on scroll | Page freezes when scrolling fast through landing sections | Use `whileInView` with simple fade/translateY; test with fast scroll gesture | Mobile with 10+ staggered items |
| `will-change: transform` on every animated element | Excessive GPU memory usage | Add `will-change` only to elements that animate continuously (spinners, progress bars) | Low-memory mobile devices |

## Security Mistakes

Not applicable to this milestone — design-only changes, no new data flows or auth logic.

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Animations that play every visit, not just first | Returning users feel slowed down navigating familiar UI | Scroll-triggered animations only fire once per session; micro-interactions on hover/click fire every time |
| Exit animations on login form during auth wait | User clicks "Přihlásit se", sees fade-out, thinks something went wrong | Keep form visible while auth is in progress; show loading state in-place |
| New premium palette loses Czech cultural warmth | Product feels cold/corporate for wedding context | Warm undertones (cream, rose, gold) must survive the "premium" direction — don't go pure cool gray |
| Public wedding web style diverges from dashboard | Guests see a different aesthetic than couple expects | Public web redesign in same phase as or before dashboard; same design tokens |
| Touch targets shrink during icon-only mobile nav | Taps miss on small phones, frustrating mobile users | Keep existing 44px minimum touch targets; don't sacrifice them for visual minimalism |
| Reduced motion ignored | Users with vestibular disorders get animations they opted out of | Add `useReducedMotion()` from Framer Motion to every AnimatedSection wrapper |

## "Looks Done But Isn't" Checklist

- [ ] **Color system:** All 196 `[var(--color-*)]` references verified against new palette — run `grep -r "var(--color-" src/ --include="*.tsx"` and spot check 10 random results in browser
- [ ] **Font replacement:** `layout.tsx` updated AND `globals.css` h1-h6 rule AND `.font-serif` class — all three, not just layout.tsx
- [ ] **Contrast ratios:** New color pairs (text/bg, button/bg, input/bg) checked with WebAIM contrast checker — document the ratios
- [ ] **Reduced motion:** Every `motion.*` component wrapped in a check via `useReducedMotion()` or AnimatedSection handles it centrally
- [ ] **Mobile Safari tested:** Scroll animations, navigation, backdrop-blur elements — tested on real device or BrowserStack iOS Safari
- [ ] **Public wedding web:** `/w/[slug]` pages updated to new design — they are independently styled and easily overlooked
- [ ] **Dashboard views all updated:** ChecklistView, BudgetView, GuestsView, ChatInterface — all in `src/components/dashboard/` require separate attention
- [ ] **Focus states updated:** `globals.css` focus-visible rule uses `--color-primary` — if primary changes, focus rings auto-update, but verify they still have 3:1 contrast against page background
- [ ] **Build succeeds:** `next build` runs clean with no TypeScript errors or ESLint warnings after redesign

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CSS variable rename broke 196 references | MEDIUM | Run `grep -r "var(--old-name)" src/` to find all affected files; batch replace; verify in browser |
| New font causes CLS regression | LOW | Add `adjustFontFallback: true` to font declaration in layout.tsx; update globals.css fallback stack |
| Framer Motion in RSC causing build error | LOW | Add `'use client'` to the specific component; then immediately refactor to AnimatedSection wrapper pattern |
| Layout animations janking dashboard on mobile | MEDIUM | Remove `layout` prop from dashboard list items; replace with CSS `transition: opacity 0.2s, transform 0.2s` |
| Color contrast failures discovered late | LOW | Adjust lightness of the failing token in globals.css; contrast changes propagate everywhere |
| AnimatePresence exit blocking navigation | LOW | Remove `exit` prop from page-level animated components; keep only in modals/drawers |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CSS variable rename breaks 196 references | Phase 1: Design System | After globals.css update, visual check of nav, buttons, checklist in browser |
| Font swap FOUT and CLS | Phase 1: Design System (typography) | Lighthouse CLS score below 0.1 on landing page |
| Framer Motion in RSC | Phase 3: Animations | Build succeeds (`next build`); no `'use client'` on page-level components |
| Layout animation jank in dashboard | Phase 4: Dashboard redesign | CPU throttle 4x test with 50 checklist items; FPS stays above 30 |
| AnimatePresence blocking navigation | Phase 3: Animations | Login → dashboard redirect is not slower than before animations |
| Tailwind CSS specificity / import order | Phase 1: Design System | Custom button classes override Tailwind utilities as expected |
| Visual inconsistency during phased rollout | Phase 1: Design System (atomic token swap) | After Phase 1 commit, palette is consistent across all pages simultaneously |
| Color contrast failures | Phase 1: Design System | All new color pairs documented with contrast ratios |
| Mobile Safari animation bugs | Phase 3: Animations | iOS Safari test for nav, backdrop-blur elements, scroll animations |
| Mobile inconsistency (reduced motion) | Phase 3: Animations | Test with macOS/iOS "Reduce Motion" enabled — no animations visible |

## Sources

- Framer Motion v12 docs: https://motion.dev/docs
- Next.js 16 App Router: https://nextjs.org/docs/app/building-your-application/rendering/client-components
- Tailwind CSS 4 migration notes: https://tailwindcss.com/docs/upgrade-guide
- next/font documentation: https://nextjs.org/docs/app/api-reference/components/font
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- WCAG 2.1 contrast criteria: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- Framer Motion useReducedMotion: https://motion.dev/docs/react-use-reduced-motion
- Direct codebase analysis: 20+ source files in src/ examined, 196 CSS variable references counted

---
*Pitfalls research for: Svoji — visual redesign of existing Next.js 16 SaaS*
*Researched: 2026-02-28*
