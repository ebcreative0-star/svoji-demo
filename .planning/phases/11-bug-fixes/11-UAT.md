---
status: complete
phase: 11-bug-fixes
source: 11-01-SUMMARY.md, 11-02-SUMMARY.md
started: 2026-03-14T11:00:00Z
updated: 2026-03-14T11:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Partner names in mobile nav
expected: On mobile screen width, the top navigation bar shows partner names (e.g. "Jana & Petr") next to the Svoji logo. Names only appear when both partners are set.
result: pass

### 2. Checklist stat cards show wedding countdown
expected: Checklist header shows 3 stat cards in a row (Hotovo, Zbyvá, Po termínu). The "Zbývá" card shows days until wedding as the main number. If wedding date is in the past, it shows "Proběhla" instead of a negative number.
result: pass

### 3. Post-login redirect for new users
expected: A new user completing onboarding and logging in for the first time lands on /chat (AI welcome). A returning user logging in lands on /checklist.
result: issue
reported: "když se přihlašuji přes google s novým mailem, tak mě to vykopne na začátek onboarding"
severity: major

### 4. AI budget items show sparkles badge
expected: Budget items created by AI chat show a small sparkles icon next to their name. AI items are still fully editable and deletable like manual items.
result: issue
reported: "ai nedokáže přidat položku do rozpočtu vůbec, badge se nedá otestovat"
severity: blocker

## Summary

total: 4
passed: 2
issues: 2
pending: 0
skipped: 0

## Gaps

- truth: "New user completing onboarding via Google login lands on /chat"
  status: failed
  reason: "User reported: když se přihlašuji přes google s novým mailem, tak mě to vykopne na začátek onboarding"
  severity: major
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "AI chat can add budget items which then show sparkles badge"
  status: failed
  reason: "User reported: ai nedokáže přidat položku do rozpočtu vůbec, badge se nedá otestovat"
  severity: blocker
  test: 4
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
