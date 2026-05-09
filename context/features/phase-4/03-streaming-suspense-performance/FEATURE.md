# Feature Specification: P4-F3 — Streaming & Suspense Performance

**Phase:** 4 — Hardening  
**Feature ID:** P4-F3  
**Feature Name:** Streaming & Suspense Performance  
**Status:** Draft — Ready for Implementation  
**Date:** 2026-05-09  
**Estimated Effort:** 30–45 minutes  
**Dependencies:** None (no new npm packages required)  
**Prerequisites:** P4-F2c should be completed first (task-filters.tsx already has `startTransition` fixes)  
**Branch:** `feature/P4-F3-streaming-suspense`

---

## 1. Overview

This feature refactors the `/tasks` page to use Next.js 16 streaming with `<Suspense>` boundaries, making filter interactions feel instant while the task list loads asynchronously. Instead of the entire page blocking on `getTasks()` (which queries the database), the page shell (header, filters, create button) renders immediately and the task list streams in with a skeleton placeholder.

### What You're Building

| # | Change | Impact | One-Line Summary |
|---|--------|--------|------------------|
| 1 | `TaskListLoader` server component | **High** | New async component that owns `getTasks()` + `getTaskCount()` fetching |
| 2 | Move task count message into loader | **Medium** | "Showing X of Y tasks" now renders inside the Suspense boundary |
| 3 | `<Suspense key={}>` on task list | **High** | Filter changes show skeleton immediately while new data loads |
| 4 | Remove `getTasks()` + `getTaskCount()` from page | **High** | Page no longer blocks on task queries |

### Why This Matters

**Current behavior:** When a user changes a filter, the browser waits for the full server round-trip (database query → HTML) before updating the UI. The page "freezes" for 200–500ms.

**Target behavior:** Filters update instantly (already done via `startTransition` in P4-F2c). The task list area shows a skeleton immediately and streams in when data is ready. The URL updates immediately for shareability.

---

## 2. Prerequisites

Before starting:

1. P4-F2c completed (`task-filters.tsx` has `startTransition` fixes for setState-in-effect)
2. Run `npm run build` with no errors
3. Run `npm run test` with all tests passing
4. `/tasks` page loads correctly with all current filters (status, priority, category, due date, sort, search)

---

## 3. Implementation Steps

### Step 1: Create `TaskListLoader` Server Component (#1)

> **Why?** Moving data fetching from the Page into a child Server Component creates an async boundary. Next.js 16 can stream the parent Page content immediately and suspend just this component until the database responds.

**File:** `components/tasks/task-list-loader.tsx` ← **CREATE**

```tsx
import { getTasks, getTaskCount } from "@/lib/data/task";
import { TaskList } from "./task-list";
import { TaskEmptyState } from "./task-empty-state";
import type { TaskQueryParams } from "@/lib/validation/task";

interface TaskListLoaderProps {
  userId: string;
  query: Partial<TaskQueryParams>;
  timezone: string;
}

export async function TaskListLoader({ userId, query, timezone }: TaskListLoaderProps) {
  const statusFilter = query.status;
  const priorityFilter = query.priority;
  const categoryFilter = query.category;
  const searchQuery = query.q;
  const dueDateFilter = query.dueDate;
  const sortField = query.sort;
  const sortOrder = query.order;
  const groupBy = query.groupBy ?? "none";

  const [tasks, totalTaskCount] = await Promise.all([
    getTasks(
      userId,
      {
        status: statusFilter,
        priority: priorityFilter,
        categoryId: categoryFilter,
        search: searchQuery,
        dueDate: dueDateFilter,
        sortField,
        sortOrder,
      },
      timezone
    ),
    getTaskCount(userId),
  ]);

  const hasFilters =
    !!statusFilter?.length ||
    !!priorityFilter?.length ||
    !!categoryFilter ||
    !!searchQuery ||
    !!dueDateFilter;

  const hasSortOrGroup =
    sortField !== undefined || sortOrder !== undefined || groupBy !== "none";

  return (
    <>
      <p className="text-sm text-muted-foreground">
        {tasks.length === totalTaskCount
          ? `Showing ${tasks.length} task${tasks.length !== 1 ? "s" : ""}`
          : `Showing ${tasks.length} of ${totalTaskCount} task${totalTaskCount !== 1 ? "s" : ""}`}
      </p>

      {tasks.length > 0 ? (
        <TaskList tasks={tasks} timezone={timezone} groupBy={groupBy} />
      ) : (
        <TaskEmptyState hasFilters={hasFilters || hasSortOrGroup} />
      )}
    </>
  );
}
```

