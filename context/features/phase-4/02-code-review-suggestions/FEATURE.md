# Feature Specification: P4-F2 — Code Review Suggestions

**Phase:** 4 — Hardening  
**Feature ID:** P4-F2  
**Feature Name:** Code Review — Fix All Suggestion Issues (#7-#21)  
**Status:** Draft — Ready for Implementation  
**Date:** 2026-04-30  

---

## 1. Goals

### Primary Goal
Fix all 15 suggestion-level issues identified in the code review report (`code-review-report.md`) to improve performance, correctness, maintainability, and type safety across the TaskFlow application.

### Secondary Goals
- Consolidate dashboard queries to reduce database round trips
- Eliminate race conditions in preferences upsert and settings updates
- Remove duplicated types and unused imports
- Fix React hook anti-patterns
- Add `skipProxyUrlNormalize` to Next.js config
- Improve test type safety

### Success Metrics
- [ ] Zero suggestion issues remain in code review
- [ ] Build passes (`npm run build`)
- [ ] Lint passes (`npm run lint`) — zero warnings
- [ ] All existing tests still pass (`npm run test`)
- [ ] Dashboard loads with ≤2 database queries (down from 6)
- [ ] No ESLint warnings remain
- [ ] `ActionResult` type defined in single location

---

## 2. Scope

### In Scope

#### Suggestion #7: Dashboard N+1 Query Pattern
Combine the 4 stat count queries (dueToday, overdue, completedToday, totalActive) into a single query using `CASE` conditional aggregation.

#### Suggestion #8: Fetching All Dashboard Data for Timezone
Create a lightweight `getUserTimezone(userId)` function that queries only `userPreferences` instead of calling `getDashboardData()` (which runs 6 queries).

#### Suggestion #9: Redundant revalidatePath Calls
Remove all `revalidatePath` calls from server actions since `revalidateTag` with `"max"` already invalidates all cached responses with that tag.

#### Suggestion #10: Preferences Upsert Race Condition
Replace the read-then-write pattern in `upsertUserPreferences` with Drizzle's `onConflictDoUpdate`.

#### Suggestion #11: Double User Name Update
Remove the redundant direct Drizzle update in `updateProfileAction` — rely solely on Better Auth's `updateUser` API.

#### Suggestion #12: Email Enumeration Bypass
Remove the explicit email existence check in `signUpAction` that bypasses Better Auth's email enumeration protection. Return a generic message regardless.

#### Suggestion #13: Silent Email Send Failures
Change email sending from `void` + `.catch()` to `await` in auth.ts email callbacks, so failures are surfaced.

#### Suggestion #14: Duplicated ActionResult Type
Extract the `ActionResult` interface to `lib/actions/types.ts` and import it in all 4 action files.

#### Suggestion #15: Unused Import in db/index.ts
Remove unused `neonConfig` import from `lib/db/index.ts`.

#### Suggestion #16: Unused Imports Across Components
Clean up unused imports in 7 component files.

#### Suggestion #17: Missing skipProxyUrlNormalize Config
Add `skipProxyUrlNormalize: true` to `next.config.ts`.

#### Suggestion #18: `any` Types in Test Files
Replace `any` types with proper typed mocks in test files and seed script.

#### Suggestion #20: setState in useEffect
Fix `setState` called synchronously in `useEffect` in reset-password-form.tsx and verify-email-handler.tsx.

#### Suggestion #21: Ref Updated During Render
Fix ref assignment during render in `task-filters.tsx`.

### Out of Scope
- Suggestion #19: No integration/E2E tests (deferred to a dedicated E2E testing feature)
- Nits (#22-#27): Design system page, `<img>` vs `<Image>`, double casts, auth table ID types, task-form schema duplication, timezone list — all deferred to future cleanup

---

## 3. Requirements

### 3.1 Functional Requirements

#### REQ-001: Consolidate Dashboard Stat Queries
**Priority:** P1  
**Description:** Combine the 4 separate count queries in `lib/data/dashboard.ts` into a single query using `CASE` conditional aggregation.

**Current State (6 queries):**
```ts
// 4 separate count queries + 1 priority query + 1 upcoming tasks query
const dueToday = await db.select({ count: count() }).from(tasks).where(...);
const overdue = await db.select({ count: count() }).from(tasks).where(...);
const completedToday = await db.select({ count: count() }).from(tasks).where(...);
const totalActive = await db.select({ count: count() }).from(tasks).where(...);
const priorityDistribution = await db.select(...).from(tasks).where(...);
const upcomingTasks = await db.select(...).from(tasks).where(...);
```

**Target State (3 queries):**
```ts
// Single query for all 4 stats
const [stats] = await db
  .select({
    dueToday: sum(sql`CASE WHEN status = 'pending' AND due_date >= $1 AND due_date < $2 THEN 1 ELSE 0 END`),
    overdue: sum(sql`CASE WHEN status = 'pending' AND due_date < $1 THEN 1 ELSE 0 END`),
    completedToday: sum(sql`CASE WHEN status = 'completed' AND completed_at >= $1 AND completed_at < $2 THEN 1 ELSE 0 END`),
    totalActive: sum(sql`CASE WHEN status != 'archived' THEN 1 ELSE 0 END`),
  })
  .from(tasks)
  .where(eq(tasks.userId, userId));
```

**Acceptance Criteria:**
- [ ] 4 count queries replaced with 1 conditional aggregation query
- [ ] Total dashboard queries reduced from 6 to 3
- [ ] Stats values match previous implementation (no regression)
- [ ] `use cache` directive and cache tags preserved
- [ ] Timezone-aware date boundaries still correct

#### REQ-002: Create Lightweight getUserTimezone Function
**Priority:** P1  
**Description:** Create a dedicated `getUserTimezone(userId)` function that queries only `userPreferences` instead of calling `getDashboardData()`.

**Implementation:**
```ts
// lib/data/preferences.ts (or new lib/data/user.ts)
export async function getUserTimezone(userId: string): Promise<string> {
  "use cache";
  cacheTag(`user:${userId}:preferences`);
  cacheLife("hours");

  const prefs = await getUserPreferences(userId);
  return prefs?.timezone ?? "UTC";
}
```

**Acceptance Criteria:**
- [ ] `getUserTimezone` function created
- [ ] `app/(app)/tasks/page.tsx` uses `getUserTimezone` instead of `getDashboardData`
- [ ] Tasks page no longer triggers 6 dashboard queries
- [ ] Timezone still correctly resolved for task grouping

#### REQ-003: Remove Redundant revalidatePath Calls
**Priority:** P1  
**Description:** Remove all `revalidatePath` calls from server actions since `revalidateTag` already handles invalidation.

**Files to modify:**
- `lib/actions/auth.ts`
- `lib/actions/task.ts`
- `lib/actions/category.ts`
- `lib/actions/settings.ts`

**Acceptance Criteria:**
- [ ] All `revalidatePath` imports removed from action files
- [ ] All `revalidatePath(...)` calls removed from action files
- [ ] `revalidateTag` calls retained (they handle all invalidation)
- [ ] Cache invalidation still works after mutations (no stale data)

#### REQ-004: Fix Preferences Upsert Race Condition
**Priority:** P1  
**Description:** Replace the read-then-write pattern in `upsertUserPreferences` with Drizzle's `onConflictDoUpdate`.

**Current State:**
```ts
const existing = await getUserPreferences(userId);
if (existing) {
  await db.update(userPreferences).set({...}).where(eq(userPreferences.userId, userId));
} else {
  await db.insert(userPreferences).values({ userId, ... });
}
```

**Target State:**
```ts
await db
  .insert(userPreferences)
  .values({ userId, ...data, createdAt: new Date(), updatedAt: new Date() })
  .onConflictDoUpdate({
    target: userPreferences.userId,
    set: { ...data, updatedAt: new Date() },
  });
```

**Acceptance Criteria:**
- [ ] `upsertUserPreferences` uses `onConflictDoUpdate`
- [ ] No more read-then-write pattern
- [ ] Concurrent calls don't cause unique constraint violations
- [ ] `createdAt` is only set on initial insert (not on update)
- [ ] `updatedAt` is set on both insert and update

#### REQ-005: Remove Double User Name Update
**Priority:** P1  
**Description:** Remove the redundant direct Drizzle update in `updateProfileAction`.

**Current State:**
```ts
await auth.api.updateUser({ headers: await headers(), body: { name: validated.name } });
await db.update(users).set({ name: validated.name, updatedAt: new Date() }).where(eq(users.id, userId));
```

**Target State:**
```ts
await auth.api.updateUser({ headers: await headers(), body: { name: validated.name } });
// Better Auth already updates the users table — no need for direct Drizzle update
```

**Acceptance Criteria:**
- [ ] Direct Drizzle `users.update()` call removed from `updateProfileAction`
- [ ] User name still updates correctly via Better Auth
- [ ] Session cache invalidated via `revalidateTag` (already done)
- [ ] No regression in profile update behavior

#### REQ-006: Fix Email Enumeration in signUpAction
**Priority:** P1  
**Description:** Remove the explicit email existence check in `signUpAction` that bypasses Better Auth's email enumeration protection.

**Current State:**
```ts
// Check if user already exists (bypasses Better Auth enumeration protection for UX)
const existingUser = await db.query.users.findFirst({
  where: eq(users.email, validated.email.toLowerCase()),
});
if (existingUser) {
  return { success: false, error: "An account with this email already exists..." };
}
```

**Target State:**
```ts
// Let Better Auth handle email existence — prevents enumeration attacks
// Returns generic message on all failures
```

**Acceptance Criteria:**
- [ ] Explicit `users.findFirst()` check removed from `signUpAction`
- [ ] Sign-up flow relies on Better Auth's built-in email handling
- [ ] Error message on duplicate email is generic (no enumeration)
- [ ] Existing sign-up tests updated to reflect new behavior
- [ ] Sign-up still works for new users

#### REQ-007: Await Email Sending in Auth Callbacks
**Priority:** P1  
**Description:** Change email sending from `void` + `.catch()` to `await` in `lib/auth/auth.ts` email callbacks.

**Current State:**
```ts
void sendPasswordResetEmail({ ... }).catch((error) => {
  console.error("Failed to send password reset email:", error);
});
```

**Target State:**
```ts
try {
  await sendPasswordResetEmail({ ... });
} catch (error) {
  console.error("Failed to send password reset email:", error);
  // Continue — don't block auth flow on email failure
}
```

**Acceptance Criteria:**
- [ ] `sendPasswordResetEmail` awaited in Better Auth email callback
- [ ] `sendVerificationEmail` awaited in Better Auth email callback
- [ ] Errors caught and logged but don't block auth flow
- [ ] No `void` + `.catch()` pattern remains in auth.ts

#### REQ-008: Extract ActionResult Type
**Priority:** P1  
**Description:** Extract the `ActionResult` interface to `lib/actions/types.ts` and import it in all 4 action files.

**Implementation:**
```ts
// lib/actions/types.ts
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

**Acceptance Criteria:**
- [ ] `lib/actions/types.ts` created with `ActionResult` interface
- [ ] `lib/actions/auth.ts` imports from `types.ts` (local definition removed)
- [ ] `lib/actions/task.ts` imports from `types.ts` (local definition removed)
- [ ] `lib/actions/category.ts` imports from `types.ts` (local definition removed)
- [ ] `lib/actions/settings.ts` imports from `types.ts` (local definition removed)
- [ ] No change to runtime behavior

#### REQ-009: Clean Up Unused Imports
**Priority:** P2  
**Description:** Remove all unused imports identified by ESLint.

**Files:**
| File | Unused Import(s) |
|------|-----------------|
| `lib/db/index.ts` | `neonConfig` |
| `components/auth/reset-password-form.tsx` | `ResetPasswordInput` |
| `components/auth/sign-up-form.tsx` | `SignUpInput` |
| `components/auth/verify-email-handler.tsx` | `verifyEmailSchema`, `VerifyEmailInput` |
| `components/layout/sidebar.tsx` | `SidebarTrigger` |
| `components/settings/appearance-form.tsx` | `Button` |
| `components/settings/preferences-form.tsx` | `useState`, `dateFormatValues`, `defaultSortValues` |
| `components/settings/profile-form.tsx` | `useState` |

**Acceptance Criteria:**
- [ ] All unused imports removed
- [ ] `npm run lint` reports zero unused import warnings
- [ ] No runtime regressions

#### REQ-010: Add skipProxyUrlNormalize to next.config.ts
**Priority:** P1  
**Description:** Add `skipProxyUrlNormalize: true` to `next.config.ts` per Next.js 16 conventions.

**Acceptance Criteria:**
- [ ] `skipProxyUrlNormalize: true` added to `next.config.ts`
- [ ] Dev server starts without warnings
- [ ] All routes still work correctly
- [ ] Proxy behavior unchanged

#### REQ-011: Fix any Types in Test Files
**Priority:** P2  
**Description:** Replace `any` types with proper typed mocks in test files and seed script.

**Files:**
- `lib/actions/__tests__/auth.test.ts` (11 occurrences)
- `scripts/seed.ts` (2 occurrences)

**Acceptance Criteria:**
- [ ] All `any` types replaced with proper interfaces or `Record<string, unknown>`
- [ ] ESLint `no-explicit-any` rule passes
- [ ] Tests still pass

#### REQ-012: Fix setState in useEffect
**Priority:** P2  
**Description:** Fix `setState` called synchronously in `useEffect` in two components.

**Files:**
- `components/auth/reset-password-form.tsx`, line 60
- `components/auth/verify-email-handler.tsx`, lines 58-59

**Acceptance Criteria:**
- [ ] ESLint `react-hooks/set-state-in-effect` rule passes
- [ ] Component behavior unchanged
- [ ] No infinite render loops introduced

#### REQ-013: Fix Ref Updated During Render
**Priority:** P2  
**Description:** Fix ref assignment during render in `task-filters.tsx`.

**Current State:**
```ts
const searchParamsRef = useRef(searchParams);
searchParamsRef.current = searchParams; // ← updating ref during render
```

**Target State:**
```ts
const searchParamsRef = useRef(searchParams);
useEffect(() => {
  searchParamsRef.current = searchParams;
}, [searchParams]);
```

**Acceptance Criteria:**
- [ ] ESLint `react-hooks/refs` rule passes
- [ ] Search debounce behavior unchanged
- [ ] No stale ref values

---

## 4. File Structure

### Files Created
```
lib/actions/
└── types.ts                      ← NEW: Shared ActionResult type
```

### Files Modified
```
lib/data/
├── dashboard.ts                  ← UPDATE: Consolidate stat queries (#7)
├── preferences.ts                ← UPDATE: onConflictDoUpdate (#10)

lib/actions/
├── auth.ts                       ← UPDATE: Remove revalidatePath (#9), email enumeration (#12), await emails (#13), extract type (#14)
├── task.ts                       ← UPDATE: Remove revalidatePath (#9)
├── category.ts                   ← UPDATE: Remove revalidatePath (#9), extract type (#14)
└── settings.ts                   ← UPDATE: Remove revalidatePath (#9), double update (#11), extract type (#14)

lib/auth/
└── auth.ts                       ← UPDATE: Await email sending (#13)

app/(app)/tasks/
└── page.tsx                      ← UPDATE: Use getUserTimezone (#8)

components/auth/
├── reset-password-form.tsx       ← UPDATE: Remove unused imports (#16), fix setState (#20)
├── sign-up-form.tsx              ← UPDATE: Remove unused imports (#16)
└── verify-email-handler.tsx      ← UPDATE: Remove unused imports (#16), fix setState (#20)

components/layout/
└── sidebar.tsx                   ← UPDATE: Remove unused imports (#16)

components/settings/
├── appearance-form.tsx           ← UPDATE: Remove unused imports (#16)
├── preferences-form.tsx          ← UPDATE: Remove unused imports (#16)
└── profile-form.tsx              ← UPDATE: Remove unused imports (#16)

components/tasks/
└── task-filters.tsx              ← UPDATE: Fix ref during render (#21)

lib/db/
└── index.ts                      ← UPDATE: Remove unused import (#15)

lib/actions/__tests__/
└── auth.test.ts                  ← UPDATE: Fix any types (#18)

scripts/
└── seed.ts                       ← UPDATE: Fix any types (#18)

next.config.ts                    ← UPDATE: Add skipProxyUrlNormalize (#17)
```

### Files Deleted
- (none)

---

## 5. Acceptance Criteria Summary

### Performance Criteria

| Issue | Criteria | Status |
|-------|----------|--------|
| #7 Dashboard queries | Stats consolidated into 1 query (6→3 total) | ☐ |
| #8 Timezone fetch | Tasks page uses lightweight getUserTimezone | ☐ |
| #9 Redundant invalidation | No revalidatePath calls in actions | ☐ |

### Correctness Criteria

| Issue | Criteria | Status |
|-------|----------|--------|
| #10 Preferences race | Uses onConflictDoUpdate | ☐ |
| #11 Double update | Only Better Auth updates users table | ☐ |
| #12 Email enumeration | No explicit email check in signUpAction | ☐ |
| #13 Email failures | Emails awaited with try/catch | ☐ |
| #20 setState in effect | No setState in useEffect | ☐ |
| #21 Ref during render | Ref updated in useEffect | ☐ |

### Maintainability Criteria

| Issue | Criteria | Status |
|-------|----------|--------|
| #14 Duplicated type | ActionResult in single file | ☐ |
| #15 Unused db import | neonConfig removed | ☐ |
| #16 Unused component imports | All 7 files cleaned up | ☐ |
| #17 Config | skipProxyUrlNormalize added | ☐ |
| #18 any types | Zero any types in tests/seed | ☐ |

### Quality Gates

- [ ] `npm run build` passes
- [ ] `npm run lint` passes — zero warnings
- [ ] `npm run test` passes (all existing tests still pass)
- [ ] Dashboard stats still display correctly
- [ ] Task page timezone still resolves correctly
- [ ] Profile updates still work
- [ ] Sign-up still works for new users
- [ ] Email sending still works (password reset, verification)

---

## 6. Implementation Order

Follow this order to minimize risk and enable incremental testing:

| Step | File(s) | Priority | Description |
|------|---------|----------|-------------|
| 1 | `lib/actions/types.ts` | P1 | Extract ActionResult type (#14) |
| 2 | All 4 action files | P1 | Import from types.ts, remove local defs (#14) |
| 3 | `lib/db/index.ts` | P2 | Remove unused neonConfig (#15) |
| 4 | 7 component files | P2 | Remove unused imports (#16) |
| 5 | `next.config.ts` | P1 | Add skipProxyUrlNormalize (#17) |
| 6 | `lib/actions/auth.ts` | P1 | Remove revalidatePath (#9) |
| 7 | `lib/actions/task.ts` | P1 | Remove revalidatePath (#9) |
| 8 | `lib/actions/category.ts` | P1 | Remove revalidatePath (#9) |
| 9 | `lib/actions/settings.ts` | P1 | Remove revalidatePath (#9) + double update (#11) |
| 10 | `lib/data/preferences.ts` | P1 | Fix upsert race condition (#10) |
| 11 | `lib/data/dashboard.ts` | P1 | Consolidate stat queries (#7) |
| 12 | `lib/data/preferences.ts` (or new file) | P1 | Create getUserTimezone (#8) |
| 13 | `app/(app)/tasks/page.tsx` | P1 | Use getUserTimezone (#8) |
| 14 | `lib/auth/auth.ts` | P1 | Await email sending (#13) |
| 15 | `lib/actions/auth.ts` | P1 | Remove email enumeration check (#12) |
| 16 | `lib/actions/__tests__/auth.test.ts` | P2 | Fix any types (#18) |
| 17 | `scripts/seed.ts` | P2 | Fix any types (#18) |
| 18 | `components/auth/reset-password-form.tsx` | P2 | Fix setState in useEffect (#20) |
| 19 | `components/auth/verify-email-handler.tsx` | P2 | Fix setState in useEffect (#20) |
| 20 | `components/tasks/task-filters.tsx` | P2 | Fix ref during render (#21) |
| 21 | Build + lint + test | P1 | `npm run build && npm run lint && npm run test` |

---

## 7. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Dashboard CASE aggregation produces wrong counts | High | Medium | Compare results before/after change using same test data. Add console.log temporarily to verify counts match. |
| onConflictDoUpdate doesn't set createdAt correctly | Medium | Low | Ensure createdAt is in the `.values()` but NOT in the `.set:` clause. Test with new and existing preferences. |
| Removing email enumeration breaks sign-up UX | Medium | Low | Better Auth already handles this — it returns a generic error. Update tests to expect the new behavior. |
| Awaiting email sends slows down auth flows | Low | Medium | Use try/catch to continue on failure. The delay is only on success path (email actually sent). |
| skipProxyUrlNormalize changes routing behavior | Medium | Low | Test all routes after adding. If issues arise, remove it — it may not be needed for this specific setup. |
| Dashboard query consolidation breaks caching | Medium | Low | Preserve `use cache`, `cacheTag`, and `cacheLife` directives on the new consolidated query. |
| Fixing setState in useEffect changes component timing | Low | Low | The current behavior likely causes extra renders. The fix should reduce renders, not change visible behavior. |

---

## 8. Related Documentation

- **`code-review-report.md`** — Source of all 15 suggestion issues (items #7-#21)
- **P4-F1 FEATURE.md** — Blocker security fixes (prerequisite — should be merged first)
- **PRD.md** — Full product spec and requirements
- **coding-standards.md** — TypeScript, React, and database conventions
- **Drizzle ORM docs** — `onConflictDoUpdate`: https://orm.drizzle.team/docs/sql-builders#onconflictdoupdate
- **Next.js 16 docs** — `skipProxyUrlNormalize` in `node_modules/next/dist/docs/`

---

## 9. Definition of Done

### Files Created
- [ ] `lib/actions/types.ts` — Shared ActionResult type

### Files Modified
- [ ] `lib/data/dashboard.ts` — Consolidated stat queries (#7)
- [ ] `lib/data/preferences.ts` — getUserTimezone + onConflictDoUpdate (#8, #10)
- [ ] `app/(app)/tasks/page.tsx` — Uses getUserTimezone (#8)
- [ ] `lib/actions/auth.ts` — Removed revalidatePath, email enumeration, await emails, extracted type (#9, #12, #13, #14)
- [ ] `lib/actions/task.ts` — Removed revalidatePath, extracted type (#9, #14)
- [ ] `lib/actions/category.ts` — Removed revalidatePath, extracted type (#9, #14)
- [ ] `lib/actions/settings.ts` — Removed revalidatePath, double update, extracted type (#9, #11, #14)
- [ ] `lib/auth/auth.ts` — Await email sending (#13)
- [ ] `lib/db/index.ts` — Removed unused import (#15)
- [ ] 7 component files — Removed unused imports (#16)
- [ ] `components/tasks/task-filters.tsx` — Fixed ref during render (#21)
- [ ] `next.config.ts` — Added skipProxyUrlNormalize (#17)
- [ ] Test files — Fixed any types (#18)

### Quality Gates
- [ ] `npm run build` passes
- [ ] `npm run lint` passes — zero warnings
- [ ] `npm run test` passes
- [ ] Dashboard displays correct stats
- [ ] Task page filters work with correct timezone
- [ ] Profile updates work
- [ ] Sign-up works for new users
- [ ] Email sending works (password reset, verification)
- [ ] Zero ESLint warnings

---

**Next Steps:**
1. Load this feature using the `feature` skill: `"Use the feature skill to start P4-F2"`
2. Create branch `feature/P4-F2-code-review-suggestions`
3. Implement in the order listed above
4. Build, lint, and test after each logical group
5. Commit after verification
