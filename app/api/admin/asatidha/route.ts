// app/api/admin/asatidha/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

const createSchema = z.object({
  // Account
  name:           z.string().min(2),
  email:          z.string().email(),
  password:       z.string().min(6),
  phone:          z.string().optional(),
  whatsapp:       z.string().optional(),
  // Profile
  nameArabic:     z.string().optional(),
  specialization: z.string().optional(),
  qualifications: z.array(z.string()).optional(),
  experience:     z.number().min(0).optional(),
  joiningDate:    z.string().optional(),
  bio:            z.string().optional(),
  photo:          z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const now      = new Date();
    const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);

    const asatidha = await prisma.ustadh.findMany({
      where: { user: { campusId: payload.campusId || undefined, isActive: true } },
      include: {
        user: {
          select: {
            id: true, name: true, email: true, phone: true,
            whatsapp: true, photo: true, isActive: true, createdAt: true,
          },
        },
        batches: {
          where:   { isActive: true },
          select:  { id: true, name: true, program: true, _count: { select: { students: { where: { status: "ACTIVE" } } } } },
        },
        lessonEntries: {
          where:  { date: { gte: monthAgo } },
          select: { grade: true, date: true },
        },
      },
      orderBy: { user: { name: "asc" } },
    });

    // Calculate per-Ustadh stats
    const asatidhaWithStats = await Promise.all(asatidha.map(async u => {
      const totalStudents = u.batches.reduce((acc, b) => acc + b._count.students, 0);
      const gradeScores: Record<string,number> = { EXCELLENT:100, GOOD:75, WEAK:40, REPEAT:10 };
      const graded    = u.lessonEntries.filter(e => e.grade);
      const avgGrade  = graded.length > 0
        ? Math.round(graded.reduce((acc, e) => acc + (gradeScores[e.grade!] || 50), 0) / graded.length)
        : null;

      // Get avg student health across their batches
      const studentIds = await prisma.student.findMany({
        where:  { batch: { ustadhId: u.id }, status: "ACTIVE" },
        select: { id: true },
      });
      let avgHealth: number | null = null;
      if (studentIds.length > 0) {
        const healths = await prisma.manzilHealth.findMany({
          where:   { studentId: { in: studentIds.map(s => s.id) } },
          orderBy: { calculatedAt: "desc" },
          distinct: ["studentId"],
          select:  { score: true },
        });
        if (healths.length > 0) {
          avgHealth = Math.round(healths.reduce((acc, h) => acc + h.score, 0) / healths.length);
        }
      }

      return {
        id:             u.id,
        userId:         u.user.id,
        name:           u.user.name,
        email:          u.user.email,
        phone:          u.user.phone,
        whatsapp:       u.user.whatsapp,
        photo:          u.user.photo,
        isActive:       u.user.isActive,
        createdAt:      u.user.createdAt,
        qualifications: (u as any).qualifications || [],
        specialization: (u as any).specialization || null,
        experience:     (u as any).experience || null,
        joiningDate:    (u as any).joiningDate || null,
        bio:            (u as any).bio || null,
        nameArabic:     (u as any).nameArabic || null,
        batches:        u.batches,
        stats: {
          totalBatches:        u.batches.length,
          totalStudents,
          lessonsThisMonth:    u.lessonEntries.length,
          avgGrade,
          avgStudentHealth:    avgHealth,
        },
      };
    }));

    // Overall stats
    const totalUstadh       = asatidhaWithStats.length;
    const unassigned        = asatidhaWithStats.filter(u => u.batches.length === 0).length;
    const totalStudentsCovered = asatidhaWithStats.reduce((acc, u) => acc + u.stats.totalStudents, 0);

    return successResponse({
      asatidha: asatidhaWithStats,
      stats: { totalUstadh, unassigned, totalStudentsCovered },
    });
  } catch (error) {
    console.error("Get asatidha error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();
    if (!payload.campusId) return errorResponse("Campus not found");

    const body   = await req.json();
    const result = createSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;

    // Check email is unique
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return errorResponse("An account with this email already exists");

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user + ustadh in transaction
    const ustadh = await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          name:      data.name,
          email:     data.email,
          password:  hashedPassword,
          phone:     data.phone || null,
          whatsapp:  data.whatsapp || null,
          photo:     data.photo || null,
          role:      "USTADH",
          campusId:  payload.campusId!,
          isActive:  true,
        },
      });

      const ustadh = await tx.ustadh.create({
        data: {
          userId: user.id,
          // Store extra fields in a notes-like field or directly if schema supports
        },
        include: { user: { select: { id: true, name: true, email: true } } },
      });

      return ustadh;
    });

    return successResponse({ ustadh }, 201);
  } catch (error: any) {
    if (error.code === "P2002") return errorResponse("Email already exists");
    console.error("Create ustadh error:", error);
    return serverErrorResponse();
  }
}
