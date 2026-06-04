// app/api/lesson-entries/route.ts
// Auto-sends WhatsApp Sabaq summary to parent after each entry

import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import { sendWhatsApp } from "@/lib/whatsapp";
import { dailySabaqMessage } from "@/lib/whatsapp-templates";

const schema = z.object({
  studentId:    z.string(),
  lessonType:   z.enum(["SABAQ","SABQI","MANZIL","GIRDAAN"]),
  date:         z.string().optional(),
  juzFrom:      z.number().optional(), surahFrom:  z.number().optional(),
  ayahFrom:     z.number().optional(), pageFrom:   z.number().optional(),
  juzTo:        z.number().optional(), surahTo:    z.number().optional(),
  ayahTo:       z.number().optional(), pageTo:     z.number().optional(),
  grade:        z.enum(["EXCELLENT","GOOD","WEAK","REPEAT"]).optional(),
  durationMins: z.number().optional(),
  mistakeCount: z.number().min(0).default(0),
  notes:        z.string().optional(),
  mistakes:     z.array(z.object({
    mistakeType:  z.enum(["ATAK","TAJWEED","LAHN_JALI","LAHN_KHAFI"]),
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

    const body   = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;

    const ustadh = await prisma.ustadh.findUnique({ where: { userId: payload.userId } });
    if (!ustadh) return unauthorizedResponse("Ustadh profile not found");

    // Create entry
    const entry = await prisma.lessonEntry.create({
      data: {
        studentId: data.studentId, ustadhId: ustadh.id,
        lessonType: data.lessonType,
        date:       data.date ? new Date(data.date) : new Date(),
        juzFrom: data.juzFrom, surahFrom: data.surahFrom, ayahFrom: data.ayahFrom, pageFrom: data.pageFrom,
        juzTo:   data.juzTo,   surahTo:   data.surahTo,   ayahTo:   data.ayahTo,   pageTo:   data.pageTo,
        grade: data.grade, durationMins: data.durationMins,
        mistakeCount: data.mistakeCount, notes: data.notes,
        mistakes: data.mistakes ? {
          create: data.mistakes.map(m => ({
            mistakeType: m.mistakeType, surah: m.surah, ayah: m.ayah, description: m.description,
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
          currentJuz: data.juzTo, currentSurah: data.surahTo, currentAyah: data.ayahTo,
          currentPage: data.pageTo, totalJuzMemorized: Math.max(0, data.juzTo - 1),
          percentComplete: Math.round(((data.juzTo - 1) / 30) * 100), updatedAt: new Date(),
        },
        create: {
          studentId: data.studentId, currentJuz: data.juzTo,
          currentSurah: data.surahTo, currentAyah: data.ayahTo, currentPage: data.pageTo,
          totalJuzMemorized: Math.max(0, data.juzTo - 1),
          percentComplete: Math.round(((data.juzTo - 1) / 30) * 100),
        },
      });
    }

    // Update Manzil health
    const gradeScores: Record<string,number> = { EXCELLENT:95, GOOD:80, WEAK:55, REPEAT:30 };
    const newScore = data.grade ? (gradeScores[data.grade] || 70) : 70;
    const recent   = await prisma.lessonEntry.findMany({
      where: { studentId: data.studentId, lessonType: "MANZIL" },
      orderBy: { date: "desc" }, take: 10, select: { grade: true },
    });
    const scores = recent.filter(e=>e.grade).map(e=>gradeScores[e.grade!]||70);
    scores.push(newScore);
    const healthScore = Math.round(scores.reduce((a,b)=>a+b,0) / scores.length * 10) / 10;
    await prisma.manzilHealth.create({ data: { studentId: data.studentId, score: healthScore } });

    // ── Auto-send WhatsApp to parent ──
    try {
      await sendSabaqWhatsApp(data.studentId, data, healthScore, payload.name);
    } catch (waError) {
      console.error("WhatsApp send error (non-blocking):", waError);
    }

    return successResponse({ entry }, 201);
  } catch (error) {
    console.error("Create lesson entry error:", error);
    return serverErrorResponse();
  }
}

async function sendSabaqWhatsApp(
  studentId: string,
  data:      any,
  healthScore: number,
  ustadhName: string
) {
  // Get student, guardian, institution
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      guardians:   { where: { receiveUpdates: true }, take: 3 },
      campus:      { include: { institution: true } },
    },
  });

  if (!student || student.guardians.length === 0) return;

  // Build sabaq/sabqi/manzil from the entry
  const sabaqData = data.lessonType === "SABAQ" && data.juzFrom ? {
    juz:      data.juzFrom, pageFrom: data.pageFrom || 0,
    pageTo:   data.pageTo   || 0, grade: data.grade || "GOOD",
    mistakes: data.mistakeCount || 0,
  } : undefined;

  const sabqiData = data.lessonType === "SABQI" && data.juzFrom ? {
    juz: data.juzFrom, pageFrom: data.pageFrom || 0,
    pageTo: data.pageTo || 0, grade: data.grade || "GOOD",
  } : undefined;

  const manzilData = data.lessonType === "MANZIL" && data.juzFrom ? {
    juzFrom: data.juzFrom, juzTo: data.juzTo || data.juzFrom,
    grade: data.grade || "GOOD",
  } : undefined;

  const message = dailySabaqMessage({
    studentName:   student.name,
    instituteName: student.campus?.institution?.name || "HifzPro Institute",
    ustadhName,
    date:          new Date(),
    sabaq:         sabaqData,
    sabqi:         sabqiData,
    manzil:        manzilData,
    manzilHealth:  healthScore,
    notes:         data.notes,
    lang:          "ur",
  });

  // Send to all guardians who opted in
  for (const guardian of student.guardians) {
    const phone = guardian.whatsapp || guardian.phone;
    if (!phone) continue;

    const result = await sendWhatsApp(phone, message);

    // Log
    await prisma.notification.create({
      data: {
        recipientId: phone,
        channel:     "WHATSAPP",
        type:        "sabaq",
        body:        message,
        status:      result.success ? "SENT" : "FAILED",
        sentAt:      result.success ? new Date() : null,
        error:       result.error || null,
        metadata:    { studentId, lessonType: data.lessonType },
      },
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const limit     = parseInt(searchParams.get("limit") || "20");

    const entries = await prisma.lessonEntry.findMany({
      where:   studentId ? { studentId } : undefined,
      orderBy: { date: "desc" },
      take:    limit,
      include: { student: { select: { name: true } }, mistakes: true },
    });

    return successResponse({ entries });
  } catch (error) {
    console.error("Get entries error:", error);
    return serverErrorResponse();
  }
}
