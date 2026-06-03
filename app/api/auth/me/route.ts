// app/api/auth/me/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();

    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse("Session expired. Please sign in again.");

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id:          true,
        name:        true,
        nameArabic:  true,
        email:       true,
        phone:       true,
        role:        true,
        avatar:      true,
        isActive:    true,
        institution: { select: { id: true, name: true, slug: true, logo: true } },
        campus:      { select: { id: true, name: true } },
        ustadh:      { select: { id: true, qualification: true } },
      },
    });

    if (!user || !user.isActive) return unauthorizedResponse();

    return successResponse({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return serverErrorResponse();
  }
}
