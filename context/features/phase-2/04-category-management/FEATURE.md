# Feature Specification: P2-F4 - Category Management

**Phase:** 2 - Core Product  
**Feature ID:** P2-F4  
**Feature Name:** Category Management  
**Status:** Draft - Ready for Implementation  
**Date:** 2026-04-22

---

## 1. Goals

### Primary Goal
Implement complete category management so authenticated users can create, rename, delete, and assign personal categories to organize their tasks. Categories provide a grouping mechanism across the task list and dashboard views.

### Secondary Goals
- Provide a dedicated `/categories` page for managing categories (list, create, edit, delete)
- Integrate category selection into the existing task create/edit form (`TaskForm`)
- Add category filtering to the task list page (`TaskFilters`)
- Display category badges on task cards and detail views
- Enforce unique category names per user
- Handle category deletion gracefully by setting associated tasks' `categoryId` to `null`
- Ensure all data is strictly scoped to the authenticated user
- Support optional color for each category, displayed as colored badges/dots throughout the app

---

## 2. Scope

### In Scope

#### Category Management Page
1. **`/categories`** - Main categories page (Server Component)
2. **`app/(app)/categories/loading.tsx`** - Skeleton loading UI
3. **`app/(app)/categories/error.tsx`** - Error boundary (Client Component)

#### Category Forms & Dialogs
1. **Create Category Dialog** - Modal/dialog for creating new categories
2. **Edit Category Dialog** - Modal/dialog for renaming categories
3. **Delete Category Confirmation Dialog** - Confirmation before deletion

#### Server Actions
1. **`lib/actions/category.ts`** - All category mutations
   - `createCategoryAction`
   - `updateCategoryAction`
   - `deleteCategoryAction`

#### Validation Schemas
1. **`lib/validation/category.ts`** - Zod v4 schemas
   - `createCategorySchema`
   - `updateCategorySchema`

#### Data Layer
1. **`lib/data/category.ts`** - Category queries
   - `getCategories(userId)`
   - `getCategoryById(userId, categoryId)`
   - `getCategoryWithTaskCount(userId, categoryId)`

#### Component Updates
1. **Update `components/tasks/task-form.tsx`** - Add category dropdown
2. **Update `components/tasks/task-filters.tsx`** - Add category filter
3. **Update `components/tasks/task-item.tsx`** - Display category badge
4. **Update `components/tasks/task-detail-view.tsx`** - Display category badge
5. **Update `components/dashboard/upcoming-tasks.tsx`** - Display category badge on task cards

### Out of Scope
- Category icons or emoji (post-MVP)
- Category descriptions (post-MVP)
- Reassignment of tasks to another category on category deletion (beyond setting `categoryId` to `null`)
- Bulk category operations (post-MVP)
- Category-based analytics or reporting (post-MVP)
- Drag-and-drop reordering of categories (post-MVP)

---

## 3. Requirements

### 3.1 Functional Requirements

#### REQ-001: Categories Page
**Priority:** P0  
**Description:** Display all user categories at `/categories`

**Acceptance Criteria:**
- [ ] Page displays at `/categories` route
- [ ] Page is a Server Component that fetches categories on the server
- [ ] Shows list of all categories scoped to authenticated `userId`
- [ ] Categories ordered alphabetically by name
- [ ] Each category row shows: name, color dot/badge, task count, edit button, delete button
- [ ] "Create Category" button in page header opens create dialog
- [ ] Empty state shown when user has no categories: "No categories yet" with CTA to create first category
- [ ] Loading skeleton shown while data fetches
- [ ] Error boundary handles fetch failures gracefully

#### REQ-002: Create Category
**Priority:** P0  
**Description:** Allow users to create new categories

