// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "hifzpro_token";

function decodeJWT(token: string): any {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// ── Which roles are allowed under which dashboard prefix ──
// Order matters: more specific prefixes first.
const ROLE_ROUTES: { prefix: string; roles: string[] }[] = [
  { prefix: "/dashboard/admin",   roles: ["CAMPUS_ADMIN", "SUPER_ADMIN"] },
  { prefix: "/dashboard/ustadh",  roles: ["USTADH", "SUPER_ADMIN"] },
  { prefix: "/dashboard/parent",  roles: ["PARENT", "SUPER_ADMIN"] },
  { prefix: "/superadmin",        roles: ["SUPER_ADMIN"] },
];

// Where to send each role when they hit a section they're not allowed in
function homeFor(role: string): string {
  if (role === "SUPER_ADMIN") return "/superadmin";
  if (role === "PARENT")      return "/dashboard/parent";
  if (role === "USTADH")      return "/dashboard/ustadh";
  return "/dashboard/admin"; // CAMPUS_ADMIN and fallback
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  // ── Protect dashboard, superadmin, and billing routes ──
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/superadmin")
  ) {
    if (!token) {
      const url = new URL("/signin", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    const payload = decodeJWT(token);
    if (!payload || !payload.role) {
      const url = new URL("/signin", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    // ── Role-based section check ──
    // Find the most specific matching route rule for this path
    const rule = ROLE_ROUTES.find(r => pathname.startsWith(r.prefix));
    if (rule && !rule.roles.includes(payload.role)) {
      // Logged in, but wrong role for this section — send them home
      return NextResponse.redirect(new URL(homeFor(payload.role), req.url));
    }

    // /billing is open to any authenticated role (no rule above matches it)
    return NextResponse.next();
  }

  // ── Redirect already-logged-in users away from auth pages ──
  if (pathname === "/signin" || pathname === "/get-started") {
    if (token) {
      const payload = decodeJWT(token);
      if (payload?.role) {
        return NextResponse.redirect(new URL(homeFor(payload.role), req.url));
      }
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/billing/:path*",
    "/superadmin/:path*",
    "/signin",
    "/get-started",
  ],
};
