# Feature Specification: P4-F1a — Input Sanitization & Data Integrity

**Phase:** 4 — Hardening  
**Feature ID:** P4-F1a  
**Feature Name:** Input Sanitization & Data Integrity Fixes  
**Status:** Draft — Ready for Implementation  
**Date:** 2026-05-03  
**Estimated Effort:** 2–3 hours  
**Dependencies:** None (no new npm packages required)  
**Branch:** `feature/P4-F1a-input-data-integrity`

---

## 1. Overview

This feature fixes four security blockers identified in the code review. All four are **data-layer or configuration issues** that require no new dependencies — only code changes, a database migration, and tests.

### What You're Fixing

| # | Blocker | Risk | One-Line Summary |
|---|---------|------|------------------|
| 1 | LIKE Wildcard Injection | **High** | Users can search `%` to dump all tasks |
| 4 | Category TOCTOU Race | **Medium** | Two concurrent requests can create duplicate category names |
| 3 | Hardcoded Seed User ID | **Medium** | Secret user ID committed to source control |
| 5 | Auth Paths Inconsistency | **Low** | Logged-in users can visit `/verify-email` and `/reset-password` |

---

## 2. Prerequisites

Before starting, make sure you can:

1. Run `npm run dev` successfully
2. Run `npm run build` with no errors
3. Run `npm run lint` with no errors
4. Run `npm run test` with all tests passing
5. Access the database (your `DATABASE_URL` is set)
6. Have Drizzle Kit installed (`npx drizzle-kit` works)

---

## 3. Implementation Steps

### Step 1: Create the `escapeLike()` Utility

> **Why?** When a user searches for `%`, the current code passes it directly into a SQL `ILIKE '%{search}%'` pattern. The `%` acts as a wildcard matching *everything*, so the query returns ALL tasks — leaking data the user shouldn't discover via search. We need to escape these special SQL characters.

#### 3.1.1 Create the utility file

**File:** `lib/utils/escape-like.ts` ← **NEW FILE**

```ts
/**
 * Escapes SQL LIKE/ILIKE wildcard characters in a user-provided string.
 *
 * Prevents wildcard injection attacks where a user could search for `%`
 * to match all rows, or `_` to match any single character.
 *
 * PostgreSQL LIKE special characters:
 * - `%` — matches zero or more characters
 * - `_` — matches exactly one character
 * - `\` — escape character itself (must be escaped first to avoid double-escaping)
 *
 * @param str - The raw user input string to escape
 * @returns The escaped string safe for use in LIKE/ILIKE patterns
 *
 * @example
 * ```ts
 * escapeLike("hello")     // "hello" (no change)
 * escapeLike("50%")       // "50\\%"
 * escapeLike("user_name") // "user\\_name"
 * escapeLike("C:\\path")  // "C:\\\\path"
 * escapeLike("%_\\")      // "\\%\\_\\\\"
 * escapeLike("")          // ""
 * ```
 */
export function escapeLike(str: string): string {
  // Order matters: escape backslash FIRST, then % and _
  // If we escaped % or _ first, the inserted backslashes would get
  // double-escaped when we process backslashes.
  return str.replace(/[\\%_]/g, "\\$&");
}
```

**What this does step-by-step:**
1. Takes a string like `"50%"` (user typed this in the search box)
2. The regex `/[\\%_]/g` finds any `\`, `%`, or `_` character
3. `"\\$&"` replaces each match with a backslash + the original character
4. Result: `"50\\%"` — now PostgreSQL treats `%` as a literal character, not a wildcard

#### 3.1.2 Create unit tests

**File:** `lib/utils/__tests__/escape-like.test.ts` ← **NEW FILE**

```ts
import { describe, it, expect } from "vitest";
import { escapeLike } from "../escape-like";

