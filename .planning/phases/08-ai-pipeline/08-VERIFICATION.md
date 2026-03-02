---
phase: 08-ai-pipeline
verified: 2026-03-02T22:00:00Z
status: passed
score: 7/7 truths verified
uat_results:
  - test: "Checklist complete via colloquial phrasing"
    result: pass
  - test: "Budget add via colloquial phrasing"
    result: partial_pass
    note: "AI inserts correctly, shows in planned expenses. Category key mismatch fixed (ostatni→other) in 3959c7f."
  - test: "Multi-name guest add"
    result: pass
  - test: "Group assignment in guest add"
    result: pass
    note: "Side-effect: chat history truncated to last 50 messages on reload (pre-existing LIMIT 50, not phase 08 regression)"
  - test: "No-action honesty"
    result: pass
  - test: "Rate limit warning at 45"
    result: skipped
  - test: "Rate limit hard stop at 50"
    result: skipped
re_verification: true
  previous_status: gaps_found
  previous_score: 4/7
  gaps_closed:
    - "buildSystemPrompt() base text no longer contains action-confirmation instructions (old 'Tvuj ukol je potvrdit akci' removed)"
    - "Neutral AKCE A DATA section with NIKDY nepotvrzuj guard makes three-way branching effective"
    - "Confidence threshold lowered from 0.7 to 0.6 -- borderline classifications at 0.61-0.69 now trigger execution"
    - "checklist_complete: 5 diverse few-shot examples including colloquial patterns (Mame hotovo s X, X je zarizenej, Oznac X jako hotovy)"
    - "budget_add: 4 few-shot examples including colloquial patterns (Zaplaceno X za Y, Na X davame Y)"
    - "Two DULEZITE reinforcement rules before PRIKLADY section lock classification away from small_talk/advice_request"
    - "guest_add_multi intent added to MOZNE INTENTY list and isActionIntent() array"
    - "Group-aware guest_add examples (ze strany zenicha, rodina X)"
    - "Multi-name guest_add_multi examples (Marka Jana a Petra)"
    - "addGuests() bulk insert function in action-executor.ts with names[] array and optional group"
    - "guest_add_multi case wired in executeAction() switch"
    - "Diagnostic logging at confidence gate shows full intentResult and execution decision"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Checklist complete via colloquial phrasing"
    expected: "'Mame hotovo s fotografem' triggers checklist_complete, DB row updated (completed=true), AI confirms without fabricating"
    why_human: "Runtime classification behavior of Haiku 4.5 cannot be verified from static code analysis"
  - test: "Budget add via colloquial phrasing"
    expected: "'Mame 50000 na catering' inserts a budget_items row, AI confirms with correct amount"
    why_human: "Runtime classification behavior of Haiku 4.5 cannot be verified from static code analysis"
  - test: "Multi-name guest add"
    expected: "'Pozveme Marka, Janu a Petra' inserts 3 separate guest rows in DB"
    why_human: "Requires actual DB write to verify all 3 names are inserted, not just first"
  - test: "Group guest add"
    expected: "'Pozveme tetu Martu ze strany zenicha' inserts guest with group_name='strana zenicha'"
    why_human: "Requires DB inspection to verify group_name is populated"
  - test: "No-action honesty"
    expected: "'Jak sa mas?' gets friendly response with no action confirmation (base prompt guard effective)"
    why_human: "Requires real Sonnet response to verify guard works in practice with neutral base prompt"
  - test: "Rate limit warning at 45 messages"
    expected: "AI response #45 includes Czech warning about remaining messages (pluralization correct)"
    why_human: "Requires sending 45 real messages -- not testable from code"
  - test: "Rate limit hard stop at 50 messages"
    expected: "Message #51 returns 429 with 'Dnesni limit zprav (50) byl vycerpan. Zkus to zitra!'"
    why_human: "Requires sending 50 real messages -- not testable from code"
---

# Phase 8: AI Pipeline Verification Report (Re-verification #2)

**Phase Goal:** AI chat routes through Kilo gateway, classifies user intent for actions (checklist/budget/guest CRUD), and enforces rate limits

**Verified:** 2026-03-02T22:00:00Z

**Status:** passed

**Re-verification:** Yes -- after gap closure plans 08-07 and 08-08 (second re-verification)

---

## Re-verification Summary

Plans 08-07 and 08-08 addressed all 4 structural gaps identified in the previous VERIFICATION.md. All gap fixes are confirmed present in code. No regressions found. Static verification is now complete -- remaining items require runtime testing.

---

## Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | All chat messages route through Kilo gateway -- zero direct Claude API calls | VERIFIED | No @anthropic-ai/sdk import; createChatCompletion from @/lib/kilo used in route.ts line 219 |
| 2 | User can add a checklist item via natural chat | VERIFIED | checklist_add in isActionIntent(), executeAction() switch, addChecklistItem() does real DB insert |
| 3 | User can complete a checklist item via natural chat | VERIFIED | checklist_complete in isActionIntent(), 5 diverse few-shot examples, confidence threshold 0.6, completeChecklistItem() with ilike search + .update() |
| 4 | User can add a budget item via natural chat | VERIFIED | budget_add in isActionIntent(), 4 few-shot examples + 1 DULEZITE rule, addBudgetItem() does real DB insert |
| 5 | User can add a single guest via natural chat | VERIFIED | guest_add in isActionIntent(), addGuest() with group_name support |
| 6 | User can add multiple guests or assign to group via natural chat | VERIFIED | guest_add_multi intent defined, in isActionIntent(), 3 multi-name examples + 2 group-aware examples, addGuests() bulk insert with names[] array |
| 7 | AI only confirms actions that actually executed | VERIFIED | Old "Tvuj ukol je potvrdit akci" removed (grep returns 0), NIKDY nepotvrzuj guard in base prompt, three-way branching in place (AKCE PROVEDENA / NEPOTVRZUJ / ZADNA AKCE) |

**Score:** 7/7 truths verified (static analysis)

**Runtime verification pending** -- see Human Verification section.

---

## Gap Closure Verification (Plans 08-07 and 08-08)

### Gap 1 (checklist_complete) + Gap 2 (budget_add): Root causes fixed

| Fix | File | Verified |
|-----|------|---------|
| "Tvuj ukol je potvrdit akci" removed from base | src/app/api/chat/route.ts | grep returns 0 matches |
| NIKDY nepotvrzuj guard in base AKCE A DATA | src/app/api/chat/route.ts | Line 93 confirmed |
| Confidence threshold lowered from 0.7 to 0.6 | src/app/api/chat/route.ts | Line 189: intentResult.confidence > 0.6 |
| Diagnostic logging at confidence gate | src/app/api/chat/route.ts | Line 185: full JSON + execution decision |
| 5 checklist_complete few-shot examples | src/lib/ai/intent-classifier.ts | grep count = 5 |
| 4 budget_add few-shot examples | src/lib/ai/intent-classifier.ts | grep count = 4 |
| 2 DULEZITE reinforcement rules | src/lib/ai/intent-classifier.ts | Lines 54-55 confirmed |

### Gap 3 (guest group + multi-name): Fully implemented

| Fix | File | Verified |
|-----|------|---------|
| guest_add_multi in MOZNE INTENTY | src/lib/ai/intent-classifier.ts | Line 28 confirmed |
| guest_add_multi in isActionIntent() | src/lib/ai/intent-classifier.ts | Present in actionIntents array |
| 3 multi-name few-shot examples | src/lib/ai/intent-classifier.ts | Lines 83-89 confirmed |
| 2 group-aware guest_add examples | src/lib/ai/intent-classifier.ts | Lines 77-80 confirmed |
| Multi-name and group detection rules in PRAVIDLA | src/lib/ai/intent-classifier.ts | Lines 52-53 confirmed |
| addGuests() bulk insert function | src/lib/ai/action-executor.ts | Lines 372-407 confirmed |
| guest_add_multi case in executeAction() switch | src/lib/ai/action-executor.ts | Lines 45-46 confirmed |

### Gap 4 (AI fabrication): Root cause fixed

The previous VERIFICATION.md identified the root cause as buildSystemPrompt() base text unconditionally instructing Sonnet to confirm actions. This is fixed:

- Old text "Tvuj ukol je potvrdit akci a rict co bylo udelano" -- removed (0 occurrences in grep)
- New base: "Pokud NEDOSTANES informaci o provedene akci, NIKDY nepotvrzuj ze jsi neco pridal/zmenil/smazal"
- Three-way branching (AKCE PROVEDENA / NEPOTVRZUJ / ZADNA AKCE) now functions without contradiction from the base

---

## Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| src/lib/kilo.ts | VERIFIED | Kilo Gateway client, createChatCompletion() |
| src/app/api/chat/route.ts | VERIFIED | Neutral base prompt, confidence threshold 0.6, three-way branching, rate limit, demand logger |
| src/lib/ai/intent-classifier.ts | VERIFIED | 19 total few-shot examples, 10 action intents including guest_add_multi, 2 DULEZITE rules, temperature 0.1 |
| src/lib/ai/action-executor.ts | VERIFIED | All 10 action handlers including addGuests() bulk insert |
| src/lib/ai/demand-logger.ts | VERIFIED | Fire-and-forget, no throw |
| src/lib/rate-limit.ts | VERIFIED | checkAndIncrementChatLimit() wired to increment_chat_count RPC |
| supabase/migrations/005_demand_signals.sql | VERIFIED | File exists, applied per 08-06-SUMMARY |
| supabase/migrations/006_rate_limits.sql | VERIFIED | File exists, applied per 08-06-SUMMARY |

---

## Key Link Verification

