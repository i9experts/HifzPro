// app/api/superadmin/marketplace/verification-requests/route.ts
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

    const requests = await prisma.teacherProfile.findMany({
      where: { verificationStatus: { not: "NONE" } },
      orderBy: { verificationRequestedAt: "desc" },
      select: {
        id: true, verificationTier: true, verificationDocumentUrl: true,
        verificationRequestedTier: true, verificationStatus: true,
        verificationRequestedAt: true, verificationRejectionReason: true,
        user: { select: { name: true, email: true } },
      },
    });

    return successResponse({ requests });
  } catch (error) {
    console.error("List verification requests error:", error);
    return serverErrorResponse();
  }
}
