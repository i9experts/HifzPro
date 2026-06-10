// app/api/admin/analytics/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const campusId = payload.campusId;
    const now      = new Date();
    const today    = new Date(now); today.setHours(0,0,0,0);
    const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);
    const week_ago = new Date(now); week_ago.setDate(week_ago.getDate() - 7);
    const month_ago= new Date(now); month_ago.setDate(month_ago.getDate() - 30);

    // ── All active students ──
    const students = await prisma.student.findMany({
      where: { campusId: campusId || undefined, status: "ACTIVE" },
      include: {
        progress:      true,
        manzilHealth:  { orderBy: { calculatedAt: "desc" }, take: 1 },
        lessonEntries: { orderBy: { date: "desc" }, take: 3, select: { date: true, grade: true, lessonType: true, mistakeCount: true } },
        attendanceRecords: {
          where: { session: { date: { gte: month_ago } } },
          select: { status: true },
        },
        batch:    { select: { id: true, name: true } },
        guardians:{ take: 1, select: { name: true, phone: true } },
      },
    });

    // ── Today's activity ──
    const todayLessons = await prisma.lessonEntry.count({
      where: { student: { campusId: campusId||undefined }, date: { gte: today, lte: todayEnd } },
    });
    const todayAttendance = await prisma.attendanceRecord.count({
      where: { student: { campusId: campusId||undefined }, session: { date: { gte: today, lte: todayEnd } }, status: "PRESENT" },
    });
    const todayMessages = await prisma.notificationDelivery.count({
      where: { channel: "WHATSAPP", status: "SENT", createdAt: { gte: today } },
    });

    // ── Manzil health distribution ──
    const healthDist = { excellent: 0, good: 0, moderate: 0, atRisk: 0, noData: 0 };
    const studentAnalytics = students.map(s => {
      const health = s.manzilHealth[0]?.score ?? null;
      const lastLesson = s.lessonEntries[0];
      const daysSinceLesson = lastLesson
        ? Math.floor((now.getTime() - new Date(lastLesson.date).getTime()) / (1000*60*60*24))
        : 999;
      const attendancePct = s.attendanceRecords.length > 0
        ? Math.round((s.attendanceRecords.filter(r => r.status === "PRESENT").length / s.attendanceRecords.length) * 100)
        : null;

      // Risk score (0=safe, 1=monitor, 2=at-risk, 3=critical)
      let riskLevel = 0;
      if (health !== null) {
        if (health < 45) riskLevel += 2;
        else if (health < 60) riskLevel += 1;
      }
      if (daysSinceLesson > 14) riskLevel += 2;
      else if (daysSinceLesson > 7) riskLevel += 1;
      if (attendancePct !== null) {
        if (attendancePct < 50) riskLevel += 2;
        else if (attendancePct < 70) riskLevel += 1;
      }

      // Health distribution
      if (health === null) healthDist.noData++;
      else if (health >= 80) healthDist.excellent++;
      else if (health >= 65) healthDist.good++;
      else if (health >= 50) healthDist.moderate++;
      else healthDist.atRisk++;

      return {
        id:              s.id,
        name:            s.name,
        program:         s.program,
        batchId:         s.batchId,
        batchName:       s.batch?.name,
        currentJuz:      s.progress?.currentJuz ?? 1,
        percentComplete: Math.round(s.progress?.percentComplete ?? 0),
        manzilHealth:    health ? Math.round(health) : null,
        lastLessonDate:  lastLesson?.date ?? null,
        daysSinceLesson,
        attendancePct,
        riskLevel,
        guardian:        s.guardians[0] ?? null,
        recentGrades:    s.lessonEntries.map(e => e.grade),
        totalMistakes:   s.lessonEntries.reduce((acc, e) => acc + (e.mistakeCount || 0), 0),
      };
    });

    // ── Dropout risk segments ──
    const critical = studentAnalytics.filter(s => s.riskLevel >= 4).sort((a,b) => b.riskLevel - a.riskLevel);
    const atRisk   = studentAnalytics.filter(s => s.riskLevel >= 2 && s.riskLevel < 4).sort((a,b) => b.riskLevel - a.riskLevel);
    const monitor  = studentAnalytics.filter(s => s.riskLevel === 1);

    // ── Batch comparison ──
    const batches = await prisma.batch.findMany({
      where: { campusId: campusId||undefined, isActive: true },
      include: {
        ustadh:   { include: { user: { select: { name: true } } } },
        students: { where: { status: "ACTIVE" }, select: { id: true } },
      },
    });

    const batchAnalytics = batches.map(b => {
      const bStudents = studentAnalytics.filter(s => s.batchId === b.id);
      const avgHealth = bStudents.filter(s => s.manzilHealth !== null).length > 0
        ? Math.round(bStudents.filter(s => s.manzilHealth !== null).reduce((acc, s) => acc + (s.manzilHealth || 0), 0) / bStudents.filter(s => s.manzilHealth !== null).length)
        : null;
      const avgProgress = bStudents.length > 0
        ? Math.round(bStudents.reduce((acc, s) => acc + s.percentComplete, 0) / bStudents.length)
        : 0;
      const avgAttendance = bStudents.filter(s => s.attendancePct !== null).length > 0
        ? Math.round(bStudents.filter(s => s.attendancePct !== null).reduce((acc, s) => acc + (s.attendancePct || 0), 0) / bStudents.filter(s => s.attendancePct !== null).length)
        : null;

      return {
        id:          b.id,
        name:        b.name,
        program:     b.program,
        ustadhName:  b.ustadh?.user?.name ?? "Unassigned",
        studentCount:bStudents.length,
        avgHealth,
        avgProgress,
        avgAttendance,
        atRiskCount: bStudents.filter(s => (s.manzilHealth ?? 100) < 60).length,
      };
    });

    // ── Mistake analysis ──
    const mistakes = await prisma.mistake.groupBy({
      by:    ["mistakeType"],
      where: { lessonEntry: { student: { campusId: campusId||undefined }, date: { gte: month_ago } } },
      _count: true,
      orderBy:{ _count: { mistakeType: "desc" } },
    });

    // ── Progress bands ──
    const progressBands = {
      completing:  studentAnalytics.filter(s => s.percentComplete >= 90).length,
      advanced:    studentAnalytics.filter(s => s.percentComplete >= 60 && s.percentComplete < 90).length,
      midway:      studentAnalytics.filter(s => s.percentComplete >= 30 && s.percentComplete < 60).length,
      early:       studentAnalytics.filter(s => s.percentComplete < 30).length,
    };

    // ── Top performers ──
    const topPerformers = [...studentAnalytics]
      .filter(s => s.manzilHealth !== null && s.daysSinceLesson <= 3)
      .sort((a,b) => (b.manzilHealth||0) - (a.manzilHealth||0))
      .slice(0, 5);

    // ── 30-day lesson trend ──
    const lessonTrend = await prisma.lessonEntry.groupBy({
      by:    ["date"],
      where: { student: { campusId: campusId||undefined }, date: { gte: month_ago } },
      _count: true,
      orderBy:{ date: "asc" },
    });

    const trendData = lessonTrend.map(d => ({
      date:  new Date(d.date).toLocaleDateString("en-PK", { month: "short", day: "numeric" }),
      count: d._count,
    }));

    // ── Ustadh performance ──
    const asatidha = await prisma.ustadh.findMany({
      where: { batches: { some: { campusId: campusId||undefined } } },
      include: {
        user:    { select: { name: true } },
        batches: { where: { campusId: campusId||undefined }, select: { id: true, name: true, students: { select: { id: true } } } },
        lessonEntries: { where: { date: { gte: month_ago } }, select: { grade: true, mistakeCount: true } },
      },
    });

    const ustadhPerformance = asatidha.map(u => {
      const gradeScores: Record<string,number> = { EXCELLENT:100, GOOD:75, WEAK:40, REPEAT:10 };
      const avgGrade = u.lessonEntries.filter(e=>e.grade).length > 0
        ? Math.round(u.lessonEntries.filter(e=>e.grade).reduce((acc,e) => acc + (gradeScores[e.grade!]||50), 0) / u.lessonEntries.filter(e=>e.grade).length)
        : null;
      const batchStudentIds = u.batches.flatMap(b => b.students.map(s => s.id));
      const uStudents = studentAnalytics.filter(s => batchStudentIds.includes(s.id));
      const avgHealth = uStudents.filter(s => s.manzilHealth !== null).length > 0
        ? Math.round(uStudents.filter(s => s.manzilHealth !== null).reduce((acc,s) => acc+(s.manzilHealth||0),0) / uStudents.filter(s => s.manzilHealth !== null).length)
        : null;

      return {
        id:            u.id,
        name:          u.user.name,
        batchCount:    u.batches.length,
        studentCount:  batchStudentIds.length,
        lessonsThisMonth: u.lessonEntries.length,
        avgGradeScore: avgGrade,
        avgStudentHealth: avgHealth,
      };
    });

    // ── Overall institution health ──
    const overallHealth = studentAnalytics.filter(s => s.manzilHealth !== null).length > 0
      ? Math.round(studentAnalytics.filter(s => s.manzilHealth !== null).reduce((acc,s) => acc+(s.manzilHealth||0),0) / studentAnalytics.filter(s => s.manzilHealth !== null).length)
      : null;

    const overallAttendance = studentAnalytics.filter(s => s.attendancePct !== null).length > 0
      ? Math.round(studentAnalytics.filter(s => s.attendancePct !== null).reduce((acc,s) => acc+(s.attendancePct||0),0) / studentAnalytics.filter(s => s.attendancePct !== null).length)
      : null;

    return successResponse({
      snapshot: {
        totalStudents:    students.length,
        todayLessons,
        todayAttendance,
        todayMessages,
        overallHealth,
        overallAttendance,
        criticalCount:    critical.length,
        atRiskCount:      atRisk.length,
      },
      healthDistribution: healthDist,
      progressBands,
      dropoutRisk: { critical, atRisk, monitor },
      batchAnalytics,
      topPerformers,
      mistakeAnalysis: mistakes,
      lessonTrend:     trendData,
      ustadhPerformance,
      allStudents: studentAnalytics,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return serverErrorResponse();
  }
}
