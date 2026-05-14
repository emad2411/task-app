# P5-F5: Task Page Redesign (Filters + Table)

## Overview

Redesign the `/tasks` page from a flat vertical list with 7 inline Select dropdowns into a dense, scannable data table with a collapsed filter control. Target: daily power users who open this page 10+ times a day and need to scan, filter, and navigate tasks at speed.

**Components in scope**: `TaskFilters`, `FilterChips`, `TaskList`, `TaskItem`, `TaskGroupHeader`, `TaskSkeleton`, `TaskEmptyState`, tasks page (`app/(app)/tasks/page.tsx`)
**Fidelity**: Production-ready
**Backend changes**: None (purely frontend / presentational). Existing data fetching, URL-driven filters, and Suspense streaming remain.

---

## 1. Design Direction

### 1.1 Color Strategy

Restrained. Tinted neutrals + the existing brand green `#18E299` accent used sparingly for status indicators, active states, and the primary CTA. No new tokens needed.

### 1.2 Theme Scene

A professional at their desk, afternoon light on, opening their task list for the fifth time today to check off a completed item and scan for what's next. Focused, not browsing. Dark theme per PRODUCT.md ("dark first, always").

### 1.3 Anchor References

- **Notion database table**: editable feel, clean columns, comfortable density, column headers with sort
- **Linear filter bar**: collapsed chips, keyboard-first, minimal chrome
- **GitHub Issues table**: minimal chrome, status-first, scannable rows

---

## 2. Layout Strategy

### 2.1 Page Structure

```
┌──────────────────────────────────────────────────────────────┐
│ Header: "Tasks" (left)                    [Create Task] (right) │
├──────────────────────────────────────────────────────────────┤
│ Filter Bar: [Search...] [Filters ▾] [chip] [chip]  [Sort ▾] [Group ▾] [Reset] │
├──────────────────────────────────────────────────────────────┤
│ ☐ │ Title              │ Status      │ Priority │ Category │ Due    │ Created │
│───┼────────────────────┼─────────────┼──────────┼──────────┼────────┼─────────│
│ ☐ │ Review Q3 report   │ In Progress │ High     │ Work     │ Today  │ 2d ago  │
│ ☐ │ Buy groceries      │ To Do       │ Medium   │ Personal │ Tomorrow│ 5d ago  │
│ ☐ │ Ship v2 landing    │ Done        │ High     │ Work     │ Jan 10 │ 1w ago  │
│ ...                                                                    │         │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Filter Bar

Single row below header. Contains:
- **Search input** (always visible, left-aligned, `w-64`)
- **"Filters" button** that opens a Popover with Status, Priority, Category, Due Date dropdowns inside
- **Active filter chips** render next to the button (click chip to open popover with that filter focused, X to remove)
- **Sort** and **Group By** as compact inline Select controls (not hidden in popover; power users change these frequently)
- **"Reset"** appears only when filters/sort are non-default

### 2.3 Table

Full-width, no card wrapper. Columns:

| Column | Width | Content |
|--------|-------|---------|
| Checkbox | `w-10` (~40px) | Completion toggle |
| Title | `flex-1` (remaining) | Task title, truncates with ellipsis |
| Status | `w-[120px]` | Color-coded pill (To Do, In Progress, Done, Archived) |
| Priority | `w-[100px]` | Pill (High=destructive, Medium=secondary, Low=default) |
| Category | `w-[140px]` | Color dot + name, truncated |
| Due | `w-[120px]` | Relative date (Today, Tomorrow, 3d ago) |
| Created | `w-[120px]` | Relative date |

Column headers are sortable (click to toggle asc/desc). Active sort column shows an arrow indicator.

### 2.4 Grouped Mode

When `groupBy` is active, table sections are separated by full-width group headers (collapsible). Each group header shows label + task count. Click to collapse/expand.

### 2.5 Rhythm

- No outer card/container. Table sits directly in the page content area.
- Header and filter bar share consistent horizontal padding with the table.
- Row hover uses a subtle `bg-muted/50` tint, not a border change.
- No side-stripe borders, no nested cards, no gradient text.

---

## 3. Component Inventory

### 3.1 Modified Components

#### `app/(app)/tasks/page.tsx`

**Changes**:
- Remove `<div className="flex min-h-screen flex-col">` wrapper. Use the AppShell's main area directly.
- Simplify header: just "Tasks" heading + CreateTaskDialog. Remove extra `space-y-1` wrapper.
- Update Suspense boundaries to match new component structure.
- Pass `timezone` and `categories` to new filter component.

#### `components/tasks/task-filters.tsx`

**Full rewrite**. Replace the 7-inline-Select layout with a collapsed filter control.

**New structure**:
```tsx
<div className="flex flex-wrap items-center gap-2">
  {/* Search — always visible */}
  <div className="relative w-64">
    <Search ... />
    <Input ... />
  </div>

  {/* Filters popover button */}
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" size="sm">
        <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
            {activeFilterCount}
          </Badge>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80" align="start">
      <div className="space-y-3">
        {/* Status select */}
        {/* Priority select */}
        {/* Category select (if categories exist) */}
        {/* Due Date select */}
      </div>
    </PopoverContent>
  </Popover>

  {/* Active filter chips — inline, not separate component */}
  {activeFilters.map(filter => (
    <Badge key={filter.key} variant="secondary" className="h-7 gap-1 rounded-full text-xs">
      {filter.label}
      <button onClick={() => removeFilter(filter.key)} ...>
        <X className="h-3 w-3" />
      </button>
    </Badge>
  ))}

  {/* Spacer */}
  <div className="flex-1" />

  {/* Sort — inline, always visible */}
  <div className="flex items-center gap-1">
    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
    <Select value={sort} onValueChange={...}>
      <SelectTrigger className="h-8 w-[130px] text-sm">...</SelectTrigger>
      ...
    </Select>
  </div>

  {/* Group By — inline, always visible */}
  <div className="flex items-center gap-1">
    <Group className="h-3.5 w-3.5 text-muted-foreground" />
    <Select value={groupBy} onValueChange={...}>
      <SelectTrigger className="h-8 w-[120px] text-sm">...</SelectTrigger>
      ...
    </Select>
  </div>

  {/* Reset — only when non-default */}
  {hasChanges && (
    <Button variant="ghost" size="sm" onClick={clearFilters}>
      <X className="mr-1 h-3.5 w-3.5" /> Reset
    </Button>
  )}