**Acceptance Criteria:**
- [ ] Create category dialog accessible from `/categories` page
- [ ] Form fields: name (required), color (optional, via color picker or preset palette)
- [ ] Uses React Hook Form with `createCategorySchema` validation
- [ ] Name must be 1-50 characters
- [ ] Name must be unique per user (server validates, shows error if duplicate)
- [ ] Color is optional; defaults to a neutral/gray if not specified
- [ ] Color picker provides preset palette of 8-12 curated colors
- [ ] Submit button shows "Create Category" with loading spinner
- [ ] On success: dialog closes, toast shows "Category created", list updates
- [ ] On error (duplicate name): shows "A category with this name already exists" inline
- [ ] `revalidatePath('/categories')` and `revalidatePath('/tasks')` called after creation
- [ ] `revalidatePath('/dashboard')` called after creation

#### REQ-003: Update Category
**Priority:** P0  
**Description:** Allow users to rename or recolor categories

**Acceptance Criteria:**
- [ ] Edit dialog opens from category list (edit icon/button)
- [ ] Form pre-populated with current category name and color
- [ ] Uses React Hook Form with `updateCategorySchema` validation
- [ ] Same field constraints as create (name 1-50 chars)
- [ ] Name uniqueness check excludes the current category
- [ ] Submit button shows "Save Changes" with loading spinner
- [ ] On success: dialog closes, toast shows "Category updated", list updates
- [ ] On error: shows error message, dialog stays open
- [ ] `revalidatePath('/categories')`, `revalidatePath('/tasks')`, and `revalidatePath('/dashboard')` called after update
- [ ] Category changes reflect immediately in task forms and task displays

#### REQ-004: Delete Category
**Priority:** P0  
**Description:** Allow users to delete categories

**Acceptance Criteria:**
- [ ] Delete action requires confirmation dialog
- [ ] Dialog shows: "Delete '{categoryName}'?" with warning "X tasks will become uncategorized"
- [ ] Dialog shows count of tasks that will be affected
- [ ] Confirm button is destructive (red variant)
- [ ] On success: dialog closes, toast shows "Category deleted", list updates
- [ ] On error: toast shows error message
- [ ] Deleting a category sets all associated tasks' `categoryId` to `null` (database `onDelete: set null` already defined in schema)
- [ ] `revalidatePath('/categories')`, `revalidatePath('/tasks')`, and `revalidatePath('/dashboard')` called after deletion
- [ ] Tasks that lost their category are NOT deleted

#### REQ-005: Category in Task Form
**Priority:** P0  
**Description:** Add category selection to task create/edit form

**Acceptance Criteria:**
- [ ] `TaskForm` includes a "Category" dropdown/select field
- [ ] Dropdown populated with user's categories from `getCategoriesForUser(userId)`
- [ ] Option to leave category unassigned ("No category" or placeholder)
- [ ] Category selection persisted with task on create/update
- [ ] Edit form shows current category pre-selected
- [ ] Category dropdown shows color dot next to category name
- [ ] Works in both `CreateTaskDialog` and `EditTaskDialog`

#### REQ-006: Category Filter in Task List
**Priority:** P1  
**Description:** Add category filter to task list page

**Acceptance Criteria:**
- [ ] `TaskFilters` includes a "Category" filter dropdown
- [ ] Filter options: "All Categories", then each user category by name
- [ ] Filter state managed via URL query params (e.g., `?status=todo&category=uuid`)
- [ ] Category filter composes with existing status and priority filters (AND logic)
- [ ] "Clear filters" resets category filter along with others
- [ ] Filter dropdown shows color dot next to category name

#### REQ-007: Category Display on Tasks
**Priority:** P1  
**Description:** Show category badges on task items and detail views

**Acceptance Criteria:**
- [ ] `TaskItem` shows category color dot + name as badge when category assigned
- [ ] `TaskDetailView` shows category badge in metadata section
- [ ] Category badge is subtle (not prominent) on list items
- [ ] Category badge is more detailed on detail view (name + color)
- [ ] Tasks without a category show no badge (clean, no "Uncategorized" label)
- [ ] `DashboardUpcomingTasks` shows category dot/badge on task cards

