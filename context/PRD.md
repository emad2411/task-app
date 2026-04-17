
# Product Requirements Document (PRD)
## TaskFlow — Responsive Task Management Web Application

**Document type:** Product + Technical PRD  
**Primary platform:** Responsive web application  
**Target stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, shadcn/ui, Neon PostgreSQL, Drizzle ORM, Better Auth, React Hook Form, Zod v4  
**Version validation date:** 2026-04-16  
**Status:** Draft v1.0 (implementation-ready)

---

## 1) Executive Summary

TaskFlow is a modern, responsive task management web application designed for individual users who need a fast, reliable workspace to create, organize, prioritize, and complete tasks from desktop, tablet, and mobile browsers.

The product focuses on six core areas:

1. **Authentication** — secure account creation, sign-in, session handling, email verification, password reset, and password change.
2. **Dashboard overview** — a personalized summary of workload, overdue items, due-soon tasks, priority distribution, and recent activity.
3. **Task CRUD** — create, read, update, complete, archive, and delete tasks.
4. **Filters / sorting / grouping** — enable users to quickly find and organize work by status, date, category, and priority.
5. **Category management** — allow users to create and manage personal task categories.
6. **User settings** — support profile, theme, timezone, date format, and task list preferences.

The application is **web-first**, optimized for the **Next.js App Router** architecture, and designed so each authenticated user sees only their own data. The user experience should feel clean, lightweight, and fast, while the implementation should follow current framework conventions and avoid outdated setup patterns.

---

## 2) Product Vision

### Vision Statement
Enable busy individuals to manage daily work with clarity using a fast, elegant, and trustworthy task management experience that is simple enough for daily use but technically robust enough for production deployment.

### Problem Statement
Many lightweight to-do tools either:
- lack structure for categories, due dates, and priorities,
- feel clunky on mobile,
- or are built on outdated patterns that complicate maintenance and scaling.

TaskFlow solves this by combining a streamlined UX with a current full-stack TypeScript architecture.

### Product Principles
- **Fast first interaction** — core screens must load quickly and feel responsive.
- **Simple by default** — primary task actions should require minimal clicks/taps.
- **Personal and secure** — all records are scoped per authenticated user.
- **Responsive first** — mobile usability is a first-class requirement, not a later adaptation.
- **Version-aware implementation** — framework-specific breaking changes must be reflected in architecture decisions.

---

## 3) Goals and Non-Goals

### Business / Product Goals
- Deliver a production-ready task management MVP for web.
- Provide a clean upgrade path for future collaboration or team features.
- Minimize technical debt by aligning implementation with current official library conventions.
- Establish a typed, maintainable codebase with strong validation and predictable data access.

### User Goals
- Register and sign in quickly.
- See a useful dashboard immediately after authentication.
- Create, edit, and complete tasks with minimal friction.
- Organize tasks by category, due date, and priority.
- Personalize experience via settings such as theme and timezone.

### Non-Goals (for MVP)
- Team workspaces / shared boards.
- Real-time multi-user collaboration.
- Native mobile apps.
- Calendar sync with external providers.
- File attachments and comments.
- Advanced automation rules.
- Offline-first sync engine.

---

## 4) Personas and Primary Use Cases

### Persona A — Busy Professional
Needs a simple but structured place to manage daily action items, deadlines, and priorities.

**Primary use cases**
- View tasks due today.
- Create quick tasks during the workday.
- Filter by urgent priority and due date.

### Persona B — Student / Individual Planner
Needs categories and due dates to organize assignments, personal goals, and reminders.

**Primary use cases**
- Group tasks by category.
- Track upcoming deadlines.
- Update tasks from phone and laptop interchangeably.

### Persona C — Personal Productivity User
Needs a clean workspace with dark mode, preferences, and minimal friction.

**Primary use cases**
- Manage a personal backlog.
- Sort by priority or status.
- Archive completed work without losing history.

---

## 5) Scope Overview

