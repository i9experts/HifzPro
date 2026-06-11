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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  // ── Protect dashboard and billing routes ──
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/billing")) {
    if (!token) {
      const url = new URL("/signin", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    const payload = decodeJWT(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    // All authenticated users pass through — subscription lockout
    // is handled client-side on the billing page (no internal fetch in Edge)
    return NextResponse.next();
  }

  // ── Redirect already-logged-in users away from auth pages ──
  if (pathname === "/signin" || pathname === "/get-started") {
    if (token) {
      const payload = decodeJWT(token);
      if (payload) {
        if (payload.role === "SUPER_ADMIN") {
          return NextResponse.redirect(new URL("/superadmin", req.url));
        }
        if (payload.role === "PARENT") {
          return NextResponse.redirect(new URL("/dashboard/parent", req.url));
        }
        return NextResponse.redirect(new URL("/dashboard/admin", req.url));
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
    "/signin",
    "/get-started",
  ],
};
