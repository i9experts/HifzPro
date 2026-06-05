// app/api/admin/fees/structures/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

const schema = z.object({
  name:        z.string().min(2),
  program:     z.enum(["HIFZ","NAZRA","TAJWEED","GIRDAAN"]).optional(),
  amount:      z.number().min(0),
  frequency:   z.enum(["MONTHLY","QUARTERLY","ANNUAL","ONE_TIME"]).default("MONTHLY"),
  feeType:     z.enum(["TUITION","REGISTRATION","TRANSPORT","HOSTEL","EXAM","BOOKS","OTHER"]).default("TUITION"),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const structures = await prisma.feeStructure.findMany({
      where:   { campusId: payload.campusId || undefined, isActive: true },
      orderBy: { program: "asc" },
    });

    return successResponse({ structures });
  } catch (error) {
    console.error("Get fee structures error:", error);
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
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const structure = await prisma.feeStructure.create({
      data: { ...result.data, campusId: payload.campusId },
    });

    return successResponse({ structure }, 201);
  } catch (error) {
    console.error("Create fee structure error:", error);
    return serverErrorResponse();
  }
}
