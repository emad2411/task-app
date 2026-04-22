# Feature Specification: P2-F5 - Task Filters, Sorting, and Grouping

**Phase:** 2 - Core Product  
**Feature ID:** P2-F5  
**Feature Name:** Task Filters, Sorting, and Grouping  
**Status:** Draft - Ready for Implementation  
**Date:** 2026-04-22

---

## 1. Goals

### Primary Goal
Enhance the `/tasks` page with powerful discovery capabilities so users can quickly locate, organize, and prioritize work across large task lists. Build on the existing status, priority, and category filters with text search, due date state filters, sorting controls, and optional grouping.

### Secondary Goals
- Add full-text search across task titles (and optionally descriptions)
- Add due date state filters: today, upcoming, overdue, no due date
- Add multi-option sorting with ascending/descending support
- Add optional task grouping by status, category, or due date bucket
- Preserve all filter/sort state in URL query params for shareability and back-button support
- Update the task data layer to support filter/sort parameters in a type-safe way
- Ensure filtered empty states are informative and provide a clear path to reset filters
- Maintain performance and responsiveness with indexed query paths

---

## 2. Scope

### In Scope

#### Task List Enhancements
1. **`/tasks`** - Enhanced tasks page reading filter state from URL search params
2. **Search input** - Real-time or debounced text search in the task list header
3. **Due date filters** - Filter by `today`, `upcoming`, `overdue`, `no_due_date`
4. **Sort controls** - Dropdown/select for sort field + direction toggle
5. **Group controls** - Toggle/group-by selector for status, category, or due date bucket
6. **Filter chips/pills** - Visual summary of active filters with one-click removal
7. **Clear all filters** - Reset to default view

#### Data Layer Updates
1. **`lib/data/task.ts`** - Update `getTasksForUser` to accept optional filter/sort params
2. **`lib/validation/task.ts`** - Add `taskFilterSchema` and `taskSortSchema` for query param validation

#### Component Updates
1. **`components/tasks/task-filters.tsx`** - Add search, due date, sort, group controls
2. **`components/tasks/task-list.tsx`** - Support grouped rendering mode
3. **`components/tasks/task-group-header.tsx`** - Header for grouped sections
4. **`components/tasks/filter-chips.tsx`** - Active filter summary with remove actions
5. **`app/(app)/tasks/page.tsx`** - Parse search params and pass to data layer

### Out of Scope
- Full-text search with PostgreSQL `tsvector` (MVP+; use `ILIKE` for now)
- Saved/filter presets (post-MVP)
- Advanced date range picker with custom from/to dates (post-MVP)
- Pagination or infinite scroll (post-MVP; assume personal task volumes fit in memory)
- Drag-and-drop reordering within groups (post-MVP)
- Search across archived tasks on dashboard (post-MVP)

---

## 3. Requirements

### 3.1 Functional Requirements

#### REQ-001: Text Search
**Priority:** P0  
**Description:** Allow users to search tasks by title (and optionally description)

**Acceptance Criteria:**
- [ ] Search input visible at the top of the task list
- [ ] Search is case-insensitive
- [ ] Searches task `title` by default; optionally includes `description`
- [ ] Minimum 1 character to trigger search
- [ ] Search term persisted in URL query param `?q=searchterm`
- [ ] Empty search returns all tasks (respecting other filters)
- [ ] Search composes with all other filters (AND logic)
- [ ] Debounced input (300ms) to avoid excessive URL updates or re-renders
- [ ] Clear button (X) appears when search has text

#### REQ-002: Due Date State Filters
**Priority:** P0  
**Description:** Filter tasks by their due date relative to today in the user's timezone

**Acceptance Criteria:**
- [ ] Filter options: `All Dates`, `Due Today`, `Upcoming`, `Overdue`, `No Due Date`
- [ ] `Due Today`: tasks with `dueDate` within the user's current calendar day
- [ ] `Upcoming`: tasks with `dueDate` in the future (after today)
- [ ] `Overdue`: tasks with `dueDate` in the past and status is not `done`
- [ ] `No Due Date`: tasks where `dueDate` is null
- [ ] Timezone-aware comparisons using user's preference (fallback to UTC)
- [ ] Persisted in URL param `?dueDate=today|upcoming|overdue|none`
- [ ] Composes with other filters

