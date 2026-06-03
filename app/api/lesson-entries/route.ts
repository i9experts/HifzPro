// app/api/lesson-entries/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

const lessonEntrySchema = z.object({
  studentId:    z.string(),
  lessonType:   z.enum(["SABAQ", "SABQI", "MANZIL", "GIRDAAN"]),
  date:         z.string().optional(),

  // Quran reference
  juzFrom:      z.number().min(1).max(30).optional(),
  surahFrom:    z.number().optional(),
  ayahFrom:     z.number().optional(),
  pageFrom:     z.number().optional(),
  juzTo:        z.number().min(1).max(30).optional(),
  surahTo:      z.number().optional(),
  ayahTo:       z.number().optional(),
  pageTo:       z.number().optional(),

  // Quality
  grade:        z.enum(["EXCELLENT", "GOOD", "WEAK", "REPEAT"]).optional(),
  durationMins: z.number().optional(),
  mistakeCount: z.number().min(0).default(0),
  notes:        z.string().optional(),

  // Mistakes detail
  mistakes: z.array(z.object({
    mistakeType:  z.enum(["ATAK", "TAJWEED", "LAHN_JALI", "LAHN_KHAFI"]),
    surah:        z.number().optional(),
    ayah:         z.number().optional(),
    description:  z.string().optional(),
  })).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "USTADH") return unauthorizedResponse("Only Asatidha can record lessons");

    const body = await req.json();
    const result = lessonEntrySchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const data = result.data;

    // Get ustadh record
    const ustadh = await prisma.ustadh.findUnique({
      where: { userId: payload.userId },
    });
    if (!ustadh) return unauthorizedResponse("Ustadh profile not found");

    // Create lesson entry with mistakes
    const entry = await prisma.lessonEntry.create({
      data: {
        studentId:    data.studentId,
        ustadhId:     ustadh.id,
        lessonType:   data.lessonType,
        date:         data.date ? new Date(data.date) : new Date(),
        juzFrom:      data.juzFrom,
        surahFrom:    data.surahFrom,
        ayahFrom:     data.ayahFrom,
        pageFrom:     data.pageFrom,
        juzTo:        data.juzTo,
        surahTo:      data.surahTo,
        ayahTo:       data.ayahTo,
        pageTo:       data.pageTo,
        grade:        data.grade,
        durationMins: data.durationMins,
        mistakeCount: data.mistakeCount,
        notes:        data.notes,
        mistakes: data.mistakes ? {
          create: data.mistakes.map(m => ({
            mistakeType:  m.mistakeType,
            surah:        m.surah,
            ayah:         m.ayah,
            description:  m.description,
          })),
        } : undefined,
      },
      include: { mistakes: true },
    });

    // Update student progress if SABAQ
    if (data.lessonType === "SABAQ" && data.juzTo && data.pageTo) {
      await prisma.studentProgress.upsert({
        where:  { studentId: data.studentId },
        update: {
          currentJuz:        data.juzTo,
          currentSurah:      data.surahTo,
          currentAyah:       data.ayahTo,
          currentPage:       data.pageTo,
          totalJuzMemorized: Math.max(0, data.juzTo - 1),
          percentComplete:   Math.round(((data.juzTo - 1) / 30) * 100),
          updatedAt:         new Date(),
        },
        create: {
          studentId:         data.studentId,
          currentJuz:        data.juzTo,
          currentSurah:      data.surahTo,
          currentAyah:       data.ayahTo,
          currentPage:       data.pageTo,
          totalJuzMemorized: Math.max(0, data.juzTo - 1),
          percentComplete:   Math.round(((data.juzTo - 1) / 30) * 100),
        },
      });
    }

    // Update Manzil health score (simplified calculation)
    await updateManzilHealth(data.studentId, data.grade);

    return successResponse({ entry }, 201);
  } catch (error) {
    console.error("Create lesson entry error:", error);
    return serverErrorResponse();
  }
}

async function updateManzilHealth(studentId: string, grade?: string) {
  const gradeScore: Record<string, number> = {
    EXCELLENT: 95, GOOD: 80, WEAK: 55, REPEAT: 30,
  };

  const score = grade ? gradeScore[grade] ?? 70 : 70;

  // Get last 10 entries to calculate rolling average
  const recent = await prisma.lessonEntry.findMany({
    where: { studentId, lessonType: "MANZIL" },
    orderBy: { date: "desc" },
    take: 10,
    select: { grade: true },
  });

  let healthScore = score;
  if (recent.length > 0) {
    const scores = recent
      .filter(e => e.grade)
      .map(e => gradeScore[e.grade!] ?? 70);
    scores.push(score);
    healthScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  await prisma.manzilHealth.create({
    data: {
      studentId,
      score: Math.round(healthScore * 10) / 10,
    },
  });
}

// GET — list lesson entries
export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const limit = parseInt(searchParams.get("limit") || "20");

    const entries = await prisma.lessonEntry.findMany({
      where: studentId ? { studentId } : undefined,
      orderBy: { date: "desc" },
      take: limit,
      include: {
        student: { select: { name: true } },
        mistakes: true,
      },
    });

    return successResponse({ entries });
  } catch (error) {
    console.error("Get entries error:", error);
    return serverErrorResponse();
  }
}
