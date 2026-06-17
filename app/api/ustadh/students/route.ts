// app/api/ustadh/students/route.ts
// GET -> list of students assigned to this Ustadh's batches
// Used by the Test recording page (and reusable elsewhere)
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "USTADH") return unauthorizedResponse();

    const ustadh = await prisma.ustadh.findUnique({ where: { userId: payload.userId } });
    if (!ustadh) return unauthorizedResponse("Ustadh profile not found");

    const students = await prisma.student.findMany({
      where: {
        status: "ACTIVE",
        batch:  { ustadhId: ustadh.id },
      },
      select: {
        id: true, name: true, enrollmentNumber: true, photo: true,
        progress: { select: { currentJuz: true, currentPage: true } },
        batch:    { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });

    return successResponse({ students });
  } catch (error) {
    console.error("Get ustadh students error:", error);
    return serverErrorResponse();
  }
}
