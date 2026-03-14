---
created: 2026-03-14T09:22:28.008Z
title: Fix couple names not rendering in dashboard heading
area: ui
files:
  - src/app/dashboard (heading/title area)
---

## Problem

Dashboard heading still shows the placeholder "Adam a Eva" instead of the actual couple's names. The user-entered names from onboarding/profile are not being propagated to the dashboard title component.

## Solution

TBD - investigate where the dashboard heading reads the couple names from (likely user profile/settings in Supabase) and ensure the data flows correctly. Could be a missing query, a stale default, or a rendering issue where the fetched names aren't replacing the placeholder.
