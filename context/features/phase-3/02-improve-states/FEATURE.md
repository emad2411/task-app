# Feature Specification: P3-F2 - Improve Empty, Loading, and Error States

**Phase:** 3 - Preferences and Polish  
**Feature ID:** P3-F2  
**Feature Name:** Improve Empty, Loading, and Error States  
**Status:** Draft - Ready for Implementation  
**Date:** 2026-04-26

---

## 1. Goals

### Primary Goal
Systematically audit and improve every user-facing state across the application — empty states, loading skeletons, error boundaries, not-found pages, and Suspense fallbacks — so that users always see meaningful, branded, context-aware UI regardless of what state the application is in.

### Secondary Goals
- Add missing `global-error.tsx` at the root to catch root layout crashes
- Add missing `not-found.tsx` at the root for unknown routes
- Add `loading.tsx` and `error.tsx` files for the `(public)` route group
- Standardize error boundary components across all pages (icons, spacing, retry pattern)
- Standardize empty state components using the existing `<Empty>` compound component from `components/ui/empty.tsx`
- Fix `<Suspense>` fallbacks that use bare text `"Loading..."` instead of proper skeletons/spinners
- Fix minor inconsistencies (categories `error.tsx` missing icon, root `error.tsx` raw button, `CategorySkeleton` unnecessary `"use client"`)
- Audit cache invalidation patterns to ensure mutations cause proper revalidation

---

## 2. Scope

### In Scope

#### New Files
1. **`app/global-error.tsx`** — Root-level error boundary (Next.js 16 convention for production error UI when root layout crashes)
2. **`app/not-found.tsx`** — Catch-all 404 page for unknown routes
3. **`app/(public)/loading.tsx`** — Loading skeleton for auth pages (sign-in, sign-up, forgot-password, reset-password, verify-email)
4. **`app/(public)/error.tsx`** — Error boundary for auth pages

#### Updated Files
5. **`app/loading.tsx`** — Replace minimal skeleton with branded loading state
6. **`app/error.tsx`** — Replace raw `<button>` with shadcn `<Button>`, add icon, card wrapper
7. **`app/(app)/categories/error.tsx`** — Add missing `AlertTriangle` icon for consistency
8. **`app/(public)/reset-password/page.tsx`** — Replace `<Suspense>` fallback text with proper spinner/skeleton
9. **`app/(public)/verify-email/page.tsx`** — Replace `<Suspense>` fallback text with proper spinner/skeleton
10. **`components/categories/category-skeleton.tsx`** — Remove unnecessary `"use client"` directive
11. **`components/ui/empty.tsx`** — Ensure compound component is importable and has proper TypeScript types (audit only; no changes expected)

