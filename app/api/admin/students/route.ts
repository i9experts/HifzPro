// app/api/admin/students/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const search  = searchParams.get("search") || "";
    const program = searchParams.get("program") || "";
    const status  = searchParams.get("status") || "";
    const batchId = searchParams.get("batchId") || "";
    const health  = searchParams.get("health") || "";
    const page    = parseInt(searchParams.get("page") || "1");
    const limit   = parseInt(searchParams.get("limit") || "20");
    const skip    = (page - 1) * limit;

    const where: any = { campusId: payload.campusId || undefined };
    if (search) where.OR = [
      { name:             { contains: search, mode: "insensitive" } },
      { enrollmentNumber: { contains: search, mode: "insensitive" } },
    ];
    if (program) where.program = program;
    if (status)  where.status  = status;
    if (batchId) where.batchId = batchId;

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where, skip, take: limit, orderBy: { enrolledAt: "desc" },
        include: {
          batch:         { select: { id: true, name: true } },
          guardians:     { take: 1, select: { name: true, phone: true, whatsapp: true, relation: true } },
          progress:      true,
          manzilHealth:  { orderBy: { calculatedAt: "desc" }, take: 1 },
          lessonEntries: { orderBy: { date: "desc" }, take: 1, select: { date: true, grade: true, lessonType: true } },
          _count:        { select: { lessonEntries: true } },
        },
      }),
    ]);

    let result = students.map(s => ({
      id: s.id, name: s.name, nameArabic: s.nameArabic,
      enrollmentNumber: s.enrollmentNumber, program: s.program,
      status: s.status, enrolledAt: s.enrolledAt, photo: s.photo,
      batch: s.batch, guardian: s.guardians[0] || null,
      progress: s.progress, manzilHealth: s.manzilHealth[0]?.score ?? null,
      lastLesson: s.lessonEntries[0] || null, totalLessons: s._count.lessonEntries,
    }));

    if (health === "at_risk") result = result.filter(s => (s.manzilHealth ?? 100) < 60);
    if (health === "good")    result = result.filter(s => (s.manzilHealth ?? 0) >= 75);

    const statGroups = await prisma.student.groupBy({
      by: ["status"], where: { campusId: payload.campusId || undefined }, _count: true,
    });

    const atRisk = await prisma.manzilHealth.count({
      where: { score: { lt: 60 }, student: { campusId: payload.campusId || undefined, status: "ACTIVE" } },
    });

    return successResponse({
      students: result,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      stats: {
        total,
        active:    statGroups.find(s => s.status === "ACTIVE")?._count    || 0,
        completed: statGroups.find(s => s.status === "COMPLETED")?._count  || 0,
        onLeave:   statGroups.find(s => s.status === "ON_LEAVE")?._count   || 0,
        atRisk,
      },
    });
  } catch (error) {
    console.error("Get students error:", error);
    return serverErrorResponse();
  }
}

