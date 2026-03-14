# Requirements: Svoji

**Defined:** 2026-03-14
**Core Value:** Couples can plan their entire wedding from one place with AI guidance

## v2.1 Requirements

Requirements for milestone v2.1 Polish & UX. Each maps to roadmap phases.

### Bug Fixes

- [x] **BUG-01**: User sees their actual couple names in dashboard heading (not placeholder)
- [x] **BUG-02**: User is redirected to dashboard after first mobile login (not landing page)
- [x] **BUG-03**: User sees individual budget line items created via chatbot (with edit/delete)
- [x] **BUG-04**: User sees a simple days-to-wedding countdown in checklist (not confusing stats)

### AI & Chatbot

- [ ] **CHAT-01**: Chatbot asks follow-up questions before adding budget/guest/checklist items
- [ ] **CHAT-02**: User receives a personalized AI welcome message after first login
- [ ] **CHAT-03**: User sees pre-populated budget items based on onboarding answers after first login

### Platform

- [ ] **PWA-01**: User can install the app to their phone's home screen (manifest, icons, service worker)
- [ ] **WEB-01**: Couple can customize their guest-facing wedding website (templates, colors, content sections)

## Future Requirements

Deferred to v3.0.

### Monetization

- **MONEY-01**: Freemium tier system (free vs premium)
- **MONEY-02**: Payment integration (Stripe)
- **MONEY-03**: Svatební web as premium paywall (free=preview, premium=published)

### AI Expansion

- **AI-01**: AI vendor recommendations (general advice, no vendor DB yet)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Vendor database / B2B marketplace | Need demand data first, deferred to v3.0+ |
| Vendor onboarding + profiles | Deferred to v3.0+ |
| Pay-per-lead model | Deferred to v3.0+ |
| Multi-language support | Czech market only for now |
| QR codes for invitations | Deferred |
| Seating arrangement | Deferred |
| Dark mode | ~40% overhead, conflicts with warm palette |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 11 | Complete |
| BUG-02 | Phase 11 | Complete |
| BUG-03 | Phase 11 | Complete |
| BUG-04 | Phase 11 | Complete |
| CHAT-01 | Phase 12 | Pending |
| CHAT-02 | Phase 12 | Pending |
| CHAT-03 | Phase 12 | Pending |
| PWA-01 | Phase 13 | Pending |
| WEB-01 | Phase 13 | Pending |

**Coverage:**
- v2.1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 after roadmap creation (phases 11-13)*
