# Feature Specification: P4-F2c — Auth Security & React Pattern Fixes

**Phase:** 4 — Hardening  
**Feature ID:** P4-F2c  
**Feature Name:** Auth Security & React Pattern Fixes  
**Status:** Draft — Ready for Implementation  
**Date:** 2026-05-04  
**Estimated Effort:** 1–1.5 hours  
**Dependencies:** None (no new npm packages required)  
**Prerequisites:** P4-F2a and P4-F2b should be completed first  
**Branch:** `feature/P4-F2c-auth-react-fixes`

---

## 1. Overview

This feature fixes the remaining code review suggestions: auth-layer security improvements and React hook anti-patterns. These are the changes that affect how authentication callbacks handle emails, how sign-up handles duplicate detection, and how two components misuse `setState` in `useEffect` and refs during render.

### What You're Fixing

| # | Suggestion | Risk | One-Line Summary |
|---|-----------|------|------------------|
| 12 | Email Enumeration Bypass | **Medium** | `signUpAction` explicitly checks if email exists, bypassing Better Auth's protection |
| 13 | Silent Email Send Failures | **Medium** | `void` + `.catch()` pattern in auth.ts swallows email failures |
| 20 | setState in useEffect | **Low** | `setState` called synchronously in `useEffect` in 2 components |
| 21 | Ref Updated During Render | **Low** | `searchParamsRef.current` assigned during render in `task-filters.tsx` |

---

## 2. Prerequisites

Before starting:

1. P4-F2a completed (unused imports already cleaned from these files)
2. P4-F2b completed (revalidatePath already removed from auth actions)
3. Run `npm run build` with no errors
4. Run `npm run test` with all tests passing
5. Verify sign-up flow works (create a test account if needed)

---

## 3. Implementation Steps

### Step 1: Fix Email Enumeration in signUpAction (#12)

> **Why?** The current `signUpAction` queries the database to check if an email already exists BEFORE calling Better Auth. This bypasses Better Auth's built-in email enumeration protection — an attacker can probe emails to discover which ones have accounts. Better Auth already handles duplicate emails by returning a 409 status code, which the catch block already handles.

**File:** `lib/actions/auth.ts` ← **MODIFY**

#### 3.1.1 Remove the explicit email existence check

Find lines 94–104 in `signUpAction`:

**Before:**
```ts
    // Bypass Better Auth's email enumeration protection so the UI can show the error
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validated.email.toLowerCase()),
    });

    if (existingUser) {
      return { 
        success: false, 
        error: "An account with this email already exists. Please sign in instead." 
      };
    }
```

**After:** Delete these lines entirely. Better Auth's 409 response (already handled in the catch block at line 120) provides the same UX without leaking email existence.

#### 3.1.2 Remove unused imports

After removing the email check, `db`, `users`, and `eq` may no longer be needed in `auth.ts`. Check if any other code in the file still references them.

Current usages:
- `db` — was used in the `existingUser` query (now removed). No other usage.
- `users` — was used in the `existingUser` query (now removed). No other usage.
- `eq` — was used in the `existingUser` query (now removed). No other usage.

**Before (lines 6–8):**
```ts
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
```

**After:** Delete all three lines.

Also remove the stale TODO comment if it still exists:

**Before (line 4):**
```ts
// TODO (post-MVP): Consider migrating revalidatePath to revalidateTag
// for more granular cache invalidation as the app scales.
```

**After:** Delete these lines — `revalidatePath` was already removed in P4-F2b.

#### 3.1.3 Update tests

**File:** `lib/actions/__tests__/auth.test.ts` ← **MODIFY**

The test "should return error when user already exists" (line 192) mocks `db.query.users.findFirst` to return an existing user. Since the explicit check is removed, this test needs to change — duplicate detection now comes from Better Auth's 409 response.

**Before (lines 192–203):**
```ts
  it("should return error when user already exists", async () => {
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ id: "existing-user" } as any);

    const result = await signUpAction({
      name: "John Doe",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("already exists");
  });
```

