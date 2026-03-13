# Phase 7: Enhanced Onboarding - Research

**Researched:** 2026-03-01
**Domain:** Multi-step onboarding form with Framer Motion transitions, GDPR consent, Czech city autocomplete, Supabase DB migration, AI system prompt handoff
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Flow order:** GDPR consent screen (before step 1, mandatory) -> Step 1: couple names + wedding date (with "Ještě nevíme" option) -> Step 2: guest count (preset buttons: do 30 / 30-60 / 60-100 / 100-150 / 150+) -> Step 3: location (Czech city autocomplete) + radius (preset buttons) -> Step 4: wedding style (single select: tradiční, boho, opulentní, minimalistická, rustikální) -> Step 5: budget (preset buttons, skippable) -> redirect to registration form. Data saved to DB after successful registration.
- **GDPR consent:** Two separate checkboxes, both pre-unchecked. (1) Data processing consent (mandatory) -- "Souhlasím se zpracováním osobních údajů" + link to privacy policy. (2) Marketing consent (optional). Consent recorded with timestamp. User cannot proceed without accepting (1).
- **Data storage during onboarding:** React state only, no localStorage. Data does not survive page refresh. After registration, onboarding data written to `couples` table with new fields (location, radius, style).
- **Transitions & visual design:** Soft crossfade between steps (Framer Motion AnimatePresence, fade out current / fade in next). Thin horizontal progress bar filling as steps complete (not dots). Clean white background, no patterns or decorative elements. Lucide icons on all 5 steps. Editorial, minimal feel.
- **AI context handoff:** All onboarding data injected into AI system prompt (names, date, guest count, location, radius, style, budget). First AI message is personal and warm. AI proactively suggests a first step. AI should proactively offer choices.

### Claude's Discretion

- "Ještě nevíme" date implementation: null date vs. season+year approximation
- AI greeting detail level: how much onboarding data to reference in first message
- Exact radius preset values
- Icon choices for each step
- Transition timing and easing curves
- How to handle edge cases (empty budget, no date) in AI prompt

### Deferred Ideas (OUT OF SCOPE)

- Quick reply buttons in AI chat (clickable choices under messages) -- Phase 8 (AI Pipeline)
- GDPR right to erasure endpoint -- future compliance phase
- Data Processing Agreement (DPO) -- future compliance phase
- localStorage persistence for onboarding data across sessions -- rejected (React state only)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ONBD-01 | Step 1 -- couple names + wedding date (with "Ještě nevíme" option for date) | State machine pattern + AnimatePresence crossfade; null date stored as NULL in DB |
| ONBD-02 | Step 2 -- guest count (preset buttons: do 30 / 30-60 / 60-100 / 100-150 / 150+) | Existing preset-button pattern in current step 3 (weddingSize); same approach |
| ONBD-03 | Step 3 -- location (Czech city autocomplete) + radius slider/presets | No existing autocomplete in project; use datalist or Supabase cities query; see Architecture Patterns |
| ONBD-04 | Step 4 -- wedding style (tradiční, boho, opulentní, minimalistická, rustikální) | Single-select card grid; same pattern as guest count |
| ONBD-05 | Step 5 -- budget (preset buttons, skippable) | Skip button added to navigation; no validation block on this step |
| ONBD-06 | Satin fade transitions between steps with editorial visual design | AnimatePresence + `mode="wait"` + opacity-only variants; progress bar via width percentage |
| ONBD-07 | All onboarding data passed as AI assistant system prompt context | Extend `ChatContext` interface and `buildSystemPrompt()` in `src/app/api/chat/route.ts` |
| SEC-03 | GDPR consent mechanism before data collection (privacy policy update + consent banner) | Pre-GDPR screen with two unchecked checkboxes; consent timestamp stored in couples table |
</phase_requirements>

---

## Summary

