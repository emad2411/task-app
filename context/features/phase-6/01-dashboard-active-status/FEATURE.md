# P6-F1 Dashboard Active Status Correctness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase:** 6 - Code Review Remediation  
**Feature ID:** P6-F1  
**Status:** Draft - Ready for Implementation  
**Date:** 2026-07-18  
**Source:** `code-review-2026-07-17.md`, blocker #1  
**Branch:** `fix/P6-F1-dashboard-active-status`  

**Goal:** Ensure every dashboard workload query treats both `todo` and `in_progress` tasks as active so metrics, charts, upcoming work, category counts, and empty-state selection remain accurate.

**Architecture:** Define a single typed active-status list and a local Drizzle predicate factory in `lib/data/dashboard.ts`. Reuse the predicate in conditional aggregate expressions, query filters, and category joins; add construction-level tests that require both statuses at all seven current predicate sites, then verify end-to-end query wiring with an in-progress-only browser fixture.

**Tech Stack:** TypeScript 5, Next.js 16 cached server data functions, Drizzle ORM 0.45, PostgreSQL, Vitest 4

---

## 1. Problem Statement

`lib/data/dashboard.ts` currently treats only `todo` tasks as active. A user whose remaining work is entirely `in_progress` receives `totalActive = 0`; `app/(app)/dashboard/page.tsx` can therefore render the empty state even though active work exists. The same mismatch excludes in-progress work from Due Today, Overdue, priority distribution, upcoming tasks, and category breakdown.

The task list already treats `todo` and `in_progress` as active for its overdue filter in `lib/data/task.ts:98`. This plan makes the dashboard consistent with that behavior and with the task status enum in `lib/db/schema.ts:14-19`.

---

## 2. Scope

### In Scope

- Define active statuses once as `todo` and `in_progress`.
- Replace all dashboard `todo`-only active predicates.
- Cover the five active predicates executed by `getDashboardData()`.
- Cover the two active predicates executed by `getCategoryBreakdown()`.
- Preserve user scoping, timezone boundaries, ordering, limits, cache configuration, and response types.
- Verify the dashboard does not show an empty state when only in-progress tasks exist.

### Out of Scope

