// app/api/admin/batches/[id]/route.ts
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

    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        ustadh: { include: { user: { select: { id: true, name: true, phone: true, email: true, whatsapp: true } } } },
        students: {
          include: {
            progress:     true,
            manzilHealth: { orderBy: { calculatedAt: "desc" }, take: 1 },
            lessonEntries:{ orderBy: { date: "desc" }, take: 1, select: { date: true, grade: true, lessonType: true } },
            guardians:    { take: 1, select: { name: true, phone: true } },
          },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!batch) return notFoundResponse("Batch not found");

    // Available students for this campus (not in any batch)
    const availableStudents = await prisma.student.findMany({
      where: {
        campusId: batch.campusId,
        status:   "ACTIVE",
        batchId:  null,
      },
      select: {
        id: true, name: true, enrollmentNumber: true, program: true,
        progress: { select: { currentJuz: true } },
      },
      orderBy: { name: "asc" },
    });

    // All asatidha for campus
    const asatidha = await prisma.ustadh.findMany({
      where:   { user: { campusId: batch.campusId, isActive: true } },
      include: { user: { select: { id: true, name: true } } },
    });

    return successResponse({ batch, availableStudents, asatidha });
  } catch (error) {
    console.error("Get batch error:", error);
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

    const batch = await prisma.batch.update({
      where: { id },
      data: {
        name:        body.name,
        program:     body.program,
        ustadhId:    body.ustadhId || null,
        sessionTime: body.sessionTime || null,
        maxStudents: body.maxStudents,
        isActive:    body.isActive !== undefined ? body.isActive : undefined,
      },
      include: {
        ustadh: { include: { user: { select: { name: true } } } },
      },
    });

    return successResponse({ batch });
  } catch (error) {
    console.error("Update batch error:", error);
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

    // Remove all students from batch first
    await prisma.student.updateMany({ where: { batchId: id }, data: { batchId: null } });

    // Deactivate batch (don't delete — preserve history)
    await prisma.batch.update({ where: { id }, data: { isActive: false } });

    return successResponse({ message: "Batch deactivated. Students moved to unassigned." });
  } catch (error) {
    console.error("Delete batch error:", error);
    return serverErrorResponse();
  }
}