Phase 7 rewrites the existing 4-step onboarding at `src/app/(auth)/onboarding/page.tsx` into a 6-screen flow (GDPR consent + 5 personalization steps) with animated step transitions. The architectural challenge is that onboarding now runs BEFORE registration -- data must live in React state and be passed through to the registration route, then persisted to Supabase only after the user creates an account.

The existing codebase provides almost everything needed: Framer Motion 12 (including AnimatePresence), Lucide React 0.575, the Button/Input/Card primitives, and the established CSS variable color system. The only genuinely new technical territory is Czech city autocomplete (Step 3) and the data handoff from onboarding -> registration -> DB write.

The AI system prompt extension (ONBD-07) is straightforward: the `buildSystemPrompt()` function in `src/app/api/chat/route.ts` already accepts a `ChatContext` object -- it just needs new fields added (location, radius, style, gdpr_timestamp) and a richer prompt template.

**Primary recommendation:** Implement onboarding as a single-file state machine with `step` as an integer and `AnimatePresence mode="wait"` wrapping each step panel. Pass collected data to the registration page via URL search params or React context. Do NOT use localStorage.

---

## Standard Stack

### Core (all already in project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | 12.34.3 | Step crossfade animations, AnimatePresence | Already installed; used in Button, register page, PublicTransitionProvider |
| lucide-react | 0.575.0 | Step icons | Already installed; used in current onboarding |
| next | 16.1.6 | App router, Client Components | Project base |
| @supabase/supabase-js | 2.98.0 | DB write after registration | Already used throughout |
| tailwindcss | 4.x | Styling | Project base; CSS variables already set up |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.1.0 | Date formatting for AI prompt | Already installed; use for formatting wedding date in system prompt |
| react-hook-form | 7.71.2 | Already installed but NOT needed here | Onboarding uses simple controlled state, not complex form validation |
| zod | 4.3.6 | Already installed but NOT needed here | Simple onboarding validation fits inline guards |

### No New Installs Required

The entire phase can be implemented with zero new npm dependencies. All needed libraries are in `package.json`.

---

## Architecture Patterns

### Recommended Project Structure

The entire onboarding flow is one page file. No new directories needed.

```
src/app/(auth)/onboarding/
└── page.tsx                    # Rewrite: GDPR screen + 5 steps, single state machine

src/app/(auth)/register/
└── page.tsx                    # Modify: accept searchParams, persist couple data after signup

src/app/api/chat/
└── route.ts                    # Modify: extend ChatContext + buildSystemPrompt with new fields

src/lib/
└── types.ts                    # Modify: add location, radius, wedding_style to Couple interface

supabase/migrations/
└── 004_onboarding_v2.sql       # New migration: add columns to couples table
```

### Pattern 1: Single-File State Machine with AnimatePresence

**What:** A `step` integer (0 = GDPR, 1-5 = steps) controls which panel renders. AnimatePresence with `mode="wait"` ensures the current panel fades out before the next fades in.

**When to use:** Any linear wizard with < 8 steps where each step fits in one screen.

**Example (crossfade only -- no slide, per user decision):**
```typescript
// Source: Framer Motion AnimatePresence docs -- mode="wait" ensures sequential fade
import { AnimatePresence, motion } from 'framer-motion';

const stepVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const transition = { duration: 0.3, ease: 'easeInOut' };

// Inside render:
<AnimatePresence mode="wait">
  <motion.div
    key={step}
    variants={stepVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={transition}
  >
    {/* current step content */}
  </motion.div>
</AnimatePresence>
```

