# Current Feature: Better Auth Core Setup

## Status

Complete

## Goals

- Configure Better Auth server instance with email/password authenticator and Drizzle adapter
- Set up auth client for browser usage (sign up, sign in, sign out, useSession)
- Create auth API route handlers at /api/auth/[...all]
- Add token column to sessions table via migration
- Update proxy.ts to use getSessionCookie helper for session checks
- Verify sign up, sign in, and sign out flows work correctly

## Notes

- Critical feature — all authenticated features depend on this
- P1-F4 (Phase 1, Feature 4)
- Out of scope: Password reset, forgot password, email verification, Resend integration (covered in P1-F5)
- Requires installing better-auth and @better-auth/drizzle-adapter packages
- Sessions table needs token column added (migration required)
- Uses usePlural: true with explicit schema mapping for plural table names

## History

- **Project Initialization & Foundation Setup** (2026-04-16) - Scaffolded Next.js 16 App Router with TypeScript, Tailwind CSS v4, shadcn/ui (50+ components), route groups for authenticated/public layouts, ThemeProvider, proxy.ts for route protection, and env configuration.
- **Neon + Drizzle Setup** (2026-04-17) - Configured Neon PostgreSQL as the database, set up Drizzle ORM with neon-http driver, created db client, placeholder schema, drizzle.config.ts for migrations, added database scripts to package.json, and tested successful connection.
- **Schema Generation & Migration** (2026-04-17) - Created database schema with Better Auth tables (users, sessions, accounts, verifications) and application tables (tasks, categories, user_preferences), added Drizzle relations, performance indexes on tasks and categories, generated and ran migration against Neon database, verified all 7 tables, 3 enums, and 9 indexes exist.
- **Better Auth Core Setup** (2026-04-19) - Configured Better Auth server instance with email/password authenticator and Drizzle adapter (lib/auth/auth.ts), set up auth client for browser usage with signIn/signUp/signOut/useSession (lib/auth/auth-client.ts), created API route handlers at /api/auth/[...all], implemented session utilities with getSession/requireAuth/getCurrentUserId/requireUserId (lib/auth/session.ts), updated proxy.ts to use getSessionCookie helper for route protection. All sign up, sign in, and sign out flows are ready for testing.