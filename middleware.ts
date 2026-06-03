// middleware.ts
// Protects dashboard routes — redirects to /signin if not authenticated

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard"];

// Routes only accessible when NOT logged in
const AUTH_ROUTES = ["/signin", "/get-started"];

// Role-based route access
const ROLE_ROUTES: Record<string, string[]> = {
  SUPER_ADMIN:  ["/dashboard/super-admin", "/dashboard/admin", "/dashboard"],
  CAMPUS_ADMIN: ["/dashboard/admin", "/dashboard"],
  USTADH:       ["/dashboard/ustadh", "/dashboard"],
  PARENT:       ["/dashboard/parent", "/dashboard"],
  EXAMINER:     ["/dashboard/examiner", "/dashboard"],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = getTokenFromRequest(req);
  const user = token ? verifyToken(token) : null;

  // Redirect logged-in users away from auth pages
  if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    if (user) {
      const redirectUrl = getDashboardUrl(user.role);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!user) {
      const signInUrl = new URL("/signin", req.url);
      signInUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check role-based access
    const allowedRoutes = ROLE_ROUTES[user.role] || [];
    const hasAccess = allowedRoutes.some(route => pathname.startsWith(route)) ||
                      pathname === "/dashboard";

    if (!hasAccess) {
      return NextResponse.redirect(new URL(getDashboardUrl(user.role), req.url));
    }
  }

  return NextResponse.next();
}

function getDashboardUrl(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":  return "/dashboard/super-admin";
    case "CAMPUS_ADMIN": return "/dashboard/admin";
    case "USTADH":       return "/dashboard/ustadh";
    case "PARENT":       return "/dashboard/parent";
    case "EXAMINER":     return "/dashboard/examiner";
    default:             return "/dashboard";
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/signin",
    "/get-started",
  ],
};
