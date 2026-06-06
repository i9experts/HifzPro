// app/api/admin/attendance/reports/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

async function getCampusId(userId: string, jwtCampusId: string | null) {
  if (jwtCampusId) return jwtCampusId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { campusId: true } });
  return user?.campusId ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const campusId = await getCampusId(payload.userId, payload.campusId);
    const { searchParams } = new URL(req.url);

    const now          = new Date();
    const month        = parseInt(searchParams.get("month") || String(now.getMonth() + 1));
    const year         = parseInt(searchParams.get("year")  || String(now.getFullYear()));

    // Month boundaries
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd   = new Date(year, month, 0, 23, 59, 59);
    const today      = new Date(); today.setHours(0,0,0,0);
    const todayEnd   = new Date(); todayEnd.setHours(23,59,59,999);
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // ── Fetch all sessions in month ──
    const sessions = await prisma.attendanceSession.findMany({
      where: {
        batch:   { campusId: campusId || undefined },
        date:    { gte: monthStart, lte: monthEnd },
      },
      include: {
        records: {
          include: {
            student: { select: { id: true, name: true, enrollmentNumber: true, batchId: true } },
          },
        },
        batch: { select: { id: true, name: true, program: true } },
      },
      orderBy: { date: "asc" },
    });

    // ── Today's snapshot ──
    const todaySessions = await prisma.attendanceSession.findMany({
      where: {
        batch: { campusId: campusId || undefined },
        date:  { gte: today, lte: todayEnd },
      },
      include: { records: true },
    });
    const todayPresent = todaySessions.reduce((acc, s) => acc + s.records.filter(r => r.status === "PRESENT").length, 0);
    const todayAbsent  = todaySessions.reduce((acc, s) => acc + s.records.filter(r => r.status === "ABSENT").length, 0);
    const todayTotal   = todaySessions.reduce((acc, s) => acc + s.records.length, 0);

    // ── Build per-student stats for the month ──
    const studentMap: Record<string, {
      id: string; name: string; enrollmentNumber: string; batchId: string | null; batchName: string;
      present: number; absent: number; late: number; leave: number; total: number;
    }> = {};

    const batchSessionCount: Record<string, number> = {};

    sessions.forEach(session => {
      const batchId   = session.batch.id;
      const batchName = session.batch.name;
      batchSessionCount[batchId] = (batchSessionCount[batchId] || 0) + 1;

      session.records.forEach(record => {
        const sid = record.student.id;
        if (!studentMap[sid]) {
          studentMap[sid] = {
            id:               record.student.id,
            name:             record.student.name,
            enrollmentNumber: record.student.enrollmentNumber || "",
            batchId:          record.student.batchId,
            batchName,
            present:0, absent:0, late:0, leave:0, total:0,
          };
        }
        studentMap[sid].total++;
        if (record.status === "PRESENT") studentMap[sid].present++;
        else if (record.status === "ABSENT") studentMap[sid].absent++;
        else if (record.status === "LATE")   studentMap[sid].late++;
        else if (record.status === "LEAVE")  studentMap[sid].leave++;
      });
    });

    const studentStats = Object.values(studentMap).map(s => ({
      ...s,
      attendancePct: s.total > 0 ? Math.round((s.present / s.total) * 100) : null,
    })).sort((a, b) => (a.attendancePct ?? 100) - (b.attendancePct ?? 100));

    // ── Chronic absentees (< 70% in last 30 days or 3+ absences this month) ──
    const chronic = studentStats.filter(s =>
      (s.attendancePct !== null && s.attendancePct < 70) || s.absent >= 3
    );

    // ── Day-by-day trend (heatmap data) ──
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyData: { day: number; date: string; present: number; absent: number; total: number; rate: number | null }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month - 1, d);
      const daySessions = sessions.filter(s => {
        const sd = new Date(s.date);
        return sd.getDate() === d && sd.getMonth() === month - 1;
      });
      const present = daySessions.reduce((acc, s) => acc + s.records.filter(r => r.status === "PRESENT").length, 0);
      const absent  = daySessions.reduce((acc, s) => acc + s.records.filter(r => r.status === "ABSENT").length, 0);
      const total   = daySessions.reduce((acc, s) => acc + s.records.length, 0);
      dailyData.push({
        day:     d,
        date:    dayDate.toISOString().split("T")[0],
        present, absent, total,
        rate:    total > 0 ? Math.round((present / total) * 100) : null,
      });
    }

    // ── Batch comparison ──
    const batches = await prisma.batch.findMany({
      where:   { campusId: campusId || undefined, isActive: true },
      select:  { id: true, name: true, program: true },
    });

    const batchStats = batches.map(b => {
      const bStudents = studentStats.filter(s => s.batchId === b.id);
      const withData  = bStudents.filter(s => s.attendancePct !== null);
      const avgPct    = withData.length > 0
        ? Math.round(withData.reduce((acc, s) => acc + (s.attendancePct || 0), 0) / withData.length)
        : null;
      const totalPresent = bStudents.reduce((acc, s) => acc + s.present, 0);
      const totalSessions= bStudents.reduce((acc, s) => acc + s.total, 0);
      return {
        id:           b.id,
        name:         b.name,
        program:      b.program,
        studentCount: bStudents.length,
        avgPct,
        totalPresent,
        totalSessions,
        chronicCount: bStudents.filter(s => (s.attendancePct ?? 100) < 70).length,
      };
    }).filter(b => b.studentCount > 0).sort((a, b) => (b.avgPct ?? 0) - (a.avgPct ?? 0));

    // ── Day of week analysis ──
    const dowStats: Record<number, { present: number; total: number; label: string }> = {
      0:{present:0,total:0,label:"Sun"}, 1:{present:0,total:0,label:"Mon"},
      2:{present:0,total:0,label:"Tue"}, 3:{present:0,total:0,label:"Wed"},
      4:{present:0,total:0,label:"Thu"}, 5:{present:0,total:0,label:"Fri"},
      6:{present:0,total:0,label:"Sat"},
    };
    sessions.forEach(s => {
      const dow = new Date(s.date).getDay();
      s.records.forEach(r => {
        dowStats[dow].total++;
        if (r.status === "PRESENT") dowStats[dow].present++;
      });
    });
    const dowData = Object.entries(dowStats).map(([dow, d]) => ({
      dow: parseInt(dow), label: d.label,
      rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : null,
    }));

    // ── Overall month stats ──
    const totalPresent  = Object.values(studentMap).reduce((acc, s) => acc + s.present, 0);
    const totalRecords  = Object.values(studentMap).reduce((acc, s) => acc + s.total,   0);
    const totalAbsent   = Object.values(studentMap).reduce((acc, s) => acc + s.absent,  0);
    const overallRate   = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : null;
    const totalSessions = sessions.length;

    // ── Get guardian info for chronic absentees ──
    const chronicWithGuardians = await Promise.all(
      chronic.slice(0, 20).map(async s => {
        const guardian = await prisma.guardian.findFirst({
          where:  { studentId: s.id },
          select: { name: true, phone: true, whatsapp: true },
        });
        return { ...s, guardian };
      })
    );

    return successResponse({
      month, year,
      snapshot: {
        todayPresent, todayAbsent, todayTotal,
        todayRate: todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : null,
        overallRate,
        totalPresent,
        totalAbsent,
        totalRecords,
        totalSessions,
        chronicCount:   chronic.length,
        totalStudents:  Object.keys(studentMap).length,
        perfectAttendance: studentStats.filter(s => s.attendancePct === 100).length,
      },
      dailyData,
      batchStats,
      studentStats,
      chronicAbsentees: chronicWithGuardians,
      dowData,
    });
  } catch (error) {
    console.error("Attendance reports error:", error);
    return serverErrorResponse();
  }
}