const createSchema = z.object({
  name: z.string().min(2), nameArabic: z.string().optional(),
  dateOfBirth: z.string().optional(), gender: z.string().optional(),
  bloodGroup: z.string().optional(), medicalNotes: z.string().optional(),
  address: z.string().optional(), city: z.string().optional(),
  transport: z.string().optional(), hostel: z.boolean().optional(),
  previousInstitution: z.string().optional(), specialNeeds: z.string().optional(),
  program: z.enum(["HIFZ","NAZRA","TAJWEED","GIRDAAN"]),
  batchId: z.string().optional(), enrolledAt: z.string().optional(),
  expectedKhatmAt: z.string().optional(),
  startingJuz: z.number().optional(), startingSurah: z.number().optional(),
  startingAyah: z.number().optional(), startingPage: z.number().optional(),
  previousHifzJuz: z.number().optional(),
  guardianName: z.string().min(2), guardianRelation: z.string(),
  guardianCnic: z.string().optional(), guardianPhone: z.string().min(10),
  guardianWhatsapp: z.string().optional(), guardianEmail: z.string().optional(),
  guardianOccupation: z.string().optional(), guardianAddress: z.string().optional(),
  receiveUpdates: z.boolean().optional(),
  guardian2Name: z.string().optional(), guardian2Relation: z.string().optional(),
  guardian2Phone: z.string().optional(),
  feeStructureId: z.string().optional(),
  scholarshipAmount: z.number().optional(), notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    // ── FIX 1: resolve campusId safely — never use ! non-null assertion ──
    const campusId = payload.campusId ?? null;
    if (!campusId) {
      return errorResponse("Campus not assigned to your account. Please contact your administrator.");
    }

    // ── FIX 2: resolve institutionId safely ──
    const institutionId = payload.institutionId ?? null;
    if (!institutionId) {
      return errorResponse("Institution not found in your session. Please sign out and sign in again.");
    }

    const body = await req.json();
    const result = createSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.errors[0].message);
    }
    const data = result.data;

    // ── Enrollment number: use institutionId scope to avoid duplicates across campuses ──
    const count = await prisma.student.count({
      where: { campus: { institutionId } },
    });
    const year             = new Date().getFullYear().toString().slice(-2);
    const enrollmentNumber = `HP-${year}-${String(count + 1).padStart(4, "0")}`;

    const student = await prisma.$transaction(async (tx) => {

      // 1. Create student
      const s = await tx.student.create({
        data: {
          campusId,
          batchId:         data.batchId || null,
          enrollmentNumber,
          name:            data.name,
          nameArabic:      data.nameArabic     || null,
          program:         data.program,
          status:          "ACTIVE",
          enrolledAt:      data.enrolledAt     ? new Date(data.enrolledAt)     : new Date(),
          expectedKhatmAt: data.expectedKhatmAt ? new Date(data.expectedKhatmAt) : null,
          dateOfBirth:     data.dateOfBirth    ? new Date(data.dateOfBirth)    : null,
          startingJuz:     data.startingJuz    ?? 1,
          startingSurah:   data.startingSurah  ?? null,
          startingAyah:    data.startingAyah   ?? null,
        },
      });

      // 2. Create primary guardian
      const guardian = await tx.guardian.create({
        data: {
          studentId:      s.id,
          name:           data.guardianName,
          relation:       data.guardianRelation,
          cnic:           data.guardianCnic           || null,
          phone:          data.guardianPhone,
          whatsapp:       data.guardianWhatsapp        || data.guardianPhone,
          email:          data.guardianEmail           || null,
          isEmergency:    true,
          receiveUpdates: data.receiveUpdates          ?? true,
        },
      });

      // 3. Optional secondary guardian
      if (data.guardian2Name && data.guardian2Phone) {
        await tx.guardian.create({
          data: {
            studentId:      s.id,
            name:           data.guardian2Name,
            relation:       data.guardian2Relation || "Guardian",
            phone:          data.guardian2Phone,
            isEmergency:    false,
            receiveUpdates: false,
          },
        });
      }

      // 4. Create student progress
      // ── FIX 3: percentComplete starts at 0 for new students.
      //    previousHifzJuz is prior memorization BEFORE joining —
      //    it is stored for context but does NOT count toward current progress.
      //    Progress is derived from lesson entries (getMemorizedJuzSet).
      await tx.studentProgress.create({
        data: {
          studentId:         s.id,
          currentJuz:        data.startingJuz   ?? 1,
          currentSurah:      data.startingSurah ?? null,
          currentAyah:       data.startingAyah  ?? null,
          currentPage:       data.startingPage   ?? null,
          totalJuzMemorized: 0,   // starts at 0; updated as lessons are recorded
          percentComplete:   0,   // starts at 0; derived from lesson entries
        },
      });

      // 5. Initial manzil health entry
      await tx.manzilHealth.create({
        data: { studentId: s.id, score: 100 },
      });

      // 6. Create parent portal user — only if phone not already registered
      const phone = data.guardianWhatsapp || data.guardianPhone;
      if (phone) {
        const existing = await tx.user.findFirst({
          where: { OR: [{ phone }, { whatsapp: phone }] },
        });

        if (!existing) {
          const parentUser = await tx.user.create({
            data: {
              institutionId, // ── FIX 2: guaranteed non-null above
              campusId,      // ── FIX 1: guaranteed non-null above
              role:      "PARENT",
              name:      data.guardianName,
              phone,
              whatsapp:  phone,
            },
          });

          await tx.parent.create({
            data: {
              userId:     parentUser.id,
              guardianId: guardian.id,
            },
          });
        }
      }

      return s;
    });

    return successResponse(
      {
        student: {
          id:               student.id,
          enrollmentNumber: student.enrollmentNumber,
          name:             student.name,
        },
      },
      201,
    );

  } catch (error: any) {
    console.error("Create student error:", error);

    // ── Surface useful Prisma errors to help debug without exposing internals ──
    if (error?.code === "P2002") {
      return errorResponse("A student with this enrollment number already exists. Please try again.");
    }
    if (error?.code === "P2003") {
      return errorResponse("Invalid batch or campus reference. Please check the enrollment details.");
    }

    return serverErrorResponse();
  }
}
