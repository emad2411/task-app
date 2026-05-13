# P5-F4: App Shell Redesign — Implementation Plan

## Overview

Redesign the authenticated app shell (`AppShell`, `Sidebar`, `TopBar`, `MobileNav`) to align with TaskFlow's dark-first, Raycast-influenced brand identity. The shell must feel like a tool built for people who get things done: dense where it matters, spacious where it rests, and never visually noisy.

**Components in scope**: `AppShell`, `Sidebar`, `TopBar`, `MobileNav`
**Fidelity**: Production-ready
**Backend changes**: None (purely frontend / presentational)

---

## 1. Design Tokens & Surface Configuration

### 1.1 Color Tokens

All values already exist in `globals.css` and `DESIGN.md`. No new tokens needed.

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `bg-background` (`#0d0d0d` in dark, `#ffffff` in light) | Page canvas |
| `--foreground` | `text-foreground` (`#ededed` in dark, `#0d0d0d` in light) | Primary text |
| `--muted-foreground` | `text-muted-foreground` (`#a8a8a8` in dark, `#666666` in light) | Secondary text, labels |
| `--border` | `border-border` (`rgba(255,255,255,0.08)` in dark) | Dividers, borders |
| `--brand` | `bg-brand` / `text-brand` (`#18E299`) | Active nav, CTA, focus rings |
| `--brand-deep` | `text-brand-deep` (`#0fa76e`) | Hover state on brand |
| `--muted` | `bg-muted` (`#262626` in dark, `#f5f5f5` in light) | Subtle fills, hover backgrounds |
| `--accent` | `bg-accent` (`#262626` in dark, `#f5f5f5` in light) | Active nav background (replace with brand tint) |

### 1.2 Typography Scale (Product Surface)

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Sidebar wordmark | `1.125rem` | 700 | "TaskFlow" in sidebar header |
| Nav label | `0.875rem` | 500 | Sidebar navigation items |
| Nav label active | `0.875rem` | 600 | Active nav item |
| TopBar page title | `1rem` | 600 | Current page name |
| TopBar button | `0.875rem` | 500 | Create Task, action buttons |
| Search placeholder | `0.875rem` | 400 | Search input |
| User name (footer) | `0.875rem` | 500 | Sidebar footer |
| User email (footer) | `0.75rem` | 400 | Sidebar footer |

### 1.3 Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `space-2` | `8px` | Icon gaps, micro padding |
| `space-3` | `12px` | Nav item padding |
| `space-4` | `16px` | Component padding |
| `space-6` | `24px` | Section internal padding |
| `space-8` | `32px` | Sidebar footer padding |

---

## 2. Component Inventory

### 2.1 Modified Components

#### `components/layout/app-shell.tsx`

**Changes**:
- Remove `Sheet` wrapper from around the main content area. `Sheet` should only wrap `MobileNav` and be triggered by `TopBar`.
- Replace `lg:ml-[260px]` / `lg:ml-[72px]` margin animation with a CSS custom property or `transform`-based approach to avoid layout property animation.
- Add `will-change-transform` to the main content area for GPU acceleration.
- Keep `CategoriesProvider` and overall structure.
- Ensure `main` content area has consistent padding (`p-4 md:p-6 lg:p-8`).

**Current issues**:
```tsx
// BAD: margin-left is a layout property, causes jank
className={cn(
  "flex-1 flex flex-col transition-all duration-300",
  isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
)}
```

**Fix options**:
- **Option A**: Use CSS custom property `--sidebar-width` on a wrapper, animate the custom property (not supported in all browsers for layout).
- **Option B**: Keep margin but add `will-change: margin-left` and ensure the transition is on a compositor thread where possible.
- **Option C**: Use `transform: translateX()` on a wrapper — but this is complex with fixed sidebar.

**Decision**: Keep margin approach but optimize: wrap main content in a `div` with `will-change-transform`, use `transition-[margin-left]` instead of `transition-all`, and ensure the sidebar and main content are on separate compositor layers.

---

#### `components/layout/sidebar.tsx`