- Completion trend and weekly velocity query consolidation (review issue #7).
- Timezone write-path and timestamp schema corrections (issues #3 and #4).
- Task list default visibility behavior (issue #12).
- Database-backed authorization integration tests (issue #13).
- Any schema or migration change.
- UI redesign or dashboard component changes.

---

## 3. Design Decision

### Selected Approach: Shared `inArray` Predicate

Add one typed constant and one local predicate factory:

```ts
const ACTIVE_TASK_STATUSES = ["todo", "in_progress"] satisfies TaskStatus[];

function activeTaskStatusCondition() {
  return inArray(tasks.status, ACTIVE_TASK_STATUSES);
}
```

Use `activeTaskStatusCondition()` everywhere the dashboard means "active." Drizzle documents `inArray(column, values)` as the SQL-like operator for a column matching a literal value list, and Drizzle filter operators are SQL expressions that can be interpolated into the existing `sql` tagged-template `CASE` expressions.

### Alternatives Rejected

1. **Repeat `or(eq(status, "todo"), eq(status, "in_progress"))`:** Correct but duplicates the domain definition across seven sites and makes future drift likely.
2. **Use `notInArray(status, ["done", "archived"])`:** Also correct today, but silently treats any future non-active enum value as active. An allowlist is safer.
3. **Move the predicate to a new shared module:** Unnecessary for this focused fix because only the dashboard data module needs the definition. Extract only if another production module later needs the exact same predicate.

---

## 4. File Map

### Files Modified

| File | Responsibility | Planned Change |
|---|---|---|
| `lib/data/dashboard.ts` | Cached dashboard queries and analytics | Import `inArray`, define the active-status predicate, and replace seven `todo`-only predicates. |
| `lib/data/__tests__/dashboard.test.ts` | Dashboard data-layer unit tests | Spy on `inArray`, support category query mocks, and assert both query paths construct all current active predicates with both statuses. |
| `context/current-feature.md` | Active workflow state | Record P6-F1 as in progress before implementation and preserve the append-only history. |

### Files Created

None.

### Files Deleted

None.

---

## 5. Exact Query Coverage

| Query | Current Predicate | Target Predicate |
|---|---|---|
| Due Today aggregate | `status = 'todo'` | `status in ('todo', 'in_progress')` |
| Overdue aggregate | `status = 'todo'` | `status in ('todo', 'in_progress')` |
| Total Active aggregate | `status = 'todo'` | `status in ('todo', 'in_progress')` |
| Priority distribution | `eq(tasks.status, "todo")` | shared active-status predicate |
| Upcoming tasks | `eq(tasks.status, "todo")` | shared active-status predicate |
| Categorized task join | `eq(tasks.status, "todo")` | shared active-status predicate |
| Uncategorized task count | `eq(tasks.status, "todo")` | shared active-status predicate |

`completedToday`, `getCompletionTrend()`, and `getWeeklyVelocity()` remain based on `completedAt`; they must not receive an active-status filter.

---

## 6. Implementation Tasks

### Task 1: Initialize the Workflow and Establish the Baseline

**Files:**
- Modify: `context/current-feature.md:1-19`

- [ ] **Step 1: Create the dedicated fix branch**

Run:

```bash
git switch -c fix/P6-F1-dashboard-active-status
```

Expected: Git creates and switches to `fix/P6-F1-dashboard-active-status` without changing or discarding the existing worktree changes.

- [ ] **Step 2: Record the active fix in the workflow document**

Replace the sections above `## History` in `context/current-feature.md` with the following and leave the existing history unchanged:

```md
# Current Feature

## Status

In Progress

## Feature

P6-F1: Dashboard Active Status Correctness

## Goals

- [ ] Include `todo` and `in_progress` tasks in every active dashboard query.
- [ ] Add focused active-status regression coverage.
- [ ] Pass tests, lint, build, and in-progress-only browser verification.

## Notes

- Source: `code-review-2026-07-17.md`, blocker #1.
- Plan: `context/features/phase-6/01-dashboard-active-status/FEATURE.md`.
- Branch: `fix/P6-F1-dashboard-active-status`.

## History
```

- [ ] **Step 3: Repair the dependency installation**

Run:

```bash
npm ci
```

Expected: npm exits with code 0 and restores the missing Next.js and Vitest packages. Do not use this step to alter application source files.

- [ ] **Step 4: Run the existing dashboard tests**

Run:

```bash
npm run test -- lib/data/__tests__/dashboard.test.ts
```

Expected: the existing dashboard test file passes before remediation. If it fails for a pre-existing reason, record the failure and resolve the environment problem before changing production code.

- [ ] **Step 5: Run the repository baseline gates**

Run:

```bash
npm run test
npm run lint -- --max-warnings=0
npm run build
```

Expected: each command exits with code 0. If an unrelated baseline failure remains, stop and report it rather than mixing it into P6-F1.

### Task 2: Add Failing Active-Status Regression Tests

**Files:**
- Modify: `lib/data/__tests__/dashboard.test.ts:1-120`
- Test: `lib/data/__tests__/dashboard.test.ts`

- [ ] **Step 1: Add an `inArray` spy that delegates to the real Drizzle operator**

Add this hoisted spy after the Vitest import and before the database mock:

```ts
const { mockInArray } = vi.hoisted(() => ({
  mockInArray: vi.fn(),
}));

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  const trackedInArray = ((column: unknown, values: unknown[]) => {
    mockInArray(column, values);
    return actual.inArray(column as never, values as never);
  }) as typeof actual.inArray;

  return {
    ...actual,
    inArray: trackedInArray,
  };
});
```

This keeps Drizzle's real SQL expression behavior while recording the status arrays supplied by production code. The `never` casts avoid introducing `any` while adapting the generic overloaded function inside the test mock. These are construction-level assertions: they prevent accidental removal of either status or of one of the seven current helper calls, while browser verification in Task 4 proves the predicates affect returned dashboard data.

- [ ] **Step 2: Extend the schema and select-chain mocks for category breakdown**

Add the missing categories fields to the existing schema mock:

```ts
vi.mock("@/lib/db/schema", () => ({
  tasks: {
    id: "id",
    userId: "userId",
    status: "status",
    priority: "priority",
    dueDate: "dueDate",
    completedAt: "completedAt",
    title: "title",
    categoryId: "categoryId",
  },
  categories: {
    id: "categoryId",
    userId: "categoryUserId",
    name: "categoryName",
    color: "categoryColor",
  },
  userPreferences: { userId: "userId" },
  TaskStatus: { todo: "todo", in_progress: "in_progress" },
  TaskPriority: { low: "low", medium: "medium", high: "high" },
}));
```

Replace the select-chain mock declarations with builders that support both dashboard and category queries:

```ts
const mockOrderBy = vi.fn(() => Promise.resolve([]));
const mockCategoryGroupBy = vi.fn(() => ({ orderBy: mockOrderBy }));
const mockCategoryWhere = vi.fn(() => ({ groupBy: mockCategoryGroupBy }));
const mockLeftJoin = vi.fn(() => ({ where: mockCategoryWhere }));

const mockSelectWhere = vi.fn(() => makeWhereResult());
const mockSelectFrom = vi.fn(() => ({
  where: mockSelectWhere,
  leftJoin: mockLeftJoin,
}));
const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));
```

The `from()` mock deliberately exposes both chains: task-backed selections call `.where(...)`, while the category-backed selection calls `.leftJoin(...).where(...).groupBy(...).orderBy(...)`.

- [ ] **Step 3: Import both affected data functions**

Replace the existing import with:

```ts
import { getCategoryBreakdown, getDashboardData } from "../dashboard";
```

- [ ] **Step 4: Add the dashboard predicate regression test**

Add inside `describe("getDashboardData", ...)`:

```ts
it("uses todo and in-progress statuses for every active dashboard query", async () => {
  mockFindMany.mockResolvedValue([]);

  await getDashboardData("user-123");

  expect(mockInArray).toHaveBeenCalledTimes(5);
  for (const [, statuses] of mockInArray.mock.calls) {
    expect(statuses).toEqual(["todo", "in_progress"]);
  }
});
```

The expected five calls are Due Today, Overdue, Total Active, priority distribution, and upcoming tasks.

- [ ] **Step 5: Add the category predicate regression test**

Add after the `getDashboardData` describe block:

```ts
describe("getCategoryBreakdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses todo and in-progress statuses for categorized and uncategorized counts", async () => {
    await getCategoryBreakdown("user-123");

    expect(mockInArray).toHaveBeenCalledTimes(2);
    for (const [, statuses] of mockInArray.mock.calls) {
      expect(statuses).toEqual(["todo", "in_progress"]);
    }
  });
});
```

- [ ] **Step 6: Run the tests to verify they fail for the intended reason**

Run:

```bash
npm run test -- lib/data/__tests__/dashboard.test.ts
```

Expected: the two new tests fail because `mockInArray` has zero calls while the assertions expect five and two calls. Existing tests should remain green.

### Task 3: Implement the Shared Active-Status Predicate

**Files:**
- Modify: `lib/data/dashboard.ts:1-5, 134-184, 319-349`
- Test: `lib/data/__tests__/dashboard.test.ts`

- [ ] **Step 1: Import `inArray` and make schema types type-only imports**

Change the imports to:

```ts
import { eq, and, count, gte, lt, asc, sql, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks, userPreferences, categories } from "@/lib/db/schema";
import type { TaskPriority, TaskStatus } from "@/lib/db/schema";
```

- [ ] **Step 2: Define the active statuses and predicate once**

Add immediately after the imports:

```ts
const ACTIVE_TASK_STATUSES = ["todo", "in_progress"] satisfies TaskStatus[];

function activeTaskStatusCondition() {
  return inArray(tasks.status, ACTIVE_TASK_STATUSES);
}
```

Keep this definition local to the dashboard data module; it is not part of the public data API.

- [ ] **Step 3: Update the three active aggregate expressions**

Replace the affected stats selection with:

```ts
const [statsResult] = await db
  .select({
    dueToday: sql<number>`coalesce(sum(case when ${activeTaskStatusCondition()} and ${tasks.dueDate} >= ${todayStart} and ${tasks.dueDate} < ${todayEnd} then 1 else 0 end), 0)`.mapWith(Number),
    overdue: sql<number>`coalesce(sum(case when ${activeTaskStatusCondition()} and ${tasks.dueDate} < ${todayStart} and ${tasks.completedAt} is null then 1 else 0 end), 0)`.mapWith(Number),
    completedToday: sql<number>`coalesce(sum(case when ${tasks.completedAt} >= ${todayStart} and ${tasks.completedAt} < ${todayEnd} then 1 else 0 end), 0)`.mapWith(Number),
    totalActive: sql<number>`coalesce(sum(case when ${activeTaskStatusCondition()} then 1 else 0 end), 0)`.mapWith(Number),
  })
  .from(tasks)
  .where(eq(tasks.userId, userId));
```

Do not add the active predicate to `completedToday`; completion is determined by `completedAt`.

- [ ] **Step 4: Update priority distribution and upcoming tasks**

Use the shared predicate in both query filters:

```ts
.where(
  and(
    eq(tasks.userId, userId),
    activeTaskStatusCondition()
  )
)
```

```ts
where: and(
  eq(tasks.userId, userId),
  activeTaskStatusCondition(),
  gte(tasks.dueDate, todayStart),
  lt(tasks.dueDate, upcomingThreshold)
),
```

Update the nearby upcoming-task comment from `Only active tasks` only if needed; it remains accurate once both statuses are included.

- [ ] **Step 5: Update both category breakdown predicates**

Change the categorized join condition to:

```ts
and(
  eq(tasks.categoryId, categories.id),
  eq(tasks.userId, userId),
  activeTaskStatusCondition()
)
```

Change the uncategorized count condition to:

```ts
and(
  eq(tasks.userId, userId),
  activeTaskStatusCondition(),
  sql`${tasks.categoryId} is null`
)
```

- [ ] **Step 6: Run the focused tests**

Run:

```bash
npm run test -- lib/data/__tests__/dashboard.test.ts
```

Expected: all dashboard tests pass, including exactly five active predicate constructions from `getDashboardData()` and exactly two from `getCategoryBreakdown()`.

- [ ] **Step 7: Verify no dashboard `todo`-only predicate remains**

Run:

```bash
rg 'eq\(tasks\.status,\s*"todo"\)|tasks\.status.*=.*todo' lib/data/dashboard.ts
```

Expected: no output. Check separately that `ACTIVE_TASK_STATUSES` contains exactly `todo` and `in_progress`.

### Task 4: Run Full Verification

**Files:**
- Verify: `lib/data/dashboard.ts`
- Verify: `lib/data/__tests__/dashboard.test.ts`

- [ ] **Step 1: Run the full test suite**

Run:

```bash
npm run test
```

Expected: all tests pass with no failed test files.

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint -- --max-warnings=0
```

Expected: ESLint exits with code 0; `--max-warnings=0` rejects both errors and warnings.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js completes a production build with no errors.

- [ ] **Step 4: Verify the behavior in the browser**

Use a test user with these tasks:

```text
1. One in_progress task due today, priority high, assigned to a category.
2. One in_progress overdue task with no category.
3. No todo, done, or archived tasks.
```

Expected at `/dashboard`:

```text
- Dashboard content renders instead of DashboardEmptyState.
- Total Active is 2.
- Due Today is 1.
- Overdue is 1.
- High priority count includes the due-today task.
- Upcoming Tasks includes the due-today task.
- Category Breakdown includes one categorized and one uncategorized active task.
```

- [ ] **Step 5: Complete the workflow record**

In `context/current-feature.md`, change `## Status` to `Complete`, mark all three P6-F1 goal checkboxes complete, and append this entry to `## History` without altering previous entries:

```md
- **Dashboard Active Status Correctness (P6-F1)** (2026-07-18) - Updated all seven dashboard active-task predicates to include both `todo` and `in_progress`, added construction-level regression coverage, and verified the in-progress-only dashboard behavior.
```

Expected: the workflow document no longer reports P6-F1 as in progress, all goals are checked, and the append-only history records the completed fix.

- [ ] **Step 6: Review the final diff**

Run:

```bash
git diff -- context/current-feature.md lib/data/dashboard.ts lib/data/__tests__/dashboard.test.ts
```

Expected: only the workflow update, shared active predicate, seven predicate replacements, and focused regression-test support are present. No schema, UI, or unrelated refactor appears.

- [ ] **Step 7: Request permission before committing**

Do not commit automatically. After the user approves, run:

```bash
git add context/current-feature.md lib/data/dashboard.ts lib/data/__tests__/dashboard.test.ts context/features/phase-6/TASKS.md context/features/phase-6/01-dashboard-active-status/FEATURE.md
git commit -m "fix: include in-progress tasks in dashboard"
```

Expected: one focused conventional commit containing the approved remediation and its documentation.

---

## 7. Acceptance Criteria

### Functional

- [ ] `todo` tasks remain included in all active dashboard data.
- [ ] `in_progress` tasks are included in Due Today.
- [ ] `in_progress` tasks are included in Overdue.
- [ ] `in_progress` tasks are included in Total Active.
- [ ] `in_progress` tasks are included in priority distribution.
- [ ] `in_progress` tasks are included in upcoming tasks.
- [ ] `in_progress` tasks are included in categorized and uncategorized category breakdown counts.
- [ ] `done` and `archived` tasks remain excluded from active workload queries.
- [ ] A user with only `in_progress` tasks does not receive the dashboard empty state.

### Technical

- [ ] Active statuses are defined once with `TaskStatus` type checking.
- [ ] Every active query uses the shared Drizzle `inArray` predicate.
- [ ] Every query remains scoped by `userId`.
- [ ] Existing timezone boundaries remain unchanged.
- [ ] Existing cache tags and cache lifetime remain unchanged.
- [ ] No database migration is generated.
- [ ] No client component or UI component changes are required.

### Quality Gates

- [ ] Focused dashboard tests pass.
- [ ] Full test suite passes.
- [ ] Lint passes with zero warnings.
- [ ] Production build passes.
- [ ] Browser verification with in-progress-only data passes.

---

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| One dashboard query remains `todo`-only | Incorrect chart or metric | Tests assert five predicate constructions in `getDashboardData()` and two in `getCategoryBreakdown()`. |
| A future enum value becomes active unintentionally | Incorrect counts | Use an explicit allowlist rather than excluding `done` and `archived`. |
| `inArray` is not valid inside a raw aggregate expression | Build or runtime SQL error | Drizzle filter operators are SQL expressions; focused tests delegate to the real operator and the plan requires a production build plus browser query execution. |
| Category counts include another user's tasks | Security regression | Preserve both category and task `userId` predicates exactly as written. |
| Empty-state behavior changes for completed-only users | UX regression | Leave `hasTasks = totalActive > 0 || completedToday > 0` unchanged; only correct `totalActive`. |

---

## 9. Related Documentation

- `code-review-2026-07-17.md:40-53` - blocker #1 and recommended shared active statuses.
- `context/features/phase-6/TASKS.md` - complete remediation backlog and delivery order.
- `context/features/phase-2/02-dashboard-overview/FEATURE.md:90-127` - active dashboard and upcoming-task requirements.
- `lib/db/schema.ts:14-19` - task status enum.
- `lib/data/task.ts:98-101` - existing overdue behavior that includes both active statuses.
- Drizzle ORM operators documentation - `inArray(column, values)` for literal-list filtering.
- Drizzle ORM SQL template documentation - filter expressions can be interpolated in `sql` tagged templates.

---

## 10. Definition of Done

- [ ] All seven dashboard active-status predicates use the shared allowlist.
- [ ] Construction-level regression tests fail if `in_progress` is removed or one of the seven current predicate constructions stops using the shared helper.
- [ ] In-progress-only browser fixture renders the normal dashboard with correct values.
- [ ] Tests, lint, and build pass.
- [ ] Final diff contains no unrelated changes.
- [ ] User has reviewed the results and explicitly approved any commit.