</div>
```

**Key behavior changes**:
- Filter chips are now inline with the filter bar, not a separate `FilterChips` component below.
- Mobile: Search stays visible. "Filters" button opens a `Drawer` (bottom sheet) instead of Popover. Sort and Group By remain inline.
- Optimistic state and URL sync logic stays the same.
- Debounced search stays the same.

#### `components/tasks/task-list.tsx`

**Full rewrite**. Replace vertical card list with an HTML `<table>`.

**New structure**:
```tsx
<div className="w-full overflow-x-auto">
  <table className="w-full caption-bottom text-sm">
    <thead>
      <tr className="border-b transition-colors">
        <th className="w-10 h-10 px-2 text-left align-middle">
          <Checkbox ... />
        </th>
        <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
          <button onClick={() => toggleSort("title")} className="inline-flex items-center gap-1 hover:text-foreground">
            Title
            {sort === "title" && <ArrowIndicator direction={order} />}
          </button>
        </th>
        {/* ... more sortable headers ... */}
      </tr>
    </thead>
    <tbody>
      {tasks.map(task => (
        <TaskRow key={task.id} task={task} timezone={timezone} />
      ))}
    </tbody>
  </table>
</div>
```

**Grouped mode**: When `groupBy` is active, insert `<thead>` with a group header row before each group's `<tbody>`. The group header is a full-width `<tr>` with a collapsible toggle.

#### `components/tasks/task-item.tsx` → Rename to `task-row.tsx`

**Full rewrite**. From a card-like `<div>` to a `<tr>` table row.

**New structure**:
```tsx
<tr
  className={cn(
    "border-b transition-colors cursor-pointer",
    "hover:bg-muted/50",
    done && "opacity-50",
    taskIsDueToday && "bg-primary/5",
    taskIsOverdue && "bg-destructive/5"
  )}
  onClick={() => router.push(`/tasks/${task.id}`)}