#### REQ-008: Empty States
**Priority:** P0  
**Description:** Meaningful UI when no categories exist

**Acceptance Criteria:**
- [ ] No categories at all: "No categories yet" with "Create your first category" CTA
- [ ] Empty state is visually engaging (icon + text)
- [ ] Responsive on all screen sizes

### 3.2 Technical Requirements

#### REQ-009: Server Actions
**Priority:** P0  
**Description:** All mutations via Server Actions

**Acceptance Criteria:**
- [ ] `lib/actions/category.ts` contains all category actions
- [ ] Each action validates input with Zod schema
- [ ] Each action checks authentication and scopes by `userId`
- [ ] Each action returns `{ success, data?, error? }`
- [ ] Each action calls `revalidatePath` for affected routes
- [ ] Use try/catch for error handling
- [ ] No raw SQL; use Drizzle ORM exclusively
- [ ] Duplicate name check returns clear error message

#### REQ-010: Validation Schemas
**Priority:** P0  
**Description:** Zod v4 schemas for category operations

**Acceptance Criteria:**
- [ ] `createCategorySchema` in `lib/validation/category.ts`
- [ ] `updateCategorySchema` in `lib/validation/category.ts` (includes `id` field)
- [ ] Name: `z.string().min(1).max(50)`
- [ ] Color: `z.string().regex(/^#[0-9a-fA-F]{6}$/).optional()` (hex color validation)
- [ ] Export inferred types: `CreateCategoryInput`, `UpdateCategoryInput`

#### REQ-011: Data Fetching
**Priority:** P0  
**Description:** Server-side queries with Drizzle

**Acceptance Criteria:**
- [ ] `lib/data/category.ts` contains query functions
- [ ] `getCategories(userId)` returns categories ordered by name
- [ ] `getCategoryById(userId, categoryId)` returns single category or null
- [ ] `getCategoryWithTaskCount(userId, categoryId)` returns category with task count
- [ ] All queries scoped by `userId`
- [ ] Use Drizzle relations where applicable

#### REQ-012: Component Architecture
**Priority:** P0  
**Description:** Well-organized category components

**Acceptance Criteria:**
- [ ] Server Components: page.tsx, loading.tsx, error.tsx
- [ ] Client Components: forms, dialogs
- [ ] Reusable `CategoryForm` used by both create and edit dialogs
- [ ] Dialogs use shadcn/ui `Dialog` component
- [ ] All components typed with interfaces
- [ ] Existing components updated cleanly without breaking changes

#### REQ-013: Responsive Design
**Priority:** P0  
**Description:** Mobile-first category management

**Acceptance Criteria:**
- [ ] Category list stacks vertically on mobile
- [ ] Touch targets minimum 44px
- [ ] Dialogs full-screen on mobile (< 640px), centered modal on desktop
- [ ] Category color dots visible on all screen sizes

#### REQ-014: Accessibility
**Priority:** P0  
**Description:** WCAG-compliant category management

**Acceptance Criteria:**
- [ ] All form inputs have associated labels
- [ ] Dialogs trap focus and support Escape to close
- [ ] Destructive delete action has clear confirmation
- [ ] Color not sole indicator (text label + color dot)
- [ ] Keyboard accessible category actions

### 3.3 Non-Functional Requirements

#### REQ-015: Performance
- [ ] Category list query uses indexed column (user_id, name)
- [ ] Task count per category computed efficiently (single query or join)
- [ ] No N+1 queries
- [ ] Skeleton UI shown immediately

#### REQ-016: Security
- [ ] Every mutation scoped by `userId`
- [ ] Category ID params validated (Zod UUID)
- [ ] Cannot access or modify another user's categories
- [ ] Duplicate name check is race-condition-aware (DB unique constraint exists)

---

## 4. UI Architecture

### 4.1 File Structure

