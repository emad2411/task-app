# Feature Specification: P4-F2b — Data Layer & Action Cleanup

**Phase:** 4 — Hardening  
**Feature ID:** P4-F2b  
**Feature Name:** Data Layer & Action Cleanup  
**Status:** Draft — Ready for Implementation  
**Date:** 2026-05-04  
**Estimated Effort:** 1.5–2 hours  
**Dependencies:** None (no new npm packages required)  
**Prerequisites:** P4-F2a should be completed first (ActionResult type extraction)  
**Branch:** `feature/P4-F2b-data-layer-action-cleanup`

---

## 1. Overview

This feature fixes the data layer performance issues and action-level cleanup items from the code review. These are the changes that touch database queries, cache invalidation, and server action logic.

### What You're Fixing

| # | Suggestion | Risk | One-Line Summary |
|---|-----------|------|------------------|
| 7 | Dashboard N+1 Query Pattern | **Medium** | 4 separate count queries can be 1 with CASE aggregation |
| 8 | Fetching All Dashboard Data for Timezone | **Medium** | Tasks page calls `getDashboardData()` (6 queries) just to get timezone |
| 9 | Redundant revalidatePath Calls | **Low** | `revalidatePath` calls are redundant when `revalidateTag` already used |
| 10 | Preferences Upsert Race Condition | **Medium** | Read-then-write pattern in `upsertUserPreferences` has a race |
| 11 | Double User Name Update | **Low** | `updateProfileAction` updates users table twice |

---

## 2. Prerequisites

Before starting:

1. P4-F2a completed (ActionResult extracted to `lib/actions/types.ts`)
2. Run `npm run build` with no errors
3. Run `npm run test` with all tests passing
4. Dashboard displays correct stats (note current values for comparison)

---

## 3. Implementation Steps

### Step 1: Consolidate Dashboard Stat Queries (#7)

> **Why?** The dashboard currently runs 4 separate `SELECT count(*)` queries for stats (dueToday, overdue, completedToday, totalActive). These can be combined into a single query using SQL `CASE` conditional aggregation, reducing database round trips from 6 to 3.

**File:** `lib/data/dashboard.ts` ← **MODIFY**

#### 3.1.1 Add the `sql` and `sum` imports

**Before (line 2):**
```ts
import { eq, and, count, gte, lt, isNull, asc } from "drizzle-orm";
```

**After:**
```ts
import { eq, and, count, gte, lt, isNull, asc, sql } from "drizzle-orm";
```

#### 3.1.2 Replace the 4 stat queries with one

Find lines 134–189 (the four separate stat queries). Replace them with a single conditional aggregation query:

**Before (lines 134–189):**
```ts
  // --- Stat 1: Tasks due today ---
  const [dueTodayResult] = await db
    .select({ count: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, "todo"),
        gte(tasks.dueDate, todayStart),
        lt(tasks.dueDate, todayEnd)
      )
    );

  // --- Stat 2: Overdue tasks ---
  const [overdueResult] = await db
    .select({ count: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, "todo"),
        lt(tasks.dueDate, todayStart),
        isNull(tasks.completedAt)
      )
    );

  // --- Stat 3: Tasks completed today ---
  const [completedTodayResult] = await db
    .select({ count: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        gte(tasks.completedAt, todayStart),
        lt(tasks.completedAt, todayEnd)
      )
    );

  // --- Stat 4: Total active tasks ---
  const [totalActiveResult] = await db
    .select({ count: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, "todo")
      )
    );
```