describe("escapeLike", () => {
  it("returns the same string when there are no wildcards", () => {
    expect(escapeLike("hello world")).toBe("hello world");
  });

  it("returns empty string for empty input", () => {
    expect(escapeLike("")).toBe("");
  });

  it("escapes the % wildcard character", () => {
    expect(escapeLike("50%")).toBe("50\\%");
    expect(escapeLike("%")).toBe("\\%");
    expect(escapeLike("%%")).toBe("\\%\\%");
  });

  it("escapes the _ wildcard character", () => {
    expect(escapeLike("user_name")).toBe("user\\_name");
    expect(escapeLike("_")).toBe("\\_");
    expect(escapeLike("__")).toBe("\\_\\_");
  });

  it("escapes the backslash character", () => {
    expect(escapeLike("C:\\path")).toBe("C:\\\\path");
    expect(escapeLike("\\")).toBe("\\\\");
  });

  it("escapes mixed wildcard characters", () => {
    expect(escapeLike("%_\\")).toBe("\\%\\_\\\\");
  });

  it("preserves non-wildcard special characters", () => {
    expect(escapeLike("hello@world.com")).toBe("hello@world.com");
    expect(escapeLike("price $100")).toBe("price $100");
    expect(escapeLike("a+b=c")).toBe("a+b=c");
  });

  it("handles strings with wildcards surrounded by normal text", () => {
    expect(escapeLike("before%after")).toBe("before\\%after");
    expect(escapeLike("start_end")).toBe("start\\_end");
  });
});
```

#### 3.1.3 Verify tests pass

Run:
```bash
npm run test -- lib/utils/__tests__/escape-like.test.ts
```

**Expected:** All 8 tests pass. If any fail, check your regex — the most common mistake is not escaping the backslash first.

---

### Step 2: Apply `escapeLike()` to Task Search

> **Why?** The `getTasks()` function in `lib/data/task.ts` builds a SQL query using `ilike(tasks.title, '%${options.search}%')`. Without escaping, the user's search string is injected directly into the LIKE pattern.

**File:** `lib/data/task.ts` ← **MODIFY**

#### 3.2.1 Add the import

At the top of the file, add this import (after the existing imports):

```diff
 import {
   getStartOfTodayInTimezone,
   getEndOfTodayInTimezone,
 } from "@/lib/utils/date";
+import { escapeLike } from "@/lib/utils/escape-like";
```

#### 3.2.2 Wrap search strings with `escapeLike()`

Find the search filter block (around lines 68–76) and change it:

**Before (vulnerable):**
```ts
  // Search filter
  if (options?.search) {
    const searchCondition = or(
      ilike(tasks.title, `%${options.search}%`),
      ilike(tasks.description, `%${options.search}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }
```

**After (safe):**
```ts
  // Search filter — escape LIKE wildcards to prevent injection
  if (options?.search) {
    const safeSearch = escapeLike(options.search);
    const searchCondition = or(
      ilike(tasks.title, `%${safeSearch}%`),
      ilike(tasks.description, `%${safeSearch}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }
```

**What changed:**
- Line added: `const safeSearch = escapeLike(options.search);`
- Both `ilike` calls now use `safeSearch` instead of `options.search`
- The wrapping `%...%` is still there — that's OUR wildcard for "contains" search. The user's input is sanitized inside.

#### 3.2.3 How to verify manually

1. Start the dev server: `npm run dev`
2. Log in and create a task with title `"50% complete"`
3. Go to the Tasks page and search for `%`
4. **Before fix:** ALL tasks appear (wildcard matches everything)
5. **After fix:** Only the task with `%` in the title appears

---

### Step 3: Add Unique Constraint to Categories Table

> **Why?** The current code checks for duplicate category names at the application level (queries the DB, then inserts if no duplicate found). But between the check and the insert, another request could insert the same name. This is called a **TOCTOU (Time-of-Check-to-Time-of-Use) race condition**. A database-level unique constraint prevents this.

#### 3.3.1 Update the schema

**File:** `lib/db/schema.ts` ← **MODIFY**

**Step A:** Add `uniqueIndex` to the import:

```diff
 import {
   pgTable,
   text,
   timestamp,
   boolean,
   uuid,
   pgEnum,
   index,
+  uniqueIndex,
 } from "drizzle-orm/pg-core";
```

**Step B:** Replace the regular index with a unique index on categories:

Find the categories table definition (around lines 81–96) and change the index:

**Before:**
```ts
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("categories_user_id_name_idx").on(table.userId, table.name),
  ]
);
```

**After:**
```ts
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // Unique index replaces the regular index — a unique index also
    // serves as a lookup index, so we don't need both.
    uniqueIndex("categories_user_id_name_unique").on(table.userId, table.name),
  ]
);
```

> **Note:** We removed the old `index()` and replaced it with `uniqueIndex()`. A unique index automatically functions as a regular index for query lookups, so keeping both would be redundant.

#### 3.3.2 Generate the migration

```bash
npm run db:generate
```

This creates a new SQL migration file in your `drizzle/` directory. Open it and verify it contains something like:

```sql
DROP INDEX IF EXISTS "categories_user_id_name_idx";
CREATE UNIQUE INDEX "categories_user_id_name_unique" ON "categories" ("user_id", "name");
```

> **⚠️ IMPORTANT:** Before applying, check that no duplicate `(userId, name)` pairs exist in your database. Run this query in your database console:
> ```sql
> SELECT user_id, name, COUNT(*)
> FROM categories
> GROUP BY user_id, name
> HAVING COUNT(*) > 1;
> ```
> If any rows appear, you must rename or delete duplicates before applying the migration.

#### 3.3.3 Apply the migration

```bash
npm run db:migrate
```

#### 3.3.4 Handle unique violation in Category Actions

**File:** `lib/actions/category.ts` ← **MODIFY**

We need to catch PostgreSQL error code `23505` (unique_violation) in both `createCategoryAction` and `updateCategoryAction`. We also fix `deleteCategoryAction` which was leaking `error.message`.

**What is error code `23505`?** When PostgreSQL tries to insert/update a row that would violate a unique constraint, it throws an error with code `23505`. Drizzle ORM wraps this error in a JavaScript object that has a `code` property.

**Replace the `createCategoryAction` catch block:**

Find the catch block (around line 47–50):

**Before:**
```ts
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to create category" };
  }
