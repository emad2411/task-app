# Feature Specification: P4-F1b — Error Sanitization & Server-Side Logging

**Phase:** 4 — Hardening  
**Feature ID:** P4-F1b  
**Feature Name:** Error Sanitization & Server-Side Logging  
**Status:** Draft — Ready for Implementation  
**Date:** 2026-05-03  
**Estimated Effort:** 1.5–2 hours  
**Dependencies:** None (no new npm packages required)  
**Prerequisite:** P4-F1a should be completed first (category action error handling overlaps — F1a handles the `23505` catch; F1b handles the remaining `error.message` leaks)  
**Branch:** `feature/P4-F1b-error-sanitization`

---

## 1. Overview

This feature eliminates **all instances of `error.message` being returned to clients** across every server action in the application. Internal error messages can reveal stack traces, database schema details, library internals, and infrastructure information to attackers.

### What You're Fixing

The original code review only flagged `lib/actions/auth.ts` (Blocker #2). However, after reviewing the full codebase, **the same vulnerability exists in `task.ts` and `category.ts`** — every catch block returns `error.message` directly.

| File | Affected Actions | Catch Blocks Leaking |
|------|-----------------|---------------------|
| `lib/actions/auth.ts` | `signInAction`, `signUpAction`, `resetPasswordAction`, `updatePasswordAction`, `verifyEmailAction`, `signOutAction` | 6 catch blocks |
| `lib/actions/task.ts` | `createTaskAction`, `updateTaskAction`, `deleteTaskAction`, `toggleTaskCompletionAction`, `archiveTaskAction` | 5 catch blocks |
| `lib/actions/category.ts` | `deleteCategoryAction` | 1 catch block (if P4-F1a not yet done: all 3) |

**Total: 12 catch blocks** returning raw error messages to clients.

### Additional Gap: Zod Validation Errors

When Zod validation fails (e.g., `schema.parse(input)` throws), the `ZodError` object's `.message` property contains the full validation schema path and expected types. Example leaked message:

```
Expected string, received number at "email"; Expected string with min length 8, received string with length 2 at "password"
```

This reveals your validation schema structure. We need to catch `ZodError` separately and return a generic validation message.

---

## 2. Background: Why This Matters

### What an attacker can learn from error messages

| Leaked Message | What It Reveals |
|---------------|----------------|
| `"relation \"tasks\" does not exist"` | Your table name |
| `"column \"user_id\" of relation \"categories\" violates not-null"` | Your column names and constraints |
| `"connect ECONNREFUSED 127.0.0.1:5432"` | Your database is PostgreSQL on localhost |
| `"duplicate key value violates unique constraint"` | Your unique constraints and indexes |
| `"NEXT_REDIRECT"` | Framework internals |

### The fix pattern

Every catch block follows the same pattern:

```ts
// ❌ BEFORE: Leaks internal error details
} catch (error) {
  if (error instanceof Error) return { success: false, error: error.message };
  return { success: false, error: "Failed to do X" };
}

// ✅ AFTER: Logs internally, returns generic message
} catch (error) {
  console.error("[actionName]", error);
  return { success: false, error: "Failed to do X. Please try again." };
}
```

---

## 3. Prerequisites

Before starting:

1. **If P4-F1a is complete:** `category.ts` catch blocks are already partially fixed (they have `console.error` and `23505` handling). You only need to verify `deleteCategoryAction` doesn't leak.
2. **If P4-F1a is NOT complete:** You'll also need to fix all 3 `category.ts` catch blocks here.
3. Run `npm run test` to ensure all tests pass before making changes.

---

## 4. Implementation Steps

### Step 1: Create Error Sanitization Utility (Optional but Recommended)

> **Why?** Instead of repeating the same catch block pattern 12 times, we create a small utility that standardizes error logging and response formatting.

**File:** `lib/utils/action-error.ts` ← **NEW FILE**

```ts
import { ZodError } from "zod/v4";

/**
 * Handles errors thrown in server actions by logging them server-side
 * and returning a sanitized, user-friendly error message.
 *
 * NEVER returns the raw `error.message` to the client — this prevents
 * leaking internal error details (database schema, stack traces, etc.).
 *
 * @param actionName - Name of the action for logging (e.g., "[createTaskAction]")
 * @param error - The caught error object
 * @param fallbackMessage - User-friendly message to return to the client
 * @returns An ActionResult with `success: false` and the sanitized error
 *
 * @example
 * ```ts
 * } catch (error) {
 *   return handleActionError("[createTaskAction]", error, "Failed to create task");
 * }
 * ```
 */
export function handleActionError(
  actionName: string,
  error: unknown,
  fallbackMessage: string
): { success: false; error: string } {
  // Zod validation errors — return a generic validation message
  // instead of leaking schema structure
  if (error instanceof ZodError) {
    console.error(actionName, "Validation error:", error.issues);
    return {
      success: false,
      error: "Invalid input. Please check your data and try again.",
    };
  }

  // Log the full error server-side for debugging
  console.error(actionName, error);

  // Return a generic, user-friendly message — never the raw error
  return {
    success: false,
    error: `${fallbackMessage}. Please try again.`,
  };
}
```

