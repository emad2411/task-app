# Feature Specification: P4-F1c — Rate Limiting Infrastructure

**Phase:** 4 — Hardening  
**Feature ID:** P4-F1c  
**Feature Name:** Rate Limiting Infrastructure  
**Status:** Draft — Ready for Implementation  
**Date:** 2026-05-03  
**Estimated Effort:** 2–3 hours  
**Dependencies:** `@upstash/ratelimit`, `@upstash/redis` (new npm packages), Upstash Redis account  
**Prerequisites:** P4-F1a (proxy.ts changes) and P4-F1b (auth action changes) should be completed first  
**Branch:** `feature/P4-F1c-rate-limiting`

---

## 1. Overview

This feature implements a **three-layer rate limiting strategy** to protect TaskFlow from brute-force attacks, credential stuffing, and email bombing.

| Layer | What It Protects | Tool | Limit |
|-------|-----------------|------|-------|
| 1 | Better Auth `/api/auth/*` endpoints | Better Auth built-in | 100 req/60s per IP |
| 2 | All application routes via `proxy.ts` | Upstash Redis | General: 30 req/10s, Auth API: 5 req/60s |
| 3 | Forgot password per-email cooldown | Upstash Redis | 3 req/hour per email |

### Critical Architecture Note: STATIC_PATHS Conflict

> **⚠️ GAP FOUND:** The current `proxy.ts` has `/api` in `STATIC_PATHS`, which means `proxy()` returns `NextResponse.next()` immediately for ALL `/api/*` routes — **including `/api/auth/*`**. This means Layer 2 rate limiting in proxy.ts will NOT apply to auth API routes.
>
> **Solution:** Remove `/api` from `STATIC_PATHS` and instead add `/api/auth` to the routes that get rate-limited. Other API routes (if any exist in the future) can be handled individually. Alternatively, keep `/api` in static paths but rely solely on Better Auth's built-in rate limiting (Layer 1) for auth endpoints.
>
> **This spec uses the approach of removing `/api` from STATIC_PATHS** and handling API routes within the rate limiting logic, since Better Auth's built-in rate limiter alone may not be sufficient for production.

---

## 2. Prerequisites

1. P4-F1a completed (proxy.ts AUTH_PATHS already updated)
2. P4-F1b completed (auth actions already sanitized)
3. An **Upstash Redis** account (free tier available at [upstash.com](https://upstash.com))
4. `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from your Upstash dashboard

---

## 3. Implementation Steps

### Step 1: Install Dependencies

```bash
npm install @upstash/ratelimit @upstash/redis
```

### Step 2: Update `.env.example`

**File:** `.env.example` ← **MODIFY**

Add after the existing variables:

```diff
 # Seed Script
 SEED_USER_ID=
+
+# Upstash Redis (Rate Limiting)
+# Get these from https://console.upstash.com — create a free Redis database
+UPSTASH_REDIS_REST_URL=
+UPSTASH_REDIS_REST_TOKEN=
```

### Step 3: Create Rate Limiter Utility

**File:** `lib/rate-limit.ts` ← **NEW FILE**

```ts
/**
 * Rate limiting configuration using Upstash Redis.
 *
 * Three limiters are exported:
 * - `generalLimiter` — for all non-static routes (30 req per 10s per IP)
 * - `authLimiter` — stricter limit for auth API routes (5 req per 60s per IP)
 * - `forgotPasswordLimiter` — per-email cooldown (3 req per hour per email)
 *
 * If Upstash credentials are missing (e.g., local development), all limiters
 * are replaced with pass-through no-ops that always allow requests.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/** Shape of a rate limit check result */
interface RateLimitResult {
  success: boolean;
  limit: number;
  reset: number;
  remaining: number;
}

/** Interface matching the subset of Ratelimit we use */
interface RateLimiter {
  limit: (identifier: string) => Promise<RateLimitResult>;
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

/** Pass-through limiter that always allows requests (used when Redis is not configured) */
const noopLimiter: RateLimiter = {
  limit: async () => ({ success: true, limit: 0, reset: 0, remaining: 0 }),
};

/**
 * Creates rate limiters if Upstash credentials are available,
 * otherwise returns no-op limiters for local development.
 */
function createLimiters(): {
  generalLimiter: RateLimiter;
  authLimiter: RateLimiter;
  forgotPasswordLimiter: RateLimiter;
} {
  if (!redisUrl || !redisToken) {
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. " +
      "Rate limiting is DISABLED. Set these env vars for production."
    );
    return {
      generalLimiter: noopLimiter,
      authLimiter: noopLimiter,
      forgotPasswordLimiter: noopLimiter,
    };
  }

  const redis = new Redis({ url: redisUrl, token: redisToken });

  return {
    /** General rate limiter: 30 requests per 10 seconds per IP */
    generalLimiter: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "10 s"),
      analytics: false,
      prefix: "rl:general",
    }),

    /** Auth API rate limiter: 5 requests per 60 seconds per IP (stricter) */
    authLimiter: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: false,
      prefix: "rl:auth",
    }),

    /** Forgot password per-email limiter: 3 requests per hour per email */
    forgotPasswordLimiter: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      analytics: false,
      prefix: "rl:forgot-pw",
    }),
  };
}

