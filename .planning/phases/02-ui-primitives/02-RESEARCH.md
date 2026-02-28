# Phase 2: UI Primitives - Research

**Researched:** 2026-02-28
**Domain:** React component authoring, Tailwind 4 utility patterns, react-hook-form integration
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Button**
- Variants: Primary (solid accent), Secondary (outlined), Ghost (text-only), Danger (destructive)
- Sizes: sm (compact actions, table rows), md (default), lg (hero CTAs, prominent actions)
- Icon support: Leading icon, trailing icon, and icon-only mode. Lucide icons used throughout.
- Loading state: Built-in `isLoading` prop showing spinner + disables button. Replaces manual `Loader2 + disabled` pattern.

**Card**
- Visual style: Subtle & clean -- light border + minimal shadow. Linear/Notion SaaS aesthetic.
- Structure: Compound components -- Card, Card.Header, Card.Body, Card.Footer
- Padding: 2 tiers -- Default (p-4 for dashboard content) and Compact (p-3 for dense lists/tables)
- Interactivity: Opt-in `interactive` prop adds hover shadow lift + cursor pointer. Phase 3 layers motion on top.

**Input & Form**
- Scope: Three components -- Input, Textarea, Select -- sharing same visual style
- Labels: Built-in label, helperText, and error props. Label above, helper/error below.
- RHF integration: Base components + FormInput/FormTextarea/FormSelect wrappers for react-hook-form
- Error states: Red/danger border + error message in small text below field

**Badge**
- Colors: Semantic -- success (green, confirmed RSVP), warning (amber, pending), danger (red, declined/urgent), info (blue), neutral (gray)
- Style: Pill shape (rounded-full), soft background tint + darker text. GitHub/Linear label aesthetic.
- Dot indicator: Optional leading colored dot for status indicators
- Sizes: sm (inline in tables) and md (standalone labels)

### Claude's Discretion
- Exact spacing values and typography sizing within components
- Internal implementation patterns (forwardRef, polymorphism, etc.)
- How to handle compound Card exports (dot notation vs named exports)
- Focus ring exact color and width
- Transition durations for hover states

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PRIM-01 | Typed Button component with size/variant props replaces all .btn-primary/.btn-outline usage | Section: Button component pattern, migration map |
| PRIM-02 | Typed Card component with consistent padding, radius, and shadow | Section: Compound Card pattern, existing card-div audit |
| PRIM-03 | Typed Input component with focus transitions and error states | Section: Input/Textarea/Select pattern, RHF wrapper pattern |
| PRIM-04 | Typed Badge component for status indicators (RSVP, priority, categories) | Section: Badge variant map, existing badge audit |
</phase_requirements>

---

## Summary

Phase 2 builds four typed component primitives (Button, Card, Input/Textarea/Select, Badge) in `src/components/ui/` that absorb all ad-hoc CSS patterns currently scattered across dashboard and section components. The codebase uses Tailwind 4 with OKLCH design tokens, no external component library, and no variant-helper utilities (no `cva`, no `clsx`, no `tailwind-merge`) -- these need to be installed or hand-rolled for clean variant switching.

The migration surface is well-defined: 2 `btn-*` CSS class usages (Hero.tsx, RSVP.tsx), ~30 raw `<button>` elements across dashboard views, ~15 `bg-white p-4 rounded-lg shadow-sm` card divs, 8 raw input/textarea/select elements in RSVP.tsx, and inline badge spans across ChecklistView, GuestsView, and BudgetView. Every component must forward refs (Next.js 16 / React 19 strictness) and carry a `'use client'` directive since they involve event handlers and state.

**Primary recommendation:** Install `class-variance-authority` (cva) + `clsx` for variant composition. They are zero-runtime, Tailwind-native, and TypeScript-friendly. Use dot-notation compound exports for Card (`Card.Header`, `Card.Body`, `Card.Footer`). Use RHF `register` spread pattern for base components; create thin FormX wrapper components that accept `name` + `control` for Controller-based usage.