```

**After:**
```ts
  } catch (error) {
    // PostgreSQL unique violation = duplicate (userId, name) pair
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return { success: false, error: "A category with this name already exists" };
    }
    console.error("[createCategoryAction]", error);
    return { success: false, error: "Failed to create category" };
  }
```

**Replace the `updateCategoryAction` catch block:**

Find the catch block (around line 95–98):

**Before:**
```ts
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to update category" };
  }
```

**After:**
```ts
  } catch (error) {
    // PostgreSQL unique violation = duplicate (userId, name) pair
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      return { success: false, error: "A category with this name already exists" };
    }
    console.error("[updateCategoryAction]", error);
    return { success: false, error: "Failed to update category" };
  }
```

**Replace the `deleteCategoryAction` catch block:**

Find the catch block (around line 125–128):

**Before:**
```ts
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to delete category" };
  }
```

**After:**
```ts
  } catch (error) {
    console.error("[deleteCategoryAction]", error);
    return { success: false, error: "Failed to delete category" };
  }
```

> **Why change `deleteCategoryAction` too?** It was also leaking `error.message` to the client. While we're here fixing category actions, we sanitize all of them.

**Keep the app-level duplicate check!** Don't remove the `existing` query at the top of `createCategoryAction` and `updateCategoryAction`. That check provides instant UX feedback without waiting for a database error. The unique constraint is a safety net for race conditions.

---

### Step 4: Move Seed User ID to Environment Variable

> **Why?** The file `scripts/seed.ts` has a hardcoded user ID (`"SVGfYh7sMn2443APsn1X8GBsqmqOaXLv"`). This is a real user's ID committed to version control. Anyone who reads the source code knows this ID. It should come from an environment variable.

#### 3.4.1 Update the seed script

**File:** `scripts/seed.ts` ← **MODIFY**

Find lines 7–8:

**Before:**
```ts
// Target existing user ID - change this to your user ID
const TARGET_USER_ID = "SVGfYh7sMn2443APsn1X8GBsqmqOaXLv";
```

**After:**
```ts
// Target existing user ID — set via SEED_USER_ID environment variable
const TARGET_USER_ID = process.env.SEED_USER_ID;
if (!TARGET_USER_ID) {
  console.error(
    "❌ SEED_USER_ID environment variable is required.\n" +
    "   Set it to the ID of an existing user in your database.\n" +
    "   Example: $env:SEED_USER_ID=\"your-user-id\"; npx tsx scripts/seed.ts"
  );
  process.exit(1);
}
```

**What changed:**
- The hardcoded string is gone
- `process.env.SEED_USER_ID` reads from the environment
- If the variable isn't set, the script exits with a clear, helpful error message
- The error message includes an example command showing how to set it

#### 3.4.2 Update `.env.example`

**File:** `.env.example` ← **MODIFY**

Add at the bottom:

```diff
 # App
 NEXT_PUBLIC_APP_URL=http://localhost:3000
+
+# Seed Script
+SEED_USER_ID=
```

---

### Step 5: Fix Auth Paths in proxy.ts

> **Why?** The `AUTH_PATHS` array determines which pages redirect authenticated users to the dashboard. Currently, `/verify-email` and `/reset-password` are missing. This means a logged-in user can visit `/verify-email` or `/reset-password` — pages that make no sense when you're already authenticated.

**File:** `proxy.ts` ← **MODIFY**

Find the `AUTH_PATHS` array (lines 12–16):

**Before:**
```ts
const AUTH_PATHS = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
];
```

**After:**
```ts
const AUTH_PATHS = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];
```

**What changed:**
- Added `/reset-password` — logged-in users don't need to reset their password via email link (they use "Change Password" in settings)
- Added `/verify-email` — logged-in users have already verified (or are already in the app)

**How to verify:**
1. Log in to the app
2. Manually visit `http://localhost:3000/reset-password`
3. **Before fix:** The page loads
4. **After fix:** You're redirected to `/dashboard`
5. Repeat for `/verify-email`

---

## 4. File Change Summary

### Files Created
| File | Purpose |
|------|---------|
| `lib/utils/escape-like.ts` | LIKE wildcard escape utility function |
| `lib/utils/__tests__/escape-like.test.ts` | Unit tests for `escapeLike()` |

