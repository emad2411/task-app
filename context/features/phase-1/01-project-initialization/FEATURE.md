# Feature: Project Initialization & Foundation Setup

**Phase:** 1 — Foundation  
**Feature ID:** P1-F1  
**Status:** Ready for Implementation  
**Priority:** Critical (blocking — all other features depend on this)

---

## 1) Overview

This feature establishes the entire project foundation: scaffolding a Next.js 16 application, configuring Tailwind CSS v4, initializing shadcn/ui, setting up the project folder structure, and establishing the base layout with a responsive shell. Everything in Phase 1 and beyond builds on top of this work.

---

## 2) Scope

### In Scope
- Scaffold a new Next.js 16 App Router project with TypeScript
- Configure Tailwind CSS v4 with the correct import syntax and PostCSS plugin
- Initialize shadcn/ui using the current CLI flow
- Establish the recommended folder structure from the PRD
- Create the authenticated and public route group layouts
- Set up the root layout with theme provider (light/dark/system)
- Create the `proxy.ts` file for route protection (optimistic redirects)
- Configure environment variable patterns (`.env.local`, `.env.example`)
- Set up ESLint and TypeScript strict configuration

### Out of Scope
- Better Auth configuration (covered in P1-F2)
- Neon + Drizzle setup (covered in P1-F3)
- Auth pages UI (covered in Phase 2)
- Dashboard, task, or feature UI (covered in Phase 2)
- Deployment configuration

---

## 3) User Stories

| ID | As a… | I want to… | So that… |
|----|-------|-----------|----------|
| US-1 | Developer | Initialize a Next.js 16 project with App Router | The codebase follows current framework conventions from day one |
| US-2 | Developer | Have Tailwind v4 configured correctly | Styling works without v3/v4 conflicts |
| US-3 | Developer | Have shadcn/ui components available | I can build consistent, accessible UI components quickly |
| US-4 | Developer | Have a clear folder structure | I know where to place new features and shared code |
| US-5 | User | See a responsive layout shell | The app looks correct on mobile, tablet, and desktop |
| US-6 | User | Experience consistent theming (light/dark/system) | The app respects my preference across all pages |

---

## 4) Technical Requirements

### 4.1 Next.js 16 Scaffolding

#### Must Follow
- Use **App Router** exclusively (no Pages Router patterns).
- Use the `create-next-app` CLI with the latest Next.js 16 template.
- Enable TypeScript strict mode.
- Configure the project to use the `src/` directory convention if preferred, or root-level `app/` directory — align with the PRD folder structure.

#### Configuration Details
```bash
npx create-next-app@latest task-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"
```

> **Note:** Adjust flags based on the exact `create-next-app` options available for Next.js 16. The key requirement is App Router + TypeScript + Tailwind.

### 4.2 Tailwind CSS v4

#### Must Follow (Version-Sensitive — Mandatory)
- Use the **new v4 CSS import**:
  ```css
  @import "tailwindcss";
  ```
- **Never** use the v3-style directives:
  ```css
  /* ❌ WRONG — v3 style */
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
- Use **`@tailwindcss/postcss`** as the PostCSS plugin — do not configure `tailwindcss` directly as a PostCSS plugin.

#### PostCSS Configuration (`postcss.config.mjs`)
```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

#### Global CSS (`app/globals.css`)
```css
@import "tailwindcss";

/* Custom theme variables will be added by shadcn/ui init */
```

### 4.3 shadcn/ui Initialization

#### Must Follow
- Use the **current shadcn CLI** for initialization:
  ```bash
  npx shadcn@latest init
  ```
- Do **not** assume an outdated manual-only setup process.
- Configure shadcn/ui with:
  - Style: **New York** (recommended for productivity/CRUD apps) or **Default** — choose based on design preference.
  - Base color: aligned with the design system.
  - CSS variables: enabled (required for theming).
  - Component alias: `@/components/ui`.

