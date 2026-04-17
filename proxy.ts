import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthenticated = request.cookies.get("session");
  const isPublicRoute = pathname.startsWith("/sign-in") || 
                      pathname.startsWith("/sign-up") || 
                      pathname.startsWith("/forgot-password") || 
                      pathname.startsWith("/reset-password") ||
                      pathname.startsWith("/design-system");

  if (isPublicRoute && isAuthenticated) {
    return Response.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicRoute && !pathname.startsWith("/api") && !isAuthenticated) {
    return Response.redirect(new URL("/sign-in", request.url));
  }

  return null;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};