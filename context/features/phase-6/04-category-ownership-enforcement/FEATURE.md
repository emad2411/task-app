# P6-F4 Category Ownership Enforcement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase:** 6 - Code Review Remediation
**Feature ID:** P6-F4
**Status:** Draft - Ready for Implementation
**Date:** 2026-07-20
**Source:** `code-review-2026-07-17.md`, blocker #5
**Branch:** `fix/P6-F4-category-ownership`

**Goal:** Enforce that a `categoryId` supplied on task create/update belongs to the authenticated user, closing the IDOR-class authorization gap. Reject foreign or missing categories with a sanitized `Invalid category` error. Read paths are already user-scoped and need no change (verified during planning).

**Architecture:** Add a user-scoped `getCategoryById(userId, id)` lookup to `lib/data/category.ts`. In `lib/actions/task.ts`, before the DB insert/update, if `validated.categoryId` is present (non-null, non-empty), call `getCategoryById(userId, categoryId)`; if it returns `null`, return `{ success: false, error: "Invalid category" }`. No schema migration, no read-path changes, no UI changes.

**Tech Stack:** TypeScript 5, Next.js 16 Server Actions, Zod v4, Drizzle ORM 0.45 with `drizzle-kit` 0.31, PostgreSQL (Neon), Vitest 4

---

## 1. Problem Statement

### 1.1 Issue #5 — Task writes do not verify category ownership (IDOR)

`lib/actions/task.ts` accepts a `categoryId` on both write paths without confirming it belongs to the caller:

- `createTaskAction` (lines 24-30) inserts `categoryId: validated.categoryId || null` directly.
- `updateTaskAction` (lines 68-70) sets `categoryId: data.categoryId || null` directly.

There is no lookup of the category, no `userId` check, and no foreign-key-to-user constraint in the schema. A malicious user who supplies another user's `categoryId` can attach their own task to a category they do not own. Consequences:

1. **Integrity violation** — a task points at a category outside the user's account, which can break downstream assumptions (counts, filters, exports).
2. **Minor data leak** — the attacker's own task would then render with the victim's category **name and color** (the attacker sees it on their own task via the `with: { category: true }` relation).

### 1.2 Read paths are already safe (verified, no work)

During planning the read layer was inspected:

- `getTasks` / `getTaskById` (`lib/data/task.ts:49, 177`) filter `tasks.userId = userId`, and `with: { category: true }` only follows the task's *own* category — which is already user-scoped, so no foreign category can be reached.
- `getCategoriesForUser` (`lib/data/task.ts:201`) filters `categories.userId = userId`.

Therefore the reviewer's concern about reads leaking another user's category through a task relation is **already satisfied**. The fix is confined to the two write actions.

---

## 2. Scope

### In Scope

- Add a user-scoped `getCategoryById(userId, id)` data-layer function.
- Enforce ownership in `createTaskAction` before insert.
- Enforce ownership in `updateTaskAction` before update.
- Return a sanitized `Invalid category` error for missing, foreign, or non-owned categories (no hint about existence).
- Add cross-user tests proving a foreign `categoryId` is rejected on both create and update.
- Add a positive test proving a user's own `categoryId` is accepted.

### Out of Scope