> **Note:** This is a Server Component (no `"use client"`). It uses the same `getTasks()` and `getTaskCount()` functions already in `lib/data/task.ts`. No new data layer code needed.

#### 3.1.1 Verify

```
npm run build
```

Expected: build passes, `TaskListLoader` compiles.

---

### Step 2: Refactor `tasks/page.tsx` (#2, #3, #4)

> **Why?** The page currently fetches tasks directly with `await getTasks(...)`, blocking the entire page render. By moving that fetch into `TaskListLoader` and wrapping it in `<Suspense key={...}>`, the page shell streams immediately and the task list loads with a skeleton.

**File:** `app/(app)/tasks/page.tsx` ← **MODIFY**

#### 3.2.1 Remove task fetching from the page

Remove these imports (no longer used by the page):
- `getTasks` — moved to `TaskListLoader`
- `getTaskCount` — moved to `TaskListLoader`
- `TaskList` — moved to `TaskListLoader`
- `TaskEmptyState` — moved to `TaskListLoader`

Add this import:
- `TaskListLoader` from `@/components/tasks/task-list-loader`

#### 3.2.2 Remove task-related logic from the page

Remove these variables (now computed inside `TaskListLoader`):
```ts
const statusFilter = query.status;
const priorityFilter = query.priority;
const categoryFilter = query.category;
const searchQuery = query.q;
const dueDateFilter = query.dueDate;
const sortField = query.sort;
const sortOrder = query.order;
const groupBy = query.groupBy ?? "none";
```

Remove these `await` calls:
```ts
const [tasks, categories, totalTaskCount] = await Promise.all([
    getTasks(user.id, { ... }, timezone),
    getCategoriesForUser(user.id),
    getTaskCount(user.id),
  ]);
```

Replace with only the categories fetch (still needed by `TaskFilters`):
```ts
const [timezone, categories] = await Promise.all([
    getUserTimezone(user.id),
    getCategoriesForUser(user.id),
  ]);
```

Remove these computed values (now inside `TaskListLoader`):
```ts
const hasFilters = ...;
const hasSortOrGroup = ...;
```

#### 3.2.3 Move the task count message into Suspense

The "Showing X of Y tasks" message moves into `TaskListLoader` (inside the Suspense boundary). Remove it from the page.

#### 3.2.4 Add Suspense with key around TaskListLoader

Wrap `TaskListLoader` in `<Suspense>` with a `key` that changes when filters change. The `key` ensures Next.js resets the Suspense boundary and shows the skeleton on every filter change:

```tsx
<Suspense
  key={JSON.stringify(query)}
  fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}
>
  <TaskListLoader userId={user.id} query={query} timezone={timezone} />
</Suspense>
```

**Why `JSON.stringify(query)`?** When filters change, `query` changes → `key` changes → React unmounts the old content and shows the fallback skeleton → new `TaskListLoader` fetches fresh data → content streams in.

#### 3.2.5 Final page structure

```tsx
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/session";
import { getCategoriesForUser } from "@/lib/data/task";
import { getUserTimezone } from "@/lib/data/preferences";
import { TaskFilters } from "@/components/tasks/task-filters";
import { FilterChips } from "@/components/tasks/filter-chips";
import { TaskListLoader } from "@/components/tasks/task-list-loader";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { taskQueryParamsSchema } from "@/lib/validation/task";

interface TasksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const { user } = await requireAuth();

  if (!user) {
    redirect("/sign-in");
  }

  const params = await searchParams;

  const validated = taskQueryParamsSchema.safeParse(params);
  const query = validated.success ? validated.data : {};

  // Fast: only fetch what filters need immediately
  const [timezone, categories] = await Promise.all([
    getUserTimezone(user.id),
    getCategoriesForUser(user.id),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-4 md:p-6">
        {/* Header: renders immediately */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Tasks</h1>
          </div>
          <CreateTaskDialog />
        </div>

        {/* Filters: client component with useSearchParams, needs Suspense */}
        <Suspense fallback={<div className="h-11" />}>
          <TaskFilters categories={categories} />
          <FilterChips categories={categories} />
        </Suspense>

        {/* Task list: streams in, shows skeleton on filter changes */}
        <Suspense
          key={JSON.stringify(query)}
          fallback={<div className="animate-pulse h-32 bg-muted rounded-lg" />}
        >
          <TaskListLoader userId={user.id} query={query} timezone={timezone} />
        </Suspense>
      </main>
    </div>
  );
}
```

