# Feature Specification: P2-F2 - Dashboard Overview

**Phase:** 2 - Core Product  
**Feature ID:** P2-F2  
**Feature Name:** Dashboard Overview  
**Status:** Draft - Ready for Implementation  
**Date:** 2026-04-21

---

## 1. Goals

### Primary Goal
Build a personalized dashboard that gives users immediate visibility into their workload, priorities, and upcoming deadlines immediately after signing in. This is the primary landing page for authenticated users.

### Secondary Goals
- Provide at-a-glance statistics (due today, overdue, completed, priority distribution)
- Surface upcoming tasks to encourage proactive planning
- Offer quick actions to create tasks, view all tasks, and manage categories
- Implement responsive grid layout that works on mobile, tablet, and desktop
- Create meaningful empty states for new users with no data
- Establish date utility patterns that will be reused across the application
- Ensure all data is scoped to the authenticated user

---

## 2. Scope

### In Scope

#### Core Dashboard Page
1. **`/dashboard`** - Main dashboard page (Server Component)
2. **`app/(app)/dashboard/loading.tsx`** - Skeleton loading UI
3. **`app/(app)/dashboard/error.tsx`** - Error boundary (Client Component)

#### Dashboard Widgets / Cards
1. **Stats Overview Row**
   - Tasks due today (count + indicator)
   - Overdue tasks (count + warning indicator)
   - Completed today (count)
   - Total active tasks (count)
2. **Priority Distribution**
   - Visual summary of tasks by priority (high/medium/low)
3. **Upcoming Tasks List**
   - Top 5 tasks due in the next 7 days
   - Shows title, due date, priority badge, category
4. **Quick Actions**
   - Create new task (navigates to /tasks or opens dialog)
   - View all tasks (navigates to /tasks)
   - Manage categories (navigates to /categories)

#### Date Utilities (First Implementation)
1. **`lib/utils/date.ts`** - Shared date utilities
   - `isDueToday(date, timezone)`
   - `isOverdue(date, timezone)`
   - `getDueDateBucket(date, timezone)` → `'today' | 'upcoming' | 'overdue' | 'no_due_date'`
   - `formatDate(date, format, timezone)`
   - `toUserTimezone(date, timezone)`

#### Empty States
1. **New user empty state** - Welcome message + CTA to create first task
2. **No upcoming tasks** - "All caught up!" message

### Out of Scope
- Full task CRUD operations (covered in P2-F3 Task Management)
- Category management UI (covered in P2-F4 Categories)
- Real-time updates / WebSocket (post-MVP)
- Charts/graphs (simple badges/bars only; advanced charts post-MVP)
- Analytics or reporting beyond basic counts
- Push notifications

---

## 3. Requirements

### 3.1 Functional Requirements

#### REQ-001: Dashboard Page Route
**Priority:** P0  
**Description:** Implement the dashboard at `/dashboard`

**Acceptance Criteria:**
- [ ] Page displays at `/dashboard` route
- [ ] Page is a Server Component that fetches data on the server
- [ ] All data is scoped to the authenticated `userId`
- [ ] Unauthenticated users are redirected to `/sign-in` (handled by proxy + layout)
- [ ] Page loads without client-side JavaScript for initial render
- [ ] After sign-in, user lands on `/dashboard`

#### REQ-002: Dashboard Stats Cards
**Priority:** P0  
**Description:** Summary statistics in card format

**Acceptance Criteria:**
- [ ] Display 4 stat cards in a responsive grid (1 col mobile, 2 col tablet, 4 col desktop)
- [ ] **Due Today**: Count of tasks with due date = today in user's timezone
- [ ] **Overdue**: Count of tasks with due date < today, status NOT done/archived
- [ ] **Completed Today**: Count of tasks completed today (by `completedAt` timestamp)
- [ ] **Total Active**: Count of tasks with status NOT done/archived
- [ ] Each card shows the count number prominently
- [ ] Each card has an icon and color indicator matching severity
- [ ] Cards update after task mutations (via `revalidatePath('/dashboard')` in task actions)

#### REQ-003: Priority Distribution Summary
**Priority:** P1  
**Description:** Visual breakdown of active tasks by priority

**Acceptance Criteria:**
- [ ] Shows counts for high/medium/low priority among active tasks
- [ ] Uses color-coded badges or progress bars
- [ ] Mobile: horizontal layout or compact vertical list
- [ ] Desktop: can be a small chart or segmented bar
- [ ] Updates when tasks change priority

