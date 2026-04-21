# Feature Specification: P2-F3 - Task Management (CRUD)

**Phase:** 2 - Core Product  
**Feature ID:** P2-F3  
**Feature Name:** Task Management (CRUD)  
**Status:** Draft - Ready for Implementation  
**Date:** 2026-04-21

---

## 1. Goals

### Primary Goal
Implement complete task lifecycle management so authenticated users can create, view, edit, complete, archive, and delete their personal tasks. This is the central feature of TaskFlow and the main reason users interact with the application.

### Secondary Goals
- Provide a rich task list view at `/tasks` with sorting, filtering, and grouping capabilities (basic filters; advanced filters in P2-F5)
- Provide a dedicated task detail view at `/tasks/[taskId]`
- Enable quick task creation from both dashboard and task list
- Support task status transitions (todo → in_progress → done → archived)
- Allow users to assign categories, set priorities, and define due dates
- Implement confirmation dialogs for destructive actions (delete, archive)
- Ensure all data is strictly scoped to the authenticated user
- Update the existing `task-card.tsx` to link to the correct detail route

---

## 2. Scope

### In Scope

#### Task List Page
1. **`/tasks`** - Main task list page (Server Component)
2. **`app/(app)/tasks/loading.tsx`** - Skeleton loading UI
3. **`app/(app)/tasks/error.tsx`** - Error boundary (Client Component)

#### Task Detail Page
1. **`/tasks/[taskId]`** - Individual task detail page (Server Component)
2. **`app/(app)/tasks/[taskId]/loading.tsx`** - Detail skeleton
3. **`app/(app)/tasks/[taskId]/error.tsx`** - Detail error boundary
4. **`app/(app)/tasks/[taskId]/not-found.tsx`** - 404 when task doesn't exist or belongs to another user

#### Task Forms & Dialogs
1. **Create Task Dialog** - Modal/dialog for creating new tasks
2. **Edit Task Dialog** - Modal/dialog for editing existing tasks
3. **Delete Confirmation Dialog** - Confirmation before permanent deletion
4. **Archive Confirmation Dialog** - Confirmation before archiving

#### Server Actions
1. **`lib/actions/task.ts`** - All task mutations
   - `createTaskAction`
   - `updateTaskAction`
   - `deleteTaskAction`
   - `toggleTaskCompletionAction`
   - `archiveTaskAction`

#### Validation Schemas
1. **`lib/validation/task.ts`** - Zod v4 schemas
   - `createTaskSchema`
   - `updateTaskSchema`

#### Data Layer
1. **`lib/data/task.ts`** - Task queries
   - `getTasks(userId, filters?)`
   - `getTaskById(userId, taskId)`
   - `getTaskCount(userId)`

#### Components
1. **`components/tasks/task-list.tsx`** - Task list container
2. **`components/tasks/task-item.tsx`** - Row/item for task list (updated from task-card)
3. **`components/tasks/task-form.tsx`** - Reusable create/edit form
4. **`components/tasks/task-detail-view.tsx`** - Detail page content
5. **`components/tasks/create-task-dialog.tsx`** - Create dialog wrapper
6. **`components/tasks/edit-task-dialog.tsx`** - Edit dialog wrapper
7. **`components/tasks/delete-task-dialog.tsx`** - Delete confirmation
8. **`components/tasks/archive-task-dialog.tsx`** - Archive confirmation
9. **`components/tasks/task-filters.tsx`** - Basic filter bar (status, priority)
10. **`components/tasks/task-skeleton.tsx`** - Loading skeletons

### Out of Scope
- Advanced filtering and search (covered in P2-F5 Filters & Sorting)
- Category management UI (covered in P2-F4 Categories)
- Bulk operations (post-MVP)
- Recurring tasks (post-MVP)
- Task comments/attachments (post-MVP)
- Drag-and-drop reordering (post-MVP)

---

## 3. Requirements

### 3.1 Functional Requirements

#### REQ-001: Task List Page
**Priority:** P0  
**Description:** Display all user tasks at `/tasks`