---

## Standard Stack

### Core (already installed -- no new packages needed for base components)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.3 | Component authoring | Project baseline |
| TypeScript | ^5 | Typed props interfaces | Project baseline |
| Tailwind CSS | ^4 | Utility-first styling | Project baseline |
| lucide-react | ^0.575.0 | Icons (leading, trailing, icon-only, Loader2 spinner) | Already used for all icons |
| react-hook-form | ^7.71.2 | Form state (FormX wrappers consume this) | Already integrated in RSVP.tsx |
| @hookform/resolvers + zod | already installed | Validation chain | Already used |

### Supporting (needs install)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| class-variance-authority | ^0.7.x | Type-safe variant composition | Every component with multiple variants/sizes |
| clsx | ^2.x | Conditional class merging | Everywhere className is assembled conditionally |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| cva + clsx | tailwind-merge | twMerge is for conflict resolution (same property, multiple classes). Not needed here since design tokens avoid conflicts. cva + clsx is simpler and sufficient. |
| cva + clsx | hand-rolled ternary chains | Ternaries work but produce messy untyped strings; cva auto-generates TypeScript union types for variant props |
| Custom compound Card | Radix UI Card | Radix is overkill here -- no accessibility complexity in a card container |
| Custom Input | Radix UI primitives | Input/Textarea/Select don't need Radix -- native elements with forwardRef are sufficient |

**Installation:**
```bash
npm install class-variance-authority clsx
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/ui/
│   ├── Button.tsx          # Button + ButtonProps
│   ├── Card.tsx            # Card + Card.Header + Card.Body + Card.Footer
│   ├── Input.tsx           # Input + InputProps (base)
│   ├── Textarea.tsx        # Textarea + TextareaProps (base)
│   ├── Select.tsx          # Select + SelectProps (base)
│   ├── Badge.tsx           # Badge + BadgeProps
│   ├── FormInput.tsx       # RHF wrapper: FormInput (uses Controller internally)
│   ├── FormTextarea.tsx    # RHF wrapper: FormTextarea
│   ├── FormSelect.tsx      # RHF wrapper: FormSelect
│   └── index.ts            # Barrel export
├── lib/
│   └── cn.ts               # cn() utility (clsx wrapper)
```

### Pattern 1: cva-based Variant Component (Button example)

**What:** Define all variants/sizes in a `cva()` call. Props interface is typed from the inferred type.
**When to use:** Any component with 2+ variants or sizes.

```typescript
'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

const buttonVariants = cva(
  // Base classes shared by all variants
  'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed select-none',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]',
        secondary: 'border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white',
        ghost: 'text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'text-xs px-3 py-1.5 min-h-[32px]',
        md: 'text-sm px-5 py-2.5 min-h-[44px]',
        lg: 'text-base px-7 py-3.5 min-h-[52px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, isLoading, leadingIcon, trailingIcon, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leadingIcon}
        {children}
        {!isLoading && trailingIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';
```

### Pattern 2: Compound Card with dot notation

**What:** Card is the outer container; sub-components are attached as static properties.
**When to use:** Enforces structural consistency -- consumers cannot accidentally omit padding or dividers.

```typescript
'use client';

import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'default' | 'compact';
  interactive?: boolean;
}

export function Card({ padding = 'default', interactive = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white border border-[var(--color-border)] rounded-xl shadow-sm',
        interactive && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-4 py-3 border-b border-[var(--color-border)]', className)} {...props}>
      {children}
    </div>
  );
}

function CardBody({ padding = 'default', className, children, ...props }: CardProps) {
  return (
    <div className={clsx(padding === 'compact' ? 'p-3' : 'p-4', className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-4 py-3 border-t border-[var(--color-border)]', className)} {...props}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
```

### Pattern 3: Base Input with forwardRef + FormInput RHF wrapper

