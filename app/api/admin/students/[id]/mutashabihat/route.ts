// app/api/students/[id]/mutashabihat/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

const recordSchema = z.object({
  pairId:            z.string().optional(),
  correctSurah:      z.number(),
  correctAyah:       z.number(),
  correctJuz:        z.number(),
  correctText:       z.string().optional(),
  confusedWithSurah: z.number(),
  confusedWithAyah:  z.number(),
  confusedWithJuz:   z.number(),
  confusedText:      z.string().optional(),
  lessonEntryId:     z.string().optional(),
  notes:             z.string().optional(),
});

// ── Priority scoring algorithm ──
function calculatePriority(confusionCount: number, daysSinceLast: number, isResolved: boolean): number {
  if (isResolved) return 0;
  const frequencyScore = Math.min(50, confusionCount * 10);
  const recencyScore   = Math.max(0, 50 - (daysSinceLast * 2));
  return Math.round(frequencyScore + recencyScore);
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { id: studentId } = await params;

    const confusions = await prisma.studentMutashabihat.findMany({
      where:   { studentId },
      orderBy: [{ isResolved: "asc" }, { priority: "desc" }, { lastConfusedAt: "desc" }],
    });

    // Get student's current Juz to calculate upcoming Manzil alerts
    const student = await prisma.student.findUnique({
      where:  { id: studentId },
      select: { progress: { select: { currentJuz: true } } },
    });

    const currentJuz = student?.progress?.currentJuz || 1;

    // Manzil alerts: confusions involving Juz that student will soon recite
    const upcomingJuz = [currentJuz, ...Array.from({length:3}, (_,i) => ((currentJuz + i) % 30) + 1)];
    const manzilAlerts = confusions.filter(c =>
      !c.isResolved &&
      (upcomingJuz.includes(c.correctJuz) || upcomingJuz.includes(c.confusedWithJuz))
    );

    const stats = {
      total:          confusions.length,
      unresolved:     confusions.filter(c => !c.isResolved).length,
      resolved:       confusions.filter(c => c.isResolved).length,
      critical:       confusions.filter(c => !c.isResolved && c.priority >= 70).length,
      manzilAlerts:   manzilAlerts.length,
      resolutionRate: confusions.length > 0
        ? Math.round((confusions.filter(c=>c.isResolved).length / confusions.length) * 100)
        : 0,
    };

    // Group by Juz for visual map
    const juzMap: Record<number, typeof confusions> = {};
    confusions.forEach(c => {
      if (!juzMap[c.correctJuz]) juzMap[c.correctJuz] = [];
      juzMap[c.correctJuz].push(c);
    });

    return successResponse({ confusions, stats, manzilAlerts, juzMap });
  } catch (error) {
    console.error("Get student mutashabihat error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN","USTADH"].includes(payload.role)) return unauthorizedResponse();

    const { id: studentId } = await params;
    const body   = await req.json();
    const result = recordSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;

    // Check if this exact confusion already exists for this student
    const existing = await prisma.studentMutashabihat.findFirst({
      where: {
        studentId,
        correctSurah:      data.correctSurah,
        correctAyah:       data.correctAyah,
        confusedWithSurah: data.confusedWithSurah,
        confusedWithAyah:  data.confusedWithAyah,
      },
    });

    if (existing) {
      // Increment confusion count and update priority
      const newCount    = existing.confusionCount + 1;
      const daysSinceLast = 0;
      const newPriority = calculatePriority(newCount, daysSinceLast, false);

      const updated = await prisma.studentMutashabihat.update({
        where: { id: existing.id },
        data: {
          confusionCount: newCount,
          lastConfusedAt: new Date(),
          isResolved:     false,
          resolvedAt:     null,
          priority:       newPriority,
          notes: data.notes || existing.notes,
        },
      });
      return successResponse({ confusion: updated, isRepeat: true, newCount });
    }

    // New confusion
    const priority = calculatePriority(1, 0, false);
    const confusion = await prisma.studentMutashabihat.create({
      data: {
        studentId,
        pairId:            data.pairId || null,
        correctSurah:      data.correctSurah,
        correctAyah:       data.correctAyah,
        correctJuz:        data.correctJuz,
        correctText:       data.correctText || null,
        confusedWithSurah: data.confusedWithSurah,
        confusedWithAyah:  data.confusedWithAyah,
        confusedWithJuz:   data.confusedWithJuz,
        confusedText:      data.confusedText || null,
        lessonEntryId:     data.lessonEntryId || null,
        notes:             data.notes || null,
        priority,
        confusionCount:    1,
        isResolved:        false,
      },
    });

    return successResponse({ confusion, isRepeat: false, newCount: 1 }, 201);
  } catch (error) {
    console.error("Record confusion error:", error);
    return serverErrorResponse();
  }
}

// ── PATCH — resolve/unresolve a confusion ──
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { id: studentId } = await params;
    const { confusionId, resolve } = await req.json();
    if (!confusionId) return errorResponse("confusionId required");

    const updated = await prisma.studentMutashabihat.update({
      where: { id: confusionId, studentId },
      data: {
        isResolved: resolve,
        resolvedAt: resolve ? new Date() : null,
        priority:   resolve ? 0 : undefined,
      },
    });

    return successResponse({ confusion: updated });
  } catch (error) {
    console.error("Resolve confusion error:", error);
    return serverErrorResponse();
  }
}