**Acceptance Criteria:**
- [ ] Page displays at `/tasks` route
- [ ] Page is a Server Component that fetches tasks on the server
- [ ] Shows list of all tasks scoped to authenticated `userId`
- [ ] Tasks ordered by default: due date ascending (nulls last), then priority descending, then created at descending
- [ ] Each task shows: title, status badge, priority badge, due date, category name/color
- [ ] Completed tasks are visually distinct (strikethrough, muted colors)
- [ ] Archived tasks excluded from default view (visible only via filter)
- [ ] Clicking a task navigates to `/tasks/[taskId]`
- [ ] Empty state shown when user has no tasks
- [ ] "Create Task" button opens create dialog
- [ ] Loading skeleton shown while data fetches

#### REQ-002: Task Detail Page
**Priority:** P0  
**Description:** Show full task details at `/tasks/[taskId]`

**Acceptance Criteria:**
- [ ] Page displays at `/tasks/[taskId]` route
- [ ] Server Component fetches task by ID scoped to `userId`
- [ ] Shows all task fields: title, description, status, priority, due date, category, created/updated timestamps
- [ ] Description supports multi-line text rendering
- [ ] Includes "Edit" button that opens edit dialog
- [ ] Includes "Mark Complete / Reopen" button
- [ ] Includes "Archive" button (for non-archived tasks)
- [ ] Includes "Delete" button with confirmation
- [ ] Shows 404 `not-found.tsx` if task doesn't exist or belongs to another user
- [ ] "Back to tasks" link returns to `/tasks`

#### REQ-003: Create Task
**Priority:** P0  
**Description:** Allow users to create new tasks

**Acceptance Criteria:**
- [ ] Create task dialog accessible from `/tasks` page and dashboard quick actions
- [ ] Form fields: title (required), description (optional), status (default: todo), priority (default: medium), due date (optional), category (optional dropdown)
- [ ] Uses React Hook Form with `createTaskSchema` validation
- [ ] Title must be 1-200 characters
- [ ] Description limited to 2000 characters
- [ ] Category dropdown populated with user's categories
- [ ] Due date picker uses date input with clear option
- [ ] Submit button shows "Create Task" with loading spinner
- [ ] On success: dialog closes, toast shows "Task created", list updates
- [ ] On error: toast shows error message, dialog stays open
- [ ] `revalidatePath('/dashboard')` and `revalidatePath('/tasks')` called after creation

#### REQ-004: Edit Task
**Priority:** P0  
**Description:** Allow users to edit existing tasks

**Acceptance Criteria:**
- [ ] Edit dialog opens from task detail page or task list (future: inline editing)
- [ ] Form pre-populated with current task values
- [ ] Uses React Hook Form with `updateTaskSchema` validation
- [ ] Same field constraints as create
- [ ] Submit button shows "Save Changes" with loading spinner
- [ ] On success: dialog closes, toast shows "Task updated", page updates
- [ ] On error: toast shows error message, dialog stays open
- [ ] `revalidatePath('/dashboard')` and `revalidatePath('/tasks')` called after update
- [ ] `revalidatePath('/tasks/[taskId]')` called after update

#### REQ-005: Delete Task
**Priority:** P0  
**Description:** Allow users to permanently delete tasks

**Acceptance Criteria:**
- [ ] Delete action requires confirmation dialog
- [ ] Dialog shows: "Are you sure? This action cannot be undone."
- [ ] Dialog shows task title being deleted
- [ ] Confirm button is destructive (red)
- [ ] On success: dialog closes, toast shows "Task deleted", user redirected to `/tasks` if on detail page
- [ ] On error: toast shows error message
- [ ] `revalidatePath('/dashboard')` and `revalidatePath('/tasks')` called after deletion

#### REQ-006: Toggle Task Completion
**Priority:** P0  
**Description:** Quick action to mark task as done or reopen it

**Acceptance Criteria:**
- [ ] Checkbox or button on task list item and detail page
- [ ] Clicking marks task as `done` and sets `completedAt` to current timestamp
- [ ] Clicking again (if done) marks as `todo` and clears `completedAt`
- [ ] Visual feedback immediately (optimistic UI preferred, but server action acceptable)
- [ ] Toast notification on success: "Task completed" or "Task reopened"
- [ ] `revalidatePath('/dashboard')` and `revalidatePath('/tasks')` called

