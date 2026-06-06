// app/api/admin/mutashabihat/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

async function getCampusId(userId: string, jwtCampusId?: string) {
  if (jwtCampusId) return jwtCampusId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { campusId: true } });
  return user?.campusId ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const campusId = await getCampusId(payload.userId, payload.campusId);

    // Get all student confusions
    const confusions = await prisma.studentMutashabihat.findMany({
      where: { student: { campusId: campusId || undefined } },
      include: {
        student: {
          select: {
            id: true, name: true, enrollmentNumber: true, photo: true,
            batch: { select: { name: true } },
          },
        },
      },
      orderBy: { lastConfusedAt: "desc" },
    });

    // Per-student stats
    const studentMap: Record<string, {
      id:string; name:string; enrollmentNumber:string; batchName:string;
      total:number; unresolved:number; critical:number; avgPriority:number;
    }> = {};

    confusions.forEach(c => {
      const sid = c.studentId;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          id:               c.student.id,
          name:             c.student.name,
          enrollmentNumber: c.student.enrollmentNumber || "",
          batchName:        c.student.batch?.name || "—",
          total:0, unresolved:0, critical:0, avgPriority:0,
        };
      }
      studentMap[sid].total++;
      if (!c.isResolved) {
        studentMap[sid].unresolved++;
        if (c.priority >= 70) studentMap[sid].critical++;
      }
    });

    const studentStats = Object.values(studentMap)
      .sort((a, b) => b.unresolved - a.unresolved);

    // Most confused pairs (pair ID → count)
    const pairCounts: Record<string, { pairId:string; count:number; text:string }> = {};
    confusions.forEach(c => {
      if (c.pairId) {
        if (!pairCounts[c.pairId]) pairCounts[c.pairId] = { pairId: c.pairId, count:0, text: `${c.correctSurah}:${c.correctAyah} ↔ ${c.confusedWithSurah}:${c.confusedWithAyah}` };
        pairCounts[c.pairId].count++;
      }
    });
    const topPairs = Object.values(pairCounts).sort((a,b) => b.count - a.count).slice(0, 10);

    // Most confused Juz combinations
    const juzMap: Record<string, number> = {};
    confusions.forEach(c => {
      if (!c.isResolved) {
        const key = [c.correctJuz, c.confusedWithJuz].sort().join("↔");
        juzMap[key] = (juzMap[key] || 0) + 1;
      }
    });
    const juzConfusions = Object.entries(juzMap).map(([k, v]) => ({ pair: k, count: v })).sort((a,b) => b.count - a.count).slice(0, 5);

    // Critical unresolved
    const critical = confusions.filter(c => !c.isResolved && c.priority >= 70);

    // Snapshot
    const totalConfusions = confusions.length;
    const unresolved      = confusions.filter(c => !c.isResolved).length;
    const resolved        = confusions.filter(c => c.isResolved).length;
    const resolutionRate  = totalConfusions > 0 ? Math.round((resolved / totalConfusions) * 100) : 0;

    // Recent confusions (last 7 days)
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const recentCount = confusions.filter(c => new Date(c.createdAt) >= weekAgo).length;

    return successResponse({
      snapshot: { totalConfusions, unresolved, resolved, resolutionRate, criticalCount: critical.length, recentCount },
      studentStats,
      topPairs,
      juzConfusions,
      recentConfusions: confusions.slice(0, 15),
    });
  } catch (error) {
    console.error("Mutashabihat admin error:", error);
    return serverErrorResponse();
  }
}
