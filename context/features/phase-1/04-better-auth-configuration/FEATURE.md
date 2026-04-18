# Feature: Better Auth Core Setup

**Phase:** 1 — Foundation  
**Feature ID:** P1-F4  
**Status:** Ready for Implementation  
**Priority:** Critical (blocking — all authenticated features depend on this)

---

## 1) Overview

This feature configures the Better Auth core: server instance with email/password authenticator, Drizzle adapter integration, auth client for browser usage, session utilities, API route handler, and proxy updates. This establishes the authentication foundation that all other features build upon.

Password reset, forgot password, change password, and email verification flows are covered in **P1-F5**.

---

## 2) Scope

### In Scope
- Check the latest docs of Better Auth and Drizzle adapter using the Context7 MCP
- Install Better Auth and Drizzle adapter dependencies (separate packages)
- Fix the `sessions` table schema (add missing `token` column required by Better Auth)
- Configure Better Auth server instance with email/password authenticator
- Configure Better Auth client for browser usage (sign up, sign in, sign out, useSession only)
- Set up auth API route handlers
- Integrate with Drizzle adapter (using schema from P1-F3, with plural table name mapping)
- Configure session management and cookie settings
- Create server-side session utilities
- Update `proxy.ts` for session checks using `getSessionCookie` helper
- Configure environment variables

### Out of Scope
- Password reset flow (P1-F5)
- Forgot password flow (P1-F5)
- Change password flow (P1-F5)
- Email verification flow (P1-F5)
- Resend email service integration (P1-F5)
- Auth page UI components (Phase 2)
- OAuth providers (future scope)

---

## 3) User Stories

| ID | As a… | I want to… | So that… |
|----|-------|-----------|----------|
| US-1 | Developer | Configure Better Auth with email/password | Users can sign up and sign in securely |
| US-2 | Developer | Have auth client utilities | Frontend can call auth methods easily |
| US-3 | Developer | Check session on the server | Protected routes and queries are secure |
| US-4 | Developer | Have API route handlers | Auth endpoints work out of the box |

---

## 4) Technical Requirements

### 4.1 Dependencies

```bash
npm install better-auth @better-auth/drizzle-adapter
```

> **Important:** The Drizzle adapter is a **separate package** as of Better Auth v1.4+. The import path `better-auth/adapters/drizzle` still works, but `@better-auth/drizzle-adapter` must be installed.

### 4.2 Schema Fix — Add Missing `token` Column

The `sessions` table created in P1-F3 is missing the `token` column, which Better Auth requires for session cookie storage. Before proceeding, update `lib/db/schema.ts`:

```typescript
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(), // ← ADD THIS — session cookie value
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

Then generate and apply a migration:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 4.3 Better Auth Server Configuration

Create `lib/auth/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days (in seconds)
    updateAge: 60 * 60 * 24,     // 1 day  (in seconds)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes (in seconds)
    },
  },
  experimental: {
    joins: true, // 2-3x perf on /get-session — requires Drizzle relations (already defined)
  },
  plugins: [
    nextCookies(), // Must be the last plugin — handles Set-Cookie for server actions
  ],
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
    // Include NEXT_PUBLIC_APP_URL only if it differs from BETTER_AUTH_URL (e.g. separate client domain)
    ...(process.env.NEXT_PUBLIC_APP_URL &&
    process.env.NEXT_PUBLIC_APP_URL !== process.env.BETTER_AUTH_URL
      ? [process.env.NEXT_PUBLIC_APP_URL]
      : []),
  ],
});
```

> **Why `usePlural` + explicit mapping?** The existing Drizzle schema uses plural table names (`users`, `sessions`, `accounts`, `verifications`). Better Auth internally expects singular names. The `usePlural: true` option + explicit `schema` mapping ensures the adapter resolves tables correctly.

> **Why `experimental.joins`?** Available since v1.4.0, this enables SQL JOINs for endpoints like `/get-session`, yielding 2-3x performance gains. It requires Drizzle relations — which are already defined in `schema.ts`.

> **Cookie cache trade-off:** With a 5-minute cache, revoked sessions may remain active on other devices for up to 5 minutes. This is acceptable for this application. If immediate revocation becomes critical, reduce `maxAge` or disable `cookieCache`.

> Note: `sendResetPassword` and `sendVerificationEmail` callbacks will be added in P1-F5 when Resend is integrated.

### 4.4 Auth Client Configuration

Create `lib/auth/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
```

> Note: `forgetPassword`, `resetPassword`, and `changePassword` exports will be added in P1-F5.

### 4.5 Server-Side Session Utilities

Create `lib/auth/session.ts`:

```typescript
import { auth } from "./auth";
import { headers } from "next/headers";

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

