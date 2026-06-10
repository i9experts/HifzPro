// app/api/admin/notifications/route.ts
// POST — broadcast push notification with audience targeting
// GET  — notification history for this institution
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import { sendPushToUsers } from "@/lib/push";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload?.institutionId || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const notifications = await prisma.notification.findMany({
      where:   { institutionId: payload.institutionId },
      orderBy: { createdAt: "desc" },
      take:    30,
      include: { sentBy: { select: { name: true } } },
    });

    // Subscriber stats
    const parentUsers = await prisma.user.findMany({
      where:  { institutionId: payload.institutionId, role: "PARENT", isActive: true },
      select: { id: true },
    });
    const subscribedCount = await prisma.pushSubscription.groupBy({
      by:    ["userId"],
      where: { userId: { in: parentUsers.map(u => u.id) } },
    });

    return successResponse({
      notifications,
      stats: {
        totalParents:      parentUsers.length,
        subscribedParents: subscribedCount.length,
      },
    });
  } catch (error) {
    console.error("[notifications GET]", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload?.institutionId || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const body = await req.json();
    const { title, message, url, audience, batchId, program } = body;

    if (!title?.trim() || !message?.trim()) return errorResponse("Title and message are required");
    if (title.length > 80)   return errorResponse("Title too long (max 80 chars)");
    if (message.length > 300) return errorResponse("Message too long (max 300 chars)");

    // ── Resolve audience to parent userIds ──
    let targetUserIds: string[] = [];
    let audienceLabel = "All Parents";

    if (audience === "BATCH" && batchId) {
      // Parents of students in a specific batch
      const parents = await prisma.parent.findMany({
        where:  { guardian: { student: { batchId } }, user: { institutionId: payload.institutionId } },
        select: { userId: true },
      });
      targetUserIds = parents.map(p => p.userId);
      const batch = await prisma.batch.findUnique({ where: { id: batchId }, select: { name: true } });
      audienceLabel = `Batch: ${batch?.name || batchId}`;
    } else if (audience === "PROGRAM" && program) {
      const parents = await prisma.parent.findMany({
        where:  { guardian: { student: { program, status: "ACTIVE" } }, user: { institutionId: payload.institutionId } },
        select: { userId: true },
      });
      targetUserIds = parents.map(p => p.userId);
      audienceLabel = `Program: ${program}`;
    } else {
      // All parents of this institution
      const users = await prisma.user.findMany({
        where:  { institutionId: payload.institutionId, role: "PARENT", isActive: true },
        select: { id: true },
      });
      targetUserIds = users.map(u => u.id);
    }

    // De-dup
    targetUserIds = [...new Set(targetUserIds)];

    if (targetUserIds.length === 0) {
      return errorResponse("No parents found for the selected audience");
    }

    // ── Send ──
    const result = await sendPushToUsers(targetUserIds, {
      title: title.trim(),
      body:  message.trim(),
      url:   url || "/dashboard/parent",
      tag:   `broadcast-${Date.now()}`,
    });

    // ── Log to history ──
    const notification = await prisma.notification.create({
      data: {
        institutionId: payload.institutionId,
        title:         title.trim(),
        body:          message.trim(),
        url:           url || null,
        audience:      audienceLabel,
        sentById:      payload.userId,
        targetCount:   targetUserIds.length,
        sentCount:     result.sent,
        failedCount:   result.failed,
      },
    });

    return successResponse({
      notification,
      result: {
        targeted:   targetUserIds.length,
        delivered:  result.sent,
        failed:     result.failed,
      },
    });
  } catch (error) {
    console.error("[notifications POST]", error);
    return serverErrorResponse();
  }
}
