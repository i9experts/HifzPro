// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "hifzpro_token";

// ── Lightweight JWT decode (Edge-compatible, no verification) ──
// Full verification happens in API routes (Node.js runtime)
function decodeJWT(token: string): any {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  // ── Protect all dashboard routes ──
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

    // Super admin bypasses all subscription checks
    if (payload.role === "SUPER_ADMIN") {
      return NextResponse.next();
    }

    // Billing page itself is always accessible (don't lock the upgrade page)
    if (pathname.startsWith("/billing")) {
      return NextResponse.next();
    }

    // Parent portal doesn't require a subscription check
    if (pathname.startsWith("/dashboard/parent")) {
      return NextResponse.next();
    }

    // ── Subscription check for admin/ustadh dashboard ──
    if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/dashboard/ustadh")) {
      const institutionId = payload.institutionId;
      if (!institutionId) return NextResponse.next();

      try {
        // Fetch subscription — use internal API to avoid Prisma in Edge
        const subRes = await fetch(
          new URL(`/api/billing/status`, req.url).toString(),
          {
            headers: { Cookie: `${COOKIE_NAME}=${token}` },
            cache: "no-store",
          }
        );

        if (!subRes.ok) return NextResponse.next(); // fail open — don't lock on API error

        const subData = await subRes.json();
        const sub = subData.data;

        if (!sub) return NextResponse.next(); // no subscription record — fail open

        const now           = new Date();
        const trialEndsAt   = sub.trialEndsAt   ? new Date(sub.trialEndsAt)   : null;
        const periodEnd     = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
        const status        = sub.status as string;

        // ── Allow conditions ──
        const trialValid    = status === "TRIAL" && trialEndsAt && trialEndsAt > now;
        const activeValid   = status === "ACTIVE" && periodEnd  && periodEnd  > now;
        const gracePeriod   = status === "PAST_DUE" && periodEnd && (() => {
          const grace = new Date(periodEnd);
          grace.setDate(grace.getDate() + 3);
          return grace > now;
        })();

        if (trialValid || activeValid || gracePeriod) {
          return NextResponse.next();
        }

        // ── Lockout ──
        let reason = "no_subscription";
        if (status === "TRIAL")     reason = "trial_expired";
        if (status === "PAST_DUE")  reason = "past_due";
        if (status === "CANCELLED") reason = "cancelled";
        if (status === "SUSPENDED") reason = "suspended";

        const lockUrl = new URL("/billing/locked", req.url);
        lockUrl.searchParams.set("reason", reason);
        return NextResponse.redirect(lockUrl);

      } catch {
        // On any error, fail open — don't accidentally lock users out
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  // ── Redirect logged-in users away from signin ──
  if (pathname === "/signin" || pathname === "/get-started") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
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