```
app/(app)/
├── categories/
│   ├── page.tsx                  # CategoriesPage (Server Component)
│   ├── loading.tsx               # CategoriesLoading (Server Component)
│   └── error.tsx                 # CategoriesError (Client Component)

components/categories/
├── category-list.tsx              # CategoryList (Server Component)
├── category-item.tsx              # CategoryItem (Client Component) - row with actions
├── category-form.tsx             # CategoryForm (Client Component) - reusable create/edit
├── create-category-dialog.tsx     # CreateCategoryDialog (Client Component)
├── edit-category-dialog.tsx      # EditCategoryDialog (Client Component)
├── delete-category-dialog.tsx     # DeleteCategoryDialog (Client Component)
├── category-badge.tsx            # CategoryBadge (Server/Client Component) - reusable badge
├── color-picker.tsx              # ColorPicker (Client Component) - preset palette
└── category-skeleton.tsx        # CategorySkeleton (Client Component)

lib/
├── validation/
│   └── category.ts               # Zod schemas
├── actions/
│   └── category.ts               # Server actions
└── data/
    └── category.ts               # Query functions
```

### 4.2 Component Hierarchy

```
CategoriesPage (Server Component)
├── getCurrentUserId() → userId
├── getCategories(userId) → categories (with task counts)
├── CategoriesHeader
│   ├── Title: "Categories"
│   ├── Subtitle: "{count} categories"
│   └── CreateCategoryButton → opens CreateCategoryDialog
└── Conditional: hasCategories?
    ├── YES → CategoryList (Server Component)
    │   └── categories.map(category →
    │       └── CategoryItem (Client Component)
    │           ├── CategoryBadge (color + name)
    │           ├── TaskCount
    │           ├── EditButton → opens EditCategoryDialog
    │           └── DeleteButton → opens DeleteCategoryDialog
    └── NO → EmptyState
        ├── Icon (Tags)
        ├── "No categories yet"
        └── "Create your first category" button
```

### 4.3 Data Flow

```
1. User navigates to /categories
2. proxy.ts allows request
3. AppShell renders layout
4. CategoriesPage (async Server Component):
   a. getCurrentUserId() → userId
   b. getCategories(userId) → categories with task counts
   c. Renders CategoryList with CategoryItem components
5. User clicks "Create Category"
   a. CreateCategoryDialog opens (Client Component)
   b. CategoryForm renders name input + color picker
   c. Form submission → createCategoryAction (Server Action)
   d. Action validates with Zod, checks uniqueness, inserts via Drizzle
   e. revalidatePath('/categories'); revalidatePath('/tasks'); revalidatePath('/dashboard')
   f. Dialog closes, toast shown, list updates
6. User clicks "Edit" on a category
   a. EditCategoryDialog opens pre-populated
   b. Form submission → updateCategoryAction
   c. Action validates, checks uniqueness (excluding current), updates via Drizzle
   d. revalidatePath called for all affected routes
   e. Dialog closes, toast shown, list updates
7. User clicks "Delete" on a category
   a. DeleteCategoryDialog opens with category name and affected task count
   b. Confirm → deleteCategoryAction
   c. Action deletes category (DB onDelete sets tasks.categoryId to null)
   d. revalidatePath called for all affected routes
   e. Dialog closes, toast shown, list updates
```

### 4.4 Categories Page Layout

```
Mobile (< 640px):
+---------------------------+
| Categories       [+ New]  |
+---------------------------+
| 🔴 Work          (12) [-] |
|    Edit  Delete            |
+---------------------------+
| 🔵 Personal      (5)  [-] |
|    Edit  Delete            |
+---------------------------+
| 🟢 Health        (3)  [-] |
|    Edit  Delete            |
+---------------------------+

Desktop (1024px+):
+-------------------------------------------+
| Categories                      [+ New Category] |
+-------------------------------------------+
| 🔴 Work          | 12 tasks    | ✏️ 🗑️    |
| 🔵 Personal      | 5 tasks     | ✏️ 🗑️    |
| 🟢 Health        | 3 tasks     | ✏️ 🗑️    |
+-------------------------------------------+
```