**What:** Base `Input` accepts all native `<input>` props + label/error/helperText. `FormInput` wraps it with RHF's `Controller`.
**When to use:** Base for uncontrolled or custom-managed forms; FormInput for react-hook-form forms.

```typescript
// Base Input (Input.tsx)
'use client';

import { clsx } from 'clsx';
import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full px-4 py-3 border rounded-lg text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-[var(--color-border)] hover:border-[var(--color-text-light)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {!error && helperText && <p className="text-xs text-[var(--color-text-light)]">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
```

```typescript
// RHF wrapper (FormInput.tsx)
'use client';

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Input, type InputProps } from './Input';

interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'name'> {
  name: Path<T>;
  control: Control<T>;
}

export function FormInput<T extends FieldValues>({ name, control, ...props }: FormInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Input {...field} {...props} error={fieldState.error?.message} />
      )}
    />
  );
}
```

### Pattern 4: Badge with cva

**What:** Simple pill span with semantic color mapping.
**When to use:** All status indicators -- RSVP state, checklist priority, budget category.

```typescript
'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium rounded-full',
  {
    variants: {
      intent: {
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        neutral: 'bg-gray-100 text-gray-600',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
      },
    },
    defaultVariants: {
      intent: 'neutral',
      size: 'sm',
    },
  }
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ intent, size, dot, className, children }: BadgeProps) {
  return (
    <span className={clsx(badgeVariants({ intent, size }), className)}>
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full', {
            'bg-green-500': intent === 'success',
            'bg-amber-500': intent === 'warning',
            'bg-red-500': intent === 'danger',
            'bg-blue-500': intent === 'info',
            'bg-gray-400': intent === 'neutral',
          })}
        />
      )}
      {children}
    </span>
  );
}
```

### Pattern 5: cn() utility

**What:** Thin wrapper that composes clsx output. Allows callers to merge their own classes with defaults.
**When to use:** In every component's `className` prop handling.

```typescript
// src/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
```

Note: `tailwind-merge` is NOT used here because Tailwind 4's `@theme` tokens (e.g. `bg-[var(--color-primary)]`) don't create conflicts the way static class names do. If conflicts emerge post-migration, `twMerge` can be swapped in later.

### Anti-Patterns to Avoid

- **Spreading entire `className` without clsx:** String concatenation with user-provided className breaks when className is undefined. Always use `clsx(baseClasses, className)`.
- **Missing forwardRef on form elements:** Next.js 16 / React 19 refs on controlled inputs require `forwardRef`. Without it, RHF Controller's `ref` prop is silently lost.
- **Forgetting `displayName`:** Components created with `forwardRef` show as "ForwardRef" in React DevTools. Set `Button.displayName = 'Button'` etc.
- **Using inline `style` for Badge colors:** ChecklistView currently uses `style={{ backgroundColor: \`${CATEGORY_COLORS[category]}20\`, color: CATEGORY_COLORS[category] }}`. This bypasses the design system. Badge should use Tailwind semantic classes; category-to-intent mapping should be a small helper function.
- **Conditional class assembly without clsx:** Template literals like `` `px-4 ${isLoading ? 'opacity-50' : ''}` `` produce trailing whitespace and are hard to read. Always use `clsx`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Variant/size typing | Manual TS discriminated unions + ternary chains | `cva` | cva auto-infers TS types, eliminates runtime errors from typos, keeps variants co-located |
| Conditional class merging | Template literals or string concatenation | `clsx` | Handles undefined/null/false cleanly, no trailing spaces |
| RHF field binding in FormX | Manual onChange/onBlur/value wiring | `Controller` + spread | Controller handles all field state including onBlur, onChange, value, ref; manual wiring misses edge cases |

**Key insight:** The "deceptively complex" problems here are TypeScript inference for variant props (cva solves it) and RHF field state management (Controller solves it). Both are solved problems -- don't hand-roll.