**What this utility does:**
1. **Catches `ZodError` specifically** — returns a generic validation message (not the schema path)
2. **Logs the full error** to the server console (you can see it in your terminal or logging service)
3. **Returns a generic message** — never passes `error.message` to the client
4. Always appends "Please try again." for consistent UX

---

### Step 2: Fix `lib/actions/auth.ts`

**File:** `lib/actions/auth.ts` ← **MODIFY**

> **Important:** Auth actions are special because some specific HTTP status codes from Better Auth (401, 403, 409, 422) have meaningful user-facing messages. We keep those. Everything else gets sanitized.

#### 4.2.1 Add the import

```diff
 import {
   signInSchema,
   signUpSchema,
   // ... other imports
 } from "@/lib/validation/auth";
+import { handleActionError } from "@/lib/utils/action-error";
```

#### 4.2.2 Fix `signInAction` catch block

**Before (lines 45–61):**
```ts
  } catch (error) {
    if (isAPIError(error)) {
      const apiError = error as unknown as APIError;
      if (apiError.status === 401) {
        return { success: false, error: "Invalid email or password" };
      }
      if (apiError.status === 403) {
        return { success: false, error: "Email not verified. Please check your email for a verification link." };
      }
      return { success: false, error: apiError.message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
```

**After:**
```ts
  } catch (error) {
    if (isAPIError(error)) {
      const apiError = error as unknown as APIError;
      // 401 = wrong credentials — safe to show
      if (apiError.status === 401) {
        return { success: false, error: "Invalid email or password" };
      }
      // 403 = email not verified — safe to show
      if (apiError.status === 403) {
        return { success: false, error: "Email not verified. Please check your email for a verification link." };
      }
      // All other API errors — log and return generic message
      console.error("[signInAction] API error:", apiError.status, apiError.body);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    }
    return handleActionError("[signInAction]", error, "An unexpected error occurred");
  }
```

**What changed:**
- Removed `return { success: false, error: apiError.message }` — was leaking API error details
- Removed `return { success: false, error: error.message }` — was leaking Error details
- 401 and 403 handling is preserved (these are safe, user-facing messages)
- Everything else goes through `handleActionError()` or gets a generic message

#### 4.2.3 Fix `signUpAction` catch block

**Before (lines 89–111):**
```ts
  } catch (error) {
    if (isAPIError(error)) {
      const apiError = error as unknown as APIError;
      if (apiError.status === 409) {
        return { success: false, error: "An account with this email already exists. Please sign in instead." };
      }
      if (apiError.status === 422) {
        return { success: false, error: "Invalid input. Please check your information and try again." };
      }
      return { success: false, error: apiError.message };
    }
    if (error instanceof Error) {
      // Check for common error patterns in error messages
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("user already exists") ||
          errorMessage.includes("already registered") ||
          errorMessage.includes("duplicate")) {
        return { success: false, error: "An account with this email already exists. Please sign in instead." };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
```

**After:**
```ts
  } catch (error) {
    if (isAPIError(error)) {
      const apiError = error as unknown as APIError;
      // 409 = duplicate email — safe to show
      if (apiError.status === 409) {
        return { success: false, error: "An account with this email already exists. Please sign in instead." };
      }
      // 422 = validation error — safe to show (generic message)
      if (apiError.status === 422) {
        return { success: false, error: "Invalid input. Please check your information and try again." };
      }
      // All other API errors — log and return generic message
      console.error("[signUpAction] API error:", apiError.status, apiError.body);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    }
    // Check for duplicate user errors from non-API error paths
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("user already exists") ||
          msg.includes("already registered") ||
          msg.includes("duplicate")) {
        return { success: false, error: "An account with this email already exists. Please sign in instead." };
      }
    }
    return handleActionError("[signUpAction]", error, "An unexpected error occurred");
  }
```