**After:**
```ts
  // --- All 4 stats in a single query using conditional aggregation ---
  // Each CASE expression counts rows matching specific criteria.
  // This reduces 4 database round trips to 1.
  const [statsResult] = await db
    .select({
      dueToday: sql<number>`coalesce(sum(case when ${tasks.status} = 'todo' and ${tasks.dueDate} >= ${todayStart} and ${tasks.dueDate} < ${todayEnd} then 1 else 0 end), 0)`.mapWith(Number),
      overdue: sql<number>`coalesce(sum(case when ${tasks.status} = 'todo' and ${tasks.dueDate} < ${todayStart} and ${tasks.completedAt} is null then 1 else 0 end), 0)`.mapWith(Number),
      completedToday: sql<number>`coalesce(sum(case when ${tasks.completedAt} >= ${todayStart} and ${tasks.completedAt} < ${todayEnd} then 1 else 0 end), 0)`.mapWith(Number),
      totalActive: sql<number>`coalesce(sum(case when ${tasks.status} = 'todo' then 1 else 0 end), 0)`.mapWith(Number),
    })
    .from(tasks)
    .where(eq(tasks.userId, userId));
```

**Key details:**
- `coalesce(..., 0)` ensures we get `0` instead of `null` when no tasks exist
- `.mapWith(Number)` converts the SQL result to a JavaScript number
- Drizzle's `sql` template uses `${tasks.status}` to reference column names safely
- Date parameters (`${todayStart}`, `${todayEnd}`) are parameterized — no SQL injection risk

#### 3.1.3 Update the return statement

**Before (lines 259–265):**
```ts
    stats: {
      dueToday: dueTodayResult?.count ?? 0,
      overdue: overdueResult?.count ?? 0,
      completedToday: completedTodayResult?.count ?? 0,
      totalActive: totalActiveResult?.count ?? 0,
    },
```

**After:**
```ts
    stats: {
      dueToday: statsResult?.dueToday ?? 0,
      overdue: statsResult?.overdue ?? 0,
      completedToday: statsResult?.completedToday ?? 0,
      totalActive: statsResult?.totalActive ?? 0,
    },
```

#### 3.1.4 Verify

1. Run `npm run build` — should pass
2. Start dev server, visit `/dashboard`
3. Compare stat values with what you noted in Prerequisites — they should be identical

---

### Step 2: Create Lightweight `getUserTimezone` Function (#8)

> **Why?** The tasks page (`app/(app)/tasks/page.tsx`) currently calls `getDashboardData(user.id)` — which runs 6 queries (now 3 after Step 1) — just to get the user's timezone string. A dedicated function that queries only `userPreferences` avoids all that overhead.

**File:** `lib/data/preferences.ts` ← **MODIFY**

#### 3.2.1 Add the new function at the bottom of the file

```ts
/**
 * Get just the user's timezone preference.
 *
 * This is a lightweight alternative to getDashboardData() when you
 * only need the timezone string (e.g., for the tasks page).
 *
 * @param userId - The authenticated user's ID
 * @returns The user's timezone string, defaults to "UTC"
 */
export async function getUserTimezone(userId: string): Promise<string> {
  "use cache";
  cacheLife("hours");
  cacheTag(`user-${userId}-preferences`);

  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
    columns: { timezone: true },
  });
  return prefs?.timezone ?? "UTC";
}
```

**Key details:**
- `columns: { timezone: true }` — only selects the timezone column, not the entire row
- Uses the same cache tag as `getUserPreferences` so it invalidates together
- Falls back to `"UTC"` if no preferences exist

#### 3.2.2 Update the tasks page to use `getUserTimezone`

**File:** `app/(app)/tasks/page.tsx` ← **MODIFY**

**Before (line 4):**
```ts
import { getDashboardData } from "@/lib/data/dashboard";
```

**After:**
```ts
import { getUserTimezone } from "@/lib/data/preferences";
```

**Before (lines 38–39):**
```ts
  // Get timezone first (needed for due date filtering)
  const { timezone } = await getDashboardData(user.id);
```

**After:**
```ts
  // Get timezone (lightweight query — only reads userPreferences)
  const timezone = await getUserTimezone(user.id);
```

#### 3.2.3 Verify

1. Run `npm run build` — should pass
2. Visit `/tasks` — timezone-based filtering and grouping should work identically