#### REQ-007: Archive Task
**Priority:** P1  
**Description:** Move completed or stale tasks to archived status

**Acceptance Criteria:**
- [ ] Archive action available on task detail page and via context menu
- [ ] Confirmation dialog: "Archive this task? It will be hidden from default views."
- [ ] Sets status to `archived`
- [ ] Archived tasks excluded from default task list
- [ ] Toast: "Task archived"
- [ ] `revalidatePath('/dashboard')` and `revalidatePath('/tasks')` called

#### REQ-008: Basic Filters
**Priority:** P1  
**Description:** Simple filtering on task list

**Acceptance Criteria:**
- [ ] Filter by status: all, todo, in_progress, done, archived
- [ ] Filter by priority: all, high, medium, low
- [ ] Filter state managed via URL query params (e.g., `?status=todo&priority=high`)
- [ ] Filters compose together (AND logic)
- [ ] "Clear filters" button resets to default
- [ ] Result count shown: "Showing X tasks"

#### REQ-009: Task Card/Item Update
**Priority:** P0  
**Description:** Update existing task-card to link correctly

**Acceptance Criteria:**
- [ ] Update `components/tasks/task-card.tsx` link from `/tasks?taskId=...` to `/tasks/${task.id}`
- [ ] Ensure task-card works in both dashboard (compact) and task list (expanded) contexts
- [ ] Add completion checkbox to task list variant

#### REQ-010: Empty States
**Priority:** P0  
**Description:** Meaningful UI when no tasks exist or no tasks match filters

**Acceptance Criteria:**
- [ ] No tasks at all: "No tasks yet" with "Create your first task" CTA
- [ ] No tasks match filters: "No tasks match your filters" with "Clear filters" CTA
- [ ] Responsive and visually engaging

### 3.2 Technical Requirements

#### REQ-011: Server Actions
**Priority:** P0  
**Description:** All mutations via Server Actions

**Acceptance Criteria:**
- [ ] `lib/actions/task.ts` contains all task actions
- [ ] Each action validates input with Zod schema
- [ ] Each action checks authentication and scopes by `userId`
- [ ] Each action returns `{ success, data?, error? }`
- [ ] Each action calls `revalidatePath` for affected routes
- [ ] Use try/catch for error handling
- [ ] No raw SQL; use Drizzle ORM exclusively

#### REQ-012: Validation Schemas
**Priority:** P0  
**Description:** Zod v4 schemas for task operations

**Acceptance Criteria:**
- [ ] `createTaskSchema` in `lib/validation/task.ts`
- [ ] `updateTaskSchema` in `lib/validation/task.ts` (includes `id` field)
- [ ] Title: `z.string().min(1).max(200)`
- [ ] Description: `z.string().max(2000).optional()`
- [ ] Status: `z.enum(['todo', 'in_progress', 'done', 'archived'])`
- [ ] Priority: `z.enum(['low', 'medium', 'high'])`
- [ ] Due date: `z.iso.datetime().optional()` or date string parser
- [ ] Category ID: `z.uuid().optional()` or `z.string().uuid().optional()`
- [ ] Export inferred types: `CreateTaskInput`, `UpdateTaskInput`

#### REQ-013: Data Fetching
**Priority:** P0  
**Description:** Server-side queries with Drizzle

**Acceptance Criteria:**
- [ ] `lib/data/task.ts` contains query functions
- [ ] `getTasks(userId, options?)` returns tasks with category joined
- [ ] `getTaskById(userId, taskId)` returns single task or null
- [ ] `getTaskCount(userId)` returns total task count
- [ ] All queries scoped by `userId`
- [ ] Use Drizzle relations for category join where applicable
- [ ] Support basic filtering in `getTasks` (status, priority)

#### REQ-014: Component Architecture
**Priority:** P0  
**Description:** Well-organized task components

**Acceptance Criteria:**
- [ ] Server Components: page.tsx, loading.tsx, error.tsx, not-found.tsx
- [ ] Client Components: forms, dialogs, filter bar, task items with checkboxes
- [ ] Reusable `TaskForm` used by both create and edit dialogs
- [ ] Dialogs use shadcn/ui `Dialog` component
- [ ] All components typed with interfaces
- [ ] Props drilled from Server Components; minimal client state