**What changed:**
- Removed `return { success: false, error: apiError.message }` 
- Removed `return { success: false, error: error.message }` at the end
- Kept the duplicate-user pattern matching (returns a safe, hardcoded message)
- All unknown errors go through `handleActionError()`

#### 4.2.4 Fix `resetPasswordAction` catch block

**Before (lines 149–154):**
```ts
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to reset password" };
  }
```

**After:**
```ts
  } catch (error) {
    return handleActionError("[resetPasswordAction]", error, "Failed to reset password");
  }
```

#### 4.2.5 Fix `updatePasswordAction` catch block

**Before (lines 171–179):**
```ts
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("current password")) {
        return { success: false, error: "Current password is incorrect" };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update password" };
  }
```

**After:**
```ts
  } catch (error) {
    // Check for "wrong current password" error — safe to show
    if (error instanceof Error && error.message.toLowerCase().includes("current password")) {
      return { success: false, error: "Current password is incorrect" };
    }
    return handleActionError("[updatePasswordAction]", error, "Failed to update password");
  }
```

**What changed:**
- Kept the "current password" check (returns a safe, hardcoded message)
- Removed `return { success: false, error: error.message }` for all other errors
- Unknown errors go through `handleActionError()`

#### 4.2.6 Fix `verifyEmailAction` catch block

**Before (lines 193–198):**
```ts
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to verify email" };
  }
```

**After:**
```ts
  } catch (error) {
    return handleActionError("[verifyEmailAction]", error, "Failed to verify email");
  }
```

#### 4.2.7 Fix `signOutAction` catch block

**Before (lines 208–213):**
```ts
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to sign out" };
  }
```

**After:**
```ts
  } catch (error) {
    return handleActionError("[signOutAction]", error, "Failed to sign out");
  }
```

#### 4.2.8 Clean up unused import

After making these changes, the `APIError` import is still used (in `signInAction` and `signUpAction`). Check that `isAPIError` and `APIError` are both still referenced. They should be. Do **not** remove them.

---

### Step 3: Fix `lib/actions/task.ts`

**File:** `lib/actions/task.ts` ← **MODIFY**

#### 4.3.1 Add the import

```diff
 import { createTaskSchema, updateTaskSchema } from "@/lib/validation/task";
 import { getCurrentUserId } from "@/lib/auth/session";
+import { handleActionError } from "@/lib/utils/action-error";
```

#### 4.3.2 Fix ALL 5 catch blocks

Every catch block in this file follows the exact same vulnerable pattern. Replace each one:

**`createTaskAction` catch block (around line 37–40):**

Before:
```ts
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to create task" };
  }
```

After:
```ts
  } catch (error) {
    return handleActionError("[createTaskAction]", error, "Failed to create task");
  }
```

**`updateTaskAction` catch block (around line 73–76):**

Before:
```ts
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to update task" };
  }
```

After:
```ts
  } catch (error) {
    return handleActionError("[updateTaskAction]", error, "Failed to update task");
  }
```

**`deleteTaskAction` catch block (around line 99–102):**

Before:
```ts
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to delete task" };
  }
```

After:
```ts
  } catch (error) {
    return handleActionError("[deleteTaskAction]", error, "Failed to delete task");
  }
```

**`toggleTaskCompletionAction` catch block (around line 134–137):**

Before:
```ts
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to update task" };
  }
```

After:
```ts
  } catch (error) {
    return handleActionError("[toggleTaskCompletionAction]", error, "Failed to update task");
  }
```

**`archiveTaskAction` catch block (around line 165–168):**

Before:
```ts
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to archive task" };
  }
```

After:
```ts
  } catch (error) {
    return handleActionError("[archiveTaskAction]", error, "Failed to archive task");
  }
```

---

### Step 4: Fix `lib/actions/category.ts` (If P4-F1a Not Yet Done)

> **Skip this step if P4-F1a is already complete** — it handles category action error sanitization as part of the unique constraint work.

If P4-F1a is not done yet, follow these changes:

**File:** `lib/actions/category.ts` ← **MODIFY**

Add the import:
```diff
 import { getCurrentUserId } from "@/lib/auth/session";
+import { handleActionError } from "@/lib/utils/action-error";
```

Replace all 3 catch blocks:

**`createCategoryAction` (line 47–50):**
```ts
  } catch (error) {
    return handleActionError("[createCategoryAction]", error, "Failed to create category");
  }
```

**`updateCategoryAction` (line 95–98):**
```ts
  } catch (error) {
    return handleActionError("[updateCategoryAction]", error, "Failed to update category");
  }
```

