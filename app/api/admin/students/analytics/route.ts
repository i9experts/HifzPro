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

    const campusId  = payload.campusId;
    const now       = new Date();
    const today     = new Date(now); today.setHours(0,0,0,0);
    const todayEnd  = new Date(now); todayEnd.setHours(23,59,59,999);
    const monthAgo  = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);
    const weekAgo   = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);

    // ── Base where clause ──
    const studentWhere: any = { status: "ACTIVE" };
    if (campusId) studentWhere.campusId = campusId;

    // ── Get all active students ──
    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        progress:      true,
        manzilHealth:  { orderBy: { calculatedAt: "desc" }, take: 1 },
        lessonEntries: {
          orderBy: { date: "desc" }, take: 3,
          select:  { date: true, grade: true, lessonType: true, mistakeCount: true },
        },
        batch: { select: { id: true, name: true } },
        guardians: { take: 1, select: { name: true, phone: true } },
        _count: { select: { attendanceRecords: true } },
      },
    });

    // ── Today's activity ──
    const todayLessons = await prisma.lessonEntry.count({
      where: {
        date: { gte: today, lte: todayEnd },
        ...(campusId ? { student: { campusId } } : {}),
      },
    }).catch(() => 0);

    const todayAttendance = await prisma.attendanceRecord.count({
      where: {
        status: "PRESENT",
        session: { date: { gte: today, lte: todayEnd } },
        ...(campusId ? { student: { campusId } } : {}),
      },
    }).catch(() => 0);

    const todayMessages = await prisma.notificationDelivery.count({
      where: { channel: "WHATSAPP", status: "SENT", createdAt: { gte: today } },
    }).catch(() => 0);

    // ── Per-student analytics ──
    const healthDist = { excellent: 0, good: 0, moderate: 0, atRisk: 0, noData: 0 };
    const progressBands = { completing: 0, advanced: 0, midway: 0, early: 0 };

    const studentAnalytics = students.map(s => {
      const health        = s.manzilHealth[0]?.score ?? null;
      const lastLesson    = s.lessonEntries[0] ?? null;
      const progress      = s.progress;
      const percentComplete = Math.round(progress?.percentComplete ?? 0);
      const currentJuz    = progress?.currentJuz ?? 1;

      const daysSinceLesson = lastLesson
        ? Math.floor((now.getTime() - new Date(lastLesson.date).getTime()) / (1000*60*60*24))
        : 999;

      // Health distribution
      if (health === null) healthDist.noData++;
      else if (health >= 80) healthDist.excellent++;
      else if (health >= 65) healthDist.good++;
      else if (health >= 50) healthDist.moderate++;
      else healthDist.atRisk++;

      // Progress bands
      if (percentComplete >= 90)      progressBands.completing++;
      else if (percentComplete >= 60) progressBands.advanced++;
      else if (percentComplete >= 30) progressBands.midway++;
      else                            progressBands.early++;

      // Risk scoring
      let riskLevel = 0;
      if (health !== null) {
        if (health < 45) riskLevel += 2;
        else if (health < 60) riskLevel += 1;
      }
      if (daysSinceLesson > 14) riskLevel += 2;
      else if (daysSinceLesson > 7) riskLevel += 1;

      return {
        id:              s.id,
        name:            s.name,
        program:         s.program,
        batchId:         s.batchId,
        batchName:       s.batch?.name,
        currentJuz,
        percentComplete,
        manzilHealth:    health ? Math.round(health) : null,
        lastLessonDate:  lastLesson?.date ?? null,
        daysSinceLesson,
        attendancePct:   null as number | null,
        riskLevel,
        guardian:        s.guardians[0] ?? null,
        recentGrades:    s.lessonEntries.map(e => e.grade),
        totalMistakes:   s.lessonEntries.reduce((acc, e) => acc + (e.mistakeCount || 0), 0),
      };
    });

    // ── Dropout risk ──
    const critical = studentAnalytics.filter(s => s.riskLevel >= 4).sort((a,b) => b.riskLevel - a.riskLevel);
    const atRisk   = studentAnalytics.filter(s => s.riskLevel >= 2 && s.riskLevel < 4).sort((a,b) => b.riskLevel - a.riskLevel);
    const monitor  = studentAnalytics.filter(s => s.riskLevel === 1);

    // ── Top performers ──
    const topPerformers = [...studentAnalytics]
      .filter(s => s.manzilHealth !== null && s.daysSinceLesson <= 7)
      .sort((a, b) => (b.manzilHealth || 0) - (a.manzilHealth || 0))
      .slice(0, 5);

    // ── Overall averages ──
    const withHealth = studentAnalytics.filter(s => s.manzilHealth !== null);
    const overallHealth = withHealth.length > 0
      ? Math.round(withHealth.reduce((acc, s) => acc + (s.manzilHealth || 0), 0) / withHealth.length)
      : null;

    // ── Batch analytics ──
    const batches = await prisma.batch.findMany({
      where: { isActive: true, ...(campusId ? { campusId } : {}) },
      include: {
        ustadh:   { include: { user: { select: { name: true } } } },
        students: { where: { status: "ACTIVE" }, select: { id: true } },
      },
    }).catch(() => []);

    const batchAnalytics = batches.map(b => {
      const bStudents = studentAnalytics.filter(s => s.batchId === b.id);
      const withH = bStudents.filter(s => s.manzilHealth !== null);
      const avgHealth = withH.length > 0
        ? Math.round(withH.reduce((acc, s) => acc + (s.manzilHealth || 0), 0) / withH.length)
        : null;
      const avgProgress = bStudents.length > 0
        ? Math.round(bStudents.reduce((acc, s) => acc + s.percentComplete, 0) / bStudents.length)
        : 0;
      return {
        id:          b.id,
        name:        b.name,
        program:     b.program,
        ustadhName:  b.ustadh?.user?.name ?? "Unassigned",
        studentCount:bStudents.length,
        avgHealth,
        avgProgress,
        avgAttendance: null,
        atRiskCount: bStudents.filter(s => (s.manzilHealth ?? 100) < 60).length,
      };
    });

    // ── Mistake analysis ──
    const mistakes = await prisma.mistake.groupBy({
      by:     ["mistakeType"],
      where:  campusId ? { lessonEntry: { student: { campusId } } } : {},
      _count: true,
      orderBy:{ _count: { mistakeType: "desc" } },
    }).catch(() => []);

    // ── Lesson trend (last 14 days, grouped by day) ──
    const lessonTrend: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const dayStart = new Date(now); dayStart.setDate(dayStart.getDate() - i); dayStart.setHours(0,0,0,0);
      const dayEnd   = new Date(now); dayEnd.setDate(dayEnd.getDate() - i);   dayEnd.setHours(23,59,59,999);
      const count    = await prisma.lessonEntry.count({
        where: {
          date: { gte: dayStart, lte: dayEnd },
          ...(campusId ? { student: { campusId } } : {}),
        },
      }).catch(() => 0);
      lessonTrend.push({
        date:  dayStart.toLocaleDateString("en-PK", { month: "short", day: "numeric" }),
        count,
      });
    }

    // ── Ustadh performance ──
    const asatidha = await prisma.ustadh.findMany({
      where: batches.length > 0 ? { batches: { some: { campusId: campusId||undefined } } } : {},
      include: {
        user:    { select: { name: true } },
        batches: {
          where: campusId ? { campusId } : {},
          select: { id: true, name: true, students: { select: { id: true } } },
        },
        lessonEntries: {
          where: { date: { gte: monthAgo } },
          select: { grade: true },
        },
      },
    }).catch(() => []);

    const ustadhPerformance = asatidha.map(u => {
      const gradeScores: Record<string, number> = { EXCELLENT: 100, GOOD: 75, WEAK: 40, REPEAT: 10 };
      const graded    = u.lessonEntries.filter(e => e.grade);
      const avgGrade  = graded.length > 0
        ? Math.round(graded.reduce((acc, e) => acc + (gradeScores[e.grade!] || 50), 0) / graded.length)
        : null;
      const bStudentIds = u.batches.flatMap(b => b.students.map(s => s.id));
      const uStudents   = studentAnalytics.filter(s => bStudentIds.includes(s.id));
      const withH2      = uStudents.filter(s => s.manzilHealth !== null);
      const avgHealth   = withH2.length > 0
        ? Math.round(withH2.reduce((acc, s) => acc + (s.manzilHealth || 0), 0) / withH2.length)
        : null;
      return {
        id:               u.id,
        name:             u.user.name,
        batchCount:       u.batches.length,
        studentCount:     bStudentIds.length,
        lessonsThisMonth: u.lessonEntries.length,
        avgGradeScore:    avgGrade,
        avgStudentHealth: avgHealth,
      };
    });

    return successResponse({
      snapshot: {
        totalStudents:    students.length,
        todayLessons,
        todayAttendance,
        todayMessages,
        overallHealth,
        overallAttendance: null,
        criticalCount:    critical.length,
        atRiskCount:      atRisk.length,
      },
      healthDistribution: healthDist,
      progressBands,
      dropoutRisk: { critical, atRisk, monitor },
      batchAnalytics,
      topPerformers,
      mistakeAnalysis: mistakes,
      lessonTrend,
      ustadhPerformance,
      allStudents: studentAnalytics,
    });

  } catch (error) {
    console.error("Analytics error:", error);
    return serverErrorResponse();
  }
}
