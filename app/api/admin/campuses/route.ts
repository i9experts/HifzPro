// app/api/admin/campuses/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

const schema = z.object({
  name:        z.string().min(2),
  nameArabic:  z.string().optional(),
  address:     z.string().optional(),
  city:        z.string().optional(),
  phone:       z.string().optional(),
  sessionTime: z.string().optional(),
});

async function getInstitutionId(userId: string, jwtId?: string) {
  if (jwtId) return jwtId;
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { institutionId: true } });
  return u?.institutionId ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const institutionId = await getInstitutionId(payload.userId, payload.institutionId);
    if (!institutionId) return errorResponse("Institution not found");

    const campuses = await prisma.campus.findMany({
      where:   { institutionId },
      orderBy: { createdAt: "asc" },
      include: {
        batches:  { where: { isActive:true }, select: { id:true, name:true, program:true, _count:{ select:{ students:{ where:{ status:"ACTIVE" } } } } } },
        students: { where: { status:"ACTIVE" }, select: { id:true } },
        users:    { where: { role:"USTADH", isActive:true }, select: { id:true, name:true } },
        _count:   { select: { students:{ where:{ status:"ACTIVE" } }, batches:{ where:{ isActive:true } } } },
      },
    });

    // Stats per campus
    const campusStats = await Promise.all(campuses.map(async c => {
      const now      = new Date(); now.setDate(now.getDate()-7);
      const [weekLessons, totalLessons] = await Promise.all([
        prisma.lessonEntry.count({ where: { student:{ campusId:c.id }, date:{ gte:now } } }).catch(()=>0),
        prisma.lessonEntry.count({ where: { student:{ campusId:c.id } } }).catch(()=>0),
      ]);
      return { campusId:c.id, weekLessons, totalLessons };
    }));

    const statsMap = Object.fromEntries(campusStats.map(s => [s.campusId, s]));

    return successResponse({
      campuses: campuses.map(c => ({
        ...c,
        weekLessons:  statsMap[c.id]?.weekLessons  || 0,
        totalLessons: statsMap[c.id]?.totalLessons || 0,
      })),
      count: campuses.length,
    });
  } catch (error) {
    console.error("Get campuses error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const institutionId = await getInstitutionId(payload.userId, payload.institutionId);
    if (!institutionId) return errorResponse("Institution not found");

    const body   = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const campus = await prisma.campus.create({
      data: { ...result.data, institutionId, isActive: true },
    });

    return successResponse({ campus }, 201);
  } catch (error) {
    console.error("Create campus error:", error);
    return serverErrorResponse();
  }
}
