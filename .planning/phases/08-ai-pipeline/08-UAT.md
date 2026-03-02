---
status: diagnosed
phase: 08-ai-pipeline
source: [08-01-SUMMARY.md, 08-02-SUMMARY.md, 08-03-SUMMARY.md]
started: 2026-03-02T18:00:00Z
updated: 2026-03-02T19:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. AI Chat Response via Kilo Gateway
expected: Send a message in chat. AI responds in Czech within a few seconds, no errors.
result: issue
reported: "403 error - client sent demo coupleId because DEMO_MODE=true in .env.local. After disabling demo mode, chat works."
severity: major

### 2. Checklist Add via Chat
expected: Say "Pridej fotografa do checklistu" in chat. AI confirms the action in Czech. Check the checklist page - "fotograf" item should appear.
result: issue
reported: "Intent classifier used invalid model ID (claude-haiku-4.0), then returned JSON wrapped in markdown code fences. After fixing both, checklist_add works when phrased specifically."
severity: major

### 3. Checklist Complete via Chat
expected: Say "Odskrtni fotografa". AI confirms. Checklist page shows item as completed.
result: issue
reported: "AI potvrzuje a reaguje ale nic se nestalo. Intent classified as small_talk instead of checklist_complete. AI fabricated confirmation without actually executing the action."
severity: major

### 4. Budget Add via Chat
expected: Say "Mame 50000 na catering" in chat. AI confirms. Budget page shows a catering item with 50000 Kc.
result: skipped
reason: Intent classification unreliable - same root cause as test 3

### 5. Guest Add via Chat
expected: Say "Pozveme tetu Martu" in chat. AI confirms. Guest list page shows "Marta" with pending RSVP.
result: skipped
reason: Intent classification unreliable - same root cause as test 3

### 6. AI Acknowledges Actions Naturally
expected: When AI performs an action, it confirms in natural Czech without technical jargon.
result: issue
reported: "AI confirms actions in natural Czech BUT also confirms actions it never performed. System prompt tells AI to confirm, so it fabricates confirmations even when intent classification fails."
severity: blocker

### 7. Rate Limit Warning
expected: After sending 45+ messages in one day, a warning appears in the AI response.
result: skipped
reason: Migration 006_rate_limits.sql not applied - increment_chat_count function missing from DB. Rate limit check fails silently.

### 8. Rate Limit Block
expected: After 50 messages, error returned saying daily limit reached.
result: skipped
reason: Same as test 7 - migration not applied

## Summary

total: 8
passed: 0
issues: 4
pending: 0
skipped: 4

## Gaps

- truth: "Chat works out of the box for authenticated users"
  status: failed
  reason: "User reported: 403 error because DEMO_MODE=true sent demo coupleId for real auth user"
  severity: major
  test: 1
  root_cause: "NEXT_PUBLIC_DEMO_MODE=true in .env.local, chat page serves demo couple data even for logged-in users"
  artifacts:
    - path: "src/app/(dashboard)/chat/page.tsx"
      issue: "isDemoMode() check takes priority over real auth"
  missing:
    - "Set DEMO_MODE=false or remove demo mode check when user is authenticated"

- truth: "Intent classifier correctly identifies user intents"
  status: failed
  reason: "User reported: invalid model ID (claude-haiku-4.0), then JSON parsing fails on markdown code fences"
  severity: major
  test: 2
  root_cause: "1) Model ID 'anthropic/claude-haiku-4.0' does not exist on Kilo Gateway. 2) Haiku returns JSON wrapped in ```json code fences, JSON.parse fails"
  artifacts:
    - path: "src/lib/ai/intent-classifier.ts"
      issue: "Wrong model ID and no code fence stripping"
  missing:
    - "Use anthropic/claude-haiku-4.5 model ID"
    - "Strip markdown code fences before JSON.parse"

- truth: "Intent classification is reliable across common phrasings"
  status: failed
  reason: "User reported: checklist_complete classified as small_talk, budget_add classified as advice_request. AI confirmed actions that never executed."
  severity: blocker
  test: 3
  root_cause: "Haiku 4.5 classification prompt may need few-shot examples or stricter output format. AI system prompt tells it to 'confirm actions' without verifying action actually succeeded, so AI fabricates confirmations."
  artifacts:
    - path: "src/lib/ai/intent-classifier.ts"
      issue: "Classification unreliable for common Czech phrasings"
    - path: "src/app/api/chat/route.ts"
      issue: "System prompt tells AI to confirm actions even when no action was executed"
  missing:
    - "Add few-shot examples to classification prompt"
    - "Only inject action confirmation into system prompt when actionResult is non-null AND successful"
    - "Consider using Sonnet for classification or structured output"

- truth: "Rate limiting enforces 50 messages/day with warning at 45"
  status: failed
  reason: "increment_chat_count function not found in DB schema cache - migration 006 not applied"
  severity: major
  test: 7
  root_cause: "Supabase migrations 005_demand_signals.sql and 006_rate_limits.sql were never applied to the running instance"
  artifacts:
    - path: "supabase/migrations/006_rate_limits.sql"
      issue: "Migration exists but not deployed"
  missing:
    - "Apply migrations to Supabase instance"
