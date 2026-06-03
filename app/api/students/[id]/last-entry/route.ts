// app/api/students/[id]/last-entry/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { id: studentId } = await params;

    // Get student with last entry and progress
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        progress: true,
        manzilHealth: {
          orderBy: { calculatedAt: "desc" },
          take: 1,
        },
        lessonEntries: {
          orderBy: { date: "desc" },
          take: 3,
          include: {
            mistakes: true,
          },
        },
        guardians: {
          where: { receiveUpdates: true },
          take: 1,
          select: { name: true, phone: true, whatsapp: true },
        },
      },
    });

    if (!student) {
      return successResponse({ student: null, lastEntry: null });
    }

    const lastEntry = student.lessonEntries[0] || null;

    return successResponse({
      student: {
        id:          student.id,
        name:        student.name,
        program:     student.program,
        progress:    student.progress,
        manzilHealth: student.manzilHealth[0]?.score ?? null,
        guardian:    student.guardians[0] ?? null,
      },
      lastEntry,
      recentEntries: student.lessonEntries,
    });
  } catch (error) {
    console.error("Last entry error:", error);
    return serverErrorResponse();
  }
}
