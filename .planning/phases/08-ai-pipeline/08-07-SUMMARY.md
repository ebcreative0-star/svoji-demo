---
phase: 08-ai-pipeline
plan: 07
subsystem: api
tags: [intent-classifier, system-prompt, ai-pipeline, chat, nlp]

# Dependency graph
requires:
  - phase: 08-ai-pipeline
    provides: Three-way system prompt branching (actionResult / low-confidence / no-action) and few-shot classifier
provides:
  - Neutral base system prompt that does not prime AI to fabricate action confirmations
  - Confidence threshold lowered from 0.7 to 0.6 for borderline classifications
  - Detailed diagnostic logging of intent result and execution decision
  - 5 colloquial Czech few-shot examples for checklist_complete and budget_add
  - Two DULEZITE reinforcement rules before PRIKLADY section
affects: [08-ai-pipeline, UAT, intent-classification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Neutral base prompt with conditional confirmation -- base prompt never primes AI to confirm; only the appended AKCE PROVEDENA block triggers confirmation
    - Diagnostic logging with execution decision -- console.log includes both intent result AND whether action will fire

key-files:
  created: []
  modified:
    - src/app/api/chat/route.ts
    - src/lib/ai/intent-classifier.ts

key-decisions:
  - "Base system prompt AKCE A DATA section is now neutral -- removes unconditional Tvuj ukol je potvrdit akci which was priming Sonnet to fabricate confirmations"
  - "Confidence threshold lowered from 0.7 to 0.6 -- catches borderline classifications at 0.61-0.69 that were previously silently dropped"
  - "NIKDY nepotvrzuj guard added to base prompt -- reinforces that without an action result the AI must never confirm an action"
  - "5 colloquial Czech patterns added to classifier: Mame hotovo s X, X je zarizenej, Zaplaceno X za Y, Na X davame Y, Oznac X jako hotovy"
  - "Two DULEZITE rules added before PRIKLADY to reinforce checklist_complete and budget_add classification over small_talk/advice_request"

patterns-established:
  - "Conditional prompt injection: base prompt neutral, AKCE PROVEDENA block appended only when actionResult is truthy"
  - "Diagnostic gate logging: log both classification AND will-execute decision at same point in code"

requirements-completed: [AI-02]

# Metrics
duration: 15min
completed: 2026-03-02
---

# Phase 8 Plan 07: System Prompt Bias Fix and Classifier Expansion Summary

**Neutral buildSystemPrompt() removes action-confirmation priming, confidence threshold lowered to 0.6, and 5 colloquial Czech few-shot examples added for checklist_complete and budget_add**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-02T21:10:00Z
- **Completed:** 2026-03-02T21:25:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Refactored AKCE A DATA section in buildSystemPrompt() to remove unconditional "Tvuj ukol je potvrdit akci" -- base prompt is now neutral and conditions confirmation on receiving an action result
- Lowered confidence threshold from 0.7 to 0.6 in the action execution gate, preventing valid borderline classifications (0.61-0.69) from being silently dropped
- Replaced basic intent log with detailed diagnostic including JSON-stringified result and execution decision boolean
- Added 5 colloquial Czech few-shot examples targeting the failing intents (checklist_complete, budget_add) with patterns like "Mame hotovo s X" and "Zaplaceno X za Y"
- Added two DULEZITE classification reinforcement rules before PRIKLADY section

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor buildSystemPrompt and lower confidence threshold** - `e3e6225` (fix)
2. **Task 2: Expand few-shot examples with colloquial variants** - `9f1d94d` (absorbed into 08-08 commit -- changes verified present in HEAD)

## Files Created/Modified

- `src/app/api/chat/route.ts` - Neutral AKCE A DATA section, confidence threshold 0.6, detailed diagnostic log
- `src/lib/ai/intent-classifier.ts` - Two DULEZITE rules + 5 colloquial Czech examples for checklist_complete and budget_add

## Decisions Made

- The old unconditional prompt ("Tvuj ukol je potvrdit akci") was the root cause of AI fabrication -- it contradicted the ZADNA AKCE guard appended by the no-action branch. Fixed by making base prompt condition-agnostic.
- Threshold lowered to 0.6 rather than 0.5 to avoid misclassification noise while capturing real colloquial inputs that score 0.61-0.75.
- Diagnostic log placed before the confidence gate so both the raw result and the execution decision are visible in the same log line.

## Deviations from Plan

None - plan executed exactly as written. Task 2 changes were already present in HEAD (committed by 08-08 plan run), confirmed via git show HEAD and file content grep.

## Issues Encountered

Task 2 git commit returned "no changes to commit" because the 08-08 plan (run previously) had already committed the DULEZITE rules and colloquial examples to HEAD (9f1d94d). All required content was verified present in the working file via grep before concluding Task 2 complete.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Root causes for Gaps 1, 2, and 4 addressed: base prompt no longer contradicts ZADNA AKCE guard, threshold catches borderline inputs, classifier has broader coverage of colloquial Czech
- Ready for UAT re-test to verify "Odskrtni fotografa" and "Mame 50000 na catering" now trigger DB actions and honest confirmations
- Gap 3 (guest group add) addressed by plan 08-08

---
*Phase: 08-ai-pipeline*
*Completed: 2026-03-02*
