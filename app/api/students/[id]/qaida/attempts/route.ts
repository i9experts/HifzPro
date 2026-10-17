// app/api/students/[id]/qaida/attempts/route.ts
// Record a Qaida attempt for one Takhti. Upserts the student's
// QaidaTakhtiProgress status from the Ustadh's rating, then logs the
// attempt (makhraj/tajweed/fluency scores) to history.
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";
import { canAccessCampus } from "@/lib/tenant-guard";
import { TOTAL_TAKHTIS } from "@/lib/qaida-16takhti";

const schema = z.object({
  takhtiNumber:    z.number().int().min(1).max(TOTAL_TAKHTIS),
  rating:          z.enum(["NEEDS_PRACTICE", "DEVELOPING", "PROFICIENT", "MASTERED"]),
  makhrajAccuracy: z.number().int().min(1).max(5),
  tajweedAccuracy: z.number().int().min(1).max(5),
  fluency:         z.number().int().min(1).max(5),
  notes:           z.string().max(1000).optional(),
  attemptDate:     z.string().datetime().optional(),
});

// A rating maps to the Takhti's overall status: a weak attempt flags it
// for revision even if earlier attempts had progressed further.
const STATUS_FOR_RATING: Record<string, "NEEDS_REVISION" | "IN_PROGRESS" | "MASTERED"> = {
  NEEDS_PRACTICE: "NEEDS_REVISION",
  DEVELOPING:     "IN_PROGRESS",
  PROFICIENT:     "IN_PROGRESS",
  MASTERED:       "MASTERED",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "USTADH") return unauthorizedResponse();

    const { id: studentId } = await params;
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { campus: { select: { institutionId: true } }, batch: { select: { ustadh: { select: { userId: true, id: true } } } } },
    });
    if (!student) return notFoundResponse("Student not found");
    if (student.batch?.ustadh?.userId !== payload.userId) return notFoundResponse("Student not found");

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;
    const ustadhId = student.batch!.ustadh!.id;
    const status = STATUS_FOR_RATING[data.rating];
    const now = new Date();

    const progress = await prisma.qaidaTakhtiProgress.upsert({
      where: { studentId_takhtiNumber: { studentId, takhtiNumber: data.takhtiNumber } },
      create: {
        studentId, takhtiNumber: data.takhtiNumber, status,
        startedAt: now, masteredAt: status === "MASTERED" ? now : null,
      },
      update: {
        status,
        masteredAt: status === "MASTERED" ? now : undefined,
      },
    });

    const attempt = await prisma.qaidaAttempt.create({
      data: {
        progressId: progress.id,
        studentId,
        ustadhId,
        takhtiNumber: data.takhtiNumber,
        rating: data.rating,
        makhrajAccuracy: data.makhrajAccuracy,
        tajweedAccuracy: data.tajweedAccuracy,
        fluency: data.fluency,
        notes: data.notes,
        attemptDate: data.attemptDate ? new Date(data.attemptDate) : now,
      },
    });

    return successResponse({ progress, attempt }, 201);
  } catch (error) {
    console.error("Record Qaida attempt error:", error);
    return serverErrorResponse();
  }
}
