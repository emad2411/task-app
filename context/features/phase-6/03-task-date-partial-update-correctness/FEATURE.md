# P6-F3 Task Date and Partial Update Correctness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase:** 6 - Code Review Remediation
**Feature ID:** P6-F3
**Status:** Draft - Ready for Implementation
**Date:** 2026-07-19
**Source:** `code-review-2026-07-17.md`, blockers #3, #4, and #6
**Branch:** `fix/P6-F3-task-date-partial-update`

**Goal:** Make task due dates round-trip correctly for non-UTC users by establishing one wall-time conversion path and one shared render helper, migrate persisted timestamps to `timestamptz`, and convert `updateTaskAction` to a true partial update that preserves omitted fields and treats explicit `null` as the clear signal for `dueDate`, `categoryId`, and `description`.

**Architecture:** Add two helpers to `lib/utils/date.ts` (`datetimeLocalToUtc`, `toDatetimeLocalString`) backed by `date-fns-tz` `fromZonedTime`/`toZonedTime`. Restructure `lib/validation/task.ts` so `updateTaskSchema` is built from a base schema without `.default()` and then `.partial()`-ed, eliminating force-defaulted `status`/`priority` on partial updates. Rewrite `lib/actions/task.ts` to fetch the user's timezone via `getUserTimezone(userId)`, convert `datetime-local` strings to UTC on write, and only include fields whose key is present in the validated input (preserving `undefined` as leave-unchanged and treating `null`/`""` as clear). Replace the two divergent `datetime-local` render paths in `components/tasks/task-form.tsx`, `components/tasks/inline-edit.tsx`, and the `handleInlineSave` fallback in `components/tasks/task-detail-view.tsx` with the shared helper. Generate a reviewed Drizzle migration that alters every `timestamp` column to `timestamp with time zone` and verify the conversion semantics against existing production UTC values before applying.

**Tech Stack:** TypeScript 5, Next.js 16 Server Actions, Zod v4, Drizzle ORM 0.45 with `drizzle-kit` 0.31, PostgreSQL (Neon), `date-fns` 4 + `date-fns-tz` 3, Vitest 4

---

## 1. Problem Statement

Three layers disagree on what a `datetime-local` string means, and the update action cannot express "leave this field alone."

### 1.1 Issue #3 — Due dates are timezone-broken for non-UTC users

`lib/actions/task.ts:25, 49` parse `datetime-local` strings with `new Date(str)`. Per the ECMAScript spec, ISO datetime strings without a timezone suffix are interpreted as the runtime's local time. On Vercel (UTC runtime) the user's wall-time pick (say 16:00 in America/New_York) is stored as 16:00 UTC instead of 21:00 UTC. The user's saved timezone preference (`user_preferences.timezone`) is never consulted on the write path.

Two render paths make it worse:

- `components/tasks/task-form.tsx:89` renders an existing due date via `task.dueDate.toISOString().slice(0, 16)` → **UTC** wall time.
- `components/tasks/inline-edit.tsx:549-555` shifts by `getTimezoneOffset()` → **browser-local** wall time.

The two editors show **different times for the same task**, and a picked time shifts by the user's offset on save. Non-UTC users cannot trust the due-date field.

### 1.2 Issue #4 — Schema uses `timestamp` without time zone

`lib/db/schema.ts` declares every `timestamp(...)` column without `{ withTimezone: true }` (lines 39, 40, 49, 52, 53, 66, 67, 70, 71, 78, 79, 80, 87, 99, 100, 121, 122, 123, 124, 144, 145). Naive timestamps plus JS `Date` round-trips depend on driver parsing config and are half the cause of bug #3. A stored `Date` serialized by the Neon HTTP driver into a `timestamp without time zone` column loses the explicit UTC anchor; reads rely on the session timezone to reinterpret the value.

### 1.3 Issue #6 — `updateTaskAction` wipes `dueDate`/`categoryId` on partial updates

`lib/actions/task.ts:47-54`:

```ts
const [task] = await db.update(tasks)
  .set({
    ...data,
    description: data.description === undefined ? undefined : data.description || null,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    categoryId: data.categoryId || null,
    updatedAt: new Date(),
  })
```

Both `dueDate` and `categoryId` are optional in the schema, but when omitted they are force-set to `null`. The latent UI path in `components/tasks/task-detail-view.tsx:76-99` currently rebuilds the full payload from `task` before calling, so the bug is masked today. But the action contract is unsafe — the existing test suite itself calls `updateTaskAction({ id, title })` and asserts success. The next partial caller will silently delete due dates and categories.

A second, related defect: `updateTaskSchema` is `createTaskSchema.extend({ id })`, and `createTaskSchema` declares `.default("todo")` on `status` and `.default("medium")` on `priority`. Per the Zod v4 breaking change (defaults fire even inside `.optional()`), even a `.partial()`-ed variant would still inject those defaults, so a partial call like `updateTaskAction({ id, title })` silently resets `status` to `todo` and `priority` to `medium`. The fix must rebuild `updateTaskSchema` from a base schema that has no defaults.

---

## 2. Scope

### In Scope

- Establish one wall-time conversion path for `datetime-local` values using the saved user timezone.
- Establish one shared rendering helper for task due dates used by both task editors and the inline-save fallback.
- Add timezone regression tests for create, update, and render behavior.
- Migrate persisted timestamps from `timestamp` to `timestamptz` with a reviewed Drizzle migration.
- Verify migration semantics against existing production timestamp data before applying.
- Change `updateTaskAction` to update only fields present in the request.
- Preserve explicit `null` (and `""` for back-compat) as the signal to clear `dueDate`, `categoryId`, and `description`.
- Add regression tests proving omitted fields are preserved and explicit nulls clear values.
- Make `dueDate` and `categoryId` nullable in the shared validation schema (matching the P6-F2 pattern for `description`).
- Rebuild `updateTaskSchema` from a base schema without `.default()` so partial updates do not reset `status`/`priority`.
- Thread `timezone` into `EditTaskDialog` and `TaskForm` so the shared render helper can render existing due dates correctly.
- Update the `handleInlineSave` fallback in `task-detail-view.tsx` to use the shared render helper (prevents a double-conversion bug once the action starts converting on write).

### Out of Scope