>
  <td className="p-2 align-middle" onClick={(e) => e.stopPropagation()}>
    <Checkbox checked={done} onCheckedChange={handleToggle} ... />
  </td>
  <td className="p-2 align-middle">
    <span className={cn("font-medium", done && "line-through text-muted-foreground")}>
      {task.title}
    </span>
  </td>
  <td className="p-2 align-middle">
    <StatusBadge status={task.status} />
  </td>
  <td className="p-2 align-middle">
    <PriorityBadge priority={task.priority} />
  </td>
  <td className="p-2 align-middle">
    {task.category ? (
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: task.category.color }} />
        <span className="truncate">{task.category.name}</span>
      </span>
    ) : (
      <span className="text-muted-foreground/50">—</span>
    )}
  </td>
  <td className="p-2 align-middle text-muted-foreground">
    {task.dueDate ? formatRelativeDate(task.dueDate, timezone) : "—"}
  </td>
  <td className="p-2 align-middle text-muted-foreground">
    {formatRelativeDate(task.createdAt, timezone)}
  </td>
</tr>
```

**Mobile**: On screens < 768px, the table collapses to a card list. Each row becomes a stacked card with title on top, metadata below in a flex-wrap row. Use `hidden md:table-cell` and `md:hidden` to toggle.

#### `components/tasks/task-group-header.tsx`

**Modify**. Keep as a collapsible section header but adapt for table context.

When grouped, the header is a full-width `<tr>` spanning all columns:
```tsx
<tr>
  <td colSpan={7} className="py-2 px-2">
    <button onClick={toggle} className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary">
      {collapsed ? <ChevronRight /> : <ChevronDown />}
      {label}
      <span className="text-xs text-muted-foreground">({count})</span>
    </button>
  </td>
</tr>
```

#### `components/tasks/task-skeleton.tsx`

**Modify**. Update skeleton to match table structure.

```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b">
      <th className="w-10 h-10 px-2"><Skeleton className="h-4 w-4" /></th>
      <th className="h-10 px-2"><Skeleton className="h-4 w-16" /></th>
      {/* ... */}
    </tr>
  </thead>
  <tbody>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="border-b">
        <td className="p-2"><Skeleton className="h-4 w-4" /></td>
        <td className="p-2"><Skeleton className="h-4 w-3/4" /></td>
        <td className="p-2"><Skeleton className="h-5 w-16" /></td>
        <td className="p-2"><Skeleton className="h-5 w-14" /></td>
        <td className="p-2"><Skeleton className="h-4 w-20" /></td>
        <td className="p-2"><Skeleton className="h-4 w-16" /></td>
        <td className="p-2"><Skeleton className="h-4 w-16" /></td>
      </tr>
    ))}
  </tbody>
