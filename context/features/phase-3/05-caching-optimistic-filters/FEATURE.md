# Feature Specification: P3-F5 - Caching & Optimistic Filter UI

**Phase:** 3 - Preferences and Polish  
**Feature ID:** P3-F5  
**Feature Name:** Caching & Optimistic Filter UI  
**Status:** Draft - Ready for Implementation  
**Date:** 2026-04-27

---

## 1. Goals

### Primary Goal
Implement Next.js 16 `use cache` directive with user-level cache isolation for all data layer functions, and fix the TaskFilters component to use optimistic UI state so filter changes are reflected instantly without visual flicker.

### Secondary Goals
- Replace coarse `revalidatePath` with granular `revalidateTag` for per-user cache invalidation
- Set cache lifetime to `hours` profile for all cached data
- Ensure browser back/forward buttons work correctly with optimistic filter state
- Remove unnecessary `await connection()` calls from all pages

---

## 2. Scope

### In Scope

#### Caching Infrastructure
1. Enable `cacheComponents` flag in `next.config.ts`
2. Wrap all data layer functions with `'use cache'` + `cacheTag` + `cacheLife('hours')`
3. Replace `revalidatePath` with `revalidateTag` in all server actions

#### Data Layer Caching
1. **`lib/data/task.ts`** — `getTasks`, `getTaskById`, `getTaskCount`, `getCategoriesForUser`
2. **`lib/data/dashboard.ts`** — `getDashboardData`
3. **`lib/data/category.ts`** — `getCategories`, `getCategoryById`, `getCategoryByIdWithTaskCount`, `getCategoriesWithTaskCount`, `getCategoriesForUser`
4. **`lib/data/preferences.ts`** — `getUserPreferences`

#### Server Action Cache Invalidation
1. **`lib/actions/task.ts`** — All 5 actions use `revalidateTag`
2. **`lib/actions/category.ts`** — All 3 actions use `revalidateTag`
3. **`lib/actions/settings.ts`** — Both actions use `revalidateTag`

#### TaskFilters Optimistic UI Fix
1. **`components/tasks/task-filters.tsx`** — Add optimistic state for all filter values
2. **`components/tasks/task-filters.tsx`** — Fix search input not clearing when Reset button pressed or browser back/forward navigated

#### Page Cleanup
1. Remove `await connection()` from all `(app)` pages

### Out of Scope
- `use cache: remote` (Redis/KV) — not needed for MVP scale
- `use cache: private` — not needed (no compliance requirements)
- Cache analytics or monitoring — post-MVP
- Dashboard/task list skeleton transitions during revalidation — handled by stale-while-revalidate

---

## 3. Requirements

### 3.1 Functional Requirements

#### REQ-001: Enable Cache Components
**Priority:** P0  
**Description:** Enable Next.js 16 `use cache` directive

**Acceptance Criteria:**
- [ ] `cacheComponents: true` added to `next.config.ts`
- [ ] Build passes without errors
- [ ] `use cache` directive recognized by TypeScript

#### REQ-002: Task Data Caching
**Priority:** P0  
**Description:** Cache task queries with user-level isolation

**Acceptance Criteria:**
- [ ] `getTasks` wrapped with `'use cache'`, `cacheTag('user-${userId}-tasks')`, `cacheLife('hours')`
- [ ] `getTaskById` wrapped with same pattern
- [ ] `getTaskCount` wrapped with same pattern
- [ ] `getCategoriesForUser` wrapped with `cacheTag('user-${userId}-categories')`
- [ ] Cache key automatically includes `userId` from function arguments
- [ ] Different users get separate cache entries

#### REQ-003: Dashboard Data Caching
**Priority:** P0  
**Description:** Cache dashboard queries with user-level isolation

**Acceptance Criteria:**
- [ ] `getDashboardData` wrapped with `'use cache'`, `cacheTag('user-${userId}-dashboard')`, `cacheLife('hours')`
- [ ] All 4 stat queries, priority distribution, and upcoming tasks cached together
- [ ] Timezone preference included in cache scope

