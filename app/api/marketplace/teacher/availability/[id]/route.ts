// app/api/marketplace/teacher/availability/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "MARKETPLACE_TEACHER") return unauthorizedResponse();

    const { id } = await params;
    const slot = await prisma.teacherAvailabilitySlot.findUnique({
      where: { id },
      include: { teacher: { select: { userId: true } } },
    });
    if (!slot || slot.teacher.userId !== payload.userId) return notFoundResponse("Slot not found");

    await prisma.teacherAvailabilitySlot.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Availability DELETE error:", error);
    return serverErrorResponse();
  }
}