</table>
```

#### `components/tasks/task-empty-state.tsx`

**Modify**. Minor: remove the icon wrapper variant, keep text and action.

### 3.2 Deleted Components

- `components/tasks/filter-chips.tsx` — filter chips are now inline in the filter bar

### 3.3 New Components

#### `components/tasks/status-badge.tsx`

**Purpose**: Color-coded status pill for table cells.

```tsx
interface StatusBadgeProps {
  status: TaskStatus;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: "To Do", className: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", className: "bg-brand/15 text-brand" },
  done: { label: "Done", className: "bg-primary/15 text-primary" },
  archived: { label: "Archived", className: "bg-muted/50 text-muted-foreground/70" },
};
```

#### `components/tasks/priority-badge.tsx`

**Purpose**: Priority pill for table cells.

```tsx
interface PriorityBadgeProps {
  priority: TaskPriority;
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  high: { label: "High", className: "bg-destructive/15 text-destructive" },
  medium: { label: "Medium", className: "bg-secondary text-secondary-foreground" },
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
};
```

---

## 4. Key States

| State | What the user sees |
|-------|-------------------|
| **Default** | Table with all tasks, sorted by due date asc. No active filters. |
| **Filtered** | Chips appear for active filters. Table re-renders with matching tasks. Empty chip area collapses when no filters. |
| **Empty (no tasks)** | Centered empty state: "No tasks yet" with Create Task button. |
| **Empty (no matches)** | "No tasks match your filters" with a "Clear filters" action. |
| **Loading** | Skeleton rows matching table structure (5 rows). |
| **Error** | Inline error message with retry action (from existing error.tsx). |
| **Grouped** | Group headers with collapsible sections, task count per group. |
| **Mobile** | Table collapses to card list. Filter popover becomes a bottom Drawer. |

---

## 5. Interaction Model

| Interaction | Behavior |
|-------------|----------|
| **Row click** | Navigates to `/tasks/[id]` detail page. |
| **Checkbox click** | Toggles completion inline (optimistic, toast feedback). Does not navigate. `e.stopPropagation()` on click. |
| **Column header click** | Sorts by that column. Click again to toggle asc/desc. Active sort column shows arrow indicator. |
| **Filters button** | Opens Popover (desktop) or Drawer (mobile) with filter dropdowns. Selecting a filter updates URL, chips appear, table re-renders. |
| **Chip X click** | Removes that filter from URL. |
| **Chip label click** | Opens the Filters popover. |
| **Group header click** | Collapses/expands that group section. |

---

## 6. Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| `≥768px` (md) | Full table with all columns visible. Inline filter bar. |
| `<768px` (mobile) | Card list (table rows become stacked cards). Filter popover becomes bottom Drawer. Sort and Group By remain as inline Selects. |

**Mobile card layout**:
```
┌────────────────────────────────────┐
│ ☐  Review Q3 report               │
│    In Progress · High · Work       │
│    Due Today · Created 2d ago      │
└────────────────────────────────────┘
```

---

## 7. Animation & Motion Spec

| Property | Value |
|----------|-------|
| Row hover | 150ms, `background-color` transition, ease-out |
| Group collapse/expand | 200ms, `max-height` + `opacity`, ease-out-quart |
| Filter chip enter/exit | 150ms, `opacity` + `scale`, ease-out |
| Popover open | 150ms, `opacity` + `translateY(4px)`, ease-out |
| Sort indicator rotate | 150ms, `transform`, ease-out |
| `prefers-reduced-motion` | All transitions disabled |

---

## 8. Accessibility Checklist

- [ ] **Focus rings**: `ring-2 ring-brand ring-offset-2` on all interactive elements (checkboxes, buttons, links, headers)
- [ ] **Table semantics**: Proper `<table>`, `<thead>`, `<tbody>`, `<th scope="col">` structure
- [ ] **Sortable headers**: `aria-sort` attribute on active sort column (`ascending` / `descending`)
- [ ] **Row navigation**: Row click via `onClick` on `<tr>`, keyboard accessible via `tabIndex={0}` + Enter key handler
- [ ] **Checkbox**: `aria-label` for each task ("Mark 'Review Q3 report' as complete")
- [ ] **Filter chips**: `aria-label` for remove button ("Remove Status: In Progress filter")
- [ ] **Group collapse**: `aria-expanded` on group header button
- [ ] **Empty states**: Descriptive text, not just icon
- [ ] **Color contrast**: Status and priority pills meet 4.5:1 contrast ratio
- [ ] **Mobile touch targets**: All interactive elements `min-h-[44px]` on mobile
- [ ] **Reduced motion**: All transitions disabled when `prefers-reduced-motion: reduce`

---

## 9. File Structure

```
components/
  tasks/
    task-filters.tsx           # REWRITE — Collapsed filter bar with inline chips
    task-list.tsx              # REWRITE — HTML table structure
    task-row.tsx               # NEW (replaces task-item.tsx) — Table row component
    task-item.tsx              # DELETED — Replaced by task-row.tsx
    filter-chips.tsx           # DELETED — Chips now inline in task-filters.tsx
    task-group-header.tsx      # MODIFY — Adapt for table context (colSpan row)
    task-skeleton.tsx          # MODIFY — Match table structure
    task-empty-state.tsx       # MODIFY — Minor cleanup
    status-badge.tsx           # NEW — Color-coded status pill
    priority-badge.tsx         # NEW — Priority pill
    create-task-dialog.tsx     # UNCHANGED
    task-detail-view.tsx       # UNCHANGED
    task-form.tsx              # UNCHANGED
    task-card.tsx              # UNCHANGED (used elsewhere)
    edit-task-dialog.tsx       # UNCHANGED
    delete-task-dialog.tsx     # UNCHANGED
    archive-task-dialog.tsx    # UNCHANGED

