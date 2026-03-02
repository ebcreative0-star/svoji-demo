# Svoji — AI Svatební Asistent: Kompletní Flow

## Přehled projektu

Svoji je AI svatební asistent pro český trh. Pomáhá párům plánovat svatbu bez stresu — od prvního nápadu po velký den. Monetizace probíhá ve dvou fázích: B2C freemium (páry platí za premium funkce) a B2B marketplace (dodavatelé platí za leady a viditelnost).

**Tech stack:** Next.js na Vercelu, AI chat (LLM API), databáze pro profily a demand signály.

**Cílový trh:** ~30 000 tech-savvy párů/rok v ČR (25–38 let).

---

## FÁZE 1: Landing Page → Registrace

### Úkoly

- [ ] Landing page se strukturou: hero, benefity, sociální důkaz, jak to funguje, CTA
- [ ] CTA tlačítko "Zkusit zdarma" → redirect na registraci
- [ ] Registrační flow: email + heslo nebo Google OAuth
- [ ] Bez platební karty, bez závazku
- [ ] Po registraci redirect na onboarding flow
- [ ] Tracking: UTM parametry, conversion rate landing → registrace

### Akceptační kritéria

- Registrace trvá max 30 sekund
- Mobile-first design
- Conversion rate landing → registrace: cíl 5–10 %

---

## FÁZE 2: Onboarding Flow (4 kroky, ~2 minuty)

### Krok 1: Základní info

- [ ] 2× text input: "Vaše jméno" + "Jméno partnera/ky"
- [ ] Date picker pro datum svatby
- [ ] Možnost "Ještě nevíme" → uloží `null`

### Krok 2: Počet hostů

- [ ] Slider nebo preset buttony: do 30 / 30–60 / 60–100 / 100–150 / 150+
- [ ] Volitelný toggle: "Máte už seznam hostů?" (pro pozdější import)

### Krok 3: Lokalita

- [ ] Text input s autocomplete českých měst
- [ ] Slider pro radius okolí: 10–100 km, default 30 km
- [ ] Vizuální hint pod sliderem: "Budeme hledat dodavatele a místa v tomto okruhu"

### Krok 4: Rozpočet (přeskočitelný)

- [ ] Preset buttony: do 100k / 100–200k / 200–400k / 400k+ / "Nechci uvádět"
- [ ] Tlačítko "Přeskočit" — AI se zeptá později v konverzaci
- [ ] CTA: "Spustit AI asistenta"

### Datová struktura (uloží se do DB)

```json
{
  "couple_id": "c_abc123",
  "couple": {
    "name1": "Tereza",
    "name2": "Jakub"
  },
  "wedding_date": "2026-09-12",
  "guests": {
    "estimated_count": 80,
    "has_guest_list": false
  },
  "location": {
    "city": "Brno",
    "lat": 49.1951,
    "lng": 16.6068,
    "radius_km": 40
  },
  "budget": {
    "range": "200-400k",
    "amount_czk": null
  },
  "subscription": "free",
  "onboarding_completed_at": "2026-03-01T14:30:00Z"
}
```

### Akceptační kritéria

- Onboarding completion rate: cíl 80 %+
- Max 2 minuty na dokončení
- Data se předají jako kontext AI asistentovi (system prompt)

---

## FÁZE 3: Hlavní Dashboard — 3 pilíře

### Pilíř A: AI Chat (hlavní interakce)

- [ ] Chat rozhraní vždy přístupné z dashboardu
- [ ] Personalizovaný od první zprávy díky onboarding datům
- [ ] System prompt obsahuje: jména, datum, hosty, lokaci, rozpočet, historii
- [ ] Free tier: limit 15 zpráv/den
- [ ] Premium tier: neomezený

### Pilíř B: Plánovací nástroje (freemium)

- [ ] Checklist — AI generovaný podle data svatby (countdown + milníky)
- [ ] Rozpočet tracker — kategorie, plánováno vs. utraceno
- [ ] Seznam hostů — jména, RSVP status, dietary requirements
- [ ] Free tier: základní verze (omezený počet položek)
- [ ] Premium tier: plný přístup + export

### Pilíř C: Svatební web (hlavní paywall)

- [ ] RSVP formulář pro hosty
- [ ] Program svatebního dne
- [ ] Mapa místa obřadu a hostiny
- [ ] Info pro hosty (dress code, parkování, ubytování)
- [ ] Sdílení jedním odkazem
- [ ] Free tier: náhled (nepublikovaný)
- [ ] Premium tier: publikovaný na vlastní URL

### Monetizace B2C

- [ ] Free → Premium upgrade flow
- [ ] Cenové varianty: 200–500 Kč/měsíc NEBO 800–2 000 Kč jednorázově
- [ ] Stripe/GoPay integrace
- [ ] Trial period: zvážit 7 dní premium zdarma

### Akceptační kritéria

- Svatební web je hlavní konverzní páka pro premium
- Uživatel vidí jasnou hodnotu premium vs. free

---

## FÁZE 4: AI Chat Pipeline — Srdce produktu

### Zpracování zprávy