---

### Step 3: Remove Redundant `revalidatePath` Calls (#9)

> **Why?** Every server action calls both `revalidateTag(...)` and `revalidatePath(...)`. The `revalidateTag` calls with the `"max"` flag already invalidate all cached responses that have that tag. The `revalidatePath` calls are redundant and add unnecessary overhead.

#### 3.3.1 Fix `lib/actions/task.ts`

**File:** `lib/actions/task.ts` ← **MODIFY**

**Remove the `revalidatePath` import:**

**Before (line 3):**
```ts
import { revalidateTag, revalidatePath } from "next/cache";
```

**After:**
```ts
import { revalidateTag } from "next/cache";
```

**Remove all `revalidatePath(...)` calls** — there are 9 total across the 5 actions:

In `createTaskAction` (lines 35–36), remove:
```ts
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
```

In `updateTaskAction` (lines 69–71), remove:
```ts
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${id}`);
```

In `deleteTaskAction` (lines 95–96), remove:
```ts
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
```

In `toggleTaskCompletionAction` (lines 128–130), remove:
```ts
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${taskId}`);
```

In `archiveTaskAction` (lines 158–160), remove:
```ts
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${taskId}`);
```

Keep all `revalidateTag(...)` calls — those handle invalidation.

#### 3.3.2 Fix `lib/actions/category.ts`

**File:** `lib/actions/category.ts` ← **MODIFY**

**Remove the `revalidatePath` import:**

**Before (line 3):**
```ts
import { revalidateTag, revalidatePath } from "next/cache";
```

**After:**
```ts
import { revalidateTag } from "next/cache";
```

**Remove all `revalidatePath(...)` calls** — there are 9 total across the 3 actions:

In `createCategoryAction` (lines 44–46), remove:
```ts
    revalidatePath("/categories");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
```

In `updateCategoryAction` (lines 99–101), remove:
```ts
    revalidatePath("/categories");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
```

In `deleteCategoryAction` (lines 136–138), remove:
```ts
    revalidatePath("/categories");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
```

#### 3.3.3 Fix `lib/actions/settings.ts`

**File:** `lib/actions/settings.ts` ← **MODIFY**

**Remove the `revalidatePath` import:**

**Before (line 4):**
```ts
import { revalidateTag, revalidatePath } from "next/cache";
```

**After:**
```ts
import { revalidateTag } from "next/cache";
```

**Remove all `revalidatePath(...)` calls:**

In `updateProfileAction` (lines 50–51), remove:
```ts
    revalidatePath("/settings");
    revalidatePath("/dashboard");