**After:**
```ts
  it("should return error when user already exists (via Better Auth 409)", async () => {
    const apiError = new Error("User already exists");
    Object.assign(apiError, { statusCode: 409, body: { message: "User already exists" } });
    // Make isAPIError return true for this error
    vi.mocked(auth.api.signUpEmail).mockRejectedValue(apiError);

    const result = await signUpAction({
      name: "John Doe",
      email: "user@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("already exists");
  });
```

> **Note:** The exact way to mock a Better Auth API error depends on how `isAPIError` works. If the test framework needs `isAPIError` to return `true`, you may need to check the Better Auth source. The simplest approach is to mock `isAPIError` to return `true` for this specific test, or construct the error in the shape Better Auth expects.

Also update the test at line 207 that mocks `db.query.users.findFirst` for the rate limit test — remove the mock since `findFirst` is no longer called:

**Before (line 207):**
```ts
    vi.mocked(db.query.users.findFirst).mockResolvedValue(null as any);
```

**After:** Delete this line.

If `db` is no longer used anywhere in the test file after these changes, also remove:

**Before (lines 30–36, 48):**
```ts
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      users: { findFirst: vi.fn() },
    },
  },
}));

// ...
import { db } from "@/lib/db";
```

Check if any remaining tests still reference `db`. The "should return success for valid registration" test (line 137) also mocks `db.query.users.findFirst` — remove that mock call too (line 139).

The "should return success with null user when signup returns null" test (line 178) also mocks it — remove that mock call too (line 179).

**After removing all `db.query.users.findFirst` mocks:** If no test references `db` at all, remove the `vi.mock("@/lib/db", ...)` block and the `import { db }` line.

Also remove the unused schema mock if `users` is no longer referenced:

```ts
vi.mock("@/lib/db/schema", () => ({
  users: { email: "email" },
}));
```

#### 3.1.4 Verify

```bash
npm run test -- lib/actions/__tests__/auth.test.ts
npm run build
```

---

### Step 2: Await Email Sending in Auth Callbacks (#13)

> **Why?** The current code uses `void sendPasswordResetEmail(...).catch(...)` which fires the email but doesn't await it. If the email fails, the error is caught silently but there's no way to log it reliably since the promise may resolve after the request finishes. Awaiting with try/catch is more predictable.

**File:** `lib/auth/auth.ts` ← **MODIFY**

#### 3.2.1 Fix `sendResetPassword` callback

**Before (lines 38–46):**
```ts
    sendResetPassword: async ({ user, url, token }, request) => {
      void sendPasswordResetEmail({
        to: user.email,
        userName: user.name || user.email,
        resetUrl: url,
      }).catch((error) => {
        console.error("Failed to send password reset email:", error);
      });
    },
```

**After:**
```ts
    sendResetPassword: async ({ user, url, token }, request) => {
      try {
        await sendPasswordResetEmail({
          to: user.email,
          userName: user.name || user.email,
          resetUrl: url,
        });
      } catch (error) {
        console.error("Failed to send password reset email:", error);
        // Continue — don't block auth flow on email failure
      }
    },
```

#### 3.2.2 Fix `sendVerificationEmail` callback

**Before (lines 53–61):**
```ts
    sendVerificationEmail: async ({ user, url, token }, request) => {
      void sendVerificationEmail({
        to: user.email,
        userName: user.name || user.email,
        verificationUrl: url,
      }).catch((error) => {
        console.error("Failed to send verification email:", error);
      });
    },
```

**After:**
```ts
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        await sendVerificationEmail({
          to: user.email,
          userName: user.name || user.email,
          verificationUrl: url,
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
        // Continue — don't block auth flow on email failure
      }
    },
```

#### 3.2.3 Verify

1. Run `npm run build`
2. Test sign-up flow — verification email should still send
3. Test forgot password flow — reset email should still send

---

### Step 3: Fix setState in useEffect (#20)

> **Why?** Calling `setState` synchronously inside `useEffect` triggers an extra render cycle. React's `react-hooks/set-state-in-effect` ESLint rule flags this. The fix depends on the component — in most cases the state can be derived or the update can be deferred.

#### 3.3.1 Fix `components/auth/reset-password-form.tsx`

**File:** `components/auth/reset-password-form.tsx` ← **MODIFY**