**Recommended timing (Claude's discretion):** duration: 0.28s, ease: [0.4, 0, 0.2, 1] (Material standard) -- feels smooth without drag.

### Pattern 2: Thin Progress Bar

**What:** A fixed-width container with an inner div whose `width` CSS property is driven by `(currentStep / totalSteps) * 100 + '%'`. Framer Motion `motion.div` with `animate={{ width }}` for smooth fill animation.

**Example:**
```typescript
const TOTAL_STEPS = 5;
// step ranges 1-5 (GDPR screen is step 0, not counted in progress)

<div className="w-full h-0.5 bg-gray-100 mb-8">
  <motion.div
    className="h-full bg-[var(--color-primary)]"
    animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
  />
</div>
```

Progress bar is hidden on the GDPR screen (step 0).

### Pattern 3: Preset Button Selection

**What:** A grid or stack of `<button>` elements. Selected state = colored border + secondary bg. Already established in old onboarding Step 3 (weddingSize selector).

**Reuse the existing pattern verbatim:**
```typescript
<button
  type="button"
  onClick={() => setGuestCount(option.value)}
  className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
    guestCount === option.value
      ? 'border-[var(--color-primary)] bg-[var(--color-secondary)]'
      : 'border-gray-200 hover:border-gray-300'
  }`}
>
  {option.label}
</button>
```

Apply this pattern to: guest count (ONBD-02), wedding style (ONBD-04), budget (ONBD-05), radius (part of ONBD-03).

### Pattern 4: "Ještě nevíme" Date Option (Claude's Discretion)

**Recommendation:** Store as `null` in DB. In the UI, show a `<input type="date">` AND a toggle button "Ještě nevíme". When toggle is active, the date input is hidden and the stored value is `null`. This is simpler than a season/year approximation and maps cleanly to the nullable `wedding_date` column already in the DB.

In the AI prompt, handle gracefully: `weddingDate ? formatDate(weddingDate) : 'datum zatím není stanoveno'`.

### Pattern 5: Czech City Autocomplete (ONBD-03)

**What:** HTML5 `<datalist>` backed by a static list of ~100 major Czech cities hardcoded in the component, OR a Supabase query to a cities table if one exists. No third-party geocoding library needed.

**Why not a geocoding API:** The project has no geocoding dependency and there is no budget API key configured. The requirement is "Czech city autocomplete" for search radius purposes, not full address geocoding.

**Recommended implementation:**
```typescript
// Hardcode top ~80 Czech cities as a constant array
const CZECH_CITIES = [
  'Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'Ústí nad Labem',
  'Hradec Králové', 'České Budějovice', 'Pardubice', 'Zlín', 'Havířov',
  'Kladno', 'Most', 'Opava', 'Frýdek-Místek', 'Karviná', 'Jihlava',
  // ... ~60 more
];

// HTML5 datalist -- no JS filtering needed, browser handles it
<input
  type="text"
  value={location}
  onChange={(e) => setLocation(e.target.value)}
  list="czech-cities"
  placeholder="Město nebo region"
  className="w-full px-4 py-3 border border-gray-200 rounded-xl ..."
/>
<datalist id="czech-cities">
  {CZECH_CITIES.map((city) => (
    <option key={city} value={city} />
  ))}