#### REQ-004: Upcoming Tasks List
**Priority:** P0  
**Description:** List of tasks due soon

**Acceptance Criteria:**
- [ ] Shows up to 5 tasks with upcoming due dates (next 7 days)
- [ ] Ordered by due date ascending (soonest first)
- [ ] Excludes completed and archived tasks
- [ ] Each item shows: title, due date, priority badge, category name + color
- [ ] Tasks due today have special highlight/badge
- [ ] Tasks overdue have warning styling
- [ ] Clicking a task navigates to task detail (or tasks list with filter)
- [ ] "View all tasks" link at bottom

#### REQ-005: Quick Actions
**Priority:** P1  
**Description:** Shortcut buttons for common actions

**Acceptance Criteria:**
- [ ] "New Task" button → navigates to `/tasks` (future: open create modal)
- [ ] "View All Tasks" button → navigates to `/tasks`
- [ ] "Manage Categories" button → navigates to `/categories`
- [ ] Buttons are visible and accessible on mobile

#### REQ-005b: Dashboard Header with User Controls
**Priority:** P0  
**Description:** Header area with user avatar, profile link, logout, and theme toggle

**Acceptance Criteria:**
- [ ] Display user avatar (image from `user.image` or fallback with initials)
- [ ] Show user name next to avatar
- [ ] Profile button/link → navigates to `/settings`
- [ ] Logout button → calls `signOutAction` → redirects to `/sign-in`
- [ ] Light/Dark mode toggle button → switches theme via existing ThemeProvider
- [ ] Header is sticky or fixed at top of dashboard content area
- [ ] All controls accessible on mobile (responsive layout)
- [ ] Header area is part of dashboard page or separate `dashboard-header` component

#### REQ-006: Empty States
**Priority:** P0  
**Description:** Meaningful UI when user has no tasks

**Acceptance Criteria:**
- [ ] New users see welcome message: "Welcome to TaskFlow!"
- [ ] Subtext: "Start by creating your first task"
- [ ] Prominent CTA button: "Create Your First Task"
- [ ] Empty state is visually engaging (icon + text, not just "No data")
- [ ] When tasks exist but no upcoming tasks, show: "All caught up!" message
- [ ] Empty states responsive on all screen sizes

#### REQ-007: Date Utilities
**Priority:** P0  
**Description:** Shared date calculation functions

**Acceptance Criteria:**
- [ ] Create `lib/utils/date.ts` with typed functions
- [ ] `isDueToday(dueDate: Date, timezone: string): boolean`
- [ ] `isOverdue(dueDate: Date, timezone: string): boolean`
- [ ] `getDueDateBucket(dueDate: Date | null, timezone: string): 'today' | 'upcoming' | 'overdue' | 'no_due_date'`
- [ ] `formatDate(date: Date, format: string, timezone: string): string`
- [ ] All functions account for user timezone (default 'UTC')
- [ ] All functions have unit tests in `lib/utils/date.test.ts`
- [ ] Use native `Intl.DateTimeFormat` or `date-fns` + `date-fns-tz` (decision below)

#### REQ-008: Loading State
**Priority:** P0  
**Description:** Skeleton UI while dashboard data loads

**Acceptance Criteria:**
- [ ] Create `app/(app)/dashboard/loading.tsx`
- [ ] Uses `Skeleton` components from shadcn/ui
- [ ] Matches the layout of the actual dashboard (cards, list items)
- [ ] Provides immediate visual feedback on navigation
- [ ] Follows Next.js 16 streaming patterns (automatic Suspense boundary)

#### REQ-009: Error State
**Priority:** P1  
**Description:** Graceful error handling

**Acceptance Criteria:**
- [ ] Create `app/(app)/dashboard/error.tsx`
- [ ] Must be a Client Component (`'use client'`)
- [ ] Shows user-friendly error message
- [ ] Includes "Try Again" button that calls `reset()`
- [ ] Logs error details (not shown to user)

#### REQ-016: Reusable Task Card
**Priority:** P1  
**Description:** Task item component for upcoming tasks list (reusable for task list page)