### 4.5 Create/Edit Category Dialog

```
+-------------------------------------------+
| Create Category                     [✕]   |
+-------------------------------------------+
|                                           |
|  Name *                                   |
|  [_____________________________________]  |
|                                           |
|  Color                                    |
|  🔴 🔵 🟢 🟡 🟣 🟠 🩷 ⬜               |
|                                           |
|           [Cancel]  [Create Category]      |
+-------------------------------------------+
```

### 4.6 Delete Category Confirmation Dialog

```
+-------------------------------------------+
| Delete Category                           |
+-------------------------------------------+
|                                           |
|  Are you sure you want to delete "Work"?  |
|                                           |
|  ⚠️ 12 tasks will become uncategorized.   |
|                                           |
|  This action cannot be undone.            |
|                                           |
|           [Cancel]  [Delete]               |
+-------------------------------------------+
```

---

## 5. Design Specifications

### 5.1 Visual Design

#### Category List Item
- Background: `--card` token
- Border: `1px solid --border`
- Border radius: `var(--radius)` (8px for list items)
- Padding: `12px 16px`
- Hover: `hover:bg-accent`
- Layout: flex row, items centered, space between

#### Category Badge
- Small dot: `h-2.5 w-2.5 rounded-full` with category color
- Inline variant (task list): dot + name, `text-xs`
- Chip variant (task detail): dot + name, `text-sm` with light background

#### Color Picker
- Grid of preset color swatches
- Each swatch: `h-8 w-8 rounded-full` with border on hover
- Selected state: ring/outline around swatch
- Preset colors (12 curated options):
  - `#EF4444` (Red), `#F97316` (Orange), `#EAB308` (Yellow)
  - `#22C55E` (Green), `#06B6D4` (Cyan), `#3B82F6` (Blue)
  - `#8B5CF6` (Purple), `#EC4899` (Pink), `#78716C` (Stone)
  - `#6B7280` (Gray), `#1F2937` (Dark), `#F5F5F4` (Light/None)

#### Category Form (Dialog)
- Dialog max-width: `480px`
- Form fields stacked vertically, gap `16px`
- Name input: full width, `text-sm`
- Color picker: grid of palette options below label
- Footer: Cancel + Submit buttons

### 5.2 Responsive Breakpoints

```css
/* Mobile First (default) */
.category-list { @apply flex flex-col gap-2; }
.category-item { @apply flex flex-col gap-2 p-3; }

/* Tablet+ */
@media (min-width: 640px) {
  .category-item { @apply flex-row items-center justify-between; }
}

/* Desktop */
@media (min-width: 1024px) {
  .category-item { @apply text-sm; }
}
```

### 5.3 Spacing & Typography

- Page title: `text-2xl font-bold tracking-tight`
- Section gap: `24px` (`gap-6`)
- Item gap: `8px` (`gap-2`)
- Dialog title: `text-lg font-semibold`
- Form label: `text-sm font-medium`
- Task count: `text-sm text-muted-foreground`

---

## 6. Data Queries & Actions

### 6.1 Category Queries

```typescript
// lib/data/category.ts
import { eq, count, and, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, tasks } from "@/lib/db/schema";

export async function getCategories(userId: string) {
  return db.query.categories.findMany({
    where: eq(categories.userId, userId),
    orderBy: asc(categories.name),
  });
}

export async function getCategoryById(userId: string, categoryId: string) {
  const category = await db.query.categories.findFirst({
    where: and(eq(categories.id, categoryId), eq(categories.userId, userId)),
  });
  return category ?? null;
}

export async function getCategoriesWithTaskCount(userId: string) {
  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      userId: categories.userId,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
      taskCount: count(tasks.id),
    })
    .from(categories)
    .leftJoin(tasks, and(
      eq(tasks.categoryId, categories.id),
      eq(tasks.userId, userId),
    ))
    .where(eq(categories.userId, userId))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));

  return result;
}

export async function getCategoryWithTaskCount(userId: string, categoryId: string) {
  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      userId: categories.userId,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
      taskCount: count(tasks.id),
    })
    .from(categories)
    .leftJoin(tasks, and(
      eq(tasks.categoryId, categories.id),
      eq(tasks.userId, userId),
    ))
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .groupBy(categories.id);

  return result[0] ?? null;
}
```