---

## Common Pitfalls

### Pitfall 1: Icon-only Button without accessible label
**What goes wrong:** `<Button variant="ghost"><Trash2 /></Button>` renders no text -- screen readers announce nothing.
**Why it happens:** Icon-only mode is visually obvious but semantically empty.
**How to avoid:** When `children` is absent (or icon-only mode is explicit), require an `aria-label` prop via TypeScript (use a discriminated union or runtime warning).
**Warning signs:** Button with only an icon child and no `aria-label` attribute in the DOM.

### Pitfall 2: RSVP.tsx uses `register()` spread -- not Controller
**What goes wrong:** RSVP.tsx uses `{...register("name")}` pattern (not Controller). If FormInput uses `Controller` internally, migrating RSVP.tsx requires switching to the FormInput wrapper (changing how the form is consumed), not just swapping the element.
**Why it happens:** register spread and Controller are two different RHF integration modes -- incompatible without refactor.
**How to avoid:** For RSVP.tsx migration (Phase 7), swap to FormInput which uses Controller. During Phase 2, just create both base Input (compatible with register spread) and FormInput (Controller-based) -- don't force migrate RSVP.tsx yet.
**Warning signs:** TypeScript error on `{...register("name")}` spread into FormInput.

### Pitfall 3: Tailwind 4 purge and dynamic class assembly
**What goes wrong:** Classes assembled at runtime from variables (e.g. `bg-${color}-100`) are not statically analyzable -- Tailwind 4 removes them from the output.
**Why it happens:** Tailwind 4's content scanner uses static analysis, not runtime execution.
**How to avoid:** Always use complete class strings in cva definitions and in badge intent maps. Never interpolate class fragments. The existing `CATEGORY_COLORS` hex values in ChecklistView must be replaced with fixed Tailwind class strings in Badge.
**Warning signs:** Color not appearing in production build but works in dev.

### Pitfall 4: `btn-primary` / `btn-outline` removal timing
**What goes wrong:** Removing `btn-primary` from `globals.css` before all usages are replaced causes Hero.tsx and RSVP.tsx buttons to lose all styling silently.
**Why it happens:** CSS class names don't produce TypeScript errors -- the breakage is visual only.
**How to avoid:** Remove `btn-primary` / `btn-outline` CSS definitions LAST, after all consumers are migrated and visually verified.
**Warning signs:** Unstyled button elements after globals.css edit.

### Pitfall 5: Card compound component TypeScript export
**What goes wrong:** Dot-notation sub-components (`Card.Header`) are not automatically exported from a barrel `index.ts` -- they're accessed only through the parent `Card` import.
**Why it happens:** Named exports don't traverse static property assignments.
**How to avoid:** Import `Card` (not `Card.Header`) in consumers. Document in the barrel: `export { Card } from './Card'` -- sub-components come along. Do not try to `export { Card.Header }`.

---

## Code Examples

### cn() utility
```typescript
// src/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
```

### Category-to-intent mapping for Badge (replaces inline style in ChecklistView)
```typescript
// Used in ChecklistView when rendering category badges
const CATEGORY_INTENT: Record<TaskCategory, BadgeProps['intent']> = {
  venue: 'info',
  attire: 'neutral',   // pink has no semantic equivalent -- use neutral or custom
  vendors: 'warning',
  guests: 'success',
  decor: 'info',
  admin: 'neutral',
  ceremony: 'danger',
};

// Usage:
<Badge intent={CATEGORY_INTENT[category]} size="sm">
  {CATEGORY_LABELS[category]}
</Badge>
```

### RSVP status to Badge intent
```typescript
const RSVP_INTENT: Record<'confirmed' | 'pending' | 'declined', BadgeProps['intent']> = {
  confirmed: 'success',
  pending: 'warning',
  declined: 'danger',
};

<Badge intent={RSVP_INTENT[guest.rsvp_status]} dot size="sm">
  {guest.rsvp_status === 'confirmed' ? 'Potvrzeno' : guest.rsvp_status === 'declined' ? 'Odmítnuto' : 'Čeká'}
</Badge>
```