#### Refactored Empty States
12. **Dashboard empty state** — Refactor to use `<Empty>` compound component from shadcn/ui
13. **Categories empty state** — Extract inline JSX into reusable component using `<Empty>` compound component
14. **Task empty state** — Ensure `TaskEmptyState` uses `<Empty>` compound component (or verify it's already compatible)

### Out of Scope
- Adding new feature functionality or pages
- Redesigning existing error messages or copy (only standardizing presentation)
- `revalidateTag` migration (post-MVP performance concern; document as recommendation)
- New feature-specific empty states for future pages
- Toast/notification system improvements (separate concern)
- Loading shimmer animations beyond existing skeleton patterns
- Accessibility audit beyond what's already required

---

## 3. Requirements

### 3.1 Functional Requirements

#### REQ-001: Global Error Boundary
**Priority:** P0  
**Description:** Catch root layout errors with a branded fallback UI

**Acceptance Criteria:**
- [ ] `app/global-error.tsx` exists as a Client Component (`"use client"`)
- [ ] Wraps content in `<html>` and `<body>` tags (required for root-level error boundaries in Next.js)
- [ ] Renders branded error UI with AlertTriangle icon
- [ ] Shows "Something went wrong" heading
- [ ] Shows "An unexpected error occurred. Please try again." description
- [ ] Has a "Try again" button that calls `reset()`
- [ ] Has a "Go home" link to `/`
- [ ] Dark mode compatible (inline styles or CSS since it's outside the root layout's ThemeProvider)
- [ ] Logs error details to console (Next.js convention)

#### REQ-002: Global Not-Found Page
**Priority:** P0  
**Description:** Catch-all 404 page for unknown routes

**Acceptance Criteria:**
- [ ] `app/not-found.tsx` exists
- [ ] Shows "Page not found" heading
- [ ] Shows "The page you're looking for doesn't exist or has been moved." description
- [ ] Shows FileQuestion icon
- [ ] Has "Go to Dashboard" link (if authenticated) or "Go Home" link (if unauthenticated)
- [ ] Dark mode compatible
- [ ] Responsive: centered layout, works on all screen sizes

#### REQ-003: Root Loading Skeleton
**Priority:** P1  
**Description:** Improve the root-level loading state

**Acceptance Criteria:**
- [ ] `app/loading.tsx` shows a centered branded spinner/skeleton
- [ ] Includes app name "TaskFlow" or app logo placeholder
- [ ] Uses `<Spinner>` or `<Skeleton>` component (not raw CSS)
- [ ] Responsive: centered on all screen sizes, max-width container
- [ ] Subtle, non-distracting animation (existing `animate-pulse` pattern)

#### REQ-004: Root Error Boundary Enhancement
**Priority:** P1  
**Description:** Standardize root error boundary to match page-level error boundaries

**Acceptance Criteria:**
- [ ] Uses shadcn `<Button>` component instead of raw `<button>`
- [ ] Includes AlertTriangle icon in a rounded circle
- [ ] Wrapped in `<Card>` or subtle container
- [ ] Matches visual style of `(app)` error boundaries (same spacing, typography, icon style)

#### REQ-005: Public Route Group Loading
**Priority:** P1  
**Description:** Loading skeleton for auth pages during server-side session check

**Acceptance Criteria:**
- [ ] `app/(public)/loading.tsx` shows a branded loading state matching the auth page layout
- [ ] Centered card/skeleton with app name, optional tagline, and pulsing form placeholder
- [ ] Not distracting; feels lightweight
- [ ] Responsive: matches auth page container width

#### REQ-006: Public Route Group Error Boundary
**Priority:** P1  
**Description:** Error boundary for auth pages

**Acceptance Criteria:**
- [ ] `app/(public)/error.tsx` exists as a Client Component
- [ ] Shows AlertTriangle icon, message, and retry button
- [ ] Matches visual style of `(app)` error boundaries
- [ ] Centered layout matching auth page constraints

#### REQ-007: Categories Error Boundary Consistency
**Priority:** P2  
**Description:** Fix missing icon in categories error boundary

**Acceptance Criteria:**
- [ ] `app/(app)/categories/error.tsx` updated to include AlertTriangle icon
- [ ] Matches visual pattern of all other `(app)` error boundaries (icon in circle, message, retry)

#### REQ-008: Suspense Fallback Fixes
**Priority:** P2  
**Description:** Replace plain text "Loading..." fallbacks with proper UI

**Acceptance Criteria:**
- [ ] `app/(public)/reset-password/page.tsx` Suspense fallback uses `<Skeleton>` or `<Spinner>` matching auth page layout
- [ ] `app/(public)/verify-email/page.tsx` Suspense fallback uses `<Skeleton>` or `<Spinner>` matching auth page layout

#### REQ-009: CategorySkeleton Cleanup
**Priority:** P2  
**Description:** Remove unnecessary `"use client"` from CategorySkeleton

**Acceptance Criteria:**
- [ ] `components/categories/category-skeleton.tsx` is a Server Component (no `"use client"`)
- [ ] No hooks or browser APIs used (verify no `useState`, `useEffect`, event handlers, etc.)
- [ ] Build passes without errors

#### REQ-010: Empty State Standardization
**Priority:** P1  
**Description:** Refactor page-level empty states to use the `<Empty>` compound component

**Acceptance Criteria:**
- [ ] **Dashboard empty state** (`components/dashboard/empty-state.tsx`) refactored to use `<Empty>`, `<EmptyHeader>`, `<EmptyTitle>`, `<EmptyDescription>`, `<EmptyMedia>`, `<EmptyContent>` sub-components
- [ ] **Categories empty state** extracted from inline JSX into a reusable component that uses `<Empty>` compound component
- [ ] **TaskEmptyState** reviewed and refactored to use `<Empty>` compound component if not already compatible
- [ ] All refactored empty states maintain the same visual appearance (no regressions)
- [ ] Empty states remain context-aware (filtered vs global, first-time user vs returning user)

#### REQ-011: Cache Invalidation Audit
**Priority:** P2  
**Description:** Document and ensure cache invalidation is correct across all mutations

**Acceptance Criteria:**
- [ ] Review all server actions for completeness of `revalidatePath` calls
- [ ] Ensure create/update/delete/archive operations on tasks revalidate: `/dashboard`, `/tasks`, `/tasks/[taskId]`
- [ ] Ensure category mutations revalidate: `/categories`, `/tasks`, `/dashboard`
- [ ] Ensure settings mutations revalidate: `/settings`, `/dashboard`, `/tasks`
- [ ] Add `revalidatePath` to any mutations that are missing paths
- [ ] (Post-MVP) Add recommendation comment about `revalidateTag` migration in codebase

### 3.2 Technical Requirements

#### REQ-012: Global Error Boundary Architecture
**Priority:** P0  
**Description:** Root-level error boundary must follow Next.js 16 conventions

**Acceptance Criteria:**
- [ ] Must be a Client Component with `"use client"` directive
- [ ] Must include `<html>` and `<body>` tags (root layout may be unavailable)
- [ ] Must accept `{ error, reset }` props
- [ ] Should use inline styles or a separate CSS module (ThemeProvider may not be available)
- [ ] Must not import from `@/components/layout/theme-provider` or anything that depends on root layout context

#### REQ-013: Not-Found Page Architecture
**Priority:** P0  
**Description:** Global 404 page

**Acceptance Criteria:**
- [ ] Can be a Server Component (does not need `"use client"`)
- [ ] Should detect authentication state to show appropriate navigation link (dashboard vs home)
- [ ] Uses existing shadcn/ui components (Button, Card)
- [ ] Centered layout, `min-h-screen` for full-viewport coverage

#### REQ-014: Empty State Component Standard
**Priority:** P1  
**Description:** Use `<Empty>` compound component from `components/ui/empty.tsx` across all pages

**Acceptance Criteria:**
- [ ] Empty states use compound component pattern:

```tsx
<Empty>
  <EmptyMedia variant="icon">
    <ClipboardList className="size-4" />
  </EmptyMedia>
  <EmptyHeader>
    <EmptyTitle>No tasks yet</EmptyTitle>
    <EmptyDescription>
      Create your first task to get started.
    </EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <CreateTaskButton />
  </EmptyContent>
</Empty>
```

#### REQ-015: Cache Invalidation Review
**Priority:** P2  
**Description:** Audit and fix revalidation paths

**Acceptance Criteria:**
- [ ] Every server action that modifies data calls `revalidatePath` for all affected routes
- [ ] No stale data appears after mutations
- [ ] Cross-cutting revalidation paths documented in action code comments

---

## 4. UI Architecture

### 4.1 File Structure

```
app/
├── global-error.tsx           # NEW — Root error boundary
├── not-found.tsx              # NEW — Global 404 page
├── loading.tsx                # UPDATE — Branded loading state
├── error.tsx                  # UPDATE — Standardized with Button + icon

app/(public)/
├── loading.tsx                # NEW — Auth pages loading skeleton
├── error.tsx                  # NEW — Auth pages error boundary

app/(public)/reset-password/
├── page.tsx                   # UPDATE — Suspense fallback

app/(public)/verify-email/
├── page.tsx                   # UPDATE — Suspense fallback

app/(app)/categories/
├── error.tsx                  # UPDATE — Add missing icon

components/
├── ui/
│   └── empty.tsx              # EXISTING — Audit only (no changes expected)
├── dashboard/
│   └── empty-state.tsx        # UPDATE — Refactor to use <Empty> compound
├── tasks/
│   └── task-empty-state.tsx   # UPDATE — Refactor to use <Empty> compound
├── categories/
│   ├── category-empty-state.tsx # NEW — Extract from inline JSX
│   └── category-skeleton.tsx  # UPDATE — Remove "use client"
└── auth/
    └── auth-page-skeleton.tsx # NEW — Reusable auth page skeleton
```

### 4.2 Component Hierarchy

#### Global Error Boundary
```
GlobalError (Client Component)
├── <html>, <body> (required for root level)
├── Centered card layout
│   ├── AlertTriangle icon in circle
│   ├── "Something went wrong" heading
│   ├── "Please try again" description
│   └── [Try Again] [Go Home]
└── Error logging (console.error)
```

#### Global Not Found
```
NotFound (Server Component)
├── Centered layout, min-h-screen
├── FileQuestion icon in circle
├── "Page not found" heading
├── Description text
└── [Go to Dashboard] or [Go Home] link
```

#### Standard Page Error Boundary
```
ErrorBoundary (Client Component) — used by: dashboard, tasks, task detail, categories, settings
├── Centered container (min-h-[50vh])
├── AlertTriangle icon in rounded-full bg-destructive/10
├── Heading: error title
├── Description: error message
└── [Try Again] Button calling reset()
├── [or] "Go back" Link
```

#### Standard Empty State
```
EmptyState — used by: dashboard, tasks, categories
├── Empty
│   ├── EmptyMedia variant="icon"
│   │   └── Lucide icon (context-specific)
│   ├── EmptyHeader
│   │   ├── EmptyTitle: "No {items} yet"
│   │   └── EmptyDescription: "Create your first {item}..."
│   └── EmptyContent
│       └── CTA (Create button or link)
```

### 4.3 Global Error Boundary Layout

```
Mobile / Desktop:
+-------------------------------------------+
|  ⚠️                                        |
|  Something went wrong                      |
|  An unexpected error occurred.             |
|  Please try again.                         |
|                                            |
|  [Try Again]    [Go Home]                  |
+-------------------------------------------+
```

### 4.4 Global Not Found Layout

```
Mobile / Desktop:
+-------------------------------------------+
|  🔍                                        |
|  Page not found                            |
|  The page you're looking for doesn't       |
|  exist or has been moved.                  |
|                                            |
|  [Go to Dashboard]                         |
+-------------------------------------------+
```

### 4.5 Auth Pages Loading Skeleton

```
Desktop:
+-------------------------------------------+
|                                            |
|           TaskFlow                         |
|       Task Management                      |
|                                            |
|  +-----------------------------------+     |
|  |                                   |     |
|  |  [Skeleton: title bar]            |     |
|  |                                   |     |
|  |  [Skeleton: input field 1]        |     |
|  |  [Skeleton: input field 2]        |     |
|  |                                   |     |
|  |  [Skeleton: button (full width)]  |     |
|  |                                   |     |
|  +-----------------------------------+     |
|                                            |
+-------------------------------------------+

Mobile:
+-------------------------------------------+
|  TaskFlow                                  |
|  +-----------------------------------+     |
|  |  [Skeleton: input field 1]        |     |
|  |  [Skeleton: input field 2]        |     |
|  |                                   |     |
|  |  [Skeleton: button (full width)]  |     |
|  +-----------------------------------+     |
+-------------------------------------------+
```

### 4.5 Root Loading Layout

```
Desktop / Mobile:
+-------------------------------------------+
|                                            |
|              ◌ (Spinner)                   |
|           TaskFlow                         |
|       Loading...                           |
|                                            |
+-------------------------------------------+
```

---

## 5. Design Specifications

### 5.1 Error Boundary Visual Design

All error boundaries follow a consistent pattern:

```
Container: min-h-[50vh] flex items-center justify-center p-6
Card wrapper: (optional) rounded-xl border bg-card p-8 text-center max-w-md
Icon container: mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10
Icon: size-6 text-destructive (AlertTriangle from lucide-react)
Heading: text-lg font-semibold
Description: mt-2 text-sm text-muted-foreground
Actions: mt-6 flex gap-3 justify-center
```

### 5.2 Empty State Visual Design

Using the `<Empty>` compound component:

```
Empty container: flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center text-balance
EmptyMedia (variant="icon"): flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground
Empty icon: size-4 (context-specific lucide icon)
EmptyTitle: font-heading text-sm font-medium tracking-tight
EmptyDescription: text-sm/relaxed text-muted-foreground
EmptyContent: flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm text-balance
```

### 5.3 Not Found Page Visual Design

```
Container: min-h-screen flex items-center justify-center p-6
Card: rounded-xl border bg-card p-8 text-center max-w-md shadow-sm
Icon: size-12 text-muted-foreground (FileQuestion from lucide-react)
Heading: mt-4 text-xl font-semibold tracking-tight
Description: mt-2 text-sm text-muted-foreground
Action: mt-6
```

### 5.4 Color Tokens

All state UI uses existing Tailwind theme tokens:
- `bg-card`, `border`, `text-foreground`, `text-muted-foreground` for containers
- `bg-destructive/10`, `text-destructive` for error icons
- `bg-muted`, `text-foreground` for empty state media
- `animate-pulse` and `bg-muted` for skeleton elements

### 5.5 Spacing & Typography

| Element | Class |
|---------|-------|
| Page title | `text-2xl font-bold tracking-tight` |
| Section heading | `text-lg font-semibold` |
| Description | `text-sm text-muted-foreground` |
| Icon container | `size-12` (error), `size-8` (empty state) |
| Icon | `size-6` (error), `size-4` (empty state) |
| Skeleton | `h-4 w-full animate-pulse rounded-md bg-muted` |
| Error page min-height | `min-h-[50vh]` |

---

## 6. Data Layer

### 6.1 Cache Invalidation Audit

Review all server actions for `revalidatePath` completeness:

**`lib/actions/task.ts`:**
| Action | Paths Revalidated | Missing? |
|--------|-------------------|----------|
| `createTaskAction` | `/dashboard`, `/tasks` | ✅ Complete |
| `updateTaskAction` | `/dashboard`, `/tasks`, `/tasks/${id}` | ✅ Complete |
| `deleteTaskAction` | `/dashboard`, `/tasks` | ✅ Complete (verify `/${id}` if viewing) |
| `toggleTaskCompletionAction` | `/dashboard`, `/tasks`, `/tasks/${id}` | ✅ Complete |
| `archiveTaskAction` | `/dashboard`, `/tasks` | ✅ Complete |

**`lib/actions/category.ts`:**
| Action | Paths Revalidated | Missing? |
|--------|-------------------|----------|
| `createCategoryAction` | `/categories`, `/tasks`, `/dashboard` | ✅ Complete |
| `updateCategoryAction` | `/categories`, `/tasks`, `/dashboard` | ✅ Complete |
| `deleteCategoryAction` | `/categories`, `/tasks`, `/dashboard` | ✅ Complete |

**`lib/actions/settings.ts`:**
| Action | Paths Revalidated | Missing? |
|--------|-------------------|----------|
| `updateProfileAction` | `/settings`, `/dashboard` | ✅ Complete |
| `updatePreferencesAction` | `/settings`, `/dashboard`, `/tasks` | ✅ Complete |

**`lib/actions/auth.ts`:**
| Action | Paths Revalidated | Missing? |
|--------|-------------------|----------|
| `signInAction` | N/A (redirect) | ✅ Not applicable |
| `signUpAction` | N/A (redirect) | ✅ Not applicable |
| `forgotPasswordAction` | N/A | ✅ Not applicable |
| `resetPasswordAction` | N/A | ✅ Not applicable |
| `updatePasswordAction` | `/settings` | ✅ Complete (add `/dashboard` if sidebar shows user info) |
| `verifyEmailAction` | N/A | ✅ Not applicable |

---

## 7. Acceptance Criteria Summary

### Page-Level Criteria

| Page | Route | Criteria |
|------|-------|----------|
| Global Error | `/*` (root layout crash) | Branded fallback with retry + home link |
| Not Found | `/*` (unknown routes) | Branded 404 with navigation link |
| Root Loading | `/*` (initial load) | Branded spinner/app name |
| Root Error | `/*` (page-level crash) | Standardized error with shadcn Button + icon |
| Auth Loading | `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email` | Matching skeleton on initial load |
| Auth Error | Auth pages crash | Standardized error with retry |
| Reset Password | `/reset-password` | Proper Suspense fallback (not "Loading..." text) |
| Verify Email | `/verify-email` | Proper Suspense fallback (not "Loading..." text) |
| Categories Error | `/categories` | AlertTriangle icon added for consistency |

### Component Criteria

| Component | Criteria |
|-----------|----------|
| `GlobalError` | Renders outside root layout, has html/body, inline styles, retry + home |
| `NotFound` | Detects auth state, shows appropriate nav link, branded |
| `AuthPageSkeleton` | Matches auth card layout, branded |
| `CategoryEmptyState` | New component using `<Empty>` compound, extracted from inline JSX |
| `DashboardEmptyState` | Refactored to use `<Empty>` compound, no visual regression |
| `TaskEmptyState` | Refactored to use `<Empty>` compound, no visual regression |
| `CategorySkeleton` | No `"use client"` directive |
| All error boundaries | Consistent: AlertTriangle icon in circle, retry button, `min-h-[50vh]` |

### Visual Consistency Checklist

- [ ] All empty states use `bg-muted` icon containers
- [ ] All error boundaries use `bg-destructive/10` + `text-destructive` icons
- [ ] All loading states use `animate-pulse bg-muted` skeletons
- [ ] All error boundaries include retry button + optional navigation link
- [ ] All empty states include relevant icon + heading + description + CTA
- [ ] Dark mode renders correctly on all state UI

---

## 8. Testing Strategy

### Unit Tests

**No new unit tests required** for this feature — the changes are UI-only (templates, layouts, components). Existing validation and action tests continue to pass.

### Component Tests (Manual Verification)

List components to visually verify:

| Component | Test |
|-----------|------|
| `GlobalError` | Simulate root layout error (throw in layout), verify branded fallback renders |
| `NotFound` | Navigate to `/nonexistent-route`, verify branded 404 renders |
| `RootLoading` | Hard refresh on slow connection, verify branded loading state |
| `PublicLoading` | Navigate to `/sign-in` with slow network, verify auth skeleton |
| `ResetPassword` | Visit `/reset-password?token=xxx`, verify Suspense fallback shows spinner not text |
| `VerifyEmail` | Visit `/verify-email?token=xxx`, verify Suspense fallback shows spinner not text |
| `CategoryEmptyState` | Visit `/categories` with no categories, verify empty state |

### Visual Regression Checklist

- [ ] Dashboard empty state looks identical before/after refactor
- [ ] Task empty state (no tasks) looks identical before/after refactor
- [ ] Task empty state (filtered) looks identical before/after refactor
- [ ] Categories empty state looks identical before/after extraction
- [ ] All error boundaries look consistent across pages
- [ ] Dark mode renders correctly in all states

---

## 9. Implementation Notes

### Dependencies Already Installed
- `lucide-react` — Icons (AlertTriangle, FileQuestion, ClipboardList, Tags, SearchX, Spinner)
- shadcn/ui components: all needed primitives already installed (Button, Card, Skeleton)
- `<Empty>` compound component already available in `components/ui/empty.tsx`

### Global Error Boundary Considerations

Next.js 16 requires the `global-error.tsx` to:
1. Be a Client Component (`"use client"`)
2. Define its own `<html>` and `<body>` tags
3. Accept `{ error, reset }` props
4. Be placed at `app/global-error.tsx` (replaces the old `pages/_error.js` convention)

**Important:** The global error boundary cannot rely on the root layout's ThemeProvider, Toaster, or any other provider wrapping `{children}`. It must be fully self-contained. Use inline styles or a CSS module for dark mode support.

```tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        {/* Self-contained error UI */}
      </body>
    </html>
  );
}
```

### Not Found Page Considerations

The `app/not-found.tsx` is the catch-all for unknown routes. It runs after the root layout, so it has access to ThemeProvider, Toaster, etc. It can be a Server Component.

**Auth detection for 404 nav links:** Use `getSession()` from `lib/auth/session.ts` to determine whether to show "Go to Dashboard" (authenticated) or "Go Home" (unauthenticated).

### Categories Empty State Extraction

Current inline code in `app/(app)/categories/page.tsx`:

```tsx
{/* existing inline empty state */}
<div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
  <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
    <Tags className="size-6 text-primary" />
  </div>
  <h3 className="mb-1 text-lg font-semibold">No categories yet</h3>
  <p className="mb-4 text-sm text-muted-foreground">
    Create your first category to organize your tasks.
  </p>
  <CreateCategoryDialog />
</div>
```

This should be extracted to `components/categories/category-empty-state.tsx` and refactored to use:

```tsx
<Empty>
  <EmptyMedia variant="icon">
    <Tags className="size-4" />
  </EmptyMedia>
  <EmptyHeader>
    <EmptyTitle>No categories yet</EmptyTitle>
    <EmptyDescription>
      Create your first category to organize your tasks.
    </EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <CreateCategoryDialog />
  </EmptyContent>
</Empty>
```

### Existing Empty States to Refactor

**Dashboard `EmptyState`** (`components/dashboard/empty-state.tsx`):
- Current: Uses custom JSX with `ClipboardList` icon
- Target: Refactor to use `<Empty>` compound
- Maintain: Same icon, same CTA link to `/tasks`, same "Welcome to TaskFlow!" text

**Task `TaskEmptyState`** (`components/tasks/task-empty-state.tsx`):
- Current: Already context-aware (filtered vs global)
- Target: Refactor to use `<Empty>` compound
- Maintain: Dual-mode logic (filters vs no tasks), clear-filters callback

### Error Boundary Standard Template

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function SomePageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-6 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          An error occurred while loading this page. Please try again.
        </p>
        <div className="mt-6">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### CategorySkeleton Cleanup

Current `components/categories/category-skeleton.tsx`:
- Has `"use client"` directive but no hooks or browser APIs
- Remove `"use client"` to make it a Server Component

### Cache Invalidation Notes

Add recommendation comments to action files for future `revalidateTag` migration:

```typescript
// TODO (post-MVP): Consider migrating revalidatePath to revalidateTag
// for more granular cache invalidation as the app scales.
// Example: revalidateTag(`user-${userId}-tasks`)
```

---

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Global error boundary not rendering correctly | High — users see white screen on critical errors | Test by intentionally throwing in root layout; verify branded fallback renders |
| Dark mode not working in global-error.tsx | Medium — jarring flash if user is in dark mode | Use inline styles with `prefers-color-scheme` media query or CSS class |
| Empty state refactor changes visual appearance | Medium — regressions in layout/spacing | Compare screenshots before/after; test all empty states on mobile and desktop |
| Categories page has no inline empty state during refactor | Low — brief period where empty state is missing | Extract component first, then replace inline JSX in same PR |
| Not-found page doesn't handle edge case routes | Low | Test with multiple non-existent routes; verify `notFound()` calls from page files also trigger it |
| Cache invalidation misses a mutation path | Medium — stale data visible after action | Systematic review of all server actions; test create → view flow for each entity |
| `Suspense` fallback replacement breaks search params | Medium — `useSearchParams()` requires Suspense boundary | Keep `Suspense` wrapper; only replace the `fallback` prop value |
| `"use client"` removal from CategorySkeleton causes build error | Low — check no hooks used before removing | Read file first, verify no hooks, build after change |

---

## 11. Related Documentation

- **PRD.md** §7 — Information Architecture: empty states, error states
- **PRD.md** §8 — Responsive UX: loading UI, skeletons, accessibility
- **PRD.md** §22 — QA and Acceptance Checklist
- **Next.js 16 docs** — `global-error.tsx` convention
- **P1-F1 Project Initialization** — Existing root `loading.tsx`, `error.tsx`
- **P2-F1 Auth Pages UI** — Existing auth page Suspense boundaries
- **P2-F2 Dashboard Overview** — Existing `EmptyState` component
- **P2-F3 Task Management** — Existing `TaskEmptyState`
- **P2-F4 Category Management** — Existing categories page inline empty state
- **P3-F1 User Settings & Preferences** — Existing settings loading/error patterns (gold standard)
- **`components/ui/empty.tsx`** — Compound empty state component
- **`components/ui/skeleton.tsx`** — Base skeleton component
- **`components/ui/spinner.tsx`** — Spinner component

---

## 12. Definition of Done

### New Files
- [ ] `app/global-error.tsx` — Self-contained error boundary with html/body, retry, go home
- [ ] `app/not-found.tsx` — Branded 404 with auth-aware navigation link
- [ ] `app/(public)/loading.tsx` — Auth page loading skeleton
- [ ] `app/(public)/error.tsx` — Auth page error boundary
- [ ] `components/categories/category-empty-state.tsx` — Extracted empty state using <Empty> compound
- [ ] `components/auth/auth-page-skeleton.tsx` — Reusable auth page skeleton

### Updated Files
- [ ] `app/loading.tsx` — Branded loading (spinner + app name)
- [ ] `app/error.tsx` — Uses shadcn Button, AlertTriangle icon, card wrapper
- [ ] `app/(app)/categories/error.tsx` — Added AlertTriangle icon
- [ ] `app/(public)/reset-password/page.tsx` — Proper Suspense fallback
- [ ] `app/(public)/verify-email/page.tsx` — Proper Suspense fallback
- [ ] `components/categories/category-skeleton.tsx` — Removed unnecessary "use client"
- [ ] `components/dashboard/empty-state.tsx` — Refactored to use <Empty> compound
- [ ] `components/tasks/task-empty-state.tsx` — Refactored to use <Empty> compound

### Quality Gates
- [ ] All error boundaries visually consistent (icon, spacing, retry)
- [ ] All empty states visually consistent (icon container, heading, description, CTA)
- [ ] All loading states use branded skeletons (not raw text)
- [ ] All Suspense fallbacks use proper UI (not "Loading..." text)
- [ ] Dark mode renders correctly on all state UI
- [ ] Responsive: all states look good on mobile (320px), tablet (768px), desktop (1024px+)
- [ ] Build passes (`npm run build`)
- [ ] Manual testing checklist complete (simulate errors, empty data, slow loads)
- [ ] No visual regressions in existing empty/loading/error states

---

**Next Steps:**
1. Load this feature using the feature skill
2. Create branch `feature/P3-F2-improve-states`
3. Implement in order: `global-error.tsx` → `not-found.tsx` → Root loading/error → Public loading/error → Suspense fallbacks → Empty state standardization → Error boundary consistency → Skeleton cleanup → Cache invalidation review
4. Test thoroughly (visual regression, dark mode, responsive, error simulation)
5. Build and commit
