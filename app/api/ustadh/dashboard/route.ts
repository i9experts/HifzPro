// app/api/ustadh/dashboard/route.ts
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

    // Get ustadh record
    const ustadh = await prisma.ustadh.findUnique({
      where: { userId: payload.userId },
      include: {
        batches: {
          where: { isActive: true },
          include: {
            students: {
              where: { status: "ACTIVE" },
              include: {
                progress:     { select: { currentJuz: true, currentSurah: true, currentAyah: true, currentPage: true, percentComplete: true } },
                manzilHealth: { orderBy: { calculatedAt: "desc" }, take: 1 },
                lessonEntries: {
                  where: {
                    ustadhId: undefined,
                    date: {
                      gte: new Date(new Date().setHours(0,0,0,0)),
                      lte: new Date(new Date().setHours(23,59,59,999)),
                    },
                  },
                  orderBy: { date: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!ustadh) return unauthorizedResponse("Ustadh profile not found");

    // Fix: get today's entries for this ustadh
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd   = new Date(); todayEnd.setHours(23,59,59,999);

    const todayEntries = await prisma.lessonEntry.findMany({
      where: {
        ustadhId: ustadh.id,
        date: { gte: todayStart, lte: todayEnd },
      },
      select: { studentId: true, lessonType: true },
    });

    const recordedTodayIds = new Set(todayEntries.map(e => e.studentId));

    // Flatten students from all batches
    const students = ustadh.batches.flatMap(batch =>
      batch.students.map(student => ({
        id:              student.id,
        name:            student.name,
        program:         student.program,
        batchName:       batch.name,
        currentJuz:      student.progress?.currentJuz ?? 1,
        currentPage:     student.progress?.currentPage ?? 1,
        percentComplete: student.progress?.percentComplete ?? 0,
        manzilHealth:    student.manzilHealth[0]?.score ?? null,
        recordedToday:   recordedTodayIds.has(student.id),
      }))
    );

    const stats = {
      totalStudents:   students.length,
      recordedToday:   students.filter(s => s.recordedToday).length,
      pendingToday:    students.filter(s => !s.recordedToday).length,
      atRisk:          students.filter(s => s.manzilHealth !== null && s.manzilHealth < 60).length,
    };

    return successResponse({ stats, students, ustadhName: payload.name });
  } catch (error) {
    console.error("Ustadh dashboard error:", error);
    return serverErrorResponse();
  }
}
