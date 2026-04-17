# Feature: Better Auth Configuration

**Phase:** 1 — Foundation  
**Feature ID:** P1-F4  
**Status:** Ready for Implementation  
**Priority:** Critical (blocking — all authenticated features depend on this)

---

## 1) Overview

This feature configures Better Auth for email/password authentication, integrates with the Drizzle adapter using the schema from P1-F3, and establishes auth client/server setup. This is the authentication foundation that Phase 2 features will build upon.

---

## 2) Scope

### In Scope
- Install Better Auth and Drizzle adapter dependencies
- Configure Better Auth server instance with email/password authenticator
- Configure Better Auth client for browser usage
- Set up auth API route handlers
- Integrate with Drizzle adapter (using schema from P1-F3)
- Configure session management and cookie settings
- Set up email verification flow (configurable)
- Set up password reset flow
- Set up password change flow
- Create server-side session utilities
- Update `proxy.ts` for session checks
- Configure email placeholder for development

### Out of Scope
- Auth page UI components (covered in Phase 2)
- Actual email delivery (use console/dev mode for MVP)
- OAuth providers (future scope)

---

## 3) User Stories

| ID | As a… | I want to… | So that… |
|----|-------|-----------|----------|
| US-1 | Developer | Configure Better Auth with email/password | Users can sign up and sign in securely |
| US-2 | Developer | Have auth client utilities | Frontend can call auth methods easily |
| US-3 | Developer | Check session on the server | Protected routes and queries are secure |
| US-4 | User | Request a password reset | I can recover access if I forget my password |
| US-5 | User | Verify my email (optional) | My account is confirmed |

---

## 4) Technical Requirements

### 4.1 Dependencies

```bash
npm install better-auth
```

> Drizzle adapter is included with Better Auth.

### 4.2 Better Auth Server Configuration

Create `lib/auth/auth.ts`:

```typescript
// lib/auth/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if email verification required
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session once per day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache for 5 minutes
    },
  },
  plugins: [
    nextCookies(), // Required for App Router
  ],
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
    process.env.NEXT_PUBLIC_APP_URL!,
  ],
});
```

### 4.3 Auth Client Configuration

Create `lib/auth/auth-client.ts`:

```typescript
// lib/auth/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
});

// Export typed hooks and methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;

// Password reset methods
export const {
  forgetPassword,
  resetPassword,
} = authClient;

// Password change
export const {
  changePassword,
} = authClient;
```

### 4.4 Server-Side Session Utilities

Create `lib/auth/session.ts`:

```typescript
// lib/auth/session.ts
import { auth } from "./auth";
import { headers } from "next/headers";

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

/**
 * Get the current session or null if not authenticated
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
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Get the current user ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

/**
 * Require authentication and return user ID
 */
export async function requireUserId(): Promise<string> {
  const session = await requireAuth();
  return session.user.id;
}
```

### 4.5 API Route Handler

Create `app/api/auth/[...all]/route.ts`:

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const { GET, POST } = handler;
```

### 4.6 Email Configuration (Dev Placeholder)

Create `lib/auth/email.ts`:

```typescript
// lib/auth/email.ts
/**
 * Email configuration for development
 * In production, replace with actual email service (Resend, SendGrid, etc.)
 */

export const sendVerificationEmail = async (
  email: string,
  url: string
) => {
  console.log(`[DEV] Verification email for ${email}`);
  console.log(`[DEV] Verification URL: ${url}`);
  
  // In production, implement actual email sending
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: "noreply@yourapp.com",
  //   to: email,
  //   subject: "Verify your email",
  //   html: `<a href="${url}">Verify Email</a>`,
  // });
};

export const sendPasswordResetEmail = async (
  email: string,
  url: string
) => {
  console.log(`[DEV] Password reset email for ${email}`);
  console.log(`[DEV] Reset URL: ${url}`);
  
  // In production, implement actual email sending
};
```

### 4.7 Update Proxy for Session Check

Update `proxy.ts`:

```typescript
// proxy.ts
import { NextRequest, NextResponse } from "next/server";

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

