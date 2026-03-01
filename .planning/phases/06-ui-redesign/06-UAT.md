---
status: diagnosed
phase: 06-ui-redesign
source: 06-01-SUMMARY.md, 06-02-SUMMARY.md, 06-03-SUMMARY.md, 06-04-SUMMARY.md
started: 2026-03-01T18:00:00Z
updated: 2026-03-01T18:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Auth page entrance animation
expected: Visit /login. The card should fade in and slide up smoothly (not appear instantly). Same for /register.
result: pass

### 2. SaasFooter on landing page
expected: Scroll to the bottom of the landing page (/). Footer has 4 columns: Brand, Legal (TOS, Privacy links), Social (Instagram icon), Contact. Links are clickable.
result: issue
reported: "je to tam, ale text je příliš blizko hranice segmentů. + černý background mi moc neladí co celkového vzhledu"
severity: cosmetic

### 3. Legal and contact pages
expected: /tos shows Czech legal terms (7 sections). /privacy shows Czech GDPR policy (8 sections). /contact shows a form with validation -- submit empty to see error messages.
result: pass

### 4. Desktop dashboard navigation
expected: On desktop, the dashboard top bar has a backdrop-blur effect, active page gets a border-b-2 underline in accent color, and there's a "Web pro hosty" link.
result: issue
reported: "nevidím web pro hosty"
severity: major

### 5. Mobile bottom tab bar
expected: On mobile viewport, hamburger menu is gone. Instead, a fixed bottom tab bar shows 5 items (icons + labels). Content is not hidden behind it.
result: pass

### 6. Dashboard views use design primitives
expected: Open Checklist, Budget, and Guests views. They should use Card wrappers, styled Input/Select elements (not raw HTML inputs), and have a subtle fade-in entrance animation.
result: pass

### 7. Settings page redesigned
expected: Settings page uses Card sections for grouping, all form fields use styled Input/Select/Textarea components, and action buttons use the Button component.
result: pass

### 8. Hero parallax scroll
expected: Visit a wedding page (/w/[slug]). As you scroll, the Hero background moves at a slower rate than the content (parallax effect). On mobile or with reduced-motion, parallax should be disabled.
result: skipped
reason: No couple/slug in database, wedding page not accessible

### 9. Gallery parallax and hover effects
expected: Gallery section has a subtle parallax shift on scroll. Hovering individual gallery items shows a scale-up effect.
result: skipped
reason: No couple/slug in database, wedding page not accessible

### 10. Wedding sections consistent styling
expected: All 7 wedding page sections (Hero, About, Gallery, Timeline, Locations, Contacts, RSVP) use consistent heading typography (font-heading) and color tokens.
result: skipped
reason: No couple/slug in database, wedding page not accessible

### 11. RSVP and Navigation
expected: RSVP form is wrapped in a Card. Navigation bar shows the couple's names (from data, not hardcoded placeholder).
result: skipped
reason: No couple/slug in database, wedding page not accessible

## Summary

total: 11
passed: 5
issues: 2
pending: 0
skipped: 4

## Gaps

- truth: "Footer has 4 columns with proper spacing and visually fitting background"
  status: failed
  reason: "User reported: je to tam, ale text je příliš blizko hranice segmentů. + černý background mi moc neladí co celkového vzhledu"
  severity: cosmetic
  test: 2
  root_cause: "Footer uses bg-[var(--color-text)] (black) which clashes with the light/cream site palette. Container padding px-4 (1rem) is too tight for column text near segment borders."
  artifacts:
    - path: "src/components/ui/SaasFooter.tsx"
      issue: "bg-[var(--color-text)] is black, px-4 padding too tight"
  missing:
    - "Change background to match site palette (e.g. bg-[var(--color-secondary)] or bg-[var(--color-primary-dark)])"
    - "Increase horizontal padding to px-6 or px-8"
  debug_session: ""

- truth: "Dashboard nav shows 'Web pro hosty' link"
  status: failed
  reason: "User reported: nevidím web pro hosty"
  severity: major
  test: 4
  root_cause: "DashboardNav renders 'Web pro hosty' only when slug prop is truthy. Dashboard layout.tsx does not pass slug prop because it only queries couples table (partner names), not wedding_websites table where slug is stored."
  artifacts:
    - path: "src/components/dashboard/DashboardNav.tsx"
      issue: "slug prop conditional render works, but slug is never passed"
    - path: "src/app/(dashboard)/layout.tsx"
      issue: "Missing query to wedding_websites table, slug prop not passed to DashboardNav"
  missing:
    - "Query wedding_websites table in layout.tsx to get slug"
    - "Pass slug prop to DashboardNav component"
  debug_session: ""