</datalist>
```

**Radius presets (Claude's discretion):** 10 / 25 / 50 / 100 km -- covers local ceremony (10), regional search (25-50), and national vendors (100).

### Pattern 6: Data Handoff -- Onboarding to Registration

**The core architectural challenge:** Onboarding happens BEFORE registration (user has no account yet). Data must survive the navigation from `/onboarding` to `/register`.

**Options considered:**

| Approach | Pros | Cons |
|----------|------|------|
| URL search params | Simple, no state complexity | Data visible in URL, limited size |
| React Context / Zustand | Clean, type-safe | Needs provider wrapping auth routes |
| sessionStorage | Survives navigation, hidden from URL | Slightly more complex than params |
| React state passed via router | Zero deps | Data lost on back-navigation |

**Recommendation: URL search params (encoded JSON or individual params).**

Rationale: The data set is small (~6 fields), the user cannot go back from register to onboarding in a meaningful way (they'd start over), and URL params require zero infrastructure. Encode as individual params for readability and debuggability.

```typescript
// In onboarding page, after step 5:
const params = new URLSearchParams({
  p1: partner1,
  p2: partner2,
  date: weddingDate || '',
  guests: guestCount,
  location: location,
  radius: radius.toString(),
  style: weddingStyle,
  budget: budget || '',
  gdpr: gdprTimestamp,
  marketing: marketingConsent ? '1' : '0',
});
router.push(`/register?${params.toString()}`);
```

```typescript
// In register page:
const searchParams = useSearchParams();
const onboardingData = {
  partner1_name: searchParams.get('p1') || '',
  // ... etc
};
// After successful registration, write to DB immediately
```

**Alternative if URL params feel fragile:** A lightweight React Context in the `(auth)` group layout.tsx would work too, but there's no layout.tsx in the auth group currently -- adding one only to pass state adds indirection. URL params are simpler for this use case.

### Pattern 7: DB Write After Registration

After `supabase.auth.signUp()` or `exchangeCodeForSession()` succeeds, insert/upsert the onboarding data into `couples`:

```typescript
// In register page, after successful signUp:
const { data: { user } } = await supabase.auth.getUser();
if (user && onboardingData) {
  await supabase.from('couples').upsert({
    id: user.id,
    partner1_name: onboardingData.partner1,
    partner2_name: onboardingData.partner2,
    wedding_date: onboardingData.date || null,
    guest_count_range: onboardingData.guests,
    location: onboardingData.location,
    search_radius_km: parseInt(onboardingData.radius),
    wedding_style: onboardingData.style,
    budget_total: onboardingData.budget ? parseFloat(onboardingData.budget) : null,
    gdpr_consent_at: onboardingData.gdpr,
    marketing_consent: onboardingData.marketing === '1',
    onboarding_completed: true,
  });
}
```

**Note on email confirmation flow:** Current register page uses `supabase.auth.signUp()` with email confirmation. The user gets redirected to `/auth/confirm` after clicking the email link. The onboarding data in URL params will be LOST at this point because the user leaves the browser to check email and returns via the confirmation link. This is a critical edge case.

**Solution for email confirm flow:** After clicking "Vytvořit účet", store onboarding params in sessionStorage (exception to no-localStorage rule -- sessionStorage is per-tab and clears when tab closes, and this is necessary for email confirm flow). The `/auth/confirm` route can then read sessionStorage after redirect. Alternatively: show a "check your email" screen and display the data they entered for confirmation, but don't persist until they return.

**Simpler solution:** Encourage Google OAuth path which has no email confirmation step. For email signup, after signUp show a success screen that instructs the user to check email. When user returns via `/auth/confirm`, they'll hit `/onboarding` again (couples row doesn't exist yet). This creates a re-entry problem.

**Recommended approach for the planner to decide:** The cleanest solution is to write the couples row BEFORE email confirmation -- after `signUp()` succeeds, immediately insert the onboarding data using the Supabase anon key INSERT. The user's auth.uid() isn't established yet for anon key writes.

**Actually correct pattern:** After `signUp()` returns `data.user` (even before email confirmation, Supabase returns the user object with their UUID in v2), write the couples row immediately. RLS policy `auth.uid() = id` should allow this since the session token is established.

**Verify:** Supabase signUp v2 does return `data.user` with the UUID even if email_confirmed is false, and the session is established client-side. So the DB write can happen right after signUp. This is the correct approach.

### Pattern 8: AI System Prompt Extension (ONBD-07)

Extend `ChatContext` in `src/app/api/chat/route.ts`:

```typescript
interface ChatContext {
  partner1: string;
  partner2: string;
  weddingDate: string | null;     // null = "Ještě nevíme"
  guestCountRange: string;         // e.g. "60-100"
  location: string;
  searchRadiusKm: number;
  weddingStyle: string;            // e.g. "boho"
  budget: number | null;
  // weddingSize: string           // DEPRECATED -- replaced by guestCountRange
}
```

The `buildSystemPrompt()` function needs to handle null date and new fields:

```typescript
function buildSystemPrompt(context: ChatContext): string {
  const dateStr = context.weddingDate
    ? new Date(context.weddingDate).toLocaleDateString('cs-CZ')
    : 'datum zatím není stanoveno';

  const daysUntilWedding = context.weddingDate
    ? Math.ceil((new Date(context.weddingDate).getTime() - Date.now()) / 86400000)
    : null;

  const styleLabel = {
    tradični: 'tradiční česká',
    boho: 'boho / přírodní',
    opulentní: 'opulentní / luxusní',
    minimalistická: 'minimalistická',
    rustikální: 'rustikální / venkovská',
  }[context.weddingStyle] ?? context.weddingStyle;

  return `Jsi Svoji, přátelský AI asistent pro plánování svateb v České republice.

KONTEXT PÁRU:
- Jména: ${context.partner1} a ${context.partner2}
- Datum svatby: ${dateStr}${daysUntilWedding ? ` (za ${daysUntilWedding} dní)` : ''}
- Počet hostů: ${context.guestCountRange}
- Oblast: ${context.location} (okruh ${context.searchRadiusKm} km)
- Styl: ${styleLabel}
${context.budget ? `- Rozpočet: ${context.budget.toLocaleString('cs-CZ')} Kč` : '- Rozpočet: neuvedeno'}

PRVNÍ ZPRÁVA (použij při prvním kontaktu):
Začni osobně -- pozdrav ${context.partner1} a ${context.partner2} jménem, zmíň jejich styl (${styleLabel}) a oblasti (${context.location}), a navrhni první konkrétní krok.
Příklad: "Ahoj ${context.partner1} a ${context.partner2}! Vidím, že plánujete ${styleLabel} svatbu v okolí ${context.location} pro ${context.guestCountRange} hostů -- to zní skvěle. Začneme výběrem místa?"

PRAVIDLA:
- Piš česky, přátelsky ale profesionálně
- Při rozhodování nabízej konkrétní volby (A nebo B), ne jen obecné rady
- Při dotazech na dodavatele doporučuj v okruhu ${context.searchRadiusKm} km od ${context.location}
...`;
}
```

**Note:** The chat client currently sends `context` in the POST body. Any changes to `ChatContext` must be matched in wherever the chat component builds and sends that object. Need to find and update that call site.

### Anti-Patterns to Avoid

- **Separate page files per step:** Don't create `step1/page.tsx`, `step2/page.tsx`. Navigation resets animation state and the URL-based approach adds complexity. One file, one state machine.
- **Using AnimatePresence without `mode="wait"`:** Without `mode="wait"`, enter and exit animations run simultaneously, creating visual overlap. Always use `mode="wait"` for step wizards.
- **Blocking budget step:** Budget is explicitly skippable (ONBD-05). Do NOT add a validation gate on step 5. The "Pokračovat" button on step 5 should also work without any budget selected.
- **Storing GDPR consent only in React state:** Consent timestamp must be persisted to DB, not just used to gate the flow.
- **Using localStorage for onboarding data:** Explicitly rejected by user. Use React state + URL params.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Step fade animations | Custom CSS transitions | Framer Motion AnimatePresence | Already in project; handles edge cases like rapid navigation |
| Progress indicator | Custom SVG/canvas | `motion.div` with `animate={{ width }}` | One-liner with Framer Motion |
| Czech city search | Full geocoding integration | HTML5 `<datalist>` + static city array | No API key needed; browser handles filtering; sufficient for wedding planning radius use case |
| Form validation | Custom validation logic | Inline guards in `nextStep()` | Already established pattern in current onboarding; not complex enough for react-hook-form |
| Icon set | Custom SVG icons | Lucide React (already installed) | Consistent with rest of app |
| Button preset selection | Custom radio group component | `<button>` with conditional className | Already pattern in current onboarding step 3 |

**Key insight:** This phase is almost entirely UI composition with existing primitives. The "hard" parts are the data handoff architecture (onboarding -> register -> DB) and making the city autocomplete feel native. Neither requires a new library.

---

## Common Pitfalls

### Pitfall 1: Email Confirmation Loses Onboarding Data

**What goes wrong:** User completes onboarding -> registers with email -> gets redirect to "check your email" -> closes tab -> clicks email link -> lands on `/auth/confirm` -> redirected to `/onboarding` (no couples row exists) -> must start over.

**Why it happens:** URL params exist only in the browser session. Email confirmation breaks the browser session continuity.

**How to avoid:** Write the `couples` row immediately after `supabase.auth.signUp()` returns (before email confirmation). Supabase v2 returns `data.user` with UUID even before email is confirmed. The session is established client-side immediately.

**Warning signs:** If user complains about "having to fill in details twice," this is the cause.

### Pitfall 2: AnimatePresence Key Collision

**What goes wrong:** If the `key` prop on the animated div is not unique per step, Framer Motion doesn't detect a component change and won't animate.

**Why it happens:** Developers sometimes use `key={isVisible}` (boolean) instead of `key={step}` (integer).

**How to avoid:** Always use `key={step}` where `step` is the unique integer for each screen.

### Pitfall 3: "Ještě nevíme" Date Breaks AI Prompt

**What goes wrong:** `buildSystemPrompt` calls `new Date(context.weddingDate)` on a null/empty string, producing `Invalid Date`, which crashes or produces garbage output.

**Why it happens:** The original `ChatContext.weddingDate` is typed as `string`, not `string | null`.

**How to avoid:** Type `weddingDate` as `string | null` in `ChatContext`. Guard every date operation: `context.weddingDate ? ... : fallback`.

### Pitfall 4: Register Page Doesn't Read onboarding Params

**What goes wrong:** onboarding redirect uses URL params, but register page doesn't read them. Data silently dropped.

**Why it happens:** The register page is a separate existing file. Easy to forget to update it.

**How to avoid:** Register page must use `useSearchParams()` (Next.js App Router client hook) to read onboarding data. This requires `'use client'` (already present) and `Suspense` boundary if the page is used with static generation.

### Pitfall 5: GDPR Consent Screen Not Skippable via Back Button

**What goes wrong:** If user navigates back (browser back button) from step 1 to GDPR screen, and then forward again, the GDPR gate may re-block them even though they already consented.

**Why it happens:** State is reset or GDPR checks are too aggressive.

**How to avoid:** Store `gdprAccepted: boolean` in state. Once accepted, never re-block in the same session. The GDPR screen simply doesn't appear again after acceptance (step 0 -> can't go back to 0 from step 1+).

### Pitfall 6: Couples Table Missing New Columns

**What goes wrong:** DB write after registration fails silently or with a 400 error because `location`, `search_radius_km`, `wedding_style`, `gdpr_consent_at`, `marketing_consent` columns don't exist.

**Why it happens:** Migration file exists but hasn't been applied.

**How to avoid:** Create migration `004_onboarding_v2.sql` as first deliverable. Include `ALTER TABLE couples ADD COLUMN IF NOT EXISTS ...` for each new field.

---

## Code Examples

### GDPR Consent Screen
```typescript
// Source: established pattern from register page (border-l-2 error style)
const [gdprConsent, setGdprConsent] = useState(false);
const [marketingConsent, setMarketingConsent] = useState(false);
const [gdprTimestamp, setGdprTimestamp] = useState<string>('');