- Any change to read paths (`getTasks`, `getTaskById`, `getCategoriesForUser`) — already safe.
- Schema migration / foreign-key-to-user constraint — enforcement is done in the action layer per existing project convention (same as the existing `userId` scoping on every query).
- UI changes — the existing category picker only offers the user's own categories, so no client change is required.
- Dashboard analytics, session/timezone/rate-limit hardening, preferences, archived visibility, UI/auth/email polish (issues #7-#17, P6-F5 onward).
- Maintenance nits (P6-M1-M8).

---

## 3. Design Decision

### 3.1 Selected Approach

**User-scoped lookup:** add `getCategoryById(userId: string, id: string)` to `lib/data/category.ts`:

```ts
export async function getCategoryById(userId: string, id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`user-${userId}-categories`);
  return db.query.categories.findFirst({
    where: and(eq(categories.id, id), eq(categories.userId, userId)),
  });
}
```

Because the `where` includes `eq(categories.userId, userId)`, a foreign or non-existent id resolves to `null` — exactly the signal we need, with no extra query and no information about *why* it failed.

**Ownership gate in the actions:** in both `createTaskAction` and `updateTaskAction`, after the auth check and (for update) after parsing, if a `categoryId` is present:

```ts
if (validated.categoryId) {
  const owned = await getCategoryById(userId, validated.categoryId);
  if (!owned) {
    return { success: false, error: "Invalid category" };
  }
}
```

The gate runs **before** any DB write. The existing `categoryId: validated.categoryId || null` persistence lines stay unchanged — they only execute after the ownership check passes.

**Sanitized error:** the literal `"Invalid category"` is returned with no distinction between "does not exist" and "belongs to someone else." This avoids enumerate-or-leak behavior.

### 3.2 Alternatives Rejected

1. **Reuse `getCategoriesForUser(userId)` + `.find()` in the action:** works, but pulls the whole category list into the action on every task write. A dedicated `getCategoryById` is a single indexed row lookup, cache-tagged with `user-${userId}-categories`, and is directly unit-testable. Chosen for precision and testability.
2. **Add a DB foreign key from `tasks.categoryId` → `categories.id` with `ON DELETE` + a `userId` match:** the schema has no such constraint and adding one would require a migration plus a multi-column FK that PostgreSQL does not enforce across the `userId` boundary without a shared `userId` column on `tasks` (it already has one, but FKs can't span the ownership check cleanly). Action-layer enforcement matches the project's existing convention of scoping every query by `userId`. Rejected as heavier than needed.
3. **Silently ignore a foreign `categoryId` and create the task uncategorized:** hides the bug and produces confusing data (a user "successfully" sets a category that silently disappears). Hard reject with a clear error is the correct, debuggable behavior and matches the reviewer's intent.
4. **Validate ownership in the Zod schema:** Zod schemas are sync and have no access to `userId`/DB. Ownership is an authorization concern, not a validation concern — it belongs in the action, consistent with how `getCurrentUserId` is already used.

---

## 4. File Map

### 4.1 Files Modified

| File | Responsibility | Planned Change |
|---|---|---|
| `lib/data/category.ts` | Category data layer | Add `getCategoryById(userId, id)` user-scoped lookup (cached, `user-${userId}-categories` tag). |
| `lib/actions/task.ts` | Task server actions | Import `getCategoryById`; add the ownership gate in `createTaskAction` (before insert) and `updateTaskAction` (before update); return `{ success: false, error: "Invalid category" }` when the lookup returns `null`. |
| `lib/actions/__tests__/task.test.ts` | Action tests | Mock `getCategoryById`; add cross-user (foreign id rejected) and positive (own id accepted) tests for both actions. |
| `context/current-feature.md` | Active workflow state | Record P6-F4 as in progress before implementation, complete after verification, preserving append-only history. |
| `context/features/phase-6/TASKS.md` | Phase 6 remediation backlog | Check off the five P6-F4 items after verification. |

### 4.2 Files Created

None.

### 4.3 Files Deleted

None.

---

## 5. Exact Behavior

### 5.1 `createTaskAction` — `categoryId` handling

| Input `categoryId` | Ownership check result | Action behavior |
|---|---|---|
| omitted / `null` / `""` | gate skipped (no lookup) | task created with `categoryId: null` |
| valid id owned by caller | `getCategoryById` returns the row | task created with `categoryId` set |
| foreign id (another user's) | `getCategoryById` returns `null` | returns `{ success: false, error: "Invalid category" }`, no insert |
| non-existent id | `getCategoryById` returns `null` | returns `{ success: false, error: "Invalid category" }`, no insert |

### 5.2 `updateTaskAction` — `categoryId` handling

| Input `categoryId` | Ownership check result | Action behavior |
|---|---|---|
| omitted (`undefined`) | gate skipped | field left unchanged (key absent from `.set()`) |
| `null` / `""` | gate skipped (clears category) | `categoryId` set to `null` |
| valid id owned by caller | `getCategoryById` returns the row | `categoryId` updated |
| foreign id (another user's) | `getCategoryById` returns `null` | returns `{ success: false, error: "Invalid category" }`, no update |
| non-existent id | `getCategoryById` returns `null` | returns `{ success: false, error: "Invalid category" }`, no update |

The error string is identical for "foreign" and "non-existent" so the response does not reveal whether a category exists.

---

## 6. Implementation Tasks

### Task 1: Initialize the Workflow and Establish the Baseline

**Files:**
- Modify: `context/current-feature.md`

- [ ] **Step 1: Create the dedicated fix branch**

Run:

```bash
git switch -c fix/P6-F4-category-ownership
```

Expected: Git creates and switches to `fix/P6-F4-category-ownership` without changing or discarding the existing worktree state.

- [ ] **Step 2: Record the active fix in the workflow document**

Replace the sections above `## History` in `context/current-feature.md` with the following and leave the existing history unchanged:

```md
# Current Feature

## Status

In Progress

## Feature

P6-F4: Category Ownership Enforcement

## Goals

- [ ] Enforce that a supplied `categoryId` belongs to the authenticated user on task create and update.
- [ ] Return a sanitized `Invalid category` error for missing or foreign categories.
- [ ] Add cross-user rejection and positive-acceptance regression tests.
- [ ] Pass tests, lint, and build.

## Notes

- Source: `code-review-2026-07-17.md`, blocker #5.
- Plan: `context/features/phase-6/04-category-ownership-enforcement/FEATURE.md`.
- Branch: `fix/P6-F4-category-ownership`.

## History
```

- [ ] **Step 3: Run the existing task and category tests**

Run:

```bash
npm run test -- lib/actions/__tests__/task.test.ts lib/data/__tests__/category.test.ts
```

Expected: both files pass on the current baseline. If any file fails for a pre-existing reason, record the failure and resolve the environment problem before changing production code.

- [ ] **Step 4: Run the repository baseline gates**

Run:

```bash
npm run test
npm run lint -- --max-warnings=0
npm run build
```

Expected: tests pass (299 on current baseline); lint passes with zero errors (lint was fixed 2026-07-20); build succeeds. If a new baseline failure appears, stop and report it rather than mixing it into P6-F4.

### Task 2: Add the User-Scoped Category Lookup

**Files:**
- Verify: `lib/data/category.ts` (NO change required)

- [x] **Step 1: Confirm `getCategoryById` already exists**

During Task 1 implementation it was discovered that `getCategoryById(userId, categoryId)` **already exists** in `lib/data/category.ts:27-36`, added in an earlier phase. It is already user-scoped (`and(eq(categories.id, categoryId), eq(categories.userId, userId))`), cache-tagged `user-${userId}-categories`, and returns `null` for foreign or non-existent ids. Existing tests in `lib/data/__tests__/category.test.ts:58-83` prove cross-user isolation (`"other-user-cat"` → `null`).

**No new code is required for Task 2.** The lookup the plan assumed must be added is already present and meets the spec. Task 3 wires it into the task actions. This is recorded as a planning correction (the P6-F3-era assumption that the function was missing was wrong).

### Task 3: Enforce Ownership in the Task Actions

**Files:**
- Modify: `lib/actions/task.ts`

- [ ] **Step 1: Import the lookup**

Add `getCategoryById` to the import from `@/lib/data/category` at the top of `lib/actions/task.ts`.

- [ ] **Step 2: Gate `createTaskAction`**

After `const validated = createTaskSchema.parse(input);` and before the `db.insert`, add:

```ts
if (validated.categoryId) {
  const owned = await getCategoryById(userId, validated.categoryId);
  if (!owned) {
    return { success: false, error: "Invalid category" };
  }
}
```

- [ ] **Step 3: Gate `updateTaskAction`**

After `const { id, ...data } = validated;` (and before building `updates`), add:

```ts
if (data.categoryId) {
  const owned = await getCategoryById(userId, data.categoryId);
  if (!owned) {
    return { success: false, error: "Invalid category" };
  }
}
```

Note: `data.categoryId` here is the present value (the action already treats `null`/`""` as clear and `undefined` as leave-unchanged). The gate only runs when a non-empty id is supplied, so clearing a category (`null`) and leaving it unchanged (`undefined`) are unaffected.

Expected: a foreign or non-existent `categoryId` now produces `{ success: false, error: "Invalid category" }` with no DB write; a user's own id proceeds as before.

### Task 4: Add Failing Regression Tests, Then Make Them Pass

**Files:**
- Modify: `lib/actions/__tests__/task.test.ts`

- [x] **Step 1: Add the `getCategoryById` mock**

Alongside the existing `@/lib/data/category` mock (or add one if absent):

```ts
const mockGetCategoryById = vi.fn();
vi.mock("@/lib/data/category", () => ({
  getCategoryById: (...args: unknown[]) => mockGetCategoryById(...args),
}));
```

- [x] **Step 2: Add `createTaskAction` ownership tests**

```ts
describe("createTaskAction category ownership", () => {
  it("rejects a foreign categoryId with Invalid category", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetCategoryById.mockResolvedValue(null); // foreign / non-existent
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    const result = await createTaskAction({
      title: "Task",
      categoryId: "other-users-category",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Invalid category");
    expect(mockValues).not.toHaveBeenCalled();
  });

  it("accepts the user's own categoryId", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetCategoryById.mockResolvedValue({ id: "cat-1", userId: "user-1" });
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    const result = await createTaskAction({
      title: "Task",
      categoryId: "cat-1",
    });

    expect(result.success).toBe(true);
    expect(mockValues.mock.calls[0][0].categoryId).toBe("cat-1");
  });

  it("skips the check when categoryId is omitted", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    const result = await createTaskAction({ title: "Task" });

    expect(result.success).toBe(true);
    expect(mockGetCategoryById).not.toHaveBeenCalled();
  });
});
```

- [x] **Step 3: Add `updateTaskAction` ownership tests**

```ts
describe("updateTaskAction category ownership", () => {
  it("rejects a foreign categoryId with Invalid category", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetCategoryById.mockResolvedValue(null);
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    const result = await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated",
      categoryId: "other-users-category",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Invalid category");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("accepts the user's own categoryId", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockGetCategoryById.mockResolvedValue({ id: "cat-1", userId: "user-1" });
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    const result = await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated",
      categoryId: "cat-1",
    });

    expect(result.success).toBe(true);
    const setArg = mockUpdate.mock.calls[0][0].set ?? mockUpdate.mock.calls[0][1];
    expect(JSON.stringify(setArg)).toContain("cat-1");
  });

  it("skips the check when categoryId is omitted (partial update)", async () => {
    mockGetCurrentUserId.mockResolvedValue("user-1");
    mockReturning.mockResolvedValue([{ id: "task-1" }]);

    const result = await updateTaskAction({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated",
    });

    expect(result.success).toBe(true);
    expect(mockGetCategoryById).not.toHaveBeenCalled();
  });
});
```

- [x] **Step 4: Run the action test file**

Run:

```bash
npm run test -- lib/actions/__tests__/task.test.ts
```

Expected: all new tests pass; no existing task-action test regresses.

### Task 5: Run Full Gates and Finalize

**Files:**
- Modify: `context/current-feature.md`
- Modify: `context/features/phase-6/TASKS.md`

- [ ] **Step 1: Run full gates**

Run:

```bash
npm run test
npm run lint -- --max-warnings=0
npm run build
```

Expected: all tests pass; lint clean; build succeeds.

- [ ] **Step 2: Browser verification**

Open the app at `http://localhost:3000/sign-in`, sign in, create a task with a real category, then edit it and change the category — confirm both flows succeed. (Direct foreign-id rejection is covered by unit tests; browser check confirms the happy path is unaffected.)

- [ ] **Step 3: Update workflow docs**

Append a P6-F4 entry to `context/current-feature.md` `## History` and check off the five P6-F4 items in `context/features/phase-6/TASKS.md`.

- [ ] **Step 4: Do NOT commit without permission**

Per AGENTS.md and the Phase 6 global quality gates, no commit is created until the user approves.

---

## 7. Verification Checklist

- [ ] `getCategoryById` is user-scoped (`eq(categories.userId, userId)`) and returns `null` for foreign/non-existent ids.
- [ ] `createTaskAction` rejects foreign/non-existent `categoryId` with `Invalid category` and performs no insert.
- [ ] `updateTaskAction` rejects foreign/non-existent `categoryId` with `Invalid category` and performs no update.
- [ ] Omitting `categoryId` (create) and partial-update omit (update) skip the check.
- [ ] Clearing (`null`/`""`) still works and skips the check.
- [ ] A user's own `categoryId` is accepted on both paths.
- [ ] No read-path or UI changes were required.
- [ ] `npm run test`, `npm run lint -- --max-warnings=0`, and `npm run build` all pass.
- [ ] No commit created without user permission.
