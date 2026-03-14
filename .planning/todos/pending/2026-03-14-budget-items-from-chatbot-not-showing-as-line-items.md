---
created: 2026-03-14T09:31:00.000Z
title: Budget items from chatbot not showing as line items
area: ui
files:
  - src/app/dashboard/budget (budget view)
  - src/app/dashboard/chat (AI chat - budget tool calls)
---

## Problem

Když uživatel řeší rozpočet s AI chatbotem, plánované výdaje se propisují do celkového rozpočtu (sumář), ale nezobrazují se jako jednotlivé položky v seznamu rozpočtu. Uživatel vidí číslo, ale nevidí odkud pochází - chybí řádkové položky.

## Solution

TBD - zkontrolovat jak chatbot ukládá rozpočtové položky (tool calls). Pravděpodobně se zapisuje jen celková částka, ale nevytváří se jednotlivé budget items v DB. Nebo se vytváří, ale budget view je nefiltruje/nezobrazuje správně. Zajistit, aby každá položka z chatu byla viditelná jako řádek v rozpočtu s možností editace/smazání.
