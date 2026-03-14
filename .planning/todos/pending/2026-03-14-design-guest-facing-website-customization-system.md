---
created: 2026-03-14T09:37:00.000Z
title: Design guest-facing website customization system
area: ui
files:
  - src/app/dashboard (settings/customization area)
  - src/app/svatba (guest-facing pages)
---

## Problem

Páry potřebují mít možnost přizpůsobit si web pro hosty (svatební stránku) - barvy, fonty, fotky, layout, obsah sekcí. Aktuálně je web pro hosty statický/jednotný pro všechny páry.

## Solution

TBD - potřeba navrhnout celý systém customizace:

Možné přístupy:
1. **Template systém** - několik předpřipravených šablon (elegantní, rustikální, moderní...), pár si vybere a nastaví barvy/fotky
2. **Builder** - drag & drop sekce (náš příběh, program, RSVP, fotogalerie, mapa, ubytování...)
3. **Theme + content** - jednoduchý theme picker (barvy, font) + WYSIWYG editor obsahu sekcí

Klíčové otázky k rozhodnutí:
- Jak moc customizace? (jen barvy vs celý layout)
- Jaké sekce jsou povinné vs volitelné?
- Vlastní doména / subdoména?
- Mobile-first design?
- Jak se to propojí s RSVP a seznamem hostů?
