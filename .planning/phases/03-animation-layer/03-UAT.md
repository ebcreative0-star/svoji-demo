---
status: complete
phase: 03-animation-layer
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md
started: 2026-02-28T20:00:00Z
updated: 2026-02-28T20:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Smooth Scroll (Lenis)
expected: Scrolling any page with mouse wheel or trackpad feels physically smooth -- no abrupt jumps, gentle momentum. Desktop browser.
result: pass

### 2. Scroll-Triggered Reveals
expected: Major content sections on the landing page fade and slide up into view as you scroll to them. Each section appears once and stays visible.
result: skipped
reason: No content sections exist yet -- ScrollReveal component created but landing page sections come in later phases

### 3. Button Hover Effect
expected: Hovering over any button lifts it slightly (-1.5px) and scales it up (1.03x). Feels like it floats.
result: issue
reported: "efekt je téměř neviditelný"
severity: cosmetic

### 4. Button Press Effect
expected: Clicking/pressing a button scales it down slightly (tactile press feedback) before action fires.
result: issue
reported: "téměr neviditelné"
severity: cosmetic

### 5. Card Hover Shadow
expected: Hovering over an interactive card deepens its shadow -- feels like the card lifts off the surface.
result: pass

### 6. Input Focus Ring
expected: Clicking into a text input shows a neutral soft gray glow ring (not brand colored). Should not compete visually with the input content.
result: issue
reported: "pole dostane hnedy obrys"
severity: major

### 7. Page Transitions (Public Routes)
expected: Navigating between public pages (landing page, wedding web) shows a smooth crossfade transition (~400ms). Not instant, not sluggish -- silky/satiny feel.
result: issue
reported: "je hodně rychlý, skoro okamžitý"
severity: minor

### 8. No Transitions on Dashboard/Auth
expected: Navigating within dashboard or auth pages is instant -- no crossfade delay.
result: pass

### 9. Reduced Motion Respected
expected: With "Reduce motion" enabled in OS accessibility settings, ALL animations are suppressed -- no scroll reveals, no hover effects, no page transitions. Content appears instantly.
result: skipped

## Summary

total: 9
passed: 3
issues: 4
pending: 0
skipped: 2

## Gaps

- truth: "Hovering a button lifts it (-1.5px) and scales it (1.03x) with visible float effect"
  status: failed
  reason: "User reported: efekt je téměř neviditelný"
  severity: cosmetic
  test: 3
  root_cause: "Spring config (stiffness: 400, damping: 20) is too stiff -- the animation snaps to target in ~30ms, making y: -1.5 and scale: 1.03 imperceptible even though the values are correct"
  artifacts:
    - "src/components/ui/Button.tsx:72 -- transition: { type: 'spring', stiffness: 400, damping: 20 }"
  missing:
    - "Reduce stiffness (e.g. 300) and damping (e.g. 15) so the spring has more travel time, OR switch to duration-based tween (e.g. duration: 0.15) to guarantee visible motion"
  debug_session: ""

- truth: "Pressing a button scales it down with visible tactile feedback"
  status: failed
  reason: "User reported: téměr neviditelné"
  severity: cosmetic
  test: 4
  root_cause: "Same spring config as Issue 3 -- stiffness: 400 / damping: 20 makes the whileTap scale: 0.975 snap instantly and snap back before it registers visually"
  artifacts:
    - "src/components/ui/Button.tsx:72 -- shared transition config applies to both whileHover and whileTap"
  missing:
    - "Use a separate, slower transition for whileTap (e.g. duration: 0.08 tween) so the press-down is perceptible before release"
  debug_session: ""

- truth: "Input focus shows neutral soft gray glow ring, not brand colored"
  status: failed
  reason: "User reported: pole dostane hnedy obrys"
  severity: major
  test: 6
  root_cause: "Global CSS in globals.css applies 'outline: 2px solid var(--color-primary)' to input:focus-visible, overriding Tailwind's focus:ring-gray-300/70 -- --color-primary is oklch(55% 0.045 55) which renders as warm brown"
  artifacts:
    - "src/app/globals.css:109-116 -- blanket focus-visible rule sets outline to var(--color-primary) for all inputs"
    - "src/components/ui/Input.tsx:31 -- focus:ring-gray-300/70 is correct but the global outline sits on top"
  missing:
    - "Remove 'input:focus-visible' from the global focus rule in globals.css (keep it only for a, button, select, textarea), or add 'focus-visible:outline-none' to the Input className to suppress the global override"
  debug_session: ""

- truth: "Page transition crossfade is smooth and noticeable (~400ms), not instant"
  status: failed
  reason: "User reported: je hodně rychlý, skoro okamžitý"
  severity: minor
  root_cause: "AnimatePresence lives INSIDE template.tsx which Next.js App Router replaces on every navigation -- the old template instance (and its AnimatePresence) is destroyed before it can coordinate the exit animation, so only the entry fade-in plays and the old page snaps away instantly"
  artifacts:
    - "src/app/(public)/template.tsx:11-22 -- AnimatePresence is inside the component that gets replaced, not in a persistent parent layout"
  missing:
    - "Move AnimatePresence up into the public layout (src/app/(public)/layout.tsx) so it persists across template replacements and can coordinate both exit and enter animations"
  debug_session: ""
