# 🔍 Code Review Report — TaskFlow

**Project**: TaskFlow — Task management web application  
**Stack**: Next.js 16 App Router · React 19 · Tailwind CSS v4 · shadcn/ui · Neon PostgreSQL · Drizzle ORM · Better Auth · Resend · Zod v4  
**Date**: 2026-04-29  
**Files Reviewed**: ~70 source files across `app/`, `lib/`, `components/`, `scripts/`, root configs

---

## 📊 Overall Assessment

TaskFlow is a well-structured, convention-conscious Next.js application. The architecture follows modern patterns (Server Components, route groups, Server Actions), the data layer is cleanly separated, and auth/data scoping is consistent. There are, however, several security vulnerabilities, a few correctness bugs, and maintainability concerns that should be addressed before production.

| Dimension | Rating | Summary |
|---|---|---|
| ✅ Correctness | Good | Core flows work; some edge cases and a race condition need fixing |
| 🔴 Security | Needs Work | SQL-like injection in search, error message leakage, hardcoded user ID, **no rate limiting** |
| ✅ Maintainability | Good | Clean layering, consistent patterns, good validation; some duplication |
| 🟡 Performance | Fair | N+1-like dashboard queries, redundant cache invalidation, search concerns |
| 🟡 Testing | Fair | 243 tests passing; validation and auth tests solid, but no integration/E2E tests |

---

## 🔴 Blockers (Must Fix)

### 1. 🔴 Security: Search input enables SQL pattern injection via `ilike`

**File**: `lib/data/task.ts`, lines 69-71

```ts
const searchCondition = or(
  ilike(tasks.title, `%${options.search}%`),
  ilike(tasks.description, `%${options.search}%`)
);
```

The raw user input (`options.search`) is interpolated directly into `ilike` patterns. While Drizzle parameterizes the value (preventing classic SQL injection), the `%` and `_` LIKE wildcards inside the search string are **not** escaped. A user can craft queries like `%` to match everything, or `_` as a single-character wildcard, enabling unintended data exposure. More critically, if future refactoring switches to raw SQL, this becomes classic SQL injection.

**Why**: Users can bypass filter intent and perform wildcard attacks. The `ilike` pattern uses `%...%` wrapping, so a search for `%` becomes `%%%` which matches everything, exposing all task titles/descriptions.

**Suggestion**: Escape LIKE wildcards before interpolation:
```ts
function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, "\\$&");
}
// ...
ilike(tasks.title, `%${escapeLike(options.search)}%`)
```

---

### 2. 🔴 Security: Error messages leak internal details from auth actions

**File**: `lib/actions/auth.ts`, multiple locations

```ts
catch (error) {
  if (error instanceof Error) {
    return { success: false, error: error.message };
  }
}
```

Lines 56-58, 99, 150-152, 172-176, 194-196, 209-211 — all catch blocks pass `error.message` directly to the client. Better Auth and database errors can contain stack traces, table names, connection strings, or internal state.

**Why**: Internal error messages can reveal table structure, auth implementation details, and database internals to attackers.

**Suggestion**: Map known error types to user-friendly messages and use a generic fallback:
```ts
catch (error) {
  console.error("[signUpAction]", error);
  return { success: false, error: "An unexpected error occurred. Please try again." };
}
```

---

### 3. 🔴 Security: Seed script contains hardcoded user ID

**File**: `scripts/seed.ts`, line 8

```ts
const TARGET_USER_ID = "SVGfYh7sMn2443APsn1X8GBsqmqOaXLv";
```

This is a real user ID from the production/supabase auth system. If this script is run against production, it will modify/seed that specific user's data. This should at minimum be an environment variable.

**Suggestion**: Move to env var: `const TARGET_USER_ID = process.env.SEED_USER_ID!;`

---

### 4. 🔴 Correctness: Category name uniqueness is race-condition prone

**Files**: `lib/actions/category.ts`, lines 25-34 (create) and lines 63-74 (update)

