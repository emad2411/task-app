# Feature Specification: P4-F1 — Security Review (Blockers)

**Phase:** 4 — Hardening  
**Feature ID:** P4-F1  
**Feature Name:** Security Review — Fix All Blocker Issues  
**Status:** Draft — Ready for Implementation  
**Date:** 2026-04-30  

---

## 1. Goals

### Primary Goal
Fix all 6 blocker-level security issues identified in the code review report (`code-review-report.md`) to make TaskFlow production-ready from a security standpoint.

### Secondary Goals
- Implement full rate limiting (Better Auth built-in + Upstash Redis + per-email cooldown)
- Add database-level constraints to prevent race conditions
- Sanitize all error messages sent to clients
- Document the security changes for future developers

### Success Metrics
- [ ] Zero blocker security issues remain in code review
- [ ] Build passes (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] All existing tests still pass (`npm run test`)
- [ ] Rate limiting active on auth endpoints
- [ ] LIKE wildcard injection prevented in search
- [ ] No internal error messages leaked to client
- [ ] Category name uniqueness enforced at database level
- [ ] Seed script uses environment variables
- [ ] Auth paths in proxy.ts are consistent

---

## 2. Scope

### In Scope

#### Blocker #1: LIKE Wildcard Injection in Search
Escape `%`, `_`, and `\` characters in user-provided search strings before passing them to `ilike` patterns in `lib/data/task.ts`.

#### Blocker #2: Error Message Leakage in Auth Actions
Replace all `error.message` returns in catch blocks across `lib/actions/auth.ts` with mapped, user-friendly messages. Log real errors server-side.

#### Blocker #3: Hardcoded User ID in Seed Script
Move `TARGET_USER_ID` from hardcoded string to `process.env.SEED_USER_ID` with a helpful error message if missing.

#### Blocker #4: Category Name TOCTOU Race Condition
Add a unique composite index on `(userId, name)` to the categories table. Update `createCategoryAction` and `updateCategoryAction` to handle database unique violation errors.

#### Blocker #5: Auth Paths Inconsistency in proxy.ts
Add `/verify-email` and `/reset-password` to `AUTH_PATHS` so authenticated users get redirected to dashboard.

#### Blocker #6: Rate Limiting (Full Implementation)
- **6a:** Enable Better Auth's built-in `rateLimit` config
- **6b:** Install `@upstash/ratelimit` and `@upstash/redis`, create rate limiter utility, integrate into `proxy.ts` for all non-static routes
- **6c:** Add per-email cooldown for `forgotPasswordAction` (max 3 requests per email per hour)
- Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.example`

### Out of Scope
- Suggestion #12: Email enumeration bypass (kept as-is for now — UX tradeoff documented)
- Suggestion #13: Silent email send failures (kept as-is — `void` pattern is intentional fire-and-forget to prevent timing attacks)
- Performance optimizations (dashboard query consolidation, redundant revalidatePath removal)
- Code quality nits (unused imports, duplicated types, `any` types in tests)
- Integration/E2E tests
- React hook correctness issues (setState in useEffect, ref during render)
- Suggestion #6b: Upstash rate limiting for authenticated endpoints beyond proxy.ts (covered by proxy.ts integration)

---

## 3. Requirements

### 3.1 Functional Requirements

#### REQ-001: Create `escapeLike()` Utility Function
**Priority:** P0  
**Description:** Create a utility function that escapes SQL LIKE wildcard characters (`%`, `_`, `\`) in user-provided strings to prevent wildcard injection attacks.

**Implementation:**
```ts
// lib/utils/escape-like.ts
export function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, "\\$&");
}
```

**Acceptance Criteria:**
- [ ] File created at `lib/utils/escape-like.ts`
- [ ] Function escapes `%` → `\%`, `_` → `\_`, `\` → `\\`
- [ ] Function handles empty strings, strings with no wildcards, and strings with multiple wildcards
- [ ] Unit test file created at `lib/utils/__tests__/escape-like.test.ts`
- [ ] Tests cover: normal text, `%` wildcard, `_` wildcard, `\` escape character, mixed wildcards, empty string

#### REQ-002: Apply `escapeLike()` to Task Search
**Priority:** P0  
**Description:** Apply the `escapeLike()` function to all `ilike` pattern parameters in `lib/data/task.ts`.

**Current State (vulnerable):**
```ts
// lib/data/task.ts, lines 69-71
const searchCondition = or(
  ilike(tasks.title, `%${options.search}%`),
  ilike(tasks.description, `%${options.search}%`)
);
```

**Target State (safe):**
```ts
import { escapeLike } from "@/lib/utils/escape-like";