### 6.2 Server Actions

```typescript
// lib/actions/category.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createCategorySchema, updateCategorySchema } from "@/lib/validation/category";
import { getCurrentUserId } from "@/lib/auth/session";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createCategoryAction(input: unknown): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createCategorySchema.parse(input);

    // Check for duplicate name
    const existing = await db.query.categories.findFirst({
      where: and(
        eq(categories.userId, userId),
        eq(categories.name, validated.name),
      ),
    });

    if (existing) {
      return { success: false, error: "A category with this name already exists" };
    }

    const [category] = await db.insert(categories).values({
      ...validated,
      userId,
    }).returning();

    revalidatePath("/categories");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, data: category };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategoryAction(input: unknown): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = updateCategorySchema.parse(input);
    const { id, ...data } = validated;

    // Check for duplicate name (excluding current category)
    if (data.name) {
      const existing = await db.query.categories.findFirst({
        where: and(
          eq(categories.userId, userId),
          eq(categories.name, data.name),
        ),
      });

      if (existing && existing.id !== id) {
        return { success: false, error: "A category with this name already exists" };
      }
    }

    const [category] = await db.update(categories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    revalidatePath("/categories");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, data: category };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await db.delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Category not found" };
    }

    // Note: Schema already defines onDelete: "set null" on tasks.categoryId
    // so associated tasks will automatically become uncategorized

    revalidatePath("/categories");
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "Failed to delete category" };
  }
}
```

### 6.3 Validation Schemas

```typescript
// lib/validation/category.ts
import { z } from "zod";

export const CATEGORY_COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#78716C", // Stone
  "#6B7280", // Gray
  "#1F2937", // Dark
  "#F5F5F4", // Light/None
] as const;

export const createCategorySchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")
    .trim(),
  color: z.string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex color")
    .optional()
    .or(z.literal("")),
});

export const updateCategorySchema = z.object({
  id: z.uuid(),
  name: z.string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")
    .trim()
    .optional(),
  color: z.string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex color")
    .optional()
    .or(z.literal(""))
    .nullable(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
```

---

## 7. Acceptance Criteria Summary

### Page-Level Criteria

| Page | Route | Criteria |
|------|-------|----------|
| Categories | `/categories` | Shows all user categories, supports CRUD, empty state |
| Loading | `/categories` | Skeleton matches layout |
| Error | `/categories` | Friendly error with retry |

### Functional Criteria

| Feature | Test Case |
|---------|-----------|
| Create | Category appears immediately after creation |
| Create | Empty name rejected |
| Create | Name > 50 chars rejected |
| Create | Duplicate name for same user rejected |
| Create | Color saved correctly if provided |
| Create | Default color applied if none provided |
| Edit | Changes persist and reflect in task displays |
| Edit | Duplicate name check excludes current category |
| Delete | Category removed, tasks become uncategorized |
| Delete | Tasks are NOT deleted when category is deleted |
| Delete | Confirmation shows affected task count |
| Filter | Category filter works in task list |
| Display | Category badge shows on task items |
| Display | Category badge shows on task detail |
| Security | Cannot access/edit another user's category |

### Integration Criteria