**`deleteCategoryAction` (line 125–128):**
```ts
  } catch (error) {
    return handleActionError("[deleteCategoryAction]", error, "Failed to delete category");
  }
```

---

### Step 5: Add the `forgotPasswordAction` Logging

> **Why?** The `forgotPasswordAction` has a catch block that silently swallows errors. While this is intentional (to prevent email enumeration), we should still log the error server-side for debugging.

**File:** `lib/actions/auth.ts` ← **MODIFY**

**Before (lines 129–134):**
```ts
  } catch {
    return { 
      success: true, 
      data: { message: "If an account exists with this email, you will receive a password reset link" } 
    };
  }
```

**After:**
```ts
  } catch (error) {
    // Log the error but still return success to prevent email enumeration
    console.error("[forgotPasswordAction]", error);
    return { 
      success: true, 
      data: { message: "If an account exists with this email, you will receive a password reset link" } 
    };
  }
```

**What changed:**
- Added `error` parameter to catch (was `catch {` with no variable)
- Added `console.error` for debugging
- Still returns `success: true` — this is intentional to prevent attackers from discovering which emails have accounts

---

### Step 6: Create Unit Tests for `handleActionError`

**File:** `lib/utils/__tests__/action-error.test.ts` ← **NEW FILE**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleActionError } from "../action-error";
import { ZodError, z } from "zod/v4";

