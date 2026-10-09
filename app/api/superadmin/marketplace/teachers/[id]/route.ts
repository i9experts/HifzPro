// app/api/superadmin/marketplace/teachers/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";

const updateSchema = z.object({
  verificationTier: z.enum(["UNVERIFIED", "ID_VERIFIED", "CREDENTIAL_VERIFIED", "BACKGROUND_CHECKED"]).optional(),
  isActive:          z.boolean().optional(),
  isListed:          z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") return unauthorizedResponse();

    const { id } = await params;
    const existing = await prisma.teacherProfile.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Teacher not found");

    const body = await req.json();
    const result = updateSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const teacher = await prisma.teacherProfile.update({ where: { id }, data: result.data });
    return successResponse({ teacher });
  } catch (error) {
    console.error("Admin update teacher error:", error);
    return serverErrorResponse();
  }
}