const limiters = createLimiters();

export const generalLimiter = limiters.generalLimiter;
export const authLimiter = limiters.authLimiter;
export const forgotPasswordLimiter = limiters.forgotPasswordLimiter;
```

**Key design decisions:**
- **`prefix`** — Each limiter has a unique Redis key prefix to avoid collisions
- **`analytics: false`** — Disables Upstash analytics to reduce overhead
- **`slidingWindow`** — More accurate than fixed windows; prevents burst-at-boundary attacks
- **No-op fallback** — Local dev works without Redis; a warning is logged once at startup

---

### Step 4: Enable Better Auth Built-in Rate Limiting

**File:** `lib/auth/auth.ts` ← **MODIFY**

Add the `rateLimit` configuration to the `betterAuth()` call:

```diff
 export const auth = betterAuth({
   database: drizzleAdapter(db, {
     // ... existing config
   }),
   emailAndPassword: {
     // ... existing config
   },
+  rateLimit: {
+    enabled: true,
+    window: 60,          // 60-second sliding window
+    max: 100,            // max 100 requests per window per IP
+    storage: "database", // persists across serverless cold starts
+  },
   emailVerification: {
     // ... existing config
   },
```

Insert the `rateLimit` block **after `emailAndPassword`** and **before `emailVerification`**.

**What this does:** Better Auth will automatically reject requests to `/api/auth/*` with HTTP 429 when an IP exceeds 100 requests in 60 seconds. This is Layer 1 — a broad safety net. Layer 2 (Upstash in proxy.ts) provides stricter, more granular control.

---

### Step 5: Integrate Upstash Rate Limiting into proxy.ts

**File:** `proxy.ts` ← **MODIFY**

This is the most complex change. We need to:
1. Make the `proxy` function `async`
2. Remove `/api` from `STATIC_PATHS` (so auth API routes get rate-limited)
3. Add rate limiting logic before the session check
4. Skip rate limiting for truly static assets only

**Full replacement of `proxy.ts`:**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { generalLimiter, authLimiter } from "@/lib/rate-limit";

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
  "/reset-password",
  "/verify-email",
];

/** Paths that skip ALL proxy logic (no rate limiting, no auth checks) */
const STATIC_PATHS = [
  "/_next",
  "/favicon.ico",
  "/icons",
  "/images",
  "/fonts",
];

/**
 * Next.js 16 proxy function — handles rate limiting and route protection.
 *
 * Request flow:
 * 1. Skip static assets entirely
 * 2. Rate limit all other requests (stricter for /api/auth/*)
 * 3. Redirect authenticated users away from auth pages
 * 4. Redirect unauthenticated users away from protected pages
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets — no rate limiting, no auth check
  if (STATIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const isAuthApi = pathname.startsWith("/api/auth");
  const limiter = isAuthApi ? authLimiter : generalLimiter;
  const { success, limit, reset, remaining } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // 3. Skip auth checks for API routes (they handle their own auth)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 4. Session-based route protection (pages only)
  const sessionCookie = getSessionCookie(request);
  const hasSession = !!sessionCookie;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  if (hasSession && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!hasSession && !isPublicPath) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon|icons|images|fonts).*)"],
};
```

**Key changes explained:**
1. **`async function proxy`** — Required because `limiter.limit()` returns a Promise
2. **`/api` removed from `STATIC_PATHS`** — So `/api/auth/*` gets rate-limited by Layer 2
3. **IP extraction uses first value** — `x-forwarded-for` can contain comma-separated IPs; we take the first (client IP)
4. **`Retry-After` header** — Tells clients how long to wait (RFC 7231 standard)
5. **API routes pass through after rate limiting** — They handle their own auth via server actions
6. **Updated `config.matcher`** — Removed `api` from exclusions so API routes go through proxy

---

### Step 6: Add Per-Email Cooldown for Forgot Password

**File:** `lib/actions/auth.ts` ← **MODIFY**

Add the import:
```diff
 import { handleActionError } from "@/lib/utils/action-error";
+import { forgotPasswordLimiter } from "@/lib/rate-limit";
```

Update `forgotPasswordAction` to check the per-email rate limit BEFORE calling Better Auth:

**Before:**
```ts
export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  try {
    const validated = forgotPasswordSchema.parse(input);
    
    await auth.api.requestPasswordReset({
      body: {
        email: validated.email,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      },
    });

    return { 
      success: true, 
      data: { message: "If an account exists with this email, you will receive a password reset link" } 
    };
  } catch (error) {
    console.error("[forgotPasswordAction]", error);
    return { 
      success: true, 
      data: { message: "If an account exists with this email, you will receive a password reset link" } 
    };
  }
}
```

**After:**
```ts
export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  try {
    const validated = forgotPasswordSchema.parse(input);

    // Per-email rate limit — max 3 requests per hour per email address
    // Checked BEFORE calling Better Auth to prevent unnecessary email sends
    const { success: withinLimit } = await forgotPasswordLimiter.limit(validated.email);
    if (!withinLimit) {
      return {
        success: false,
        error: "Too many password reset requests. Please wait before trying again.",
      };
    }

    await auth.api.requestPasswordReset({
      body: {
        email: validated.email,
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      },
    });

    return { 
      success: true, 
      data: { message: "If an account exists with this email, you will receive a password reset link" } 
    };
  } catch (error) {
    // Log the error but still return success to prevent email enumeration
    console.error("[forgotPasswordAction]", error);
    return { 
      success: true, 
      data: { message: "If an account exists with this email, you will receive a password reset link" } 
    };
  }
}
```

**What changed:**
- Added `forgotPasswordLimiter.limit(validated.email)` — rate limits by email, not IP
- Returns a specific error when rate limited (this is fine — it doesn't reveal if the email exists)
- Checked BEFORE `auth.api.requestPasswordReset()` — prevents unnecessary Resend API calls

---

## 4. File Change Summary

### Files Created
| File | Purpose |
|------|---------|
| `lib/rate-limit.ts` | Upstash Redis rate limiter configuration with dev fallback |

### Files Modified
| File | What Changed |
|------|-------------|
| `lib/auth/auth.ts` | Added `rateLimit` config to `betterAuth()` |
| `proxy.ts` | Made async, removed `/api` from STATIC_PATHS, added rate limiting logic |
| `lib/actions/auth.ts` | Added per-email cooldown to `forgotPasswordAction` |
| `.env.example` | Added `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` |

### Dependencies Added
| Package | Purpose |
|---------|---------|
| `@upstash/ratelimit` | Rate limiting algorithms (sliding window) |
| `@upstash/redis` | Redis client for Upstash (REST-based, works in serverless) |

---

## 5. Acceptance Criteria

| Layer | Check | Status |
|-------|-------|--------|
| 1 | Better Auth `rateLimit` config present in `lib/auth/auth.ts` | ☐ |
| 1 | Auth endpoints return 429 when Better Auth rate limit exceeded | ☐ |
| 2 | `lib/rate-limit.ts` exports 3 limiters | ☐ |
| 2 | Dev mode: no crash when Upstash credentials missing | ☐ |
| 2 | Dev mode: warning logged to console | ☐ |
| 2 | `proxy.ts` is async | ☐ |
| 2 | `/api/auth/*` routes use stricter `authLimiter` | ☐ |
| 2 | All other routes use `generalLimiter` | ☐ |
| 2 | Rate-limited requests return 429 with JSON body | ☐ |
| 2 | 429 response includes `X-RateLimit-*` and `Retry-After` headers | ☐ |
| 2 | Static assets (`/_next`, `/favicon.ico`, etc.) skip rate limiting | ☐ |
| 3 | `forgotPasswordAction` checks per-email rate limit | ☐ |
| 3 | Rate limit checked BEFORE calling Better Auth API | ☐ |
| 3 | Returns specific error when rate limited | ☐ |
| 3 | Max 3 requests per email per hour | ☐ |
| — | `npm run build` passes | ☐ |
| — | `npm run lint` passes | ☐ |
| — | `npm run test` passes | ☐ |
| — | `.env.example` has Upstash variables | ☐ |

---

## 6. Implementation Order

| Step | Files | Time | What To Do |
|------|-------|------|-----------|
| 1 | Terminal | 2 min | `npm install @upstash/ratelimit @upstash/redis` |
| 2 | `.env.example` + `.env` | 5 min | Add Upstash env vars, set values from Upstash dashboard |
| 3 | `lib/rate-limit.ts` | 15 min | Create rate limiter utility with dev fallback |
| 4 | `lib/auth/auth.ts` | 5 min | Add `rateLimit` config block |
| 5 | `proxy.ts` | 20 min | Full rewrite with async + rate limiting |
| 6 | `lib/actions/auth.ts` | 10 min | Add per-email cooldown to `forgotPasswordAction` |
| 7 | Manual testing | 15 min | Test rate limiting in dev (with and without Upstash creds) |
| 8 | Build + lint + test | 5 min | `npm run build && npm run lint && npm run test` |

---

## 7. Testing Guide

### Testing WITHOUT Upstash (local dev)

1. Remove `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from `.env`
2. Start `npm run dev`
3. Check terminal — you should see: `[rate-limit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. Rate limiting is DISABLED.`
4. App should work normally — all requests pass through

### Testing WITH Upstash

1. Create a free Redis database at [console.upstash.com](https://console.upstash.com)
2. Copy the REST URL and token to your `.env`
3. Start `npm run dev`
4. Make rapid requests to `/api/auth/sign-in` — after 5 requests in 60 seconds, you should get a 429 response
5. Test forgot password — submit the same email 4 times — the 4th should be rejected

### Testing Better Auth rate limiting

1. Make 101 requests to any `/api/auth/*` endpoint within 60 seconds
2. The 101st should return 429 from Better Auth (separate from Upstash)

---

## 8. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Upstash Redis unavailable in production | **High** | Low | Upstash has 99.99% uptime SLA. If Redis is down, requests will fail with an unhandled error. Consider wrapping `limiter.limit()` in a try/catch that defaults to allowing the request. |
| Rate limiting causes false positives for legitimate users | **Medium** | Medium | Limits are generous (30 req/10s general, 5 req/60s auth). Adjust if users report issues. |
| `x-forwarded-for` header can be spoofed | **Medium** | Medium | In production, ensure your hosting provider (Vercel, etc.) sets this header correctly and strips client-provided values. |
| Making proxy async breaks Next.js | **None** | None | Next.js 16 fully supports async proxy functions. |
| `/api` removal from STATIC_PATHS adds latency to API routes | **Low** | Medium | API routes now go through rate limiting (one Redis call). Upstash REST API is ~1-5ms globally. Acceptable tradeoff for security. |

---

## 9. Related Documentation

- [Better Auth Rate Limiting](https://better-auth.com/docs/concepts/rate-limit)
- [Upstash Rate Limiting SDK](https://upstash.com/docs/redis/sdks/ts/ratelimit)
- [Upstash Redis REST SDK](https://upstash.com/docs/redis/sdks/ts/overview)
- **PRD.md** §17.2 — Better Auth configuration
- **PRD.md** §17.1 — `proxy.ts` conventions
