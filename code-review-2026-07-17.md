# 🔍 Code Review Report — TaskFlow

**Project**: TaskFlow — Task management web application
**Stack**: Next.js 16 App Router · React 19 · Tailwind CSS v4 · shadcn/ui · Neon PostgreSQL · Drizzle ORM · Better Auth · Resend · Upstash Ratelimit · Zod v4
**Date**: 2026-07-17
**Scope**: `proxy.ts`, `lib/auth/*`, `lib/actions/*`, `lib/data/*`, `lib/db/*`, `lib/validation/*`, `lib/utils/*`, `lib/email/*`, `app/**`, key `components/**`, test suite, configs
**Supersedes**: `code-review-report.md` (2026-04-29) — kept for history

---

## ⚠️ Verification Status

Tests and build could **not** be executed during this review: `node_modules` is in a broken state (`node_modules/vitest` and `node_modules/next` are missing while `.bin` shims remain — likely an interrupted install). `git status` also shows unstaged deletions. **Run `npm ci` before acting on this report.** All findings below are from static analysis.

---

## 📊 Overall Assessment

Well-architected codebase: consistent userId scoping on queries, parameterized SQL throughout, correct LIKE escaping, layered rate limiting, sanitized error handling, and DB indexes that match query patterns. Six issues qualify as blockers (five correctness bugs, one IDOR-class security issue), plus a set of worthwhile improvements.

| Dimension | Rating | Summary |
|---|---|---|
| 🟡 Correctness | Needs Work | Dashboard excludes `in_progress`; description can't be cleared; due-date timezone handling broken |
| 🟡 Security | Good, one gap | Category-ownership IDOR; otherwise solid (scoping, escaping, rate limits, anti-enumeration) |
| ✅ Maintainability | Good | Clean layering, shared Zod schemas, consistent action pattern |
| 🟡 Performance | Fair | N+1 analytics loops on dashboard (22+ sequential round trips) |
| 🟡 Testing | Fair | 259 tests, but userId-scoping invariant is unasserted; no integration tests |

### Fixed since the 2026-04-29 report ✅

- Search `ilike` pattern injection → now escaped via `lib/utils/escape-like.ts`
- No rate limiting → Upstash limiters in `proxy.ts` + auth actions
- Error message leakage → `handleActionError` sanitizes all client-facing errors
- Test count 243 → 259

---

## 🔴 Blockers (Must Fix)

### 1. Dashboard stats silently ignore `in_progress` tasks

**Files**: `lib/data/dashboard.ts:139-142, 162, 184, 331, 347`

Every dashboard query filters `status = 'todo'` only: `dueToday`, `overdue`, `totalActive`, `priorityDistribution`, `upcomingTasks`, and `getCategoryBreakdown`.

**Why:** A user who moves all tasks to "In Progress" gets `totalActive = 0` → dashboard renders the empty state and all charts show zero. `getTasks`' overdue filter (`lib/data/task.ts:98`) correctly includes both `todo` and `in_progress`, so the dashboard is also internally inconsistent.

**Suggestion:** define "active" once and reuse it:

```ts
const ACTIVE_STATUSES = ["todo", "in_progress"] as const;
// ...where: inArray(tasks.status, ACTIVE_STATUSES)
```

---

### 2. Users cannot clear a task description — server rejects it

**Chain**: `components/tasks/inline-edit.tsx:220` → `components/tasks/task-detail-view.tsx:90` → `lib/actions/task.ts:19`

Inline edit sends `{ description: null }` when cleared, but `createTaskSchema.description` is `z.string().optional()` — **not nullable**. Zod throws → user sees "Invalid input."

**Suggestion:**

```ts
// lib/validation/task.ts
description: z.string().max(2000).nullable().optional(),
```

then normalize `""`/`null` → `null` server-side, same as `dueDate`/`categoryId`.

---

### 3. Due dates are timezone-broken for non-UTC users

**Files**: `lib/actions/task.ts:24,49` · `components/tasks/task-form.tsx:89` · `components/tasks/inline-edit.tsx:549-555`

Three layers disagree:

