# Coding Conventions

**Analysis Date:** 2026-02-28

## Naming Patterns

**Files:**
- Components: PascalCase, `.tsx` extension
  - Example: `ChatInterface.tsx`, `BudgetView.tsx` in `src/components/`
- Pages: lowercase with hyphens for directories, `.tsx` extension
  - Example: `src/app/(auth)/login/page.tsx`, `src/app/(dashboard)/chat/page.tsx`
- API routes: lowercase with hyphens, `route.ts` extension
  - Example: `src/app/api/chat/route.ts`, `src/app/api/rsvp/route.ts`
- Utilities/libraries: camelCase, `.ts` extension
  - Example: `checklist-generator.ts`, `supabase.ts`

**Functions:**
- camelCase for all function names
- Descriptive names that indicate action: `sendMessage()`, `toggleItem()`, `buildSystemPrompt()`
- Event handlers prefixed with `handle`: `handleLogin()`, `sendMessage()` (async handlers)

**Variables:**
- camelCase for all variables and constants
- Boolean prefixes: `is`, `has`, `show`, `disabled`
  - Example: `isLoading`, `showAddForm`, `hasError`
- Collections plural: `items`, `messages`, `filteredItems`
- State variables use React naming: `[state, setState]`
  - Example: `const [items, setItems] = useState()`

**Types/Interfaces:**
- PascalCase for all interface and type names
- Props interfaces suffixed with `Props`
  - Example: `ChatInterfaceProps`, `BudgetViewProps`, `ChecklistViewProps`
- Domain types prefixed with context when needed
  - Example: `Message`, `CoupleContext`, `ChecklistItem`

## Code Style

**Formatting:**
- No explicit formatter configured (no Prettier config)
- ESLint uses Next.js config with TypeScript support
- Indentation: 2 spaces (inferred from codebase)
- Line length: No hard limit observed, typical 80-100 character lines

**Linting:**
- Tool: ESLint 9 with Next.js and TypeScript configs
- Config: `eslint.config.mjs`
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Key rules: Core Web Vitals, React best practices, TypeScript type safety
- Run command: `npm run lint`

## Import Organization

**Order:**
1. React imports (hooks, utilities)
   - `import { useState, useRef, useEffect } from 'react';`
2. Next.js imports (router, navigation, Link)
   - `import Link from 'next/link';`
   - `import { useRouter } from 'next/navigation';`
3. Custom utilities and hooks (path aliases)
   - `import { createClient } from '@/lib/supabase/client';`
4. Third-party libraries
   - `import { Send, Loader2, Bot, User } from 'lucide-react';`
   - `import { format } from 'date-fns';`
5. Types/interfaces (inline in file or from imports)

**Path Aliases:**
- Primary: `@/*` → `src/*`
  - Usage: `@/lib/`, `@/components/`, `@/app/`
- All imports use alias paths, no relative paths
- Config: `tsconfig.json` paths section

## Error Handling

**Patterns:**
- try-catch blocks for async operations and network calls
- Error variable typically named `error` with shorthand destructuring
  - Example: `const { error } = await supabase.auth.signInWithPassword()`
- Manual error checking before returning responses
  - Example: `if (!error && data) { ... }`
- User-facing error messages in Czech language
- Console logging for development: `console.error()`, `console.warn()`
- API routes return NextResponse with appropriate status codes
  - 400 for validation errors
  - 401 for auth errors
  - 403 for permission errors
  - 500 for server errors
- Client components handle fetch errors with try-catch, set UI error state
  - Example: `setError('Chyba při komunikaci s AI')`

**API Response Pattern:**
```typescript
if (!response.ok) {
  throw new Error('Error message');
}
const data = await response.json();
```

## Logging

**Framework:** console object (console.error, console.warn, console.log)

**Patterns:**
- Development only: debug statements with `console.log()`
- Error tracking: `console.error('Context:', error)` with context labels
- Warnings: `console.warn()` for startup issues like missing API keys
- Typical pattern: `console.error('Chat error:', error)` with descriptive prefix