| From | To | Via | Status |
|------|-----|-----|--------|
| chat route | Kilo client | createChatCompletion() | WIRED |
| chat route | intent classifier | classifyIntent() | WIRED |
| chat route | action executor | executeAction() when confidence > 0.6 | WIRED |
| chat route | rate limiter | checkAndIncrementChatLimit() | WIRED |
| chat route | demand logger | logDemandSignal() fire-and-forget | WIRED |
| intent classifier | Kilo API | fetch to api.kilo.ai with haiku-4.5 | WIRED |
| action executor | Supabase guests | addGuests() bulk insert for guest_add_multi | WIRED |
| action executor | Supabase checklist | ilike search + .update(completed=true) | WIRED |
| action executor | Supabase budget | .insert() for budget_add | WIRED |
| buildSystemPrompt | action confirmation | conditional append only (no base priming) | WIRED |

---

## Requirements Coverage

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| AI-01 | AI chat routed through Kilo gateway, no direct Claude API calls | SATISFIED | No @anthropic-ai/sdk; createChatCompletion from kilo.ts used exclusively |
| AI-02 | Intent classification with CRUD actions via natural chat | SATISFIED (static) | All 10 action intents implemented end-to-end; runtime behavior needs UAT |
| AI-03 | Rate limiting with warning and midnight reset | SATISFIED (static) | checkAndIncrementChatLimit() in route, rateLimit.warning appends pluralized Czech message, 429 on limit exceeded; runtime needs UAT |

---

## Anti-Patterns Found

None. The previous blockers have been resolved:

- Old action-confirmation priming: removed
- Confidence threshold silent skip: fixed (0.6 with diagnostic log)
- Missing guest group examples: fixed

No new anti-patterns introduced by 08-07 or 08-08.

---

## Human Verification Required

### 1. Checklist complete via colloquial phrasing

**Test:** With a checklist item named "fotograf" in DB, send "Mame hotovo s fotografem" via chat
**Expected:** DB row updated (completed=true, completed_at set). AI response confirms without inventing other actions.
**Why human:** Haiku 4.5 runtime classification behavior cannot be verified from static code.

### 2. Budget add via colloquial phrasing

**Test:** Send "Mame 50000 na catering" via chat
**Expected:** New row in budget_items (name="catering", estimated_cost=50000). AI confirms with amount.
**Why human:** Haiku 4.5 runtime classification behavior cannot be verified from static code.

### 3. Multi-name guest add

**Test:** Send "Pozveme Marka, Janu a Petra" via chat
**Expected:** 3 separate rows in guests table (Marek, Jana, Petr), all with rsvp_status=pending
**Why human:** Requires actual DB write to verify all 3 names inserted, not just first.

### 4. Group assignment in guest add

**Test:** Send "Pozveme tetu Martu ze strany zenicha" via chat
**Expected:** 1 row in guests (name="Marta", group_name="strana zenicha")
**Why human:** Requires DB inspection to verify group_name is populated.

### 5. No-action honesty (AI fabrication guard)

**Test:** Send "Ahoj, jak se mas?" via chat (no action intent)
**Expected:** Friendly response, no mention of having added/changed/deleted anything
**Why human:** Requires Sonnet runtime response to verify the neutral base prompt + ZADNA AKCE guard holds.

### 6. Rate limit warning at 45 messages

**Test:** Send 45 messages in one day via chat interface. Observe message #45 response.
**Expected:** Response appends Czech warning "Zbyva ti uz jen 5 zprav dnes. Limit se obnovi o pulnoci."
**Why human:** Requires 45 real API calls.

### 7. Rate limit hard stop at 50 messages

**Test:** Send 51 messages in one day.
**Expected:** Message #51 returns 429 status with "Dnesni limit zprav (50) byl vycerpan. Zkus to zitra!"
**Why human:** Requires 50 real API calls.

---

## Summary

All 4 structural gaps from the previous verification are closed:

- **Gap 1 (checklist_complete):** Root cause addressed -- neutral base prompt, confidence threshold 0.6, 5 diverse few-shot examples, 1 DULEZITE rule
- **Gap 2 (budget_add):** Same root cause addressed -- 4 few-shot examples, 1 DULEZITE rule
- **Gap 3 (guest group/multi-name):** guest_add_multi intent fully implemented -- classifier, action executor, route all wired
- **Gap 4 (AI fabrication):** Root cause removed -- old "Tvuj ukol je potvrdit akci" deleted, base prompt now neutral with NIKDY nepotvrzuj guard

The codebase is structurally complete. Whether the runtime fixes hold (Haiku correctly classifying colloquial Czech, Sonnet honoring the guard) requires live UAT testing. Static analysis confirms the mechanism is correct.

---

_Verified: 2026-03-02T22:00:00Z_
_Verifier: Claude (gsd-verifier)_
_Mode: Re-verification #2 (previous status: gaps_found, previous score: 4/7)_
