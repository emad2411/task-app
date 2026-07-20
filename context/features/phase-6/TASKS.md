# Phase 6: 2026-07-17 Code Review Remediation Task List

**Source:** `code-review-2026-07-17.md`  
**Status:** Planned  
**Created:** 2026-07-18  
**Scope:** All blockers, suggestions, and nits recorded in the review

---

## 1. Required Preflight

- [ ] Run `npm ci` to repair the interrupted dependency installation.
- [ ] Run `npm run test` and record the baseline result.
- [ ] Run `npm run lint -- --max-warnings=0` and record the baseline result.
- [ ] Run `npm run build` and record the baseline result.
- [ ] Separate pre-existing failures from failures introduced by remediation work.
- [ ] Do not modify or restore unrelated deleted/untracked files currently present in the worktree.

---

## 2. Blockers

### P6-F1: Dashboard Active Status Correctness (Issue #1)

- [x] Define the active task statuses once as `todo` and `in_progress`.
- [x] Include both active statuses in Due Today, Overdue, and Total Active metrics.
- [x] Include both active statuses in priority distribution.
- [x] Include both active statuses in upcoming tasks.
- [x] Include both active statuses in categorized and uncategorized category breakdown counts.
- [x] Add regression tests covering every dashboard active-status predicate.
- [x] Verify a user with only `in_progress` tasks does not see the dashboard empty state.

**Plan:** `context/features/phase-6/01-dashboard-active-status/FEATURE.md`

### P6-F2: Clearable Task Descriptions (Issue #2)

- [x] Make task descriptions nullable in the shared task validation schema.
- [x] Normalize both an empty string and `null` to `null` on the server.
- [x] Add action regression tests for clearing an existing description.
- [x] Verify inline description editing can clear and subsequently restore a description.

**Plan:** `context/features/phase-6/02-clearable-task-descriptions/FEATURE.md`

### P6-F3: Task Date and Partial Update Correctness (Issues #3, #4, and #6)

- [x] Establish one wall-time conversion path for `datetime-local` values using the saved user timezone.
- [x] Establish one shared rendering helper for task due dates in both task editors.
- [x] Add timezone regression tests for create, update, and render behavior.
- [x] Migrate persisted timestamps from `timestamp` to `timestamptz` with a reviewed Drizzle migration.
- [x] Verify migration semantics against existing production timestamp data before applying it.
- [x] Change `updateTaskAction` to update only fields present in the request.
- [x] Preserve explicit `null` as the signal to clear `dueDate`, `categoryId`, and `description`.
- [x] Add regression tests proving omitted fields are preserved and explicit nulls clear values.

### P6-F4: Category Ownership Enforcement (Issue #5)

- [x] Validate that a supplied `categoryId` belongs to the authenticated user before task creation.
- [x] Validate that a supplied `categoryId` belongs to the authenticated user before task updates.
- [x] Return a sanitized `Invalid category` result for missing or foreign categories.
- [x] Add cross-user create and update tests that prove foreign category IDs are rejected.
- [x] Verify reads cannot expose another user's category name or color through a task relation.

---

## 3. Suggestions

### P6-F5: Dashboard Query Consolidation (Issue #7)

- [ ] Replace the 14 sequential completion-trend count queries with one grouped query.
- [ ] Replace the 8 sequential weekly-velocity count queries with one grouped query.
- [ ] Preserve zero-filled day and week buckets in application output.
- [ ] Make analytics bucket boundaries respect the user's timezone and DST.
- [ ] Compare query count and returned chart data before and after the change.

### P6-F6: Authentication Session Redirects (Issue #8)

- [ ] Redirect expired or revoked sessions to `/sign-in` from the shared authentication boundary.
- [ ] Preserve the intended destination as a callback URL where applicable.
- [ ] Remove dead page-level null guards made unreachable by `requireAuth()` throwing.
- [ ] Add tests for missing, expired, and valid sessions.

### P6-F7: Timezone Preference Validation (Issue #9)

- [ ] Validate timezone values against the supported application timezone list.
- [ ] Reject invalid values before persistence.
- [ ] Add validation tests for valid IANA zones, invalid zones, and empty values.
- [ ] Verify existing invalid values have a safe fallback or cleanup path.

### P6-F8: Production Rate-Limit Hardening (Issue #10)

- [ ] Fail closed during production startup when required Upstash credentials are absent.
- [ ] Preserve the no-op development fallback when explicitly running outside production.
- [ ] Apply `authLimiter` to `updatePasswordAction`.
- [ ] Add tests for production credential failure and password-update throttling.

### P6-F9: Preference Wiring (Issue #11)

- [ ] Apply `defaultTaskSort` when task-list URL parameters do not provide a sort.
- [ ] Apply `dateFormat` to user-facing task and dashboard date rendering.
- [ ] Preserve explicit URL sort parameters over saved defaults.
- [ ] Add tests for preference defaults and URL overrides.

### P6-F10: Archived Task Visibility (Issue #12)

- [ ] Confirm the intended default behavior against the PRD/product decision.
- [ ] Hide archived tasks from the default `/tasks` query if confirmed.
- [ ] Keep archived tasks accessible through an explicit filter.
- [ ] Add query tests for default and explicit archived filters.

