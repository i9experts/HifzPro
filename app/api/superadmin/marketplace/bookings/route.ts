// app/api/superadmin/marketplace/bookings/route.ts
// All booking proposals, platform-wide — this is where the admin-
// assisted side of PRD §9 lives: an ACCEPTED booking needs a human to
// collect payment (Stripe link, or Rho wire as fallback) and then mark
// it PAYMENT_CONFIRMED.
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") return unauthorizedResponse();

    const status = req.nextUrl.searchParams.get("status");

    const bookings = await prisma.booking.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        teacher: { select: { user: { select: { name: true, email: true } } } },
        parent:  { select: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return successResponse({ bookings });
  } catch (error) {
    console.error("Admin list bookings error:", error);
    return serverErrorResponse();
  }
}