### Barrel export
```typescript
// src/components/ui/index.ts
export { Button, type ButtonProps } from './Button';
export { Card } from './Card';
export { Input, type InputProps } from './Input';
export { Textarea, type TextareaProps } from './Textarea';
export { Select, type SelectProps } from './Select';
export { Badge, type BadgeProps } from './Badge';
export { FormInput } from './FormInput';
export { FormTextarea } from './FormTextarea';
export { FormSelect } from './FormSelect';
```

---

## Migration Map (Existing Usages to Replace)

### PRIM-01: Button migration targets
| File | Pattern | Replace with |
|------|---------|--------------|
| `src/components/sections/Hero.tsx:87` | `<a href="#rsvp" className="btn-primary">` | `<Button variant="primary" size="lg" asChild>` or convert to link-styled button |
| `src/components/sections/RSVP.tsx:221` | `className="w-full btn-primary ... disabled:opacity-70"` + Loader2 | `<Button variant="primary" size="md" isLoading={isSubmitting} className="w-full">` |
| `src/components/dashboard/BudgetView.tsx` | ~5 raw `<button>` elements | `<Button variant="ghost" size="sm">` or appropriate variant |
| `src/components/dashboard/GuestsView.tsx` | ~6 raw `<button>` elements | `<Button>` with appropriate variant/size |
| `src/components/dashboard/ChecklistView.tsx` | toggle button + filter buttons | `<Button variant="ghost" size="sm">` |
| `src/components/dashboard/ChatInterface.tsx` | send button with Loader2 | `<Button variant="primary" isLoading={...}>` |

Note: Hero.tsx uses `<a>` not `<button>`. The Button component should support an `asChild` prop (Radix Slot pattern) OR the `<a>` stays as-is and just loses the `btn-primary` class in favor of direct Tailwind classes on a Link component -- simpler for Phase 2 scope.

### PRIM-02: Card migration targets
| File | Pattern count | Replace with |
|------|--------------|--------------|
| `src/components/dashboard/BudgetView.tsx` | 6 instances of `bg-white p-4 rounded-lg shadow-sm` | `<Card><Card.Body>` |
| `src/components/dashboard/GuestsView.tsx` | 5 instances | `<Card><Card.Body>` |
| `src/components/dashboard/ChecklistView.tsx` | 1 instance | `<Card><Card.Body>` |
| `src/components/sections/Locations.tsx:86` | 1 instance | `<Card><Card.Body>` |

### PRIM-03: Input migration targets
| File | Pattern | Replace with |
|------|---------|--------------|
| `src/components/sections/RSVP.tsx:111` | raw `<input>` with `{...register("name")}` | `<Input label="..." {...register("name")} error={errors.name?.message}>` |
| `src/components/sections/RSVP.tsx:128` | raw `<input type="email">` | `<Input type="email" label="..." {...register("email")} error={...}>` |
| `src/components/sections/RSVP.tsx:174` | raw `<select>` | `<Select label="..." {...register("guestCount")} error={...}>` |
| `src/components/sections/RSVP.tsx:208` | raw `<textarea>` | `<Textarea label="..." {...register("notes")} error={...}>` |

