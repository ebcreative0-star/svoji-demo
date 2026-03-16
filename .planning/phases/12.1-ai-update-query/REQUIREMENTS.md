# Phase 12.1: AI Update & Query Intents

## Update Intents
- **INTENT-01**: `checklist_update` -- update existing checklist item (due_date, priority, category, description, title). Fixes duplicate problem
- **INTENT-02**: `budget_mark_paid` -- "zaplatil jsem fotografa 12000" (sets paid=true + actual_cost)

## Query Intents (read-only)
- **INTENT-03**: `checklist_query` -- "co mám v checklistu?", "co je po termínu?", "co mám udělat tento měsíc?"
- **INTENT-04**: `budget_query` -- "kolik mám v rozpočtu?", "kolik zbývá?", "co ještě není zaplacené?"
- **INTENT-05**: `guest_query` -- "kolik hostů potvrdilo?", "kdo ještě neodpověděl?"
- **INTENT-06**: `status_overview` -- "jak jsem na tom?" / "shrň mi stav příprav" -- cross-domain summary