| Component | Integration |
|-----------|-------------|
| CategoryForm | React Hook Form + Zod |
| CategoryActions | Calls correct server action |
| TaskForm | Category dropdown populated from user categories |
| TaskFilters | Category filter from user categories |
| Mutations | revalidatePath for /categories, /tasks, /dashboard |

---

## 8. Testing Strategy

### Unit Tests

**Category Actions (`lib/actions/__tests__/category.test.ts`)**
- [ ] createCategoryAction creates category with valid input
- [ ] createCategoryAction rejects empty name
- [ ] createCategoryAction rejects name > 50 chars
- [ ] createCategoryAction rejects duplicate name for same user
- [ ] createCategoryAction rejects unauthenticated user
- [ ] updateCategoryAction updates name
- [ ] updateCategoryAction updates color
- [ ] updateCategoryAction rejects duplicate name for same user (excluding self)
- [ ] updateCategoryAction returns error for non-existent category
- [ ] deleteCategoryAction removes category
- [ ] deleteCategoryAction sets associated tasks' categoryId to null
- [ ] deleteCategoryAction returns error for another user's category

**Category Validation (`lib/validation/category.test.ts`)**
- [ ] createCategorySchema accepts valid input
- [ ] createCategorySchema rejects empty name
- [ ] createCategorySchema rejects name > 50 chars
- [ ] createCategorySchema rejects invalid hex color
- [ ] createCategorySchema accepts optional color
- [ ] updateCategorySchema requires valid UUID id
- [ ] updateCategorySchema accepts partial updates

### Manual Testing Checklist

#### Category List
- [ ] Page loads with user's categories
- [ ] Categories ordered alphabetically
- [ ] Empty state shown for new user
- [ ] Task count per category correct
- [ ] Color dots display correctly

#### Category Creation
- [ ] Create dialog opens from categories page
- [ ] Form validates empty name
- [ ] Form validates long name
- [ ] Duplicate name shows inline error
- [ ] Color picker works with preset palette
- [ ] Category appears in list after creation
- [ ] Category appears in task form dropdown after creation

#### Category Editing
- [ ] Edit dialog opens pre-populated
- [ ] Name change saves correctly
- [ ] Color change saves correctly
- [ ] Duplicate name (different from current) rejected
- [ ] Changes reflect in task displays

#### Category Deletion
- [ ] Delete shows confirmation with task count
- [ ] Confirm removes category
- [ ] Associated tasks become uncategorized
- [ ] Tasks are NOT deleted

#### Integration
- [ ] Category dropdown in task creation form
- [ ] Category dropdown in task edit form
- [ ] Category filter in task list
- [ ] Category badge on task items
- [ ] Category badge on task detail view
- [ ] Dashboard upcoming tasks show category badges

#### Responsive
- [ ] Mobile (320px): list readable, dialogs usable
- [ ] Tablet (768px): comfortable spacing
- [ ] Desktop (1024px): table-like layout

---

## 9. Implementation Notes

### Dependencies Already Installed
- `drizzle-orm` - Database queries
- `zod` - Validation
- `react-hook-form` + `@hookform/resolvers` - Forms
- `lucide-react` - Icons
- `sonner` - Toasts
- `tailwindcss` - Styling
- shadcn/ui components: Button, Input, Dialog, Badge, Skeleton, Label, Select

### Database Schema (Already Exists)
The `categories` table and relations are already defined in `lib/db/schema.ts`:
- `categories` table with `id`, `userId`, `name`, `color`, `createdAt`, `updatedAt`
- `categories_user_id_name_idx` unique index on `(userId, name)` — **ensures unique names per user**
- `categoriesRelations` with `user` and `tasks` relations
- `tasks.categoryId` with `onDelete: "set null"` — **ensures tasks become uncategorized on category deletion**

### Existing Components to Update

#### `components/tasks/task-form.tsx`
- Add a "Category" Select/Dropdown field
- Populate from `getCategoriesForUser(userId)` (already exists in `lib/data/task.ts`)
- Add "No category" placeholder option
- Display color dot next to category name in options

