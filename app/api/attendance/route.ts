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

    // Upsert session
    const session = await prisma.attendanceSession.upsert({
      where:  { batchId_date_sessionTime: { batchId, date: dateObj, sessionTime: "Morning" } },
      update: {},
      create: { batchId, date: dateObj, sessionTime: "Morning", takenById: payload.userId },
    });

    // Upsert each record
    for (const rec of records) {
      await prisma.attendanceRecord.upsert({
        where:  { attendanceSessionId_studentId: { attendanceSessionId: session.id, studentId: rec.studentId } },
        update: { status: rec.status, absenceReason: rec.absenceReason, notes: rec.notes },
        create: { attendanceSessionId: session.id, studentId: rec.studentId, status: rec.status, absenceReason: rec.absenceReason, notes: rec.notes },
      });
    }

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
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");
    const date    = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const dateObj = new Date(date);
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

    const sessions = await prisma.attendanceSession.findMany({
      where: {
        batchId: batchId || undefined,
        date: {
          gte: new Date(dateObj.setHours(0,0,0,0)),
          lte: new Date(dateObj.setHours(23,59,59,999)),
        },
      },
      include: { records: true },
    });

    return successResponse({ batches, sessions });
  } catch (error) {
    console.error("Get attendance error:", error);
    return serverErrorResponse();
  }
}