#### REQ-004: Category Data Caching
**Priority:** P0  
**Description:** Cache category queries with user-level isolation

**Acceptance Criteria:**
- [ ] `getCategories` wrapped with `'use cache'`, `cacheTag('user-${userId}-categories')`, `cacheLife('hours')`
- [ ] `getCategoryById` wrapped with same pattern
- [ ] `getCategoryByIdWithTaskCount` wrapped with same pattern
- [ ] `getCategoriesWithTaskCount` wrapped with same pattern
- [ ] `getCategoriesForUser` (in category.ts) wrapped with same pattern

#### REQ-005: Preferences Data Caching
**Priority:** P0  
**Description:** Cache preferences queries with user-level isolation

**Acceptance Criteria:**
- [ ] `getUserPreferences` wrapped with `'use cache'`, `cacheTag('user-${userId}-preferences')`, `cacheLife('hours')`
- [ ] `upsertUserPreferences` NOT cached (mutation function)

#### REQ-006: Task Action Cache Invalidation
**Priority:** P0  
**Description:** Replace `revalidatePath` with `revalidateTag` in task actions

**Acceptance Criteria:**
- [ ] `createTaskAction` calls `revalidateTag('user-${userId}-tasks', 'max')` + `revalidateTag('user-${userId}-dashboard', 'max')`
- [ ] `updateTaskAction` calls same tags + `revalidateTag('user-${userId}-tasks', 'max')` for `/tasks/${id}`
- [ ] `deleteTaskAction` calls same tags
- [ ] `toggleTaskCompletionAction` calls same tags
- [ ] `archiveTaskAction` calls same tags
- [ ] All `revalidatePath` calls removed from this file
- [ ] Only the current user's cache is invalidated (other users unaffected)

#### REQ-007: Category Action Cache Invalidation
**Priority:** P0  
**Description:** Replace `revalidatePath` with `revalidateTag` in category actions

**Acceptance Criteria:**
- [ ] `createCategoryAction` calls `revalidateTag('user-${userId}-categories', 'max')` + `revalidateTag('user-${userId}-tasks', 'max')`
- [ ] `updateCategoryAction` calls same tags
- [ ] `deleteCategoryAction` calls same tags
- [ ] All `revalidatePath` calls removed from this file
- [ ] Tasks tag invalidated because category badges appear in task list

#### REQ-008: Settings Action Cache Invalidation
**Priority:** P0  
**Description:** Replace `revalidatePath` with `revalidateTag` in settings actions

**Acceptance Criteria:**
- [ ] `updateProfileAction` calls `revalidateTag('user-${userId}-preferences', 'max')` + `revalidateTag('user-${userId}-dashboard', 'max')`
- [ ] `updatePreferencesAction` calls `revalidateTag('user-${userId}-preferences', 'max')` + `revalidateTag('user-${userId}-dashboard', 'max')` + `revalidateTag('user-${userId}-tasks', 'max')`
- [ ] All `revalidatePath` calls removed from this file
- [ ] Tasks tag invalidated because timezone affects due date filtering

#### REQ-009: Remove `await connection()`
**Priority:** P0  
**Description:** Remove unnecessary connection calls from pages

**Acceptance Criteria:**
- [ ] `app/(app)/tasks/page.tsx` — `await connection()` removed
- [ ] `app/(app)/dashboard/page.tsx` — `await connection()` removed
- [ ] `app/(app)/categories/page.tsx` — `await connection()` removed
- [ ] `app/(app)/settings/page.tsx` — `await connection()` removed
- [ ] `app/(app)/tasks/[taskId]/page.tsx` — `await connection()` removed
- [ ] Unused `connection` import removed from each file

#### REQ-010: TaskFilters Optimistic UI
**Priority:** P0  
**Description:** Fix filter select flicker by using optimistic local state