### P6-F11: Authorization Integration Coverage (Issue #13)

- [ ] Add a database-backed test proving one user cannot read another user's tasks.
- [ ] Add a database-backed test proving one user cannot update another user's tasks.
- [ ] Add a database-backed test proving one user cannot delete another user's tasks.
- [ ] Add regression tests for description clearing and partial task updates.
- [ ] Ensure test fixtures and cleanup are deterministic and isolated.

### P6-F12: Dead UI Controls (Issue #14)

- [ ] Remove or hide the nonfunctional top-bar search control.
- [ ] Remove or hide the nonfunctional notification control.
- [ ] Decide whether to wire or remove the unused keyboard shortcut hook.
- [ ] Remove or hide Google sign-in until a real provider flow is configured.
- [ ] Verify no control appears actionable without producing an action.

### P6-F13: Same-Origin Auth Client (Issue #15)

- [ ] Remove the hardcoded `NEXT_PUBLIC_APP_URL` browser auth base URL.
- [ ] Verify auth requests use the current deployment origin.
- [ ] Test local, production, and preview deployment behavior.

### P6-F14: Observable Email Delivery Failures (Issue #16)

- [ ] Route password-reset and verification email failures to application monitoring.
- [ ] Decide whether password-reset delivery failures should return a user-visible failure without enabling account enumeration.
- [ ] Add tests for successful sends and provider failures.

### P6-F15: Sign-In Callback Preservation (Issue #17)

- [ ] Read and validate the proxy-provided `callbackUrl` on the sign-in page.
- [ ] Navigate to the validated callback after successful sign-in.
- [ ] Fall back to `/dashboard` when no safe callback is present.
- [ ] Reject external or malformed callback destinations.
- [ ] Add tests for deep links, fallback behavior, and open-redirect prevention.

---

## 4. Maintenance Nits

### P6-M1: Server Action Cache API

- [ ] Evaluate replacing immediate `revalidateTag(tag, { expire: 0 })` calls with `updateTag(tag)` in Server Actions.
- [ ] Preserve read-your-own-writes behavior and existing cache-tag names.

### P6-M2: Atomic Completion Toggle

- [ ] Replace the read-then-write completion toggle with one atomic conditional update.
- [ ] Preserve `completedAt` behavior for completion and reopening.

### P6-M3: Render-Time Preferences Write

- [ ] Remove `upsertUserPreferences` from the settings Server Component render path.
- [ ] Create preferences during sign-up or through an explicit mutation path.

### P6-M4: Dead Rate-Limit Schema

- [ ] Confirm the Better Auth `rateLimit` table is unused after the Upstash migration.
- [ ] Remove it through a reviewed Drizzle migration if no runtime dependency remains.

### P6-M5: Task Pagination

- [ ] Define the product behavior for pagination or cursor-based loading.
- [ ] Add a bounded default query before task volume becomes unbounded.

### P6-M6: Session Error Classification

- [ ] Distinguish unauthenticated sessions from transient database/auth-provider failures.
- [ ] Avoid converting infrastructure failures into a false logged-out state.

### P6-M7: Production Origin Configuration

- [ ] Remove `*.app.github.dev` from `allowedOrigins` before production unless it remains an explicit deployment requirement.

### P6-M8: DST-Safe Analytics Buckets

- [ ] Replace server-local `setDate` day/week arithmetic with timezone-aware bucket boundaries.
- [ ] Add DST transition tests for non-UTC timezones.

---

## 5. Recommended Delivery Order

| Order | Work Package | Issues | Reason |
|---|---|---|---|
| 0 | Dependency and baseline repair | Preflight | Establish trustworthy test/build evidence before edits. |
| 1 | Dashboard active status | #1 | Small correctness fix with high user impact. |
| 2 | Clearable descriptions | #2 | Small correctness fix with direct UX impact. |
| 3 | Task date and update correctness | #3, #4, #6 | Shared action/schema surface should be changed together. |
| 4 | Category ownership | #5 | Close the IDOR-class authorization gap. |
| 5 | Dashboard performance and auth integration tests | #7, #13 | Consolidate queries and strengthen security regression coverage. |
| 6 | Session, timezone, and rate-limit hardening | #8, #9, #10 | Improve runtime resilience and authentication behavior. |
| 7 | Preferences and task visibility | #11, #12 | Resolve product behavior and wire saved settings. |
| 8 | UI/auth/email polish | #14-#17 | Remove misleading controls and complete deployment/auth flows. |
| 9 | Maintenance cleanup | M1-M8 | Apply focused cleanup after blocker and suggestion work. |

---

## 6. Global Quality Gates

- [ ] Every work package uses a dedicated `fix/...` branch when implementation starts.
- [ ] `context/current-feature.md` is updated before each implementation begins.
- [ ] New correctness and security behavior is test-driven.
- [ ] Every database query remains scoped by authenticated `userId` where applicable.
- [ ] Schema changes use generated and reviewed Drizzle migrations, never `db:push`.
- [ ] `npm run test` passes.
- [ ] `npm run lint -- --max-warnings=0` passes.
- [ ] `npm run build` passes.
- [ ] Browser verification is completed for affected user flows.
- [ ] No commit is created without user permission.
