---
created: 2026-03-14T09:33:00.000Z
title: Chatbot should ask follow-up questions when adding list items
area: ui
files:
  - src/app/dashboard/chat (AI chat - system prompt / tool logic)
  - src/app/dashboard/budget (budget items schema)
  - src/app/dashboard/guests (guest list schema)
  - src/app/dashboard/checklist (checklist schema)
---

## Problem

Když uživatel řekne chatbotovi "přidej X do rozpočtu/seznamu hostů/checklistu", chatbot to rovnou přidá bez doptání na důležité detaily. Chybí kategorie, datum, label, odhadovaná částka apod. Výsledek je neúplná položka.

## Solution

Chatbot by měl před přidáním položky do jakéhokoliv seznamu:
1. Rozpoznat kontext seznamu (rozpočet/hosté/checklist)
2. Doptat se na relevantní pole pro daný typ:
   - **Rozpočet**: kategorie, odhadovaná částka, priorita
   - **Hosté**: +1, strana (nevěsta/ženich), skupina, dietary requirements
   - **Checklist**: deadline, kategorie, priorita
3. Na základě kontextu rovnou doporučit hodnoty (např. "Fotograf - doporučuju kategorie Služby, typická cena 25-45k Kč")
4. Nechat uživatele potvrdit nebo upravit před uložením

Vylepšit system prompt a tool call definice, aby AI věděl jaká pole jsou k dispozici a aktivně se ptal.
