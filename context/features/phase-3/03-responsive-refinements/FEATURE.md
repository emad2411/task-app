# Feature Specification: P3-F3 - Responsive Refinements

**Phase:** 3 - Preferences and Polish  
**Feature ID:** P3-F3  
**Feature Name:** Responsive Refinements  
**Status:** Draft - Ready for Implementation  
**Date:** 2026-04-26

---

## 1. Goals

### Primary Goal
Perform a comprehensive responsive audit and refinement pass across the entire application to ensure an excellent mobile experience (320px to 768px), a comfortable tablet experience (768px to 1024px), and an optimized desktop experience (1024px+). All pages, components, forms, and navigation must follow true mobile-first principles.

### Secondary Goals
- Fix mobile navigation: collapsible sidebar or bottom nav for authenticated pages
- Improve task list and filter UX on small screens
- Ensure all touch targets meet minimum 44x44px accessibility standard
- Fix horizontal overflow, text truncation, and layout breakage on narrow viewports
- Ensure dialogs, sheets, and modals work correctly on mobile (proper sizing, scroll behavior)
- Standardize responsive grid patterns across dashboard, tasks, categories, and settings
- Ensure forms are comfortable to use on mobile (input heights, font sizes, button sizing)
- Verify all tables/lists adapt gracefully to narrow screens

---

## 2. Scope

### In Scope

#### Navigation and Layout
1. **Mobile app navigation** - collapsible sidebar, hamburger menu, or bottom nav for authenticated routes
2. **Auth pages** - verify forms are comfortable on mobile, no horizontal overflow
3. **Dashboard** - grid stacking, stat card sizing, priority summary responsiveness
4. **Task list** - filter bar mobile adaptation, task item touch targets, grouping headers
5. **Task detail** - responsive layout for detail view and action buttons
6. **Categories** - grid/card layout for category list on mobile
7. **Settings** - tab navigation for mobile (scrollable tabs or accordion), form spacing
8. **Dialogs/Sheets** - mobile sizing, full-screen vs modal, scroll behavior
9. **Empty states and error boundaries** - verify responsive behavior on all screen sizes

#### Responsive Patterns
10. **Grid standardization** - define and apply consistent grid breakpoints
11. **Form standardization** - consistent input heights, label sizing, button widths
12. **Touch target audit** - all clickable elements >= 44x44px
13. **Typography scaling** - ensure readable font sizes on mobile without zoom
14. **Spacing audit** - reduce excessive padding on mobile, maintain breathing room

### Out of Scope
- New feature pages or functionality
- Dark mode improvements (already implemented)
- Accessibility audit beyond responsive/touch-target concerns
- Performance optimizations (Phase 4)
- New animation or transition effects
- Offline support
- PWA manifest or service worker

---

## 3. Requirements

### 3.1 Functional Requirements

#### REQ-001: Mobile Navigation for Authenticated Routes
**Priority:** P0  
**Description:** Authenticated users on mobile must have accessible navigation to all primary routes

**Acceptance Criteria:**
- [ ] Mobile viewport (< 768px) shows a collapsible navigation pattern for the app shell
- [ ] Options:
  - **A:** Hamburger menu that opens a Sheet/drawer with nav links (Dashboard, Tasks, Categories, Settings)
  - **B:** Bottom navigation bar with icons + labels for primary routes
  - **C:** Collapsible sidebar that overlays content on mobile
- [ ] Desktop viewport (>= 1024px) shows persistent sidebar or top navigation
- [ ] Tablet (768px-1024px) shows a compromise (collapsed sidebar with icons only, or hamburger)
- [ ] Active route is visually indicated in mobile nav
- [ ] Nav includes user avatar/name and sign-out action
- [ ] No horizontal scroll or layout shift when nav opens/closes

#### REQ-002: Dashboard Responsive Layout
**Priority:** P0  
**Description:** Dashboard widgets must stack gracefully on mobile

**Acceptance Criteria:**
- [ ] Stats cards (Due Today, Overdue, Completed, Total Active) stack vertically on mobile (< 640px)
- [ ] Stats cards show as 2x2 grid on tablet (640px-1024px)
- [ ] Stats cards show as 4-column row on desktop (>= 1024px)
- [ ] Priority distribution summary fits within viewport without overflow
- [ ] Upcoming tasks list shows full task title (truncated with ellipsis if needed)
- [ ] Quick action buttons are easily tappable on mobile (>= 44px height)
- [ ] Empty state is centered and readable on mobile