- Server parses `datetime-local` strings with `new Date(str)` → **server-local** time (UTC on Vercel); the user's timezone preference is never consulted on the write path.
- `task-form.tsx` displays existing dates via `toISOString().slice(0,16)` → **UTC** wall time.
- `inline-edit.tsx` shifts by `getTimezoneOffset()` → **browser-local** wall time.

The two editors show *different times for the same task*, and picked times shift by the user's offset on save.

**Suggestion:** treat `datetime-local` as wall time in the user's timezone; convert with `fromZonedTime(str, timezone)` (action can read the pref from `user_preferences`), and render through one shared helper. Pin with tests.

---

### 4. Schema uses `timestamp` (without time zone)

**File**: `lib/db/schema.ts` — all `timestamp(...)` columns (`dueDate`, `completedAt`, `createdAt`, session expiry, etc.)

**Why:** Naive timestamps + JS `Date` round-trips depend on driver parsing config and are half the cause of bug #3.

**Suggestion:** migrate to `timestamp(..., { withTimezone: true })` (`timestamptz`). Low-risk migration, durable fix.

---

### 5. IDOR: `categoryId` ownership never validated on task create/update

**File**: `lib/actions/task.ts:25, 50`

Any category UUID is accepted; the FK only checks existence. A user can attach **another user's category** to their task; `getTasks` runs `with: { category: true }`, leaking the victim category's name/color. Also corrupts integrity (victim deleting the category silently unlinks the attacker's task).

**Suggestion:** when `categoryId` is provided, verify ownership before write:

```ts
if (validated.categoryId) {
  const owned = await db.query.categories.findFirst({
    where: and(eq(categories.id, validated.categoryId), eq(categories.userId, userId)),
    columns: { id: true },
  });
  if (!owned) return { success: false, error: "Invalid category" };
}
```

---

### 6. `updateTaskAction` wipes `dueDate`/`categoryId` on partial updates

**File**: `lib/actions/task.ts:49-50`

```ts
dueDate: data.dueDate ? new Date(data.dueDate) : null,
categoryId: data.categoryId || null,
```

Both fields are optional in the schema, but when omitted they are force-set to `null`. Latent today (the UI merges the full task before calling), but the action contract is unsafe — the test suite itself calls it with `{ id, title }` and asserts success. The next partial caller will silently delete due dates.

**Suggestion:** make `updateTaskSchema` a true `.partial()`; pass only present keys to `.set()`; use explicit `null` (vs `undefined`) as the "clear" signal.

---

## 🟡 Suggestions (Should Fix)

### 7. N+1 analytics queries on the dashboard
`getCompletionTrend` runs **14 sequential** `COUNT` queries (`dashboard.ts:269-301`); `getWeeklyVelocity` runs **8 more** (`384-410`). Over Neon HTTP, each round trip adds latency. Replace both loops with a single `GROUP BY date_trunc('day'|'week', completed_at)` query (optionally over `generate_series`).

### 8. Expired/revoked session → "Something went wrong" instead of sign-in redirect
`requireAuth()` (`lib/auth/session.ts:20-26`) throws in `(app)/layout.tsx:11`, landing in the generic error boundary. The `if (!user) redirect(...)` guards in `dashboard/page.tsx:20` and `tasks/page.tsx:18` are **dead code** (`requireAuth` throws first). Have `requireAuth` call `redirect("/sign-in")` itself, or handle null in the layout.

### 9. Timezone string is not validated
`lib/validation/settings.ts:50`: `z.string().min(1)`. Storing an invalid tz makes `date-fns-tz` throw `RangeError` on dashboard/tasks pages. Validate against `Intl.supportedValuesOf("timeZone")` or `lib/utils/timezones.ts`.

### 10. Rate limiting fails open; `updatePasswordAction` unprotected
`lib/rate-limit.ts:46-56` — missing Upstash creds → console warning + no-op limiters. In production that silently removes brute-force protection; fail closed at boot when `NODE_ENV === "production"`. Also add `authLimiter` to `updatePasswordAction` (currently password-guessable at general-limiter speed).

### 11. Two preferences are write-only
`defaultTaskSort` is never read (tasks page always defaults `dueDate`/`asc` — `task-list-loader.tsx:18-19`); `dateFormat` is only used in the settings preview, never in date rendering. Wire them up or remove them from the UI.

### 12. Archived tasks appear in the default `/tasks` list
`getTasks` with no status filter returns `archived` and `done` too. Confirm against PRD; typically archived should be hidden unless explicitly filtered.

### 13. Test gap: userId scoping is not asserted
`lib/actions/__tests__/task.test.ts:35-48` mocks schema columns as plain strings (`tasks: { id: "id", ... }`), so `eq()` args are uninspectable. Removing `eq(tasks.userId, userId)` from any action would fail **zero** tests. Add at least one integration test (real or container DB) proving cross-user reads/writes return nothing. Also add regression tests for blockers #2 and #6.

### 14. Dead UI controls
Top-bar search input has no handler (`top-bar.tsx:93-98`); notification bell does nothing; `useTaskKeyboardShortcuts` is never imported; Google sign-in is a toast stub. Remove or hide until implemented.

### 15. `auth-client.ts:4` hardcodes `NEXT_PUBLIC_APP_URL`
Breaks auth calls on preview deployments (browser hits the production origin). Omit `baseURL` to default to same-origin.

### 16. Email send failures are swallowed
`lib/auth/auth.ts:38-49, 56-67` catch and continue → users told "check your inbox" when nothing was sent. Pipe failures to monitoring at minimum; consider surfacing failure for password reset.

### 17. Sign-in ignores the proxy's `callbackUrl`
`proxy.ts:94` sets it; `sign-in-form.tsx:46` always pushes `/dashboard`. Deep links (e.g., a bookmarked task) are lost after login.

---

## 💭 Nits

- `revalidateTag(tag, { expire: 0 })` is correct (verified against Next 16 source: `expire: 0` = immediate expiry), but `updateTag(tag)` is the idiomatic Server Action API for read-your-own-writes.
- `toggleTaskCompletionAction` is read-then-write (benign race for single-user); could be one atomic `UPDATE ... SET status = CASE ...`.
- Settings page performs a DB **write** (`upsertUserPreferences`) during RSC render — move to an action or sign-up flow.
- `lib/db/schema.ts:83` `rateLimit` table is unused (Upstash replaced it) — dead schema.
- `getTasks` has no `limit`/pagination — plan for it as usage grows.
- `getSession()` converts all errors (incl. transient DB blips) into "logged out."
- `next.config.ts`: prune dev-only `allowedOrigins: ["*.app.github.dev"]` before production.
- `getCompletionTrend`/`getWeeklyVelocity` compute day/week buckets with server-local `setDate` arithmetic — drifts ~1h across DST boundaries for non-UTC users.

---

## ✅ What's Genuinely Good

- `handleActionError` never returns raw errors; Zod issues logged server-side only — textbook.
- Anti-enumeration done right: `forgotPasswordAction` returns success on all error paths + per-email limiter.
- Category duplicate-name handled twice: pre-check **and** `23505` race fallback.
- Index design matches access patterns (`(userId, status|dueDate|priority|categoryId)`).
- No XSS surface: no `dangerouslySetInnerHTML` with user data; react-email escapes interpolations.
- Server/client validation share Zod schemas; `searchParams` validated with `safeParse` before use.
- `revalidateTag(..., { expire: 0 })` per-user cache tags — correct read-your-own-writes invalidation.
- `proxy.ts` comment documenting the `"/"` prefix-match bug shows real debugging rigor.

---

## 🗂 Recommended Order of Attack

1. **`npm ci`** — fix the broken install; verify `npm test` and `npm run build` green.
2. **#1 + #2** — dashboard active-status and description-clearing fixes (small, high user impact).
3. **#3 + #4 + #6** — one "task date/update correctness" PR (same lines of code).
4. **#5** — category ownership check (one query, closes the IDOR).
5. **#7 + #13** — dashboard query consolidation + userId-scoping regression tests.
