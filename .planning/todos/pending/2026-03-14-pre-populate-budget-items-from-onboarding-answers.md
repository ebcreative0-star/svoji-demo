---
created: 2026-03-14T09:25:00.000Z
title: Pre-populate budget items from onboarding answers
area: ui
files:
  - src/app/dashboard/budget (budget section)
  - src/app/onboarding (onboarding flow)
---

## Problem

Po dokončení onboardingu je rozpočet prázdný. Uživatel vidí prázdnou stránku a musí všechno přidávat ručně. To je špatný first-time experience - měl by hned vidět relevantní položky.

## Solution

Na základě odpovědí z onboardingu (počet hostů, typ svatby, lokace, budget range) automaticky vygenerovat výchozí rozpočtové položky s odhadovanými částkami. Např.:
- Venue/prostor
- Catering (odvozený z počtu hostů)
- Fotograf
- Šaty/oblek
- Květiny
- Hudba/DJ
- Oznámení
- Dort

Částky odhadnout podle zadaného celkového rozpočtu (procentuální rozložení typické české svatby). Uživatel pak může upravit/smazat/přidat.