#### REQ-003: Task List Responsive Layout
**Priority:** P0  
**Description:** Task list and filters must be usable on mobile

**Acceptance Criteria:**
- [ ] Filter bar adapts to mobile:
  - Option A: Horizontal scroll with snap points for filter chips
  - Option B: "Filter" button that opens a bottom Sheet with all filter options
  - Option C: Simplified filter bar on mobile showing only active filters + "Filters" button
- [ ] Search input is full-width on mobile, comfortable height (>= 44px)
- [ ] Sort dropdown is accessible on mobile (native select or proper Sheet)
- [ ] Grouping toggle is accessible on mobile
- [ ] Task items have comfortable touch targets:
  - Checkbox >= 44x44px tap area
  - Title/description text is readable (no zoom on iOS)
  - Action buttons (edit/delete) are reachable without accidental taps
- [ ] Task item layout on mobile:
  - Title and metadata stack vertically or use flex-wrap
  - Priority badge and category badge don't overflow
  - Due date is visible without truncation
- [ ] Group headers (when grouping is enabled) are sticky or clearly separated
- [ ] Task count and pagination/filter summary is visible

#### REQ-004: Task Detail Responsive Layout
**Priority:** P0  
**Description:** Task detail page must be fully usable on mobile

**Acceptance Criteria:**
- [ ] Task title is readable (wraps, no overflow)
- [ ] Description renders with proper whitespace and doesn't overflow
- [ ] Action buttons (Edit, Delete, Archive, Toggle Complete) stack or wrap on mobile
  - Primary action is full-width or easily reachable
  - Destructive actions have confirmation dialogs that fit mobile screen
- [ ] Category badge and metadata display without truncation
- [ ] Back navigation is clearly visible on mobile
- [ ] Form inputs in edit dialog are mobile-friendly (proper input types, comfortable height)

#### REQ-005: Categories Page Responsive Layout
**Priority:** P0  
**Description:** Category list and forms must work on mobile

**Acceptance Criteria:**
- [ ] Category cards/list items stack vertically on mobile
- [ ] Category name and color indicator are clearly visible
- [ ] Task count per category is visible
- [ ] Edit/Delete actions are reachable without accidental taps
- [ ] "Create Category" button is prominent and easily tappable
- [ ] Category form in dialog uses mobile-friendly inputs
- [ ] Color picker is usable on mobile (>= 44px color swatches, proper spacing)
- [ ] Empty state is centered and readable

#### REQ-006: Settings Page Responsive Layout
**Priority:** P0  
**Description:** Settings forms must be comfortable on mobile

**Acceptance Criteria:**
- [ ] Tab navigation adapts to mobile:
  - Option A: Horizontal scrollable tabs
  - Option B: Dropdown/select for tab switching on mobile
  - Option C: Vertical accordion/section list
- [ ] Form inputs are full-width on mobile with comfortable height (>= 44px)
  - Text inputs, selects, comboboxes all use appropriate mobile input types
- [ ] Timezone combobox works on mobile (searchable, scrollable, proper touch targets)
- [ ] Theme toggle buttons are easily tappable
- [ ] Save/Update buttons are full-width or prominent on mobile
- [ ] Password change form fields stack vertically with adequate spacing
- [ ] Labels and helper text are readable without zoom
- [ ] Error messages don't cause layout shift or overflow

#### REQ-007: Auth Pages Responsive Layout
**Priority:** P1  
**Description:** Auth forms must be comfortable on all devices

**Acceptance Criteria:**
- [ ] Auth card/container has adequate padding on mobile (not touching screen edges)
  - Use `px-4` or `p-6` with `max-w-md mx-auto`
- [ ] Input fields are full-width and comfortable height (>= 44px)
- [ ] Submit buttons are full-width on mobile
- [ ] "Forgot password?" and sign-up/sign-in links are easily tappable
- [ ] Form doesn't require horizontal scroll on 320px viewport
- [ ] Error messages display without breaking layout
- [ ] Success cards are readable and centered

#### REQ-008: Dialogs, Sheets, and Modals
**Priority:** P0  
**Description:** All overlays must work correctly on mobile

**Acceptance Criteria:**
- [ ] Dialogs on mobile (< 640px):
  - Either use full-screen Sheet (bottom or side) OR
  - Centered modal with `max-w-[calc(100vw-2rem)]` and proper margins
