<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Documentation Rule (Mandatory)

**Always check the latest documentation before writing code or fixing errors.**

When encountering build errors, type errors, lint warnings, or API uncertainty:

1. Use the **Context7 MCP** (`context7-mcp` skill) to query the latest library/framework documentation — do NOT rely on training data for API details.
2. For Neon-specific questions, use the **Neon MCP** tools or `Neon_list_docs_resources` / `Neon_get_doc_resource`.
3. For Next.js-specific issues, check `node_modules/next/dist/docs/` or the official Next.js docs.
4. Only after consulting documentation should you propose or apply a fix.

This applies to ALL libraries in the stack: Next.js, React, Tailwind CSS, shadcn/ui, Drizzle ORM, Better Auth, React Hook Form, Zod, Resend, and any other dependency.

## Project Summary

**TaskFlow** — A responsive task management web application for individual users. Built with Next.js 16 App Router, React 19, Tailwind CSS v4, shadcn/ui, Neon PostgreSQL, Drizzle ORM, Better Auth, Resend, and Zod v4.

### Core Features (MVP)
- Authentication (sign up, sign in, password reset via Resend, email verification)
- Dashboard overview (tasks due, overdue, completed, priority distribution)
- Task CRUD with status, priority, due dates, categories
- Category management
- Filtering, sorting, grouping
- User settings (theme, timezone, preferences)

### Current Status
MVP complete. All 4 phases implemented (Foundation, Core Product, Preferences & Polish, Hardening). 259 tests passing across 13 test files. Build and lint pass with zero errors and zero warnings. Remaining: `/` root page still shows default Next.js template (cosmetic — app works via `/sign-in` or `/dashboard`). Post-MVP features (shared tasks, notifications, recurring tasks, calendar sync, integrations) are explicitly deferred per PRD.

---

## Commands

- `npm run dev` — Start dev server
- `npm run lint` — Run ESLint
- `npm run build` — Production build
- `npx vitest` — Run test suite (259 tests across 13 files)

---

## Workflow (Required)

See `context/ai-interaction.md` for full workflow. Key points:

1. **Document first** — Update `context/current-feature.md` before implementing
2. **Branch per feature** — `feature/[name]` or `fix/[name]`
3. **Don't commit without permission** — Build must pass first
4. **Conventional commits** — `feat:`, `fix:`, `chore:`

---

## Skills

Two skills are available for this project:

### `feature` — Feature Workflow Management
**When to use:** Starting, reviewing, explaining, or completing a feature.

| Action | Description |
|--------|-------------|
| `load` | Load a feature spec or inline description |
| `start` | Begin implementation, create branch |
| `review` | Check goals met, code quality |
| `test` | Check for testable logic |
| `explain` | Document what changed and why |
| `complete` | Commit, push, merge, reset |

**Usage:** "Use the feature skill to start the authentication feature"

### `ui-ux-pro-max` — UI/UX Design Intelligence
**When to use:** Building or reviewing UI components, pages, layouts, forms, charts, or navigation.

| Scenario | Trigger |
|----------|---------|
| New page/component | "Build a dashboard", "Create a pricing card" |
| Style/color/font decisions | "What style fits fintech?", "Recommend colors" |
| Review existing UI | "Check accessibility", "Review this page for UX issues" |
| Dark mode, animations, responsive | "Add dark mode", "Improve mobile layout" |

**Usage:** "Use the ui-ux-pro-max skill to design the task list component"

---

## Architecture

- **Route groups**: `(app)` for authenticated (wrapped in AppShell), `(public)` for auth pages
- **Auth protection**: `proxy.ts` handles route gating — NOT middleware.ts
- **Path alias**: `@/*` maps to project root
- **Server components by default** — `'use client'` only when needed (interactivity, hooks, browser APIs)

---

## Critical: Next.js 16 Breaking Changes

- `middleware.ts` → **`proxy.ts`**
- `skipMiddlewareUrlNormalize` → **`skipProxyUrlNormalize`** in next.config
- Parallel routes require `default.tsx` for each named slot

---

## Critical: Tailwind CSS v4

DO NOT create `tailwind.config.ts` or `tailwind.config.js`.

```css
/* Correct v4 syntax */
@import "tailwindcss";

@theme {
  --color-primary: oklch(50% 0.2 250);
}
```

Theme customization goes in `app/globals.css` using `@theme` directive.

---

## UI Components

50+ shadcn/ui components in `components/ui/`. Add more with:
```bash
npx shadcn add <component>
```

---

## Server Actions vs API Routes

- **Server Actions**: form submissions, simple mutations
- **API Routes**: webhooks, file uploads, long operations, specific HTTP codes, third-party integrations

Return pattern from actions: `{ success, data?, error? }`

---

## Database (When Implemented)

- Drizzle ORM with migrations (not push for production)
- Better Auth Drizzle adapter: `npx auth@latest generate` → `drizzle-kit generate` → `drizzle-kit migrate`
- Every query must scope by `userId`

---

## Validation (When Implemented)

Zod v4 — prefer top-level validators: `z.email()`, `z.iso.datetime()`, `z.url()`, `z.uuid()`

---

## Environment

Required (see `.env.example`):
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

---

## References

- **`context/PRD.md`** — Full product spec, data model, routes, features, acceptance criteria
- **`context/coding-standards.md`** — TypeScript, React, Next.js, Tailwind, database conventions
- **`context/ai-interaction.md`** — Workflow, branching, commits, code review checklist
- **`context/current-feature.md`** — Active feature spec and history
- **`context/features/`** — Feature specifications by phase