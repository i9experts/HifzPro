// app/api/admin/campuses/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    verifyToken(token);

    const { id } = await params;

    const campus = await prisma.campus.findUnique({
      where: { id },
      include: {
        institution: { select: { name:true, logo:true } },
        batches: {
          where: { isActive:true },
          include: {
            ustadh: { include: { user: { select:{ name:true } } } },
            _count: { select: { students:{ where:{ status:"ACTIVE" } } } },
          },
        },
        students: {
          where:   { status:"ACTIVE" },
          orderBy: { name:"asc" },
          include: { progress: { select:{ currentJuz:true, percentComplete:true } }, batch: { select:{ name:true } } },
        },
        users: { where:{ role:"USTADH", isActive:true }, select:{ id:true, name:true, email:true } },
      },
    });

    if (!campus) return notFoundResponse("Campus not found");

    // Lesson activity
    const now7 = new Date(); now7.setDate(now7.getDate()-7);
    const [weekLessons, monthLessons] = await Promise.all([
      prisma.lessonEntry.count({ where:{ student:{ campusId:id }, date:{ gte:now7 } } }).catch(()=>0),
      prisma.lessonEntry.count({ where:{ student:{ campusId:id }, date:{ gte:new Date(new Date().setDate(1)) } } }).catch(()=>0),
    ]);

    return successResponse({ campus, stats:{ weekLessons, monthLessons } });
  } catch (error) {
    console.error("Get campus error:", error);
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

    const campus = await prisma.campus.update({
      where: { id },
      data: {
        name:        body.name,
        address:     body.address,
        city:        body.city,
        phone:       body.phone,
        isActive:    body.isActive,
      },
    });

    return successResponse({ campus });
  } catch (error) {
    console.error("Update campus error:", error);
    return serverErrorResponse();
  }
}
