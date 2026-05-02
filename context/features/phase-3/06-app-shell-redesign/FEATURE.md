# Feature Specification: P3-F6 - App Shell Redesign

**Phase:** 3 - Polish  
**Feature ID:** P3-F6  
**Feature Name:** App Shell Redesign  
**Status:** Draft - Ready for Implementation  
**Date:** 2026-05-01

---

## 1. Goals

### Primary Goal
Redesign the application layout to feature a persistent top header and a collapsible sidebar to improve desktop and tablet usability while maintaining a robust mobile-first experience.

### Secondary Goals
- Ensure no existing features or routes are broken.
- Follow architectural guidelines from `context/coding-standards.md` and `context/PRD.md`.
- Ensure a clean, production-ready, best-practice implementation using Tailwind CSS v4 and shadcn/ui.

---

## 2. Scope

### In Scope

#### State Management
1. Manage `isSidebarCollapsed` state in `components/layout/app-shell.tsx`.

#### Header Redesign (`TopBar`)
1. Make the header visible on all breakpoints (remove `lg:hidden`).
2. Include a Sidebar toggle button (hamburger or sidebar icon).
3. Include the Logo (using Next.js logo placeholder).
4. Add a Search bar input (UI only for now, functionality deferred).
5. Add a Notification bell icon (UI only).
6. Add a "Create Task" quick action button.
7. Integrate the User Avatar with a Dropdown Menu (Profile, Settings, Sign out).

#### Sidebar Redesign (`Sidebar`)
1. Support expanded (e.g., `w-64`) and collapsed (e.g., `w-[72px]`) widths.
2. Animate width transitions smoothly.
3. When collapsed: hide text labels, display icons centered, and use shadcn/ui `Tooltip` for accessibility.
4. Adapt the logo area to the collapsed state (icon only) if it remains in the sidebar, or remove it if strictly in the header.
5. Remove the redundant "New Task" button from the bottom of the sidebar.

#### Layout Adjustments
1. Adjust the main content wrapper's left margin (`ml-*`) dynamically based on the sidebar's collapsed state.
2. Add appropriate top padding (`pt-*`) for the persistent header.

#### Mobile Responsiveness
1. Hide the desktop sidebar on screens smaller than `lg`.
2. Keep the `Sheet`-based `MobileNav` for small screens.
3. Ensure the `TopBar` gracefully handles smaller viewports (e.g., hide the search bar on extra small screens or convert it to a search icon).

### Out of Scope
- Implementing search functionality (UI only).
- Implementing notifications functionality (UI only).
- Refactoring internal pages beyond layout margins.

---

## 3. Requirements

### 3.1 Functional Requirements

#### REQ-001: App Shell State Management
**Priority:** P0  
**Description:** Add state to manage sidebar visibility.

**Acceptance Criteria:**
- [ ] `AppShell` component uses `useState` to track `isSidebarCollapsed`.
- [ ] State and a toggle function are passed down to `Sidebar` and `TopBar` (or managed via Context if needed).

#### REQ-002: TopBar Layout and Components
**Priority:** P0  
**Description:** Redesign the header to include all requested utilities.

**Acceptance Criteria:**
- [ ] `TopBar` is visible on all screen sizes.
- [ ] Contains a toggle button for the sidebar on desktop.
- [ ] Contains a search input field (placeholder: "Search...").
- [ ] Contains a notification bell icon.
- [ ] Contains a "Create Task" button.
- [ ] Contains the user avatar.
- [ ] Clicking the avatar opens a dropdown menu with "Profile", "Settings", and "Sign out" options.

#### REQ-003: Sidebar Collapsible States
**Priority:** P0  
**Description:** Sidebar must collapse to an icon-only mode.

**Acceptance Criteria:**
- [ ] Sidebar width transitions smoothly between expanded and collapsed states.
- [ ] Navigation labels disappear when collapsed.
- [ ] Icons are horizontally centered when collapsed.
- [ ] Hovering over icons in collapsed state shows a tooltip with the label name.
- [ ] Active route is visually indicated in both states.

#### REQ-004: Responsive Behavior
**Priority:** P0  
**Description:** The layout must remain functional and attractive on mobile devices.

**Acceptance Criteria:**
- [ ] Sidebar is completely hidden on screens smaller than `lg`.
- [ ] `TopBar` on mobile shows a hamburger menu (triggering `MobileNav`), the logo, and the avatar.
- [ ] Search input gracefully hides or shrinks on mobile to avoid layout breakage.

---

## 4. Technical Architecture

### 4.1 File Structure Changes
```text
components/
  layout/
    app-shell.tsx         ← Add state management, update margins.
    top-bar.tsx           ← Rebuild with Search, Notification, Create Task, Avatar Dropdown.
    sidebar.tsx           ← Add collapsed props, tooltips, dynamic widths.
    mobile-nav.tsx        ← Ensure compatibility.
```

### 4.2 Component Modifications

**`AppShell`**:
- Convert to a Client Component if not already, or use a lightweight Context Provider wrapper.
- Manage `isSidebarCollapsed` state.
- Update the `<main>` container classes: `className={cn("flex-1 p-4 transition-all duration-300", isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]")}`

**`TopBar`**:
- Use `DropdownMenu` from shadcn/ui.
- Use `Input` from shadcn/ui for search.
- Use `Bell`, `Search`, `Plus` icons from `lucide-react`.
- Import `SignOut` server action or Better Auth client method for the logout dropdown item.

**`Sidebar`**:
- Require `isCollapsed` boolean prop.
- Wrap icons with `Tooltip` and `TooltipTrigger`, `TooltipContent` (shadcn/ui).
- Ensure `overflow-hidden` for smooth text label disappearance during width transition.

---

## 5. Acceptance Criteria Summary

| Feature | Test Case |
|---------|-----------|
| **Sidebar Toggle** | Clicking the toggle button collapses/expands the sidebar with animation. |
| **Sidebar Tooltips** | Hovering over nav items in collapsed state shows correct labels. |
| **Header Layout** | Header is fixed at the top, visible on all pages, and contains all elements. |
| **Avatar Dropdown** | Clicking the avatar shows Settings and Sign out options. |
| **Mobile Layout** | On mobile, the sidebar hides, and the header uses a hamburger menu. |
| **Main Content** | Main content width adjusts dynamically without horizontal scrollbars. |

---

## 6. Definition of Done

- [ ] All requirements in `REQ-001` through `REQ-004` are met.
- [ ] `Sidebar` collapses and expands smoothly.
- [ ] `TopBar` has all required UI elements (Search, Notifications, Create Task, Avatar).
- [ ] Mobile navigation works seamlessly.
- [ ] Code follows `coding-standards.md` (no any, proper TS interfaces).
- [ ] Build passes (`npm run build`).
- [ ] Lint passes (`npm run lint`).

---

**Next Steps:**
1. Start the feature implementation by branching `feature/P3-F6-app-shell-redesign`.
2. Update `components/layout/app-shell.tsx` for state management.
3. Refactor `TopBar` and `Sidebar`.
4. Test responsiveness across multiple breakpoints.
