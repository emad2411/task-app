# Current Feature: Auth Server Actions

## Status

Complete

## Goals

- Create signIn server action that handles email/password signin
- Create signUp server action that handles user registration with name, email, password
- Create forgotPassword server action for requesting password reset
- Create resetPassword server action for completing password reset with token
- Create updatePassword server action for authenticated users to change password
- Create verifyEmail server action for email verification
- All actions should use Zod v4 for validation
- All actions should return { success, data?, error? } pattern
- Actions should be in lib/actions/auth.ts

## Notes

- Use Better Auth for underlying auth operations
- Use existing authClient from lib/auth/auth-client.ts or auth server from lib/auth/auth.ts
- Password reset and email verification require Resend integration
- Check context7-mcp for Better Auth latest documentation
- This is P1-F5 in the PRD

## Depends on

- Better Auth Core Setup (already complete)
- Resend Email Integration

## History

- **Project Initialization & Foundation Setup** (2026-04-16) - Scaffolded Next.js 16 App Router with TypeScript, Tailwind CSS v4, shadcn/ui (50+ components), route groups for authenticated/public layouts, ThemeProvider, proxy.ts for route protection, and env configuration.
- **Neon + Drizzle Setup** (2026-04-17) - Configured Neon PostgreSQL as the database, set up Drizzle ORM with neon-http driver, created db client, placeholder schema, drizzle.config.ts for migrations, added database scripts to package.json, and tested successful connection.
- **Schema Generation & Migration** (2026-04-17) - Created database schema with Better Auth tables (users, sessions, accounts, verifications) and application tables (tasks, categories, user_preferences), added Drizzle relations, performance indexes on tasks and categories, generated and ran migration against Neon database, verified all 7 tables, 3 enums, and 9 indexes exist.
- **Better Auth Core Setup** (2026-04-19) - Configured Better Auth server instance with email/password authenticator and Drizzle adapter (lib/auth/auth.ts), set up auth client for browser usage with signIn/signUp/signOut/useSession (lib/auth/auth-client.ts), created API route handlers at /api/auth/[...all], implemented session utilities with getSession/requireAuth/getCurrentUserId/requireUserId (lib/auth/session.ts), updated proxy.ts to use getSessionCookie helper for route protection. All sign up, sign in, and sign out flows are ready for testing.
