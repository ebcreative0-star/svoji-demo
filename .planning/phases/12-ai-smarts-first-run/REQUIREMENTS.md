# Phase 12: AI Smarts & First-Run - Requirements

## Original Scope (from ROADMAP.md)

- **CHAT-01**: AI asks clarifying follow-up questions before inserting records
- **CHAT-02**: Personalized AI welcome message on first login (already done in 11.1)
- **CHAT-03**: Pre-populated budget categories from onboarding answers

## New: Missing CRUD Intents

### Update Intents
- **INTENT-01**: `checklist_update` -- update existing checklist item (due_date, priority, category, description, title). Fixes the duplicate problem where AI creates new items instead of modifying existing ones
- **INTENT-02**: `budget_mark_paid` -- "zaplatil jsem fotografa 12000" (sets paid=true + actual_cost)

### Query Intents (read-only, AI answers from data)
- **INTENT-03**: `checklist_query` -- "co mám v checklistu?", "co je po termínu?", "co mám udělat tento měsíc?"
- **INTENT-04**: `budget_query` -- "kolik mám v rozpočtu?", "kolik zbývá?", "co ještě není zaplacené?"
- **INTENT-05**: `guest_query` -- "kolik hostů potvrdilo?", "kdo ještě neodpověděl?"
- **INTENT-06**: `status_overview` -- "jak jsem na tom?" / "shrň mi stav příprav" -- cross-domain summary

### Batch Delete Intents
- **INTENT-07**: `checklist_remove_multi` -- "smaž fotograf a DJ z checklistu"
- **INTENT-08**: `budget_remove_multi` -- "smaž catering a dort z rozpočtu"
- **INTENT-09**: `guest_remove_multi` -- "odeber Marka a Janu ze seznamu"
- **INTENT-10**: `checklist_clear_duplicates` -- "smaž duplikáty v checklistu" (detect and remove duplicate items)

## UI: Manual CRUD

- **UI-01**: User can manually add checklist items from the checklist page (add button + form)
- **UI-02**: User can edit checklist items (title, due_date, priority, category) inline or via modal
- **UI-03**: User can manually add budget items from the budget page
- **UI-04**: User can edit budget items (name, amount, category, paid status)
- **UI-05**: User can manually add guests from the guests page
- **UI-06**: User can edit guest details (name, group, RSVP status, dietary, plus_one)

## Infrastructure Fix

- **FIX-01**: Czech date parsing -- "31.1.2026", "konec ledna", "za 2 týdny" -> correct ISO date. Currently JS parses Czech date format incorrectly (defaults to Jan 1)
