---
created: 2026-03-14T09:23:00.000Z
title: Add PWA support for home screen install
area: ui
files:
  - src/app/layout.tsx
  - public/ (icons)
  - next.config.ts
---

## Problem

Uživatelé si nemohou uložit dashboard na plochu telefonu (iPhone/Android) jako "aplikaci". Na iPhonu se otevírá v Safari UI místo standalone režimu. Žádná PWA infrastruktura v projektu neexistuje - chybí manifest, meta tagy, ikony i service worker.

## Solution

1. **Web manifest** (`public/manifest.webmanifest`) - jméno appky, ikony, barvy, `display: "standalone"`, `start_url: "/dashboard"`
2. **Apple meta tagy** v `src/app/layout.tsx` - `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`
3. **Ikony** - apple-touch-icon (180x180), icon-192x192, icon-512x512 (placeholder, pak vyměnit za branding)
4. **Minimální service worker** - pro offline fallback a Android install prompt
5. Volitelně: `next-pwa` nebo `serwist` plugin pro Next.js pro automatickou SW generaci