- [ ] Dialog content is scrollable if it exceeds viewport height
- [ ] Dialog header is sticky (visible while scrolling)
- [ ] Dialog close button is easily tappable (>= 44px)
- [ ] Backdrop click/tap dismisses dialog
- [ ] Body scroll is locked when dialog is open
- [ ] Form dialogs (Create Task, Edit Task, Create Category) have:
  - Full-width inputs on mobile
  - Submit button visible without scrolling (or sticky footer)
  - Cancel action accessible
- [ ] Delete confirmation dialogs fit on mobile screen

#### REQ-009: Touch Target Audit
**Priority:** P1  
**Description:** All interactive elements must meet minimum touch target size

**Acceptance Criteria:**
- [ ] All buttons have minimum touch target of 44x44px (use padding if visual button is smaller)
- [ ] All checkboxes/radio buttons have >= 44x44px tap area
- [ ] All nav links have >= 44x44px tap area
- [ ] All icon buttons (close, edit, delete, menu) have >= 44x44px tap area
  - Use `p-2` (32px) minimum on a 24px icon = good; or wrap in button with proper sizing
- [ ] Dropdown menu items have >= 44px height
- [ ] Tab triggers have >= 44px height
- [ ] No two touch targets are closer than 8px apart

#### REQ-010: Typography and Spacing Audit
**Priority:** P1  
**Description:** Text must be readable and spacing appropriate on all screen sizes

**Acceptance Criteria:**
- [ ] Base font size is 16px on mobile (prevents iOS zoom on input focus)
- [ ] Headings scale appropriately:
  - `text-2xl` to `text-xl` on mobile (page titles)
  - `text-xl` to `text-lg` on mobile (section headings)
- [ ] Line height is comfortable for reading (>= 1.5 for body text)
- [ ] Padding on mobile containers is adequate but not excessive:
  - Page padding: `px-4` on mobile, `px-6` on tablet, `px-8` on desktop
  - Card padding: `p-4` on mobile, `p-6` on desktop
- [ ] Gap between stacked elements is consistent (>= 16px/1rem)
- [ ] No text is cut off or overlapping on any screen size

#### REQ-011: Horizontal Overflow Prevention
**Priority:** P1  
**Description:** No page should have horizontal scroll on mobile

**Acceptance Criteria:**
- [ ] No element causes horizontal overflow on 320px viewport
- [ ] Tables (if any) use horizontal scroll wrapper or stack on mobile
- [ ] Long URLs, emails, or task titles break with `break-words` or `truncate`
- [ ] Flex containers use `flex-wrap` where appropriate
- [ ] Grid columns don't force overflow (use `minmax(0, 1fr)` or responsive column counts)

### 3.2 Technical Requirements

#### REQ-012: Breakpoint Standardization
**Priority:** P1  
**Description:** Use consistent Tailwind breakpoints

**Acceptance Criteria:**
- [ ] Use Tailwind v4 default breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
- [ ] Mobile-first approach: base styles for mobile, use `sm:`, `md:`, `lg:` for larger screens
- [ ] No custom breakpoint values unless absolutely necessary
- [ ] Document breakpoint strategy in code comments where complex

#### REQ-013: Container Queries (Optional)
**Priority:** P2  
**Description:** Consider container queries for card-level responsiveness

**Acceptance Criteria:**
- [ ] Evaluate if container queries improve any component (e.g., task card in narrow sidebar)
- [ ] Use `@container` only if it provides clear benefit over media queries
- [ ] Prefer media queries for page-level layout

---

## 4. UI Architecture

### 4.1 File Structure

