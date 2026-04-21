# Current Feature: P2-F3 - Task Management (CRUD)

## Status

In Progress

## Goals

- Implement complete task lifecycle management so authenticated users can create, view, edit, complete, archive, and delete their personal tasks
- Provide a rich task list view at `/tasks` with sorting, filtering, and grouping capabilities
- Provide a dedicated task detail view at `/tasks/[taskId]`
- Enable quick task creation from both dashboard and task list
- Support task status transitions (todo → in_progress → done → archived)
- Allow users to assign categories, set priorities, and define due dates
- Implement confirmation dialogs for destructive actions (delete, archive)
- Ensure all data is strictly scoped to the authenticated user
- Update the existing `task-card.tsx` to link to the correct detail route

## Notes

- **Phase:** 2 - Core Product
- **Feature ID:** P2-F3
- **Spec Status:** Draft - Ready for Implementation
- **In Scope:** Task List Page (`/tasks`), Task Detail Page (`/tasks/[taskId]`), Task Forms & Dialogs (create, edit, delete, archive), Server Actions (`lib/actions/task.ts`), Validation Schemas (`lib/validation/task.ts`), Data Layer (`lib/data/task.ts`), Task Components (`components/tasks/`)
- **Out of Scope:** Advanced filtering and search (P2-F5), Category management UI (P2-F4), Bulk operations, Recurring tasks, Task comments/attachments, Drag-and-drop reordering
- **Dependencies:** Drizzle ORM, Zod v4, React Hook Form, shadcn/ui Dialog/Badge/Checkbox/Skeleton, sonner toasts
- **Key Files to Create:** `app/(app)/tasks/page.tsx`, `app/(app)/tasks/[taskId]/page.tsx`, `lib/actions/task.ts`, `lib/validation/task.ts`, `lib/data/task.ts`, `components/tasks/task-form.tsx`, `components/tasks/task-list.tsx`, `components/tasks/task-item.tsx`, `components/tasks/create-task-dialog.tsx`, `components/tasks/edit-task-dialog.tsx`
- **Existing Files to Update:** `components/tasks/task-card.tsx`

## History

- **Project Initialization & Foundation Setup** (2026-04-16) - Scaffolded Next.js 16 App Router with TypeScript, Tailwind CSS v4, shadcn/ui (50+ components), route groups for authenticated/public layouts, ThemeProvider, proxy.ts for route protection, and env configuration.
- **Neon + Drizzle Setup** (2026-04-17) - Configured Neon PostgreSQL as the database, set up Drizzle ORM with neon-http driver, created db client, placeholder schema, drizzle.config.ts for migrations, added database scripts to package.json, and tested successful connection.
- **Schema Generation & Migration** (2026-04-17) - Created database schema with Better Auth tables (users, sessions, accounts, verifications) and application tables (tasks, categories, user_preferences), added Drizzle relations, performance indexes on tasks and categories, generated and ran migration against Neon database, verified all 7 tables, 3 enums, and 9 indexes exist.
- **Better Auth Core Setup** (2026-04-19) - Configured Better Auth server instance with email/password authenticator and Drizzle adapter (lib/auth/auth.ts), set up auth client for browser usage with signIn/signUp/signOut/useSession (lib/auth/auth-client.ts), created API route handlers at /api/auth/[...all], implemented session utilities with getSession/requireAuth/getCurrentUserId/requireUserId (lib/auth/session.ts), updated proxy.ts to use getSessionCookie helper for route protection. All sign up, sign in, and sign out flows are ready for testing.
- **Auth Server Actions** (2026-04-19) - Installed Zod v4 and Vitest with testing dependencies. Created lib/validation/auth.ts with 6 Zod v4 validation schemas using top-level validators (z.email()). Implemented 6 server actions in lib/actions/auth.ts: signInAction, signUpAction, forgotPasswordAction, resetPasswordAction, updatePasswordAction, verifyEmailAction. All actions use Better Auth server API and return { success, data?, error? } pattern. Created comprehensive test suite with 25 tests in lib/actions/__tests__/auth.test.ts covering validation, error handling, security behaviors, and API integration. Build passes, all tests passing.
- **Resend Email Integration** (2026-04-20) - Installed `resend`, `@react-email/components`, and `react-email` packages. Created email infrastructure: `lib/email/resend.ts` (Resend client with dev mode fallback), `lib/email/index.ts` (public exports for sendPasswordResetEmail/sendVerificationEmail), email templates with shared components (email-layout.tsx, button.tsx), password-reset.tsx and email-verification.tsx templates. Updated `lib/auth/auth.ts` to enable `requireEmailVerification: true` and wire up Better Auth email callbacks using fire-and-forget pattern (void) to prevent timing attacks. Updated `.env.example` with Resend configuration. Build passes successfully.
- **Auth Pages UI** (2026-04-21) - Implemented complete authentication UI: sign-in, sign-up, forgot-password, reset-password, verify-email pages. Created reusable auth-card and success-card components. Fixed Better Auth error handling using isAPIError() function to properly catch and display error messages (invalid password, existing user). Added loading states, inline validation with React Hook Form + Zod, and toast notifications. Implemented mobile-first responsive design with Tailwind CSS v4 and shadcn/ui components.
- **Dashboard Overview** (2026-04-21) - Built personalized dashboard with stats cards (Due Today, Overdue, Completed Today, Total Active), priority distribution summary, upcoming tasks list (7 days), quick actions, and empty state for new users. Created date utilities with timezone support in lib/utils/date.ts, dashboard data layer in lib/data/dashboard.ts, and all UI components (stats-cards, priority-summary, upcoming-tasks, quick-actions, empty-state, dashboard-header). Added loading skeleton and error boundary. 22 date utility tests passing. Build passes successfully.