#### REQ-015: Responsive Design
**Priority:** P0  
**Description:** Mobile-first task list and detail

**Acceptance Criteria:**
- [ ] Task list stacks vertically on mobile
- [ ] Touch targets minimum 44px
- [ ] Detail page stacks info vertically on mobile
- [ ] Dialogs full-screen on mobile (< 640px), centered modal on desktop
- [ ] Filters collapse into dropdown on mobile

#### REQ-016: Accessibility
**Priority:** P0  
**Description:** WCAG-compliant task management

**Acceptance Criteria:**
- [ ] All form inputs have associated labels
- [ ] Checkboxes have accessible labels
- [ ] Dialogs trap focus and support Escape to close
- [ ] Destructive actions have clear confirmation
- [ ] Color not sole indicator of status (icons + text)
- [ ] Keyboard accessible task actions

### 3.3 Non-Functional Requirements

#### REQ-017: Performance
- [ ] Task list queries use indexed columns (user_id, status, due_date, priority)
- [ ] No N+1 queries (join categories in single query)
- [ ] Skeleton UI shown immediately
- [ ] Dialogs open without full page reload

#### REQ-018: Security
- [ ] Every mutation scoped by `userId`
- [ ] Task ID params validated (Zod UUID)
- [ ] 404 returned for cross-user task access attempts (don't leak existence)
- [ ] No sensitive data in client-side props

---

## 4. UI Architecture

### 4.1 File Structure

```
app/(app)/
├── tasks/
│   ├── page.tsx                  # TasksPage (Server Component)
│   ├── loading.tsx               # TasksLoading (Server Component)
│   ├── error.tsx                 # TasksError (Client Component)
│   └── [taskId]/
│       ├── page.tsx              # TaskDetailPage (Server Component)
│       ├── loading.tsx           # TaskDetailLoading
│       ├── error.tsx             # TaskDetailError
│       └── not-found.tsx         # TaskNotFound

components/tasks/
├── task-list.tsx                 # TaskList (Server Component)
├── task-item.tsx                 # TaskItem (Client Component) - row with checkbox
├── task-card.tsx                 # TaskCard (updated link)
├── task-form.tsx                 # TaskForm (Client Component) - reusable
├── task-detail-view.tsx          # TaskDetailView (Server Component)
├── create-task-dialog.tsx        # CreateTaskDialog (Client Component)
├── edit-task-dialog.tsx          # EditTaskDialog (Client Component)
├── delete-task-dialog.tsx        # DeleteTaskDialog (Client Component)
├── archive-task-dialog.tsx       # ArchiveTaskDialog (Client Component)
├── task-filters.tsx              # TaskFilters (Client Component)
└── task-skeleton.tsx             # TaskSkeleton (Client Component)

lib/
├── validation/
│   └── task.ts                   # Zod schemas
├── actions/
│   └── task.ts                   # Server actions
└── data/
    └── task.ts                   # Query functions
```

### 4.2 Component Hierarchy

```
TasksPage (Server Component)
├── getCurrentUserId() → userId
├── getTasks(userId, filters) → tasks
├── getCategories(userId) → categories (for filter dropdown)
├── TasksHeader
│   ├── Title: "Tasks"
│   ├── TaskCount
│   └── CreateTaskButton → opens CreateTaskDialog
├── TaskFilters (Client Component)
│   ├── StatusFilter
│   ├── PriorityFilter
│   └── ClearFiltersButton
└── TaskList (Server Component)
    └── tasks.map(task →
        └── TaskItem (Client Component)
            ├── Checkbox → toggleTaskCompletionAction
            ├── TaskCard (link to /tasks/[taskId])
            └── ContextMenu (Edit, Archive, Delete)

TaskDetailPage (Server Component)
├── getCurrentUserId() → userId
├── getTaskById(userId, params.taskId) → task
├── notFound() if task is null
└── TaskDetailView
    ├── TaskHeader
    │   ├── Title
    │   ├── StatusBadge
    │   └── PriorityBadge
    ├── TaskMeta
    │   ├── DueDate
    │   ├── Category
    │   └── Timestamps
    ├── TaskDescription
    └── TaskActions (Client Component)
        ├── ToggleCompleteButton
        ├── EditButton → opens EditTaskDialog
        ├── ArchiveButton → opens ArchiveTaskDialog
        └── DeleteButton → opens DeleteTaskDialog
```

### 4.3 Data Flow

```
1. User navigates to /tasks
2. proxy.ts allows request
3. AppShell renders layout
4. TasksPage (async Server Component):
   a. getCurrentUserId() → userId
   b. getTasks(userId, filters) → tasks with categories
   c. Renders TaskList with TaskItem components
5. User clicks "Create Task"
   a. CreateTaskDialog opens (Client Component)
   b. Form submission → createTaskAction (Server Action)
   c. Action validates with Zod, inserts via Drizzle
   d. revalidatePath('/dashboard'); revalidatePath('/tasks')
   e. Dialog closes, toast shown, list updates
6. User clicks checkbox on task
   a. toggleTaskCompletionAction called
   b. Action updates status and completedAt
   c. revalidatePath called
   d. UI updates
```

### 4.4 Task List Layout

```
Mobile (< 640px):
+------------------+
| Tasks      [+]   |
+------------------+
| Filter: [All ▼]  |
+------------------+
| [ ] Task title   |
|     High | Apr 22|
+------------------+
| [ ] Task title   |
|     Med  | Today |
+------------------+

Desktop (1024px+):
+------------------+----------+------------+------------+
| Tasks                               [Create Task]     |
+------------------+----------+------------+------------+
| Filter Status: [All ▼] | Filter Priority: [All ▼]     |
+------------------+----------+------------+------------+
| [ ] Task title              | High | Due Today | ...  |
| [ ] Task title              | Med  | Apr 22    | ...  |
+------------------+----------+------------+------------+
```

---

## 5. Design Specifications

### 5.1 Visual Design

#### Task List Item
- Background: `--card` token
- Border: `1px solid --border`
- Border radius: `var(--radius)` (12px)
- Padding: `16px`
- Hover: `hover:bg-accent`
- Completed: `opacity-60` + strikethrough title
- Due today: `border-primary/50 bg-primary/5`
- Overdue: `border-destructive/50 bg-destructive/5`

#### Task Detail Page
- Max-width: `768px` centered
- Header: title `text-2xl font-bold`
- Meta row: flex with badges and dates
- Description: `text-base leading-relaxed` with whitespace preservation
- Action buttons: grouped in a row with gaps

#### Task Form (Dialog)
- Dialog max-width: `520px`
- Form fields stacked vertically, gap `16px`
- Title input: full width
- Description: `Textarea` with `rows={4}`
- Status/Priority: side by side on desktop, stacked on mobile
- Due date: `Input type="date"`
- Category: `Select` dropdown
- Footer: Cancel + Submit buttons

#### Priority Badges
- High: `variant="destructive"` (red)
- Medium: `variant="secondary"` (amber)
- Low: `variant="default"` (blue)

#### Status Badges
- Todo: `variant="outline"` (gray)
- In Progress: `variant="secondary"` (blue)
- Done: `variant="default"` (green)
- Archived: `variant="outline"` + `opacity-60`

### 5.2 Responsive Breakpoints

```css
/* Mobile First */
.task-list { @apply flex flex-col gap-3; }
.task-item { @apply flex items-start gap-3 p-3; }
.task-form-grid { @apply grid grid-cols-1 gap-4; }

/* Tablet+ */
@media (min-width: 640px) {
  .task-form-grid { @apply grid-cols-2; }
  .task-form-grid .full-width { @apply col-span-2; }
}

/* Desktop */
@media (min-width: 1024px) {
  .task-detail { @apply max-w-3xl mx-auto; }
}
```

### 5.3 Spacing & Typography

- Page title: `text-2xl font-bold tracking-tight`
- Section gap: `24px` (`gap-6`)
- Card gap: `12px` (`gap-3`)
- Dialog title: `text-lg font-semibold`
- Form label: `text-sm font-medium`

---

## 6. Data Queries & Actions

### 6.1 Task Queries

```typescript
// lib/data/task.ts
import { eq, and, desc, asc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks, categories } from "@/lib/db/schema";

export interface GetTasksOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
}

export async function getTasks(userId: string, options?: GetTasksOptions) {
  const conditions = [eq(tasks.userId, userId)];
  
  if (options?.status) {
    conditions.push(eq(tasks.status, options.status));
  }
  if (options?.priority) {
    conditions.push(eq(tasks.priority, options.priority));
  }

  return db.query.tasks.findMany({
    where: and(...conditions),
    orderBy: [
      asc(tasks.dueDate),
      desc(tasks.priority),
      desc(tasks.createdAt),
    ],
    with: { category: true },
  });
}

export async function getTaskById(userId: string, taskId: string) {
  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, taskId), eq(tasks.userId, userId)),
    with: { category: true },
  });
  return task ?? null;
}
```

### 6.2 Server Actions

```typescript
// lib/actions/task.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createTaskSchema, updateTaskSchema } from "@/lib/validation/task";
import { getCurrentUserId } from "@/lib/auth/session";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createTaskAction(input: CreateTaskInput): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    const validated = createTaskSchema.parse(input);
    
    const [task] = await db.insert(tasks).values({
      ...validated,
      userId,
    }).returning();
    
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    return { success: true, data: task };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to create task" };
  }
}

export async function toggleTaskCompletionAction(taskId: string): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    
    const task = await db.query.tasks.findFirst({
      where: and(eq(tasks.id, taskId), eq(tasks.userId, userId)),
    });
    
    if (!task) return { success: false, error: "Task not found" };
    
    const isDone = task.status === "done";
    
    await db.update(tasks)
      .set({
        status: isDone ? "todo" : "done",
        completedAt: isDone ? null : new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
    
    revalidatePath("/dashboard");
    revalidatePath("/tasks");
    revalidatePath(`/tasks/${taskId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to update task" };
  }
}
```

### 6.3 Validation Schemas

```typescript
// lib/validation/task.ts
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
  status: z.enum(["todo", "in_progress", "done", "archived"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().datetime().optional().or(z.literal("")),
  categoryId: z.string().uuid().optional().or(z.literal("")),
});

