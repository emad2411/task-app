# P6-F2 Clearable Task Descriptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Phase:** 6 - Code Review Remediation  
**Feature ID:** P6-F2  
**Status:** Draft - Ready for Implementation  
**Date:** 2026-07-19  
**Source:** `code-review-2026-07-17.md`, blocker #2  
**Branch:** `fix/P6-F2-clearable-task-descriptions`

**Goal:** Allow users to clear a task description by accepting `null` in the shared task validation schema and normalizing both `""` and `null` to a single `NULL` representation in the create and update task actions.

**Architecture:** Add `.nullable()` to the shared `createTaskSchema.description` (inherited by `updateTaskSchema`), then normalize at the action persistence boundary: create maps `""`/`null`/omitted to `null`, and update maps `""`/`null` to `null` while preserving `undefined` so Drizzle skips the column. No client, schema-migration, or data-migration changes are required; validation and action regression tests pin the contract, and a browser pass proves inline clear-then-restore.

**Tech Stack:** TypeScript 5, Next.js 16 Server Actions, Zod v4, Drizzle ORM 0.45, PostgreSQL, Vitest 4

---

## 1. Problem Statement

`lib/validation/task.ts:12` declares `description: z.string().max(2000).optional()` — not nullable. Two call paths in the inline task editor legitimately send `description: null`:

1. **Explicit clear:** `components/tasks/inline-edit.tsx:220` sends `{ description: newVal || null }`, and `components/tasks/task-detail-view.tsx:88-91` forwards it to `updateTaskAction`. Clearing a description therefore always fails.
2. **Latent forward of a NULL database value:** `task-detail-view.tsx:88-91` falls back to `task.description` when another field is edited. For any task whose description is already `NULL`, inline-editing the title, status, priority, due date, or category sends `description: null` and fails too.

In both paths `updateTaskSchema.parse()` throws a `ZodError`; `handleActionError` (`lib/utils/action-error.ts:29-35`) converts it to "Invalid input. Please check your data and try again." and the toast in `task-detail-view.tsx:105` reports failure. The user cannot clear a description, and any inline edit on a description-less task is broken.

A third caller, `components/tasks/task-form.tsx:86`, sends `description: ""` when the field is empty. `""` passes validation today and is stored as an empty string, leaving two representations of "no description" (`""` and `NULL`) in the `tasks.description` column (`lib/db/schema.ts:118`, nullable `text`).

---

## 2. Scope

### In Scope

- Make `description` nullable in `createTaskSchema` (inherited by `updateTaskSchema`).
- Normalize `""` and `null` to `null` in `createTaskAction`.
- Normalize `""` and `null` to `null` in `updateTaskAction`, preserving `undefined` as "leave unchanged."
- Validation regression tests for `null`, `""`, and non-string descriptions.
- Action regression tests proving clearing works, `""` normalizes, omitted descriptions are not force-cleared on update, and non-empty text is preserved.
- Browser verification that inline description editing can clear and subsequently restore a description.

### Out of Scope

