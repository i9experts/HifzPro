// app/api/superadmin/marketplace/teachers/route.ts
// SUPER_ADMIN oversight of marketplace teacher profiles — trust &
// safety moderation (verification tier, suspend, unlist). Marketplace
// users have no institutionId, so this is platform-wide by nature
// (same SUPER_ADMIN check as /api/superadmin/dashboard).
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

    const teachers = await prisma.teacherProfile.findMany({
      select: {
        id: true, gender: true, residenceCountry: true, qiraat: true, yearsExperience: true,
        verificationTier: true, isListed: true, isActive: true, avgRating: true, totalReviews: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ teachers });
  } catch (error) {
    console.error("Admin list teachers error:", error);
    return serverErrorResponse();
  }
}