```
app/
  (app)/
    layout.tsx              # UPDATE - Add mobile nav toggle, responsive sidebar
    dashboard/
      page.tsx              # UPDATE - Responsive grid for stats cards
    tasks/
      page.tsx              # UPDATE - Responsive filter bar, task list
      [taskId]/
        page.tsx            # UPDATE - Responsive detail layout
    categories/
      page.tsx              # UPDATE - Responsive category grid/list
    settings/
      page.tsx              # UPDATE - Responsive tabs, forms

components/
  layout/
    app-shell.tsx           # UPDATE - Responsive behavior (collapsible sidebar/mobile nav)
    sidebar.tsx             # UPDATE - Mobile drawer/sheet integration
    mobile-nav.tsx          # NEW - Mobile navigation component (Sheet or bottom nav)
    top-bar.tsx             # UPDATE - Add hamburger menu, responsive title

  dashboard/
    stats-cards.tsx         # UPDATE - Responsive grid classes
    priority-summary.tsx    # UPDATE - Mobile layout
    upcoming-tasks.tsx      # UPDATE - Mobile truncation/touch targets
    quick-actions.tsx       # UPDATE - Mobile button sizing

  tasks/
    task-list.tsx           # UPDATE - Mobile spacing/touch targets
    task-item.tsx           # UPDATE - Mobile layout (stack/wrap)
    task-filters.tsx        # UPDATE - Mobile adaptation
    filter-chips.tsx        # UPDATE - Mobile scroll/wrap
    task-group-header.tsx   # UPDATE - Mobile sticky behavior
    task-detail-view.tsx    # UPDATE - Mobile action button layout

  categories/
    category-list.tsx       # UPDATE - Responsive grid
    category-card.tsx       # UPDATE - Mobile sizing
    category-form.tsx       # UPDATE - Mobile form spacing

  settings/
    settings-tabs.tsx       # UPDATE - Mobile scrollable/select tabs
    profile-form.tsx        # UPDATE - Mobile input sizing
    preferences-form.tsx    # UPDATE - Mobile layout
    security-form.tsx       # UPDATE - Mobile button layout
    timezone-combobox.tsx   # UPDATE - Mobile sizing/scroll

  ui/
    dialog.tsx              # AUDIT - Verify mobile sizing
    sheet.tsx               # AUDIT - Verify mobile sizing
    empty.tsx               # AUDIT - Verify responsive centering
```

### 4.2 Component Hierarchy

#### Mobile Navigation Pattern
```
AppShell
  TopBar (mobile)
    HamburgerMenuButton (>= 44px tap area)
    AppTitle/Logo
    UserMenu (avatar)
  MobileNav (Sheet from shadcn/ui)
    SheetContent (side="left" or side="bottom")
    NavLinks (Dashboard, Tasks, Categories, Settings)
      Each link: >= 44px height, active state indicator
    Divider
    SignOutButton
  Sidebar (desktop >= 1024px)
    Same nav links, persistent
  MainContent
    {children}
```

#### Responsive Dashboard Grid
```
DashboardPage
  PageHeader
    "Dashboard" title (text-xl mobile, text-2xl desktop)
  StatsGrid
    grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4
      StatCard (Due Today)
      StatCard (Overdue)
      StatCard (Completed Today)
      StatCard (Total Active)
  ContentGrid
    grid grid-cols-1 lg:grid-cols-3 gap-6
      UpcomingTasks (lg:col-span-2)
      PrioritySummary + QuickActions (lg:col-span-1)
  DashboardEmptyState (if no tasks)
```

#### Responsive Task List
```
TasksPage
  PageHeader
    Title + CreateTaskButton
    Mobile: stacked; Desktop: inline
  FiltersSection
    SearchInput (w-full on mobile)
    FilterBar
      Mobile: "Filters" button -> Sheet with filter options
      Desktop: inline filter dropdowns/chips
    SortSelect + GroupToggle
  TaskList
    Mobile: reduced padding, full-width items
      TaskGroupHeader (if grouped, sticky on mobile)
      TaskItem
        Checkbox (>= 44px tap area, p-2 wrapper)
        Content
          Title (truncate, text-base)
          Meta (flex-wrap, gap-2)
            PriorityBadge
            CategoryBadge
            DueDate
        Actions (edit/delete dropdown or buttons)
  TaskEmptyState or FilteredEmptyState
```

### 4.3 Responsive Layouts

#### Mobile Navigation (Sheet)
```
Mobile (< 768px):
+-------------------------------------------+
| ≡  TaskFlow                          👤   |  <- TopBar with hamburger
+-------------------------------------------+
|                                           |
| [Sheet opens from left or bottom]         |
|                                           |
| Dashboard                                 |
| Tasks                                     |
| Categories                                |
| Settings                                  |
| -------------                             |
| Sign Out                                  |
+-------------------------------------------+
```