- Category-ownership validation on task writes (issue #5, planned as P6-F4).
- Dashboard analytics query consolidation (issue #7, P6-F5).
- DST-safe analytics bucket boundaries (P6-M8).
- Timezone preference validation against the IANA list (issue #9, P6-F7).
- Defaulting `defaultTaskSort` / `dateFormat` preferences into rendering (issue #11, P6-F9).
- Any change to `toggleTaskCompletionAction`, `archiveTaskAction`, or `deleteTaskAction` beyond the `timestamptz` schema migration.
- UI redesign of the due-date editor.
- Backfilling or rewriting existing `tasks.dueDate` values — the `timestamptz` migration preserves them as the same UTC instants (see Section 4.3).

---

## 3. Design Decision

### 3.1 Selected Approach

**Wall-time conversion:** add `datetimeLocalToUtc(datetimeLocal, timezone)` to `lib/utils/date.ts`. Parse `"YYYY-MM-DDTHH:mm"` into components and construct a `Date` via `new Date(year, month - 1, day, hours, minutes)` (local-components constructor is runtime-independent — the local fields are always the picked wall time). Then pass to `fromZonedTime(localDate, timezone)`, which reads those local fields and returns the UTC `Date` for the user's timezone. This matches the documented `date-fns-tz` usage pattern and avoids the `new Date(isoString)` runtime-local trap.

**Shared render helper:** add `toDatetimeLocalString(date, timezone)` to `lib/utils/date.ts`. Use `toZonedTime(date, timezone)` then `format(zoned, "yyyy-MM-dd'T'HH:mm")`. Returns `""` for null/undefined. Both editors and the `handleInlineSave` fallback call this helper instead of their bespoke UTC/browser-local slicing.

**Truly partial updates:** restructure `lib/validation/task.ts` to define a `taskFieldSchema` (no defaults, nullable `dueDate`/`categoryId`/`description`), then derive `createTaskSchema` by adding `.default("todo")`/`.default("medium")` and `updateTaskSchema` via `taskFieldSchema.partial().extend({ id: z.uuid() })`. Because the base has no `.default()`, `.partial()` produces truly optional fields whose absence means "leave unchanged."

**Action contract:** `createTaskAction` and `updateTaskAction` both fetch `getUserTimezone(userId)` after the auth check. Create maps `""`/`null`/omitted `dueDate`/`categoryId` to `null` and converts non-empty strings via `datetimeLocalToUtc`. Update builds the `.set()` object by iterating only the keys present in `validated` (excluding `id`): for each present key, `null`/`""` maps to `null` (clear), other values map to the converted value. Omitted keys are not included in `.set()`, so Drizzle leaves the column unchanged. `updatedAt: new Date()` is always set.

**Schema migration:** change every `timestamp("col")` in `lib/db/schema.ts` to `timestamp("col", { withTimezone: true })`. Run `drizzle-kit generate` to produce a new migration file in `lib/db/migrations/`. Review the generated SQL (expected form: `ALTER TABLE "<table>" ALTER COLUMN "<col>" TYPE timestamp with time zone;`). Verify the conversion semantics: PostgreSQL interprets existing `timestamp without time zone` values as the session timezone during the cast; on Neon the session timezone is UTC, so existing UTC instants are preserved as the same UTC instants. Apply via `drizzle-kit migrate`, never `db:push`.

### 3.2 Alternatives Rejected

1. **Convert with `new Date(datetimeLocal)` directly inside the action:** runtime-local interpretation; on a UTC server a 16:00 America/New_York pick is stored as 16:00 UTC. Rejected for the reason issue #3 exists.
2. **Pass the browser's timezone to the action instead of reading `user_preferences`:** would diverge from the saved preference when the user travels or uses a different device, and would require a new client→server contract. The saved preference is the single source of truth.
3. **Fix only the write path and leave the two render paths alone:** the `handleInlineSave` fallback in `task-detail-view.tsx:78-83` rebuilds `dueDate` from `task.dueDate.toISOString().slice(0, 16)` (UTC wall time) when another field is edited. Once the action starts converting that string using the user's timezone, the due date would shift on every unrelated edit. Both render paths and the fallback must use the shared helper.
4. **Make `updateTaskSchema` truly partial by calling `.partial()` on the existing `createTaskSchema`:** rejected because Zod v4 applies `.default()` even inside `.optional()`, so `status`/`priority` would still be force-reset to `"todo"`/`"medium"` on every partial call. The base-schema-without-defaults approach is the only correct one.
5. **Accept `null` for `dueDate`/`categoryId` via a Zod `.transform()` that maps `null`→`""`:** would move persistence policy into the validation layer and obscure the "clear" signal. Keep the schema permissive (`string | null | undefined | ""`) and let the action normalize, exactly as P6-F2 did for `description`.
6. **Skip the `timestamptz` migration and rely solely on the helper:** the review explicitly calls the naive timestamp "half the cause of bug #3." Without the migration, future driver/config changes could re-break the round-trip. The migration is low-risk and durable.
7. **Backfill `tasks.dueDate` during the migration:** unnecessary. PostgreSQL's `timestamp without time zone` → `timestamp with time zone` cast on a UTC session preserves existing UTC instants as the same UTC instants. No data rewrite is required or wanted.

---

## 4. File Map

### 4.1 Files Modified

| File | Responsibility | Planned Change |
|---|---|---|
| `lib/utils/date.ts` | Date utilities | Add `datetimeLocalToUtc` and `toDatetimeLocalString` helpers using `date-fns-tz`. |
| `lib/validation/task.ts` | Shared task Zod schemas | Extract `taskFieldSchema` without defaults; make `dueDate` and `categoryId` nullable; rebuild `createTaskSchema` and `updateTaskSchema` on the new base. |
| `lib/actions/task.ts` | Task server actions | Fetch `getUserTimezone(userId)`; convert `datetime-local` to UTC via shared helper; build `.set()` from only the keys present in validated input; preserve `null`/`""` as the clear signal for `dueDate`, `categoryId`, and `description`. |
| `lib/db/schema.ts` | Database schema | Add `{ withTimezone: true }` to every `timestamp(...)` column across all tables. |
| `components/tasks/task-form.tsx` | Create/edit form | Accept optional `timezone` prop; use `toDatetimeLocalString(task.dueDate, timezone)` for the default value instead of `toISOString().slice(0, 16)`. |
| `components/tasks/inline-edit.tsx` | Inline due-date editor | Replace the `getTimezoneOffset()`-based `dateValue` computation with `toDatetimeLocalString(task.dueDate, timezone)`. |
| `components/tasks/edit-task-dialog.tsx` | Edit dialog wrapper | Accept optional `timezone` prop and forward it to `TaskForm`. |
| `components/tasks/task-detail-view.tsx` | Task detail view | Accept `timezone` (already a prop), use `toDatetimeLocalString` for the `handleInlineSave` `dueDate` fallback, and pass `timezone` to `EditTaskDialog`. |
| `app/(app)/tasks/[taskId]/page.tsx` | Task detail page | Pass the already-fetched `timezone` to `EditTaskDialog` via `TaskDetailView` (no new fetch). |
| `lib/utils/date.test.ts` | Date utility tests (co-located with `lib/utils/date.ts`) | Add round-trip and timezone-boundary tests for `datetimeLocalToUtc` and `toDatetimeLocalString`. |
| `lib/validation/__tests__/task.test.ts` | Validation tests | Add null-acceptance tests for `dueDate` and `categoryId`; add partial-update tests proving omitted fields stay `undefined` and defaults are NOT applied on update. |
| `lib/actions/__tests__/task.test.ts` | Action tests | Mock `getUserTimezone`; add timezone-conversion tests for create and update; add partial-update tests proving omitted fields are absent from `.set()` and explicit `null`/`""` clear values; update existing assertions that assumed force-defaulted `status`/`priority`. |
| `context/current-feature.md` | Active workflow state | Record P6-F3 as in progress before implementation, complete after verification, preserving append-only history. |
| `context/features/phase-6/TASKS.md` | Phase 6 remediation backlog | Link this plan and check off the eight P6-F3 items after verification. |

### 4.2 Files Created

| File | Responsibility |
|---|---|
| `lib/db/migrations/0004_<drizzle_slug>.sql` | New Drizzle migration altering every `timestamp` column to `timestamp with time zone`. Generated by `drizzle-kit generate`, reviewed before apply. |
| `lib/db/migrations/meta/_journal.json` (updated by drizzle-kit) | Migration journal entry for the new migration. |
| `lib/db/migrations/meta/0004_snapshot.json` (created by drizzle-kit) | Schema snapshot for the new migration. |

### 4.3 Files Deleted

None.

---

## 5. Exact Behavior

### 5.1 `datetime-local` Write Path

| Input (`validated.dueDate`) | `createTaskAction` persists | `updateTaskAction` persists |
|---|---|---|
| `"2025-12-31T16:00"` | UTC Date for 16:00 in user's timezone | UTC Date for 16:00 in user's timezone |
| `""` | `NULL` | `NULL` |
| `null` | `NULL` | `NULL` |
| omitted (`undefined`) | `NULL` | column unchanged (key absent from `.set()`) |

The user's timezone is fetched once per action call via `getUserTimezone(userId)` (cached, defaults to `"UTC"` if no preference row exists).

### 5.2 `datetime-local` Render Path

| Source | Current behavior | Target behavior |
|---|---|---|
| `TaskForm` default value for existing task | `task.dueDate.toISOString().slice(0, 16)` (UTC wall time) | `toDatetimeLocalString(task.dueDate, timezone)` (user-tz wall time) |
| `InlineDueDateEdit` `dateValue` | `new Date(dueDate - tzOffset*60000).toISOString().slice(0,16)` (browser-local wall time) | `toDatetimeLocalString(task.dueDate, timezone)` (user-tz wall time) |
| `handleInlineSave` `dueDate` fallback | `task.dueDate.toISOString().slice(0, 16)` (UTC wall time) | `toDatetimeLocalString(task.dueDate, timezone)` (user-tz wall time) |

All three paths converge on the shared helper. The two editors now show the **same** time for the same task, and the time no longer shifts when the user's browser offset differs from their saved preference.

### 5.3 Partial Update Matrix (`updateTaskAction`)

| Field | Omitted in input | `null` in input | `""` in input | Value in input |
|---|---|---|---|---|
| `title` | unchanged | (rejected by schema) | (rejected — min 1) | set to value |
| `description` | unchanged | `NULL` | `NULL` | set to value |
| `status` | unchanged (no default applied) | (rejected by schema) | (rejected by schema) | set to value |
| `priority` | unchanged (no default applied) | (rejected by schema) | (rejected by schema) | set to value |
| `dueDate` | unchanged | `NULL` | `NULL` | set to UTC-converted `Date` |
| `categoryId` | unchanged | `NULL` | `NULL` | set to value |

`updatedAt: new Date()` is always present in `.set()`. The Drizzle `update().set()` call receives only the keys derived from the present input fields plus `updatedAt`; omitted keys are not in the object, so Drizzle leaves those columns untouched.

### 5.4 `createTaskAction` Behavior

Create continues to apply defaults for `status` (`"todo"`) and `priority` (`"medium"`) when those keys are absent, because `createTaskSchema` keeps the `.default()` declarations. `dueDate`/`categoryId`/`description` follow the same `""`/`null`/omitted → `NULL` normalization as before, except `dueDate` is now converted via `datetimeLocalToUtc` instead of `new Date(str)`.

### 5.5 `timestamptz` Migration Semantics

PostgreSQL converts `timestamp without time zone` → `timestamp with time zone` by interpreting the existing naive value as the session timezone and storing the resulting UTC instant. On Neon the session timezone is UTC, so an existing naive value of `2025-12-31 16:00:00` (already a UTC instant because the app has only ever run on UTC servers) becomes the `timestamptz` value `2025-12-31T16:00:00Z`. No data rewrite, no backfill, no drift. The migration must be reviewed and applied via `drizzle-kit migrate` against `DATABASE_URL_UNPOOLED`.

---

## 6. Implementation Tasks

### Task 1: Initialize the Workflow and Establish the Baseline

**Files:**
- Modify: `context/current-feature.md:1-19`

- [ ] **Step 1: Create the dedicated fix branch**

Run:

```bash
git switch -c fix/P6-F3-task-date-partial-update
```

Expected: Git creates and switches to `fix/P6-F3-task-date-partial-update` without changing or discarding the existing worktree state.

- [ ] **Step 2: Record the active fix in the workflow document**

Replace the sections above `## History` in `context/current-feature.md` with the following and leave the existing history unchanged:

```md
# Current Feature

## Status

In Progress

## Feature

P6-F3: Task Date and Partial Update Correctness

## Goals

- [ ] Establish one wall-time conversion path and one shared render helper for `datetime-local` due dates.
- [ ] Migrate persisted timestamps to `timestamptz` with a reviewed Drizzle migration.
- [ ] Convert `updateTaskAction` to a true partial update that preserves omitted fields and clears on explicit `null`/`""`.
- [ ] Add timezone, partial-update, and null-clearing regression coverage.
- [ ] Pass tests, lint, build, and browser verification for non-UTC due-date round-trips.

## Notes

- Source: `code-review-2026-07-17.md`, blockers #3, #4, and #6.
- Plan: `context/features/phase-6/03-task-date-partial-update-correctness/FEATURE.md`.
- Branch: `fix/P6-F3-task-date-partial-update`.

## History
```

- [ ] **Step 3: Run the existing task and date tests**

Run:

```bash
npm run test -- lib/validation/__tests__/task.test.ts lib/actions/__tests__/task.test.ts lib/data/__tests__/task.test.ts lib/utils/date.test.ts
```

Expected: all four files pass on the P6-F2 baseline (272 tests total). If any file fails for a pre-existing reason, record the failure and resolve the environment problem before changing production code.

- [ ] **Step 4: Run the repository baseline gates**

Run:

```bash
npm run test
npm run lint -- --max-warnings=0
npm run build
```

Expected: tests pass; lint passes with only the two known pre-existing shadcn/ui errors (`components/ui/carousel.tsx:98`, `hooks/use-mobile.ts:14`) accepted as baseline (see P6-F2 Task 4 Step 2 note); build succeeds. If a new baseline failure appears, stop and report it rather than mixing it into P6-F3.

- [ ] **Step 5: Confirm the Zod v4 and date-fns-tz API behavior**

Query Context7 (`/colinhacks/zod` and `/marnusw/date-fns-tz`) to confirm:

1. Zod v4 applies `.default()` even inside `.optional()`, so `createTaskSchema.partial()` is NOT truly partial — this plan's `taskFieldSchema.partial().extend({ id })` approach is required.
2. `fromZonedTime(date: Date | string | number, timeZone)` reads the input Date's local fields and returns the UTC Date for that wall time in the given timezone. Constructing the input via `new Date(year, month - 1, day, hours, minutes)` is runtime-independent.
3. `toZonedTime(date, timeZone)` returns a Date whose local fields reflect the target timezone; `format(zoned, "yyyy-MM-dd'T'HH:mm")` produces a valid `datetime-local` string.

Record the findings in `context/current-feature.md` `## Notes` before moving on.

### Task 2: Add Failing Regression Tests

**Files:**
- Modify: `lib/utils/date.test.ts`
- Modify: `lib/validation/__tests__/task.test.ts`
- Modify: `lib/actions/__tests__/task.test.ts`
- Test: `lib/utils/date.test.ts`
- Test: `lib/validation/__tests__/task.test.ts`
- Test: `lib/actions/__tests__/task.test.ts`

- [ ] **Step 1: Add `datetimeLocalToUtc` and `toDatetimeLocalString` tests**

Add to `lib/utils/date.test.ts`:

```ts
import { datetimeLocalToUtc, toDatetimeLocalString } from "./date";

describe("datetimeLocalToUtc", () => {
  it("returns null for null", () => {
    expect(datetimeLocalToUtc(null, "UTC")).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(datetimeLocalToUtc(undefined, "UTC")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(datetimeLocalToUtc("", "UTC")).toBeNull();
  });

  it("interprets the string as wall time in the given timezone (UTC)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T12:00:00Z"));
    const utc = datetimeLocalToUtc("2025-12-31T16:00", "UTC");
    expect(utc).toBeInstanceOf(Date);
    expect(utc?.toISOString()).toBe("2025-12-31T16:00:00.000Z");
    vi.useRealTimers();
  });

  it("interprets the string as wall time in America/New_York (EST, UTC-5)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T12:00:00Z"));
    // Winter: NY is UTC-5, so 16:00 NY = 21:00 UTC
    const utc = datetimeLocalToUtc("2025-12-31T16:00", "America/New_York");
    expect(utc?.toISOString()).toBe("2025-12-31T21:00:00.000Z");
    vi.useRealTimers();
  });

  it("interprets the string as wall time in Asia/Tokyo (UTC+9)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T12:00:00Z"));
    // 16:00 JST = 07:00 UTC
    const utc = datetimeLocalToUtc("2025-12-31T16:00", "Asia/Tokyo");
    expect(utc?.toISOString()).toBe("2025-12-31T07:00:00.000Z");
    vi.useRealTimers();
  });
});

describe("toDatetimeLocalString", () => {
  it("returns empty string for null", () => {
    expect(toDatetimeLocalString(null, "UTC")).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(toDatetimeLocalString(undefined, "UTC")).toBe("");
  });

  it("formats a UTC date as UTC wall time", () => {
    expect(toDatetimeLocalString(new Date("2025-12-31T16:00:00Z"), "UTC")).toBe("2025-12-31T16:00");
  });

  it("formats a UTC date as America/New_York wall time (EST, UTC-5)", () => {
    // 16:00 UTC = 11:00 NY in winter
    expect(toDatetimeLocalString(new Date("2025-12-31T16:00:00Z"), "America/New_York")).toBe("2025-12-31T11:00");
  });

  it("formats a UTC date as Asia/Tokyo wall time (UTC+9)", () => {
    // 16:00 UTC = 01:00 next-day JST
    expect(toDatetimeLocalString(new Date("2025-12-31T16:00:00Z"), "Asia/Tokyo")).toBe("2026-01-01T01:00");
  });

  it("round-trips with datetimeLocalToUtc in America/New_York", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T12:00:00Z"));
    const original = new Date("2025-12-31T21:00:00Z"); // 16:00 NY
    const rendered = toDatetimeLocalString(original, "America/New_York");
    const roundTripped = datetimeLocalToUtc(rendered, "America/New_York");
    expect(roundTripped?.toISOString()).toBe(original.toISOString());
    vi.useRealTimers();
  });
});
```

Expected: all new tests fail because the helpers do not exist yet.

- [ ] **Step 2: Add nullable `dueDate`/`categoryId` and partial-update validation tests**

Add to `lib/validation/__tests__/task.test.ts` inside `describe("createTaskSchema", ...)`:

```ts
it("should accept null dueDate", () => {
  const result = createTaskSchema.safeParse({ title: "Task", dueDate: null });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.dueDate).toBeNull();
  }
});

it("should accept null categoryId", () => {
  const result = createTaskSchema.safeParse({ title: "Task", categoryId: null });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.categoryId).toBeNull();
  }
});
```

Add inside `describe("updateTaskSchema", ...)`:

```ts
it("should accept null dueDate for clearing", () => {
  const result = updateTaskSchema.safeParse({
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Updated task",
    dueDate: null,
  });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.dueDate).toBeNull();
  }
});

it("should accept null categoryId for clearing", () => {
  const result = updateTaskSchema.safeParse({
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Updated task",
    categoryId: null,
  });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.categoryId).toBeNull();
  }
});

it("should NOT apply createSchema defaults for status and priority when omitted", () => {
  const result = updateTaskSchema.safeParse({
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Updated task",
  });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.status).toBeUndefined();
    expect(result.data.priority).toBeUndefined();
    expect(result.data.dueDate).toBeUndefined();
    expect(result.data.categoryId).toBeUndefined();
    expect(result.data.description).toBeUndefined();
  }
});

it("should allow title to be omitted for partial update", () => {
  const result = updateTaskSchema.safeParse({
    id: "550e8400-e29b-41d4-a716-446655440000",
    priority: "high",
  });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.title).toBeUndefined();
    expect(result.data.priority).toBe("high");
  }
});
```

Expected: the four null-acceptance tests fail (schema currently rejects null for `dueDate`/`categoryId`); the two no-default and partial-title tests fail because `status`/`priority`/`dueDate`/`categoryId`/`description` are currently defaulted or required.

- [ ] **Step 3: Add action timezone-conversion and partial-update tests**

In `lib/actions/__tests__/task.test.ts`, add a mock for `getUserTimezone` next to the existing `@/lib/auth/session` mock:

```ts
const mockGetUserTimezone = vi.fn();
vi.mock("@/lib/data/preferences", () => ({
  getUserTimezone: (...args: unknown[]) => mockGetUserTimezone(...args),
}));
```

Add inside `describe("createTaskAction", ...)`:

```ts
it("should convert dueDate using the user's timezone (America/New_York)", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockGetUserTimezone.mockResolvedValue("America/New_York");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await createTaskAction({ title: "Task", dueDate: "2025-12-31T16:00" });

  const values = mockValues.mock.calls[0][0];
  expect(values.dueDate).toBeInstanceOf(Date);
  // 16:00 NY (EST, UTC-5) = 21:00 UTC
  expect((values.dueDate as Date).toISOString()).toBe("2025-12-31T21:00:00.000Z");
});

it("should store null dueDate when null is provided", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockGetUserTimezone.mockResolvedValue("UTC");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await createTaskAction({ title: "Task", dueDate: null });

  const values = mockValues.mock.calls[0][0];
  expect(values.dueDate).toBeNull();
});

it("should store null categoryId when null is provided", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockGetUserTimezone.mockResolvedValue("UTC");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await createTaskAction({ title: "Task", categoryId: null });

  const values = mockValues.mock.calls[0][0];
  expect(values.categoryId).toBeNull();
});
```

Add inside `describe("updateTaskAction", ...)`:

```ts
it("should convert dueDate using the user's timezone on update (Asia/Tokyo)", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockGetUserTimezone.mockResolvedValue("Asia/Tokyo");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await updateTaskAction({
    id: "550e8400-e29b-41d4-a716-446655440000",
    dueDate: "2025-12-31T16:00",
  });

  const setCall = mockSet.mock.calls[0][0];
  expect(setCall.dueDate).toBeInstanceOf(Date);
  // 16:00 JST (UTC+9) = 07:00 UTC
  expect((setCall.dueDate as Date).toISOString()).toBe("2025-12-31T07:00:00.000Z");
});

it("should clear dueDate when null is provided", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockGetUserTimezone.mockResolvedValue("UTC");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await updateTaskAction({
    id: "550e8400-e29b-41d4-a716-446655440000",
    dueDate: null,
  });

  const setCall = mockSet.mock.calls[0][0];
  expect(setCall.dueDate).toBeNull();
});

it("should clear categoryId when null is provided", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockGetUserTimezone.mockResolvedValue("UTC");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await updateTaskAction({
    id: "550e8400-e29b-41d4-a716-446655440000",
    categoryId: null,
  });

  const setCall = mockSet.mock.calls[0][0];
  expect(setCall.categoryId).toBeNull();
});

it("should leave dueDate unchanged when it is omitted", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockGetUserTimezone.mockResolvedValue("UTC");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await updateTaskAction({
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Updated",
  });

  const setCall = mockSet.mock.calls[0][0];
  expect(setCall.dueDate).toBeUndefined();
  expect(setCall.categoryId).toBeUndefined();
  expect(setCall.status).toBeUndefined();
  expect(setCall.priority).toBeUndefined();
  expect(setCall.description).toBeUndefined();
  expect(setCall.title).toBe("Updated");
  expect(setCall.updatedAt).toBeInstanceOf(Date);
});

it("should not reset status or priority to defaults when omitted", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockGetUserTimezone.mockResolvedValue("UTC");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await updateTaskAction({
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Updated",
  });

  const setCall = mockSet.mock.calls[0][0];
  expect(setCall).not.toHaveProperty("status");
  expect(setCall).not.toHaveProperty("priority");
});

it("should set status when explicitly provided", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockGetUserTimezone.mockResolvedValue("UTC");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await updateTaskAction({
    id: "550e8400-e29b-41d4-a716-446655440000",
    status: "in_progress",
  });

  const setCall = mockSet.mock.calls[0][0];
  expect(setCall.status).toBe("in_progress");
});
```

Also update the existing test `"should convert dueDate string to Date object"` to also mock `getUserTimezone`:

```ts
it("should convert dueDate string to Date object", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockGetUserTimezone.mockResolvedValue("UTC");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await createTaskAction({ title: "Task", dueDate: "2025-12-31T16:00" });

  const values = mockValues.mock.calls[0][0];
  expect(values.dueDate).toBeInstanceOf(Date);
});
```

And the existing `"should set updatedAt to current date"` test must also mock `getUserTimezone`:

```ts
it("should set updatedAt to current date", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockGetUserTimezone.mockResolvedValue("UTC");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await updateTaskAction({
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Updated",
  });

  const setCall = mockSet.mock.calls[0][0];
  expect(setCall.updatedAt).toBeInstanceOf(Date);
});
```

- [ ] **Step 4: Run the tests to verify they fail for the intended reason**

Run:

```bash
npm run test -- lib/utils/date.test.ts lib/validation/__tests__/task.test.ts lib/actions/__tests__/task.test.ts
```

Expected: the new date helper tests fail with import errors (helpers don't exist); the validation null-acceptance and no-default tests fail because the schema rejects `null` and applies defaults; the action timezone-conversion tests fail because `mockGetUserTimezone` is never called and the conversion uses `new Date(str)`; the partial-update tests fail because the current `.set()` object includes `dueDate: null`, `categoryId: null`, `status: "todo"`, `priority: "medium"`. Existing tests must remain green (after the two `updatedAt`/`dueDate` tests are updated with the new mock).

### Task 3: Add the Shared Date Helpers

**Files:**
- Modify: `lib/utils/date.ts:1-10, 154`
- Test: `lib/utils/date.test.ts`

- [ ] **Step 1: Add `datetimeLocalToUtc`**

Append to `lib/utils/date.ts` (after the existing `getTodayEndForQuery` function):

```ts
/**
 * Convert a `datetime-local` string (YYYY-MM-DDTHH:mm) interpreted as wall time
 * in the user's timezone into a UTC Date. Returns null for empty/null/undefined.
 *
 * Uses `new Date(year, month - 1, day, hours, minutes)` so the wall-time fields
 * are runtime-independent, then `fromZonedTime` converts to the true UTC instant.
 */
export function datetimeLocalToUtc(
  datetimeLocal: string | null | undefined,
  timezone: string = "UTC"
): Date | null {
  if (!datetimeLocal) return null;
  const [datePart, timePart] = datetimeLocal.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = (timePart ?? "00:00").split(":").map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  const wallTime = new Date(year, month - 1, day, hours ?? 0, minutes ?? 0, 0, 0);
  return fromZonedTime(wallTime, timezone);
}
```

- [ ] **Step 2: Add `toDatetimeLocalString`**

Append:

```ts
/**
 * Format a UTC Date as a `datetime-local` string (YYYY-MM-DDTHH:mm) in the
 * user's timezone. Returns "" for null/undefined.
 *
 * Inverse of `datetimeLocalToUtc`.
 */
export function toDatetimeLocalString(
  date: Date | null | undefined,
  timezone: string = "UTC"
): string {
  if (!date) return "";
  const zoned = toZonedTime(date, timezone);
  return format(zoned, "yyyy-MM-dd'T'HH:mm");
}
```

- [ ] **Step 3: Run the date tests**

Run:

```bash
npm run test -- lib/utils/date.test.ts
```

Expected: all date tests pass, including the new `datetimeLocalToUtc` and `toDatetimeLocalString` suites and the round-trip test.

### Task 4: Restructure the Validation Schemas

**Files:**
- Modify: `lib/validation/task.ts:10-21`
- Test: `lib/validation/__tests__/task.test.ts`

- [ ] **Step 1: Extract `taskFieldSchema` and rebuild `createTaskSchema`**

Replace the `createTaskSchema`/`updateTaskSchema` block with:

```ts
const taskFieldSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(2000, "Description must be less than 2000 characters").nullable().optional(),
  status: z.enum(taskStatusValues),
  priority: z.enum(taskPriorityValues),
  dueDate: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
});

export const createTaskSchema = taskFieldSchema.extend({
  status: taskFieldSchema.shape.status.default("todo"),
  priority: taskFieldSchema.shape.priority.default("medium"),
});

export const updateTaskSchema = taskFieldSchema.partial().extend({
  id: z.uuid(),
});
```

Keep the existing `taskFilterSchema`, `taskSortSchema`, `taskGroupBySchema`, `taskQueryParamsSchema`, and exported types unchanged. The `CreateTaskInput` and `UpdateTaskInput` types are still `z.infer<...>`; their shapes update automatically.

- [ ] **Step 2: Run the validation tests**

Run:

```bash
npm run test -- lib/validation/__tests__/task.test.ts
```

Expected: all validation tests pass, including the new null-acceptance tests for `dueDate`/`categoryId` and the no-default/partial-title tests for `updateTaskSchema`. Existing tests continue to pass because `createTaskSchema` still applies `status`/`priority` defaults and still accepts all previously-valid inputs.

### Task 5: Rewrite the Task Actions

**Files:**
- Modify: `lib/actions/task.ts:1-68`
- Test: `lib/actions/__tests__/task.test.ts`

- [ ] **Step 1: Add imports**

Update the imports at the top of `lib/actions/task.ts`:

```ts
"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createTaskSchema, updateTaskSchema } from "@/lib/validation/task";
import { getCurrentUserId } from "@/lib/auth/session";
import { handleActionError } from "@/lib/utils/action-error";
import { type ActionResult } from "@/lib/actions/types";
import { getUserTimezone } from "@/lib/data/preferences";
import { datetimeLocalToUtc } from "@/lib/utils/date";
```

- [ ] **Step 2: Rewrite `createTaskAction`**

```ts
export async function createTaskAction(input: unknown): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createTaskSchema.parse(input);
    const timezone = await getUserTimezone(userId);

    const [task] = await db.insert(tasks).values({
      ...validated,
      userId,
      description: validated.description || null,
      dueDate: validated.dueDate ? datetimeLocalToUtc(validated.dueDate, timezone) : null,
      categoryId: validated.categoryId || null,
    }).returning();

    revalidateTag(`user-${userId}-tasks`, { expire: 0 });
    revalidateTag(`user-${userId}-dashboard`, { expire: 0 });
    return { success: true, data: task };
  } catch (error) {
    return handleActionError("[createTaskAction]", error, "Failed to create task");
  }
}
```

- [ ] **Step 3: Rewrite `updateTaskAction`**

```ts
export async function updateTaskAction(input: unknown): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateTaskSchema.parse(input);
    const { id, ...data } = validated;
    const timezone = await getUserTimezone(userId);

    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (data.title !== undefined) {
      updates.title = data.title;
    }
    if (data.description !== undefined) {
      updates.description = data.description || null;
    }
    if (data.status !== undefined) {
      updates.status = data.status;
    }
    if (data.priority !== undefined) {
      updates.priority = data.priority;
    }
    if (data.dueDate !== undefined) {
      updates.dueDate = data.dueDate ? datetimeLocalToUtc(data.dueDate, timezone) : null;
    }
    if (data.categoryId !== undefined) {
      updates.categoryId = data.categoryId || null;
    }

    const [task] = await db.update(tasks)
      .set(updates)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    revalidateTag(`user-${userId}-tasks`, { expire: 0 });
    revalidateTag(`user-${userId}-dashboard`, { expire: 0 });
    return { success: true, data: task };
  } catch (error) {
    return handleActionError("[updateTaskAction]", error, "Failed to update task");
  }
}
```

Leave `deleteTaskAction`, `toggleTaskCompletionAction`, and `archiveTaskAction` unchanged (the `timestamptz` migration in Task 7 handles their column types).

- [ ] **Step 4: Run the action tests**

Run:

```bash
npm run test -- lib/actions/__tests__/task.test.ts
```

Expected: all action tests pass, including the timezone-conversion tests for `America/New_York` and `Asia/Tokyo`, the null-clearing tests for `dueDate`/`categoryId`, the omitted-fields-preserved test, and the no-default-reset test. The existing `toggleTaskCompletionAction` and `archiveTaskAction` tests remain green.

### Task 6: Update the Components to Use the Shared Render Helper

**Files:**
- Modify: `components/tasks/inline-edit.tsx:24, 549-555`
- Modify: `components/tasks/task-form.tsx:1-31, 73-92`
- Modify: `components/tasks/edit-task-dialog.tsx:20-60`
- Modify: `components/tasks/task-detail-view.tsx:1-110`

- [ ] **Step 1: Update `InlineDueDateEdit`**

In `components/tasks/inline-edit.tsx`:

1. Add `toDatetimeLocalString` to the existing `import { formatDate } from "@/lib/utils/date";` line:

```ts
import { formatDate, toDatetimeLocalString } from "@/lib/utils/date";
```

2. Replace the `dateValue` computation (currently lines 549-555):

```ts
const dateValue = toDatetimeLocalString(task.dueDate, timezone);
```

Keep the rest of the component unchanged. The `timezone` prop is already passed in.

- [ ] **Step 2: Update `TaskForm` to accept and use `timezone`**

In `components/tasks/task-form.tsx`:

1. Add `toDatetimeLocalString` to a new `import` from `@/lib/utils/date` (after the existing imports):

```ts
import { toDatetimeLocalString } from "@/lib/utils/date";
```

2. Add `timezone?: string;` to `TaskFormProps`:

```ts
interface TaskFormProps {
  task?: {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date | null;
    categoryId: string | null;
  };
  categories: Category[];
  timezone?: string;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: () => void;
  submitLabel?: string;
}
```

3. Accept `timezone = "UTC"` in the destructured props and use the helper for the `dueDate` default:

```ts
export function TaskForm({
  task,
  categories,
  timezone = "UTC",
  onSubmit,
  onSuccess,
  submitLabel = task ? "Save Changes" : "Create Task",
}: TaskFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<BaseFormData>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "todo",
      priority: task?.priority ?? "medium",
      dueDate: task?.dueDate ? toDatetimeLocalString(task.dueDate, timezone) : "",
      categoryId: task?.categoryId ?? "",
    },
  });
```

Leave the rest of the form unchanged. The `baseSchema` continues to validate the form's string fields; `null` is never produced by the form itself.

- [ ] **Step 3: Update `EditTaskDialog` to accept and forward `timezone`**

In `components/tasks/edit-task-dialog.tsx`, add `timezone?: string;` to `EditTaskDialogProps` and pass it to `TaskForm`:

```ts
interface EditTaskDialogProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date | null;
    categoryId: string | null;
  };
  categories: Category[];
  timezone?: string;
  children?: React.ReactNode;
}

export function EditTaskDialog({ task, categories, timezone, children }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ... */}
      <TaskForm
        task={task}
        categories={categories}
        timezone={timezone}
        onSubmit={updateTaskAction}
        onSuccess={() => setOpen(false)}
        submitLabel="Save Changes"
      />
    </Dialog>
  );
}
```

- [ ] **Step 4: Update `handleInlineSave` and the `EditTaskDialog` usage in `task-detail-view.tsx`**

In `components/tasks/task-detail-view.tsx`:

1. Add `toDatetimeLocalString` to the existing date import:

```ts
import { isDueToday, isOverdue, formatDate, toDatetimeLocalString } from "@/lib/utils/date";
```

2. Replace the `dueDate` fallback inside `handleInlineSave`:

```ts
const dueDate =
  data.dueDate !== undefined
    ? (data.dueDate as string | null) ?? ""
    : task.dueDate
      ? toDatetimeLocalString(task.dueDate, timezone)
      : "";
```

This prevents the double-conversion bug: when another field is edited and `dueDate` is not in `data`, the fallback now produces the same `datetime-local` string the editor would have shown, so the action's timezone conversion produces the same UTC instant.

3. Pass `timezone` to the `EditTaskDialog`:

```ts
<EditTaskDialog
  task={{
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    categoryId: task.categoryId,
  }}
  categories={categories}
  timezone={timezone}
>
```

- [ ] **Step 5: Verify `CreateTaskDialog` needs no change**

`components/tasks/create-task-dialog.tsx` renders `<TaskForm categories={categories} onSubmit={createTaskAction} onSuccess={...} submitLabel="Create Task" />` with no `task` prop. The form's `dueDate` default is `""` (no task), so the render helper is not used. The user's picked `datetime-local` string is sent to `createTaskAction`, which fetches the timezone and converts. No change required.

- [ ] **Step 6: Run the build to verify the component edits type-check**

Run:

```bash
npm run build
```

Expected: the production build succeeds. The `EditTaskDialog` now requires no new prop at the call site (timezone is optional, defaults to `"UTC"`), and `TaskDetailView` already receives `timezone` from the page.

### Task 7: Generate and Review the `timestamptz` Migration

**Files:**
- Modify: `lib/db/schema.ts:39-40, 49, 52-53, 66-67, 70-71, 78-79, 87, 99-100, 121-124, 144-145`
- Create: `lib/db/migrations/0004_<drizzle_slug>.sql` (via drizzle-kit)
- Create: `lib/db/migrations/meta/0004_snapshot.json` (via drizzle-kit)
- Modify: `lib/db/migrations/meta/_journal.json` (via drizzle-kit)

- [ ] **Step 1: Add `{ withTimezone: true }` to every `timestamp(...)` column**

In `lib/db/schema.ts`, change every `timestamp("col")` to `timestamp("col", { withTimezone: true })`. The full list of columns to update:

- `users.createdAt`, `users.updatedAt`
- `sessions.expiresAt`, `sessions.createdAt`, `sessions.updatedAt`
- `accounts.accessTokenExpiresAt`, `accounts.refreshTokenExpiresAt`, `accounts.createdAt`, `accounts.updatedAt`
- `verifications.expiresAt`, `verifications.createdAt`, `verifications.updatedAt`
- `rateLimit.lastRequest`
- `categories.createdAt`, `categories.updatedAt`
- `tasks.dueDate`, `tasks.completedAt`, `tasks.createdAt`, `tasks.updatedAt`
- `userPreferences.createdAt`, `userPreferences.updatedAt`

Do not change column names, nullability, defaults, or indexes. Only add the `{ withTimezone: true }` second argument.

- [ ] **Step 2: Generate the migration**

Run:

```bash
npx drizzle-kit generate
```

Expected: drizzle-kit creates a new file `lib/db/migrations/0004_<slug>.sql` (the slug is drizzle-kit-chosen) plus the matching snapshot and journal updates. The SQL should be a series of `ALTER TABLE "<table>" ALTER COLUMN "<col>" TYPE timestamp with time zone;` statements — one per changed column.

- [ ] **Step 3: Review the generated SQL**

Open `lib/db/migrations/0004_<slug>.sql` and verify:

1. Every statement is `ALTER TABLE ... ALTER COLUMN ... TYPE timestamp with time zone;` — no `DROP`, no `CREATE`, no data rewrite.
2. The column list matches Section 6 Task 7 Step 1 exactly.
3. No index, constraint, or foreign-key change is present.
4. The statement order is safe (PostgreSQL allows all of these in any order because they are independent column casts).

If the generated SQL contains anything else (e.g., a table rewrite, a `USING` clause that reinterprets values, an unintended index drop), stop and reconcile the schema diff before proceeding. Do not edit the generated SQL by hand.

- [ ] **Step 4: Verify the migration semantics against existing production data**

Confirm in writing (in `context/current-feature.md` `## Notes`) before applying:

1. The app has only ever run on UTC runtimes (Vercel/Neon HTTP), so every existing `timestamp without time zone` value is a UTC instant stored without an explicit UTC anchor.
2. PostgreSQL's `timestamp without time zone` → `timestamp with time zone` cast interprets the existing naive value as the session timezone. Neon's session timezone is UTC, so an existing `2025-12-31 16:00:00` becomes the `timestamptz` value `2025-12-31T16:00:00Z` — the same UTC instant.
3. No backfill or `USING` clause is needed.
4. The migration is reversible in principle (`ALTER COLUMN ... TYPE timestamp without time zone` would drop the UTC anchor) but is not intended to be reversed.

If possible, test the migration on a staging branch first (Neon branching or a local copy) and confirm a sample of existing `tasks.dueDate` values render identically before and after.

- [ ] **Step 5: Apply the migration**

Run:

```bash
npx drizzle-kit migrate
```

Expected: the migration applies cleanly against `DATABASE_URL_UNPOOLED`. Verify with a quick query (via the Neon MCP `run_sql` tool or `psql`) that `information_schema.columns` now reports `timestamp with time zone` for `tasks.due_date` and the other changed columns. Do not use `db:push` at any point.

### Task 8: Run Full Verification

**Files:**
- Verify: `lib/utils/date.ts`
- Verify: `lib/validation/task.ts`
- Verify: `lib/actions/task.ts`
- Verify: `lib/db/schema.ts`
- Verify: `lib/db/migrations/0004_<slug>.sql`
- Verify: `components/tasks/inline-edit.tsx`
- Verify: `components/tasks/task-form.tsx`
- Verify: `components/tasks/edit-task-dialog.tsx`
- Verify: `components/tasks/task-detail-view.tsx`
- Modify: `context/current-feature.md`
- Modify: `context/features/phase-6/TASKS.md`

- [ ] **Step 1: Run the full test suite**

Run:

```bash
npm run test
```

Expected: all tests pass with no failed test files (the P6-F2 baseline plus the new date, validation, and action tests added in Task 2). The existing `lib/data/__tests__/task.test.ts` mock for `@/lib/utils/date` returns fixed `Date` instances and is unaffected by the new helpers.

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint -- --max-warnings=0
```

Expected: the only remaining errors are the two known pre-existing shadcn/ui baseline errors (`components/ui/carousel.tsx:98`, `hooks/use-mobile.ts:14`). No new errors or warnings introduced by P6-F3. If a new error appears, fix it before proceeding.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js completes a production build with no errors.

- [ ] **Step 4: Browser-verify the due-date round-trip for a non-UTC user**

Start the dev server with `npm run dev`, sign in as the seeded test user, and set the user's timezone to `America/New_York` in `/settings/preferences` (so EST/UTC-5 applies to the test date).

Create flow:

```text
1. Open /tasks and click "Create Task".
2. Set Title = "NY due-date test".
3. Set Due Date = 2025-12-31 16:00 (winter, EST).
4. Save and open the new task at /tasks/[id].
5. Expected: the inline due-date display shows "Dec 31, 2025" and the datetime-local input (when clicked) shows "2025-12-31T16:00".
6. Reload the page; the values persist.
7. In the Neon console (or via run_sql), inspect the row: tasks.due_date should be 2025-12-31T21:00:00+00:00 (UTC).
```

Edit-via-form flow:

```text
1. On the same task, click "All fields" to open EditTaskDialog.
2. The Due Date input shows "2025-12-31T16:00" (matches the inline editor — both editors now agree).
3. Change Due Date to 2025-12-31T18:00 and Save Changes.
4. Expected: toast "Task updated"; the inline display updates; the DB row shows 2025-12-31T23:00:00+00:00 (UTC).
```

Inline-edit flow:

```text
1. Click the due date to enter inline editing.
2. Change to 2025-12-31T09:00 and blur.
3. Expected: toast "Task updated"; DB row shows 2025-12-31T14:00:00+00:00 (UTC, because 09:00 EST = 14:00 UTC).
```

Clear flow:

```text
1. Click the due date, delete the value, and blur.
2. Expected: toast "Task updated"; the inline display shows "Set due date"; DB row shows due_date IS NULL.
```

Partial-update probe:

```text
1. Re-set the due date to 2025-12-31T16:00 and the category to any owned category. Confirm both persist.
2. Inline-edit ONLY the title to "NY due-date test (renamed)".
3. Expected: toast "Task updated"; DB row retains due_date = 2025-12-31T21:00:00+00:00, category_id unchanged, status unchanged, priority unchanged.
```

- [ ] **Step 5: Complete the workflow record**

In `context/current-feature.md`, change `## Status` to `Complete`, mark all five P6-F3 goal checkboxes complete, and append this entry to `## History` without altering previous entries:

```md
- **Task Date and Partial Update Correctness (P6-F3)** (2026-07-19) - Added `datetimeLocalToUtc` and `toDatetimeLocalString` shared helpers backed by `date-fns-tz`; rewrote `createTaskAction`/`updateTaskAction` to fetch the user's timezone and convert `datetime-local` on write; rebuilt `updateTaskSchema` from a defaults-free base so partial updates preserve omitted fields and treat `null`/`""` as the clear signal for `dueDate`/`categoryId`/`description`; unified the two divergent `datetime-local` render paths in `task-form.tsx`, `inline-edit.tsx`, and the `handleInlineSave` fallback on the shared helper; migrated every `timestamp` column to `timestamp with time zone` via a reviewed Drizzle migration applied with `drizzle-kit migrate`. Added timezone, partial-update, and null-clearing regression coverage. Browser-verified the non-UTC round-trip for create, edit-via-form, inline-edit, clear, and partial-update flows.
```

In `context/features/phase-6/TASKS.md`, check off the eight P6-F3 items:

```md
### P6-F3: Task Date and Partial Update Correctness (Issues #3, #4, and #6)

- [x] Establish one wall-time conversion path for `datetime-local` values using the saved user timezone.
- [x] Establish one shared rendering helper for task due dates in both task editors.
- [x] Add timezone regression tests for create, update, and render behavior.
- [x] Migrate persisted timestamps from `timestamp` to `timestamptz` with a reviewed Drizzle migration.
- [x] Verify migration semantics against existing production timestamp data before applying it.
- [x] Change `updateTaskAction` to update only fields present in the request.
- [x] Preserve explicit `null` as the signal to clear `dueDate`, `categoryId`, and `description`.
- [x] Add regression tests proving omitted fields are preserved and explicit nulls clear values.
```

- [ ] **Step 6: Review the final diff**

Run:

```bash
git diff -- context/current-feature.md context/features/phase-6/TASKS.md lib/utils/date.ts lib/validation/task.ts lib/actions/task.ts lib/db/schema.ts components/tasks/inline-edit.tsx components/tasks/task-form.tsx components/tasks/edit-task-dialog.tsx components/tasks/task-detail-view.tsx lib/utils/date.test.ts lib/validation/__tests__/task.test.ts lib/actions/__tests__/task.test.ts
git status --short lib/db/migrations/
```

Expected: the tracked-file diff contains only the workflow updates, the two new date helpers, the validation restructure, the action rewrite, the schema `withTimezone` additions, the component render-helper swaps, and the test additions. The `lib/db/migrations/` listing shows the new `0004_<slug>.sql`, the new snapshot, and the updated journal. No schema migration appears in tracked source files beyond `lib/db/schema.ts` and the new migration files. No unrelated refactor appears.

- [ ] **Step 7: Request permission before committing**

Do not commit automatically. After the user approves, run:

```bash
git add context/current-feature.md context/features/phase-6/TASKS.md context/features/phase-6/03-task-date-partial-update-correctness/FEATURE.md lib/utils/date.ts lib/validation/task.ts lib/actions/task.ts lib/db/schema.ts lib/db/migrations/ components/tasks/inline-edit.tsx components/tasks/task-form.tsx components/tasks/edit-task-dialog.tsx components/tasks/task-detail-view.tsx lib/utils/date.test.ts lib/validation/__tests__/task.test.ts lib/actions/__tests__/task.test.ts
git commit -m "fix: timezone-safe task due dates and partial updates"
```

Expected: one focused conventional commit containing the approved remediation, the reviewed migration, and its documentation.

---

## 7. Acceptance Criteria

### 7.1 Functional

- [ ] A non-UTC user creating a task with due date `2025-12-31T16:00` in `America/New_York` persists `2025-12-31T21:00:00+00:00` in the database.
- [ ] The inline due-date editor and the `EditTaskDialog` form show the **same** `datetime-local` value for the same task.
- [ ] The displayed due date does not shift when the user's browser offset differs from their saved timezone preference.
- [ ] Editing only the title preserves `dueDate`, `categoryId`, `status`, `priority`, and `description` unchanged.
- [ ] Sending `dueDate: null` (or `""`) on update clears the column to `NULL`.
- [ ] Sending `categoryId: null` (or `""`) on update clears the column to `NULL`.
- [ ] Sending `description: null` (or `""`) on update clears the column to `NULL` (preserved from P6-F2).
- [ ] Creating a task without `dueDate`/`categoryId` persists `NULL` for both.
- [ ] Creating a task without `status`/`priority` defaults to `todo`/`medium` (unchanged).
- [ ] Updating a task without `status`/`priority` leaves both columns unchanged (no default reset).

### 7.2 Technical

- [ ] `datetimeLocalToUtc` and `toDatetimeLocalString` are exported from `lib/utils/date.ts` and round-trip correctly across UTC, `America/New_York`, and `Asia/Tokyo`.
- [ ] `updateTaskSchema` is `taskFieldSchema.partial().extend({ id: z.uuid() })` where `taskFieldSchema` has no `.default()` declarations.
- [ ] `createTaskSchema` retains `.default("todo")` on `status` and `.default("medium")` on `priority`.
- [ ] `dueDate` and `categoryId` are `.nullable().optional()` in both schemas.
- [ ] `createTaskAction` and `updateTaskAction` both call `getUserTimezone(userId)` after the auth check.
- [ ] `updateTaskAction`'s `.set()` object contains only `updatedAt` plus keys present in `validated`.
- [ ] Every `timestamp(...)` column in `lib/db/schema.ts` uses `{ withTimezone: true }`.
- [ ] The generated migration contains only `ALTER TABLE ... ALTER COLUMN ... TYPE timestamp with time zone` statements.
- [ ] The migration was applied via `drizzle-kit migrate`, never `db:push`.
- [ ] All three render paths (`TaskForm`, `InlineDueDateEdit`, `handleInlineSave` fallback) call `toDatetimeLocalString` with the user's timezone.
- [ ] Every database query remains scoped by `userId` (no change to existing scoping).
- [ ] Existing cache tags and revalidation behavior remain unchanged.

### 7.3 Quality Gates

- [ ] Focused date, validation, and action tests pass.
- [ ] Full test suite passes.
- [ ] Lint passes with only the two known pre-existing shadcn/ui baseline errors.
- [ ] Production build passes.
- [ ] Browser verification of create, edit-via-form, inline-edit, clear, and partial-update flows passes for a non-UTC user.

---

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| `fromZonedTime` reads UTC fields instead of local fields on a non-UTC runtime, producing wrong UTC instants | Due dates drift by the server's offset | Construct the input via `new Date(year, month - 1, day, hours, minutes)` so local fields are the picked wall time; the date helper tests pin the UTC output for `America/New_York` and `Asia/Tokyo` regardless of the test runner's timezone. |
| `updateTaskSchema.partial()` still applies `.default()` (Zod v4 breaking change) | Partial updates silently reset `status`/`priority` to `todo`/`medium` | Rebuild `updateTaskSchema` from `taskFieldSchema` (no defaults) before calling `.partial()`. The `"should NOT apply createSchema defaults"` and `"should not reset status or priority to defaults when omitted"` tests pin this. |
| Forgetting to update `handleInlineSave`'s `dueDate` fallback causes a double-conversion when editing other fields | Due date shifts on every unrelated inline edit | Step 4 of Task 6 replaces the `toISOString().slice(0, 16)` fallback with `toDatetimeLocalString`. The partial-update browser probe verifies the due date is preserved after a title-only edit. |
| The `timestamptz` migration reinterprets existing values in a non-UTC session | Past due dates shift by the session offset | Task 7 Step 4 requires written confirmation that Neon's session timezone is UTC and that existing values are UTC instants. The migration is reviewed for absence of `USING` clauses and tested on staging first when possible. |
| `getUserTimezone` returns stale cached data after a preferences update | A user who just changed their timezone sees due dates converted with the old tz for up to the cache lifetime | `getUserTimezone` is tagged `user-${userId}-preferences`, and `updatePreferencesAction` already invalidates that tag. Existing behavior is preserved. |
| Existing action tests break because they don't mock `getUserTimezone` | False test failures block the fix | Task 2 Step 3 adds the `@/lib/data/preferences` mock and updates the two affected existing tests (`"should convert dueDate string to Date object"`, `"should set updatedAt to current date"`) before any production code changes. |
| `EditTaskDialog` callers don't pass `timezone` and the form falls back to `"UTC"` | Non-UTC users editing via the dialog see UTC wall time | `TaskDetailView` already receives `timezone` from the page and Task 6 Step 4 threads it into `EditTaskDialog`. The browser-verification edit-via-form flow catches any remaining gap. |
| The generated migration includes unintended index or constraint changes | Production migration surprises | Task 7 Step 3 requires a manual review of the SQL file before apply. Any unexpected statement stops the task. |
| `db:push` is used instead of `drizzle-kit migrate` | Schema drift, lost migration history | The plan explicitly forbids `db:push` and calls `npx drizzle-kit migrate` in Task 7 Step 5. |

---

## 9. Related Documentation

- `code-review-2026-07-17.md:74-96` — blockers #3 and #4 (timezone-broken due dates, naive timestamps).
- `code-review-2026-07-17.md:120-131` — blocker #6 (`updateTaskAction` wipes `dueDate`/`categoryId`).
- `context/features/phase-6/TASKS.md:44-53` — P6-F3 backlog items.
- `context/features/phase-6/02-clearable-task-descriptions/FEATURE.md` — P6-F2 established the nullable-and-normalize pattern this plan extends to `dueDate`/`categoryId`.
- `context/features/phase-6/01-dashboard-active-status/FEATURE.md` — plan format and workflow followed by this plan.
- `lib/actions/task.ts:21-66` — current create/update actions.
- `lib/validation/task.ts:10-21` — current task schemas.
- `lib/db/schema.ts:39-145` — current `timestamp` column declarations to migrate.
- `lib/utils/date.ts:1-154` — existing date utilities to extend.
- `components/tasks/inline-edit.tsx:540-555` — current browser-local `datetime-local` render path.
- `components/tasks/task-form.tsx:82-92` — current UTC `datetime-local` render path.
- `components/tasks/task-detail-view.tsx:76-99` — `handleInlineSave` fallback that must switch to the shared helper.
- `drizzle.config.ts` — migration configuration (output dir, dialect, dbCredentials).
- `lib/db/migrations/0000_*.sql` through `0003_*.sql` — existing migration history to continue.
- Zod v4 changelog (default-inside-optional breaking change) — verified via Context7 `/colinhacks/zod`.
- `date-fns-tz` `fromZonedTime`/`toZonedTime` API and usage patterns — verified via Context7 `/marnusw/date-fns-tz`.
- Drizzle ORM `timestamp({ withTimezone: true })` and `drizzle-kit generate`/`migrate` documentation.

---

## 10. Definition of Done

- [ ] `datetimeLocalToUtc` and `toDatetimeLocalString` exist, are exported, and pass their regression tests across UTC, `America/New_York`, and `Asia/Tokyo`.
- [ ] Both task editors and the `handleInlineSave` fallback render `datetime-local` values via the shared helper, agreeing on the same wall time.
- [ ] `createTaskAction` and `updateTaskAction` fetch the user's timezone and convert `datetime-local` to UTC on write.
- [ ] `updateTaskAction` includes only present fields in `.set()`, preserving omitted fields and clearing on `null`/`""`.
- [ ] `updateTaskSchema` no longer applies `status`/`priority` defaults on partial input.
- [ ] `dueDate` and `categoryId` accept `null` in both schemas.
- [ ] Every `timestamp` column is `timestamptz` via a reviewed Drizzle migration applied with `drizzle-kit migrate`.
- [ ] Regression tests fail if any of the above is reverted.
- [ ] Browser verification confirms the non-UTC round-trip for create, edit-via-form, inline-edit, clear, and partial-update flows.
- [ ] Tests, lint, and build pass with only the known baseline lint exceptions.
- [ ] Final diff contains no unrelated changes.
- [ ] User has reviewed the results and explicitly approved any commit.