describe("handleActionError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns a generic fallback message for standard errors", () => {
    const error = new Error("relation 'tasks' does not exist");
    const result = handleActionError("[test]", error, "Failed to create task");

    expect(result).toEqual({
      success: false,
      error: "Failed to create task. Please try again.",
    });
  });

  it("logs the full error to console.error", () => {
    const error = new Error("sensitive database error");
    handleActionError("[testAction]", error, "Something failed");

    expect(console.error).toHaveBeenCalledWith("[testAction]", error);
  });

  it("never returns the raw error.message", () => {
    const sensitiveMessage = "connect ECONNREFUSED 127.0.0.1:5432";
    const error = new Error(sensitiveMessage);
    const result = handleActionError("[test]", error, "Failed");

    expect(result.error).not.toContain(sensitiveMessage);
    expect(result.error).not.toContain("ECONNREFUSED");
    expect(result.error).not.toContain("5432");
  });

  it("handles ZodError with a generic validation message", () => {
    try {
      z.object({ email: z.email() }).parse({ email: "not-an-email" });
    } catch (error) {
      const result = handleActionError("[test]", error, "Failed");

      expect(result).toEqual({
        success: false,
        error: "Invalid input. Please check your data and try again.",
      });
      // Should NOT contain Zod schema details
      expect(result.error).not.toContain("email");
      expect(result.error).not.toContain("Expected");
    }
  });

  it("handles non-Error objects (strings, numbers, etc.)", () => {
    const result = handleActionError("[test]", "string error", "Failed");

    expect(result).toEqual({
      success: false,
      error: "Failed. Please try again.",
    });
  });

  it("handles null/undefined errors", () => {
    const result = handleActionError("[test]", null, "Failed");

    expect(result).toEqual({
      success: false,
      error: "Failed. Please try again.",
    });
  });
});
```

Run the tests:
```bash
npm run test -- lib/utils/__tests__/action-error.test.ts
```

---

## 5. File Change Summary

### Files Created
| File | Purpose |
|------|---------|
| `lib/utils/action-error.ts` | Centralized error sanitization utility |
| `lib/utils/__tests__/action-error.test.ts` | Unit tests for `handleActionError()` |

### Files Modified
| File | Catch Blocks Fixed |
|------|-------------------|
| `lib/actions/auth.ts` | 7 (signIn, signUp, resetPassword, updatePassword, verifyEmail, signOut, forgotPassword logging) |
| `lib/actions/task.ts` | 5 (create, update, delete, toggleCompletion, archive) |
| `lib/actions/category.ts` | 1 (delete — if P4-F1a done) or 3 (all — if P4-F1a not done) |

### Files Deleted
- None

---

## 6. Acceptance Criteria

### Error Sanitization Criteria

| File | Action | Check | Status |
|------|--------|-------|--------|
| `auth.ts` | `signInAction` | 401 → "Invalid email or password" (kept) | ☐ |
| `auth.ts` | `signInAction` | 403 → "Email not verified..." (kept) | ☐ |
| `auth.ts` | `signInAction` | Other errors → "An unexpected error occurred. Please try again." | ☐ |
| `auth.ts` | `signUpAction` | 409 → "An account with this email already exists..." (kept) | ☐ |
| `auth.ts` | `signUpAction` | 422 → "Invalid input..." (kept) | ☐ |
| `auth.ts` | `signUpAction` | Duplicate user pattern → "An account already exists..." (kept) | ☐ |
| `auth.ts` | `signUpAction` | Other errors → "An unexpected error occurred. Please try again." | ☐ |
| `auth.ts` | `resetPasswordAction` | All errors → "Failed to reset password. Please try again." | ☐ |
| `auth.ts` | `updatePasswordAction` | Wrong current password → "Current password is incorrect" (kept) | ☐ |
| `auth.ts` | `updatePasswordAction` | Other errors → "Failed to update password. Please try again." | ☐ |
| `auth.ts` | `verifyEmailAction` | All errors → "Failed to verify email. Please try again." | ☐ |
| `auth.ts` | `signOutAction` | All errors → "Failed to sign out. Please try again." | ☐ |
| `auth.ts` | `forgotPasswordAction` | Error logged with `console.error` | ☐ |
| `task.ts` | All 5 actions | All errors → "Failed to [action]. Please try again." | ☐ |
| `category.ts` | All actions | No `error.message` returned to client | ☐ |

### Verification Checklist

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (all existing + new tests)
- [ ] `handleActionError` tests pass (6 test cases)
- [ ] `grep -r "error.message" lib/actions/` returns **zero results** (except pattern-matched safe messages like "current password")
- [ ] No `error.message` is returned directly in any `return { success: false, error: ... }` statement
- [ ] All catch blocks have `console.error` logging
- [ ] No new `any` types introduced
- [ ] No unused imports
- [ ] Zod validation errors return generic message, not schema details

---

## 7. Implementation Order

| Step | Files | Time | What To Do |
|------|-------|------|-----------|
| 1 | `lib/utils/action-error.ts` | 10 min | Create utility function |
| 2 | `lib/utils/__tests__/action-error.test.ts` | 15 min | Create and run tests |
| 3 | `lib/actions/auth.ts` | 20 min | Fix all 7 catch blocks (most complex) |
| 4 | `lib/actions/task.ts` | 10 min | Fix all 5 catch blocks (straightforward) |
| 5 | `lib/actions/category.ts` | 5 min | Fix remaining catch blocks |
| 6 | Verify with grep | 5 min | `grep -r "error.message" lib/actions/` — should be zero or only safe pattern matches |
| 7 | Build + lint + test | 5 min | `npm run build && npm run lint && npm run test` |

---

## 8. How to Verify Your Changes

### Quick verification command

After all changes, run:
```bash
grep -rn "error\.message" lib/actions/
```

**Expected results:** Either zero matches, or only these safe pattern matches:
- `error.message.toLowerCase().includes("current password")` in `updatePasswordAction`
- `error.message.toLowerCase()` in `signUpAction` (the duplicate-user check)

These are safe because they check the message content to determine which *hardcoded* response to return — they never pass `error.message` directly to the client.

### Grep for remaining leaks

```bash
grep -rn "error: error\." lib/actions/
```

**Expected:** Zero results. No catch block should assign `error.anyProperty` directly to the response `error` field.

---

## 9. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Over-sanitization hides useful errors from users | **Medium** | Medium | We preserve all known-safe messages (401, 403, 409, 422, "current password", duplicate user). Only truly unknown errors are sanitized. |
| `handleActionError` catches redirect errors | **High** | Low | Next.js `redirect()` throws a `NEXT_REDIRECT` error. These should NOT be caught by our utility. However, `redirect()` should be called BEFORE try/catch blocks. Verify that no action calls `redirect()` inside a try block. |
| Zod import path differs between v3 and v4 | **Medium** | Low | The project uses Zod v4 with `zod/v4` import path. The `handleActionError` utility imports from `zod/v4`. If the import fails, check `package.json` for the actual Zod version. |
| `console.error` in production is too verbose | **Low** | Low | In production, use a structured logging service. For now, `console.error` is sufficient and ensures errors are visible in server logs. |

---

## 10. Related Documentation

- **code-review-report.md** — Blocker #2: Error Message Leakage
- **coding-standards.md** — Error handling: "Return `{ success, data, error }` pattern from actions"
- **coding-standards.md** — "Display user-friendly error messages via toast"
- **OWASP Error Handling** — [OWASP Improper Error Handling](https://owasp.org/www-community/Improper_Error_Handling)