#### Dashboard Mobile
```
Mobile (< 640px):
+-------------------------------------------+
| ≡  TaskFlow                          👤   |
+-------------------------------------------+
| Dashboard                                 |
+-------------------------------------------+
| +-------------+                           |
| | Due Today   |                           |
| | 3           |                           |
| +-------------+                           |
| +-------------+                           |
| | Overdue     |                           |
| | 1           |                           |
| +-------------+                           |
| +-------------+                           |
| | Completed   |                           |
| | 5           |                           |
| +-------------+                           |
| +-------------+                           |
| | Total Active|                           |
| | 12          |                           |
| +-------------+                           |
|                                           |
| Upcoming Tasks           [+ New Task]     |
| - Task title...          Due Tomorrow     |
| - Another task...        Due in 3 days    |
|                                           |
| Priority Summary                          |
| High: 2  Medium: 5  Low: 8                |
+-------------------------------------------+
```

#### Task List Mobile
```
Mobile (< 640px):
+-------------------------------------------+
| ≡  TaskFlow                          👤   |
+-------------------------------------------+
| Tasks                        [+ New]      |
+-------------------------------------------+
| [Search tasks...                    ]     |
| [Filters ▼]  [Sort ▼]  [Group ▼]          |
|                                           |
| [Status: todo] [Priority: high] [x]       |
|                                           |
| ☐ Complete project proposal               |
|   🔴 High    📁 Work    📅 Today          |
|                                           |
| ☐ Review design mockups                   |
|   🟡 Medium  📁 Work    📅 Tomorrow       |
|                                           |
| ☐ Buy groceries                           |
|   🟢 Low     📁 Personal  📅 Apr 28       |
+-------------------------------------------+
```

#### Task Detail Mobile
```
Mobile (< 640px):
+-------------------------------------------+
| <-  Task Details                      ⋮   |
+-------------------------------------------+
|                                           |
| Complete project proposal                 |
|                                           |
| Description:                              |
| Draft the initial proposal document...    |
|                                           |
| 🔴 High Priority                          |
| 📁 Work                                   |
| 📅 Due: Today                             |
| ✅ Completed: —                           |
|                                           |
| +-------------------------------------+   |
| |          Mark Complete              |   |
| +-------------------------------------+   |
|                                           |
| [Edit]        [Archive]       [Delete]    |
+-------------------------------------------+
```

#### Settings Mobile
```
Mobile (< 640px):
+-------------------------------------------+
| ≡  TaskFlow                    Settings   |
+-------------------------------------------+
| [Profile] [Security] [Appearance] [Prefs] |  <- Scrollable tabs
|                                           |
| Profile Settings                          |
|                                           |
| Display Name                              |
| [John Doe                           ]     |
|                                           |
| Email                                     |
| [john@example.com                   ]     |
| (readonly)                                |
|                                           |
| +-------------------------------------+   |
| |         Update Profile              |   |
| +-------------------------------------+   |
+-------------------------------------------+
```

---

## 5. Design Specifications

### 5.1 Breakpoint Strategy

| Breakpoint | Tailwind Prefix | Primary Target | Layout Pattern |
|------------|-----------------|----------------|----------------|
| < 640px | Default (mobile) | Phones | Single column, stacked, full-width |
| 640px+ | `sm:` | Large phones, small tablets | 2-column grids, inline elements begin |
| 768px+ | `md:` | Tablets | Side-by-side layouts, expanded nav |
| 1024px+ | `lg:` | Desktop | Multi-column grids, persistent sidebar |
| 1280px+ | `xl:` | Large desktop | Max-width containers, wider spacing |

### 5.2 Grid Patterns

```
Stats Cards:
  Default: grid-cols-1
  sm: grid-cols-2
  lg: grid-cols-4

Dashboard Content:
  Default: grid-cols-1 (upcoming tasks full width, summary below)
  lg: grid-cols-3 (upcoming tasks col-span-2, summary col-span-1)

Category List:
  Default: grid-cols-1
  sm: grid-cols-2
  lg: grid-cols-3

Task List:
  Default: single column, full width
  All breakpoints: single column (list inherently single column)
```

### 5.3 Spacing Scale

```
Page Container:
  Mobile: px-4 py-4
  Tablet: px-6 py-6
  Desktop: px-8 py-8

Cards:
  Mobile: p-4
  Desktop: p-6

Gap Between Cards/Sections:
  Mobile: gap-4 (1rem / 16px)
  Desktop: gap-6 (1.5rem / 24px)

Form Spacing:
  Mobile: gap-4 between fields
  Input height: h-10 (40px) minimum, h-11 (44px) preferred on mobile
```

### 5.4 Touch Target Specifications