**Acceptance Criteria:**
- [ ] Create `components/tasks/task-card.tsx` (Client Component)
- [ ] Props: task (title, status, priority, dueDate, category)
- [ ] Shows title, formatted due date, priority badge, category badge
- [ ] Due today gets highlight styling
- [ ] Overdue gets warning styling
- [ ] Clickable (navigates to task detail or list)
- [ ] Compact variant for dashboard (vs expanded variant for task list page)
- [ ] Typed with TaskCardProps interface

### 3.2 Technical Requirements

#### REQ-010: Data Fetching Strategy
**Priority:** P0  
**Description:** Server-side data loading with Drizzle

**Acceptance Criteria:**
- [ ] Dashboard `page.tsx` is an async Server Component
- [ ] Fetch stats using Drizzle queries scoped by `userId`
- [ ] Use `db.select({ count: count() }).from(tasks).where(...)` pattern for counts
- [ ] Fetch upcoming tasks with `where`, `orderBy`, and `limit`
- [ ] Join with categories to get category name/color
- [ ] Use `revalidatePath('/dashboard')` in task/category mutations to refresh data
- [ ] Do NOT use `fetch()` API for internal DB data (direct Drizzle queries)

#### REQ-011: Component Architecture
**Priority:** P0  
**Description:** Well-organized dashboard components

**Acceptance Criteria:**
- [ ] Create `components/dashboard/stats-cards.tsx` - Stats grid (Server Component)
- [ ] Create `components/dashboard/priority-summary.tsx` - Priority breakdown (Server Component)
- [ ] Create `components/dashboard/upcoming-tasks.tsx` - Task list (Server Component)
- [ ] Create `components/dashboard/quick-actions.tsx` - Action buttons (Client Component)
- [ ] Create `components/dashboard/empty-state.tsx` - Empty state UI (Client Component)
- [ ] Create `components/dashboard/dashboard-skeleton.tsx` - Loading skeleton (Client Component)
- [ ] Create `components/tasks/task-card.tsx` - Reusable task item card (Client Component)
- [ ] Page composes these components; data passed as props
- [ ] Components are typed with interfaces

#### REQ-012: Responsive Design
**Priority:** P0  
**Description:** Mobile-first responsive layout

**Acceptance Criteria:**
- [ ] Mobile (< 640px): single column, stacked cards
- [ ] Tablet (640px+): 2-column grid for stats
- [ ] Desktop (1024px+): 4-column grid for stats, side-by-side widgets
- [ ] Padding and spacing adjust per breakpoint
- [ ] Font sizes scale appropriately
- [ ] Touch targets minimum 44px on mobile

#### REQ-013: Accessibility
**Priority:** P0  
**Description:** WCAG-compliant dashboard

**Acceptance Criteria:**
- [ ] Semantic HTML structure (main, section, heading hierarchy)
- [ ] All interactive elements keyboard accessible
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Priority colors do not rely on color alone (badge text + icon)
- [ ] Skeleton loading state announced appropriately
- [ ] Empty states have proper heading structure

### 3.3 Non-Functional Requirements

#### REQ-014: Performance
- [ ] Dashboard queries use indexed columns (user_id, status, due_date, priority)
- [ ] No N+1 queries (use joins where needed)
- [ ] Skeleton UI shown immediately on navigation
- [ ] Time to first contentful paint < 1s on broadband

#### REQ-015: Security
- [ ] Every query scoped by `userId` (no cross-user data leakage)
- [ ] No sensitive data exposed in client-side props
- [ ] Server Components prevent client-side data tampering

---

## 4. UI Architecture

### 4.1 File Structure

```
app/(app)/
├── dashboard/
│   ├── page.tsx              # DashboardPage (Server Component)
│   ├── loading.tsx           # DashboardLoading (Server Component)
│   └── error.tsx             # DashboardError (Client Component)

components/dashboard/
├── stats-cards.tsx           # StatsCards (Server Component)
├── priority-summary.tsx      # PrioritySummary (Server Component)
├── upcoming-tasks.tsx        # UpcomingTasks (Server Component)
├── quick-actions.tsx         # QuickActions (Client Component)
├── empty-state.tsx           # EmptyState (Client Component)
├── dashboard-header.tsx      # DashboardHeader (Client Component)
└── dashboard-skeleton.tsx    # DashboardSkeleton (Client Component)

tasks/
└── task-card.tsx             # TaskCard (Client Component)

lib/
├── utils/
│   ├── date.ts               # Date utilities
│   └── date.test.ts          # Date utility tests
└── actions/
    └── task.ts               # Task mutations (add revalidatePath)
```