const searchCondition = or(
  ilike(tasks.title, `%${escapeLike(options.search)}%`),
  ilike(tasks.description, `%${escapeLike(options.search)}%`)
);
```

**Acceptance Criteria:**
- [ ] `escapeLike` imported in `lib/data/task.ts`
- [ ] Both `ilike` calls wrap `options.search` with `escapeLike()`
- [ ] Search functionality still works for normal queries (no regression)
- [ ] Search for `%` returns only tasks containing literal `%` character (not all tasks)
- [ ] Search for `_` returns only tasks containing literal `_` character (not single-char wildcard matches)

#### REQ-003: Sanitize Auth Error Messages
**Priority:** P0  
**Description:** Replace all `error.message` returns in catch blocks across `lib/actions/auth.ts` with mapped, user-friendly messages. Log real errors server-side with `console.error`.

**Affected catch blocks:**
| Line(s) | Action | Current Behavior | Target Behavior |
|---------|--------|-----------------|-----------------|
| 54 | `signInAction` | Returns `apiError.message` for non-401/403 errors | Returns generic "An unexpected error occurred. Please try again." |
| 56-58 | `signInAction` | Returns `error.message` for non-API errors | Returns generic "An unexpected error occurred. Please try again." |
| 98 | `signUpAction` | Returns `apiError.message` for non-409/422 errors | Returns generic "An unexpected error occurred. Please try again." |
| 100-108 | `signUpAction` | Returns `error.message` with pattern matching | Returns generic "An unexpected error occurred. Please try again." |
| 150-151 | `resetPasswordAction` | Returns `error.message` | Returns "Failed to reset password. Please try again." |
| 172-176 | `updatePasswordAction` | Returns `error.message` (with pattern match) | Returns "Failed to update password. Please try again." |
| 194-195 | `verifyEmailAction` | Returns `error.message` | Returns "Failed to verify email. Please try again." |
| 209-210 | `signOutAction` | Returns `error.message` | Returns "Failed to sign out. Please try again." |

**Acceptance Criteria:**
- [ ] No catch block returns `error.message` directly to the client
- [ ] All catch blocks log the real error with `console.error("[actionName]", error)`
- [ ] User-facing messages are generic and actionable
- [ ] Known Better Auth error patterns (401, 403, 409, 422) still return specific user-friendly messages
- [ ] `signInAction` still returns "Invalid email or password" for 401
- [ ] `signInAction` still returns "Email not verified..." for 403
- [ ] `signUpAction` still returns "An account with this email already exists..." for 409
- [ ] `signUpAction` still returns "Invalid input..." for 422

#### REQ-004: Move Seed User ID to Environment Variable
**Priority:** P0  
**Description:** Replace hardcoded `TARGET_USER_ID` in `scripts/seed.ts` with `process.env.SEED_USER_ID`.

**Current State:**
```ts
// scripts/seed.ts, line 8
const TARGET_USER_ID = "SVGfYh7sMn2443APsn1X8GBsqmqOaXLv";
```

**Target State:**
```ts
const TARGET_USER_ID = process.env.SEED_USER_ID;
if (!TARGET_USER_ID) {
  console.error("SEED_USER_ID environment variable is required. Set it to an existing user ID.");
  process.exit(1);
}
```

**Acceptance Criteria:**
- [ ] Hardcoded user ID removed from `scripts/seed.ts`
- [ ] Script reads `SEED_USER_ID` from environment
- [ ] Script exits with helpful error if `SEED_USER_ID` is not set
- [ ] `SEED_USER_ID` added to `.env.example` with placeholder value
- [ ] Script still works when `SEED_USER_ID` is set correctly

#### REQ-005: Add Unique Constraint to Categories Table
**Priority:** P0  
**Description:** Add a database-level unique constraint on `(userId, name)` for the categories table to prevent race conditions.

**Current Schema:**
```ts
// lib/db/schema.ts, lines 81-96
export const categories = pgTable(
  "categories",
  { ... },
  (table) => [
    index("categories_user_id_name_idx").on(table.userId, table.name),
  ]
);
```

**Target Schema:**
```ts
import { index, uniqueIndex } from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  { ... },
  (table) => [
    index("categories_user_id_name_idx").on(table.userId, table.name),
    uniqueIndex("categories_user_id_name_unique").on(table.userId, table.name),
  ]
);
```

**Acceptance Criteria:**
- [ ] `uniqueIndex` imported from `drizzle-orm/pg-core`
- [ ] Unique index added to categories table definition
- [ ] Migration generated with `npm run db:generate`
- [ ] Migration applied with `npm run db:migrate`
- [ ] Database has unique constraint on `(user_id, name)` for categories

#### REQ-006: Handle Unique Violation in Category Actions
**Priority:** P0  
**Description:** Update `createCategoryAction` and `updateCategoryAction` to handle database unique violation errors (PostgreSQL error code `23505`) instead of relying solely on the app-level check.

**Target pattern for `createCategoryAction`:**
```ts
// Keep the app-level check for UX (early feedback), but add DB-level handling:
try {
  const [category] = await db.insert(categories).values({ ... }).returning();
  // ... success
} catch (error) {
  // Check for unique violation
  if (error && typeof error === "object" && "code" in error && error.code === "23505") {
    return { success: false, error: "A category with this name already exists" };
  }
  console.error("[createCategoryAction]", error);
  return { success: false, error: "Failed to create category" };
}
```

**Acceptance Criteria:**
- [ ] `createCategoryAction` catches PostgreSQL error code `23505` (unique violation)
- [ ] `updateCategoryAction` catches PostgreSQL error code `23505` (unique violation)
- [ ] User sees "A category with this name already exists" on duplicate insert/update
- [ ] App-level check retained for early UX feedback (not removed)
- [ ] Other database errors return generic "Failed to create/update category" message
- [ ] Real errors logged server-side with `console.error`

#### REQ-007: Fix Auth Paths in proxy.ts
**Priority:** P0  
**Description:** Add `/verify-email` and `/reset-password` to `AUTH_PATHS` so authenticated users visiting these pages get redirected to the dashboard.

**Current State:**
```ts
const AUTH_PATHS = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
];
```

**Target State:**
```ts
const AUTH_PATHS = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];
```

**Acceptance Criteria:**
- [ ] `/reset-password` added to `AUTH_PATHS`
- [ ] `/verify-email` added to `AUTH_PATHS`
- [ ] Authenticated user visiting `/reset-password` redirects to `/dashboard`
- [ ] Authenticated user visiting `/verify-email` redirects to `/dashboard`
- [ ] Unauthenticated users can still access these pages (they remain in `PUBLIC_PATHS`)
- [ ] No change to `/sign-in`, `/sign-up`, `/forgot-password` behavior

#### REQ-008: Enable Better Auth Built-in Rate Limiting
**Priority:** P0  
**Description:** Add Better Auth's `rateLimit` configuration to protect all `/api/auth/*` endpoints.

**Implementation:**
```ts
// lib/auth/auth.ts — add to betterAuth() config:
rateLimit: {
  enabled: true,
  window: 60,        // 60-second window
  max: 100,          // max 100 requests per window per IP
  storage: "database", // persists across serverless cold starts
},
```

**Acceptance Criteria:**
- [ ] `rateLimit` config added to `betterAuth()` in `lib/auth/auth.ts`
- [ ] `enabled: true` — rate limiting is active
- [ ] `window: 60` — 60-second sliding window
- [ ] `max: 100` — max 100 requests per window per IP
- [ ] `storage: "database"` — uses database for persistence (works with serverless)
- [ ] Auth endpoints return 429 when rate limit exceeded
- [ ] Rate limit headers included in response (Better Auth handles this)

#### REQ-009: Install and Configure Upstash Redis Rate Limiting
**Priority:** P0  
**Description:** Install `@upstash/ratelimit` and `@upstash/redis`, create a rate limiter utility, and integrate it into `proxy.ts` for all non-static routes.

**Dependencies:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**New file: `lib/rate-limit.ts`**
```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// General rate limiter: 10 requests per 10 seconds per IP
export const generalLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: false,
});

// Auth rate limiter: 5 requests per 60 seconds per IP (stricter)
export const authLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: false,
});

// Forgot password per-email limiter: 3 requests per hour per email
export const forgotPasswordLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  analytics: false,
});
```

**Environment variables (add to `.env.example`):**
```env
# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

**Acceptance Criteria:**
- [ ] `@upstash/ratelimit` installed
- [ ] `@upstash/redis` installed
- [ ] `lib/rate-limit.ts` created with 3 limiters (general, auth, forgot-password)
- [ ] `UPSTASH_REDIS_REST_URL` added to `.env.example`
- [ ] `UPSTASH_REDIS_REST_TOKEN` added to `.env.example`
- [ ] Rate limiters use `Redis.fromEnv()` (reads from environment)
- [ ] `analytics: false` — no analytics overhead

#### REQ-010: Integrate Upstash Rate Limiting into proxy.ts
**Priority:** P0  
**Description:** Update `proxy.ts` to use the Upstash rate limiter for all non-static, non-public routes.

**Implementation:**
```ts
// proxy.ts — add rate limiting before session check:
import { generalLimiter, authLimiter } from "@/lib/rate-limit";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STATIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const isAuthApi = pathname.startsWith("/api/auth");

  const limiter = isAuthApi ? authLimiter : generalLimiter;
  const { success, limit, reset, remaining } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }

  // ... existing session logic ...
}
```

**Acceptance Criteria:**
- [ ] `proxy` function changed to `async` (required for `await limiter.limit()`)
- [ ] IP extracted from `x-forwarded-for` header (with fallback to `"unknown"`)
- [ ] Auth API routes (`/api/auth/*`) use stricter `authLimiter`
- [ ] All other routes use `generalLimiter`
- [ ] Rate-limited requests return 429 with JSON error body
- [ ] Rate limit headers included in 429 response (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)
- [ ] Non-rate-limited requests pass through to existing session logic unchanged
- [ ] `config.matcher` unchanged — still excludes static assets

#### REQ-011: Add Per-Email Cooldown for Forgot Password
**Priority:** P0  
**Description:** Add a per-email rate limit to `forgotPasswordAction` to prevent email bombing (max 3 requests per email per hour).

**Implementation:**
```ts
// lib/actions/auth.ts — forgotPasswordAction
import { forgotPasswordLimiter } from "@/lib/rate-limit";

export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  try {
    const validated = forgotPasswordSchema.parse(input);

    // Per-email rate limit
    const { success } = await forgotPasswordLimiter.limit(validated.email);
    if (!success) {
      return {
        success: false,
        error: "Too many password reset requests. Please wait before trying again.",
      };
    }

    await auth.api.requestPasswordReset({
      body: {
        email: validated.email,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      },
    });

    return {
      success: true,
      data: { message: "If an account exists with this email, you will receive a password reset link" },
    };
  } catch {
    return {
      success: true,
      data: { message: "If an account exists with this email, you will receive a password reset link" },
    };
  }
}
```

**Acceptance Criteria:**
- [ ] `forgotPasswordLimiter` imported in `lib/actions/auth.ts`
- [ ] Rate limit checked against user's email (not IP)
- [ ] Returns specific error message when rate limited: "Too many password reset requests..."
- [ ] Rate limit checked BEFORE calling Better Auth API (prevents unnecessary email sends)
- [ ] Existing catch block behavior unchanged (returns success even on error to prevent enumeration)
- [ ] Max 3 requests per email per hour

---

### 3.2 Technical Requirements

#### REQ-012: Upstash Redis Development Mode
**Priority:** P1  
**Description:** The rate limiter should gracefully handle missing Upstash credentials in development.

**Implementation:**
```ts
// lib/rate-limit.ts — add guard for missing credentials:
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// If credentials missing, create a pass-through limiter
if (!redisUrl || !redisToken) {
  console.warn("[rate-limit] Upstash credentials not set. Rate limiting disabled.");
  // Export no-op limiters that always succeed
  export const generalLimiter = { limit: async () => ({ success: true, limit: 0, reset: 0, remaining: 0 }) };
  export const authLimiter = { limit: async () => ({ success: true, limit: 0, reset: 0, remaining: 0 }) };
  export const forgotPasswordLimiter = { limit: async () => ({ success: true, limit: 0, reset: 0, remaining: 0 }) };
} else {
  // ... normal Upstash initialization ...
}
```

**Acceptance Criteria:**
- [ ] If `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` is missing, rate limiters return `{ success: true }` (pass-through)
- [ ] Warning logged to console when credentials are missing
- [ ] No crashes or errors in development without Upstash credentials
- [ ] Full rate limiting active in production when credentials are set

#### REQ-013: Database Migration for Unique Constraint
**Priority:** P0  
**Description:** Generate and apply a Drizzle migration for the new unique index on categories.

**Acceptance Criteria:**
- [ ] `npm run db:generate` creates a new migration file
- [ ] Migration file contains `CREATE UNIQUE INDEX CONCURRENTLY categories_user_id_name_unique ON categories (user_id, name)` (or equivalent)
- [ ] `npm run db:migrate` applies the migration successfully
- [ ] Existing data is not affected (no duplicate `(userId, name)` pairs exist)
- [ ] Migration is idempotent or safe to re-run

#### REQ-014: Code Quality and Standards
**Priority:** P1  
**Description:** Ensure all new and modified code adheres to project coding standards.

**Acceptance Criteria:**
- [ ] Server components by default; `"use client"` only where necessary
- [ ] TypeScript strict mode — no `any` types
- [ ] Proper interfaces/types for all exports
- [ ] All components have meaningful JSDoc comments
- [ ] No unused imports
- [ ] No inline styles
- [ ] Error messages use consistent phrasing ("Please try again" suffix)

---

## 4. File Structure

### Files Created
```
lib/utils/
└── escape-like.ts              ← NEW: LIKE wildcard escape utility

lib/utils/__tests__/
└── escape-like.test.ts         ← NEW: Unit tests for escapeLike

lib/
└── rate-limit.ts               ← NEW: Upstash rate limiter configuration
```

### Files Modified
```
lib/data/
└── task.ts                     ← UPDATE: Apply escapeLike to ilike patterns

lib/actions/
└── auth.ts                     ← UPDATE: Sanitize error messages + per-email rate limit
└── category.ts                 ← UPDATE: Handle unique violation errors

lib/auth/
└── auth.ts                     ← UPDATE: Add Better Auth rateLimit config

lib/db/
└── schema.ts                   ← UPDATE: Add uniqueIndex to categories table

scripts/
└── seed.ts                     ← UPDATE: Use SEED_USER_ID env var

proxy.ts                        ← UPDATE: Add async rate limiting + fix AUTH_PATHS

.env.example                    ← UPDATE: Add SEED_USER_ID, UPSTASH_REDIS_* vars
```

### Files Deleted
- (none)

---

## 5. Acceptance Criteria Summary

### Security Criteria

| Issue | Criteria | Status |
|-------|----------|--------|
| #1 LIKE injection | `escapeLike()` applied to all `ilike` patterns | ☐ |
| #2 Error leakage | No `error.message` returned to client in auth actions | ☐ |
| #3 Hardcoded ID | Seed script uses `SEED_USER_ID` env var | ☐ |
| #4 Race condition | Unique constraint on categories `(userId, name)` | ☐ |
| #5 Auth paths | `/verify-email` and `/reset-password` in `AUTH_PATHS` | ☐ |
| #6a Rate limiting | Better Auth `rateLimit` config enabled | ☐ |
| #6b Upstash | Upstash rate limiter in `proxy.ts` for all routes | ☐ |
| #6c Email cooldown | Per-email rate limit on `forgotPasswordAction` | ☐ |

### Quality Gates

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (all existing tests still pass)
- [ ] New tests added for `escapeLike()` utility
- [ ] Migration generated and applied successfully
- [ ] No new `any` types introduced
- [ ] No unused imports

---

## 6. Implementation Order

Follow this order to minimize risk and enable incremental testing:

| Step | File(s) | Priority | Description |
|------|---------|----------|-------------|
| 1 | `lib/utils/escape-like.ts` + tests | P0 | Create utility + unit tests |
| 2 | `lib/data/task.ts` | P0 | Apply `escapeLike` to search |
| 3 | `lib/actions/auth.ts` | P0 | Sanitize all error messages |
| 4 | `scripts/seed.ts` + `.env.example` | P0 | Move to env var |
| 5 | `lib/db/schema.ts` | P0 | Add unique index |
| 6 | `lib/actions/category.ts` | P0 | Handle unique violations |
| 7 | Migration | P0 | Generate and apply migration |
| 8 | `proxy.ts` | P0 | Fix AUTH_PATHS |
| 9 | `lib/auth/auth.ts` | P0 | Add Better Auth rateLimit |
| 10 | Install Upstash packages | P0 | `npm install @upstash/ratelimit @upstash/redis` |
| 11 | `lib/rate-limit.ts` | P0 | Create rate limiter utility |
| 12 | `.env.example` | P0 | Add Upstash env vars |
| 13 | `proxy.ts` (rate limiting) | P0 | Integrate Upstash limiter |
| 14 | `lib/actions/auth.ts` (forgot password) | P0 | Add per-email cooldown |
| 15 | Build + lint + test | P0 | `npm run build && npm run lint && npm run test` |

---

## 7. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Upstash Redis not available in development | Low | High | Implement pass-through mode when credentials missing (REQ-012). Rate limiting disabled locally, fully active in production. |
| Migration fails due to existing duplicate categories | Medium | Low | Query for duplicates before running migration. If found, rename or merge duplicates manually, then re-run migration. |
| `proxy.ts` async change breaks existing behavior | Medium | Low | The existing `proxy` function is synchronous. Making it async is safe — Next.js handles async proxy functions. Test all routes after change. |
| Better Auth `rateLimit` storage: "database" requires auth tables | Low | Low | Auth tables already exist. Better Auth handles rate limit storage automatically within its own tables. |
| Rate limiting causes false positives during testing | Low | Medium | Use higher limits in development (pass-through mode) or set `UPSTASH_REDIS_*` env vars with a free Upstash account for testing. |
| `escapeLike` breaks existing search results | Low | Low | The function only escapes `%`, `_`, `\` — normal text is unchanged. Search for "hello" still works. Only wildcard characters are affected. |
| PostgreSQL error code `23505` not caught correctly | Medium | Low | Drizzle wraps PostgreSQL errors. The error object has a `code` property. Test by attempting to create a duplicate category manually. |

---

## 8. Related Documentation

- **`code-review-report.md`** — Source of all 6 blocker issues (items #1-#6)
- **PRD.md** §19 — Security Requirements: auth/session security, authorization, input safety
- **PRD.md** §16 — Search, Filtering, and Query Performance: MVP search strategy
- **PRD.md** §10.4 — Auth UX Flows: password reset, email verification
- **PRD.md** §17.1 — Next.js 16: `proxy.ts` conventions
- **PRD.md** §17.2 — Better Auth: Drizzle adapter, rate limiting
- **coding-standards.md** — TypeScript, validation, error handling conventions
- **Better Auth rate limiting docs** — https://better-auth.com/docs/concepts/rate-limit
- **Upstash rate limiting docs** — https://upstash.com/docs/redis/sdks/ts/ratelimit
- **PostgreSQL error codes** — https://www.postgresql.org/docs/current/errcodes-appendix.html (23505 = unique_violation)

---

## 9. Definition of Done

### Files Created
- [ ] `lib/utils/escape-like.ts` — LIKE wildcard escape utility
- [ ] `lib/utils/__tests__/escape-like.test.ts` — Unit tests for escapeLike
- [ ] `lib/rate-limit.ts` — Upstash rate limiter configuration

### Files Modified
- [ ] `lib/data/task.ts` — Applied `escapeLike` to search
- [ ] `lib/actions/auth.ts` — Sanitized error messages + per-email rate limit
- [ ] `lib/actions/category.ts` — Handle unique violation errors
- [ ] `lib/auth/auth.ts` — Added Better Auth rateLimit config
- [ ] `lib/db/schema.ts` — Added uniqueIndex to categories
- [ ] `scripts/seed.ts` — Uses `SEED_USER_ID` env var
- [ ] `proxy.ts` — Fixed AUTH_PATHS + integrated Upstash rate limiting
- [ ] `.env.example` — Added `SEED_USER_ID`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

### Quality Gates
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (all existing tests still pass)
- [ ] New `escapeLike` tests pass
- [ ] Migration generated and applied
- [ ] Search for `%` returns only tasks with literal `%` (not all tasks)
- [ ] No `error.message` returned to client in any auth action
- [ ] Seed script fails gracefully without `SEED_USER_ID`
- [ ] Duplicate category creation blocked at database level
- [ ] Authenticated user redirected from `/verify-email` and `/reset-password`
- [ ] Better Auth rate limiting active on `/api/auth/*`
- [ ] Upstash rate limiting active in `proxy.ts` (or pass-through in dev)
- [ ] Forgot password limited to 3 requests per email per hour

---

**Next Steps:**
1. Load this feature using the `feature` skill: `"Use the feature skill to start P4-F1"`
2. Create branch `feature/P4-F1-security-review-blockers`
3. Implement in the order listed above
4. Build, lint, and test after each logical group
5. Commit after verification