```
Minimum tap area: 44x44px

Buttons:
  Visual height: h-9 (36px) or h-10 (40px)
  With padding: py-2 px-4 -> effective area ~40px+
  Mobile primary actions: h-11 (44px) or full-width

Icon Buttons:
  Wrapper: p-2 (32px) minimum
  Preferred: p-2.5 (40px) or size-11 (44px)

Checkboxes:
  Wrapper label: py-2 or minimum h-11
  Checkbox itself: size-5 with p-1 tap padding

Nav Items:
  Height: h-11 (44px) minimum
  Padding: py-2.5 px-3

Sheet/Dialog Close Buttons:
  Size: size-10 (40px) minimum, size-11 (44px) preferred
```

### 5.5 Typography Scale

```
Page Titles:
  Mobile: text-xl (1.25rem)
  Desktop: text-2xl (1.5rem)

Section Headings:
  Mobile: text-lg (1.125rem)
  Desktop: text-xl (1.25rem)

Body Text:
  All sizes: text-base (1rem / 16px) minimum
  Line height: leading-relaxed (1.625) or leading-normal (1.5)

Labels/Metadata:
  Mobile: text-sm (0.875rem)
  No smaller than text-sm on any screen

Input Font Size:
  All inputs: text-base (16px) to prevent iOS zoom
```

### 5.6 Color Tokens

All responsive UI uses existing Tailwind theme tokens. No new colors needed.

---

## 6. Data Layer

No new data layer changes required. This feature is purely UI/UX responsive refinements.

**Note:** If mobile navigation requires user session data, use existing `getSession` or `useSession` patterns.

---

## 7. Acceptance Criteria Summary

### Page-Level Criteria

| Page | Route | Criteria |
|------|-------|----------|
| Mobile Nav | All app routes | Sheet/drawer works, links accessible, active state shown |
| Dashboard | /dashboard | Stats stack on mobile, 2x2 on tablet, 4-col on desktop |
| Task List | /tasks | Filters usable on mobile, task items tappable, no overflow |
| Task Detail | /tasks/[id] | Actions stack on mobile, back nav visible, readable |
| Categories | /categories | Cards stack on mobile, color picker usable, forms comfortable |
| Settings | /settings | Tabs scroll/accordion on mobile, inputs full-width, buttons reachable |
| Auth Pages | /sign-in, etc. | Forms comfortable, no overflow, full-width buttons |

### Component Criteria

| Component | Criteria |
|-----------|----------|
| `MobileNav` | Opens/closes smoothly, all links >= 44px, includes sign out |
| `AppShell` | Shows TopBar on mobile, Sidebar on desktop, no layout shift |
| `StatsCards` | Responsive grid, readable on all sizes |
| `TaskFilters` | Mobile-adapted (Sheet or simplified), search full-width |
| `TaskItem` | Checkbox >= 44px tap area, badges don't overflow, readable |
| `TaskDetailView` | Actions stack/wrap, metadata readable |
| `CategoryCard` | Stacks on mobile, color visible, actions reachable |
| `SettingsTabs` | Scrollable or accordion on mobile |
| All dialogs | Fit on mobile, scrollable, close button reachable |

### Responsive Checklist

- [ ] No horizontal scroll on 320px viewport on any page
- [ ] All touch targets >= 44x44px
- [ ] All inputs use text-base (16px) font size
- [ ] All page titles scale: text-xl mobile, text-2xl desktop
- [ ] All cards use p-4 on mobile, p-6 on desktop
- [ ] All grids use responsive column classes
- [ ] Navigation works without precision tapping on mobile
- [ ] Dialogs/Sheets are usable on 320px-400px viewports
- [ ] Empty states are centered and readable on mobile
- [ ] Error boundaries are centered and readable on mobile
- [ ] Loading states are centered and visible on mobile

---

## 8. Testing Strategy

### Manual Verification Checklist

| Screen Size | Viewport | Pages to Test |
|-------------|----------|---------------|
| Small phone | 320px-375px | All pages - verify no overflow, touch targets |
| Large phone | 375px-430px | All pages - verify comfort and readability |
| Tablet | 768px-1024px | All pages - verify sidebar/tablet layout |
| Desktop | 1280px+ | All pages - verify full layout, no regressions |

### Device Testing

- [ ] iPhone SE (375px)
- [ ] iPhone 14 Pro (393px)
- [ ] iPad Mini (768px)
- [ ] Desktop (1280px+)
- [ ] Verify on actual iOS Safari (input zoom prevention)
- [ ] Verify on Android Chrome