### In Scope (MVP)
- Email/password authentication.
- Email verification (configurable requirement).
- Request password reset, reset password, and change password.
- Authenticated dashboard.
- Task CRUD.
- Task status management.
- Category CRUD.
- Filtering, sorting, and grouping.
- Responsive layout.
- User preferences / settings.
- Theming (light/dark/system).
- Strong form validation.
- Typed database access and migrations.

### Future Scope (Post-MVP)
- Shared tasks.
- Notifications.
- Repeating tasks.
- Labels/tags in addition to categories.
- Full analytics dashboard.
- Integrations (calendar/email/Slack/etc.).

---

## 6) Functional Requirements

## 6.1 Authentication

### Objective
Provide secure, modern authentication using Better Auth with a user-friendly web flow.

### Required Capabilities
- User sign up with **name, email, password**.
- User sign in with **email, password**.
- Session persistence across refreshes.
- Sign out.
- Optional email verification enforcement.
- Request password reset.
- Reset password using tokenized link.
- Change password when logged in.
- Protect authenticated routes.
- Prevent cross-user data access.

### UX Requirements
- Public auth pages: `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`.
- Redirect authenticated users away from sign-in/sign-up pages to the app dashboard.
- Display clear field-level errors and non-field auth errors.
- Maintain form state during submission and disable duplicate submissions.
- Support mobile-friendly forms and keyboard behavior.

### Acceptance Criteria
- A new user can sign up successfully with valid credentials.
- A user with invalid credentials receives a clear error message.
- An authenticated user can refresh the browser and remain signed in if session is valid.
- A logged-in user can sign out and is redirected to a public route.
- A user can request a password reset email and later reset their password using a valid token.
- A signed-in user can change their password by providing the current password.
- An unauthenticated user cannot access dashboard/task/settings routes.
- One user cannot read or mutate another user’s tasks or categories even if IDs are guessed.

---

## 6.2 Dashboard Overview

### Objective
Give users immediate visibility into their current workload and priorities after sign-in.

### Dashboard Widgets (MVP)
- **Tasks due today** count.
- **Overdue tasks** count.
- **Completed tasks** count (today / recent period).
- **Tasks by priority** summary.
- **Upcoming tasks** list.
- **Recent activity** (optional lightweight implementation based on recent task updates).

### UX Requirements
- Desktop: grid-based cards.
- Mobile: single-column stacked cards.
- Empty-state messaging when there are no tasks.
- Quick actions: create task, view all tasks, manage categories.

### Acceptance Criteria
- After sign-in, users land on a dashboard page.
- Dashboard content is specific to the authenticated user.
- Dashboard cards render correctly on desktop and mobile.
- Empty states appear when user has no data.
- Dashboard data updates after task changes.

---

## 6.3 Task Management (CRUD)

### Objective
Allow users to create, edit, track, and manage tasks efficiently.

### Task Fields (MVP)
- `title` (required)
- `description` (optional)
- `status` (`todo`, `in_progress`, `done`, `archived`)
- `priority` (`low`, `medium`, `high`)
- `dueDate` (optional)
- `categoryId` (optional)
- `completedAt` (nullable)
- `createdAt`, `updatedAt`

### Required Actions
- Create task.
- View task list.
- View task detail.
- Edit task.
- Mark task as complete / incomplete.
- Archive task.
- Delete task.

### UX Requirements
- Task creation available from dashboard and task list.
- Quick status toggle from task list.
- Create/edit form should support client-side validation and server-side validation.
- Delete action must require confirmation.
- Due dates and priorities should be visible in list item summaries.
- Completed tasks should be visually distinct.

### Acceptance Criteria
- User can create a valid task and see it appear immediately in the list.
- Title is required; invalid forms do not submit.
- Editing a task updates persisted data and UI.
- Completing a task updates its status and timestamp.
- Deleting a task removes it permanently from the active dataset.
- Archived tasks are excluded from default “active” views unless explicitly filtered.

---

## 6.4 Task Filters, Sorting, and Grouping

