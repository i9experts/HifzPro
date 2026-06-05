// app/api/parent/dashboard/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "PARENT") return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    // Get parent record
    const parent = await prisma.parent.findUnique({
      where: { userId: payload.userId },
      include: {
        guardian: {
          include: {
            student: {
              include: {
                batch: {
                  include: {
                    ustadh: { include: { user: { select: { name: true, phone: true, whatsapp: true } } } },
                    campus: { include: { institution: true } },
                  },
                },
                progress:      true,
                manzilHealth:  { orderBy: { calculatedAt: "desc" }, take: 5 },
                lessonEntries: {
                  orderBy:  { date: "desc" },
                  take:     10,
                  include:  { mistakes: true },
                },
                attendanceRecords: {
                  orderBy:  { session: { date: "desc" } },
                  take:     60,
                  include:  { session: { select: { date: true, sessionTime: true } } },
                },
                testRecords: {
                  orderBy:  { date: "desc" },
                  take:     20,
                  include:  { examiner: { include: { user: { select: { name: true } } } } },
                },
              },
            },
          },
        },
      },
    });

    // Also find other children of this guardian
    const allGuardians = await prisma.guardian.findMany({
      where: {
        OR: [
          { phone: { in: [payload.userId] } },
          { whatsapp: { in: [payload.userId] } },
        ],
      },
      include: { student: { select: { id: true, name: true, photo: true, program: true, status: true } } },
    });

    const guardianByUser = await prisma.guardian.findMany({
      where: { parent: { userId: payload.userId } },
      include: { student: { select: { id: true, name: true, nameArabic: true, photo: true, program: true, status: true, enrollmentNumber: true } } },
    });

    const children = guardianByUser.map(g => g.student).filter(Boolean);

    // Get specific student (first child if not specified)
    let student = parent?.guardian?.student;
    if (studentId && studentId !== student?.id) {
      const specificStudent = await prisma.student.findFirst({
        where: {
          id: studentId,
          guardians: { some: { parent: { userId: payload.userId } } },
        },
        include: {
          batch: {
            include: {
              ustadh: { include: { user: { select: { name: true, phone: true, whatsapp: true } } } },
              campus: { include: { institution: true } },
            },
          },
          progress:      true,
          manzilHealth:  { orderBy: { calculatedAt: "desc" }, take: 5 },
          lessonEntries: {
            orderBy:  { date: "desc" },
            take:     10,
            include:  { mistakes: true },
          },
          attendanceRecords: {
            orderBy:  { session: { date: "desc" } },
            take:     60,
            include:  { session: { select: { date: true, sessionTime: true } } },
          },
          testRecords: {
            orderBy:  { date: "desc" },
            take:     20,
            include:  { examiner: { include: { user: { select: { name: true } } } } },
          },
        },
      });
      if (specificStudent) student = specificStudent;
    }

    if (!student) return successResponse({ student: null, children, hasNoChildren: true });

    // Calculate stats
    const totalSessions   = student.attendanceRecords.length;
    const presentCount    = student.attendanceRecords.filter(r => r.status === "PRESENT").length;
    const absentCount     = student.attendanceRecords.filter(r => r.status === "ABSENT").length;
    const attendancePct   = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
    const currentHealth   = student.manzilHealth[0]?.score ?? null;
    const lastLesson      = student.lessonEntries[0] ?? null;
    const daysSinceLesson = lastLesson
      ? Math.floor((Date.now() - new Date(lastLesson.date).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // This week's lessons
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weekLessons = student.lessonEntries.filter(e => new Date(e.date) >= weekAgo).length;

    // This month's attendance
    const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
    const monthAttendance = student.attendanceRecords.filter(r => new Date(r.session.date) >= monthAgo);
    const monthPresentCount = monthAttendance.filter(r => r.status === "PRESENT").length;
    const monthAttendancePct = monthAttendance.length > 0
      ? Math.round((monthPresentCount / monthAttendance.length) * 100)
      : 0;

    // Health trend
    const healthTrend = student.manzilHealth.map(h => ({
      score: Math.round(h.score),
      date:  h.calculatedAt,
    }));

    return successResponse({
      student: {
        id:              student.id,
        name:            student.name,
        nameArabic:      student.nameArabic,
        photo:           student.photo,
        enrollmentNumber:student.enrollmentNumber,
        program:         student.program,
        status:          student.status,
        enrolledAt:      student.enrolledAt,
        expectedKhatmAt: student.expectedKhatmAt,
        batch: {
          name:    student.batch?.name,
          ustadh:  student.batch?.ustadh?.user,
          campus:  student.batch?.campus?.name,
          institution: student.batch?.campus?.institution,
        },
        progress: {
          currentJuz:      student.progress?.currentJuz     ?? 1,
          currentPage:     student.progress?.currentPage    ?? 1,
          currentSurah:    student.progress?.currentSurah,
          percentComplete: Math.round(student.progress?.percentComplete ?? 0),
          totalJuzMemorized: student.progress?.totalJuzMemorized ?? 0,
          projectedKhatmDate: student.progress?.projectedKhatmDate,
          avgLinesPerDay:  student.progress?.avgLinesPerDay ?? 0,
        },
        stats: {
          attendancePct,
          monthAttendancePct,
          presentCount,
          absentCount,
          totalSessions,
          currentHealth: currentHealth ? Math.round(currentHealth) : null,
          healthTrend,
          weekLessons,
          daysSinceLesson,
          totalTests:    student.testRecords.length,
          passedTests:   student.testRecords.filter(t => t.result === "PASS").length,
        },
        recentLessons:  student.lessonEntries,
        attendance:     student.attendanceRecords,
        testRecords:    student.testRecords,
      },
      children,
      guardian: parent?.guardian,
    });
  } catch (error) {
    console.error("Parent dashboard error:", error);
    return serverErrorResponse();
  }
}