```
Pár pošle zprávu
    ↓
System prompt (onboarding data + historie konverzací)
    ↓
AI zpracuje dotaz
    ↓
Klasifikace intentu:
    ├─ Obecný dotaz → AI odpoví ze znalostí
    ├─ Dotaz na dodavatele → query do DB dodavatelů
    │   ├─ Jsou partneři → doporučí partnery (prioritně premium)
    │   └─ Nejsou partneři → obecná rada + veřejné zdroje
    ├─ Plánování → aktualizuje checklist / rozpočet
    └─ Emoční podpora → empatie + praktická rada
    ↓
Odpověď + logování demand signálu
```

### Úkoly

- [ ] System prompt template s proměnnými z onboarding dat
- [ ] Intent klasifikace (může být LLM-based nebo rule-based)
- [ ] Napojení na DB dodavatelů (query by category, region, budget, availability)
- [ ] Ranking dodavatelů: premium first → pak rating → dostupnost → relevance
- [ ] Fallback: pokud nejsou dodavatelé, AI radí obecně + odkazuje veřejné zdroje
- [ ] Logování každého dotazu jako demand signál (viz Fáze 5)
- [ ] Rate limiting pro free tier (15 zpráv/den)

### System prompt template

```
Jsi svatební asistent pro pár {{name1}} & {{name2}}.
Svatba: {{wedding_date ?? "datum zatím neurčeno"}}.
Počet hostů: cca {{guests.estimated_count}}.
Hledej dodavatele a místa v okruhu {{location.radius_km}} km od {{location.city}}.
Rozpočet: {{budget.range ?? "neuvedeno"}}.

Pravidla:
- Odpovídej česky, přátelsky, konkrétně.
- Když doporučuješ dodavatele, vysvětli proč (dostupnost, specializace, cena).
- Pokud nemáš konkrétního dodavatele, poraď obecně + tipy na co se ptát.
- Neříkej "jako AI model" — jsi svatební plánovač.
```

### Akceptační kritéria

- AI odpovídá personalizovaně od první zprávy
- Doporučení dodavatelů působí jako rada, ne jako reklama
- Každá konverzace loguje demand signály

---

## FÁZE 5: Sběr dat — Co se loguje a kdy

### A) Profil páru (z onboardingu + průběžně aktualizovaný)

```json
{
  "couple_id": "c_abc123",
  "names": ["Tereza", "Jakub"],
  "wedding_date": "2026-09-12",
  "guest_count": 80,
  "location": { "city": "Brno", "radius_km": 40 },
  "budget_total": 250000,
  "budget_spent": 0,
  "onboarding_completed": true,
  "subscription": "free",
  "created_at": "2026-03-01",
  "last_active": "2026-03-28"
}
```

- [ ] DB tabulka: `couples`
- [ ] Aktualizace: onboarding + AI konverzace (pokud pár zmíní nové info)

### B) Demand signály (z každé konverzace o dodavatelích) ⭐ KLÍČOVÉ

```json
{
  "signal_id": "ds_001",
  "couple_id": "c_abc123",
  "category": "photographer",
  "region": "Brno",
  "radius_km": 40,
  "budget_range": [15000, 25000],
  "requirements": ["outdoor", "drone", "engagement_shoot"],
  "wedding_date": "2026-09-12",
  "urgency": "medium",
  "timestamp": "2026-03-15T10:22:00Z",
  "matched_vendors": [],
  "outcome": null
}
```

- [ ] DB tabulka: `demand_signals`
- [ ] Logovat při každém dotazu na dodavatele/službu
- [ ] Kategorie: photographer, catering, dj, florist, venue, dress, makeup, video, celebrant, decoration, cake, transport, accommodation
- [ ] Toto je hlavní prodejní argument pro dodavatele ve Fázi 6

### C) Interakce s dodavateli (Fáze 6+)

```json
{
  "interaction_id": "int_001",
  "couple_id": "c_abc123",
  "vendor_id": "v_456",
  "type": "profile_view",
  "source": "ai_recommendation",
  "timestamp": "2026-03-15T10:23:00Z"
}
```

- [ ] DB tabulka: `vendor_interactions`
- [ ] Funnel: `profile_view` → `portfolio_click` → `inquiry_sent` → `booking_confirmed`
- [ ] Tracking source: `ai_recommendation` / `catalog_browse` / `search`

### D) Engagement metriky (průběžně)

```json
{
  "couple_id": "c_abc123",
  "messages_total": 47,
  "sessions": 12,
  "checklist_completion": 0.35,
  "budget_items_tracked": 8,
  "guest_list_imported": false,
  "wedding_web_published": false,
  "last_active": "2026-03-28",
  "days_since_registration": 27,
  "days_until_wedding": 168
}
```

- [ ] DB tabulka: `engagement_metrics` (nebo computed view)
- [ ] Trackovat pro churn prediction a upsell timing

### Akceptační kritéria

- Každý dotaz na dodavatele generuje demand signál
- Data jsou agregována pro reporting dodavatelům
- Dashboard s přehledem: kolik párů, jaké kategorie, jaké regiony

---