The uniqueness check for category names is done in application code (check-then-insert):
```ts
const existing = await db.query.categories.findFirst({
  where: and(eq(categories.userId, userId), eq(categories.name, validated.name)),
});
if (existing) { return error; }
// ... then insert
```

This is a classic TOCTOU (time-of-check-time-of-use) race condition. Two concurrent requests can both pass the check and insert duplicate category names.

**Why**: Under concurrent load, duplicate categories with the same name for the same user will be created.

**Suggestion**: Add a unique composite constraint in the schema:
```ts
// In categories table definition:
uniqueIndex("categories_user_id_name_unique").on(table.userId, table.name),
```
Then handle the database unique violation error in the action.

---

### 5. 🔴 Correctness: `proxy.ts` allows unauthenticated access to `/verify-email` and `/reset-password`

**File**: `proxy.ts`, lines 4-10

```ts
const PUBLIC_PATHS = [
  "/sign-in", "/sign-up", "/forgot-password",
  "/reset-password", "/verify-email",
];
```

The AUTH_PATHS redirect (lines 12-16) only covers `/sign-in`, `/sign-up`, `/forgot-password`. This means an **authenticated** user visiting `/verify-email` or `/reset-password` won't be redirected to the dashboard — they can access these pages while logged in, which can cause confusing UX. More importantly, `/verify-email` and `/reset-password` contain token-based auth flows that should reset any existing session to prevent fixation issues.

**Suggestion**: Add `/verify-email` and `/reset-password` to `AUTH_PATHS` or at least evaluate UX implications.

---

### 6. 🔴 Security: No rate limiting on any endpoint

The entire application has **zero rate limiting** — no middleware throttling, no IP-based request counting, no brute-force protection, and no rate-limiting dependency installed. This is a critical security gap for a production application.

#### Affected Attack Vectors

**Authentication brute-force (Critical)**

All auth endpoints are unprotected:
- **`/sign-in`** — Login attempts can be tried infinitely with no cooldown
- **`/sign-up`** — Account creation spam (bot registration)
- **`/forgot-password`** — Password reset flooding (email bomb a victim)
- **`/api/auth/*`** — Better Auth's entire API surface (session creation, email verification, etc.)

