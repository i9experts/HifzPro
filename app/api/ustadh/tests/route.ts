// app/api/ustadh/tests/route.ts
// POST -> Ustadh records a test result for their own student
// GET  -> Ustadh's own recorded tests (recent list)
// Auto-sends WhatsApp test result to parent — respects
// NotificationPreferences.sendOnTest toggle.

import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import { sendWhatsApp } from "@/lib/whatsapp";
import { testResultMessage } from "@/lib/whatsapp-templates";

const schema = z.object({
  studentId:    z.string(),
  testType:     z.enum(["SABAQ_TEST","SABQI_TEST","PARA_TEST","NUSS_TEST","TARTEEB_TEST","FULL_QURAN_TEST","GIRDAAN_TEST"]),
  date:         z.string().optional(),
  juzFrom:      z.number().optional(),
  juzTo:        z.number().optional(),
  surahFrom:    z.number().optional(),
  surahTo:      z.number().optional(),
  result:       z.enum(["PASS","CONDITIONAL_PASS","FAIL"]).optional(),
  score:        z.number().min(0).max(100).optional(),
  mistakeCount: z.number().min(0).default(0),
  notes:        z.string().optional(),
  conditions:   z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "USTADH") return unauthorizedResponse("Only Asatidha can record tests");

    const body   = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;

    const ustadh = await prisma.ustadh.findUnique({ where: { userId: payload.userId } });
    if (!ustadh) return unauthorizedResponse("Ustadh profile not found");

    // Verify this student belongs to the same campus as the Ustadh
    // (Ustadh should only test students they actually teach)
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      select: { id: true, campusId: true },
    });
    if (!student) return errorResponse("Student not found");
    if (payload.campusId && student.campusId !== payload.campusId) {
      return unauthorizedResponse("Student not in your campus");
    }

    const test = await prisma.testRecord.create({
      data: {
        studentId:    data.studentId,
        examinerId:   ustadh.id,
        testType:     data.testType,
        date:         data.date ? new Date(data.date) : new Date(),
        juzFrom:      data.juzFrom,
        juzTo:        data.juzTo,
        surahFrom:    data.surahFrom,
        surahTo:      data.surahTo,
        result:       data.result,
        score:        data.score,
        mistakeCount: data.mistakeCount,
        notes:        data.notes,
        conditions:   data.conditions,
      },
      include: {
        student:  { select: { name: true, enrollmentNumber: true } },
      },
    });

    // ── Auto-send WhatsApp test result to parent (respects toggle) ──
    try {
      await sendTestResultWhatsApp(data.studentId, test, payload.name);
    } catch (waError) {
      console.error("WhatsApp test result send error (non-blocking):", waError);
    }

    return successResponse({ test }, 201);
  } catch (error) {
    console.error("Create test error:", error);
    return serverErrorResponse();
  }
}

// ─────────────────────────────────────────────────────────────
// WhatsApp test result notification
// Checks NotificationPreferences.sendOnTest before sending
// ─────────────────────────────────────────────────────────────
async function sendTestResultWhatsApp(
  studentId: string,
  test: any,
  examinerName: string
) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      guardians: { where: { receiveUpdates: true }, take: 3 },
      campus:    { include: { institution: true } },
    },
  });

  if (!student || student.guardians.length === 0) return;

  const institutionId = student?.campus?.institution?.id ?? null;
  let lang: "ur" | "en" = "ur";

  if (institutionId) {
    const prefs = await prisma.notificationPreferences.findUnique({
      where: { institutionId },
      select: { sendOnTest: true, language: true },
    });
    if (prefs && prefs.sendOnTest === false) return;
    if (prefs?.language === "en") lang = "en";
  }

  const message = testResultMessage({
    studentName:   student.name,
    instituteName: student.campus?.institution?.name || "HifzPro Institute",
    examinerName,
    date:          test.date,
    testType:      test.testType,
    result:        test.result,
    score:         test.score,
    juzFrom:       test.juzFrom,
    juzTo:         test.juzTo,
    mistakeCount:  test.mistakeCount,
    notes:         test.notes,
    lang,
  });

  for (const guardian of student.guardians) {
    const phone = guardian.whatsapp || guardian.phone;
    if (!phone) continue;

    const sendResult = await sendWhatsApp({ institutionId, to: phone, message });

    await prisma.notificationDelivery.create({
      data: {
        recipientId: phone,
        channel:     "WHATSAPP",
        type:        "test",
        body:        message,
        status:      sendResult.ok ? "SENT" : "FAILED",
        sentAt:      sendResult.ok ? new Date() : null,
        error:       sendResult.error || null,
        metadata:    { studentId, testId: test.id, testType: test.testType },
      },
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "USTADH") return unauthorizedResponse();

    const ustadh = await prisma.ustadh.findUnique({ where: { userId: payload.userId } });
    if (!ustadh) return unauthorizedResponse("Ustadh profile not found");

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "30");

    const tests = await prisma.testRecord.findMany({
      where:   { examinerId: ustadh.id },
      orderBy: { date: "desc" },
      take:    limit,
      include: {
        student: { select: { id: true, name: true, enrollmentNumber: true, photo: true } },
      },
    });

    return successResponse({ tests });
  } catch (error) {
    console.error("Get ustadh tests error:", error);
    return serverErrorResponse();
  }
}