**Examples from codebase:**
- `console.warn('ANTHROPIC_API_KEY not set - chat will not work')`
- `console.error('Chat API error:', error)`
- `console.error('RSVP error:', error)`

## Comments

**When to Comment:**
- Security-relevant code: `// SECURITY: Verify that the authenticated user owns this coupleId`
- Complex business logic with non-obvious steps
- Configuration setup explanations
- Why something is done a certain way (not what it does)

**Inline Comments:**
- Single-line: `// Comment` style
- Czech language acceptable for codebase in Czech context
- Comments in both Czech and English observed: use Czech for user-facing, English for technical

**Section Comments:**
- Multi-line comments for component sections:
```jsx
{/* Header */}
{/* Messages */}
{/* Input */}
```

**JSDoc/TSDoc:**
- Not systematically used in codebase
- Interfaces have inline documentation in some cases
- Add JSDoc when creating new reusable functions

## Function Design

**Size:**
- Keep functions under 50 lines when possible
- Large components (300+ lines) are single-file modules
  - Examples: `ChecklistView.tsx` (366 lines), `GuestsView.tsx` (386 lines)
- Complex logic extracted to utility functions
  - Example: `buildSystemPrompt()` logic extracted into helper

**Parameters:**
- Destructure props in component function signatures
  - Example: `export function ChatInterface({ couple, initialMessages }: ChatInterfaceProps)`
- Use object parameters for functions with 3+ arguments
- Type all parameters in TypeScript files

**Return Values:**
- Components return JSX elements
- Utility functions return typed values
- Async functions return Promises with typed content
- Functions that may fail return error objects or throw

## Module Design

**Exports:**
- Named exports for components and utilities
  - `export function ChatInterface() { ... }`
  - `export function buildSystemPrompt() { ... }`
- Default exports for page components (Next.js convention)
  - `export default function LoginPage() { ... }`

**Barrel Files:**
- No barrel export files (`index.ts`) observed
- Direct imports from module files

**Client/Server Marking:**
- 'use client' at top of client components
- Server components used in API routes and page layouts
- Clear separation: `src/lib/supabase/client.ts` vs `src/lib/supabase/server.ts`

## Type Patterns

**Database Types:**
- Location: `src/lib/types.ts` exports all DB-related interfaces
- Pattern: interfaces suffixed with entity name
  - `Couple`, `ChecklistItemDB`, `BudgetItem`, `Guest`, `ChatMessage`, `Vendor`
- All fields typed explicitly with `| null` for optional database fields

**Component Props:**
- Always create `Props` interface for components
- Destructure in function signature
- Include all passed properties in interface

**Utility Type Patterns:**
```typescript
export type WeddingSize = 'small' | 'medium' | 'large';
export type TaskCategory = 'venue' | 'attire' | 'vendors' | 'guests' | 'decor' | 'admin' | 'ceremony';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
```

## Tailwind CSS

**Usage:**
- Utility-first approach with inline classes
- Color system uses CSS variables: `text-[var(--color-primary)]`
- Responsive classes: `md:`, `lg:`, `sm:` prefixes
- Dark mode not used
- Custom spacing and sizing with Tailwind utilities

**Examples:**
- `className="grid md:grid-cols-3 gap-6 lg:gap-8"`
- `className="px-4 py-3 border rounded-lg"`
- `className="text-sm text-[var(--color-text-light)]"`

## State Management

**React State:**
- `useState` for local component state
- `useTransition` for async operations in client components
- Props drilling used for passing state between components
- Optimistic updates pattern used for better UX
  - Update local state immediately, sync with server in background

**Example Pattern:**
```typescript
const [items, setItems] = useState(initialItems);

// Optimistic update
setItems((prev) => [...prev, newItem]);

// Server sync
startTransition(async () => {
  await supabase.from('table').insert(newItem);
});
```

---

*Convention analysis: 2026-02-28*