### Interaction Testing

- [ ] Tap all navigation links with thumb on mobile
- [ ] Tap all checkboxes, buttons, badges
- [ ] Open/close all dialogs and sheets
- [ ] Scroll through task list with filters active
- [ ] Test form submission on mobile keyboard
- [ ] Verify no accidental taps (delete too close to edit)

### Visual Regression

- [ ] Dashboard looks correct on all breakpoints
- [ ] Task list looks correct on all breakpoints
- [ ] Task detail looks correct on all breakpoints
- [ ] Categories page looks correct on all breakpoints
- [ ] Settings page looks correct on all breakpoints
- [ ] Auth pages look correct on all breakpoints
- [ ] No visual regressions on desktop (1024px+)

---

## 9. Implementation Notes

### Dependencies Already Installed
- `lucide-react` - Icons (Menu, X, ChevronLeft, etc.)
- shadcn/ui components: Sheet, Dialog, Button, Tabs, Card, Skeleton, Input, Select
- Tailwind CSS v4 with default breakpoints

### Mobile Navigation Implementation Options

**Option A: Sheet Drawer (Recommended)**
Use shadcn/ui `Sheet` component with `side="left"` for mobile navigation.

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="lg:hidden">
      <Menu className="size-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-[280px]">
    <nav className="flex flex-col gap-2">
      <NavLink href="/dashboard">Dashboard</NavLink>
      <NavLink href="/tasks">Tasks</NavLink>
      <NavLink href="/categories">Categories</NavLink>
      <NavLink href="/settings">Settings</NavLink>
    </nav>
  </SheetContent>
</Sheet>
```

**Option B: Bottom Navigation**
Fixed bottom bar with icon + label for primary routes.

### AppShell Responsive Logic

```tsx
// In app-shell.tsx or layout.tsx
<div className="flex min-h-screen">
  {/* Desktop sidebar */}
  <aside className="hidden lg:block w-64 border-r">
    <Sidebar />
  </aside>

  <div className="flex-1 flex flex-col">
    {/* Mobile top bar */}
    <header className="lg:hidden flex items-center h-14 border-b px-4">
      <MobileNavTrigger />
      <span className="ml-3 font-semibold">TaskFlow</span>
      <div className="ml-auto">
        <UserMenu />
      </div>
    </header>

    <main className="flex-1 p-4 md:p-6 lg:p-8">
      {children}
    </main>
  </div>
</div>
```

### Task Filters Mobile Strategy

**Recommended:** "Filters" button that opens a Sheet with all filter options.

```tsx
// On mobile (< md)
<div className="flex gap-2">
  <Input placeholder="Search tasks..." className="flex-1" />
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="icon">
        <SlidersHorizontal className="size-4" />
      </Button>
    </SheetTrigger>
    <SheetContent side="bottom" className="h-[80vh]">
      {/* All filter controls */}
    </SheetContent>
  </Sheet>
</div>
```

### Settings Tabs Mobile Strategy

**Recommended:** Scrollable horizontal tabs on mobile.

```tsx
<TabsList className="w-full justify-start overflow-x-auto">
  <TabsTrigger value="profile" className="flex-shrink-0">Profile</TabsTrigger>
  <TabsTrigger value="security" className="flex-shrink-0">Security</TabsTrigger>
  <TabsTrigger value="appearance" className="flex-shrink-0">Appearance</TabsTrigger>
  <TabsTrigger value="preferences" className="flex-shrink-0">Preferences</TabsTrigger>
</TabsList>
```

### Dialog Mobile Strategy

For form dialogs on mobile, use `max-w-[calc(100vw-2rem)]` or switch to Sheet for < 640px.

```tsx
// Dialog variant
<DialogContent className="max-w-[calc(100vw-2rem)] w-full sm:max-w-lg">

// Or Sheet variant for mobile
<Sheet>
  <SheetContent side="bottom" className="h-[90vh]">
    {/* Form content */}
  </SheetContent>
</Sheet>
```

### Common Responsive Patterns

```
Page padding:
  className="p-4 md:p-6 lg:p-8"

Card padding:
  className="p-4 lg:p-6"

Grid:
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"

Form buttons:
  className="w-full sm:w-auto"

Typography:
  className="text-xl lg:text-2xl font-bold"

Hidden on mobile:
  className="hidden md:block"

Hidden on desktop:
  className="md:hidden"