**Acceptance Criteria:**
- [ ] Local state for: `optimisticStatus`, `optimisticPriority`, `optimisticCategory`, `optimisticDueDate`, `optimisticSort`, `optimisticOrder`, `optimisticGroupBy`
- [ ] `updateFilter` updates optimistic state **immediately** before calling `router.replace()`
- [ ] `useEffect` syncs optimistic state when `searchParams` changes (handles browser back/forward)
- [ ] All `<Select>` components use optimistic state for `value` prop
- [ ] Mobile view (duplicate Selects) also uses optimistic state
- [ ] No visual flicker when changing any filter
- [ ] Browser back/forward buttons correctly restore filter values

#### REQ-011: Search Input Clearing Fix
**Priority:** P0  
**Description:** Fix search input not clearing when Reset button is pressed or URL `q` param changes externally

**Root Cause:**
The `clearFilters` function calls `router.replace("/tasks")` which clears the URL `q` parameter, but does NOT clear the `searchInput` local state. There is no `useEffect` to sync `searchInput` when `q` changes from external sources (Reset button, browser back/forward).

**Acceptance Criteria:**
- [ ] Add `useEffect` to sync `searchInput` when `q` changes: `useEffect(() => { setSearchInput(q); }, [q]);`
- [ ] Clicking Reset button clears both URL `q` param AND search input text
- [ ] Clicking clear button (X) in search input clears text and URL `q` param (via existing debounce)
- [ ] Browser back/forward buttons correctly restore search input text
- [ ] Mobile search input also synced (shares same `searchInput` state)

---

## 4. Technical Architecture

### 4.1 Cache Tag Strategy

| Data Type | Tag Pattern | Invalidated By |
|-----------|-------------|----------------|
| Tasks | `user-{userId}-tasks` | create/update/delete/toggle/archive task actions |
| Dashboard | `user-{userId}-dashboard` | Task actions, preferences update (timezone) |
| Categories | `user-{userId}-categories` | Category CRUD actions |
| Preferences | `user-{userId}-preferences` | Settings update actions |

### 4.2 Cache Invalidation Flow

```
User creates task →
  revalidateTag('user-A-tasks', 'max')
  revalidateTag('user-A-dashboard', 'max')

User updates category →
  revalidateTag('user-A-categories', 'max')
  revalidateTag('user-A-tasks', 'max')

User changes timezone →
  revalidateTag('user-A-preferences', 'max')
  revalidateTag('user-A-dashboard', 'max')
  revalidateTag('user-A-tasks', 'max')

User B is completely unaffected ✅
```

### 4.3 File Structure

```
next.config.ts                          ← Add cacheComponents: true

lib/data/
├── task.ts                             ← Add 'use cache' + cacheTag + cacheLife
├── dashboard.ts                        ← Add 'use cache' + cacheTag + cacheLife
├── category.ts                         ← Add 'use cache' + cacheTag + cacheLife
└── preferences.ts                      ← Add 'use cache' + cacheTag + cacheLife

lib/actions/
├── task.ts                             ← Replace revalidatePath with revalidateTag
├── category.ts                         ← Replace revalidatePath with revalidateTag
└── settings.ts                         ← Replace revalidatePath with revalidateTag

app/(app)/
├── tasks/page.tsx                      ← Remove await connection()
├── dashboard/page.tsx                  ← Remove await connection()
├── categories/page.tsx                 ← Remove await connection()
├── settings/page.tsx                   ← Remove await connection()
└── tasks/[taskId]/page.tsx             ← Remove await connection()

components/tasks/
└── task-filters.tsx                    ← Add optimistic UI state
```

### 4.4 Data Layer Pattern

```typescript
import { cacheTag, cacheLife } from 'next/cache'

export async function getTasks(
  userId: string,
  options?: GetTasksOptions,
  timezone: string = 'UTC'
) {
  'use cache'
  cacheLife('hours')
  cacheTag(`user-${userId}-tasks`)

  // ... existing query logic unchanged
}
```

### 4.5 Server Action Pattern