The `signInAction` validates credentials against Better Auth, but nothing prevents 10,000 requests/minute from the same IP. Even with `requireEmailVerification: true`, an attacker can:
- Brute-force passwords on verified accounts
- Enumerate accounts (compounded by the explicit email check in `signUpAction` — issue #11)
- Trigger mass email sends via `forgotPasswordAction`

**Email bombing via password reset (High)**

```ts
// lib/actions/auth.ts, lines 114-135
export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  // No rate limit — a bot can send unlimited reset emails
  await auth.api.requestPasswordReset({ ... });
  return { success: true, data: { message: "If an account exists..." } };
}
```

An attacker can repeatedly call this endpoint to flood a victim's inbox with reset emails (DoS against the email provider, potential email filtering consequences for the domain).

**Task/Category creation spam (Medium)**

All CRUD actions (`createTaskAction`, `createCategoryAction`, etc.) have no per-user or per-IP rate limiting. A malicious or buggy client could flood the database.

**Dashboard query amplification (Medium)**

The dashboard makes 6 database queries per page load. Without rate limiting, a bot hitting `/dashboard` at high volume translates to 6× amplification against the database.

#### Recommended Implementation

**Option A: Better Auth built-in rate limiting (Quickest Win)**

Better Auth has a built-in `rateLimit` config that protects all `/api/auth/*` routes:

```ts
// lib/auth/auth.ts
export const auth = betterAuth({
  // ...existing config...
  rateLimit: {
    enabled: true,
    window: 60,        // time window in seconds
    max: 100,          // max requests per window per IP
    storage: "database", // persists across serverless cold starts
  },
});
```

This alone covers auth brute-force, sign-up spam, and password reset flooding with minimal effort.

**Option B: Upstash Redis rate limiting (Recommended for production)**

Since the app runs serverless on Neon, an edge-compatible rate limiter is needed for all routes. Upstash Redis is already a transitive dependency:

```ts
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

// Usage in proxy.ts or server actions:
const { success } = await ratelimit.limit(ip);
if (!success) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}
```

**Option C: Application-level rate limiting in `proxy.ts` (Dev only)**

For local development, a lightweight in-memory limiter can be added to the proxy:

```ts
// proxy.ts — simplified in-memory rate limiter (NOT production-safe)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string, limit = 100, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > limit;
}
```

> ⚠️ In-memory approach does NOT work across multiple serverless instances. Use Option A or B for production.

#### Priority per Endpoint

| Endpoint | Risk | Priority | Recommended Approach |
|---|---|---|---|
| `/api/auth/*` (sign-in, sign-up, forgot/reset password) | Brute-force, credential stuffing, email bombing | 🔴 Critical | Better Auth `rateLimit` config (Option A) |
| `/forgot-password` specifically | Email bombing / DoS | 🔴 Critical | Better Auth rate limit + per-email cooldown |
| Task CRUD actions | Database spam | 🟡 Medium | Per-user action throttling (Option B) |
| Dashboard page | Query amplification | 🟡 Medium | Proxy-level IP throttle (Option B) |
| `/sign-up` specifically | Bot account creation | 🟡 Medium | Better Auth rate limit + CAPTCHA (post-MVP) |

#### Recommended Phased Approach

1. **Immediate (before any public deploy)** — Add Better Auth `rateLimit` config (5 lines). Covers the most critical attack surface.
2. **Before production** — Add Upstash-based rate limiting in `proxy.ts` for all non-static routes. Covers authenticated endpoints too.
3. **Post-MVP** — Add per-email cooldown for `forgotPasswordAction` (max 3 resets per email per hour) and consider CAPTCHA for sign-up.

---

## 🟡 Suggestions (Should Fix)

### 7. 🟡 Performance: Dashboard makes 5 separate DB queries (N+1 pattern)

**File**: `lib/data/dashboard.ts`, lines 137-189

Each stat (dueToday, overdue, completedToday, totalActive) is a separate `db.select({ count: count() })` query. Plus one for priority distribution and one for upcoming tasks — that's **6 queries** for a single dashboard load.

**Suggestion**: Combine the 4 count queries into a single query using `CASE` conditional aggregation:
```ts
const stats = await db
  .select({
    dueToday: sum(sql`CASE WHEN ... THEN 1 ELSE 0 END`),
    overdue: sum(sql`CASE WHEN ... THEN 1 ELSE 0 END`),
    completedToday: sum(sql`CASE WHEN ... THEN 1 ELSE 0 END`),
    totalActive: sum(sql`CASE WHEN ... THEN 1 ELSE 0 END`),
  })
  .from(tasks)
  .where(eq(tasks.userId, userId));
```
This reduces 4 round trips to 1.

---

### 8. 🟡 Performance: Task list page fetches dashboard data just for timezone

**File**: `app/(app)/tasks/page.tsx`, line 39

```ts
const { timezone } = await getDashboardData(user.id);
```

The entire dashboard data function (6 DB queries) is called just to get the user's timezone. This is wasteful.

**Suggestion**: Create a lightweight `getUserTimezone(userId)` function that queries only `userPreferences`:
```ts
export async function getUserTimezone(userId: string) {
  const prefs = await getUserPreferences(userId);
  return prefs?.timezone ?? "UTC";
}
```

---

### 9. 🟡 Performance: Redundant `revalidatePath` alongside `revalidateTag`

**Files**: Every Server Action in `lib/actions/`

Every action calls both `revalidateTag(...)` and `revalidatePath(...)`. Since `revalidateTag` with `"max"` already invalidates all cached responses with that tag (which includes the relevant path pages), the `revalidatePath` calls are redundant.

**Why**: Double invalidation adds unnecessary overhead on each mutation.

**Suggestion**: Remove all `revalidatePath` calls from actions and rely solely on `revalidateTag`. Keep `revalidatePath` only for paths that aren't covered by tags (which none currently are).

---

### 10. 🟡 Correctness: `preferences.ts` upsert has a race condition

**File**: `lib/data/preferences.ts`, lines 38-59

The `upsertUserPreferences` function does a read-then-write:
```ts
const existing = await getUserPreferences(userId);  // READ
if (existing) {
  // UPDATE
} else {
  // INSERT
}
```

Two concurrent calls could both read `existing = null` and both attempt INSERT, causing a unique constraint violation.

**Suggestion**: Use Drizzle's `onConflictDoUpdate`:
```ts
await db.insert(userPreferences)
  .values({ userId, ...data })
  .onConflictDoUpdate({
    target: userPreferences.userId,
    set: { ...data, updatedAt: new Date() },
  });
```

---

### 11. 🟡 Correctness: `settings.ts` double-updates user name

**File**: `lib/actions/settings.ts`, lines 32-44

```ts
// Update via Better Auth to ensure session is refreshed
await auth.api.updateUser({ headers: await headers(), body: { name: validated.name } });

// Also update directly via Drizzle as fallback/synchronization
await db.update(users).set({ name: validated.name, updatedAt: new Date() }).where(eq(users.id, userId));
```

Better Auth's `updateUser` already updates the `users` table. The subsequent Drizzle update is redundant and creates a TOCTOU scenario where the value could differ if something changes between the two calls.

**Suggestion**: Remove the direct Drizzle update and rely on Better Auth. If session refresh is needed, use `revalidateTag` for the session.

---

### 12. 🟡 Security: `signUpAction` bypasses Better Auth email enumeration protection

**File**: `lib/actions/auth.ts`, lines 68-77

```ts
const existingUser = await db.query.users.findFirst({
  where: eq(users.email, validated.email.toLowerCase()),
});
if (existingUser) {
  return { success: false, error: "An account with this email already exists..." };
}
```

This intentionally bypasses Better Auth's email enumeration protection (the comment on line 67 acknowledges this). While the intention is UX-friendly, this reveals whether an email is registered, enabling account enumeration attacks.

**Why**: Attackers can verify which emails are registered in the system, which is a prerequisite for credential stuffing or targeted phishing.

**Suggestion**: Consider whether the UX benefit outweighs the security risk. A middle ground: return the same message regardless, but send a "you already have an account" email to the existing address.

---

### 13. 🟡 Security: Email sending uses `void` + `.catch()` — silent failures

**File**: `lib/auth/auth.ts`, lines 38-44 and 52-58

```ts
void sendPasswordResetEmail({ ... }).catch((error) => {
  console.error("Failed to send password reset email:", error);
});
```

The `void` + `.catch()` pattern means the auth flow continues even if email sending fails. For password reset and email verification, the user may never receive the email, but the UI shows success.

**Suggestion**: Either `await` the email sending (preferred for critical flows) or at minimum surface the error to the UI so the user knows the email wasn't sent.

---

### 14. 🟡 Maintainability: `ActionResult` type is duplicated in 4 files

**Files**: `lib/actions/auth.ts`, `lib/actions/task.ts`, `lib/actions/category.ts`, `lib/actions/settings.ts`

```ts
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

This identical interface is defined 4 times.

**Suggestion**: Extract to `lib/actions/types.ts` and import everywhere.

---

### 15. 🟡 Maintainability: `lib/db/index.ts` has unused import

**File**: `lib/db/index.ts`, line 1

```ts
import { neon, neonConfig } from "@neondatabase/serverless";
```

`neonConfig` is imported but never used (ESLint warning confirmed).

**Suggestion**: Remove the unused import: `import { neon } from "@neondatabase/serverless";`

---

### 16. 🟡 Maintainability: Unused imports across multiple components

**Files**:
- `components/auth/reset-password-form.tsx` — `ResetPasswordInput` unused
- `components/auth/sign-up-form.tsx` — `SignUpInput` unused
- `components/auth/verify-email-handler.tsx` — `verifyEmailSchema`, `VerifyEmailInput` unused
- `components/layout/sidebar.tsx` — `SidebarTrigger` unused
- `components/settings/appearance-form.tsx` — `Button` unused
- `components/settings/preferences-form.tsx` — `useState`, `dateFormatValues`, `defaultSortValues` unused
- `components/settings/profile-form.tsx` — `useState` unused

**Suggestion**: Clean up unused imports.

---

### 17. 🟡 Config: `next.config.ts` may need `skipProxyUrlNormalize`

Per AGENTS.md, Next.js 16 uses `proxy.ts` instead of `middleware.ts`, and `skipMiddlewareUrlNormalize` should be replaced with `skipProxyUrlNormalize`. The current config doesn't include this, which may cause routing issues with the proxy.

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["*.app.github.dev", "localhost:3000"],
    },
  },
  // Consider adding: skipProxyUrlNormalize: true
};
```

---

### 18. 🟡 Testing: `any` types in test files

**Files**: `lib/actions/__tests__/auth.test.ts` (11 occurrences), `scripts/seed.ts` (2 occurrences)

ESLint reports `no-explicit-any` errors in test mocks and seed data.

**Suggestion**: Define proper types for mock data instead of `any`.

---

### 19. 🟡 Testing: No integration/E2E tests for data layer

The `lib/data/` directory has 4 test files (`category.test.ts`, `dashboard.test.ts`, `preferences.test.ts`, `task.test.ts`) but no integration tests against an actual database. All action tests use heavy mocking. There are no E2E tests at all.

**Suggestion**: Add at least a few integration tests using Neon's branching feature to test real DB queries.

---

### 20. 🟡 React: `setState` called synchronously in `useEffect`

**Files**:
- `components/auth/reset-password-form.tsx`, line 60
- `components/auth/verify-email-handler.tsx`, lines 58-59

ESLint reports `react-hooks/set-state-in-effect` errors. Setting state synchronously within an effect can trigger cascading renders.

**Suggestion**: Refactor to use `useMemo`/`useState` initialization, or move the state initialization logic outside the effect.

---

### 21. 🟡 React: Ref updated during render in `task-filters.tsx`

**File**: `components/tasks/task-filters.tsx`, line 110

```ts
const searchParamsRef = useRef(searchParams);
searchParamsRef.current = searchParams; // ← updating ref during render
```

ESLint reports `react-hooks/refs` error. Assigning to a ref during render can cause stale data issues.

**Suggestion**: Use `useEffect` to update the ref, or restructure to avoid the ref entirely.

---

## 💭 Nits (Nice to Have)

### 22. 💭 `public/design-system/page.tsx` has unused imports

Six unused icon imports and one unused variable (`isUppercase`). This appears to be a development-only page that should be removed or gated behind a feature flag before production.

---

### 23. 💭 Sidebar uses `<img>` instead of `next/image`

**File**: `components/layout/sidebar.tsx`, line 213

```html
<img src="/next.svg" alt="TaskFlow" ... />
```

ESLint warns about using `<img>` instead of `<Image />` from Next.js for automatic optimization.

---

### 24. 💭 `task-list.tsx` has `as unknown as` double casts

**File**: `components/tasks/task-list.tsx`, lines 46 and 58

```ts
const groups = groupTasks(tasks as unknown as Parameters<typeof groupTasks>[0], groupBy, timezone);
// ...
task={task as unknown as TaskListTask}
```

These double-casts suggest the `TaskListTask` interface and the `TaskWithCategory` type from `task-grouping.ts` should be unified or made compatible to avoid the unsafe casts.

---

### 25. 💭 `schema.ts` auth tables use `text` for `id` columns

The `users`, `sessions`, `accounts`, and `verifications` tables all use `text("id").primaryKey()`. Better Auth generates these IDs, so this is fine functionally, but it means these aren't UUIDs — consider documenting this decision for future developers.

---

### 26. 💭 `task-form.tsx` duplicates the validation schema

**File**: `components/tasks/task-form.tsx`, lines 62-69

The form component defines its own local `baseSchema` that duplicates the validation from `lib/validation/task.ts`. This means if the validation rules change, they need updating in two places.

**Suggestion**: Use the `createTaskSchema` from validation directly, or at minimum import the enum values.

---

### 27. 💭 Timezone list in `timezones.ts` is hardcoded at 75 entries

`Intl.supportedValuesOf('timeZone')` returns 400+ IANA timezones. The hardcoded list of 75 is well-curated for common needs, but it won't cover all users. Consider whether you need dynamic generation or if the current list is intentional.

---

## ✅ What's Done Well

1. **Consistent auth scoping** — Every server action checks `getCurrentUserId()` or `requireAuth()`, and every data query scopes by `userId`. This is excellent and prevents cross-user data leaks.

2. **Clean separation of concerns** — The architecture cleanly separates `lib/validation/` (schemas), `lib/data/` (queries), `lib/actions/` (mutations), and `lib/auth/` (session management). Each layer has a clear responsibility.

3. **Good use of Zod v4 top-level validators** — Auth validation uses `z.email()` and `z.uuid()` instead of `.refine()` chains, following the project's coding standards.

4. **Proper Next.js 16 patterns** — `proxy.ts` instead of `middleware.ts`, `"use cache"` with `cacheTag`/`cacheLife` in data functions, route groups for auth/public pages, Server Components by default.

5. **Comprehensive error boundaries** — Error boundaries at the root, app layout, and page levels with themed fallbacks. The global error boundary also handles dark mode detection.

6. **Database indexes** — The schema includes well-chosen composite indexes for task queries (`tasks_user_id_status_idx`, `tasks_user_id_due_date_idx`, etc.) that will support the filter/sort patterns used in the data layer.

7. **Thorough test coverage for actions** — 243 tests covering validation, auth, task, category, and settings actions with proper assertion patterns.

---

## 📋 Priority Summary

| # | Priority | Issue | Impact |
|---|---|---|---|
| 1 | 🔴 Blocker | LIKE wildcard injection in search | Data exposure / unexpected matches |
| 2 | 🔴 Blocker | Internal error messages leaking to client | Security info disclosure |
| 3 | 🔴 Blocker | Hardcoded user ID in seed script | Data integrity risk |
| 4 | 🔴 Blocker | Category name race condition | Duplicate records |
| 5 | 🔴 Blocker | Auth paths config inconsistent | UX / potential session issues |
| 6 | 🔴 Blocker | No rate limiting on any endpoint | Brute-force, email bombing, DB spam |
| 7 | 🟡 Suggestion | Dashboard 6-query pattern | Performance |
| 8 | 🟡 Suggestion | Fetching all dashboard data for timezone | Performance |
| 9 | 🟡 Suggestion | Redundant revalidatePath calls | Performance |
| 10 | 🟡 Suggestion | Preferences upsert race condition | Data integrity |
| 11 | 🟡 Suggestion | Double user name update | Correctness / TOCTOU |
| 12 | 🟡 Suggestion | Email enumeration bypass | Security |
| 13 | 🟡 Suggestion | Silent email send failures | UX / correctness |
| 14 | 🟡 Suggestion | Duplicated ActionResult type | Maintainability |
| 15 | 🟡 Suggestion | Unused import in db/index.ts | Maintainability |
| 16 | 🟡 Suggestion | Unused imports across components | Maintainability |
| 17 | 🟡 Suggestion | Missing skipProxyUrlNormalize config | Config / routing |
| 18 | 🟡 Suggestion | `any` types in test files | Type safety |
| 19 | 🟡 Suggestion | No integration/E2E tests | Test coverage |
| 20 | 🟡 Suggestion | setState in useEffect | React correctness |
| 21 | 🟡 Suggestion | Ref updated during render | React correctness |

---

**Recommended next steps**: Address the 6 blocker issues first (especially rate limiting — #6, and the LIKE injection — #1), then the 15 suggestions, and clean up nits opportunistically. The codebase is solid overall — these are targeted fixes that will make it production-ready.