**Changes**:
- **Header**: Keep "TaskFlow" wordmark. On collapse, show "T" monogram (already implemented, refine styling).
- **Active state**: Replace generic `bg-accent text-accent-foreground` with brand green tint: `bg-brand/10 text-brand` in dark mode, `bg-brand/15 text-brand-deep` in light mode. This is the primary brand presence in the product UI.
- **Hover state**: `hover:bg-muted hover:text-foreground` (more subtle than current `hover:bg-accent`).
- **Nav item sizing**: Consistent `h-10` height for all nav items (currently `py-3` which is variable). Add `h-10` class.
- **Sidebar footer**: Add a new footer section at the bottom of the sidebar for user context.
  - Expanded: Avatar (32px) + name + email, vertically stacked, with a subtle top border.
  - Collapsed: Just avatar (32px), centered, with tooltip on hover showing name.
  - Clicking the footer navigates to `/settings`.
- **Icon sizing**: Ensure icons are `h-[18px] w-[18px]` or `h-5 w-5` consistently.
- **Tooltip delay**: Keep `delayDuration={0}` for instant feedback on collapsed state.

**New footer spec (expanded)**:
```tsx
<div className="p-3 border-t border-border mt-auto">
  <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
    <Avatar className="h-8 w-8">
      <AvatarImage src={user.image || undefined} alt={user.name} />
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
    <div className="flex flex-col min-w-0">
      <span className="text-sm font-medium truncate">{user.name}</span>
      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
    </div>
  </Link>
</div>
```

**New footer spec (collapsed)**:
```tsx
<div className="p-3 border-t border-border mt-auto flex justify-center">
  <Tooltip>
    <TooltipTrigger asChild>
      <Link href="/settings" className="rounded-lg hover:bg-muted transition-colors p-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </Link>
    </TooltipTrigger>
    <TooltipContent side="right">{user.name}</TooltipContent>
  </Tooltip>
</div>
```

---

#### `components/layout/top-bar.tsx`

**Changes**:
- **Remove duplicate logo**: Delete `<span className="font-semibold text-lg shrink-0">TaskFlow</span>` from TopBar on desktop (`lg:hidden` or remove entirely — the sidebar owns the brand mark on desktop).
- **Hierarchy reorder**:
  1. Left: Sidebar toggle (desktop only, `hidden lg:flex`) + page title / breadcrumb area (optional, could show current page name).
  2. Center: Search input (flex-1, max-w-md, subtle `bg-muted` background, no visible border on idle, `border-transparent focus:border-border`).
  3. Right: Create Task (primary, filled brand green) → Notifications → Theme Toggle → Avatar dropdown.
- **Search input styling**: More subtle. `bg-muted` instead of default input background, `border-transparent` unless focused, `placeholder:text-muted-foreground`.
- **Create Task button**: Keep as primary CTA. On desktop: filled with `bg-brand text-background hover:bg-brand-deep`. On mobile: icon-only, same styling.
- **Notification bell**: Keep as is but ensure it uses the same sizing as other icons (`h-9 w-9` on desktop, `h-11 w-11` on mobile).
- **Theme toggle**: Keep, but ensure it aligns visually with other right-side actions.
- **Avatar dropdown**: Keep current implementation but ensure focus ring uses `ring-brand`.
- **Mobile hamburger**: Keep in `SheetTrigger`, but ensure it's the first element and clearly separated.