- Partial-update semantics for `dueDate`/`categoryId` and `status`/`priority` defaults in `updateTaskAction` (review issue #6, planned as P6-F3).
- Timezone write-path and `timestamptz` migration (issues #3 and #4, P6-F3).
- Category-ownership validation on task writes (issue #5, P6-F4).
- Any database schema or data migration (existing `""` rows render identically to `NULL` and normalize on next write).
- Client component changes: `inline-edit.tsx` already emits `null` on clear, `task-detail-view.tsx` already forwards it, and `task-form.tsx` emits `""` which the server now normalizes.
- UI redesign of the description editor.

---

## 3. Design Decision

### Selected Approach: Nullable Shared Schema + Action-Boundary Normalization

1. **Validation:** one change in `lib/validation/task.ts`:

```ts
description: z.string().max(2000, "Description must be less than 2000 characters").nullable().optional(),
```

Placed in `createTaskSchema`, it is inherited by `updateTaskSchema` via `.extend({ id: z.uuid() })`, so both actions accept `string | null | undefined` from a single definition.

2. **Normalization:** at the persistence boundary in `lib/actions/task.ts`, matching the existing inline style used for `dueDate` and `categoryId`:

- Create: `description: validated.description || null` — `""`, `null`, and omitted all persist as `NULL`.
- Update: `description: data.description === undefined ? undefined : data.description || null` — omitted stays `undefined` so Drizzle leaves the column unchanged, while `""` and `null` both persist as `NULL`.

Drizzle documents that values of `undefined` in `.set()` are ignored and `null` explicitly sets a column to `NULL` (verified against the current Drizzle ORM update documentation), so `null` is the single "clear" signal and `undefined` is the single "unchanged" signal.

### Alternatives Rejected

1. **Normalize with a Zod `.transform()` inside the schema:** create wants omitted → `NULL`, while update wants omitted → unchanged. One shared transform cannot express both, and a transform would move persistence policy into the validation layer. Normalization belongs in the actions where create/update semantics differ.
2. **Fix only the client (send `""` instead of `null` from `inline-edit.tsx`):** clearing would pass validation but keep two representations of "no description" in the database, and the latent `task-detail-view.tsx` NULL-forwarding path would still throw on every inline edit of a description-less task. The action contract must accept `null`.
3. **Store `""` everywhere instead of `NULL`:** forces every reader to treat both `""` and `NULL` as empty and is inconsistent with the `dueDate`/`categoryId` `null` convention already used by both actions.
4. **Backfill migration `UPDATE tasks SET description = NULL WHERE description = ''`:** unnecessary — every reader treats `""` as falsy and renders the same placeholder as `NULL`, and affected rows normalize on their next write. No migration is generated in this plan.

---

## 4. File Map

### Files Modified

| File | Responsibility | Planned Change |
|---|---|---|
| `lib/validation/task.ts` | Shared task Zod schemas | Add `.nullable()` to `createTaskSchema.description`. |
| `lib/actions/task.ts` | Task server actions | Normalize `description` to `null` on create; normalize on update while preserving `undefined`. |
| `lib/validation/__tests__/task.test.ts` | Validation unit tests | Add `null`, `""`, and non-string description cases for both schemas. |
| `lib/actions/__tests__/task.test.ts` | Action unit tests | Add create/update normalization and clearing regression tests. |
| `context/current-feature.md` | Active workflow state | Record P6-F2 as in progress before implementation, complete after verification, preserving append-only history. |
| `context/features/phase-6/TASKS.md` | Phase 6 remediation backlog | Link this plan and check off the four P6-F2 items after verification. |

### Files Created

None (this plan document is the only new file).

### Files Deleted

None.

---

## 5. Exact Description Handling

### Caller Behavior

| Caller | Sends when empty/cleared | Result today | Result after fix |
|---|---|---|---|
| `InlineDescriptionEdit` clear (`inline-edit.tsx:220`) | `description: null` | Zod throws → "Invalid input" toast | persists `NULL` |
| `handleInlineSave` other-field edit with NULL description (`task-detail-view.tsx:88-91`) | `description: null` | Zod throws → "Invalid input" toast | persists `NULL` (value unchanged) |
| `TaskForm` untouched field (`task-form.tsx:86`) | `description: ""` | stores `""` | persists `NULL` |
| Any caller passing text | `description: "text"` | stores `"text"` | stores `"text"` (unchanged) |
| Update caller omitting description | key absent | column unchanged | column unchanged |

### Server Normalization Rule

| Input | `createTaskAction` persists | `updateTaskAction` persists |
|---|---|---|
| `"Some text"` | `"Some text"` | `"Some text"` |
| `""` | `NULL` | `NULL` |
| `null` | `NULL` | `NULL` |
| omitted (`undefined`) | `NULL` | column unchanged (Drizzle skips `undefined`) |

---

## 6. Implementation Tasks

### Task 1: Initialize the Workflow and Establish the Baseline

**Files:**
- Modify: `context/current-feature.md:1-19`

- [x] **Step 1: Create the dedicated fix branch**

Run:

```bash
git switch -c fix/P6-F2-clearable-task-descriptions
```

Expected: Git creates and switches to `fix/P6-F2-clearable-task-descriptions` without changing or discarding the existing worktree changes (the untracked `.agents/`, `graphify-out/`, and `lint-output.txt` entries are unrelated to P6-F2 and must remain untouched).

- [x] **Step 2: Record the active fix in the workflow document**

Replace the sections above `## History` in `context/current-feature.md` with the following and leave the existing history unchanged:

```md
# Current Feature

## Status

In Progress

## Feature

P6-F2: Clearable Task Descriptions

## Goals

- [x] Accept `null` task descriptions in the shared validation schema.
- [x] Normalize empty string and `null` to `null` on create and update.
- [x] Add validation and action regression coverage for clearing.
- [x] Pass tests, lint, build, and clear-then-restore browser verification.

## Notes

- Source: `code-review-2026-07-17.md`, blocker #2.
- Plan: `context/features/phase-6/02-clearable-task-descriptions/FEATURE.md`.
- Branch: `fix/P6-F2-clearable-task-descriptions`.

## History
```

- [x] **Step 3: Run the existing task tests**

Run:

```bash
npm run test -- lib/validation/__tests__/task.test.ts lib/actions/__tests__/task.test.ts
```

Expected: both existing task test files pass before remediation. If either fails for a pre-existing reason, record the failure and resolve the environment problem before changing production code.

- [x] **Step 4: Run the repository baseline gates**

Run:

```bash
npm run test
npm run lint -- --max-warnings=0
npm run build
```

Expected: each command exits with code 0 (261 tests passing from the P6-F1 baseline). If an unrelated baseline failure remains, stop and report it rather than mixing it into P6-F2.

### Task 2: Add Failing Description Regression Tests

**Files:**
- Modify: `lib/validation/__tests__/task.test.ts:8-165`
- Modify: `lib/actions/__tests__/task.test.ts:58-226`
- Test: `lib/validation/__tests__/task.test.ts`
- Test: `lib/actions/__tests__/task.test.ts`

- [x] **Step 1: Add nullable-description validation tests**

Add inside `describe("createTaskSchema", ...)`, after the "should allow description at exactly 2000 characters" test:

```ts
it("should accept null description", () => {
  const result = createTaskSchema.safeParse({ title: "Task", description: null });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.description).toBeNull();
  }
});

it("should accept empty string description", () => {
  const result = createTaskSchema.safeParse({ title: "Task", description: "" });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.description).toBe("");
  }
});

it("should reject non-string description", () => {
  const result = createTaskSchema.safeParse({ title: "Task", description: 123 });
  expect(result.success).toBe(false);
});
```

Add inside `describe("updateTaskSchema", ...)`, after the "should validate with valid id and fields" test:

```ts
it("should accept null description for clearing", () => {
  const result = updateTaskSchema.safeParse({
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Updated task",
    description: null,
  });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.description).toBeNull();
  }
});
```

The empty-string and non-string cases pass before and after the fix; they are invariant guards. The `null` cases are the failing regression tests.

- [x] **Step 2: Add create-action normalization tests**

Add inside `describe("createTaskAction", ...)`, after the "should set categoryId to null when empty string" test:

```ts
it("should store null description when null is provided", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await createTaskAction({ title: "Task", description: null });

  const values = mockValues.mock.calls[0][0];
  expect(values.description).toBeNull();
});

it("should normalize empty string description to null", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await createTaskAction({ title: "Task", description: "" });

  const values = mockValues.mock.calls[0][0];
  expect(values.description).toBeNull();
});

it("should keep a non-empty description", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await createTaskAction({ title: "Task", description: "Notes" });

  const values = mockValues.mock.calls[0][0];
  expect(values.description).toBe("Notes");
});
```

- [x] **Step 3: Add update-action clearing and normalization tests**

Add inside `describe("updateTaskAction", ...)`, after the "should set updatedAt to current date" test:

```ts
it("should clear an existing description when null is provided", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  const result = await updateTaskAction({
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Updated",
    description: null,
  });

  expect(result.success).toBe(true);
  const setCall = mockSet.mock.calls[0][0];
  expect(setCall.description).toBeNull();
});

it("should normalize empty string description to null", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await updateTaskAction({
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Updated",
    description: "",
  });

  const setCall = mockSet.mock.calls[0][0];
  expect(setCall.description).toBeNull();
});

it("should leave description unchanged when it is omitted", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await updateTaskAction({
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Updated",
  });

  const setCall = mockSet.mock.calls[0][0];
  expect(setCall.description).toBeUndefined();
});

it("should keep a non-empty description", async () => {
  mockGetCurrentUserId.mockResolvedValue("user-1");
  mockReturning.mockResolvedValue([{ id: "task-1" }]);

  await updateTaskAction({
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Updated",
    description: "New notes",
  });

  const setCall = mockSet.mock.calls[0][0];
  expect(setCall.description).toBe("New notes");
});
```

The "leave description unchanged" and "keep a non-empty description" cases pass before and after the fix; they guard the don't-force-clear and no-mutation invariants. The `null` and `""` cases are the failing regression tests.

- [x] **Step 4: Run the tests to verify they fail for the intended reason**

Run:

```bash
npm run test -- lib/validation/__tests__/task.test.ts lib/actions/__tests__/task.test.ts
```

Expected: the two validation `null` tests fail with `result.success` being `false`; the create-action `null` test fails because `mockValues` was never called; the create-action `""` test fails with `values.description` being `""`; the update-action `null` test fails with `result.success` being `false` (Zod rejection, so `mockSet` was never called); the update-action `""` test fails with `setCall.description` being `""`. All guard tests and all existing tests remain green.

### Task 3: Make Descriptions Nullable and Normalize on the Server

**Files:**
- Modify: `lib/validation/task.ts:12`
- Modify: `lib/actions/task.ts:21-26, 46-52`
- Test: `lib/validation/__tests__/task.test.ts`
- Test: `lib/actions/__tests__/task.test.ts`

- [x] **Step 1: Make the shared description schema nullable**

Change `lib/validation/task.ts:12` to:

```ts
description: z.string().max(2000, "Description must be less than 2000 characters").nullable().optional(),
```

Keep the existing 2000-character maximum and error message. `updateTaskSchema` inherits the change through `createTaskSchema.extend({ id: z.uuid() })`; no other schema changes.

- [x] **Step 2: Normalize the description in `createTaskAction`**

Change the insert in `lib/actions/task.ts` to:

```ts
const [task] = await db.insert(tasks).values({
  ...validated,
  userId,
  // Empty string and null both mean "no description"; store a single NULL representation.
  description: validated.description || null,
  dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
  categoryId: validated.categoryId || null,
}).returning();
```

- [x] **Step 3: Normalize the description in `updateTaskAction`**

Change the update `.set()` in `lib/actions/task.ts` to:

```ts
const [task] = await db.update(tasks)
  .set({
    ...data,
    // Empty string and null clear the description; undefined leaves the column
    // unchanged because Drizzle skips undefined values in .set().
    description:
      data.description === undefined ? undefined : data.description || null,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    categoryId: data.categoryId || null,
    updatedAt: new Date(),
  })
  .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
  .returning();
```

Do not change the `dueDate`/`categoryId` handling or the `status`/`priority` defaults; partial-update correctness is P6-F3 scope.

- [x] **Step 4: Run the focused tests**

Run:

```bash
npm run test -- lib/validation/__tests__/task.test.ts lib/actions/__tests__/task.test.ts
```

Expected: all validation and action tests pass, including the new `null`, `""`, omitted, and non-empty cases.

- [x] **Step 5: Verify the only task description schema is the nullable one**

Run:

```bash
rg "description" lib/validation/task.ts
```

Expected: exactly one match, `lib/validation/task.ts:12`, and the line contains `.nullable().optional()`. (Client-local schemas in `components/tasks/inline-edit.tsx:27` and `components/tasks/task-form.tsx:64` validate only their own string form values and intentionally remain unchanged.)

### Task 4: Run Full Verification

**Files:**
- Verify: `lib/validation/task.ts`
- Verify: `lib/actions/task.ts`
- Modify: `context/current-feature.md`
- Modify: `context/features/phase-6/TASKS.md`

- [x] **Step 1: Run the full test suite**

Run:

```bash
npm run test
```

Expected: all tests pass with no failed test files (the Task 1 baseline plus 11 new tests).

- [x] **Step 2: Run lint**

Run:

```bash
npm run lint -- --max-warnings=0
```

Expected: ESLint exits with code 0; `--max-warnings=0` rejects both errors and warnings.

**Note (baseline exception, recorded 2026-07-19 at Task 1 Step 4):** the master branch already fails `npm run lint -- --max-warnings=0` with two pre-existing errors in untouched shadcn/ui-generated files (`components/ui/carousel.tsx:98` and `hooks/use-mobile.ts:14`, both `react-hooks/set-state-in-effect`). Per plan instruction these were reported and the user chose to proceed and treat them as a known baseline. If this command fails, run `npm run lint` (without `--max-warnings=0`) and confirm the only remaining errors are the two pre-existing shadcn files; any new error or warning introduced by P6-F2 fails this gate.

- [x] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js completes a production build with no errors.

- [x] **Step 4: Verify the behavior in the browser**

Start the dev server with `npm run dev`, sign in with the seeded test user, and open `/tasks/[taskId]` for a task that has a non-empty description.

Clear flow:

```text
1. Click the description to enter inline editing.
2. Delete all text and click outside the textarea (blur saves).
3. Expect the "Task updated" toast, not "Invalid input".
4. Expect the italic "Add a description..." placeholder in place of the text.
5. Reload the page; the placeholder remains (the clear persisted).
```

Restore flow:

```text
1. Click "Add a description..." to enter inline editing.
2. Type a new description and click outside the textarea.
3. Expect the "Task updated" toast and the new text rendered.
4. Reload the page; the new description remains (the restore persisted).
```

Regression probe for the latent forwarding bug:

```text
1. On the same now-description-less task (or after clearing again), inline-edit the title.
2. Expect the "Task updated" toast; before the fix this path also sent description: null and failed.
```

- [x] **Step 5: Complete the workflow record**

In `context/current-feature.md`, change `## Status` to `Complete`, mark all four P6-F2 goal checkboxes complete, and append this entry to `## History` without altering previous entries:

```md
- **Clearable Task Descriptions (P6-F2)** (2026-07-19) - Made task descriptions nullable in the shared validation schema, normalized empty string and `null` to `null` in the create and update task actions (preserving `undefined` as leave-unchanged on update), added validation and action regression tests, and verified inline clear-then-restore in the browser.
```

In `context/features/phase-6/TASKS.md`, check off the four P6-F2 items:

```md
### P6-F2: Clearable Task Descriptions (Issue #2)

- [x] Make task descriptions nullable in the shared task validation schema.
- [x] Normalize both an empty string and `null` to `null` on the server.
- [x] Add action regression tests for clearing an existing description.
- [x] Verify inline description editing can clear and subsequently restore a description.
```

Expected: the workflow document no longer reports P6-F2 as in progress, all goals are checked, the append-only history records the completed fix, and the phase backlog reflects completion.

- [x] **Step 6: Review the final diff**

Run:

```bash
git diff -- context/current-feature.md context/features/phase-6/TASKS.md lib/validation/task.ts lib/actions/task.ts lib/validation/__tests__/task.test.ts lib/actions/__tests__/task.test.ts
```

Expected: only the workflow updates, the nullable schema, the two normalization expressions with their comments, and the new tests are present. No schema migration, client component, or unrelated refactor appears.

- [x] **Step 7: Request permission before committing**

Do not commit automatically. After the user approves, run:

```bash
git add context/current-feature.md context/features/phase-6/TASKS.md context/features/phase-6/02-clearable-task-descriptions/FEATURE.md lib/validation/task.ts lib/actions/task.ts lib/validation/__tests__/task.test.ts lib/actions/__tests__/task.test.ts
git commit -m "fix: allow clearing task descriptions"
```

Expected: one focused conventional commit containing the approved remediation and its documentation.

---

## 7. Acceptance Criteria

### Functional

- [x] Clearing a description via inline editing succeeds and persists `NULL`.
- [x] A cleared description can be restored via inline editing and persists after reload.
- [x] Inline-editing any other field on a task with a `NULL` description succeeds.
- [x] Saving a task with an empty description from `TaskForm` persists `NULL`, not `""`.
- [x] Non-empty descriptions are stored unchanged on create and update.
- [x] Descriptions over 2000 characters are still rejected with the existing message.

### Technical

- [x] `createTaskSchema.description` is `z.string().max(2000).nullable().optional()`; `updateTaskSchema` inherits it.
- [x] `createTaskAction` persists `""`/`null`/omitted as `NULL`.
- [x] `updateTaskAction` persists `""`/`null` as `NULL` and leaves the column unchanged when description is omitted.
- [x] Every query remains scoped by `userId` (no change to existing scoping).
- [x] No database migration is generated.
- [x] No client component changes are required.
- [x] Existing cache tags and revalidation behavior remain unchanged.

### Quality Gates

- [x] Focused validation and action tests pass.
- [x] Full test suite passes.
- [x] Lint passes with zero warnings; two pre-existing shadcn/ui lint errors are accepted as the known baseline (see Task 4 Step 2 note).
- [x] Production build passes.
- [x] Browser verification of clear, restore, and the latent forwarding probe passes.

---

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Update normalization accidentally force-clears omitted descriptions | Silent data loss on partial updates | Explicit `=== undefined` guard plus a dedicated "leave description unchanged when it is omitted" test. |
| `""` rows already in the database behave differently from `NULL` | Inconsistent empty rendering | All readers treat `""` as falsy and render the same placeholder as `NULL`; rows normalize on next write. No migration needed. |
| A caller relies on `""` round-tripping as `""` | Display drift | No reader distinguishes `""` from `NULL` (`task-detail-view.tsx`, `inline-edit.tsx:284-287`, and the data layer all use falsy checks). |
| Widening the schema admits unexpected types | Bad data persisted | The non-string rejection test pins that only `string`, `null`, and `undefined` are accepted; the 2000-char maximum is unchanged. |
| Client schemas reject `null` before the action is reached | Fix unreachable | Client-local schemas only validate their own string form values; `inline-edit.tsx:220` already sends `null` after local validation of the string. Verified end-to-end in the browser step. |

---

## 9. Related Documentation

- `code-review-2026-07-17.md:57-70` - blocker #2 and the recommended nullable schema plus server normalization.
- `context/features/phase-6/TASKS.md:35-40` - P6-F2 backlog items.
- `context/features/phase-6/01-dashboard-active-status/FEATURE.md` - plan format and workflow followed by this plan.
- `lib/validation/task.ts:12` - shared task schema.
- `lib/actions/task.ts:12-66` - create and update actions.
- `lib/db/schema.ts:118` - nullable `tasks.description` column.
- `components/tasks/inline-edit.tsx:196-223` - inline description editor emitting `null` on clear.
- `components/tasks/task-detail-view.tsx:76-109` - inline save handler forwarding `null`.
- Drizzle ORM update documentation - `.set()` ignores `undefined` values; `null` explicitly sets a column to `NULL`.

---

## 10. Definition of Done

- [x] The shared task validation schema accepts `null` descriptions.
- [x] Create and update actions persist `""` and `null` as `NULL`; update leaves omitted descriptions unchanged.
- [x] Validation and action regression tests fail if nullability or normalization is removed.
- [x] Browser verification confirms inline clear, restore, and other-field edits on a description-less task.
- [x] Tests, lint, and build pass.
- [x] Final diff contains no unrelated changes.
- [x] User has reviewed the results and explicitly approved any commit.