export const updateTaskSchema = createTaskSchema.extend({
  id: z.string().uuid(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
```

---

## 7. Acceptance Criteria Summary

### Page-Level Criteria

| Page | Route | Criteria |
|------|-------|----------|
| Task List | `/tasks` | Shows all user tasks, supports filters, empty state |
| Task Detail | `/tasks/[taskId]` | Shows full details, actions, 404 for invalid IDs |
| Loading | `/tasks` | Skeleton matches layout |
| Error | `/tasks` | Friendly error with retry |

### Functional Criteria

| Feature | Test Case |
|---------|-----------|
| Create | Task appears immediately after creation |
| Create | Invalid title rejected (empty or >200 chars) |
| Edit | Changes persist and reflect in list/detail |
| Delete | Task removed, redirect from detail to list |
| Toggle | Done sets completedAt; reopen clears it |
| Archive | Sets status archived, hidden from default |
| Filters | URL params update, results filter correctly |
| Security | Cannot access/edit another user's task |

### Integration Criteria

| Component | Integration |
|-----------|-------------|
| TaskForm | React Hook Form + Zod |
| TaskActions | Calls correct server action |
| TaskList | Drizzle query scoped by userId |
| Mutations | revalidatePath for /dashboard and /tasks |

---

## 8. Testing Strategy

### Unit Tests

**Task Actions (`lib/actions/__tests__/task.test.ts`)**
- [ ] createTaskAction creates task with valid input
- [ ] createTaskAction rejects invalid title
- [ ] createTaskAction rejects unauthenticated user
- [ ] toggleTaskCompletionAction toggles status and completedAt
- [ ] toggleTaskCompletionAction returns error for non-existent task
- [ ] deleteTaskAction removes task scoped to user
- [ ] deleteTaskAction fails for another user's task

**Task Validation (`lib/validation/task.test.ts`)**
- [ ] createTaskSchema accepts valid input
- [ ] createTaskSchema rejects empty title
- [ ] createTaskSchema rejects title > 200 chars
- [ ] createTaskSchema rejects description > 2000 chars
- [ ] updateTaskSchema requires valid UUID id

### Manual Testing Checklist

#### Task List
- [ ] Page loads with user's tasks
- [ ] Empty state shown for new user
- [ ] Filter by status works
- [ ] Filter by priority works
- [ ] Combined filters work
- [ ] Clear filters resets view

#### Task Creation
- [ ] Create dialog opens from list and dashboard
- [ ] Form validates empty title
- [ ] Form validates long title
- [ ] Task created with all fields
- [ ] Task created with only title
- [ ] Appears in list after creation
- [ ] Dashboard stats update

#### Task Detail
- [ ] Navigates from list click
- [ ] Shows all fields correctly
- [ ] 404 shown for fake ID
- [ ] 404 shown for other user's task ID
- [ ] Edit opens pre-populated dialog
- [ ] Delete shows confirmation
- [ ] Archive shows confirmation

#### Task Editing
- [ ] Edit dialog pre-populated
- [ ] Save updates task
- [ ] Cancel discards changes

#### Task Completion
- [ ] Checkbox marks done
- [ ] Checkbox reopens done task
- [ ] completedAt timestamp set correctly

#### Responsive
- [ ] Mobile (320px): list readable, dialogs usable
- [ ] Tablet (768px): filters side by side
- [ ] Desktop (1024px): comfortable spacing

---

## 9. Implementation Notes

### Dependencies Already Installed
- `drizzle-orm` - Database queries
- `zod` - Validation
- `react-hook-form` + `@hookform/resolvers` - Forms
- `lucide-react` - Icons
- `sonner` - Toasts
- `tailwindcss` - Styling
- shadcn/ui components: Button, Input, Textarea, Select, Dialog, Badge, Checkbox, Skeleton, Label

### Existing Components to Update
- `components/tasks/task-card.tsx` - Update link href from `/tasks?taskId=...` to `/tasks/${task.id}`

### Date Handling
- Due date stored as ISO timestamp in database
- Input uses native `type="date"` or `type="datetime-local"`
- Convert to Date object before Drizzle insert
- Display formatted using `lib/utils/date.ts` utilities from P2-F2

### Category Dropdown
- Populate from `lib/data/category.ts` (to be created in P2-F4)
- For now, can query categories directly in form or accept empty list
- Allow "No category" option

### Revalidation Strategy
All task mutations must revalidate:
```typescript
revalidatePath("/dashboard");
revalidatePath("/tasks");
revalidatePath(`/tasks/${taskId}`);
```

---

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Category data not ready (P2-F4) | Medium | Allow null categoryId; query categories inline if needed |
| Dialog state management complexity | Low | Use shadcn Dialog with controlled open state |
| Filter URL param parsing | Low | Use `useSearchParams` with Zod validation |
| Race condition on rapid toggles | Low | Disable checkbox during server action pending |
| Large task lists performance | Medium | Add pagination if list exceeds 50 items (defer to P2-F5) |

---

## 11. Related Documentation

- **PRD.md** §6.3 - Task Management requirements
- **coding-standards.md** - TypeScript, React, Tailwind v4, Drizzle conventions
- **ai-interaction.md** - Workflow for implementation
- **lib/db/schema.ts** - Database schema reference
- **P2-F2 Dashboard Overview** - task-card.tsx, date utilities, data patterns
- **P2-F4 Categories** - Category CRUD (upcoming; may need coordination)

---

## 12. Definition of Done

- [ ] Task list page at `/tasks` with real data
- [ ] Task detail page at `/tasks/[taskId]` with full CRUD actions
- [ ] Create task dialog functional from dashboard and task list
- [ ] Edit task dialog functional
- [ ] Delete task with confirmation dialog
- [ ] Toggle completion works with status + completedAt updates
- [ ] Archive task works
- [ ] Basic filters (status, priority) functional with URL params
- [ ] Empty states for no tasks and no filter matches
- [ ] Loading skeletons implemented
- [ ] Error boundaries implemented
- [ ] 404 shown for invalid/missing task IDs
- [ ] All server actions validate input and scope by userId
- [ ] `revalidatePath` called for all mutations
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
2. Create branch `feature/P2-F3-task-management`
3. Implement in order: Validation → Data Layer → Server Actions → TaskForm → Dialogs → TaskList → TaskDetail → Pages → Filters
4. Test thoroughly
5. Build and commit