#### REQ-003: Sorting
**Priority:** P0  
**Description:** Allow users to change the order of tasks in the list

**Acceptance Criteria:**
- [ ] Sort options dropdown with fields:
  - `Due Date`
  - `Created Date`
  - `Updated Date`
  - `Priority`
  - `Title (A-Z)`
- [ ] Direction toggle: Ascending / Descending
- [ ] Default sort: `Due Date` ascending, then `Priority` descending, then `Created Date` descending
- [ ] Persisted in URL params `?sort=dueDate&order=asc`
- [ ] Sort is client-side URL state; no extra server roundtrip beyond page re-render
- [ ] Null due dates sort to the bottom when sorting by due date ascending
- [ ] Priority order: high > medium > low (when sorting by priority descending)

#### REQ-004: Grouping
**Priority:** P1  
**Description:** Optionally group tasks by a dimension for better scanability

**Acceptance Criteria:**
- [ ] Group-by selector: `None`, `Status`, `Category`, `Due Date`
- [ ] `None`: flat list (current behavior)
- [ ] `Status`: groups are `todo`, `in_progress`, `done`, `archived`
- [ ] `Category`: groups are category names; uncategorized tasks in "Uncategorized"
- [ ] `Due Date`: groups are `Today`, `Upcoming`, `Overdue`, `No Due Date`
- [ ] Each group has a header with group name and task count
- [ ] Groups ordered logically (status workflow, alphabetical categories, chronological dates)
- [ ] Persisted in URL param `?groupBy=status|category|dueDate`
- [ ] Sorting applies within each group

#### REQ-005: Active Filter Summary (Filter Chips)
**Priority:** P1  
**Description:** Show a row of removable chips representing active filters

**Acceptance Criteria:**
- [ ] When any filter is active, a chip row appears below the filter bar
- [ ] Each chip shows the filter label and value (e.g., "Status: Todo", "Search: report")
- [ ] Clicking the X on a chip removes that filter only
- [ ] "Clear all" link removes all filters and resets sort to default
- [ ] Chips are keyboard accessible (Enter/Space to remove)

#### REQ-006: Filtered Empty State
**Priority:** P0  
**Description:** Meaningful message when no tasks match the current filters

**Acceptance Criteria:**
- [ ] If user has tasks but none match filters: "No tasks match your filters"
- [ ] Subtitle: "Try adjusting your search or clearing filters"
- [ ] Prominent "Clear all filters" button
- [ ] Different from the global empty state (which shows for users with zero tasks)

#### REQ-007: URL State Persistence
**Priority:** P0  
**Description:** All filter, sort, and group state lives in the URL