#### 3.2.6 Verify

```
npm run build
npm run lint
npm run test
```

Expected: build passes, lint passes, all tests pass. Visit `/tasks` — header + filters appear instantly, task list shows skeleton then fills in.

---

## 4. File Change Summary

### Files Created
| File | What |
|------|------|
| `components/tasks/task-list-loader.tsx` | New Server Component that fetches `getTasks()` + `getTaskCount()` and renders `TaskList` or `TaskEmptyState` |

### Files Modified
| File | What Changed |
|------|-------------|
| `app/(app)/tasks/page.tsx` | Removed `getTasks()`, `getTaskCount()`, `TaskList`, `TaskEmptyState` imports. Removed task fetching and filter variables. Added `TaskListLoader` with `<Suspense key={}>` |

### Files Deleted
- None

---

## 5. Acceptance Criteria

### Performance Criteria

| # | Issue | Check | Status |
|---|-------|-------|--------|
| 1 | TaskListLoader | New server component exists and compiles | ☐ |
| 2 | Suspense boundary | `TaskListLoader` wrapped in `<Suspense key={...}>` | ☐ |
| 3 | Skeleton fallback | Filter changes show skeleton placeholder immediately | ☐ |
| 4 | Streaming | Page shell renders before task data arrives | ☐ |
| 5 | Content | Task count message and list render correctly inside loader | ☐ |

### Functional Criteria

| # | Issue | Check | Status |
|---|-------|-------|--------|
| 6 | Filters still work | Status/priority/category/due date filters work | ☐ |
| 7 | Search still works | Debounced search updates URL and task list | ☐ |
| 8 | Sort still works | Sort field and order apply correctly | ☐ |
| 9 | Grouping still works | Tasks group by status/category/due date | ☐ |
| 10 | Empty state | Shows when no tasks match filters | ☐ |
| 11 | Task detail link | Clicking a task navigates to `/tasks/[taskId]` | ☐ |
| 12 | Browser back/forward | Filter state preserved in URL history | ☐ |
| 13 | Reset button | Clears all filters and shows full task list | ☐ |

### Quality Gates

- [ ] `npm run build` passes
- [ ] `npm run lint` passes — zero new warnings
- [ ] `npm run test` passes (all existing tests still pass)
- [ ] `/tasks` page loads correctly with all filter combinations
- [ ] No "Missing Suspense boundary" errors in production build logs
- [ ] Task count message shows correct numbers

---

## 6. Implementation Order

| Step | Files | Time | What To Do |
|------|-------|------|-----------|
| 1 | `components/tasks/task-list-loader.tsx` | 10 min | Create new server component |
| 2 | `app/(app)/tasks/page.tsx` | 15 min | Refactor page: remove task fetch, add Suspense + loader |
| 3 | Build + lint + test | 5 min | `npm run build; npm run lint; npm run test` |
| 4 | Manual testing | 10 min | Test all filter/search/sort/group/reset flows |

---

## 7. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| `JSON.stringify(query)` key causes too many re-renders | **Low** | Low | Only changes when filter values actually change. The validated query is deterministic per URL state. |
| Categories fetch adds latency to filter render | **Low** | Low | Categories are cached via `use cache` and lightweight. They remain in the page to avoid a second Suspense layer for filters. |
| Task count drifts between page and loader | **Low** | Low | Both `getTasks()` and `getTaskCount()` are scoped to the same `userId` and cached with the same tag. No inconsistency. |
| Skeleton flash on every filter change | **Medium** | Medium | This is intentional — it replaces the "frozen page" with a loading indicator. If skeleton flickers on fast connections, increase the `fallback` delay or remove it. |
| Type mismatch: `Partial<TaskQueryParams>` vs `GetTasksOptions` | **Low** | Low | All `TaskQueryParams` fields map directly to `GetTasksOptions` fields. Zod validation ensures type safety before it reaches the loader. |

---

## 8. Related Documentation

- **Next.js 16 docs** — [Streaming with Suspense](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- **Next.js 16 docs** — [useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- **React 19 docs** — [Suspense](https://react.dev/reference/react/Suspense)
- **React 19 docs** — [startTransition](https://react.dev/reference/react/startTransition)
- **P4-F2c FEATURE.md** — `startTransition` fixes applied to `task-filters.tsx`
- **PRD.md** — Phase 4 Hardening (performance review)