Find the `useEffect` that reads the token from search params and sets state. The issue is calling `setState` synchronously inside the effect.

Look for a pattern like:

```ts
useEffect(() => {
  const token = searchParams.get("token");
  if (token) {
    setToken(token);       // ← setState in useEffect
  }
  // ...
}, [...]);
```

**Fix approach:** Use `useMemo` or `useRef` to derive the token value instead of syncing it via `useEffect` + `setState`. If the token only needs to be read once from the URL:

**Option A — Derive from searchParams directly (preferred if token is read-only):**
```ts
const token = searchParams.get("token") ?? "";
```

Remove the `useEffect` and `useState` for token entirely. Pass `token` directly where needed.

**Option B — If state is genuinely needed (e.g., the token value changes during the component lifecycle):**
```ts
useEffect(() => {
  const token = searchParams.get("token");
  if (token) {
    // Defer state update to avoid synchronous setState in effect
    queueMicrotask(() => setToken(token));
  }
}, [searchParams]);
```

> **Important:** Read the actual component code carefully before choosing. The exact fix depends on how `token` state is used. If it's only read from the URL and never modified, Option A is cleanest.

#### 3.3.2 Fix `components/auth/verify-email-handler.tsx`

**File:** `components/auth/verify-email-handler.tsx` ← **MODIFY**

Same pattern — find the `useEffect` that sets state from search params.

Look for lines 58–59 where `setState` is called:

```ts
useEffect(() => {
  const token = searchParams.get("token");
  setHasToken(!!token);    // ← setState in useEffect (line 58)
  setToken(token ?? "");   // ← setState in useEffect (line 59)
  // ...
}, [...]);
```

**Fix approach:** Same as above — derive from searchParams directly:

```ts
const token = searchParams.get("token") ?? "";
const hasToken = !!token;
```

Remove the `useState` calls for `token` and `hasToken`, and remove the `useEffect` that syncs them.

#### 3.3.3 Verify

```bash
npm run lint
npm run build
```

**Expected:** No `react-hooks/set-state-in-effect` warnings. Components behave identically.

---

### Step 4: Fix Ref Updated During Render (#21)

> **Why?** `task-filters.tsx` assigns `searchParamsRef.current = searchParams` directly during render. React's `react-hooks/refs` rule flags this because ref mutations during render can cause inconsistencies with concurrent features. The fix is to move the assignment into a `useEffect`.

**File:** `components/tasks/task-filters.tsx` ← **MODIFY**

**Before (lines 108–110):**
```ts
// Use a ref to always read latest searchParams without triggering effect re-runs
const searchParamsRef = useRef(searchParams);
searchParamsRef.current = searchParams;
```

**After:**
```ts
// Use a ref to always read latest searchParams without triggering effect re-runs
const searchParamsRef = useRef(searchParams);
useEffect(() => {
  searchParamsRef.current = searchParams;
}, [searchParams]);
```

**Why this is safe:** `searchParamsRef` is consumed in useEffect #3 (the debounced search effect at line 138). That effect runs after render, so the ref will already be updated by the `useEffect` above since React runs effects in declaration order.

#### 3.4.1 Verify

1. Run `npm run lint` — `react-hooks/refs` warning gone
2. Run `npm run build`
3. Go to `/tasks`, type in the search box
4. Verify debounced search still works (wait ~300ms after typing, URL updates)
5. Verify clearing search works
6. Verify search with fewer than 3 characters doesn't trigger a URL update

---

## 4. File Change Summary

### Files Created
- None