app/
  (app)/
    tasks/
      page.tsx                 # MODIFY — Simplify wrapper, update imports
```

---

## 10. Testing Checklist

### Visual
- [ ] Table renders with correct column widths and alignment
- [ ] Status pills have correct colors for each status
- [ ] Priority pills have correct colors for each priority
- [ ] Category dots render with correct colors
- [ ] Hover state on rows is subtle (bg-muted/50)
- [ ] Due today rows have primary/5 background tint
- [ ] Overdue rows have destructive/5 background tint
- [ ] Completed tasks have reduced opacity and line-through title
- [ ] Filter chips render inline next to Filters button
- [ ] Sort indicator arrow appears on active column
- [ ] Group headers are collapsible with correct count
- [ ] Skeleton matches table structure during loading
- [ ] Empty states render correctly (no tasks / no matches)
- [ ] Mobile: table collapses to card list
- [ ] Mobile: filter opens bottom Drawer

### Functional
- [ ] Checkbox toggles task completion (optimistic + toast)
- [ ] Row click navigates to `/tasks/[id]`
- [ ] Column header click sorts by that column
- [ ] Column header click again toggles asc/desc
- [ ] Filters popover opens with all filter options
- [ ] Selecting a filter updates URL and re-renders table
- [ ] Filter chip X removes that filter
- [ ] Reset button clears all filters and sort
- [ ] Search input debounces and updates URL
- [ ] Group by toggles grouped/ungrouped view
- [ ] Group header collapse/expands section
- [ ] URL sync works on browser back/forward

### Accessibility
- [ ] Keyboard navigates through table rows and interactive elements
- [ ] `aria-sort` on active sort column
- [ ] `aria-expanded` on group headers
- [ ] `aria-label` on all checkboxes and remove buttons
- [ ] Focus rings visible on all interactive elements
- [ ] Reduced motion disables transitions
- [ ] Table uses semantic HTML (thead, tbody, th, td)

### Performance
- [ ] No layout shift on filter changes (CLS ≈ 0)
- [ ] Table renders 100+ rows without jank
- [ ] Suspense streaming works (table shows skeleton, then streams in)

---

## 11. Migration Notes

1. **Delete `filter-chips.tsx`**: Filter chips are now inline in `task-filters.tsx`. Remove the separate component and its import from `page.tsx`.

2. **Delete `task-item.tsx`**: Replaced by `task-row.tsx`. Update all imports in `task-list.tsx`.

3. **`task-list.tsx` export change**: The `TaskList` component now renders a `<table>` instead of a `<div>` with `<TaskItem>` children. The props interface stays the same.

4. **`page.tsx` simplification**: Remove the `<div className="flex min-h-screen flex-col">` wrapper. The AppShell already provides the page shell.

5. **No database changes**: Pure frontend refactor.

6. **No API changes**: Existing `taskQueryParamsSchema`, data fetching, and Suspense streaming remain unchanged.

---

## 12. Open Questions for Implementer

1. **Created column**: Should it be visible by default or hidden behind a column toggle? Recommendation: visible by default; power users want it.
2. **Column widths**: Fixed or resizable? Recommendation: fixed for v1; resizable is a follow-up.
3. **Bulk selection**: Should the header checkbox select all visible tasks? Recommendation: yes, but bulk actions (delete, archive) are a follow-up feature.
4. **Keyboard table navigation**: Arrow keys to move between cells? Recommendation: not in v1; Tab + Enter is sufficient for now.

---

*Brief confirmed by user. Plan generated by `impeccable shape`.*
