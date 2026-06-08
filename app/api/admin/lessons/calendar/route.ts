// app/api/admin/lessons/calendar/route.ts
// Returns a map of { "YYYY-MM-DD": lessonCount } for a date range
// Used by the Hijri calendar to show lesson activity dots

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN", "SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to   = searchParams.get("to");

    if (!from || !to) return successResponse({});

    const fromDate = new Date(from);
    const toDate   = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const entries = await prisma.lessonEntry.findMany({
      where: {
        date:   { gte: fromDate, lte: toDate },
        student: { campusId: payload.campusId || undefined },
      },
      select: { date: true },
    });

    // Group by date string
    const map: Record<string, number> = {};
    for (const e of entries) {
      const key = e.date.toISOString().split("T")[0];
      map[key] = (map[key] || 0) + 1;
    }

    return successResponse(map);
  } catch (error) {
    console.error("Lessons calendar error:", error);
    return serverErrorResponse();
  }
}