## FÁZE 6: Evoluce dodavatelů — 3 stupně

### Stupeň 0: Žádní dodavatelé (launch)

- [ ] AI radí obecně ze svých znalostí o českém svatebním trhu
- [ ] Odkazuje na veřejné zdroje: Firmy.cz, Google Maps, Beremese.cz
- [ ] Sbírá demand signály z každé konverzace
- [ ] Cíl: nasbírat 200+ aktivních párů a data o poptávce

### Stupeň 1: 5–30 partnerů (early traction)

- [ ] Oslovit 20–30 dodavatelů v jednom regionu (začít Brno nebo Praha)
- [ ] Nabídka: 3 měsíce zdarma výměnou za profil + portfolio
- [ ] AI preferuje partnery, ale doplňuje obecnými tipy
- [ ] Vendor onboarding: profil, portfolio upload, ceník, dostupnost
- [ ] Základní vendor dashboard: počet zobrazení, počet leadů

### Stupeň 2: 30+ partnerů (plný marketplace)

- [ ] AI primárně doporučuje z vlastní databáze
- [ ] Premium vendor profily: prioritní doporučování + detailní analytics
- [ ] Pay-per-lead model aktivní
- [ ] Vendor dashboard: impressions, leads, conversion rate, srovnání s konkurencí
- [ ] Prodejní pitch: "Za poslední 3 měsíce hledalo fotografa v Brně 83 párů"

### Datová struktura dodavatele

```json
{
  "vendor_id": "v_456",
  "business_name": "Foto Novák",
  "category": "photographer",
  "subcategories": ["wedding", "engagement", "portrait"],
  "location": {
    "city": "Brno",
    "lat": 49.1951,
    "lng": 16.6068,
    "service_radius_km": 60
  },
  "pricing": {
    "min_czk": 18000,
    "max_czk": 45000,
    "pricing_model": "package"
  },
  "portfolio_urls": [],
  "availability": {
    "booked_dates": ["2026-06-13", "2026-07-04"],
    "calendar_sync": true
  },
  "subscription": {
    "tier": "premium",
    "monthly_czk": 990,
    "started_at": "2026-01-15"
  },
  "stats": {
    "impressions": 342,
    "leads_received": 28,
    "conversion_rate": 0.18,
    "avg_rating": 4.8,
    "reviews_count": 12
  }
}
```

- [ ] DB tabulka: `vendors`
- [ ] DB tabulka: `vendor_subscriptions`
- [ ] DB tabulka: `vendor_reviews`

### Monetizace B2B

- [ ] Free profil: viditelnost v katalogu
- [ ] Premium: 500–2 000 Kč/měsíc (prioritní AI doporučování + analytics)
- [ ] Pay-per-lead: 200–1 000 Kč za poptávku (závisí na kategorii)
- [ ] Stripe/fakturace pro B2B

### Akceptační kritéria

- Vendor onboarding do 10 minut
- Dashboard ukazuje ROI (kolik leadů za kolik Kč)
- AI doporučení působí přirozeně, ne jako reklama

---

## FÁZE 7: Flywheel efekt

```
Víc párů
  → víc demand signálů
    → lepší nabídka dodavatelům ("83 párů hledalo fotografa v Brně")
      → víc dodavatelů v DB
        → lepší doporučení pro páry
          → víc párů (word of mouth, recenze)
            → → → cyklus se zrychluje
```

### Klíčové metriky na sledování

- [ ] **Registrace/týden** — growth rate
- [ ] **Onboarding completion rate** — cíl 80 %+
- [ ] **Zprávy/uživatel/týden** — cíl 10+ (engagement)
- [ ] **7d retention** — kolik párů se vrátí po týdnu
- [ ] **30d retention** — kolik párů je aktivních po měsíci
- [ ] **Free → Premium conversion** — cíl 5–15 %
- [ ] **Demand signály/měsíc** — objem dat pro B2B sales
- [ ] **Vendor leads/měsíc** — po spuštění marketplace
- [ ] **NPS score** — doporučení kamarádkám

---

## Finanční projekce

| | Rok 1 | Rok 2 | Rok 3 |
|---|---|---|---|
| **Registrace** | 1 000–4 000 | 5 000–10 000 | 10 000–20 000 |
| **Platící páry** | 30–320 | 400–1 500 | 800–3 000 |
| **B2C revenue** | 50–250k Kč | 300k–1,5M Kč | 500k–2,5M Kč |
| **B2B revenue** | 0 | 500k–2M Kč | 2–10M Kč |
| **Celkem** | 50–250k Kč | 800k–3,5M Kč | 2,5–12,5M Kč |

---

## Prioritizace (co dělat první)

1. **MVP:** Landing page + registrace + onboarding + AI chat (bez dodavatelů)
2. **Validace:** Dostat 100 párů, sledovat engagement a retention
3. **Paywall:** Přidat svatební web jako premium feature
4. **Data:** Sbírat demand signály, agregovat pro sales
5. **Marketplace:** Oslovit prvních 20 dodavatelů v jednom regionu
6. **Scale:** Expanze do dalších regionů, vendor dashboard, pay-per-lead