```typescript
import { revalidateTag } from 'next/cache'

export async function createTaskAction(input: unknown): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return { success: false, error: 'Unauthorized' }

    // ... existing mutation logic

    // User-specific cache invalidation (stale-while-revalidate)
    revalidateTag(`user-${userId}-tasks`, 'max')
    revalidateTag(`user-${userId}-dashboard`, 'max')
    return { success: true, data: task }
  } catch (error) {
    // ... error handling
  }
}
```

### 4.6 TaskFilters Optimistic State Pattern

```typescript
// 1. Read initial values from URL
const status = searchParams.get("status") || "all"
const priority = searchParams.get("priority") || "all"
// ... other filters
const q = searchParams.get("q") || ""

// 2. Create optimistic state
const [optimisticStatus, setOptimisticStatus] = useState(status)
const [optimisticPriority, setOptimisticPriority] = useState(priority)
// ... other optimistic states

// 3. Search input state with external sync
const [searchInput, setSearchInput] = useState(q)
const debouncedSearch = useDebouncedValue(searchInput, 300)

// Sync search input when URL changes externally (Reset button, back/forward)
useEffect(() => {
  setSearchInput(q)
}, [q])

// 4. Update function: optimistic first, then URL
const updateFilter = useCallback((key: string, value: string) => {
  // Optimistic update (instant)
  if (key === "status") setOptimisticStatus(value)
  if (key === "priority") setOptimisticPriority(value)
  // ... other filters

  // URL update (triggers server re-render)
  const params = new URLSearchParams(searchParams.toString())
  if (value === "all" || value === "none") {
    params.delete(key)
  } else {
    params.set(key, value)
  }
  router.replace(`/tasks?${params.toString()}`)
}, [router, searchParams])

// 5. Sync optimistic state on URL change (back/forward buttons)
useEffect(() => {
  setOptimisticStatus(searchParams.get("status") || "all")
  setOptimisticPriority(searchParams.get("priority") || "all")
  // ... other filters
}, [searchParams])

// 6. Use optimistic state in Select
<Select value={optimisticStatus} onValueChange={(v) => updateFilter("status", v)}>
```

---

## 5. Cache Configuration

### 5.1 `cacheLife('hours')` Profile

The built-in `hours` profile provides:
- **stale**: ~5 minutes (client-side)
- **revalidate**: ~1 hour (server-side)
- **expire**: Never expires by time

This means:
- Users see cached data for up to 1 hour before server revalidates
- Client router enforces minimum 30-second stale time
- On mutation, `revalidateTag(tag, 'max')` marks cache as stale → next visit serves stale while fetching fresh

### 5.2 `revalidateTag(tag, 'max')` Behavior

- Marks the tag entry as **stale** (not expired)
- Next time a page using that tag is visited, it serves **stale content immediately** while fetching fresh data in background
- Fresh data is only fetched when the page is next visited (not preemptively)
- This is the recommended pattern for user-facing applications

---

## 6. Acceptance Criteria Summary

### Caching

| Component | Test Case |
|-----------|-----------|
| Config | `cacheComponents: true` in next.config.ts |
| Tasks | `getTasks` returns cached result on second call |
| Dashboard | `getDashboardData` returns cached result on second call |
| Categories | `getCategories` returns cached result on second call |
| Preferences | `getUserPreferences` returns cached result on second call |
| Task Actions | Creating task invalidates only current user's cache |
| Category Actions | Creating category invalidates only current user's cache |
| Settings Actions | Updating preferences invalidates only current user's cache |
| Pages | No `await connection()` in any (app) page |

### TaskFilters

| Feature | Test Case |
|---------|-----------|
| Status filter | Select changes instantly, no flicker |
| Priority filter | Select changes instantly, no flicker |
| Category filter | Select changes instantly, no flicker |
| Due date filter | Select changes instantly, no flicker |
| Sort field | Select changes instantly, no flicker |
| Sort order | Select changes instantly, no flicker |
| Group by | Select changes instantly, no flicker |
| Search clear (X button) | Clears input text and URL `q` param |
| Search clear (Reset button) | Clears input text, URL `q` param, and all filters |
| Search back/forward | Search input text restores correctly |
| Back button | Filter values restore correctly |
| Forward button | Filter values restore correctly |
| Mobile view | All Selects and search input work without flicker |

