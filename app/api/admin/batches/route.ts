// app/api/admin/batches/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

const createSchema = z.object({
  name:        z.string().min(2),
  program:     z.enum(["HIFZ","NAZRA","TAJWEED","GIRDAAN"]),
  ustadhId:    z.string().optional(),
  sessionTime: z.string().optional(),
  maxStudents: z.number().min(1).max(50).default(15),
  notes:       z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const batches = await prisma.batch.findMany({
      where:   { campusId: payload.campusId || undefined },
      orderBy: { name: "asc" },
      include: {
        ustadh: { include: { user: { select: { id: true, name: true, phone: true, email: true } } } },
        students: {
          where:   { status: "ACTIVE" },
          include: {
            progress:     { select: { currentJuz: true, percentComplete: true } },
            manzilHealth: { orderBy: { calculatedAt: "desc" }, take: 1 },
            lessonEntries:{ orderBy: { date: "desc" }, take: 1, select: { date: true } },
          },
        },
        _count: { select: { students: true } },
      },
    });

    // Calculate per-batch stats
    const batchesWithStats = batches.map(b => {
      const activeStudents = b.students.filter(s => s.status !== "WITHDRAWN");
      const withHealth     = activeStudents.filter(s => s.manzilHealth.length > 0);
      const avgHealth      = withHealth.length > 0
        ? Math.round(withHealth.reduce((acc, s) => acc + (s.manzilHealth[0]?.score || 0), 0) / withHealth.length)
        : null;
      const avgProgress    = activeStudents.length > 0
        ? Math.round(activeStudents.reduce((acc, s) => acc + (s.progress?.percentComplete || 0), 0) / activeStudents.length)
        : 0;
      const atRiskCount    = withHealth.filter(s => (s.manzilHealth[0]?.score || 100) < 60).length;
      const lastActivity   = activeStudents.reduce((latest, s) => {
        const last = s.lessonEntries[0]?.date;
        if (!last) return latest;
        return !latest || new Date(last) > new Date(latest) ? last : latest;
      }, null as string | null);

      return {
        id:          b.id,
        name:        b.name,
        program:     b.program,
        isActive:    b.isActive,
        sessionTime: b.sessionTime,
        maxStudents: b.maxStudents,
        ustadh:      b.ustadh ? { id: b.ustadh.id, name: b.ustadh.user.name, phone: b.ustadh.user.phone, email: b.ustadh.user.email } : null,
        studentCount:activeStudents.length,
        maxCapacity: b.maxStudents,
        avgHealth,
        avgProgress,
        atRiskCount,
        lastActivity,
        students:    activeStudents.map(s => ({
          id:              s.id,
          name:            s.name,
          currentJuz:      s.progress?.currentJuz ?? 1,
          percentComplete: Math.round(s.progress?.percentComplete ?? 0),
          manzilHealth:    s.manzilHealth[0]?.score ? Math.round(s.manzilHealth[0].score) : null,
        })),
      };
    });

    // Get available asatidha for assignment
    const asatidha = await prisma.ustadh.findMany({
      where:   { user: { campusId: payload.campusId || undefined, isActive: true } },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Get unassigned students
    const unassigned = await prisma.student.count({
      where: {
        campusId: payload.campusId || undefined,
        status:   "ACTIVE",
        batchId:  null,
      },
    });

    return successResponse({
      batches: batchesWithStats,
      asatidha: asatidha.map(u => ({ id: u.id, name: u.user.name, email: u.user.email })),
      stats: {
        total:      batches.length,
        active:     batches.filter(b => b.isActive).length,
        unassigned,
        totalStudents: batches.reduce((acc, b) => acc + b.students.filter(s => s.status !== "WITHDRAWN").length, 0),
      },
    });
  } catch (error) {
    console.error("Get batches error:", error);
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
    const result = createSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const data  = result.data;
    const batch = await prisma.batch.create({
      data: {
        campusId:    payload.campusId,
        name:        data.name,
        program:     data.program,
        ustadhId:    data.ustadhId || null,
        sessionTime: data.sessionTime || null,
        maxStudents: data.maxStudents,
        isActive:    true,
      },
      include: {
        ustadh: { include: { user: { select: { name: true } } } },
      },
    });

    return successResponse({ batch }, 201);
  } catch (error) {
    console.error("Create batch error:", error);
    return serverErrorResponse();
  }
}