#### `components/tasks/task-filters.tsx`
- Add a "Category" filter Select
- Pass categories as prop from the parent page
- Add `categoryId` to URL search params

#### `components/tasks/task-item.tsx`
- Add `CategoryBadge` component next to priority/status badges
- Only render when `task.category` is not null

#### `components/tasks/task-detail-view.tsx`
- Show category badge in metadata section

#### `components/dashboard/upcoming-tasks.tsx`
- Add category dot/badge on each task card

### Data Layer Pattern
Follow the same pattern established in `lib/data/task.ts`:
- Server Component calls query functions directly
- Client Components use Server Actions for mutations
- All queries scoped by `userId`

### Category Color Handling
- Colors stored as hex strings in database (e.g., `#EF4444`)
- If no color provided, fall back to a default gray (`#6B7280`)
- The `CATEGORY_COLORS` constant in `lib/validation/category.ts` provides the curated palette
- The `ColorPicker` component renders these as clickable swatches

### Revalidation Strategy
All category mutations must revalidate:
```typescript
revalidatePath("/categories");
revalidatePath("/tasks");
revalidatePath("/dashboard");
```

### Existing `getCategoriesForUser` Function
The function already exists in `lib/data/task.ts`:
```typescript
export async function getCategoriesForUser(userId: string) {
  return db.query.categories.findMany({
    where: eq(categories.userId, userId),
    orderBy: asc(categories.name),
  });
}
```
This should be moved to `lib/data/category.ts` and re-exported from `lib/data/task.ts` for backward compatibility, or tasks import from `lib/data/category.ts` directly.

---

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Duplicate name race condition | Low | DB unique constraint on (userId, name) already exists in schema |
| Category deletion affects many tasks | Medium | Show affected task count in confirmation dialog; set null is schema-level |
| Task form dropdown needs category data | Low | Server Component fetches categories and passes as props |
| Color picker accessibility | Medium | Use color name labels, not just color swatches; keyboard navigable |
| Large number of categories | Low | No pagination needed for MVP (personal use, expect < 50 categories) |
| Task filter with categories on URL params | Low | Use UUID for categoryId param; validate on server side |

---

## 11. Related Documentation

- **PRD.md** §6.5 - Category Management requirements
- **PRD.md** §6.4 - Task Filters, Sorting, and Grouping
- **PRD.md** §6.6 - User Settings and Preferences
- **coding-standards.md** - TypeScript, React, Tailwind v4, Drizzle conventions
- **ai-interaction.md** - Workflow for implementation
- **lib/db/schema.ts** - Database schema reference (categories table and relations)
- **P2-F3 Task Management** - Task form, task filters, task display updates

---

## 12. Definition of Done

- [ ] Categories page at `/categories` with list and CRUD actions
- [ ] Create category dialog with name and color picker
- [ ] Edit category dialog pre-populated with current values
- [ ] Delete category with confirmation showing affected task count
- [ ] Category uniqueness enforced per user (server-side + DB constraint)
- [ ] Deleting a category sets tasks' categoryId to null (not deleting tasks)
- [ ] Category dropdown in task create/edit form
- [ ] Category filter in task list page
- [ ] Category badge on task items and detail view
- [ ] Category badge on dashboard upcoming tasks
- [ ] Category data layer in `lib/data/category.ts`
- [ ] Category server actions in `lib/actions/category.ts`
- [ ] Category validation schemas in `lib/validation/category.ts`
- [ ] Unit tests for server actions and validation
- [ ] Empty state for no categories
- [ ] Loading skeletons implemented
- [ ] Error boundary implemented
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
2. Create branch `feature/P2-F4-category-management`
3. Implement in order: Validation → Data Layer → Server Actions → CategoryForm → Dialogs → CategoryList → CategoryPage → TaskForm/Dashboard Updates → Integration Testing
4. Test thoroughly
5. Build and commit