```

In `updatePreferencesAction` (lines 76–78), remove:
```ts
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
```

#### 3.3.4 Verify

1. Run `npm run build`
2. Test a mutation (create a task, update preferences, etc.)
3. Navigate to the relevant page — data should refresh correctly via tag invalidation

---

### Step 4: Fix Preferences Upsert Race Condition (#10)

> **Why?** `upsertUserPreferences` reads preferences first, then decides to INSERT or UPDATE. If two concurrent requests arrive, both read "no record exists", both try to INSERT, and one fails with a unique constraint violation. Drizzle's `onConflictDoUpdate` handles this atomically.

**File:** `lib/data/preferences.ts` ← **MODIFY**

**Replace the entire `upsertUserPreferences` function:**

**Before (lines 29–60):**
```ts
export async function upsertUserPreferences(
  userId: string,
  data: Partial<{
    theme: "light" | "dark" | "system";
    timezone: string;
    dateFormat: string;
    defaultTaskSort: string;
  }>
) {
  const existing = await getUserPreferences(userId);

  if (existing) {
    const [updated] = await db
      .update(userPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(userPreferences)
    .values({
      userId,
      theme: data.theme ?? "system",
      timezone: data.timezone ?? "UTC",
      dateFormat: data.dateFormat ?? "MM/dd/yyyy",
      defaultTaskSort: data.defaultTaskSort ?? "due_date_asc",
    })
    .returning();
  return created;
}
```

**After:**
```ts
export async function upsertUserPreferences(
  userId: string,
  data: Partial<{
    theme: "light" | "dark" | "system";
    timezone: string;
    dateFormat: string;
    defaultTaskSort: string;
  }>
) {
  const [result] = await db
    .insert(userPreferences)
    .values({
      userId,
      theme: data.theme ?? "system",
      timezone: data.timezone ?? "UTC",
      dateFormat: data.dateFormat ?? "MM/dd/yyyy",
      defaultTaskSort: data.defaultTaskSort ?? "due_date_asc",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        ...data,
        updatedAt: new Date(),
      },
    })
    .returning();
  return result;
}
```

**Key details:**
- `onConflictDoUpdate` — if the `userId` already exists, it updates instead of throwing
- `createdAt` is in `.values()` but NOT in `.set:` — so it's only written on initial insert
- `updatedAt` is in both — always set to now
- No more `getUserPreferences` call before the write — one atomic operation

---

### Step 5: Remove Double User Name Update (#11)

> **Why?** `updateProfileAction` calls `auth.api.updateUser()` (which updates the `users` table via Better Auth) and then ALSO runs a direct `db.update(users)`. The second update is redundant — Better Auth already writes to the same table.

**File:** `lib/actions/settings.ts` ← **MODIFY**

**Remove the direct Drizzle update and its unused imports:**

**Before (lines 34–46):**
```ts
    // Update via Better Auth to ensure session is refreshed
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: validated.name,
      },
    });

    // Also update directly via Drizzle as fallback/synchronization
    await db
      .update(users)
      .set({ name: validated.name, updatedAt: new Date() })
      .where(eq(users.id, userId));
```

**After:**
```ts
    // Update via Better Auth — it updates the users table and refreshes the session
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: validated.name,
      },
    });
