// app/api/attendance/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

const saveSchema = z.object({
  batchId: z.string(),
  date:    z.string(),
  records: z.array(z.object({
    studentId:     z.string(),
    status:        z.enum(["PRESENT","ABSENT","LATE","LEAVE"]),
    absenceReason: z.enum(["ILLNESS","TRAVEL","FAMILY","UNEXCUSED","HOLIDAY"]).optional(),
    notes:         z.string().optional(),
  })),
});

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "USTADH") return unauthorizedResponse();

    const body   = await req.json();
    const result = saveSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const { batchId, date, records } = result.data;
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return errorResponse("Invalid date");

    // ── OWNERSHIP CHECK: this batch must actually be taught by the calling Ustadh.
    //    Previously any authenticated Ustadh could submit attendance for ANY batch
    //    at ANY institution just by knowing/guessing its ID — the mobile app is the
    //    highest-exposure surface for this, so this was a real gap. ──
    const ustadh = await prisma.ustadh.findUnique({ where: { userId: payload.userId } });
    if (!ustadh) return unauthorizedResponse();

    const batch = await prisma.batch.findFirst({
      where:  { id: batchId, ustadhId: ustadh.id },
      select: { id: true, sessionTime: true },
    });
    if (!batch) return errorResponse("This halqa is not assigned to you.");

    // ── FIX: use the batch's own configured session time instead of hardcoding
    //    "Morning" for every submission — halqas can be Morning, Afternoon, or
    //    Evening (see SESSION_TIMES on the batch creation form), so every
    //    Afternoon/Evening halqa's attendance was being mislabeled. ──
    const sessionTime = batch.sessionTime || "Session";

    // ── Save session + all student records atomically — a dropped mobile
    //    connection partway through should not leave a half-saved session. ──
    const session = await prisma.$transaction(async tx => {
      const session = await tx.attendanceSession.upsert({
        where:  { batchId_date_sessionTime: { batchId, date: dateObj, sessionTime } },
        update: {},
        create: { batchId, date: dateObj, sessionTime, takenById: payload.userId },
      });

      for (const rec of records) {
        await tx.attendanceRecord.upsert({
          where:  { attendanceSessionId_studentId: { attendanceSessionId: session.id, studentId: rec.studentId } },
          update: { status: rec.status, absenceReason: rec.absenceReason, notes: rec.notes },
          create: { attendanceSessionId: session.id, studentId: rec.studentId, status: rec.status, absenceReason: rec.absenceReason, notes: rec.notes },
        });
      }

      return session;
    });

    return successResponse({ saved: records.length, sessionId: session.id });
  } catch (error) {
    console.error("Attendance error:", error);
    return serverErrorResponse();
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "USTADH") return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");
    const date    = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return errorResponse("Invalid date");
    const ustadh  = await prisma.ustadh.findUnique({ where: { userId: payload.userId } });
    if (!ustadh) return unauthorizedResponse();

    const batches = await prisma.batch.findMany({
      where:   { ustadhId: ustadh.id, isActive: true },
      include: {
        students: {
          where: { status: "ACTIVE" },
          select: { id: true, name: true },
        },
      },
    });

    // ── OWNERSHIP CHECK: if a specific batchId was requested, it must be one of
    //    this Ustadh's own batches — previously any batchId was accepted verbatim,
    //    letting a teacher pull another institution's attendance records. If no
    //    batchId given, scope to only this Ustadh's own batches rather than every
    //    batch on the platform. ──
    const ownBatchIds = batches.map(b => b.id);
    if (batchId && !ownBatchIds.includes(batchId)) {
      return errorResponse("This halqa is not assigned to you.");
    }

    const dayStart = new Date(dateObj); dayStart.setHours(0,0,0,0);
    const dayEnd   = new Date(dateObj); dayEnd.setHours(23,59,59,999);

    const sessions = await prisma.attendanceSession.findMany({
      where: {
        batchId: batchId || { in: ownBatchIds },
        date:    { gte: dayStart, lte: dayEnd },
      },
      include: { records: true },
    });

    return successResponse({ batches, sessions });
  } catch (error) {
    console.error("Get attendance error:", error);
    return serverErrorResponse();
  }
}
