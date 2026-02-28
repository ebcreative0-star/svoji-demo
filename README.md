# Svoji - Svatební web

Moderní, rychlý a elegantní svatební web postavený na Next.js 14.

## Features

- Hero sekce s odpočtem do svatby
- Timeline programu dne
- Interaktivní mapa míst
- RSVP formulář s validací
- Fotogalerie s lightboxem
- Responzivní design (mobile-first)
- SEO optimalizace

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4
- **Formuláře**: React Hook Form + Zod
- **Ikony**: Lucide React
- **Animace**: Framer Motion
- **Backend**: Supabase (volitelné)

## Spuštění

```bash
# Instalace závislostí
npm install

# Development server
npm run dev

# Build
npm run build

# Spuštění produkce
npm start
```

Otevři [http://localhost:3000](http://localhost:3000) v prohlížeči.

## Struktura projektu

```
src/
├── app/
│   ├── api/rsvp/       # RSVP API endpoint
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Homepage
├── components/
│   ├── sections/       # Sekce stránky (Hero, Timeline, atd.)
│   └── ui/             # Reusable komponenty
├── data/
│   └── wedding.ts      # Demo data (v produkci z DB)
└── lib/
    └── supabase.ts     # Supabase client
```

## Customizace

### Data svatby
Uprav soubor `src/data/wedding.ts` pro změnu:
- Jména páru
- Datum svatby
- Program dne
- Místa
- Galerie
- Kontakty

### Barvy
Barvy jsou definovány v `src/app/globals.css`:
- `--color-primary`: Hlavní barva
- `--color-secondary`: Pozadí sekcí
- `--color-accent`: Akcentová barva

### Fonty
Používáme:
- **Playfair Display** - pro nadpisy
- **Inter** - pro text

## Deploy

### Vercel (doporučeno)
1. Push na GitHub
2. Import do Vercel
3. Nastav environment variables (pokud používáš Supabase)
4. Deploy

### Supabase setup (volitelné)
1. Vytvoř projekt na supabase.com
2. Spusť SQL migrace z `supabase/migrations/`
3. Zkopíruj URL a anon key do `.env.local`

## TODO

- [ ] Admin panel pro editaci obsahu
- [ ] Více šablon designu
- [ ] Seznam darů
- [ ] Sdílená galerie od hostů
- [ ] Vícejazyčná podpora

---

Vytvořeno s láskou pro české páry.