/**
 * Get the current session. Returns the session object or null.
 * Uses cookie cache when available for performance.
 */
export async function getSession(): Promise<Session> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}

/**
 * Require an authenticated session. Throws if no session exists.
 * Use in server components/actions that must be authenticated.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Get the current user's ID, or null if not authenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

/**
 * Require an authenticated user and return their ID.
 * Throws if no session exists.
 */
export async function requireUserId(): Promise<string> {
  const session = await requireAuth();
  return session.user.id;
}
```

### 4.6 API Route Handler

Create `app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### 4.7 Update Proxy for Session Check

Update `proxy.ts` to use Better Auth's official `getSessionCookie` helper instead of hardcoding the cookie name:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const AUTH_PATHS = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
];

const STATIC_PATHS = [
  "/api",
  "/_next",
  "/favicon.ico",
  "/icons",
  "/images",
  "/fonts",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static/API paths entirely
  if (STATIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Use Better Auth's official cookie helper — resilient to cookie name changes
  const sessionCookie = getSessionCookie(request);
  const hasSession = !!sessionCookie;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // Authenticated users hitting auth pages → redirect to dashboard
  if (hasSession && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated users hitting protected pages → redirect to sign-in
  if (!hasSession && !isPublicPath) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon|icons|images|fonts).*)"],
};
```

> **Why `getSessionCookie`?** This is Better Auth's official helper from `better-auth/cookies`. It reads the correct cookie name (including custom prefixes if configured) without hardcoding `better-auth.session_token`. Note: this is an **optimistic check only** — it does NOT validate the session. Real auth validation happens in server components via `auth.api.getSession()`.

### 4.8 Environment Variables

Ensure `.env.example` includes:

```env
# Better Auth
BETTER_AUTH_SECRET=your-secret-min-32-characters
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate secret:
```bash
openssl rand -base64 32
```

---

## 5) Auth Flows (Core)

### Sign Up Flow
1. User submits form with name, email, password
2. Client calls `signUp.email({ name, email, password })`
3. Better Auth creates user + account record (password stored in `accounts` table with `providerId: "credential"`)
4. Session cookie is set automatically
5. User is redirected to dashboard

### Sign In Flow
1. User submits form with email, password
2. Client calls `signIn.email({ email, password })`
3. Better Auth verifies credentials (uses scrypt hashing by default)
4. Session cookie is set automatically
5. User is redirected to dashboard

### Sign Out Flow
1. User clicks sign out
2. Client calls `signOut()`
3. Session cookie is cleared, session revoked in DB
4. User is redirected to sign-in page

---

## 6) Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-1 | Better Auth server configured with Drizzle adapter | `auth.ts` exports working instance |
| AC-2 | Drizzle adapter uses `usePlural` and explicit schema mapping | No SQL errors for table names |
| AC-3 | Auth client configured and exported | Client methods usable in components |
| AC-4 | API route handler processes auth requests | `/api/auth/*` endpoints respond correctly |
| AC-5 | Session utilities work on server | `getSession()` returns session or null |
| AC-6 | Proxy uses `getSessionCookie` helper | Unauthenticated redirects to sign-in |
| AC-7 | Sign up works | New user created in database |
| AC-8 | Sign in works | Session created, cookie set |
| AC-9 | Sign out works | Session cleared, redirect to sign-in |
| AC-10 | Sessions table has `token` column | Migration applied successfully |
| AC-11 | Environment variables documented | `.env.example` has all auth vars |

