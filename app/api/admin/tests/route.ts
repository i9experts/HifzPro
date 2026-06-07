// app/api/admin/tests/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

async function getCampusId(userId: string, jwtCampusId?: string | null) {
  if (jwtCampusId) return jwtCampusId;
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { campusId: true } });
  return u?.campusId ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const campusId = await getCampusId(payload.userId, payload.campusId);

    const tests = await prisma.testRecord.findMany({
      where:   { student: { campusId: campusId || undefined } },
      orderBy: { date: "desc" },
      take:    200,
      include: {
        student:  { select: { id:true, name:true, enrollmentNumber:true, photo:true } },
        examiner: { include: { user: { select: { name:true } } } },
      },
    });

    const total   = tests.length;
    const passed  = tests.filter(t => t.result === "PASS").length;
    const failed  = tests.filter(t => t.result === "FAIL").length;
    const scored  = tests.filter(t => t.score != null);
    const avgScore= scored.length > 0
      ? scored.reduce((acc,t) => acc + (t.score||0), 0) / scored.length
      : null;

    return successResponse({
      tests,
      stats: { total, passed, failed, conditional: total-passed-failed, avgScore },
    });
  } catch (error) {
    console.error("Admin tests error:", error);
    return serverErrorResponse();
  }
}
