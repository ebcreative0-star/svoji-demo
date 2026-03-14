---
created: 2026-03-14T09:29:00.000Z
title: Fix mobile first login redirect to landing instead of dashboard
area: auth
files:
  - src/app/auth/confirm (auth callback)
  - src/middleware.ts (route protection)
  - src/app/page.tsx (landing page)
---

## Problem

Na mobilu po prvním přihlášení uživatel skončí na hlavní stránce (landing page) místo dashboardu. Až při druhém přihlášení redirect funguje správně a pošle ho do dashboardu. Na desktopu pravděpodobně funguje. Bug je specifický pro mobilní prohlížeč.

## Solution

TBD - pravděpodobně race condition v auth callbacku nebo middleware. Možné příčiny:
- Session/cookie se nestihne zapsat před redirectem na mobilu (pomalejší network)
- Auth confirm callback redirectuje na `/` místo `/dashboard`
- Middleware kontroluje session, která ještě není platná při prvním requestu po auth
- Safari specifický problém s cookies (SameSite, Secure flags)

Debugovat auth flow na mobilu, zkontrolovat redirect chain po potvrzení emailu/OAuth.
