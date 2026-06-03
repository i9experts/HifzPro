// middleware.ts
// Edge-compatible middleware — checks cookie existence
// Full JWT verification happens in API routes (Node.js runtime)

import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "hifzpro_token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  // ── Protect dashboard routes ──
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const url = new URL("/signin", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Redirect logged-in users away from signin ──
  if (pathname === "/signin" || pathname === "/get-started") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/signin",
    "/get-started",
  ],
};