### 4.2 Component Hierarchy

```
DashboardPage (Server Component)
├── getSession / requireAuth → userId
├── fetchDashboardData(userId)
│   ├── statsQuery
│   ├── upcomingTasksQuery
│   └── priorityQuery
└── DashboardLayout
    ├── DashboardHeader (Client Component)
    │   ├── Avatar + User Name
    │   ├── Profile Button → /settings
    │   ├── Logout Button
    │   └── Theme Toggle (light/dark)
    ├── PageHeader
    │   ├── Title: "Dashboard"
    │   └── Subtitle: "Welcome back, {name}"
    ├── QuickActions (Client Component)
    │   ├── New Task Button
    │   ├── View All Tasks Button
    │   └── Manage Categories Button
    └── Conditional: hasTasks?
        ├── YES → StatsCards + PrioritySummary + UpcomingTasks
        └── NO → EmptyState
```

### 4.3 Data Flow

```
1. User navigates to /dashboard
2. proxy.ts allows request
3. AppShell renders layout
4. DashboardPage (async Server Component):
   a. Calls requireAuth() → gets userId
   b. Queries Drizzle for stats, upcoming tasks, priorities
   c. Renders components with data as props
5. If loading takes time → loading.tsx skeleton shown
6. If error → error.tsx boundary shown
```

### 4.4 Dashboard Layout Grid

```
Mobile (< 640px):
+------------------+
| Page Title       |
+------------------+
| Quick Actions    |
+------------------+
| Due Today        |  (full width)
+------------------+
| Overdue          |
+------------------+
| Completed Today  |
+------------------+
| Total Active     |
+------------------+
| Priority Summary |
+------------------+
| Upcoming Tasks   |
+------------------+

Tablet (640px+):
+------------------+----------+
| Page Title                  |
+------------------+----------+
| Quick Actions             |
+--------+---------+--------+--------+
| Due Tdy| Overdue | Cmpltd | Total  |
+--------+---------+--------+--------+
| Priority Summary            |
+-----------------------------+
| Upcoming Tasks              |
+-----------------------------+

Desktop (1024px+):
+------------------+----------+------------+
| Page Title                              |
+------------------+----------+------------+
| Quick Actions                           |
+--------+---------+--------+------------+
| Due Tdy| Overdue | Cmpltd | Total Actv |
+--------+---------+--------+------------+
| Priority Summary    | Upcoming Tasks    |
|                     |                   |
+---------------------+-------------------+
```

---

## 5. Design Specifications

### 5.1 Visual Design

#### Stats Cards
- Background: `--card` token
- Border radius: `var(--radius)` (12px)
- Border: `1px solid --border`
- Padding: `24px`
- Number: `text-3xl font-bold`
- Label: `text-sm text-muted-foreground`
- Icon: `h-5 w-5` in top-right

**Color coding:**
- Due Today: `--primary` (blue)
- Overdue: `--destructive` (red)
- Completed: `--green-500` or `--emerald-500`
- Total Active: `--muted-foreground`

#### Priority Summary
- Segmented bar or 3-row list
- High: red badge
- Medium: amber badge
- Low: blue badge
- Count next to each

#### Upcoming Tasks List
- Card container with `--card` background
- Each item: flex row with title, badges, date
- Divider between items (last item no divider)
- Due date formatted as relative when possible ("Today", "Tomorrow", "Apr 22")
- Priority badge: small variant
- Category badge: colored dot + name

#### Empty State
- Centered vertically and horizontally in content area
- Icon: `ClipboardList` or `CheckCircle2` from lucide-react, `h-16 w-16`
- Title: `text-xl font-semibold`
- Description: `text-muted-foreground`
- CTA: `Button` with `size="lg"`

### 5.2 Responsive Breakpoints

```css
/* Mobile First (default) */
.stats-grid { @apply grid grid-cols-1 gap-4; }
.content-grid { @apply grid grid-cols-1 gap-6; }

/* Tablet */
@media (min-width: 640px) {
  .stats-grid { @apply grid-cols-2; }
}

/* Desktop */
@media (min-width: 1024px) {
  .stats-grid { @apply grid-cols-4; }
  .content-grid { @apply grid-cols-3; }
  .content-grid .upcoming { @apply col-span-2; }
}
```

