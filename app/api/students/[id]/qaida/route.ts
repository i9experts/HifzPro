// app/api/students/[id]/qaida/route.ts
// 16-Takhti Noorani Qaida tracker — progress summary + per-takhti status
// for one student. Content (letters/words per Takhti) is static and lives
// in lib/qaida-16takhti.ts; this route only returns the dynamic progress.
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api";
import { canAccessCampus } from "@/lib/tenant-guard";
import { TOTAL_TAKHTIS } from "@/lib/qaida-16takhti";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();
    if (!["USTADH", "CAMPUS_ADMIN", "SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { id: studentId } = await params;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        campus: { select: { institutionId: true } },
        batch:  { select: { name: true, ustadh: { select: { userId: true } } } },
      },
    });
    if (!student) return notFoundResponse("Student not found");

    const isOwningUstadh = payload.role === "USTADH" && student.batch?.ustadh?.userId === payload.userId;
    const isScopedAdmin  = ["CAMPUS_ADMIN", "SUPER_ADMIN"].includes(payload.role)
      && canAccessCampus(payload, student.campusId, student.campus?.institutionId);
    if (!isOwningUstadh && !isScopedAdmin) return notFoundResponse("Student not found");

    const progressRows = await prisma.qaidaTakhtiProgress.findMany({
      where: { studentId },
      include: { attempts: { orderBy: { attemptDate: "desc" }, take: 1 } },
      orderBy: { takhtiNumber: "asc" },
    });
    const byTakhti = new Map(progressRows.map(p => [p.takhtiNumber, p]));

    const takhtiProgress = Array.from({ length: TOTAL_TAKHTIS }, (_, i) => {
      const n = i + 1;
      const row = byTakhti.get(n);
      return {
        takhtiNumber: n,
        status: row?.status ?? "NOT_STARTED",
        startedAt: row?.startedAt ?? null,
        masteredAt: row?.masteredAt ?? null,
        lastAttempt: row?.attempts[0]
          ? {
              rating: row.attempts[0].rating,
              makhrajAccuracy: row.attempts[0].makhrajAccuracy,
              tajweedAccuracy: row.attempts[0].tajweedAccuracy,
              fluency: row.attempts[0].fluency,
              attemptDate: row.attempts[0].attemptDate,
            }
          : null,
      };
    });

    const masteredCount = takhtiProgress.filter(t => t.status === "MASTERED").length;
    const needsRevisionCount = takhtiProgress.filter(t => t.status === "NEEDS_REVISION").length;
    const currentTakhti = takhtiProgress.find(t => t.status !== "MASTERED")?.takhtiNumber ?? TOTAL_TAKHTIS;
    const anyStarted = takhtiProgress.some(t => t.status !== "NOT_STARTED");
    const overallStatus = masteredCount === TOTAL_TAKHTIS ? "COMPLETED" : anyStarted ? "IN_PROGRESS" : "NOT_STARTED";

    return successResponse({
      student: { id: student.id, name: student.name, program: student.program, batchName: student.batch?.name ?? null },
      summary: { masteredCount, totalTakhtis: TOTAL_TAKHTIS, currentTakhti, needsRevisionCount, overallStatus },
      takhtiProgress,
    });
  } catch (error) {
    console.error("Qaida progress error:", error);
    return serverErrorResponse();
  }
}