### PRIM-04: Badge migration targets
| File | Pattern | Replace with |
|------|---------|--------------|
| `src/components/dashboard/GuestsView.tsx:339-361` | ternary `bg-green-100/bg-amber-100/bg-red-100 text-*` inline spans | `<Badge intent={RSVP_INTENT[guest.rsvp_status]} dot>` |
| `src/components/dashboard/ChecklistView.tsx:284` | `bg-red-100 text-red-700 rounded` span for urgent | `<Badge intent="danger">` |
| `src/components/dashboard/ChecklistView.tsx:296` | inline `style` with `CATEGORY_COLORS` hex | `<Badge intent={CATEGORY_INTENT[category]}>` |
| `src/components/dashboard/BudgetView.tsx` | category string display | `<Badge intent={CATEGORY_INTENT[category]}>` |

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| CSS utility classes (`btn-primary`) | Typed React components with variant props | Type safety, no magic strings |
| Inline style for dynamic colors | Tailwind semantic class maps | Purgeable, consistent |
| `Loader2 + disabled` manual pattern | `isLoading` prop on Button | Single source of truth, no drift |
| RHF register spread on raw inputs | FormX wrapper with Controller | Cleaner consumer code, error display built in |

---

## Open Questions

1. **Hero.tsx `<a>` button: asChild or separate LinkButton?**
   - What we know: Button is a `<button>`. Hero uses `<a href="#rsvp">` for scroll navigation, which should stay semantic `<a>`.
   - What's unclear: Whether to implement Radix Slot `asChild` (adds Radix as dependency) or just keep Hero.tsx using `className` directly with the design token values.
   - Recommendation: For Phase 2, do NOT implement asChild (adds scope). Apply Tailwind classes directly on Hero's `<a>` matching the primary button visual. Mark as a known gap -- asChild can be added in a later phase if needed.

2. **Badge: custom hex colors for TaskCategory**
   - What we know: ChecklistView currently uses 7 category colors (purple, pink, amber, emerald, cyan, gray, red) as hex values via inline style.
   - What's unclear: The 5 semantic Badge intents (success/warning/danger/info/neutral) don't map cleanly to 7 categories. "Attire" (pink) and "Decor" (cyan) have no semantic equivalent.
   - Recommendation: Map best-effort (attire -> neutral, decor -> info) and document the imprecision. Do NOT introduce custom hex badge variants in Phase 2 -- that adds complexity without product value.

3. **`globals.css` `btn-primary`/`btn-outline` removal timing**
   - What we know: These classes exist and are used in 2 files.
   - What's unclear: Whether CONTEXT.md expects the CSS classes to be deleted in this phase or left as dead code.
   - Recommendation: Delete CSS class definitions at end of Phase 2 after all usages are replaced and visually verified. Include as an explicit final task.

---

## Validation Architecture

> `workflow.nyquist_validation` not present in `.planning/config.json` -- skipping this section.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase audit -- all file paths and line numbers verified against live code
- `package.json` -- dependency versions confirmed
- `src/app/globals.css` -- btn-* CSS definitions read directly
- `src/lib/checklist-generator.ts` -- TaskCategory, TaskPriority, CATEGORY_COLORS confirmed
- `src/lib/types.ts` -- Guest.rsvp_status union type confirmed

### Secondary (MEDIUM confidence)
- `class-variance-authority` -- standard library for Tailwind variant composition, widely used in shadcn/ui and similar ecosystems. Version 0.7.x is current stable.
- `clsx` -- standard conditional class utility, zero-dependency, actively maintained.
- react-hook-form Controller pattern -- confirmed against RSVP.tsx which shows existing `register` usage, informing the two-mode integration design.

### Tertiary (LOW confidence)
- `tailwind-merge` exclusion rationale -- based on project-specific assessment that Tailwind 4 `@theme` token classes don't produce merge conflicts. If conflicts emerge, this assessment should be revisited.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all dependencies confirmed in package.json, code patterns verified in codebase
- Migration map: HIGH -- line numbers verified against actual files
- Architecture: HIGH -- patterns are standard React/TypeScript with no speculative APIs
- cva/clsx recommendation: MEDIUM-HIGH -- libraries are standard ecosystem choices but not yet in node_modules; recommend confirming compatibility with Tailwind 4 @theme variables post-install

**Research date:** 2026-02-28
**Valid until:** 2026-03-30 (stable domain, library APIs change slowly)
