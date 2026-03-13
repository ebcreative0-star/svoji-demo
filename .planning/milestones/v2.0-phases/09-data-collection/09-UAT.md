---
status: complete
phase: 09-data-collection
source: [09-01-SUMMARY.md, 09-02-SUMMARY.md, 09-03-SUMMARY.md]
started: 2026-03-03T21:30:00Z
updated: 2026-03-03T21:50:00Z
---

## Current Test

[testing complete]

## Tests

### 1. UTM Capture on Landing Page
expected: Visit the landing page with UTM params in URL (e.g. /?utm_source=test&utm_medium=social&utm_campaign=demo). Open browser DevTools > Application > Local Storage. You should see a `svoji_utm` key containing a JSON object with utm_source, utm_medium, utm_campaign matching the URL params.
result: pass

### 2. AI Chat Still Works (Message Sent Logging)
expected: Open the AI chat in the dashboard. Send a message. The AI should respond normally. The engagement logging happens silently in the background and should not affect chat behavior at all.
result: pass

### 3. Checklist Item Completion Tracking
expected: Open the checklist in the dashboard. Toggle a checklist item to completed. The item should toggle normally with no delay or errors. A background tracking request fires to /api/track but is invisible to the user. Toggling back to incomplete should also work fine.
result: pass

### 4. Admin Stats Endpoint
expected: Call GET /api/admin/stats with header X-Admin-Key set to the value from .env.local ADMIN_API_KEY. Should return JSON with totals (demand_signals count, engagement_events count, utm_users count), top categories array, and daily breakdown array. Without the key or wrong key, should return 401.
result: pass

### 5. Track API Rejects Invalid Events
expected: POST to /api/track with body {"eventType": "message_sent"} should return 400 (message_sent is server-only). POST with {"eventType": "checklist_item_completed"} should pass validation (returns 401 without auth, 200 with auth).
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