**TopBar structure**:
```tsx
<header className="flex items-center h-14 border-b px-4 shrink-0 gap-3">
  {/* Mobile: hamburger */}
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="h-11 w-11 -ml-2 lg:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>

  {/* Desktop: sidebar toggle + page title */}
  <div className="hidden lg:flex items-center gap-3">
    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onToggleSidebar}>
      <PanelLeft className="h-5 w-5" />
    </Button>
    {/* Optional: current page title */}
    <h1 className="text-sm font-semibold text-foreground">{getPageTitle(pathname)}</h1>
  </div>

  {/* Search — centered on desktop, hidden on small mobile */}
  <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search tasks..."
        className="w-full pl-9 h-9 bg-muted border-transparent focus:border-border"
      />
    </div>
  </div>

  {/* Right side actions */}
  <div className="ml-auto flex items-center gap-1">
    {/* Mobile search icon */}
    <Button variant="ghost" size="icon" className="md:hidden h-11 w-11">
      <Search className="h-5 w-5" />
    </Button>

    {/* Create Task */}
    <CreateTaskDialog>
      <Button size="sm" className="hidden sm:inline-flex h-9 bg-brand text-background hover:bg-brand-deep">
        <Plus className="mr-1.5 h-4 w-4" />
        Create Task
      </Button>
    </CreateTaskDialog>
    <CreateTaskDialog>
      <Button variant="ghost" size="icon" className="sm:hidden h-11 w-11">
        <Plus className="h-5 w-5" />
      </Button>
    </CreateTaskDialog>

    {/* Notifications */}
    <Button variant="ghost" size="icon" className="h-11 w-11 md:h-9 md:w-9">
      <Bell className="h-5 w-5" />
    </Button>

    {/* Theme toggle */}
    <div className="hidden md:flex">
      <ThemeToggle />
    </div>

    {/* Avatar */}
    {/* ... keep current dropdown ... */}
  </div>
</header>
```

---

#### `components/layout/mobile-nav.tsx`

**Changes**:
- **Brand treatment**: Dark background (`bg-background`), green active states.
- **Header**: Keep "TaskFlow" wordmark but ensure it uses the same styling as sidebar header (Inter 700, `text-foreground`).
- **User card**: Keep current implementation but refine spacing. `p-4` instead of `px-4 py-3`, ensure avatar is `h-10 w-10`.
- **Nav items**: Consistent `h-12` height for mobile tap targets (currently `h-11`). Increase to `min-h-[48px]` for better touch accessibility.
- **Active state**: Use brand green tint (`bg-brand/10 text-brand`) instead of generic `bg-accent`.
- **Sign-out button**: Keep current styling but ensure destructive color is consistent.
- **Sheet animation**: Already has CSS animations in `globals.css`. Ensure they work correctly.
- **Remove `SheetDescription` redundancy**: The current `SheetDescription` has `sr-only` class. Keep it for accessibility but ensure `SheetTitle` is descriptive.

**Active state spec**:
```tsx
className={cn(
  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]",
  isActive
    ? "bg-brand/10 text-brand"
    : "text-muted-foreground hover:bg-muted hover:text-foreground"
)}
```

---

### 2.2 New Components

#### `components/layout/sidebar-footer.tsx`

**Purpose**: Encapsulated sidebar footer for user context, used in both expanded and collapsed states.

**Props interface**:
```typescript
interface SidebarFooterProps {
  user: User;
  isCollapsed: boolean;
}
```

**Responsibilities**:
- Render user avatar + name + email in expanded state
- Render avatar only (with tooltip) in collapsed state
- Link to `/settings`
- Handle tooltip for collapsed state

---

#### `components/layout/page-title.tsx` (Optional)

**Purpose**: Derive and display the current page title in the TopBar.

**Props interface**:
```typescript
interface PageTitleProps {
  pathname: string;
}
```

**Mapping**:
| Path | Title |
|------|-------|
| `/dashboard` | Dashboard |
| `/tasks` | Tasks |
| `/tasks/[id]` | Task Details |
| `/categories` | Categories |
| `/settings` | Settings |

---

### 2.3 Deleted Components

None. All existing components are modified in place.

---

## 3. Layout & Spatial Strategy

### 3.1 Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar (fixed) │ TopBar (sticky)                            │
│ ┌─────────────┐ │ ┌──────────────────────────────────────┐   │
│ │ TaskFlow    │ │ │ [≡] Dashboard    [Search...]   [+] 🔔 ☾ 👤 │
│ ├─────────────┤ │ └──────────────────────────────────────┘   │
│ │ ○ Dashboard │ │                                            │
│ │ ○ Tasks     │ │ Main Content                               │
│ │ ○ Categories│ │                                            │
│ │ ○ Settings  │ │                                            │
│ ├─────────────┤ │                                            │
│ │ [Avatar]    │ │                                            │
│ │ Name        │ │                                            │
│ │ email@...   │ │                                            │
│ └─────────────┘ │                                            │
│                 │                                            │
│  260px / 72px   │              flex-1                        │
└─────────────────┴────────────────────────────────────────────┘
```

### 3.2 Mobile Layout (<1024px)

```
┌─────────────────────────────────────────┐
│ TopBar                                  │
│ [≡] TaskFlow    [+] 🔔 ☾ 👤             │
├─────────────────────────────────────────┤
│                                         │
│ Main Content                            │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘

Sheet (slides from left):
┌────────────────────┐
│ TaskFlow           │
│ ┌────┐ Name        │
│ │ 👤 │ email@...   │
│ └────┘             │
│ ○ Dashboard        │
│ ● Tasks            │  (brand green active)
│ ○ Categories       │
│ ○ Settings         │
│                    │
│ [Sign Out]         │
└────────────────────┘
```

---

## 4. Animation & Motion Spec

### 4.1 Sidebar Collapse/Expand

| Property | Value |
|----------|-------|
| Duration | 250ms |
| Easing | `cubic-bezier(0.25, 1, 0.5, 1)` (ease-out-quart) |
| Properties | `width` (sidebar), `margin-left` (main content), `opacity` (nav labels) |
| will-change | `margin-left, width` on sidebar and main wrapper |

**Nav label fade**: `opacity` only, 200ms, ease-out. Do NOT animate `width` or `max-width` — use `overflow-hidden` and `whitespace-nowrap` to clip.

### 4.2 Nav Item Hover

| Property | Value |
|----------|-------|
| Duration | 150ms |
| Easing | ease-out |
| Properties | `background-color`, `color` |

### 4.3 Nav Item Active

| Property | Value |
|----------|-------|
| Duration | 150ms |
| Easing | ease-out |
| Properties | `background-color`, `color` |

### 4.4 Mobile Sheet

Already implemented in `globals.css`:
- Sheet slide: 350ms `cubic-bezier(0.32, 0.72, 0, 1)`
- Items stagger: 400ms ease-out-quart with delay
- Backdrop fade: 250ms ease-out

Keep existing animations.

### 4.5 `prefers-reduced-motion`

All sidebar collapse/expand transitions should respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  .sidebar-transition,
  .main-transition {
    transition: none;
  }
}
```

---

## 5. Responsive Breakpoints

| Breakpoint | Sidebar | TopBar Logo | Search | Create Task |
|------------|---------|-------------|--------|-------------|
| `≥1024px` (lg) | Fixed, collapsible | Hidden (sidebar owns it) | Full input | Text + icon button |
| `≥768px` (md) | Hidden (sheet) | Visible | Full input | Text + icon button |
| `<768px` (mobile) | Hidden (sheet) | Visible | Icon only | Icon only |

---

## 6. Accessibility Checklist

- [ ] **Focus rings**: `ring-2 ring-brand ring-offset-2` on all interactive elements in the shell
- [ ] **Sidebar toggle**: `aria-label` indicates current state ("Collapse sidebar" / "Expand sidebar")
- [ ] **Nav items**: `aria-current="page"` on active nav item
- [ ] **Collapsed tooltips**: Ensure tooltips are accessible via keyboard (already handled by shadcn Tooltip)
- [ ] **Mobile sheet**: `SheetTitle` and `SheetDescription` present, focus trapped inside sheet
- [ ] **Color contrast**: Active nav text (`text-brand` on `bg-brand/10`) meets 4.5:1
- [ ] **Touch targets**: Mobile nav items are `min-h-[48px]` (44px minimum + buffer)
- [ ] **Reduced motion**: All transitions disabled when `prefers-reduced-motion: reduce`
- [ ] **Keyboard navigation**: Tab flows through sidebar nav items, then TopBar actions

---

## 7. File Structure

```
components/
  layout/
    app-shell.tsx              # MODIFIED — Fix Sheet wrapper, optimize transitions
    sidebar.tsx                # MODIFIED — Brand active state, add footer, refine spacing
    top-bar.tsx                # MODIFIED — Remove duplicate logo, refine hierarchy, brand CTA
    mobile-nav.tsx             # MODIFIED — Brand active state, larger touch targets
    sidebar-footer.tsx         # NEW — User context footer for sidebar
    page-title.tsx             # NEW — Optional page title derivation
```

