// app/api/admin/diary-monitor/route.ts
// Daily Diary Monitor — for a given day, shows every active batch (halqa)
// and how many of its active students have a lesson entry recorded that
// day, so an admin can see at a glance which classes' diaries are
// up to date and which teachers haven't recorded anything yet.
//
// LessonEntry.lessonType only distinguishes SABAQ/SABQI/MANZIL/GIRDAAN —
// the Nazrah and Qaida/Tajweed diary pages both record as SABAQ, so they
// can't be told apart by lessonType alone. Batch.program (HIFZ/NAZRA/
// TAJWEED/GIRDAAN) is what actually identifies which diary module a batch
// uses; lessonType breakdown is only meaningful within HIFZ batches.
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, errorResponse, serverErrorResponse } from "@/lib/api";

const TREND_DAYS = 7;

function dateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN", "SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    // ── TENANT SCOPING: campusId scopes to one campus; an institution-level SUPER_ADMIN
    //    (institutionId set, campusId null) scopes to their whole institution rather than
    //    leaking every institution's data. ──
    const campusId      = payload.campusId;
    const institutionId = !campusId ? payload.institutionId : null;
    if (!campusId && !institutionId) return errorResponse("Campus or Institution not found");
    const batchScope: any = campusId ? { campusId } : { campus: { institutionId } };

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const targetDate = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date();
    if (isNaN(targetDate.getTime())) return errorResponse("Invalid date");
    const todayKey = dateKey(targetDate);

    const dayStart = new Date(targetDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(targetDate); dayEnd.setHours(23, 59, 59, 999);
    const trendStart = new Date(dayStart); trendStart.setDate(trendStart.getDate() - (TREND_DAYS - 1));

    const batches = await prisma.batch.findMany({
      where:   { ...batchScope, isActive: true },
      orderBy: { name: "asc" },
      include: {
        ustadh:   { include: { user: { select: { name: true, phone: true } } } },
        students: { where: { status: "ACTIVE" }, select: { id: true, name: true } },
      },
    });

    const studentToBatch = new Map<string, string>();
    const allStudentIds: string[] = [];
    for (const b of batches) {
      for (const s of b.students) {
        studentToBatch.set(s.id, b.id);
        allStudentIds.push(s.id);
      }
    }

    const entries = allStudentIds.length > 0
      ? await prisma.lessonEntry.findMany({
          where:  { studentId: { in: allStudentIds }, date: { gte: trendStart, lte: dayEnd } },
          select: { studentId: true, date: true, lessonType: true },
        })
      : [];

    // recordedByDayBatch[dateKey][batchId] = Set<studentId>
    const recordedByDayBatch = new Map<string, Map<string, Set<string>>>();
    // todayBreakdown[batchId] = { SABAQ: n, SABQI: n, MANZIL: n, GIRDAAN: n } (distinct students per type, today only)
    const todayBreakdown = new Map<string, Record<string, Set<string>>>();

    for (const e of entries) {
      const batchId = studentToBatch.get(e.studentId);
      if (!batchId) continue;
      const key = dateKey(new Date(e.date));

      if (!recordedByDayBatch.has(key)) recordedByDayBatch.set(key, new Map());
      const byBatch = recordedByDayBatch.get(key)!;
      if (!byBatch.has(batchId)) byBatch.set(batchId, new Set());
      byBatch.get(batchId)!.add(e.studentId);

      if (key === todayKey) {
        if (!todayBreakdown.has(batchId)) todayBreakdown.set(batchId, { SABAQ: new Set(), SABQI: new Set(), MANZIL: new Set(), GIRDAAN: new Set() });
        todayBreakdown.get(batchId)![e.lessonType]?.add(e.studentId);
      }
    }

    const trendDates: string[] = [];
    for (let i = 0; i < TREND_DAYS; i++) {
      const d = new Date(trendStart); d.setDate(d.getDate() + i);
      trendDates.push(dateKey(d));
    }

    let fullyRecorded = 0, partiallyRecorded = 0, notRecorded = 0, noStudents = 0;
    let totalStudentsAcrossBatches = 0, recordedStudentsAcrossBatches = 0;

    const batchResults = batches.map(b => {
      const total = b.students.length;
      const recordedToday = recordedByDayBatch.get(todayKey)?.get(b.id) ?? new Set<string>();
      const recordedCount = recordedToday.size;
      const pct = total > 0 ? Math.round((recordedCount / total) * 100) : null;

      if (total === 0) noStudents++;
      else if (recordedCount === 0) notRecorded++;
      else if (recordedCount >= total) fullyRecorded++;
      else partiallyRecorded++;

      totalStudentsAcrossBatches += total;
      recordedStudentsAcrossBatches += recordedCount;

      const breakdown = todayBreakdown.get(b.id);
      const breakdownCounts = breakdown
        ? { SABAQ: breakdown.SABAQ.size, SABQI: breakdown.SABQI.size, MANZIL: breakdown.MANZIL.size, GIRDAAN: breakdown.GIRDAAN.size }
        : { SABAQ: 0, SABQI: 0, MANZIL: 0, GIRDAAN: 0 };

      const missingStudents = b.students
        .filter(s => !recordedToday.has(s.id))
        .map(s => ({ id: s.id, name: s.name }));

      const trend = trendDates.map(dk => {
        const recorded = recordedByDayBatch.get(dk)?.get(b.id)?.size ?? 0;
        return { date: dk, pct: total > 0 ? Math.round((recorded / total) * 100) : null };
      });

      return {
        id:            b.id,
        name:          b.name,
        program:       b.program,
        ustadh:        b.ustadh ? { id: b.ustadh.id, name: b.ustadh.user.name, phone: b.ustadh.user.phone } : null,
        totalStudents: total,
        recordedCount,
        pct,
        breakdown:     breakdownCounts,
        missingStudents,
        trend,
      };
    });

    // Worst-first: unrecorded, then partial, then full, then no-students last
    const statusRank = (pct: number | null) => pct === null ? 3 : pct === 0 ? 0 : pct < 100 ? 1 : 2;
    batchResults.sort((a, b) => statusRank(a.pct) - statusRank(b.pct) || (a.pct ?? 0) - (b.pct ?? 0));

    return successResponse({
      date: todayKey,
      summary: {
        totalBatches: batches.length,
        fullyRecorded, partiallyRecorded, notRecorded, noStudents,
        totalStudents: totalStudentsAcrossBatches,
        recordedStudents: recordedStudentsAcrossBatches,
      },
      batches: batchResults,
    });
  } catch (error) {
    console.error("Diary monitor error:", error);
    return serverErrorResponse();
  }
}
