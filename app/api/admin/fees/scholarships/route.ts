// app/api/admin/fees/scholarships/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

const schema = z.object({
  studentId:   z.string(),
  name:        z.string().min(2),
  type:        z.enum(["FULL","PARTIAL_PERCENT","PARTIAL_AMOUNT"]),
  percentage:  z.number().min(0).max(100).optional(),
  fixedAmount: z.number().min(0).optional(),
  reason:      z.string().optional(),
  startDate:   z.string().optional(),
  endDate:     z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const scholarships = await prisma.scholarship.findMany({
      where:   { student: { campusId: payload.campusId || undefined } },
      orderBy: { createdAt: "desc" },
      include: {
        student:    { select: { id: true, name: true, enrollmentNumber: true, program: true } },
        grantedBy:  { select: { name: true } },
      },
    });

    const stats = {
      total:         scholarships.length,
      active:        scholarships.filter(s => s.isActive).length,
      full:          scholarships.filter(s => s.type === "FULL" && s.isActive).length,
      partial:       scholarships.filter(s => s.type !== "FULL" && s.isActive).length,
    };

    return successResponse({ scholarships, stats });
  } catch (error) {
    console.error("Get scholarships error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const body   = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;

    // Deactivate existing scholarship for this student if any
    await prisma.scholarship.updateMany({
      where: { studentId: data.studentId, isActive: true },
      data:  { isActive: false, endDate: new Date() },
    });

    const scholarship = await prisma.scholarship.create({
      data: {
        studentId:   data.studentId,
        name:        data.name,
        type:        data.type,
        percentage:  data.percentage || null,
        fixedAmount: data.fixedAmount || null,
        reason:      data.reason || null,
        startDate:   data.startDate ? new Date(data.startDate) : new Date(),
        endDate:     data.endDate   ? new Date(data.endDate)   : null,
        isActive:    true,
        grantedById: payload.userId,
      },
      include: {
        student:   { select: { name: true, enrollmentNumber: true } },
        grantedBy: { select: { name: true } },
      },
    });

    return successResponse({ scholarship }, 201);
  } catch (error) {
    console.error("Create scholarship error:", error);
    return serverErrorResponse();
  }
}