### 5.3 Spacing & Typography

- Page title: `text-2xl font-bold tracking-tight`
- Page subtitle: `text-muted-foreground`
- Section gap: `24px` (`gap-6`)
- Card internal gap: `16px` (`gap-4`)
- Content max-width: none (fills available space in AppShell)

---

## 6. Data Queries

### 6.1 Stats Query Pattern

```typescript
// Example Drizzle queries for dashboard stats
import { count, eq, and, gte, lt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";

// Due today
const dueTodayCount = await db
  .select({ count: count() })
  .from(tasks)
  .where(and(
    eq(tasks.userId, userId),
    eq(tasks.status, "todo"), // or in_progress
    // dueDate = today (timezone-aware)
  ));

// Overdue
const overdueCount = await db
  .select({ count: count() })
  .from(tasks)
  .where(and(
    eq(tasks.userId, userId),
    eq(tasks.status, "todo"),
    lt(tasks.dueDate, todayStart),
    isNull(tasks.completedAt)
  ));

// Completed today
const completedTodayCount = await db
  .select({ count: count() })
  .from(tasks)
  .where(and(
    eq(tasks.userId, userId),
    eq(tasks.status, "done"),
    gte(tasks.completedAt, todayStart)
  ));

// Total active (not done, not archived)
const totalActiveCount = await db
  .select({ count: count() })
  .from(tasks)
  .where(and(
    eq(tasks.userId, userId),
    eq(tasks.status, "todo") // or in_progress
  ));
```

### 6.2 Upcoming Tasks Query

```typescript
const upcomingTasks = await db.query.tasks.findMany({
  where: and(
    eq(tasks.userId, userId),
    eq(tasks.status, "todo"),
    gte(tasks.dueDate, now),
    lt(tasks.dueDate, sevenDaysFromNow)
  ),
  orderBy: asc(tasks.dueDate),
  limit: 5,
  with: {
    category: true,
  },
});
```

### 6.3 Priority Distribution Query

```typescript
const priorityCounts = await db
  .select({
    priority: tasks.priority,
    count: count(),
  })
  .from(tasks)
  .where(and(
    eq(tasks.userId, userId),
    eq(tasks.status, "todo")
  ))
  .groupBy(tasks.priority);
```

---

## 7. Acceptance Criteria Summary

### Page-Level Criteria

| Page | Route | Criteria |
|------|-------|----------|
| Dashboard | `/dashboard` | Loads with user-specific data, shows stats, upcoming tasks, quick actions |
| Loading | `/dashboard` | Skeleton matches final layout, shown during data fetch |
| Error | `/dashboard` | Shows friendly error with retry button |

### Functional Criteria

| Feature | Test Case |
|---------|-----------|
| Stats | Counts match actual task data |
| Stats | Overdue excludes completed/archived |
| Upcoming | Shows max 5 tasks, ordered by due date |
| Upcoming | Excludes completed/archived |
| Empty State | Shown when user has 0 tasks |
| Empty State | Hidden when user has >= 1 task |
| Date Utils | isDueToday respects timezone |
| Date Utils | isOverdue respects timezone |
| Navigation | Quick action buttons navigate correctly |

### Integration Criteria

| Component | Integration |
|-----------|-------------|
| DashboardPage | Drizzle queries scoped by userId |
| DashboardPage | requireAuth for userId |
| Task Actions | revalidatePath('/dashboard') after mutations |
| Date Utils | Used by dashboard and upcoming tasks |

---

## 8. Testing Strategy

### Unit Tests

**Date Utilities (`lib/utils/date.test.ts`)**
- [ ] `isDueToday` returns true for today's date in user's timezone
- [ ] `isDueToday` returns false for yesterday/tomorrow
- [ ] `isOverdue` returns true for past dates not completed
- [ ] `isOverdue` returns false for future dates
- [ ] `getDueDateBucket` returns correct bucket for all cases
- [ ] `formatDate` formats according to format string and timezone
- [ ] All functions handle null/undefined gracefully

### Manual Testing Checklist

#### Dashboard Load
- [ ] Dashboard loads after sign-in
- [ ] Shows correct user name in welcome message
- [ ] Stats cards show correct counts
- [ ] Upcoming tasks list shows correct items