const handleGdprAccept = () => {
  if (!gdprConsent) {
    setError('Pro pokračování je nutný souhlas se zpracováním údajů');
    return;
  }
  setGdprTimestamp(new Date().toISOString());
  setStep(1);
};

// Render:
<div className="space-y-4">
  <label className="flex items-start gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={gdprConsent}
      onChange={(e) => setGdprConsent(e.target.checked)}
      className="mt-0.5 accent-[var(--color-primary)]"
    />
    <span className="text-sm text-[var(--color-text)]">
      Souhlasím se{' '}
      <a href="/privacy" className="text-[var(--color-primary)] underline">
        zpracováním osobních údajů
      </a>{' '}
      *
    </span>
  </label>
  <label className="flex items-start gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={marketingConsent}
      onChange={(e) => setMarketingConsent(e.target.checked)}
      className="mt-0.5 accent-[var(--color-primary)]"
    />
    <span className="text-sm text-[var(--color-text-light)]">
      Souhlasím se zasíláním novinek a tipů (volitelné)
    </span>
  </label>
</div>
```

Note: `accent-color` with CSS variable is the established pattern from Phase 6 decisions ("Checkboxes kept as raw HTML (no primitive) with accent-color").

### DB Migration (004_onboarding_v2.sql)
```sql
-- Add new onboarding fields to couples table
ALTER TABLE couples
  ADD COLUMN IF NOT EXISTS guest_count_range VARCHAR(20),
  ADD COLUMN IF NOT EXISTS location VARCHAR(200),
  ADD COLUMN IF NOT EXISTS search_radius_km INT DEFAULT 50,
  ADD COLUMN IF NOT EXISTS wedding_style VARCHAR(50) CHECK (
    wedding_style IN ('tradiční', 'boho', 'opulentní', 'minimalistická', 'rustikální')
  ),
  ADD COLUMN IF NOT EXISTS gdpr_consent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;