---

## 8. State & Behavior Reference

### Sidebar Collapse State

| State | Behavior |
|-------|----------|
| Expanded (`w-[260px]`) | Full nav labels visible, user footer with name/email, TaskFlow wordmark visible |
| Collapsed (`w-[72px]`) | Icon-only nav, tooltips on hover, user footer shows avatar only, "T" monogram |
| Persistence | Consider `localStorage` key `taskflow:sidebar-collapsed` to remember preference |

### Active Navigation

| Route | Active Item |
|-------|-------------|
| `/dashboard` | Dashboard |
| `/tasks`, `/tasks/[id]` | Tasks |
| `/categories` | Categories |
| `/settings` | Settings |

### Create Task Button

| Breakpoint | Visual |
|------------|--------|
| Desktop (`≥640px`) | Filled brand green button with "Create Task" text |
| Mobile (`<640px`) | Ghost button with Plus icon only |

---

## 9. Testing Checklist

### Visual
- [ ] Sidebar expands/collapses smoothly at 60fps
- [ ] Active nav item uses brand green tint in both dark and light modes
- [ ] No double "TaskFlow" logo on desktop
- [ ] Sidebar footer renders correctly in expanded and collapsed states
- [ ] TopBar hierarchy is clear: toggle → title → search → actions
- [ ] Mobile sheet slides in smoothly with correct brand styling

### Functional
- [ ] Sidebar collapse/expand toggles correctly
- [ ] Nav items navigate to correct routes
- [ ] Active state updates on route change
- [ ] Create Task dialog opens from both desktop and mobile buttons
- [ ] User dropdown works (Profile, Settings, Sign out)
- [ ] Theme toggle works
- [ ] Mobile hamburger opens sheet nav
- [ ] Sheet nav items navigate and close sheet

### Accessibility
- [ ] Keyboard navigates through all shell elements
- [ ] Focus rings visible on all interactive elements
- [ ] `aria-current="page"` on active nav item
- [ ] `aria-label` on sidebar toggle
- [ ] Reduced motion disables transitions
- [ ] Mobile sheet traps focus

### Performance
- [ ] No layout shift on sidebar toggle (CLS ≈ 0)
- [ ] Sidebar collapse animation runs at 60fps
- [ ] `will-change` applied appropriately (removed after animation if possible)

---

## 10. Migration Notes

1. **AppShell Sheet wrapper**: Move `<Sheet>` so it only wraps `<MobileNav>` and the `SheetTrigger` in `TopBar`, not the entire main content area. This prevents unnecessary re-renders and event bubbling issues.

2. **TopBar logo removal**: Remove the `<span>TaskFlow</span>` from `TopBar`. On mobile, keep it visible since the sidebar is hidden.

3. **Sidebar active state**: Replace `bg-accent text-accent-foreground` with `bg-brand/10 text-brand` (dark) / `bg-brand/15 text-brand-deep` (light). Ensure this works in both theme modes.

4. **Sidebar footer**: Add new footer section. Requires passing `user` prop to `Sidebar` (currently not passed — `AppShell` needs to forward it).

5. **No database changes**: Pure frontend refactor.

6. **No auth logic changes**: All session handling, sign-out, and user data remain untouched.

---

## 11. Open Questions for Implementer

1. **Sidebar collapse persistence**: Should the collapsed state persist across sessions via `localStorage`?
2. **Page title in TopBar**: Should the TopBar show the current page name (e.g., "Tasks") next to the toggle, or keep it minimal with just the toggle?
3. **Search functionality**: The search input is currently UI-only. Should this redesign include wiring it up, or is that a separate feature?
4. **Notification bell**: Currently UI-only. Should it have a badge/dot indicator for unread notifications?
5. **Breadcrumb navigation**: Is there a need for breadcrumbs (e.g., "Tasks > Review Q3 report") or is the flat nav sufficient?

---

*Brief confirmed by user. Plan generated by `impeccable shape`.*