```

---

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mobile nav causes layout shift | Medium | Use fixed positioning or overlay; test on actual devices |
| Task filters Sheet feels clunky | Medium | Keep Sheet height reasonable (80vh), add close button, test scroll |
| Settings tabs overflow on small phones | Low | Use flex-shrink-0 and overflow-x-auto; ensure all tabs reachable |
| Dialog content too tall for mobile | Medium | Make dialog content scrollable; use Sheet for very long forms |
| Desktop layout regressions | Medium | Test every change on desktop breakpoint; use responsive classes carefully |
| Touch targets still too small after audit | Low | Systematic check with browser dev tools; add padding where needed |
| iOS input zoom | Medium | Ensure all inputs use text-base (16px); test on actual iOS device |
| Bottom Sheet conflicts with mobile keyboard | Medium | Use side Sheet or ensure proper viewport handling |
| Sidebar collapse logic conflicts with existing state | Low | Keep sidebar state simple; use CSS media queries for show/hide |

---

## 11. Related Documentation

- **PRD.md** Section 8 - Responsive UX Requirements
- **PRD.md** Section 9.3 - Rendering Strategy (Server vs Client Components)
- **PRD.md** Section 14 - UI System
- **P1-F1** - Project Initialization (existing layout structure)
- **P2-F1** - Auth Pages UI (auth page responsive patterns)
- **P2-F2** - Dashboard Overview (stats cards, upcoming tasks)
- **P2-F3** - Task Management (task list, task detail)
- **P2-F4** - Category Management (category list, color picker)
- **P2-F5** - Task Filters, Sorting, and Grouping (filter bar)
- **P3-F1** - User Settings and Preferences (settings tabs, forms)
- **P3-F2** - Improve Empty, Loading, and Error States (responsive states)
- **shadcn/ui Sheet component** - For mobile navigation and filter sheets
- **shadcn/ui Dialog component** - For mobile-friendly dialogs

---

## 12. Definition of Done

### New Files
- [ ] `components/layout/mobile-nav.tsx` - Mobile navigation Sheet component

### Updated Files (Representative List - Audit All)
- [ ] `app/(app)/layout.tsx` - Responsive app shell integration
- [ ] `components/layout/app-shell.tsx` - Mobile nav toggle, responsive layout
- [ ] `components/layout/sidebar.tsx` - Hidden on mobile, visible on desktop
- [ ] `components/layout/top-bar.tsx` - Hamburger menu on mobile
- [ ] `components/dashboard/stats-cards.tsx` - Responsive grid classes
- [ ] `components/dashboard/priority-summary.tsx` - Mobile layout
- [ ] `components/dashboard/upcoming-tasks.tsx` - Mobile truncation
- [ ] `components/tasks/task-list.tsx` - Mobile spacing
- [ ] `components/tasks/task-item.tsx` - Mobile layout, touch targets
- [ ] `components/tasks/task-filters.tsx` - Mobile adaptation (Sheet or simplified)
- [ ] `components/tasks/task-detail-view.tsx` - Mobile action button layout
- [ ] `components/categories/category-list.tsx` - Responsive grid
- [ ] `components/categories/category-card.tsx` - Mobile sizing
- [ ] `components/settings/settings-tabs.tsx` - Mobile scrollable tabs
- [ ] `components/settings/profile-form.tsx` - Mobile input sizing
- [ ] `components/settings/security-form.tsx` - Mobile button layout

### Quality Gates
- [ ] No horizontal scroll on 320px viewport on any page
- [ ] All touch targets >= 44x44px
- [ ] All inputs use text-base (16px) font size
- [ ] Navigation works on mobile without precision tapping
- [ ] All dialogs fit on mobile screen or use Sheet
- [ ] Dashboard stats cards stack correctly on mobile/tablet/desktop
- [ ] Task filters are usable on mobile
- [ ] Settings tabs are accessible on mobile
- [ ] Auth forms are comfortable on mobile
- [ ] Build passes (`npm run build`)
- [ ] Manual testing on 320px, 375px, 768px, 1280px viewports
- [ ] No visual regressions on desktop (1024px+)

---

**Next Steps:**
1. Load this feature using the feature skill
2. Create branch `feature/P3-F3-responsive-refinements`
3. Implement in order: Mobile navigation -> Dashboard -> Task list -> Task detail -> Categories -> Settings -> Auth pages -> Dialog audit -> Touch target audit
4. Test thoroughly on multiple viewport sizes
5. Build and commit
