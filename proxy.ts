import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { generalLimiter, authLimiter } from "@/lib/rate-limit";

const PUBLIC_PATHS = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/terms",
  "/privacy",
  "/cookies",
  "/about",
  "/contact",
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
  if (
    STATIC_PATHS.some((path) => pathname.startsWith(path)) ||
    // Root-level public files (e.g. /og-image.png, /dashboard-screenshot.png)
    // served from the project's public/ directory.
    /^\/[^/]*\.[a-z0-9]+$/i.test(pathname)
  ) {
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
  // Fix: "/" should only match exact root, not all paths (which all start with "/")
  const isPublicPath = PUBLIC_PATHS.some((path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path)
  );
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
  matcher: ["/((?!_next|favicon|icons|images|fonts|.*\\.[a-z0-9]+$).*)"],
};