```

**Then remove the unused imports that were only needed for the direct update:**

**Before (lines 7–9):**
```ts
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
```

**After:** Delete all three lines. They are no longer used in this file.

> **Note:** `requireUserId` still uses `@/lib/auth/session`, not these db imports. Verify that no other code in `settings.ts` references `db`, `users`, or `eq` before removing.

#### 3.5.1 Verify

1. Run `npm run build`
2. Log in, go to Settings → Profile
3. Change your display name
4. Confirm the name updates in the sidebar/header

---

## 4. File Change Summary

### Files Created
- None

### Files Modified
| File | What Changed |
|------|-------------|
| `lib/data/dashboard.ts` | 4 stat queries → 1 conditional aggregation query (#7) |
| `lib/data/preferences.ts` | Added `getUserTimezone()` (#8), `onConflictDoUpdate` for upsert (#10) |
| `app/(app)/tasks/page.tsx` | Uses `getUserTimezone` instead of `getDashboardData` (#8) |
| `lib/actions/task.ts` | Removed `revalidatePath` import + 9 calls (#9) |
| `lib/actions/category.ts` | Removed `revalidatePath` import + 9 calls (#9) |
| `lib/actions/settings.ts` | Removed `revalidatePath` import + 5 calls (#9), removed double update + unused db imports (#11) |

### Files Deleted
- None

---

## 5. Acceptance Criteria

### Performance Criteria

| # | Issue | Check | Status |
|---|-------|-------|--------|
| 7 | Dashboard queries | 4 stat queries consolidated into 1 | ☐ |
| 7 | Dashboard queries | Total dashboard queries reduced from 6 to 3 | ☐ |
| 7 | Dashboard queries | Stat values match previous implementation | ☐ |
| 7 | Dashboard queries | `use cache`, `cacheTag`, `cacheLife` preserved | ☐ |
| 8 | Timezone fetch | `getUserTimezone` function exists in `lib/data/preferences.ts` | ☐ |
| 8 | Timezone fetch | Tasks page imports `getUserTimezone` not `getDashboardData` | ☐ |
| 8 | Timezone fetch | Tasks page no longer triggers dashboard queries | ☐ |
| 9 | Redundant invalidation | No `revalidatePath` imports in `task.ts`, `category.ts`, `settings.ts` | ☐ |
| 9 | Redundant invalidation | No `revalidatePath(...)` calls in any action file | ☐ |
| 9 | Redundant invalidation | Cache still invalidates correctly after mutations | ☐ |

### Correctness Criteria

| # | Issue | Check | Status |
|---|-------|-------|--------|
| 10 | Preferences race | `upsertUserPreferences` uses `onConflictDoUpdate` | ☐ |
| 10 | Preferences race | No read-then-write pattern remains | ☐ |
| 10 | Preferences race | `createdAt` only set on insert, not update | ☐ |
| 10 | Preferences race | `updatedAt` set on both insert and update | ☐ |
| 11 | Double update | No direct `db.update(users)` in `updateProfileAction` | ☐ |
| 11 | Double update | `db`, `users`, `eq` imports removed from `settings.ts` | ☐ |
| 11 | Double update | User name still updates correctly via Better Auth | ☐ |

### Quality Gates

- [ ] `npm run build` passes
- [ ] `npm run lint` passes — zero warnings
- [ ] `npm run test` passes
- [ ] Dashboard stats display correctly
- [ ] Tasks page timezone filtering works
- [ ] Profile name update works
- [ ] Preferences update works
- [ ] No stale data after mutations

---

## 6. Implementation Order

| Step | Files | Time | What To Do |
|------|-------|------|-----------|
| 1 | `lib/data/dashboard.ts` | 15 min | Consolidate 4 stat queries into 1 (#7) |
| 2 | `lib/data/preferences.ts` | 10 min | Add `getUserTimezone` function (#8) |
| 3 | `app/(app)/tasks/page.tsx` | 5 min | Switch to `getUserTimezone` (#8) |
| 4 | `lib/actions/task.ts` | 5 min | Remove `revalidatePath` import + calls (#9) |
| 5 | `lib/actions/category.ts` | 5 min | Remove `revalidatePath` import + calls (#9) |
| 6 | `lib/actions/settings.ts` | 5 min | Remove `revalidatePath` import + calls (#9), remove double update + db imports (#11) |
| 7 | `lib/data/preferences.ts` | 10 min | Replace upsert with `onConflictDoUpdate` (#10) |
| 8 | Build + lint + test | 5 min | `npm run build; npm run lint; npm run test` |

---

## 7. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| CASE aggregation produces wrong counts | **High** | Medium | Compare dashboard stats before/after with same data. Log raw query result temporarily if numbers look off. |
| `onConflictDoUpdate` doesn't set `createdAt` correctly | **Medium** | Low | `createdAt` is in `.values()` but NOT in `.set:`. Test with both new and existing preferences. |
| Removing `revalidatePath` causes stale UI | **Medium** | Low | `revalidateTag` with `"max"` should handle it. If a page shows stale data, add the specific tag to that page's `cacheTag` call. |
| Removing db imports from settings.ts breaks something | **Low** | Low | Only `updateProfileAction` used those imports. `updatePreferencesAction` uses `upsertUserPreferences` which has its own db import. |
| `getUserTimezone` cache tag out of sync | **Low** | Low | Uses same tag (`user-${userId}-preferences`) as `getUserPreferences`, so they invalidate together. |

---

## 8. Related Documentation

- **code-review-report.md** — Suggestions #7, #8, #9, #10, #11
- **P4-F2 FEATURE.md** — Parent feature spec
- **Drizzle ORM docs** — `onConflictDoUpdate`: https://orm.drizzle.team/docs/insert#on-conflict-do-update
- **Drizzle ORM docs** — `sql` template: https://orm.drizzle.team/docs/sql