---

## 7) File Checklist

### Must Create
- [ ] `lib/auth/auth.ts` — Better Auth server instance
- [ ] `lib/auth/auth-client.ts` — React auth client (sign up, sign in, sign out, useSession)
- [ ] `lib/auth/session.ts` — Server session utilities
- [ ] `app/api/auth/[...all]/route.ts` — Auth API handler

### Must Update
- [ ] `lib/db/schema.ts` — Add `token` column to sessions table
- [ ] `proxy.ts` — Use `getSessionCookie` helper + session cookie check
- [ ] `.env.example` — Add Better Auth variables (already done in P1-F2)
- [ ] `package.json` — Add `better-auth` and `@better-auth/drizzle-adapter` dependencies

### Must Run
- [ ] `npx drizzle-kit generate` — Generate migration for sessions `token` column
- [ ] `npx drizzle-kit migrate` — Apply migration

---

## 8) Version-Sensitive Checklist

| Check | Requirement | Status |
|-------|-------------|--------|
| V-1 | Install `better-auth` package | ☐ |
| V-2 | Install `@better-auth/drizzle-adapter` (separate package) | ☐ |
| V-3 | Use `drizzleAdapter` with `provider: "pg"` and `usePlural: true` | ☐ |
| V-4 | Pass explicit schema mapping (`user: schema.users`, etc.) | ☐ |
| V-5 | Use `toNextJsHandler` for Next.js App Router route | ☐ |
| V-6 | Include `nextCookies()` plugin as last plugin for App Router | ☐ |
| V-7 | Use `getSessionCookie` from `better-auth/cookies` in proxy | ☐ |
| V-8 | Use App Router API routes (`app/api/`) | ☐ |
| V-9 | Sessions table includes `token` column (text, not null, unique) | ☐ |
| V-10 | Import schema with relations to adapter for `experimental.joins` | ☐ |

---

## 9) Dependencies

This feature requires:
- **P1-F1:** Project Initialization (complete)
- **P1-F2:** Neon + Drizzle Setup (must be complete)
- **P1-F3:** Schema Generation & Migration (must be complete — schema fix for `token` column included here)

This feature blocks:
- **P1-F5:** Password Reset, Forgot Password & Resend Integration
- **P2-F1:** Auth Pages UI
- **P2-F2:** Dashboard
- **All authenticated features**

---

## 10) Testing Checklist

### Manual Testing

```bash
npm run dev

# Test auth endpoints via API 
POST http://localhost:3000/api/auth/sign-up/email
Content-Type: application/json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password1234"
}

POST http://localhost:3000/api/auth/sign-in/email
Content-Type: application/json
{
  "email": "test@example.com",
  "password": "password1234"
}

POST http://localhost:3000/api/auth/sign-out
```

### Verification Steps
1. Verify `token` column exists in `sessions` table after migration
2. POST to `/api/auth/sign-up/email` — confirm user + account + session rows created
3. Check response includes `Set-Cookie` header with `better-auth.session_token`
4. POST to `/api/auth/sign-in/email` — confirm session created
5. POST to `/api/auth/sign-out` — confirm session removed
6. Access a protected route without session — confirm redirect to `/sign-in`
7. Access `/sign-in` with active session — confirm redirect to `/dashboard`

### Integration Testing (After P2-F1)

1. Navigate to `/sign-up`
2. Create account with valid credentials
3. Verify user exists in database
4. Sign out
5. Navigate to `/sign-in`
6. Sign in with created credentials
7. Verify redirect to dashboard
8. Verify session cookie exists
9. Sign out and verify redirect to sign-in

---

## 11) Commands Reference

```bash
# Install dependencies
npm install better-auth @better-auth/drizzle-adapter

# Generate secret
openssl rand -base64 32

# Schema migration (for sessions token column)
npx drizzle-kit generate
npx drizzle-kit migrate

# Run dev server
npm run dev
```

---

*This feature configures core authentication only. Password reset, forgot password, change password, and email verification with Resend are in P1-F5.*
