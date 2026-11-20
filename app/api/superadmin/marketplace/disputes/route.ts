// app/api/superadmin/marketplace/disputes/route.ts
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

    const statusFilter = req.nextUrl.searchParams.get("status");

    const disputes = await prisma.bookingDispute.findMany({
      where: statusFilter ? { status: statusFilter as any } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        raisedBy: { select: { name: true, email: true, role: true } },
        resolvedBy: { select: { name: true } },
        booking: {
          select: {
            id: true, inquiryId: true, dayOfWeek: true, startTime: true, endTime: true, status: true,
            teacher: { select: { user: { select: { name: true } } } },
            parent: { select: { user: { select: { name: true } } } },
          },
        },
      },
    });

    return successResponse({ disputes });
  } catch (error) {
    console.error("List disputes error:", error);
    return serverErrorResponse();
  }
}