### Files Modified
| File | What Changed |
|------|-------------|
| `lib/actions/auth.ts` | Removed email enumeration check + unused db imports (#12) |
| `lib/auth/auth.ts` | `void`+`.catch()` → `await`+`try/catch` for both email callbacks (#13) |
| `lib/actions/__tests__/auth.test.ts` | Updated sign-up duplicate test, removed `db` mocks (#12) |
| `components/auth/reset-password-form.tsx` | Fixed setState in useEffect (#20) |
| `components/auth/verify-email-handler.tsx` | Fixed setState in useEffect (#20) |
| `components/tasks/task-filters.tsx` | Moved ref assignment into useEffect (#21) |

### Files Deleted
- None

---

## 5. Acceptance Criteria

### Security Criteria

| # | Issue | Check | Status |
|---|-------|-------|--------|
| 12 | Email enumeration | No `db.query.users.findFirst` in `signUpAction` | ☐ |
| 12 | Email enumeration | No `db`, `users`, `eq` imports in `auth.ts` (if no other usage) | ☐ |
| 12 | Email enumeration | Sign-up still returns "already exists" via Better Auth 409 | ☐ |
| 12 | Email enumeration | Sign-up still works for new users | ☐ |
| 13 | Silent emails | `sendPasswordResetEmail` awaited with try/catch | ☐ |
| 13 | Silent emails | `sendVerificationEmail` awaited with try/catch | ☐ |
| 13 | Silent emails | No `void` + `.catch()` pattern remains in `auth.ts` | ☐ |
| 13 | Silent emails | Email failures logged but don't block auth flow | ☐ |

### React Pattern Criteria

| # | Issue | Check | Status |
|---|-------|-------|--------|
| 20 | setState in effect | `reset-password-form.tsx` — no synchronous setState in useEffect | ☐ |
| 20 | setState in effect | `verify-email-handler.tsx` — no synchronous setState in useEffect | ☐ |
| 20 | setState in effect | Component behavior unchanged | ☐ |
| 21 | Ref during render | `task-filters.tsx` — ref assigned inside useEffect, not during render | ☐ |
| 21 | Ref during render | Search debounce behavior unchanged | ☐ |

### Quality Gates

- [ ] `npm run build` passes
- [ ] `npm run lint` passes — zero warnings
- [ ] `npm run test` passes (all existing tests still pass)
- [ ] Sign-up works for new users
- [ ] Sign-up returns "already exists" for duplicate emails
- [ ] Email sending works (password reset, verification)
- [ ] Reset password form loads correctly with token from URL
- [ ] Email verification works with token from URL
- [ ] Task search debounce works correctly

---

## 6. Implementation Order

| Step | Files | Time | What To Do |
|------|-------|------|-----------|
| 1 | `lib/actions/auth.ts` | 10 min | Remove email enumeration check + unused imports (#12) |
| 2 | `lib/actions/__tests__/auth.test.ts` | 15 min | Update tests for new sign-up behavior (#12) |
| 3 | `lib/auth/auth.ts` | 10 min | Await email sending with try/catch (#13) |
| 4 | `components/auth/reset-password-form.tsx` | 10 min | Fix setState in useEffect (#20) |
| 5 | `components/auth/verify-email-handler.tsx` | 10 min | Fix setState in useEffect (#20) |
| 6 | `components/tasks/task-filters.tsx` | 5 min | Move ref assignment into useEffect (#21) |
| 7 | Build + lint + test | 5 min | `npm run build; npm run lint; npm run test` |

---

## 7. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Removing email enumeration changes sign-up UX | **Medium** | Low | Better Auth already returns 409 for duplicates — the catch block handles it identically. The only difference is the error now comes from the API call, not the pre-check. |
| Awaiting emails slows down auth flows | **Low** | Medium | The delay is only on the success path (email actually sends). Use try/catch to continue on failure. Resend typically responds in <200ms. |
| Fixing setState in useEffect changes component timing | **Low** | Low | The current behavior causes extra re-renders. The fix should reduce renders, not change visible behavior. |
| Ref useEffect ordering issue | **Low** | Low | React runs effects in declaration order. The ref-update effect runs before the debounce effect that reads it. |
| Test updates for sign-up break | **Medium** | Medium | The key challenge is mocking `isAPIError` correctly. If the existing mock infrastructure doesn't support it, use `vi.mocked(isAPIError).mockReturnValue(true)` for the specific test. |

---

## 8. Related Documentation

- **code-review-report.md** — Suggestions #12, #13, #20, #21
- **P4-F2 FEATURE.md** — Parent feature spec
- **Better Auth docs** — Email enumeration protection
- **React docs** — [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- **React docs** — [useEffect](https://react.dev/reference/react/useEffect)
