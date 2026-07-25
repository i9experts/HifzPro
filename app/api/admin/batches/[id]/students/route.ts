// app/api/admin/batches/[id]/students/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api";
import { canAccessCampus } from "@/lib/tenant-guard";

type Params = { params: Promise<{ id: string }> };

// Add student to batch
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { id: batchId } = await params;
    const { studentId }   = await req.json();

    if (!studentId) return errorResponse("studentId required");

    // Check batch capacity
    const batch = await prisma.batch.findUnique({
      where:   { id: batchId },
      include: {
        _count: { select: { students: { where: { status: "ACTIVE" } } } },
        campus: { select: { institutionId: true } },
      },
    });
    if (!batch) return notFoundResponse("Batch not found");

    // ── TENANT ISOLATION: batch must belong to the admin's own campus/institution ──
    if (!canAccessCampus(payload, batch.campusId, batch.campus?.institutionId)) {
      return notFoundResponse("Batch not found");
    }

    // ── TENANT ISOLATION: the student being added must belong to the SAME campus as the batch —
    //    otherwise a campus admin could move another institution's student into their own batch ──
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { campusId: true } });
    if (!student) return notFoundResponse("Student not found");
    if (student.campusId !== batch.campusId) {
      return errorResponse("This student belongs to a different campus and cannot be added to this batch.");
    }

    if (batch._count.students >= batch.maxStudents) {
      return errorResponse(`Batch is full (${batch.maxStudents} students maximum)`);
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data:  { batchId },
      select:{ id: true, name: true, enrollmentNumber: true },
    });

    return successResponse({ student: updated, message: `${updated.name} added to ${batch.name}` });
  } catch (error) {
    console.error("Add student to batch error:", error);
    return serverErrorResponse();
  }
}

// Remove student from batch
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { id: batchId }  = await params;
    const { searchParams } = new URL(req.url);
    const studentId        = searchParams.get("studentId");

    if (!studentId) return errorResponse("studentId required");

    // ── TENANT ISOLATION ──
    const batch = await prisma.batch.findUnique({
      where:   { id: batchId },
      select:  { campusId: true, campus: { select: { institutionId: true } } },
    });
    if (!batch) return notFoundResponse("Batch not found");
    if (!canAccessCampus(payload, batch.campusId, batch.campus?.institutionId)) {
      return notFoundResponse("Batch not found");
    }

    const student = await prisma.student.update({
      where: { id: studentId, batchId },
      data:  { batchId: null },
      select:{ id: true, name: true },
    });

    return successResponse({ student, message: `${student.name} removed from batch` });
  } catch (error) {
    console.error("Remove student from batch error:", error);
    return serverErrorResponse();
  }
}

// Assign ustadh to batch
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { id: batchId } = await params;
    const { ustadhId }    = await req.json();

    // ── TENANT ISOLATION ──
    const existingBatch = await prisma.batch.findUnique({
      where:  { id: batchId },
      select: { campusId: true, campus: { select: { institutionId: true } } },
    });
    if (!existingBatch) return notFoundResponse("Batch not found");
    if (!canAccessCampus(payload, existingBatch.campusId, existingBatch.campus?.institutionId)) {
      return notFoundResponse("Batch not found");
    }

    // ── The ustadh being assigned must also belong to this same campus ──
    if (ustadhId) {
      const ustadh = await prisma.ustadh.findUnique({ where: { id: ustadhId }, select: { user: { select: { campusId: true } } } });
      if (!ustadh || ustadh.user?.campusId !== existingBatch.campusId) {
        return errorResponse("This Ustadh does not belong to the same campus as this batch.");
      }
    }

    const batch = await prisma.batch.update({
      where:   { id: batchId },
      data:    { ustadhId: ustadhId || null },
      include: { ustadh: { include: { user: { select: { name: true } } } } },
    });

    return successResponse({ batch });
  } catch (error) {
    console.error("Assign ustadh error:", error);
    return serverErrorResponse();
  }
}