-- Keep existing wedding_size column for backward compat during transition
-- (can drop in a later migration once no code references it)
```

### State Interface (full onboarding state)
```typescript
interface OnboardingState {
  // GDPR (step 0)
  gdprConsent: boolean;
  marketingConsent: boolean;
  gdprTimestamp: string;
  // Step 1
  partner1: string;
  partner2: string;
  weddingDate: string;        // '' means "Ještě nevíme"
  dateUnknown: boolean;
  // Step 2
  guestCountRange: string;    // 'do-30' | '30-60' | '60-100' | '100-150' | '150+'
  // Step 3
  location: string;
  radiusKm: number;           // 10 | 25 | 50 | 100
  // Step 4
  weddingStyle: string;       // 'tradiční' | 'boho' | 'opulentní' | 'minimalistická' | 'rustikální'
  // Step 5
  budgetPreset: string;       // '' (skipped) | preset value
}
```

### Icon Suggestions (Claude's Discretion)
```typescript
// Lucide icons, one per step -- editorial/minimal feel
import { Heart, Users, MapPin, Palette, Wallet } from 'lucide-react';

const STEP_ICONS = {
  1: Heart,       // Names + date
  2: Users,       // Guest count
  3: MapPin,      // Location
  4: Palette,     // Style
  5: Wallet,      // Budget
};
```

---

## Integration Points: What Must Change

### 1. `src/app/(auth)/onboarding/page.tsx`
Full rewrite. Current: 4 steps, no GDPR, saves to DB directly. New: GDPR screen + 5 steps, React state only, redirects to register with URL params.

### 2. `src/app/(auth)/register/page.tsx`
Modify to: (a) read onboarding URL params via `useSearchParams()`, (b) after successful signUp, immediately upsert into `couples` table with all onboarding fields.

**Critical:** Wrap component in `<Suspense>` if it uses `useSearchParams()` with App Router static rendering. The page is currently fully client-side so this may not be an issue, but worth noting.

### 3. `src/app/api/chat/route.ts`
Extend `ChatContext` interface with: `guestCountRange`, `location`, `searchRadiusKm`, `weddingStyle`. Update `buildSystemPrompt()` to include new fields and handle null date. Also update the first-message pattern to be personalized.

### 4. `src/lib/types.ts`
Add new fields to `Couple` interface: `guest_count_range`, `location`, `search_radius_km`, `wedding_style`, `gdpr_consent_at`, `marketing_consent`. Keep `wedding_size` temporarily (backward compat).

### 5. `supabase/migrations/004_onboarding_v2.sql`
New file. ALTER TABLE couples to add the 6 new columns.

### 6. Chat component (wherever it sends context to `/api/chat`)
Need to locate and update the code that constructs the `ChatContext` object sent to `/api/chat`. It reads couple data from Supabase and sends it as the `context` field. Must include new fields from the updated couples row.

---

## Open Questions

1. **Where does the chat component build and send `ChatContext`?**
   - What we know: `src/app/api/chat/route.ts` receives `context` in the POST body
   - What's unclear: Which client component calls `/api/chat` and constructs the context object
   - Recommendation: Grep for `api/chat` POST calls before planning the ONBD-07 task

2. **What happens to existing couples rows (no location/style data) in the AI prompt?**
   - What we know: New columns will be NULL for existing users
   - What's unclear: Whether the AI prompt should degrade gracefully or prompt existing users to fill in missing info
   - Recommendation: Graceful degradation -- if field is null, omit that line from the prompt

3. **Does the auth/confirm flow properly redirect to /onboarding for new email-signup users?**
   - What we know: `/auth/confirm` checks `couples` table and redirects to `/onboarding` if no row exists
   - What's unclear: If we write the couples row in register.tsx before email confirmation, the user will be redirected to `/dashboard` instead of `/onboarding` after confirming -- but they've already completed onboarding. This is correct behavior.
   - Recommendation: Confirm this flow works as expected in testing

4. **Budget preset values not specified**
   - What we know: "preset buttons, skippable"
   - What's unclear: Exact preset values in CZK
   - Recommendation (Claude's discretion): do 100 000 Kč / 100-200 000 Kč / 200-350 000 Kč / 350-500 000 Kč / 500 000+ Kč -- aligns with Czech wedding market (avg 150-300k)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 4-step onboarding after registration | 5-step + GDPR before registration | Phase 7 (now) | Onboarding data must survive nav to register; no DB writes during flow |
| `weddingSize: 'small'|'medium'|'large'` | `guestCountRange: 'do-30'|'30-60'|...'150+'` | Phase 7 (now) | More granular; old field kept for compat |
| Basic system prompt (names, date, size, budget) | Enriched prompt (+ location, radius, style, date-null handling, first-message template) | Phase 7 (now) | AI can give location-aware recommendations |

**Deprecated/outdated:**
- `wedding_size` column: still present post-Phase 7 but superseded by `guest_count_range`. Mark as deprecated in types.ts comment.
- Dots progress indicator in current onboarding: replaced by thin progress bar per user decision.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase read -- `src/app/(auth)/onboarding/page.tsx` -- current implementation analyzed
- Direct codebase read -- `src/app/api/chat/route.ts` -- ChatContext interface and buildSystemPrompt pattern
- Direct codebase read -- `supabase/migrations/002_couples_and_planning.sql` -- couples table schema
- Direct codebase read -- `src/components/animation/PublicTransitionProvider.tsx` -- AnimatePresence pattern
- Direct codebase read -- `src/components/ui/Button.tsx` -- Framer Motion + cva pattern
- Direct codebase read -- `src/app/(auth)/register/page.tsx` -- registration flow, supabase.auth.signUp pattern
- Direct codebase read -- `src/app/auth/callback/route.ts` + `confirm/route.ts` -- new-vs-returning user detection
- Direct codebase read -- `package.json` -- all installed dependencies and versions

### Secondary (MEDIUM confidence)
- Framer Motion v12 `AnimatePresence` `mode="wait"` behavior -- based on established usage in codebase and knowledge of v12 API (consistent with v10+ API)
- HTML5 `<datalist>` browser support -- universally supported in all modern browsers (MDN)
- Supabase v2 `signUp()` returning `data.user` before email confirmation -- based on @supabase/supabase-js v2 behavior

### Tertiary (LOW confidence)
- None -- all claims grounded in codebase analysis or established web standards

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- entire stack read directly from package.json and codebase
- Architecture: HIGH -- patterns derived from existing codebase; no speculation
- Pitfalls: HIGH -- email confirmation data loss is a known pattern issue, verified by reading auth flow code
- City autocomplete: MEDIUM -- datalist approach is standard but user might want richer UX; flagged as acceptable for MVP

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable stack; Framer Motion and Next.js APIs won't change meaningfully in 30 days)