const SESSION_COOKIE = "better-auth.session_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip static and API routes
  if (STATIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));
  
  // Redirect authenticated users away from auth pages
  if (hasSession && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Redirect unauthenticated users to sign-in (except public paths)
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

## 5) Auth Flows

### Sign Up Flow
1. User submits form with name, email, password
2. Client calls `signUp({ name, email, password })`
3. Better Auth creates user + account record
4. Session cookie is set
5. User is redirected to dashboard (or email verification if enabled)

### Sign In Flow
1. User submits form with email, password
2. Client calls `signIn({ email, password })`
3. Better Auth verifies credentials
4. Session cookie is set
5. User is redirected to dashboard

### Sign Out Flow
1. User clicks sign out
2. Client calls `signOut()`
3. Session cookie is cleared
4. User is redirected to sign-in page

### Password Reset Flow
1. User submits email on forgot-password page
2. Client calls `forgetPassword({ email })`
3. Better Auth creates reset token, sends email
4. User clicks link → `/reset-password?token=...`
5. User submits new password
6. Client calls `resetPassword({ token, newPassword })`
7. User redirected to sign-in

### Password Change Flow
1. Authenticated user submits current + new password
2. Client calls `changePassword({ currentPassword, newPassword })`
3. Password updated, user shown success message

### Email Verification Flow (Optional)
1. After sign-up, verification email sent
2. User clicks link → `/verify-email?token=...`
3. Token verified, `emailVerified` set to true
4. User redirected to dashboard

---

## 6) Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-1 | Better Auth server configured with Drizzle adapter | `auth.ts` exports working instance |
| AC-2 | Auth client configured and exported | Client methods usable in components |
| AC-3 | API route handler processes auth requests | `/api/auth/*` endpoints respond correctly |
| AC-4 | Session utilities work on server | `getSession()` returns session or null |
| AC-5 | Proxy checks session cookie | Unauthenticated redirects to sign-in |
| AC-6 | Sign up works | New user created in database |
| AC-7 | Sign in works | Session created, cookie set |
| AC-8 | Sign out works | Session cleared, redirect to sign-in |
| AC-9 | Password reset request works | Token created |
| AC-10 | Password reset completion works | Password updated |
| AC-11 | Password change works | Password updated with valid current password |
| AC-12 | Environment variables documented | `.env.example` has all auth vars |

---

## 7) File Checklist

### Must Create
- [ ] `lib/auth/auth.ts` — Better Auth server instance
- [ ] `lib/auth/auth-client.ts` — React auth client
- [ ] `lib/auth/session.ts` — Server session utilities
- [ ] `lib/auth/email.ts` — Email placeholder
- [ ] `app/api/auth/[...all]/route.ts` — Auth API handler

### Must Update
- [ ] `proxy.ts` — Add session cookie check
- [ ] `.env.example` — Add Better Auth variables (already done in P1-F2)
- [ ] `package.json` — Add better-auth dependency

---

## 8) Version-Sensitive Checklist

| Check | Requirement | Status |
|-------|-------------|--------|
| V-1 | Use `better-auth` package (current name) | ☐ |
| V-2 | Use `drizzleAdapter` with `provider: "pg"` | ☐ |
| V-3 | Use `toNextJsHandler` for Next.js route | ☐ |
| V-4 | Include `nextCookies()` plugin for App Router | ☐ |
| V-5 | Session cookie name: `better-auth.session_token` | ☐ |
| V-6 | Use App Router API routes (`app/api/`) | ☐ |
| V-7 | Import schema to adapter for relations | ☐ |

---

## 9) Dependencies

This feature requires:
- **P1-F1:** Project Initialization (complete)
- **P1-F2:** Neon + Drizzle Setup (must be complete)
- **P1-F3:** Schema Generation & Migration (must be complete)

This feature blocks:
- **P2-F1:** Auth Pages UI
- **P2-F2:** Dashboard
- **All authenticated features**

---

## 10) Testing Checklist

After implementation, test these flows:

### Manual Testing

```bash
# Start dev server
npm run dev

# Test API endpoints manually or with Postman/Insomnia
POST http://localhost:3000/api/auth/sign-up
POST http://localhost:3000/api/auth/sign-in
POST http://localhost:3000/api/auth/sign-out
POST http://localhost:3000/api/auth/forget-password
POST http://localhost:3000/api/auth/reset-password
```

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
# Install Better Auth
npm install better-auth

# Generate auth secret
openssl rand -base64 32

# Start dev server
npm run dev

# Test auth endpoints (with curl)
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

---

## 12) Notes

- Email verification is optional for MVP (set `requireEmailVerification: false`)
- In production, replace console logging with actual email service
- Session cookies are HTTP-only and secure in production
- Use `trustedOrigins` to prevent CSRF attacks
- Consider rate limiting for auth endpoints in production

---

*This feature configures authentication. Auth page UI (Phase 2) will provide the user-facing flows.*