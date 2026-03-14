---
created: 2026-03-14T09:27:00.000Z
title: AI welcome message after first login with feature intro
area: ui
files:
  - src/app/dashboard/chat (AI chat component)
  - src/app/onboarding (onboarding flow)
---

## Problem

Po dokončení onboardingu a registraci uživatel přistane na dashboardu bez jakéhokoliv uvítání. Neví, co AI asistent umí a jak mu může pomoct s plánováním svatby. Chybí first-launch experience.

## Solution

Při prvním přihlášení (po onboardingu) AI asistent automaticky pošle uvítací zprávu do chatu. Zpráva by měla:
- Přivítat uživatele jménem (jméno páru z onboardingu)
- Krátce představit co umí: práce se seznamem hostů, rozpočtem, harmonogramem
- Nabídnout první krok (např. "Chceš začít se seznamem hostů?")

Detekce first launch: flag v user profilu nebo check jestli chat history je prázdná.
