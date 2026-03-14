---
created: 2026-03-14T09:35:00.000Z
title: Fix confusing numbers in checklist countdown - show only days to wedding
area: ui
files:
  - src/app/dashboard/checklist (countdown/remaining widget)
---

## Problem

V checklistu je okno "Zbývá" kde jsou matoucí čísla. Není jasné co znamenají. Uživatel očekává jednoduchý odpočet dní do svatby, místo toho vidí nepřehledné údaje.

## Solution

Zjednodušit widget "Zbývá" v checklistu na čistý countdown do data svatby:
- Zobrazit pouze počet dní do svatby (velké číslo + "dní do svatby")
- Případně měsíce + dny pokud je to víc než 30 dní ("3 měsíce a 12 dní")
- Odstranit matoucí další čísla/statistiky z tohoto widgetu
- Datum svatby brát z user profilu (onboarding)
