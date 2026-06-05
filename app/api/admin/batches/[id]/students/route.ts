// app/api/admin/batches/[id]/students/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

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
      include: { _count: { select: { students: { where: { status: "ACTIVE" } } } } },
    });
    if (!batch) return errorResponse("Batch not found");
    if (batch._count.students >= batch.maxStudents) {
      return errorResponse(`Batch is full (${batch.maxStudents} students maximum)`);
    }

    const student = await prisma.student.update({
      where: { id: studentId },
      data:  { batchId },
      select:{ id: true, name: true, enrollmentNumber: true },
    });

    return successResponse({ student, message: `${student.name} added to ${batch.name}` });
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
