# Codebase Concerns

**Analysis Date:** 2026-02-28

## Tech Debt

**Demo Mode Hardcoded in Production:**
- Issue: `isDemoMode` in `src/lib/demo-data.ts` always returns `true`, and layout file `src/app/(dashboard)/layout.tsx` has hardcoded `const isDemoMode = true`
- Files: `src/lib/demo-data.ts:86-88`, `src/app/(dashboard)/layout.tsx:6-7`
- Impact: Authentication and database queries in dashboard are completely bypassed. All users see demo data, no real data is persisted. Production users cannot have separate data.
- Fix approach: Remove hardcoded demo mode, implement proper environment-based flag. Switch to production auth flow after onboarding is verified.

**Missing Anthropic API Key Handling:**
- Issue: Chat feature silently fails if `ANTHROPIC_API_KEY` is not configured. Shows warning at startup but gracefully degrades to 503 error
- Files: `src/app/api/chat/route.ts:5-12, 88-94`
- Impact: Chat feature is unavailable in any environment where API key is not set. Users see error instead of feature working. No fallback to local model or placeholder.
- Fix approach: Add clear configuration validation during build. Either require the key for production or implement client-side fallback. Document as required for production deployment.

**Checklist Generator Invokes Non-Existent Edge Function:**
- Issue: Onboarding tries to call `supabase.functions.invoke('generate-checklist')` which doesn't exist. Silently fails with client-side fallback
- Files: `src/app/(auth)/onboarding/page.tsx:76-88`
- Impact: Checklist generation works only on client side after first page load. No server-side persistence of checklist during onboarding. Race condition if user refreshes page before checklist loads client-side.
- Fix approach: Either create the Edge Function in Supabase, or move checklist generation to API endpoint. Store checklist in DB immediately after onboarding completes.

## Known Bugs

**Console.log Left in Production Code:**
- Symptoms: Log output appears in server logs
- Files: `src/app/(auth)/onboarding/page.tsx:86`
- Trigger: When onboarding completes and edge function is unavailable
- Workaround: None - logs are informational
- Fix: Remove console.log, use proper error tracking instead

**RSVP Dual-Table Storage:**
- Symptoms: RSVP responses may be stored in either `guests` or `rsvp_responses` table depending on whether `websiteId` is provided
- Files: `src/app/api/rsvp/route.ts:32-115`
- Trigger: When website publishes its RSVP form with/without websiteId
- Impact: Query complexity for RSVP reports - must check both tables. Potential data duplication if both flows used on same wedding.
- Fix approach: Migrate all RSVP to single `guests` table. Remove `rsvp_responses` fallback entirely. Require `websiteId` in RSVP endpoint.

## Security Considerations

