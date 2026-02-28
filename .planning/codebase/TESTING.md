# Testing Patterns

**Analysis Date:** 2026-02-28

## Test Framework

**Status:** Not configured

**No testing infrastructure detected:**
- No Jest config found
- No Vitest config found
- No test scripts in `package.json`
- No `.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx` files in `src/`
- Node modules contain testing libraries for dependencies (Zod) but not project

**Recommendation:**
Before adding tests, establish testing infrastructure:
1. Choose framework (Jest or Vitest recommended for Next.js)
2. Add config files
3. Create test file structure
4. Add test scripts to `package.json`

## Current State: No Automated Testing

The codebase has zero automated test coverage. All validation and correctness relies on:
- TypeScript type checking (`strict: true` in `tsconfig.json`)
- ESLint linting
- Manual testing during development
- Runtime error handling

## Testing Strategy Recommendations

### High Priority - Add Tests For

**1. API Routes** (`src/app/api/*/route.ts`)
- Auth validation in `/api/chat` - verifies user owns coupleId
- Input validation and error handling
- Database operation error cases
- Mock Supabase and Anthropic clients

**2. Business Logic** (`src/lib/`)
- `checklist-generator.ts` - task template filtering, due date calculation
- Supabase client initialization
- Type definitions accuracy

**3. Components with State** (`src/components/`)
- `ChatInterface.tsx` - message handling, optimistic updates
- `ChecklistView.tsx` - filtering, grouping, toggle operations
- `BudgetView.tsx` - calculations (total estimated, spent, remaining)
- `GuestsView.tsx` - guest operations

### Medium Priority

**Form Pages:**
- `src/app/(auth)/login/page.tsx` - demo credentials, error handling
- `src/app/(auth)/register/page.tsx` - validation
- `src/app/(auth)/onboarding/page.tsx` - multi-step form state

### Lower Priority (UI/Layout)

- Landing page components - visual regression testing would be more valuable
- Section components - integration tests if they become complex

## Integration Points Needing Tests

**Supabase Calls:**
- All client operations in components
- Server operations in API routes
- Authentication flows

**External APIs:**
- Anthropic Claude API in `/api/chat`
- Error handling when API key missing

**Data Flow:**
- Optimistic updates vs server state
- Concurrent operations
- Error recovery

## Current Error Handling (Reference for Tests)

All error handling is manual and synchronous:

**API Routes Pattern:**
```typescript
try {
  // Validation
  if (!parameter) {
    return NextResponse.json({ error: 'Message' }, { status: 400 });
  }

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Permission check
  if (user.id !== coupleId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Operation
  const result = await operation();
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  console.error('Context:', error);
  return NextResponse.json({ error: 'Server error' }, { status: 500 });
}
```

**Client Components Pattern:**
```typescript
try {
  const response = await fetch('/api/endpoint', { ... });

  if (!response.ok) {
    throw new Error('Error message');
  }

  const data = await response.json();
  setData(data);
} catch (error) {
  console.error('Operation error:', error);
  setError('User-facing error message');
}
```

## Validation Approach

**Current:**
- Zod imported but not systematically used
- Manual validation in components
- Runtime error messages in Czech

**Example Validation in API Route:**
```typescript
// Manual validation
if (!message || !coupleId || !context) {
  return NextResponse.json(
    { error: 'Missing required parameters' },
    { status: 400 }
  );
}
```

**Checklist Item Validation (Client):**
```typescript
// No validation schema, just field presence check
if (!newItem.name) return;
```

## Data Flow Patterns (Test Coverage Gaps)

**Optimistic Updates:**
Located in `ChecklistView.tsx` and `BudgetView.tsx`:
```typescript
// Update local state immediately
setItems((prev) => [...prev, newItem]);

// Sync with server in background
startTransition(async () => {
  await supabase.from('table').update({...}).eq('id', id);
});
```

**No rollback mechanism if server operation fails** - test gap

**Message Management in Chat:**
```typescript
// Add temp user message, then assistant message
const tempUserMsg = { id: `temp-${Date.now()}`, ... };
setMessages((prev) => [...prev, tempUserMsg]);

// Get response
const data = await fetch('/api/chat', {...});

// Add assistant response
const assistantMsg = { id: `temp-${Date.now()}-assistant`, ... };
setMessages((prev) => [...prev, assistantMsg]);
```

