# Phase 6: UI Redesign - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Auth pages, dashboard, and public wedding web match the premium design system established in v1.0. All views use correct OKLCH palette, typography (Cormorant Garamond headings + Inter body), and UI primitives (Button, Card, Input, Select, Textarea, Badge). Footer expanded with legal links, social, and contact. No new features or capabilities added.

</domain>

<decisions>
## Implementation Decisions

### Auth pages (login, register)
- Full visual upgrade, not just token alignment
- Centered card on subtle gradient background
- Subtle entrance animation: card fade-in + upward slide on load (Framer Motion)
- No structural layout changes (no split layout)

### Dashboard navigation
- Keep top nav bar on desktop, polish styling to match design system
- Mobile: replace hamburger dropdown with fixed bottom tab bar (5 main sections)
- Desktop nav items: Checklist, Budget, Guests, AI Chat, Settings + "Web pro hosty" link

### Public wedding web (/w/[slug])
- High polish level -- this is what guests see, the product showcase
- Parallax scroll effects: background images move at different speeds, Hero and Gallery get depth
- Section-by-section animations with parallax layers
- All sections (Hero, About, Timeline, Gallery, Locations, Contacts, RSVP) get design token treatment

### Footer
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

</decisions>

<specifics>
## Specific Ideas

- Auth pages should feel premium SaaS (like Linear, Notion login pages) -- clean centered card, gradient bg
- Bottom tab bar on mobile dashboard for thumb-friendly navigation
- Public wedding page should be the "wow" page -- parallax creates depth and visual interest
- Footer should look like a proper SaaS product footer, not a minimal afterthought
- Legal content (TOS, privacy) generated in Czech for Czech market

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button`, `Card`, `Input`, `Select`, `Textarea`, `Badge` in `src/components/ui/` -- full primitive set ready
- `DashboardNav` in `src/components/dashboard/` -- polish and add bottom tab bar variant
- `Footer` in `src/components/ui/Footer.tsx` -- expand from minimal to multi-column
- Section components in `src/components/sections/` (Hero, About, Timeline, Gallery, Locations, Contacts, RSVP) -- add parallax and animation
- Framer Motion already installed (v12.34.3) -- use for all animations

### Established Patterns
- OKLCH color palette defined in `globals.css` (primary, secondary, accent, accent-rose, accent-sage)
- Cormorant Garamond headings + Inter body fonts loaded via Next.js layout
- CSS variables for colors: `var(--color-primary)`, `var(--color-text)`, etc.
- Tailwind utility-first with CSS variable references
- `'use client'` directive for interactive components
- Optimistic state updates with `useState` + `useTransition`

### Integration Points
- Auth pages: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- Dashboard layout: `src/app/(dashboard)/layout.tsx` -- wraps all dashboard views
- Dashboard views: `src/components/dashboard/ChecklistView.tsx`, `BudgetView.tsx`, `GuestsView.tsx`, `ChatInterface.tsx`
- Public wedding: `src/app/(public)/w/[slug]/page.tsx` -- imports all section components
- New routes needed: `/tos`, `/privacy`, `/contact`

</code_context>

<deferred>
## Deferred Ideas

- Custom subdomains for wedding pages (`adam-eva.svoji.cz`) -- requires DNS/routing infrastructure, separate phase
- Supabase `couples` table not found in schema cache during onboarding -- bug, separate fix needed

</deferred>

---

*Phase: 06-ui-redesign*
*Context gathered: 2026-03-01*
