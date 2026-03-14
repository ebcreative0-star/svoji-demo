# Roadmap: Svoji

## Milestones

- ✅ **v0 Initial Build** -- Pre-GSD (shipped 2025-02-28)
- ✅ **v1.0 Design Overhaul** -- Phases 1-4 (shipped 2026-02-28, partial)
- ✅ **v2.0 B2C Product** -- Phases 5-10 (shipped 2026-03-13)
- 🚧 **v2.1 Polish & UX** -- Phases 11-13 (in progress)

## Phases

<details>
<summary>✅ v1.0 Design Overhaul (Phases 1-4) -- SHIPPED 2026-02-28 (partial)</summary>

- [x] Phase 1: Design System Foundation (0/2 plans -- carried into v2.0)
- [x] Phase 2: UI Primitives (2/2 plans) -- completed 2026-02-28
- [x] Phase 3: Animation Layer (4/4 plans) -- completed 2026-02-28
- [x] Phase 4: Landing Page (3/3 plans) -- completed 2026-02-28

</details>

<details>
<summary>✅ v2.0 B2C Product (Phases 5-10) -- SHIPPED 2026-03-13</summary>

- [x] Phase 5: Auth Foundation (2/2 plans) -- completed 2026-03-01
- [x] Phase 6: UI Redesign (6/6 plans) -- completed 2026-03-01
- [x] Phase 7: Enhanced Onboarding (3/3 plans) -- completed 2026-03-01
- [x] Phase 8: AI Pipeline (8/8 plans) -- completed 2026-03-02
- [x] Phase 9: Data Collection (3/3 plans) -- completed 2026-03-12
- [x] Phase 10: Integration Fix-ups (1/1 plan) -- completed 2026-03-12

</details>

### 🚧 v2.1 Polish & UX (In Progress)

**Milestone Goal:** Fix bugs, improve chatbot intelligence, and enhance first-run experience across the existing product.

- [ ] **Phase 11: Bug Fixes** - Four targeted fixes to dashboard, mobile redirect, budget line items, and checklist countdown
- [ ] **Phase 12: AI Smarts & First-Run** - Smarter chatbot with follow-up questions, personalized welcome message, and pre-populated budget from onboarding
- [ ] **Phase 13: Platform Enhancements** - PWA installability and guest-facing wedding website customization system

## Phase Details

### Phase 11: Bug Fixes
**Goal**: Core usability issues that break trust on first use are resolved
**Depends on**: Phase 10 (v2.0 complete)
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04
**Success Criteria** (what must be TRUE):
  1. User sees their actual couple names in the dashboard heading after login (not a placeholder or empty string)
  2. User on mobile is redirected to /dashboard after their first login (not back to the landing page)
  3. User sees individual budget line items created via chatbot, with edit and delete controls
  4. User sees a clean days-to-wedding countdown in the checklist header (not confusing task stats)
**Plans:** 1/2 plans executed
Plans:
- [ ] 11-01-PLAN.md -- Mobile partner names + checklist countdown fix
- [ ] 11-02-PLAN.md -- Post-login redirect + AI budget item source badge

### Phase 12: AI Smarts & First-Run
**Goal**: New users get a personalized, guided first experience and the chatbot behaves intelligently before acting
**Depends on**: Phase 11
**Requirements**: CHAT-01, CHAT-02, CHAT-03
**Success Criteria** (what must be TRUE):
  1. When a user asks the chatbot to add a budget item or guest, it asks at least one clarifying follow-up question before inserting the record
  2. User sees a personalized AI welcome message on their first login that references their wedding details (names, date, style)
  3. User sees a pre-populated set of budget categories and suggested amounts on their first visit to the budget tracker, derived from their onboarding answers
**Plans**: TBD

### Phase 13: Platform Enhancements
**Goal**: The app is installable on mobile home screens and couples can personalize their guest-facing wedding website
**Depends on**: Phase 11
**Requirements**: PWA-01, WEB-01
**Success Criteria** (what must be TRUE):
  1. User on Android or iOS is prompted to install the app to their home screen and the installed app opens full-screen without browser chrome
  2. App has a valid web manifest and service worker registered (passes PWA installability audit)
  3. Couple can choose from at least two visual templates for their guest-facing wedding website from within the dashboard
  4. Couple can edit content sections (headline, photo, story text, event details) on their wedding website and see changes reflected on the public page
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Design System Foundation | v1.0 | 0/2 | Carried | - |
| 2. UI Primitives | v1.0 | 2/2 | Complete | 2026-02-28 |
| 3. Animation Layer | v1.0 | 4/4 | Complete | 2026-02-28 |
| 4. Landing Page | v1.0 | 3/3 | Complete | 2026-02-28 |
| 5. Auth Foundation | v2.0 | 2/2 | Complete | 2026-03-01 |
| 6. UI Redesign | v2.0 | 6/6 | Complete | 2026-03-01 |
| 7. Enhanced Onboarding | v2.0 | 3/3 | Complete | 2026-03-01 |
| 8. AI Pipeline | v2.0 | 8/8 | Complete | 2026-03-02 |
| 9. Data Collection | v2.0 | 3/3 | Complete | 2026-03-12 |
| 10. Integration Fix-ups | v2.0 | 1/1 | Complete | 2026-03-12 |
| 11. Bug Fixes | 1/2 | In Progress|  | - |
| 12. AI Smarts & First-Run | v2.1 | 0/TBD | Not started | - |
| 13. Platform Enhancements | v2.1 | 0/TBD | Not started | - |