**Error message replaces message if fetch fails** - should test error state UI

## Files Needing Test Coverage

**Critical (business logic):**
- `src/lib/checklist-generator.ts` (416 lines) - generates task templates based on wedding date/size
- `src/app/api/chat/route.ts` (173 lines) - Claude API integration with auth
- `src/app/api/rsvp/route.ts` - database operations

**Important (data handling):**
- `src/components/dashboard/ChecklistView.tsx` (366 lines) - filtering, grouping, toggle
- `src/components/dashboard/BudgetView.tsx` (277 lines) - calculation logic
- `src/components/dashboard/ChatInterface.tsx` (231 lines) - message state management

**Configuration:**
- `src/lib/supabase/client.ts` - client initialization
- `src/lib/supabase/server.ts` - server initialization
- `src/lib/types.ts` - database type correctness

## Environment Variables for Tests

**Required in test environment:**
- `NEXT_PUBLIC_SUPABASE_URL` - mock or test Supabase instance
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - test key
- `ANTHROPIC_API_KEY` - mock/stub for API tests
- `ANTHROPIC_API_KEY` should be optional and gracefully handle missing config

## Suggested Testing Tools

**Framework choices:**
- Jest: Official Next.js testing framework, battle-tested
- Vitest: Faster, but less Next.js-specific tooling

**Component testing:**
- React Testing Library: Already Next.js ecosystem standard
- @testing-library/react-hooks: For React hooks testing

**API route testing:**
- Supertest: HTTP assertions for route handlers
- MSW (Mock Service Worker): Mock external APIs

**Database testing:**
- Supabase test utilities if available
- Mock supabase-js client with Jest mocks

**Type testing:**
- Could use tsd or similar for exported types

## Test Structure Template

**Location:** Co-located with source files
```
src/
├── components/
│   ├── dashboard/
│   │   ├── ChatInterface.tsx
│   │   └── ChatInterface.test.tsx
│   └── ...
├── app/
│   └── api/
│       └── chat/
│           ├── route.ts
│           └── route.test.ts
└── lib/
    ├── checklist-generator.ts
    └── checklist-generator.test.ts
```

**Naming convention:**
- Filename: `[component].test.ts` or `[module].test.ts`
- Suite name matches component/module name

## Potential Test Examples (Once Framework Added)

**API Route Tests (pseudo-code):**
```typescript
describe('POST /api/chat', () => {
  it('returns 400 for missing parameters', async () => {
    const response = await request(handler).post('/api/chat').send({});
    expect(response.status).toBe(400);
  });

  it('returns 401 for unauthenticated requests', async () => {
    // Mock supabase.auth.getUser() to return null
  });

  it('returns 403 for unauthorized coupleId', async () => {
    // User ID doesn't match coupleId
  });

  it('calls Claude API with system prompt', async () => {
    // Mock Anthropic client, verify buildSystemPrompt called correctly
  });
});
```

**Component State Tests (pseudo-code):**
```typescript
describe('ChatInterface', () => {
  it('adds message optimistically then from server', async () => {
    const { getByRole } = render(
      <ChatInterface couple={mockCouple} initialMessages={[]} />
    );

    const input = getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test message' } });
    fireEvent.click(getByRole('button', { name: /send/i }));

    // Verify optimistic message appears immediately
    expect(getByText('test message')).toBeInTheDocument();

    // Wait for server response
    await waitFor(() => {
      expect(getByText(/assistant response/)).toBeInTheDocument();
    });
  });
});
```

**Utility Function Tests:**
```typescript
describe('generateChecklist', () => {
  it('generates tasks appropriate for wedding size', () => {
    const result = generateChecklist({
      weddingDate: new Date('2025-12-25'),
      weddingSize: 'small',
    });

    // Should not include 'large' only tasks
    expect(result).not.toContainEqual(
      expect.objectContaining({ title: 'Photographer 2nd camera' })
    );
  });

  it('adjusts due dates when wedding is soon', () => {
    const result = generateChecklist({
      weddingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      weddingSize: 'medium',
    });

    expect(result).toContainEqual(
      expect.objectContaining({ priority: 'urgent' })
    );
  });
});
```

---

*Testing analysis: 2026-02-28*

**Next step:** Choose testing framework and establish configuration before writing tests.
