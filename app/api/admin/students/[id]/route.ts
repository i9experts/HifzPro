// app/api/admin/students/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        batch:    { include: { ustadh: { include: { user: { select: { name: true, phone: true } } } } } },
        guardians: true,
        progress:  true,
        manzilHealth: { orderBy: { calculatedAt: "desc" }, take: 10 },
        lessonEntries: {
          orderBy: { date: "desc" }, take: 50,
          include: { mistakes: true, ustadh: { include: { user: { select: { name: true } } } } },
        },
        attendanceRecords: {
          orderBy: { session: { date: "desc" } }, take: 60,
          include: { session: { select: { date: true, sessionTime: true } } },
        },
        testRecords: {
          orderBy: { date: "desc" },
          include: { examiner: { include: { user: { select: { name: true } } } } },
        },
        sanads:      true,
        scholarships:{ include: { donor: true } },
      },
    });

    if (!student) return notFoundResponse("Student not found");

    const totalSessions  = student.attendanceRecords.length;
    const presentCount   = student.attendanceRecords.filter(r => r.status === "PRESENT").length;
    const absentCount    = student.attendanceRecords.filter(r => r.status === "ABSENT").length;
    const lateCount      = student.attendanceRecords.filter(r => r.status === "LATE").length;
    const attendancePct  = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
    const daysSinceEnrolled = Math.floor((Date.now() - new Date(student.enrolledAt).getTime()) / (1000 * 60 * 60 * 24));

    return successResponse({
      student: {
        ...student,
        stats: {
          daysSinceEnrolled,
          totalLessons:  student.lessonEntries.length,
          totalTests:    student.testRecords.length,
          attendancePct,
          totalSessions,
          presentCount,
          absentCount,
          lateCount,
          currentHealth: student.manzilHealth[0]?.score ?? null,
          healthTrend:   student.manzilHealth.slice(0, 5).map(h => ({ score: h.score, date: h.calculatedAt })),
        },
      },
    });
  } catch (error) {
    console.error("Get student error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { id } = await params;
    const body   = await req.json();

    // ── FIX: save ALL fields including photo, gender, address, etc. ──
    const student = await prisma.student.update({
      where: { id },
      data: {
        // Core
        name:                body.name           ?? undefined,
        nameArabic:          body.nameArabic     ?? undefined,
        dateOfBirth:         body.dateOfBirth    ? new Date(body.dateOfBirth) : undefined,
        program:             body.program        ?? undefined,
        batchId:             body.batchId        || null,
        status:              body.status         ?? undefined,
        enrolledAt:          body.enrolledAt     ? new Date(body.enrolledAt) : undefined,
        expectedKhatmAt:     body.expectedKhatmAt ? new Date(body.expectedKhatmAt) : undefined,

        // ── PHOTO FIX: was missing, photo never saved to DB ──
        photo:               body.photo          ?? undefined,

        // Personal fields — were all missing from PUT
        gender:              body.gender         ?? undefined,
        bloodGroup:          body.bloodGroup     || null,
        address:             body.address        || null,
        city:                body.city           || null,
        transport:           body.transport      || null,
        previousInstitution: body.previousInstitution || null,
        medicalNotes:        body.medicalNotes   || null,
        specialNeeds:        body.specialNeeds   || null,

        // Quran position
        startingJuz:         body.startingJuz    ?? undefined,
        startingAyah:        body.startingAyah   ?? undefined,

        // Notes
        notes:               body.notes          || null,
      },
    });

    // Update primary guardian
    if (body.guardianName) {
      const guardian = await prisma.guardian.findFirst({
        where: { studentId: id, isEmergency: true },
        orderBy: { createdAt: "asc" },
      });
      if (guardian) {
        await prisma.guardian.update({
          where: { id: guardian.id },
          data: {
            name:           body.guardianName      ?? undefined,
            relation:       body.guardianRelation  ?? undefined,
            phone:          body.guardianPhone     ?? undefined,
            whatsapp:       body.guardianWhatsapp  || body.guardianPhone || undefined,
            email:          body.guardianEmail     || null,
            cnic:           body.guardianCnic      || null,
            occupation:     body.guardianOccupation || null,
            receiveUpdates: body.receiveUpdates    ?? true,
          },
        });
      }
    }

    // Update or create secondary guardian
    if (body.guardian2Name && body.guardian2Phone) {
      const guardian2 = await prisma.guardian.findFirst({
        where: { studentId: id, isEmergency: false },
        orderBy: { createdAt: "asc" },
      });
      if (guardian2) {
        await prisma.guardian.update({
          where: { id: guardian2.id },
          data: {
            name:     body.guardian2Name,
            relation: body.guardian2Relation || "Guardian",
            phone:    body.guardian2Phone,
          },
        });
      } else {
        await prisma.guardian.create({
          data: {
            studentId:      id,
            name:           body.guardian2Name,
            relation:       body.guardian2Relation || "Guardian",
            phone:          body.guardian2Phone,
            isEmergency:    false,
            receiveUpdates: false,
          },
        });
      }
    }

    // Update student progress starting page if provided
    if (body.startingPage) {
      await prisma.studentProgress.updateMany({
        where: { studentId: id },
        data:  { currentPage: body.startingPage },
      });
    }

    return successResponse({ student: { id: student.id, name: student.name } });
  } catch (error) {
    console.error("Update student error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "withdraw";

    if (action === "withdraw") {
      await prisma.student.update({ where: { id }, data: { status: "WITHDRAWN" } });
      return successResponse({ message: "Student withdrawn successfully" });
    }

    if (action === "delete") {
      await prisma.student.delete({ where: { id } });
      return successResponse({ message: "Student deleted permanently" });
    }

    return errorResponse("Invalid action");
  } catch (error) {
    console.error("Delete student error:", error);
    return serverErrorResponse();
  }
}