### Objective
Make large task lists manageable without requiring complex navigation.

### Required Filters
- Status
- Priority
- Category
- Due date state (`today`, `upcoming`, `overdue`, `no_due_date`)
- Search by text (title / optionally description)

### Required Sorting
- Due date ascending / descending
- Created date newest / oldest
- Updated date newest / oldest
- Priority
- Alphabetical title

### Optional Grouping (MVP+) — include if effort remains small
- Group by status
- Group by category
- Group by due date bucket

### Acceptance Criteria
- User can combine multiple filters.
- Sorting changes list order correctly and consistently.
- Filter state is preserved during user session/navigation within the tasks area.
- Empty-state messaging appears when no tasks match filters.

---

## 6.5 Category Management

### Objective
Allow users to organize tasks into personal categories.

### Category Fields
- `name` (required)
- `color` (optional, design-token-based or hex string)
- `createdAt`, `updatedAt`

### Required Actions
- Create category.
- Rename category.
- Delete category.
- Assign category to task.

### Business Rules
- Category names must be unique **per user**.
- Deleting a category must not delete tasks; associated tasks should either:
  - become uncategorized, or
  - be reassigned only if user explicitly chooses another category.

**MVP decision:** deleting a category sets related task `categoryId` to `null`.

### Acceptance Criteria
- User can create multiple categories.
- Category is visible in task forms and filter controls.
- Duplicate category names for the same user are rejected.
- Deleting a category does not delete tasks.

---

## 6.6 User Settings and Preferences

### Objective
Allow users to personalize the application and manage basic account preferences.

### Settings Areas
1. **Profile**
   - display name
   - avatar/image URL (optional MVP if supported)
2. **Security**
   - change password
   - sign out of current session
   - optional future: revoke other sessions
3. **Appearance**
   - theme: light / dark / system
4. **Preferences**
   - timezone
   - default sort order
   - date display format
   - default dashboard landing section (optional)

### Acceptance Criteria
- User can update display name and preferences.
- Theme selection applies consistently across the app.
- Preferences persist across sessions.
- User can change password from settings.

---

## 7) Information Architecture and Navigation

### Primary Route Structure
- `/` — marketing / landing (or redirect)
- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/reset-password`
- `/dashboard`
- `/tasks`
- `/tasks/[taskId]`
- `/categories`
- `/settings`

### Navigation Model
**Desktop**
- Left sidebar or top nav with links to Dashboard, Tasks, Categories, Settings.
- Quick action button for new task.

**Mobile**
- Header with contextual actions.
- Bottom nav or collapsible menu.
- Primary task actions accessible without precision tapping.

### Empty States
All primary pages must include meaningful empty states with calls to action.

### Error States
- Auth errors.
- Network/server mutation failure.
- Missing resource (404-style page).
- Generic application error boundary.

---

## 8) Responsive UX Requirements

### Breakpoint Strategy
- **Mobile first** design system.
- Small screens prioritize stacked layouts and simplified controls.
- Larger screens add multi-column layouts, denser summaries, and wider forms.

### Accessibility Requirements
- Keyboard accessible navigation and forms.
- Proper label associations.
- Focus-visible styles.
- Minimum color contrast aligned with accessible defaults.
- Semantic headings and landmarks.
- Dialogs/modals must trap focus and support escape-to-close where appropriate.

### Performance UX Requirements
- Forms should show loading states during submission.
- Route transitions should feel immediate.
- Use skeletons/loading UI for primary async surfaces where useful.

---

## 9) Technical Stack and Architecture Overview

## 9.1 Required Stack
- **Framework:** Next.js 16 with **App Router**
- **UI runtime:** React 19
- **Styling:** Tailwind CSS v4
- **Component system:** shadcn/ui
- **Database:** Neon PostgreSQL
- **ORM / schema / migrations:** Drizzle ORM + Drizzle Kit
- **Authentication:** Better Auth
- **Forms:** React Hook Form
- **Validation:** Zod v4
- **Language:** TypeScript

## 9.2 Architectural Style
- Full-stack TypeScript application using the **Next.js App Router**.
- Server-first data loading where appropriate.
- Client Components only where interactivity is required.
- Database access centralized in a typed data layer using Drizzle.
- Authentication handled by Better Auth with database-backed sessions.
- Validation shared between UI forms and server mutations via Zod schemas.

## 9.3 Rendering Strategy
- **Server Components** for page-level data loading and authenticated layouts.
- **Client Components** for forms, dialogs, task interactions, filters, and local UI state.
- **Server Actions and/or Route Handlers** for mutations depending on implementation preference.
- Use cache invalidation/revalidation carefully after mutations where needed.

## 9.4 Recommended High-Level Modules
- `app/` — routes, layouts, loading/error states, route groups, server actions where applicable.
- `components/` — reusable UI and feature components.
- `components/ui/` — shadcn/ui generated primitives.
- `lib/auth/` — Better Auth server/client setup.
- `lib/db/` — Drizzle client, schema, query helpers.
- `lib/validation/` — Zod schemas.
- `lib/actions/` — mutations and domain-specific server actions.
- `lib/utils/` — shared helpers.
- `types/` — application types where needed.

### Example Folder Structure
```text
app/
  (public)/
    sign-in/page.tsx
    sign-up/page.tsx
    forgot-password/page.tsx
    reset-password/page.tsx
  (app)/
    layout.tsx
    dashboard/page.tsx
    tasks/page.tsx
    tasks/[taskId]/page.tsx
    categories/page.tsx
    settings/page.tsx
    loading.tsx
    error.tsx
