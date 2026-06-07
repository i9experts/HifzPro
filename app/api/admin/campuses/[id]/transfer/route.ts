// app/api/admin/campuses/[id]/transfer/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({
  studentId:      z.string(),
  toCampusId:     z.string(),
  toBatchId:      z.string().optional(),
  reason:         z.string().optional(),
  effectiveDate:  z.string().optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { id: fromCampusId } = await params;
    const body   = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;

    // Validate student is in the from campus
    const student = await prisma.student.findUnique({
      where:  { id: data.studentId },
      select: { id:true, name:true, campusId:true, batchId:true },
    });
    if (!student) return errorResponse("Student not found");
    if (student.campusId !== fromCampusId) return errorResponse("Student is not in this campus");

    // Validate destination campus exists in same institution
    const [fromCampus, toCampus] = await Promise.all([
      prisma.campus.findUnique({ where:{ id:fromCampusId }, select:{ institutionId:true } }),
      prisma.campus.findUnique({ where:{ id:data.toCampusId }, select:{ institutionId:true, name:true } }),
    ]);
    if (!fromCampus || !toCampus) return errorResponse("Campus not found");
    if (fromCampus.institutionId !== toCampus.institutionId) return errorResponse("Cannot transfer to a different institution");

    // Transfer student
    const updated = await prisma.student.update({
      where: { id: data.studentId },
      data: {
        campusId: data.toCampusId,
        batchId:  data.toBatchId || null,
      },
      include: {
        campus: { select: { name:true } },
        batch:  { select: { name:true } },
      },
    });

    return successResponse({
      student:      updated,
      transferredTo:toCampus.name,
      message:      `${student.name} successfully transferred to ${toCampus.name}`,
    });
  } catch (error) {
    console.error("Transfer student error:", error);
    return serverErrorResponse();
  }
}