**Supabase Credentials as Placeholders:**
- Risk: Default placeholder values in `src/lib/supabase/server.ts:4-5` will be visible in browser if env vars not set. Could leak false confidence about security.
- Files: `src/lib/supabase/server.ts:4-5`
- Current mitigation: Env vars are used when set, placeholders only appear if empty
- Recommendations: Add build-time validation that throws error if `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set in production. Use TypeScript assertion to prevent accidental placeholder usage.

**No Rate Limiting on Chat API:**
- Risk: Users can send unlimited messages to Claude API, incurring unbounded costs. No throttling, no quota per user.
- Files: `src/app/api/chat/route.ts`
- Current mitigation: None
- Recommendations: Add rate limiting (e.g., 5 messages per minute per user). Implement token-based quota system. Monitor API costs. Add warning in UI when approaching limit.

**Weak RSVP Email Validation:**
- Risk: Email field in RSVP is validated with `z.email()` but only at schema level. No email confirmation or verification flow. Spam easily added.
- Files: `src/app/api/rsvp/route.ts:8`
- Current mitigation: Zod validation only
- Recommendations: Add email confirmation step. Implement CAPTCHA on public RSVP form. Block disposable email domains. Implement duplicate detection (same name + email = update, not insert).

**Chat History Accessible by Any Authenticated User:**
- Risk: Chat API checks `user.id === coupleId` but history fetch loads only last 10 messages. No query filtering verification on the history itself.
- Files: `src/app/api/chat/route.ts:107-143`
- Current mitigation: User ID check at endpoint level
- Recommendations: Add explicit filtering of chat history by couple_id in Supabase query. Add audit logging for API calls.

## Performance Bottlenecks

**Settings Page Loads All Couple & Website Data Without Caching:**
- Problem: Settings page calls `supabase.from('couples').select('*')` and `supabase.from('wedding_websites').select('*')` on every mount with no caching
- Files: `src/app/(dashboard)/settings/page.tsx:57-82`
- Cause: No React Query or SWR. State updates trigger re-render and re-fetch on every focus.
- Improvement path: Implement data caching with React Query or SWR. Cache couple data in local state. Prefetch on dashboard load.

**Chat History Reversal in Memory:**
- Problem: Fetches last 10 messages desc, then reverses array in client to get chronological order. Array reversal on every message send.
- Files: `src/app/api/chat/route.ts:136-142`
- Cause: Supabase doesn't have `DESC` option on select, so manual reversal needed
- Improvement path: Order by `created_at ASC` in query instead of DESC, eliminate reverse() call. Or implement message pagination with cursor-based approach.

**Settings Page Blocks on Load Until All Data Fetches:**
- Problem: `loadData()` fetches both couple and website sequentially, then sets loading to false. No progressive loading or skeletons.
- Files: `src/app/(dashboard)/settings/page.tsx:49-85`
- Cause: Sequential fetch without Promise.all, loading state blocks entire page
- Improvement path: Fetch in parallel with Promise.all. Render skeletons for each section independently. Show couple settings while website loads.

**Large Checklist Rendered Without Virtualization:**
- Problem: ChecklistView renders all items in array, even if user scrolls past them. 30+ items all in DOM.
- Files: `src/components/dashboard/ChecklistView.tsx`
- Cause: No virtual scrolling or pagination implemented
- Improvement path: Implement react-window or similar. Show 20 items initially, lazy-load more on scroll. Or paginate by deadline (this week, next week, etc).

## Fragile Areas

**Checklist Generation with Floating Point Date Math:**
- Files: `src/lib/checklist-generator.ts:341-357`
- Why fragile: Uses `differenceInMonths()` and `subMonths()` to calculate deadlines. Floating point math on dates (0.5 months = 2 weeks) can produce unexpected results across month boundaries. Tasks scheduled for "0.1 months before" may land on wrong day.
- Safe modification: Add extensive date tests. Test across different months and years. Consider using fixed week offsets instead of months for short timelines.
- Test coverage: No tests found for checklist generation logic. High risk of subtle bugs.

**RSVP Fallback Table Relationship:**
- Files: `src/app/api/rsvp/route.ts:96-115`
- Why fragile: Code tries primary path first (guests table), fallback to rsvp_responses if websiteId missing. Creates silent data divergence. Different business logic paths depending on request format.
- Safe modification: Require websiteId in all RSVP requests. Remove fallback entirely. Test all code paths systematically.
- Test coverage: No tests for RSVP endpoint logic.

**Hardcoded Claude Model Version:**
- Files: `src/app/api/chat/route.ts:150`
- Why fragile: Model hardcoded as `'claude-sonnet-4-20250514'`. If Anthropic deprecates this model, API fails with no fallback.
- Safe modification: Move model to env var with fallback default. Add error handling for model not found. Monitor Anthropic deprecation notices.
- Test coverage: No tests for API fallbacks.

**Demo Data Bypasses All Validation:**
- Files: `src/app/(dashboard)/layout.tsx`, `src/lib/demo-data.ts`
- Why fragile: Demo mode skips authentication entirely. If auth logic changes, demo path not affected. Real and demo flows diverge over time.
- Safe modification: Keep demo mode, but run same auth/data loading pipeline. Use mock database instead of skipping checks.
- Test coverage: No tests for demo mode flow vs real flow.

## Scaling Limits

**Single Couple ID = User ID Model:**
- Current capacity: Works for one couple per user account
- Limit: No support for multiple couples per user, team collaboration, or wedding planner accounts managing multiple weddings
- Scaling path: Add explicit couple management table. Allow multiple couples per user with role-based access (admin, viewer, organizer). Implement team invitations.

**Chat Message History Limited to 10 Messages:**
- Current capacity: Only last 10 messages kept in context for Claude API
- Limit: Chat loses context after 10 messages. Long conversations become disjointed.
- Scaling path: Implement message pagination or semantic search. Use vector embeddings to find relevant past messages. Implement conversation threads or topic tagging.

**Supabase Free Tier Limits:**
- Current capacity: 500MB DB, 1GB storage, 50k auth users
- Limit: For 100+ active couples, will hit DB/storage limits within months
- Scaling path: Implement scheduled database cleanup. Archive old chat histories. Compress gallery images. Implement image resizing on upload. Monitor quota usage actively.

## Dependencies at Risk

**Anthropic SDK May Break on API Changes:**
- Risk: Using `@anthropic-ai/sdk ^0.78.0` with caret dependency. Major version changes could break chat feature.
- Impact: Chat feature becomes unavailable if SDK updates with breaking changes
- Migration plan: Pin to exact version `0.78.0` initially. Test all SDK updates before deploying. Monitor changelog monthly. Have fallback to REST API calls if SDK breaks.

**Supabase Auth Middleware Deprecation Warning:**
- Risk: Code shows deprecation warning about middleware usage in Next.js 16. Supabase expects proxy instead.
- Impact: Authentication may break in Next.js 17+
- Migration plan: Migrate from middleware to next.config.ts rewrites/proxies before Next.js 17 release.

## Missing Critical Features

**No Email Notifications:**
- Problem: No emails sent to couple when RSVP submitted, no reminders for checklist tasks, no confirmations
- Blocks: Cannot inform couple of guest responses without manual website checking
- Priority: HIGH - Critical for wedding planning workflow

**No Admin Verification of Couple Registration:**
- Problem: Any email can register and immediately create a couple account. No email confirmation required.
- Blocks: Spam accounts can create couples with fake data. No way to contact couple before dashboard access.
- Priority: HIGH - Security and spam prevention

**No Data Export/Backup:**
- Problem: No way to export couple data, guest list, budget, or chat history. Single point of failure if Supabase account compromised.
- Blocks: Couples cannot transfer their data elsewhere or maintain local backup
- Priority: MEDIUM - Legal/compliance issue for production

**No Guest Management UI:**
- Problem: Guests imported only via RSVP form. No way to manually add invited guests, mark RSVPs from phone calls, or manage groups.
- Blocks: Workflow incomplete for large weddings
- Priority: MEDIUM - Core feature gap

## Test Coverage Gaps

**Chat API Not Tested:**
- What's not tested: Claude API integration, context building, message history logic, auth checks, error handling
- Files: `src/app/api/chat/route.ts`
- Risk: Breaking changes not caught until production. API key missing not noticed until first real user request.
- Priority: HIGH

**RSVP Endpoint Not Tested:**
- What's not tested: Both storage paths (guests vs rsvp_responses), validation logic, duplicate detection, error scenarios
- Files: `src/app/api/rsvp/route.ts`
- Risk: Dual table storage can cause data consistency issues
- Priority: HIGH

**Checklist Generation Not Tested:**
- What's not tested: Date calculation logic, priority adjustment, filtering by wedding size, edge cases (wedding < 1 month away)
- Files: `src/lib/checklist-generator.ts`
- Risk: Silent date math errors create wrong deadlines
- Priority: HIGH

**Auth Flow Not Tested:**
- What's not tested: Registration, login, onboarding redirect, unauthorized access, session expiration
- Files: `src/app/(auth)/*`, `src/lib/supabase/*`
- Risk: Critical path breaks silently. Demo mode hides real issues.
- Priority: HIGH

**Dashboard Components Not Tested:**
- What's not tested: State management, data loading, form submission, error handling in BudgetView, GuestsView, ChecklistView, ChatInterface
- Files: `src/components/dashboard/*`
- Risk: UI bugs only found in manual testing or production
- Priority: MEDIUM

**No E2E Tests:**
- What's not tested: Full user flows (register -> onboard -> add guests -> RSVP -> view in chat)
- Risk: Integration bugs between features not caught
- Priority: MEDIUM

---

*Concerns audit: 2026-02-28*