components/
  ui/
  auth/
  dashboard/
  tasks/
  categories/
  settings/
lib/
  auth/
    auth.ts
    auth-client.ts
  db/
    index.ts
    schema.ts
  validation/
  actions/
  queries/
proxy.ts
```

---

## 10) Authentication Architecture

## 10.1 Better Auth Overview
Better Auth is the source of truth for:
- user accounts,
- sessions,
- verification flows,
- password reset flows,
- password change,
- auth-related database schema.

## 10.2 Auth Flow Decisions
- Use Better Auth **email and password** authenticator.
- Use Better Auth **Drizzle adapter** with PostgreSQL provider (`pg`).
- Store sessions in the database.
- Enable email verification based on product policy (recommended: enabled but not blocking MVP if email delivery is not yet production-ready).

## 10.3 Route Protection Strategy
- Use **`proxy.ts`** for lightweight request interception / optimistic redirects.
- Do **not** rely on proxy alone as the authoritative authorization layer.
- Enforce actual user/session checks in **server-side code** (layouts, page loaders, route handlers, server actions).
- Scope every database query and mutation by the authenticated `userId`.

## 10.4 Auth UX Flows
### Sign Up
1. User submits name, email, password.
2. Better Auth creates user + credential account.
3. User may be auto-signed-in depending on configuration.
4. Optional: verification email is dispatched.

### Sign In
1. User submits email, password.
2. Better Auth verifies credentials and creates/refreshes session.
3. User is redirected to `/dashboard`.

### Request Password Reset
1. User submits email.
2. Better Auth triggers `requestPasswordReset` flow.
3. Email contains reset link to `/reset-password?token=...`.

### Reset Password
1. User opens reset link.
2. UI reads token from query params.
3. User submits new password.
4. Better Auth `resetPassword` completes the flow.

### Change Password
1. Authenticated user submits current password + new password.
2. Better Auth `changePassword` updates stored credential.

---

## 11) Data Model (Application + Auth)

## 11.1 Core Domain Tables

### `users`
Managed primarily by Better Auth schema generation / auth schema rules.

Representative fields:
- `id`
- `name`
- `email`
- `emailVerified`
- `image`
- `createdAt`
- `updatedAt`

### `sessions`
Managed by Better Auth.

### `accounts`
Managed by Better Auth; credential password hashes live here for email/password.

### `verifications`
Managed by Better Auth for verification and reset flows.

### `categories`
- `id`
- `userId` (FK → users.id)
- `name`
- `color`
- `createdAt`
- `updatedAt`

### `tasks`
- `id`
- `userId` (FK → users.id)
- `categoryId` (nullable FK → categories.id)
- `title`
- `description`
- `status`
- `priority`
- `dueDate` (nullable)
- `completedAt` (nullable)
- `createdAt`
- `updatedAt`

### `user_preferences`
- `id`
- `userId` (unique FK → users.id)
- `theme`
- `timezone`
- `dateFormat`
- `defaultTaskSort`
- `createdAt`
- `updatedAt`

## 11.2 Data Integrity Rules
- Every task belongs to exactly one user.
- Every category belongs to exactly one user.
- A task may optionally belong to one category owned by the same user.
- Category names are unique per user.
- Preferences record is unique per user.

## 11.3 Suggested Enums
- `task_status`: `todo | in_progress | done | archived`
- `task_priority`: `low | medium | high`
- `theme_preference`: `light | dark | system`

---

## 12) Application Behaviors and Business Rules

### Task Status Rules
- New tasks default to `todo`.
- Marking a task as done sets `completedAt`.
- Reopening a completed task clears `completedAt` and returns it to a non-done state.

### Due Date Rules
- Overdue = task not done and due date earlier than current date/time in the user context.
- Due today = due date falls within user’s current date.

### Category Rules
- Users only see categories they created.
- Tasks cannot be assigned to another user’s categories.

### Settings Rules
- Theme and date/time preferences should persist across sessions.
- Timezone impacts due-date interpretation and dashboard summaries.

---

## 13) Form and Validation Strategy

## 13.1 Form Standard
Use **React Hook Form** for client-side form state and submission handling.

## 13.2 Validation Standard
Use **Zod v4** as the canonical validation layer for:
- auth forms,
- task forms,
- category forms,
- settings forms,
- server mutation input parsing.

## 13.3 Validation Design Principles
- Validate on both client and server.
- Prefer reusable schema modules.
- Keep user-facing error messages clear and actionable.
- Parse and normalize date/time data consistently before persistence.

### Example Schema Areas
- `signUpSchema`
- `signInSchema`
- `requestPasswordResetSchema`
- `resetPasswordSchema`
- `changePasswordSchema`
- `createTaskSchema`
- `updateTaskSchema`
- `createCategorySchema`
- `updatePreferencesSchema`

---

## 14) UI System

## 14.1 Design System
- Tailwind CSS v4 for styling primitives and tokens.
- shadcn/ui for accessible, composable building blocks.
- Design language: modern, clean, minimal, productivity-oriented.

## 14.2 Core Components
- Button
- Input / Textarea
- Select / Combobox
- Checkbox
- Dialog / Sheet
- Dropdown menu
- Card
- Tabs
- Badge
- Table / list container
- Toast / alert
- Skeleton

## 14.3 Key Feature Components
- AuthForm
- TaskForm
- TaskList
- TaskCard / TaskRow
- TaskFiltersBar
- CategoryForm
- DashboardStats
- UserSettingsForm

---

## 15) Data Access and Mutation Strategy

### Query Principles
- Centralize query logic for maintainability.
- Every query must include `userId` scoping where applicable.
- Favor explicit field selection for performance-sensitive surfaces.

### Mutation Principles
- Use server-side mutations for all writes.
- Validate input using Zod before DB operations.
- Return structured success/error payloads.
- Revalidate affected routes/views after mutation.

### Recommended Mutation Surfaces
- Create task
- Update task
- Delete task
- Toggle completion
- Create category
- Update category
- Delete category
- Update profile/preferences

---

## 16) Search, Filtering, and Query Performance

### MVP Performance Requirements
- Task list interactions should remain responsive with at least several hundred user-scoped tasks.
- Common list views should use indexed query paths.

### Recommended Indexes
- `tasks(user_id, status)`
- `tasks(user_id, due_date)`
- `tasks(user_id, priority)`
- `tasks(user_id, category_id)`
- `categories(user_id, name)` unique

### Search Strategy
For MVP, use simple case-insensitive title search (and optional description search). Full-text search can be deferred.

---

## 17) Version-Sensitive Changes / Latest Framework Requirements

This section is mandatory and must be followed during implementation.

## 17.1 Next.js 16

### A. `middleware.ts` → `proxy.ts`
- Next.js 16 renamed the file convention from **`middleware.ts`** to **`proxy.ts`**.
- Any request interception or route gating documentation must refer to **`proxy.ts`**, not `middleware.ts`.
- `proxy.ts` lives at the project root (or `src/`) alongside `app/`.

### B. `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`
- If URL normalization must be disabled for advanced proxy scenarios, use **`skipProxyUrlNormalize`** in `next.config.*`.
- Do not use the old `skipMiddlewareUrlNormalize` key.

### C. Parallel routes require `default.tsx`
If the application uses **Parallel Routes** (for example, login/task detail/create-task modals with intercepted routes):
- Each named slot (e.g. `@modal`, `@auth`) requires an explicit **`default.tsx`** fallback.
- The implicit `children` slot should also have a root `default.tsx` when appropriate to avoid hard navigation / 404 issues.
- Missing defaults can lead to build or navigation failures.

### D. App Router only
- Architecture must follow **App Router** conventions.
- Do not design the application around legacy Pages Router assumptions.

### E. Proxy is not the only auth layer
- Proxy can perform **optimistic checks** and redirects.
- Actual authorization must still happen in server-side application logic.

## 17.2 Better Auth

### A. Drizzle adapter usage
Use Better Auth with:
- `better-auth`
- `better-auth/adapters/drizzle`
- a configured Drizzle DB instance
- provider set to **`pg`** for PostgreSQL

### B. Schema generation / migration flow
For Drizzle-based projects:
1. Configure Better Auth in `auth.ts`.
2. Run **`npx auth@latest generate`** to generate the auth schema for Drizzle.
3. Run **`npx drizzle-kit generate`** to create migration SQL.
4. Run **`npx drizzle-kit migrate`** to apply migrations.

Important:
- Better Auth CLI `migrate` applies schema directly only for the built-in Kysely adapter.
- For Drizzle, use **generate + Drizzle migrations**, not Better Auth direct migrate.

### C. Custom table/schema mapping
- If auth tables use custom names or pluralized names, explicitly map schema/table names in the Drizzle adapter config.
- If relations are used for Better Auth joins, ensure Drizzle relations are defined and passed correctly.

### D. Current password conventions
Use current Better Auth terminology and methods:
- **request password reset**
- **reset password**
- **change password**

Do not invent undocumented endpoint names unless they are explicit app-owned wrappers.

### E. Password hashing default
- Better Auth currently uses **scrypt** by default for password hashing.
- Custom hash/verify functions may be provided only if there is a justified security/operational requirement.

## 17.3 Drizzle ORM / Drizzle Kit

### A. Current config pattern
- Use **`drizzle.config.ts`**.
- Use **`dialect: 'postgresql'`** for this project.
- Define schema paths explicitly.

### B. Modern PostgreSQL schema style
- Prefer current PostgreSQL schema patterns, including **identity columns** where appropriate, instead of older serial-first examples.

### C. Migration workflow distinction
- **`drizzle-kit push`** is acceptable for rapid local development / prototyping.
- **`drizzle-kit generate` + `drizzle-kit migrate`** is the default workflow for proper migration history and team-friendly production pipelines.

### D. Release-sensitive API behavior
Drizzle has had important release-level API changes, including:
- PostgreSQL **index API** changes.
- PostgreSQL **timestamp/date mapping** changes.

Old examples from older blog posts or tutorials may be incompatible or misleading.

## 17.4 Tailwind CSS v4

### A. New import syntax
Use:
```css
@import "tailwindcss";
```

Do **not** use the old v3-style:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### B. PostCSS plugin change
Use **`@tailwindcss/postcss`** in PostCSS configuration.
Do not configure `tailwindcss` directly as the PostCSS plugin in v4 projects.

## 17.5 Zod v4

### A. Prefer top-level string format validators in new code
Prefer modern validators such as:
- `z.email()`
- `z.iso.datetime()`
- `z.url()`
- `z.uuid()`

These should be preferred over older style chained format validators in new code examples where equivalent top-level APIs exist.

### B. Shared schema design
Keep schemas reusable between client and server, and define normalization explicitly when needed.

## 17.6 shadcn/ui

### A. Setup convention
Use the **current shadcn CLI flow** for Next.js:
- scaffold or initialize with `shadcn@latest`
- then add components via CLI

Do not assume an outdated manual-only setup process.

---

## 18) Neon PostgreSQL Requirements

### Database Role
Neon PostgreSQL is the **primary application database**.

### Connection Strategy
- Use Neon PostgreSQL for production data.
- Use environment-specific connection strings.
- For serverless runtimes, the **Neon serverless driver** is preferred.

### Migration Consideration
- Use a **direct / non-pooled** connection for migrations where required to avoid migration issues.
- Use pooled or serverless-appropriate connections for application runtime as needed.

---

## 19) Security Requirements

### Authentication / Session Security
- Sessions managed by Better Auth.
- Auth cookies should use secure defaults in production.
- Rely on Better Auth CSRF/origin protections.
- Never trust only client state for authentication decisions.

### Authorization
- Every user-scoped table query must enforce `userId` ownership.
- 404/403 behavior should avoid leaking object existence across users.

### Input Safety
- Validate all mutation payloads with Zod.
- Sanitize and constrain user-generated text where needed.

### Operational Security
- Store secrets in environment variables.
- Use a strong Better Auth secret.
- Avoid logging sensitive values.
- Restrict trusted origins in production.

---

## 20) Non-Functional Requirements

### Performance
- Initial app shell should load quickly on broadband and modern mobile networks.
- Core navigation should feel near-instant after hydration.
- Task list query times should remain fast for normal personal datasets.

### Reliability
- No cross-user data leakage.
- Writes must be idempotent where practical against accidental double submission.
- Errors should be observable and diagnosable.

### Maintainability
- Type-safe end to end.
- Clear separation of concerns between UI, validation, auth, and data layers.
- Current official docs should be the reference source for setup and upgrades.

### Scalability
- Architecture should support future expansion to labels, recurring tasks, collaboration, and notifications without re-platforming.

### Accessibility
- WCAG-minded semantic structure and keyboard navigation.

### Responsiveness
- Must support mobile, tablet, and desktop layouts.

---

## 21) Recommended Delivery Phases

### Phase 1 — Foundation
- Initialize Next.js 16 app.
- Configure Tailwind v4.
- Initialize shadcn/ui.
- Configure Neon + Drizzle.
- Configure Better Auth.
- Generate and migrate schema.
- Establish authenticated layout and proxy.

### Phase 2 — Core Product
- Build auth pages.
- Build dashboard shell.
- Implement task CRUD.
- Implement categories.
- Implement filters and sorting.

### Phase 3 — Preferences and Polish
- Implement settings page.
- Add theme support.
- Improve empty/loading/error states.
- Add responsive refinements.
- Add test coverage for critical flows.

### Phase 4 — Hardening
- Security review.
- Performance review.
- Migration review.
- Observability/logging.
- Production deployment readiness.

---

## 22) QA and Acceptance Checklist

### Authentication
- [ ] Sign up works with valid input.
- [ ] Sign in works with valid credentials.
- [ ] Invalid credentials show proper errors.
- [ ] Password reset request works.
- [ ] Password reset completion works.
- [ ] Change password works for authenticated users.
- [ ] Protected routes block unauthenticated access.

### Dashboard
- [ ] Dashboard loads user-specific summaries.
- [ ] Empty state displays correctly for new users.
- [ ] Stats update after task changes.

### Tasks
- [ ] Create/edit/delete flows work.
- [ ] Status updates work.
- [ ] Due dates render correctly.
- [ ] Priority badges render correctly.
- [ ] User cannot access another user’s task.

### Categories
- [ ] Create/update/delete category works.
- [ ] Duplicate names are blocked per user.
- [ ] Category deletion does not delete tasks.

### Settings
- [ ] Profile update works.
- [ ] Theme preference persists.
- [ ] Timezone/date format preference persists.

### Technical
- [ ] Database migrations run cleanly.
- [ ] `proxy.ts` is used instead of `middleware.ts`.
- [ ] Any parallel route slots include required `default.tsx` files.
- [ ] Tailwind v4 setup uses `@import "tailwindcss";`.
- [ ] Zod v4 schema style is used in new code.

---

## 23) Risks and Mitigations

### Risk: Using outdated examples
**Mitigation:** anchor implementation to official docs and maintain a version-sensitive checklist.

### Risk: Auth flow complexity during framework upgrades
**Mitigation:** isolate auth configuration, use official Better Auth adapter patterns, keep server-side authorization explicit.

### Risk: Schema drift between Better Auth and custom domain tables
**Mitigation:** treat auth schema generation and Drizzle migrations as a documented workflow.

### Risk: Modal route issues with parallel routes
**Mitigation:** require `default.tsx` for named slots and validate hard refresh behavior.

### Risk: Tailwind v3 setup copied into v4 app
**Mitigation:** enforce Tailwind v4 CSS import and PostCSS plugin configuration in project checklist.

---

## 24) Final Implementation Notes

This PRD intentionally aligns the product definition with **current** library conventions rather than legacy examples. The implementation team should treat the “Version-Sensitive Changes / Latest Framework Requirements” section as mandatory, not optional.

The product should be built as a **clean, maintainable, responsive web app** with a modern user experience and a codebase designed to stay upgrade-friendly.

---

## 25) Validation References (Official Docs Reviewed)

### Next.js
- Proxy file convention: https://nextjs.org/docs/pages/api-reference/file-conventions/proxy
- App Router proxy guide: https://nextjs.org/docs/app/getting-started/proxy
- Parallel routes: https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes
- Missing default for parallel route: https://nextjs.org/docs/messages/slot-missing-default

### Better Auth
- Email & Password: https://better-auth.com/docs/authentication/email-password
- Drizzle adapter: https://better-auth.com/docs/adapters/drizzle
- Database concepts: https://better-auth.com/docs/concepts/database
- CLI: https://better-auth.com/docs/concepts/cli
- Email concepts: https://better-auth.com/docs/concepts/email
- Security reference: https://better-auth.com/docs/reference/security

### Drizzle ORM / Drizzle Kit
- PostgreSQL getting started: https://orm.drizzle.team/docs/get-started/postgresql-new
- Latest releases index / release notes: https://orm.drizzle.team/docs/latest-releases
- v0.31.0 release notes (index API changes): https://orm.drizzle.team/docs/latest-releases/drizzle-orm-v0310
- v0.30.0 release notes (timestamp mapping changes): https://orm.drizzle.team/docs/latest-releases/drizzle-orm-v0300

### Neon
- Connect Drizzle to Neon: https://neon.com/docs/guides/drizzle
- Drizzle migrations with Neon: https://neon.com/docs/guides/drizzle-migrations

### Tailwind CSS
- Tailwind v4 PostCSS install: https://tailwindcss.com/docs/installation/using-postcss

### shadcn/ui
- Next.js installation: https://ui.shadcn.com/docs/installation/next

### Zod
- Zod intro: https://zod.dev/
- Zod API / validators: https://zod.dev/api?id=iso-dates

### React Hook Form
- Docs: https://react-hook-form.com/docs
- Zod resolver package: https://www.npmjs.com/package/@hookform/resolvers
