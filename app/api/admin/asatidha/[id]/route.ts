// app/api/admin/asatidha/[id]/route.ts
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
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

    const ustadh = await prisma.ustadh.findUnique({
      where: { id },
      include: {
        user: true,
        batches: {
          include: {
            students: {
              where:   { status: "ACTIVE" },
              include: {
                progress:     { select: { currentJuz: true, percentComplete: true } },
                manzilHealth: { orderBy: { calculatedAt: "desc" }, take: 1 },
                lessonEntries:{ orderBy: { date: "desc" }, take: 1, select: { date: true, grade: true } },
              },
            },
          },
        },
        lessonEntries: {
          orderBy: { date: "desc" },
          take:    50,
          select:  { date: true, grade: true, lessonType: true, student: { select: { name: true } } },
        },
      },
    });

    if (!ustadh) return notFoundResponse("Ustadh not found");

    // Performance metrics
    const now      = new Date();
    const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);
    const weekAgo  = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);

    const gradeScores: Record<string,number> = { EXCELLENT:100, GOOD:75, WEAK:40, REPEAT:10 };
    const graded = ustadh.lessonEntries.filter(e => e.grade);
    const avgGrade = graded.length > 0
      ? Math.round(graded.reduce((acc, e) => acc + (gradeScores[e.grade!] || 50), 0) / graded.length)
      : null;

    const weekLessons  = ustadh.lessonEntries.filter(e => new Date(e.date) >= weekAgo).length;
    const monthLessons = ustadh.lessonEntries.filter(e => new Date(e.date) >= monthAgo).length;

    const totalStudents = ustadh.batches.reduce((acc, b) => acc + b.students.length, 0);
    const allStudents   = ustadh.batches.flatMap(b => b.students);
    const withHealth    = allStudents.filter(s => s.manzilHealth.length > 0);
    const avgHealth     = withHealth.length > 0
      ? Math.round(withHealth.reduce((acc, s) => acc + s.manzilHealth[0].score, 0) / withHealth.length)
      : null;
    const atRiskCount   = withHealth.filter(s => s.manzilHealth[0].score < 60).length;

    return successResponse({
      ustadh: {
        ...ustadh,
        user: { ...ustadh.user, password: undefined },
        performance: {
          weekLessons, monthLessons, avgGrade, avgHealth,
          totalStudents, atRiskCount,
        },
      },
    });
  } catch (error) {
    console.error("Get ustadh error:", error);
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

    const ustadh = await prisma.ustadh.findUnique({ where: { id }, select: { userId: true } });
    if (!ustadh) return notFoundResponse("Ustadh not found");

    // Update user record
    const updateData: any = {};
    if (body.name)      updateData.name      = body.name;
    if (body.phone)     updateData.phone     = body.phone;
    if (body.whatsapp)  updateData.whatsapp  = body.whatsapp;
    if (body.photo)     updateData.photo     = body.photo;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.newPassword && body.newPassword.length >= 6) {
      updateData.password = await bcrypt.hash(body.newPassword, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: ustadh.userId },
      data:  updateData,
      select:{ id: true, name: true, email: true, phone: true, whatsapp: true, isActive: true },
    });

    return successResponse({ user: updatedUser });
  } catch (error) {
    console.error("Update ustadh error:", error);
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
    const ustadh = await prisma.ustadh.findUnique({ where: { id }, select: { userId: true } });
    if (!ustadh) return notFoundResponse("Ustadh not found");

    // Deactivate — never hard delete
    await prisma.user.update({ where: { id: ustadh.userId }, data: { isActive: false } });
    // Unassign from all batches
    await prisma.batch.updateMany({ where: { ustadhId: id }, data: { ustadhId: null } });

    return successResponse({ message: "Ustadh deactivated. Batches unassigned." });
  } catch (error) {
    console.error("Deactivate ustadh error:", error);
    return serverErrorResponse();
  }
}
