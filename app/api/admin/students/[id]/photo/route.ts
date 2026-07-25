// app/api/admin/students/[id]/photo/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, errorResponse, notFoundResponse, serverErrorResponse } from "@/lib/api";
import { canAccessCampus } from "@/lib/tenant-guard";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { id }     = await params;
    const { photoUrl, documents } = await req.json();

    // ── TENANT ISOLATION ──
    const existing = await prisma.student.findUnique({
      where: { id },
      select: { campusId: true, campus: { select: { institutionId: true } } },
    });
    if (!existing) return notFoundResponse("Student not found");
    if (!canAccessCampus(payload, existing.campusId, existing.campus?.institutionId)) {
      return notFoundResponse("Student not found");
    }

    const updateData: any = {};
    if (photoUrl   !== undefined) updateData.photo     = photoUrl;

    const student = await prisma.student.update({
      where: { id },
      data:  updateData,
    });

    return successResponse({ student: { id: student.id, photo: student.photo } });
  } catch (error) {
    console.error("Update photo error:", error);
    return serverErrorResponse();
  }
}