### Files Modified
| File | What Changed |
|------|-------------|
| `lib/data/task.ts` | Import `escapeLike`, wrap search strings |
| `lib/db/schema.ts` | Replace `index()` with `uniqueIndex()` on categories |
| `lib/actions/category.ts` | Catch `23505` unique violation in all 3 actions, add `console.error` |
| `scripts/seed.ts` | Replace hardcoded ID with `process.env.SEED_USER_ID` |
| `proxy.ts` | Add `/reset-password` and `/verify-email` to `AUTH_PATHS` |
| `.env.example` | Add `SEED_USER_ID` variable |

### Files Deleted
- None

### Migration Generated
- One new Drizzle migration file (auto-generated by `npm run db:generate`)

---

## 5. Acceptance Criteria

### Security Criteria

| # | Issue | Test | Status |
|---|-------|------|--------|
| 1 | LIKE injection | Search for `%` returns only tasks with literal `%` in title/description, not all tasks | ☐ |
| 1 | LIKE injection | Search for `_` returns only tasks with literal `_`, not single-char matches | ☐ |
| 1 | LIKE injection | Normal search (`hello`) still works as before | ☐ |
| 4 | Race condition | `categories` table has unique constraint on `(user_id, name)` | ☐ |
| 4 | Race condition | Creating a duplicate category name returns user-friendly error | ☐ |
| 4 | Race condition | Updating a category to a duplicate name returns user-friendly error | ☐ |
| 4 | Race condition | App-level duplicate check still works (fast UX feedback) | ☐ |
| 3 | Hardcoded ID | No hardcoded user ID in `scripts/seed.ts` | ☐ |
| 3 | Hardcoded ID | Seed script fails gracefully with helpful message when `SEED_USER_ID` not set | ☐ |
| 3 | Hardcoded ID | Seed script works correctly when `SEED_USER_ID` is set | ☐ |
| 5 | Auth paths | Authenticated user visiting `/reset-password` is redirected to `/dashboard` | ☐ |
| 5 | Auth paths | Authenticated user visiting `/verify-email` is redirected to `/dashboard` | ☐ |
| 5 | Auth paths | Unauthenticated user can still access `/reset-password` and `/verify-email` | ☐ |

### Quality Gates

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (all existing + new tests)
- [ ] New `escapeLike` tests pass (8 test cases)
- [ ] Drizzle migration generated and applied successfully
- [ ] No `error.message` returned to client in category actions
- [ ] No new `any` types introduced
- [ ] No unused imports

---

## 6. Implementation Order

Follow this exact order to minimize risk:

| Step | Files | Time | What To Do |
|------|-------|------|-----------|
| 1 | `lib/utils/escape-like.ts` | 10 min | Create utility function |
| 2 | `lib/utils/__tests__/escape-like.test.ts` | 10 min | Create and run tests |
| 3 | `lib/data/task.ts` | 5 min | Import and apply `escapeLike()` |
| 4 | `lib/db/schema.ts` | 5 min | Add `uniqueIndex` import, replace index |
| 5 | `npm run db:generate` | 2 min | Generate migration |
| 6 | `npm run db:migrate` | 2 min | Apply migration |
| 7 | `lib/actions/category.ts` | 10 min | Add `23505` catch + `console.error` to all 3 actions |
| 8 | `scripts/seed.ts` | 5 min | Replace hardcoded ID with env var |
| 9 | `.env.example` | 2 min | Add `SEED_USER_ID` |
| 10 | `proxy.ts` | 2 min | Add paths to `AUTH_PATHS` |
| 11 | Build + lint + test | 5 min | `npm run build && npm run lint && npm run test` |

---

## 7. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Migration fails due to duplicate `(userId, name)` pairs | **High** | Low | Run the duplicate-check SQL query BEFORE applying the migration. If duplicates exist, rename them manually. |
| `escapeLike` breaks existing search results | **Low** | Low | Only `%`, `_`, `\` are affected. Normal text searches are unchanged. |
| Removing the regular index hurts query performance | **None** | None | A unique index serves the same purpose as a regular index for lookups. No performance change. |
| Seed script breaks for existing users | **Low** | Medium | The script already required editing the hardcoded ID. Now they set an env var instead — same effort, more secure. |

---

## 8. Related Documentation

- **code-review-report.md** — Source of all blocker issues
- **PRD.md** §16 — Search strategy
- **PRD.md** §6.5 — Category business rules (names unique per user)
- **coding-standards.md** — Error handling conventions
- [PostgreSQL LIKE pattern matching](https://www.postgresql.org/docs/current/functions-matching.html)
- [PostgreSQL error codes](https://www.postgresql.org/docs/current/errcodes-appendix.html) — `23505` = unique_violation