---

## 7. Testing Strategy

### Manual Testing Checklist

#### Caching
- [ ] Load `/tasks` page, note response time
- [ ] Refresh page, verify faster response (cached)
- [ ] Create a task, verify it appears immediately
- [ ] Open second browser/incognito, verify different user's cache unaffected
- [ ] Update category, verify task list reflects change
- [ ] Change timezone in settings, verify task dates update

#### TaskFilters
- [ ] Change status filter → select shows new value instantly
- [ ] Change priority filter → select shows new value instantly
- [ ] Change category filter → select shows new value instantly
- [ ] Change due date filter → select shows new value instantly
- [ ] Change sort field → select shows new value instantly
- [ ] Change sort order → select shows new value instantly
- [ ] Change group by → select shows new value instantly
- [ ] Type search query → results filter correctly
- [ ] Click clear (X) in search input → input text clears, URL `q` removed
- [ ] Click Reset button → all filters clear, search input text clears
- [ ] Press browser back button → filter values and search text restore
- [ ] Press browser forward button → filter values and search text restore
- [ ] Test on mobile → all Selects and search input work without flicker

#### Build
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run dev` starts without errors

---

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `use cache` not supported in dev mode | Low | Works in dev with `cacheComponents: true`, may need `NEXT_PRIVATE_DEBUG_CACHE=1` for debugging |
| Stale data after mutation | Low | `revalidateTag(tag, 'max')` ensures stale-while-revalidate; user sees old data for one render |
| Cache memory usage on self-hosted | Medium | `hours` profile limits cache duration; monitor memory in production |
| `searchParams` reference changes cause extra renders | Low | Optimistic state decouples UI from `searchParams` reference changes |
| `await connection()` removal breaks dynamic rendering | Low | `use cache` handles caching; pages are still dynamic due to auth checks |
| Search input desyncs from URL | Medium | `useEffect(() => setSearchInput(q), [q])` ensures sync on external URL changes (Reset, back/forward) |

---

## 9. Related Documentation

- **PRD.md** §6 — Core Features: Task Management, Dashboard, Categories
- **coding-standards.md** — TypeScript, React, Next.js 16 conventions
- **ai-interaction.md** — Workflow for implementation
- **lib/data/task.ts** — Current task data layer (no caching)
- **lib/data/dashboard.ts** — Current dashboard data layer (no caching)
- **lib/data/category.ts** — Current category data layer (no caching)
- **lib/data/preferences.ts** — Current preferences data layer (no caching)
- **lib/actions/task.ts** — Current task actions (uses `revalidatePath`)
- **lib/actions/category.ts** — Current category actions (uses `revalidatePath`)
- **lib/actions/settings.ts** — Current settings actions (uses `revalidatePath`)
- **components/tasks/task-filters.tsx** — Current filter component (no optimistic state)

---

## 10. Definition of Done

- [ ] `cacheComponents: true` enabled in `next.config.ts`
- [ ] All data layer functions wrapped with `'use cache'` + `cacheTag` + `cacheLife('hours')`
- [ ] All server actions use `revalidateTag` instead of `revalidatePath`
- [ ] `await connection()` removed from all (app) pages
- [ ] TaskFilters uses optimistic state for all filter values
- [ ] Search input clears correctly when Reset button pressed, X button clicked, or browser navigates back/forward
- [ ] No visual flicker when changing any filter
- [ ] Browser back/forward buttons work correctly
- [ ] Build passes (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Manual testing checklist complete

---

**Next Steps:**
1. Load this feature using the feature skill
2. Create branch `feature/P3-F5-caching-optimistic-filters`
3. Implement in order: Config → Data layer → Server actions → Pages → TaskFilters → Testing
4. Test thoroughly
5. Build and commit