**Acceptance Criteria:**
- [ ] Changing any filter updates the URL with `history.pushState` behavior
- [ ] Refreshing the page restores the same filter state
- [ ] Back/forward navigation works through filter history
- [ ] URL params use clean keys: `status`, `priority`, `category`, `q`, `dueDate`, `sort`, `order`, `groupBy`
- [ ] Invalid URL params are ignored gracefully (don't crash)

### 3.2 Technical Requirements

#### REQ-008: Data Layer Updates
**Priority:** P0  
**Description:** Update task queries to accept filter and sort parameters

**Acceptance Criteria:**
- [ ] `getTasksForUser(userId, options?)` accepts optional `filters` and `sort` objects
- [ ] Filter options typed with `TaskFilterOptions` interface
- [ ] Sort options typed with `TaskSortOptions` interface
- [ ] Uses Drizzle `where` clauses with `and()` composition
- [ ] Uses Drizzle `orderBy` with dynamic column selection
- [ ] Search uses `ilike(tasks.title, `%${query}%`)`
- [ ] Due date filters compare against the start/end of the relevant day in the user's timezone
- [ ] All queries remain scoped by `userId`
- [ ] No N+1 queries introduced by grouping (grouping is UI-layer only)

#### REQ-009: Validation Schemas
**Priority:** P0  
**Description:** Zod v4 schemas for filter/sort URL params

**Acceptance Criteria:**
- [ ] `taskFilterSchema` in `lib/validation/task.ts`
  - `status`: enum of task statuses, optional
  - `priority`: enum of priorities, optional
  - `category`: UUID string, optional
  - `q`: string trimmed, max 100 chars, optional
  - `dueDate`: enum `today|upcoming|overdue|none`, optional
- [ ] `taskSortSchema` in `lib/validation/task.ts`
  - `sort`: enum `dueDate|createdAt|updatedAt|priority|title`, optional
  - `order`: enum `asc|desc`, optional
- [ ] `taskGroupBySchema` in `lib/validation/task.ts`
  - `groupBy`: enum `status|category|dueDate`, optional
- [ ] Invalid param values are stripped/ignored; valid defaults applied

#### REQ-010: Page Architecture
**Priority:** P0  
**Description:** Tasks page reads and applies URL params server-side

**Acceptance Criteria:**
- [ ] `app/(app)/tasks/page.tsx` is an async Server Component
- [ ] Accepts `searchParams` prop from Next.js
- [ ] Parses and validates `searchParams` with Zod schemas
- [ ] Passes validated filters/sort to `getTasksForUser`
- [ ] Passes raw/default params to `TaskFilters` for controlled form state
- [ ] Grouping param passed to `TaskList` for conditional rendering

#### REQ-011: Component Architecture
**Priority:** P0  
**Description:** Clean separation between filter UI and list rendering

**Acceptance Criteria:**
- [ ] `TaskFilters` is a Client Component managing URL updates
- [ ] `TaskList` is a Server Component receiving pre-filtered tasks
- [ ] `TaskGroupHeader` is a Client Component for group section headers
- [ ] `FilterChips` is a Client Component reading current URL to render chips
- [ ] All filter inputs are controlled by URL state (not local React state)

#### REQ-012: Responsive Design
**Priority:** P0  
**Description:** Filter controls usable on all screen sizes

**Acceptance Criteria:**
- [ ] Mobile: filters collapse into a single "Filters" sheet/drawer or a scrollable horizontal bar
- [ ] Mobile: search input is full width above the filter bar
- [ ] Tablet/Desktop: filters displayed in a horizontal toolbar
- [ ] Sort and group selectors are compact (use shadcn Select)
- [ ] Filter chips wrap on small screens

### 3.3 Non-Functional Requirements

#### REQ-013: Performance
- [ ] Debounced search input (300ms)
- [ ] URL updates do not cause full page reload (use Next.js `useRouter` + `replace`)
- [ ] Database query uses indexed columns for all filter fields
- [ ] Grouping is computed in UI from the single fetched task list (no extra DB queries)

#### REQ-014: Security
- [ ] Search input sanitized (Zod trims and limits length)
- [ ] All database queries still scoped by `userId`
- [ ] No SQL injection via search term (Drizzle parameterized queries)

---

## 4. UI Architecture

### 4.1 File Structure

```
app/(app)/
├── tasks/
│   ├── page.tsx                  # TasksPage (Server Component) - reads searchParams
│   ├── loading.tsx               # TasksLoading (Server Component)
│   └── error.tsx                 # TasksError (Client Component)

components/tasks/
├── task-filters.tsx              # TaskFilters (Client Component) - filter bar
├── task-list.tsx                 # TaskList (Server Component) - flat or grouped
├── task-group-header.tsx         # TaskGroupHeader (Client Component)
├── filter-chips.tsx              # FilterChips (Client Component) - active filters
├── task-search-input.tsx         # TaskSearchInput (Client Component) - debounced search
├── task-sort-select.tsx          # TaskSortSelect (Client Component)
├── task-group-select.tsx         # TaskGroupSelect (Client Component)
├── task-empty-state.tsx          # TaskEmptyState (Server Component) - zero tasks vs no matches
└── task-skeleton.tsx             # TaskSkeleton (Client Component)

lib/
├── validation/
│   └── task.ts                   # Add filter/sort/group schemas
├── data/
│   └── task.ts                   # Update getTasksForUser with filter/sort
```

### 4.2 Component Hierarchy

```
TasksPage (Server Component)
├── parse searchParams with Zod
├── getTasksForUser(userId, filters, sort) → tasks
├── getCategories(userId) → categories (for filter dropdown)
├── TasksHeader
│   ├── Title: "Tasks"
│   ├── Subtitle: "{count} tasks"
│   └── CreateTaskButton → opens CreateTaskDialog
├── TaskFilters (Client Component)
│   ├── TaskSearchInput (debounced, controlled by ?q)
│   ├── StatusFilter (controlled by ?status)
│   ├── PriorityFilter (controlled by ?priority)
│   ├── CategoryFilter (controlled by ?category)
│   ├── DueDateFilter (controlled by ?dueDate)
│   ├── TaskSortSelect (controlled by ?sort/?order)
│   └── TaskGroupSelect (controlled by ?groupBy)
├── FilterChips (Client Component)
│   └── Renders chips for each active filter + "Clear all"
└── Conditional: hasTasks?
    ├── YES → TaskList (Server Component)
    │   └── groupBy === 'none'
    │       ├── YES → tasks.map(task → TaskItem)
    │       └── NO → groupedTasks.map(group →
    │           ├── TaskGroupHeader (name, count)
    │           └── group.tasks.map(task → TaskItem)
    └── NO → TaskEmptyState
        ├── Global empty (user has 0 tasks)
        └── Filtered empty (filters active, 0 matches)
```

### 4.3 Data Flow

```
1. User types in search input
2. TaskSearchInput debounces 300ms
3. Calls router.replace() with updated ?q=searchterm
4. Next.js re-renders TasksPage (Server Component)
5. TasksPage re-parses searchParams
6. getTasksForUser(userId, filters, sort) executes with new params
7. TaskList re-renders with filtered results
8. FilterChips updates to show active search chip

Same flow applies to all filter/sort/group changes.
```

### 4.4 Tasks Page Layout

```
Mobile (< 640px):
+---------------------------+
| Tasks            [+ New]  |
| 24 tasks                  |
+---------------------------+
| [Search tasks...    ] [🔍]|
+---------------------------+
| [Filters ▼] [Sort ▼] [Grp]|
+---------------------------+
| 🔍 "report"      [x]      |
| Status: Todo     [x]      |
| Clear all                 |
+---------------------------+
| ▶ Todo (3)                |
|   ☐ Finish report   Due   |
|   ☐ Review doc      Due   |
|   ☐ Email team      Due   |
+---------------------------+
| ▶ In Progress (1)         |
|   ☐ Update schema   Due   |
+---------------------------+

Desktop (1024px+):
+-------------------------------------------------------+
| Tasks                                    [+ New Task] |
| 24 tasks                                              |
+-------------------------------------------------------+
| [Search tasks...] | Status ▼ | Priority ▼ | Category ▼ |
| Due Date ▼ | Sort: Due Date ▼ | Asc ▼ | Group: None ▼ |
+-------------------------------------------------------+
| 🔍 "report"  [x]  | Status: Todo  [x]  | Clear all    |
+-------------------------------------------------------+
| ☐ Finish report                     High    Today     |
| ☐ Review documentation              Medium  Tomorrow  |
| ☐ Email team                        Low     Wed       |
+-------------------------------------------------------+
```

### 4.5 Grouped List Layout

```
Group by Status:
+-------------------------------------------+
| Todo (5)                                  |
+-------------------------------------------+
| ☐ Task A                    High   Today  |
| ☐ Task B                    Med    Tom    |
+-------------------------------------------+
| In Progress (2)                           |
+-------------------------------------------+
| ☐ Task C                    High   Today  |
| ☐ Task D                    Low    Fri    |
+-------------------------------------------+
| Done (3)                                  |
+-------------------------------------------+
| ☑ Task E                    Med    Yesterday|
+-------------------------------------------+
```

### 4.6 Filtered Empty State

```
+-------------------------------------------+
| 🔍                                        |
| No tasks match your filters               |
| Try adjusting your search or clearing     |
| your filters.                             |
|                                           |
|         [Clear All Filters]               |
+-------------------------------------------+
```

---

## 5. Design Specifications

### 5.1 Visual Design

#### Filter Bar
- Background: transparent (inherits page background)
- Layout: flex row, wrap, gap-2
- Search input: max-width `320px`, rounded-md
- Selects: compact, `h-8`, `text-sm`
- Mobile: search full width; filters in a collapsible sheet or scrollable row

#### Filter Chips
- Container: flex row, wrap, gap-2, padding-top `8px`
- Chip: `h-7`, rounded-full, `bg-secondary text-secondary-foreground`, `text-xs`
- Close icon: `h-3 w-3`, muted color, hover foreground
- "Clear all": `text-xs text-muted-foreground underline hover:text-foreground`

#### Group Headers
- Background: transparent
- Text: `text-sm font-semibold text-foreground`
- Count badge: `text-xs text-muted-foreground` in parentheses
- Separator: optional bottom border `border-b`
- Padding: `py-2`

#### Sort/Group Selectors
- Use shadcn/ui `Select` component
- Trigger: `h-8 text-sm border-input`
- Icons: `ArrowUpDown` for sort, `Group` for group-by

### 5.2 Responsive Breakpoints

```css
/* Mobile First (default) */
.filter-bar { @apply flex flex-col gap-2; }
.search-input { @apply w-full; }
.filter-selects { @apply flex flex-wrap gap-2; }

/* Tablet+ */
@media (min-width: 640px) {
  .filter-bar { @apply flex-row items-center; }
  .search-input { @apply w-64; }
}

/* Desktop */
@media (min-width: 1024px) {
  .filter-bar { @apply justify-between; }
  .filter-selects { @apply gap-3; }
}
```

### 5.3 Spacing & Typography

- Page title: `text-2xl font-bold tracking-tight`
- Task count subtitle: `text-sm text-muted-foreground`
- Filter label (if visible): `text-xs font-medium text-muted-foreground`
- Group header: `text-sm font-semibold`
- Chip text: `text-xs`

---

## 6. Data Queries & Actions

### 6.1 Updated Task Queries

```typescript
// lib/data/task.ts
import { eq, and, or, ilike, asc, desc, gte, lte, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks, categories } from "@/lib/db/schema";

export interface TaskFilterOptions {
  status?: ("todo" | "in_progress" | "done" | "archived")[];
  priority?: ("low" | "medium" | "high")[];
  categoryId?: string;
  search?: string;
  dueDate?: "today" | "upcoming" | "overdue" | "none";
}

export interface TaskSortOptions {
  field: "dueDate" | "createdAt" | "updatedAt" | "priority" | "title";
  order: "asc" | "desc";
}

export async function getTasksForUser(
  userId: string,
  filters?: TaskFilterOptions,
  sort?: TaskSortOptions
) {
  const conditions = [eq(tasks.userId, userId)];

  if (filters?.status?.length) {
    conditions.push(inArray(tasks.status, filters.status));
  }
  if (filters?.priority?.length) {
    conditions.push(inArray(tasks.priority, filters.priority));
  }
  if (filters?.categoryId) {
    conditions.push(eq(tasks.categoryId, filters.categoryId));
  }
  if (filters?.search) {
    conditions.push(
      or(
        ilike(tasks.title, `%${filters.search}%`),
        ilike(tasks.description, `%${filters.search}%`)
      )
    );
  }
  if (filters?.dueDate) {
    const now = new Date(); // TODO: apply user timezone
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    switch (filters.dueDate) {
      case "today":
        conditions.push(
          and(
            gte(tasks.dueDate, startOfToday),
            lte(tasks.dueDate, endOfToday)
          )
        );
        break;
      case "upcoming":
        conditions.push(gte(tasks.dueDate, endOfToday));
        break;
      case "overdue":
        conditions.push(
          and(
            lte(tasks.dueDate, startOfToday),
            or(eq(tasks.status, "todo"), eq(tasks.status, "in_progress"))
          )
        );
        break;
      case "none":
        conditions.push(isNull(tasks.dueDate));
        break;
    }
  }

  // Default sort: dueDate asc, priority desc, createdAt desc
  const sortField = sort?.field ?? "dueDate";
  const sortOrder = sort?.order ?? "asc";

  const orderByClause = [];
  if (sortField === "dueDate") {
    orderByClause.push(
      sortOrder === "asc"
        ? asc(sql`CASE WHEN ${tasks.dueDate} IS NULL THEN 1 ELSE 0 END`)
        : desc(sql`CASE WHEN ${tasks.dueDate} IS NULL THEN 1 ELSE 0 END`)
    );
    orderByClause.push(sortOrder === "asc" ? asc(tasks.dueDate) : desc(tasks.dueDate));
  } else if (sortField === "priority") {
    orderByClause.push(
      sortOrder === "asc"
        ? asc(sql`CASE ${tasks.priority} WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END`)
        : desc(sql`CASE ${tasks.priority} WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END`)
    );
  } else if (sortField === "title") {
    orderByClause.push(sortOrder === "asc" ? asc(tasks.title) : desc(tasks.title));
  } else if (sortField === "createdAt") {
    orderByClause.push(sortOrder === "asc" ? asc(tasks.createdAt) : desc(tasks.createdAt));
  } else if (sortField === "updatedAt") {
    orderByClause.push(sortOrder === "asc" ? asc(tasks.updatedAt) : desc(tasks.updatedAt));
  }

  // Secondary sorts
  if (sortField !== "priority") {
    orderByClause.push(
      desc(sql`CASE ${tasks.priority} WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END`)
    );
  }
  if (sortField !== "createdAt") {
    orderByClause.push(desc(tasks.createdAt));
  }

  return db.query.tasks.findMany({
    where: and(...conditions),
    orderBy: orderByClause,
    with: { category: true },
  });
}
```

### 6.2 Validation Schemas

```typescript
// lib/validation/task.ts
import { z } from "zod";

export const taskStatusValues = ["todo", "in_progress", "done", "archived"] as const;
export const taskPriorityValues = ["low", "medium", "high"] as const;
export const sortFieldValues = ["dueDate", "createdAt", "updatedAt", "priority", "title"] as const;
export const sortOrderValues = ["asc", "desc"] as const;
export const groupByValues = ["status", "category", "dueDate"] as const;
export const dueDateFilterValues = ["today", "upcoming", "overdue", "none"] as const;

export const taskFilterSchema = z.object({
  status: z.enum(taskStatusValues).array().optional(),
  priority: z.enum(taskPriorityValues).array().optional(),
  category: z.uuid().optional(),
  q: z.string().trim().max(100).optional(),
  dueDate: z.enum(dueDateFilterValues).optional(),
}).partial();

export const taskSortSchema = z.object({
  sort: z.enum(sortFieldValues).optional(),
  order: z.enum(sortOrderValues).optional(),
}).partial();

export const taskGroupBySchema = z.object({
  groupBy: z.enum(groupByValues).optional(),
}).partial();

export const taskQueryParamsSchema = taskFilterSchema
  .merge(taskSortSchema)
  .merge(taskGroupBySchema);

export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
export type TaskSortInput = z.infer<typeof taskSortSchema>;
export type TaskGroupByInput = z.infer<typeof taskGroupBySchema>;
export type TaskQueryParams = z.infer<typeof taskQueryParamsSchema>;
```

### 6.3 Grouping Logic (UI Layer)

```typescript
// lib/utils/task-grouping.ts
import type { Task, Category } from "@/lib/db/schema";

export type TaskGroup = {
  key: string;
  label: string;
  tasks: TaskWithCategory[];
};

export function groupTasks(
  tasks: TaskWithCategory[],
  groupBy: "status" | "category" | "dueDate",
  userTimezone: string
): TaskGroup[] {
  const groups = new Map<string, TaskGroup>();

  for (const task of tasks) {
    let key: string;
    let label: string;

    if (groupBy === "status") {
      key = task.status;
      label = formatStatusLabel(task.status);
    } else if (groupBy === "category") {
      key = task.category?.id ?? "uncategorized";
      label = task.category?.name ?? "Uncategorized";
    } else {
      key = getDueDateBucket(task.dueDate, userTimezone);
      label = formatDueDateBucketLabel(key);
    }

    if (!groups.has(key)) {
      groups.set(key, { key, label, tasks: [] });
    }
    groups.get(key)!.tasks.push(task);
  }

  // Order groups logically
  if (groupBy === "status") {
    const statusOrder = ["todo", "in_progress", "done", "archived"];
    return statusOrder
      .map((s) => groups.get(s))
      .filter((g): g is TaskGroup => !!g && g.tasks.length > 0);
  }

  if (groupBy === "dueDate") {
    const dateOrder = ["overdue", "today", "upcoming", "none"];
    return dateOrder
      .map((d) => groups.get(d))
      .filter((g): g is TaskGroup => !!g && g.tasks.length > 0);
  }

  // category: alphabetical
  return Array.from(groups.values())
    .filter((g) => g.tasks.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label));
}
```

---

## 7. Acceptance Criteria Summary

### Page-Level Criteria

| Page | Route | Criteria |
|------|-------|----------|
| Tasks | `/tasks` | Reads URL params, applies filters/sort/group server-side |
| Loading | `/tasks` | Skeleton matches enhanced layout |
| Error | `/tasks` | Friendly error with retry |

### Functional Criteria

| Feature | Test Case |
|---------|-----------|
| Search | Typing updates URL `?q=term` after debounce |
| Search | Search is case-insensitive and matches title |
| Search | Clear button removes search param |
| Due Date Filter | `today` shows only tasks due today in user timezone |
| Due Date Filter | `overdue` excludes completed tasks |
| Due Date Filter | `none` shows tasks with no due date |
| Sort | `dueDate asc` puts null dates at bottom |
| Sort | `priority desc` orders high > medium > low |
| Sort | `title asc` is alphabetical A-Z |
| Group | `status` groups ordered: todo, in_progress, done, archived |
| Group | `category` shows uncategorized group if applicable |
| Group | `dueDate` groups ordered: overdue, today, upcoming, none |
| Chips | Active filters render as removable chips |
| Chips | Clicking X removes only that filter |
| Clear All | Resets all filters and sort to defaults |
| Empty State | Filtered empty shows "No tasks match your filters" |
| URL | Refresh restores filter state |
| URL | Back button navigates through filter history |

### Integration Criteria

| Component | Integration |
|-----------|-------------|
| TaskSearchInput | Debounced, updates URL via Next.js router |
| TaskFilters | Composes all filter selects with URL state |
| TaskList | Receives pre-filtered tasks from Server Component |
| FilterChips | Reads URL to derive active filters |
| getTasksForUser | Accepts typed filter/sort params, returns scoped results |

---

## 8. Testing Strategy

### Unit Tests

**Task Data Layer (`lib/data/__tests__/task.test.ts`)**
- [ ] `getTasksForUser` returns all tasks when no filters provided
- [ ] `getTasksForUser` filters by status array
- [ ] `getTasksForUser` filters by priority array
- [ ] `getTasksForUser` filters by categoryId
- [ ] `getTasksForUser` searches title with ILIKE
- [ ] `getTasksForUser` filters dueDate=today correctly
- [ ] `getTasksForUser` filters dueDate=overdue correctly (excludes done)
- [ ] `getTasksForUser` sorts by dueDate asc with nulls last
- [ ] `getTasksForUser` sorts by priority desc (high first)
- [ ] `getTasksForUser` always scopes by userId

**Task Grouping (`lib/utils/__tests__/task-grouping.test.ts`)**
- [ ] groupTasks by status returns ordered groups
- [ ] groupTasks by category includes uncategorized group
- [ ] groupTasks by dueDate buckets correctly
- [ ] groupTasks preserves sort order within groups

**Validation (`lib/validation/__tests__/task.test.ts`)**
- [ ] taskQueryParamsSchema accepts valid params
- [ ] taskQueryParamsSchema strips invalid sort fields
- [ ] taskQueryParamsSchema limits search to 100 chars
- [ ] taskQueryParamsSchema validates UUID category

### Manual Testing Checklist

#### Search
- [ ] Type "report" and see filtered results
- [ ] Refresh page restores search term
- [ ] Clear button removes search
- [ ] Search composes with status filter

#### Due Date Filters
- [ ] Select "Due Today" shows only today's tasks
- [ ] Select "Overdue" excludes completed tasks
- [ ] Select "No Due Date" shows tasks with null dueDate
- [ ] Timezone-aware (change timezone in settings, re-test)

#### Sorting
- [ ] Sort by due date ascending
- [ ] Sort by due date descending
- [ ] Sort by priority descending
- [ ] Sort by title ascending
- [ ] Sort by created/updated dates

#### Grouping
- [ ] Group by status renders correct sections
- [ ] Group by category renders alphabetical sections
- [ ] Group by due date renders ordered sections
- [ ] Each group header shows accurate count

#### Filter Chips
- [ ] Chips appear for each active filter
- [ ] Removing chip updates URL and list
- [ ] "Clear all" removes everything

#### Responsive
- [ ] Mobile (320px): search full width, filters accessible
- [ ] Tablet (768px): comfortable spacing
- [ ] Desktop (1024px): all controls visible inline

---

## 9. Implementation Notes

### Dependencies Already Installed
- `drizzle-orm` - Database queries
- `zod` - Validation
- `lucide-react` - Icons (Search, X, SlidersHorizontal, ArrowUpDown, Group, ChevronDown)
- `tailwindcss` - Styling
- shadcn/ui components: Input, Select, Badge, Button, Sheet

### URL State Management Pattern
Use Next.js `useRouter` and `useSearchParams` in Client Components:

```typescript
// In TaskFilters (Client Component)
const router = useRouter();
const searchParams = useSearchParams();

function setFilter(key: string, value: string | null) {
  const params = new URLSearchParams(searchParams.toString());
  if (value) params.set(key, value);
  else params.delete(key);
  router.replace(`/tasks?${params.toString()}`);
}
```

In the Server Component (`page.tsx`):
```typescript
export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const validated = taskQueryParamsSchema.safeParse(params);
  const filters = validated.success ? validated.data : {};
  // ... fetch tasks
}
```

### Existing Components to Update

#### `components/tasks/task-filters.tsx`
- Currently handles status and priority filters via URL params
- Add search input, due date select, category select, sort select, group select
- Ensure backward compatibility with existing `status`/`priority` params

#### `lib/data/task.ts`
- Update `getTasksForUser` signature to accept optional filter/sort objects
- Keep existing callers working by making new params optional

#### `app/(app)/tasks/page.tsx`
- Update to async function accepting `searchParams` prop
- Parse and validate params before passing to data layer
- Pass categories to TaskFilters for category dropdown

### Timezone Handling
- Use `lib/utils/date.ts` helpers for timezone-aware date comparisons
- If user has no preferences record yet, fallback to `UTC`
- Consider start/end of day boundaries carefully for "today" and "overdue"

### Performance Considerations
- `ilike` on title/description is acceptable for MVP with personal-scale datasets
- If a user has thousands of tasks, consider adding a PostgreSQL index on `tasks(title)` or using `pg_trgm`
- Grouping is done in-memory after fetching; no extra DB roundtrips

---

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| URL param parsing fails with arrays | Medium | Use `z.array()` with `.or(z.string().transform(s => [s]))` for multi-value params |
| Timezone date math is buggy | Medium | Centralize in `lib/utils/date.ts`; write unit tests for edge cases (DST, midnight) |
| Too many filters confuse users | Low | Default to simple view; advanced filters visible but not overwhelming |
| Mobile filter bar too tall | Low | Collapse into sheet/accordion on small screens |
| `ilike` search slow on large datasets | Low | Add `pg_trgm` index post-MVP if needed; personal datasets unlikely to hit this |

---

## 11. Related Documentation

- **PRD.md** §6.4 - Task Filters, Sorting, and Grouping requirements
- **PRD.md** §6.3 - Task Management requirements
- **PRD.md** §6.6 - User Settings and Preferences (timezone preference)
- **coding-standards.md** - TypeScript, React, Tailwind v4, Drizzle conventions
- **ai-interaction.md** - Workflow for implementation
- **lib/db/schema.ts** - Database schema reference (tasks table indexes)
- **P2-F3 Task Management** - Existing task list, task filters, task data layer
- **P2-F4 Category Management** - Existing category filter integration

---

## 12. Definition of Done

- [ ] Search input filters tasks by title (and optionally description)
- [ ] Due date filters (today, upcoming, overdue, none) work correctly
- [ ] Sort controls support dueDate, createdAt, updatedAt, priority, title with asc/desc
- [ ] Group-by supports status, category, and due date buckets
- [ ] All filter/sort/group state persisted in URL query params
- [ ] Filter chips show active filters with one-click removal
- [ ] "Clear all" resets to default view
- [ ] Filtered empty state differs from global empty state
- [ ] `getTasksForUser` accepts typed filter and sort parameters
- [ ] Zod schemas validate all URL query params
- [ ] Timezone-aware due date comparisons
- [ ] Grouping computed in UI layer without extra DB queries
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Dark mode works correctly
- [ ] Accessibility: keyboard navigable filters, clear labels
- [ ] Build passes (`npm run build`)
- [ ] Unit tests pass (`npm run test`)
- [ ] Manual testing checklist complete
- [ ] Code reviewed and approved

---

**Next Steps:**
1. Load this feature using the feature skill
2. Create branch `feature/P2-F5-task-filters-sorting-grouping`
3. Implement in order: Validation schemas → Data layer updates → TaskFilters enhancements → TaskList grouping → FilterChips → Page integration → Testing
4. Test thoroughly
5. Build and commit