#### Empty State
- [ ] New user sees empty state with CTA
- [ ] Clicking "Create Your First Task" navigates to /tasks
- [ ] After creating first task, empty state disappears

#### Responsive
- [ ] Mobile (320px): single column, readable, touchable
- [ ] Tablet (768px): 2-column stats grid
- [ ] Desktop (1024px): 4-column stats, side widgets

#### Data Accuracy
- [ ] Create task due today → Due Today count increases
- [ ] Mark task complete → Completed Today increases
- [ ] Create overdue task → Overdue count increases
- [ ] Archive task → Total Active decreases

#### Error Handling
- [ ] Simulate DB error → error.tsx shown with retry
- [ ] Click retry → page reloads

---

## 9. Implementation Notes

### Dependencies Already Installed
- `drizzle-orm` - Database queries
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `sonner` - Toasts (for future task creation)
- `date-fns` or native `Intl` (decide below)

### Date Library Decision
**Option A: date-fns + date-fns-tz**
- Pros: Easier timezone handling, rich formatting options
- Cons: Additional dependency

**Option B: Native Intl.DateTimeFormat**
- Pros: No extra dependency, built-in
- Cons: More verbose for timezone math

**Recommendation:** Use `date-fns` + `date-fns-tz` if not already installed. If keeping dependencies minimal, use native `Intl` with helper functions. For the dashboard, timezone math is critical — `date-fns-tz` is safer.

### Server Action Update
When implementing task CRUD in P2-F3, add `revalidatePath('/dashboard')` to all task mutations:

```typescript
import { revalidatePath } from "next/cache";

export async function createTaskAction(data: CreateTaskInput) {
  // ... validation and DB insert
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  return { success: true, data: task };
}
```

### Mock Data Usage
During initial UI development, the mock data in `lib/db/mock-data.json` can be used to build and style components. However, the final implementation must use Drizzle queries against the real database.

### TypeScript Patterns

```typescript
// Dashboard data type
interface DashboardData {
  user: {
    name: string;
  };
  stats: {
    dueToday: number;
    overdue: number;
    completedToday: number;
    totalActive: number;
  };
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  upcomingTasks: Array<{
    id: string;
    title: string;
    dueDate: Date | null;
    priority: TaskPriority;
    status: TaskStatus;
    category: {
      name: string;
      color: string | null;
    } | null;
  }>;
}
```

---

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Timezone bugs in date calculations | High | Unit test with multiple timezones; use date-fns-tz |
| Slow dashboard queries | Medium | Use indexed columns; add query timeouts; monitor |
| Layout shift on data load | Low | Skeleton matches final layout exactly |
| Empty state flash before data | Low | Server Component renders on server; no flash |
| Responsive issues on tablets | Low | Test at all breakpoints; use Tailwind grid |

---

## 11. Related Documentation

- **PRD.md** §6.2 - Dashboard Overview requirements
- **coding-standards.md** - TypeScript, React, Tailwind v4, Drizzle conventions
- **ai-interaction.md** - Workflow for implementation
- **lib/db/schema.ts** - Database schema reference
- **lib/db/mock-data.json** - Mock data for UI development
- **Next.js 16 docs** - Async Server Components, loading.tsx, error.tsx
- **Drizzle docs** - Aggregation queries with count() and groupBy

---

## 12. Definition of Done

- [ ] Dashboard page renders at `/dashboard` with real data
- [ ] Dashboard header with avatar, user name, profile link, logout, theme toggle
- [ ] Stats cards show correct counts scoped to authenticated user
- [ ] Upcoming tasks list shows up to 5 tasks with proper formatting
- [ ] Priority summary visible and accurate
- [ ] Quick action buttons navigate correctly
- [ ] Empty state shown for new users
- [ ] Skeleton loading state implemented
- [ ] Error boundary implemented
- [ ] Reusable task card component created
- [ ] Date utilities created and tested
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Dark mode works correctly
- [ ] Accessibility audit passed
- [ ] Build passes (`npm run build`)
- [ ] Unit tests pass (`npm run test`)
- [ ] Manual testing checklist complete
- [ ] Code reviewed and approved

---

**Next Steps:**
1. Load this feature using the feature skill
2. Create branch `feature/P2-F2-dashboard-overview`
3. Implement in order: Date utilities → Skeleton/Error → Stats → Upcoming → Empty state → Page
4. Test thoroughly
5. Build and commit