#### Initial Components to Install
These components are needed for layouts and will be required by subsequent features:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add skeleton
npx shadcn@latest add toast
npx shadcn@latest add tabs
npx shadcn@latest add badge
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add label
npx shadcn@latest add separator
npx shadcn@latest add avatar
npx shadcn@latest add tooltip
npx shadcn@latest add form
npx shadcn@latest add textarea
```

> **Note:** Install components as needed during development. The above is a recommended starting set based on the PRD component list.

### 4.4 Project Folder Structure

Follow the PRD-recommended structure. Create placeholder files and directories as needed:

```text
task-app/
├── app/
│   ├── (public)/
│   │   ├── sign-in/
│   │   │   └── page.tsx          # Placeholder
│   │   ├── sign-up/
│   │   │   └── page.tsx          # Placeholder
│   │   ├── forgot-password/
│   │   │   └── page.tsx          # Placeholder
│   │   └── reset-password/
│   │       └── page.tsx          # Placeholder
│   ├── (app)/
│   │   ├── layout.tsx            # Authenticated layout shell
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Placeholder
│   │   ├── tasks/
│   │   │   ├── page.tsx          # Placeholder
│   │   │   └── [taskId]/
│   │   │       └── page.tsx      # Placeholder
│   │   ├── categories/
│   │   │   └── page.tsx          # Placeholder
│   │   └── settings/
│   │       └── page.tsx          # Placeholder
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Tailwind v4 import + theme vars
│   ├── loading.tsx               # Global loading state
│   └── error.tsx                 # Global error boundary
├── components/
│   ├── ui/                       # shadcn/ui generated primitives
│   ├── auth/                     # Auth-specific components (placeholder)
│   ├── dashboard/                # Dashboard components (placeholder)
│   ├── tasks/                    # Task components (placeholder)
│   ├── categories/               # Category components (placeholder)
│   ├── settings/                 # Settings components (placeholder)
│   └── layout/                   # Shared layout components
│       ├── app-shell.tsx         # Authenticated app shell (sidebar, header)
│       ├── sidebar.tsx           # Desktop sidebar navigation
│       ├── mobile-nav.tsx        # Mobile bottom nav / hamburger
│       └── theme-provider.tsx   # Theme context provider
├── lib/
│   ├── auth/                     # Better Auth setup (placeholder for P1-F2)
│   │   ├── auth.ts
│   │   └── auth-client.ts
│   ├── db/                       # Drizzle setup (placeholder for P1-F3)
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── validation/               # Zod schemas (placeholder)
│   ├── actions/                  # Server actions (placeholder)
│   ├── queries/                  # Data access queries (placeholder)
│   └── utils.ts                  # Shared helpers (cn, etc.)
├── types/
│   └── index.ts                  # Shared application types
├── proxy.ts                      # Next.js 16 route protection (NOT middleware.ts)
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── drizzle.config.ts
├── package.json
├── .env.local                    # Local environment variables (gitignored)
├── .env.example                  # Template for required env vars
└── README.md
```

### 4.5 Route Groups and Layouts

#### Public Route Group `(public)`
- Contains: `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`
- Layout: Minimal — no sidebar, no authenticated chrome.
- Redirect logic: If a user is already authenticated, redirect them to `/dashboard`.

#### Authenticated Route Group `(app)`
- Contains: `/dashboard`, `/tasks`, `/tasks/[taskId]`, `/categories`, `/settings`
- Layout: Full app shell — sidebar (desktop) / bottom nav (mobile), header, theme toggle.
- Protection: Requires valid session. Unauthenticated users are redirected to `/sign-in`.

#### Root Layout (`app/layout.tsx`)
- Sets `<html>` with theme class, language, and metadata.
- Wraps children with `ThemeProvider`.
- Loads global styles (`globals.css`).
- Configures font (Inter or similar).

### 4.6 Theme Provider

- Implement a theme provider that supports `light | dark | system` modes.
- Persist theme preference in `localStorage`.
- Apply the correct class (`dark` or `light`) to the `<html>` element.
- Respect `prefers-color-scheme` for system preference.

```typescript
// components/layout/theme-provider.tsx
// Use next-themes or a custom implementation
// Must support: light, dark, system
// Must avoid flash of unstyled content (FOUC)
```

### 4.7 `proxy.ts` — Route Protection

> **CRITICAL:** In Next.js 16, the file convention is **`proxy.ts`**, not `middleware.ts`. This is a version-sensitive requirement from the PRD.

#### Purpose
- Perform **optimistic** route checks and redirects.
- Redirect unauthenticated users from `(app)` routes to `/sign-in`.
- Redirect authenticated users from `(public)` auth pages to `/dashboard`.
- This is **not** the sole authorization layer — real auth checks happen in server components and server actions.

#### Basic Structure
```typescript
// proxy.ts
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Check if user has a session cookie
  // Redirect unauthenticated users from protected routes to /sign-in
  // Redirect authenticated users from auth pages to /dashboard
  // Continue for all other routes
}
```

#### Configuration (`next.config.ts`)
If URL normalization needs to be disabled, use `skipProxyUrlNormalize` — **not** `skipMiddlewareUrlNormalize`.

### 4.8 Responsive Layout Shell

#### Desktop Layout
- **Left sidebar** (240–280px) with navigation links:
  - Dashboard
  - Tasks
  - Categories
  - Settings
- **Quick action button** for creating a new task.
- **Main content area** fills remaining width.

#### Mobile Layout
- **Header bar** with contextual actions (menu toggle, task create button).
- **Bottom navigation** or collapsible hamburger menu.
- **Content area** fills full width, single-column stacked layout.

#### Breakpoints
- Mobile: `< 768px` (default / base)
- Tablet: `768px – 1024px`
- Desktop: `> 1024px`

#### Responsive Requirements
- Sidebar collapses on mobile.
- Forms and cards stack vertically on small screens.
- Touch targets meet minimum 44px accessibility requirement.
- No horizontal scrolling on any viewport.

### 4.9 Environment Variables

#### `.env.example` (committed to repo)
```env
# Database
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### `.env.local` (gitignored — actual local values)
```env
# Database
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...

# Better Auth
BETTER_AUTH_SECRET=<generated-secret>
BETTER_AUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4.10 TypeScript Configuration

- Enable `strict` mode.
- Configure path aliases (`@/*` mapping to project root).
- Ensure `moduleResolution` is compatible with Next.js 16 requirements.

---

## 5) Component Architecture

### 5.1 Layout Components

| Component | Type | Description |
|-----------|------|-------------|
| `ThemeProvider` | Client | Manages light/dark/system theme preference |
| `AppShell` | Server/Client | Wraps authenticated pages with sidebar + header |
| `Sidebar` | Client | Desktop navigation sidebar |
| `MobileNav` | Client | Mobile bottom navigation or hamburger menu |
| `SidebarNav` | Client | Navigation links list (shared data, rendered differently per viewport) |

### 5.2 Placeholder Pages

Each placeholder page should render a simple heading and description indicating what will be built there:

```typescript
// Example: app/(app)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">Coming soon</p>
    </div>
  );
}
```

---

## 6) Data Flow

At this stage, there is no database connection. The focus is on:

1. **Route structure** — URL patterns are established and navigable.
2. **Layout hierarchy** — Root layout → route group layouts → page content.
3. **Theme flow** — `ThemeProvider` → `<html>` class → Tailwind dark mode.
4. **Proxy flow** — Request → `proxy.ts` → redirect or continue.

No server-side data fetching or mutations exist yet.

---

## 7) Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-1 | Next.js 16 app is scaffolded with App Router and TypeScript | `npm run dev` starts without errors |
| AC-2 | Tailwind CSS v4 is configured with `@import "tailwindcss"` and `@tailwindcss/postcss` | Utility classes render correctly; no v3 directives |
| AC-3 | shadcn/ui is initialized and at least the `Button` component is usable | `<Button>Click</Button>` renders with correct styles |
| AC-4 | Folder structure matches the PRD-recommended layout | All directories and placeholder files exist |
| AC-5 | Root layout includes `ThemeProvider` and proper `<html>` configuration | Theme toggle works; `dark` class is applied to `<html>` |
| AC-6 | Authenticated layout `(app)/layout.tsx` renders sidebar and mobile nav | Sidebar visible on desktop; bottom nav on mobile |
| AC-7 | Public layout `(public)/layout.tsx` renders minimal layout without sidebar | Auth pages have no sidebar chrome |
| AC-8 | `proxy.ts` exists at project root (not `middleware.ts`) | File is named correctly and contains route matching logic |
| AC-9 | All placeholder pages render without errors | Navigate to each route; see heading text |
| AC-10 | Responsive layout works across mobile, tablet, desktop breakpoints | Layout adapts correctly at each breakpoint |
| AC-11 | `.env.example` is committed; `.env.local` is gitignored | `git status` shows `.env.local` is ignored |
| AC-12 | TypeScript strict mode is enabled | No `any` types required for basic setup |
| AC-13 | Light/dark/system theme switching works without FOUC | Toggle theme; no flash of wrong theme on refresh |

---

## 8) Dependencies

### npm Packages

| Package | Purpose | Version Guidance |
|---------|---------|-----------------|
| `next` | Framework | ^16.x |
| `react` | UI runtime | ^19.x |
| `react-dom` | DOM renderer | ^19.x |
| `typescript` | Type system | ^5.x |
| `tailwindcss` | Styling | ^4.x |
| `@tailwindcss/postcss` | PostCSS plugin | ^4.x |
| `next-themes` | Theme provider (recommended) | Latest stable |
| `class-variance-authority` | Component variants (used by shadcn/ui) | Latest |
| `clsx` | Conditional classes | Latest |
| `tailwind-merge` | Merge Tailwind classes | Latest |
| `lucide-react` | Icons (used by shadcn/ui) | Latest |

> Additional packages (Better Auth, Drizzle, Zod, React Hook Form) will be added in subsequent features.

---

## 9) File Checklist

### Must Create
- [ ] `app/layout.tsx` — Root layout with ThemeProvider
- [ ] `app/globals.css` — Tailwind v4 import + CSS variables
- [ ] `app/(public)/layout.tsx` — Public route group layout
- [ ] `app/(public)/sign-in/page.tsx` — Placeholder
- [ ] `app/(public)/sign-up/page.tsx` — Placeholder
- [ ] `app/(public)/forgot-password/page.tsx` — Placeholder
- [ ] `app/(public)/reset-password/page.tsx` — Placeholder
- [ ] `app/(app)/layout.tsx` — Authenticated layout with AppShell
- [ ] `app/(app)/dashboard/page.tsx` — Placeholder
- [ ] `app/(app)/tasks/page.tsx` — Placeholder
- [ ] `app/(app)/tasks/[taskId]/page.tsx` — Placeholder
- [ ] `app/(app)/categories/page.tsx` — Placeholder
- [ ] `app/(app)/settings/page.tsx` — Placeholder
- [ ] `app/loading.tsx` — Global loading skeleton
- [ ] `app/error.tsx` — Global error boundary
- [ ] `components/layout/theme-provider.tsx` — Theme context
- [ ] `components/layout/app-shell.tsx` — App shell wrapper
- [ ] `components/layout/sidebar.tsx` — Desktop sidebar
- [ ] `components/layout/mobile-nav.tsx` — Mobile navigation
- [ ] `lib/utils.ts` — Shared utility (cn function)
- [ ] `proxy.ts` — Route protection (NOT middleware.ts)
- [ ] `.env.example` — Environment variable template
- [ ] `postcss.config.mjs` — Tailwind v4 PostCSS config
- [ ] `next.config.ts` — Next.js configuration

### Must Verify
- [ ] `tsconfig.json` — strict mode enabled, path aliases configured
- [ ] `.gitignore` — includes `.env.local`
- [ ] `package.json` — correct dependencies and scripts

---

## 10) Version-Sensitive Checklist

These items are **mandatory** per the PRD Section 17:

| Check | Requirement | Status |
|-------|-------------|--------|
| V-1 | File is named `proxy.ts`, not `middleware.ts` | ☐ |
| V-2 | If needed, config uses `skipProxyUrlNormalize`, not `skipMiddlewareUrlNormalize` | ☐ |
| V-3 | Tailwind v4 uses `@import "tailwindcss"` in CSS | ☐ |
| V-4 | Tailwind v4 uses `@tailwindcss/postcss` in PostCSS config | ☐ |
| V-5 | No v3-style `@tailwind` directives exist | ☐ |
| V-6 | shadcn/ui initialized via `npx shadcn@latest init` (current CLI) | ☐ |
| V-7 | App Router only — no Pages Router patterns | ☐ |
| V-8 | TypeScript strict mode enabled | ☐ |

---

## 11) Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Using Next.js 15 patterns instead of 16 | Broken proxy, misconfigured routing | Verify proxy file convention; check official Next.js 16 docs |
| Accidentally using Tailwind v3 setup | CSS not compiling, missing features | Enforce v4 import syntax and PostCSS plugin |
| shadcn/ui CLI changes | Incorrect component setup | Use `shadcn@latest` and follow current docs |
| Missing `default.tsx` for future parallel routes | Build or navigation failures | Add checklist item for when parallel routes are introduced |
| FOUC on theme load | Poor UX on initial load | Use `next-themes` with `suppressHydrationWarning` and script-based class injection |

---

## 12) Next Feature Dependency

This feature must be complete before starting:
- **P1-F2:** Better Auth Configuration — needs `lib/auth/` directory, environment variables, and proxy.ts
- **P1-F3:** Neon + Drizzle Setup — needs `lib/db/` directory, environment variables, and `drizzle.config.ts`
- **P1-F4:** Schema Generation & Migration — needs Drizzle config from P1-F3
- **All Phase 2 features** — need the layout shell and route structure

---

## 13) Commands Reference

```bash
# Scaffold Next.js 16 project
npx create-next-app@latest task-app --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

# Initialize Tailwind v4 (if not included by create-next-app)
npm install tailwindcss @tailwindcss/postcss

# Initialize shadcn/ui
npx shadcn@latest init

# Add core shadcn/ui components
npx shadcn@latest add button input card dropdown-menu dialog sheet skeleton toast tabs badge select checkbox label separator avatar tooltip form textarea

# Install theme provider
npm install next-themes

# Start development server
npm run dev

# Build for production
npm run build
```

---

*This feature document is the foundation for the entire TaskFlow application. All subsequent features depend on the project structure, layouts, and configuration established here.*