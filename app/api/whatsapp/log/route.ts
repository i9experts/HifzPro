// app/api/whatsapp/log/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const limit  = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status") || "";

    const where: any = { channel: "WHATSAPP" };
    if (status) where.status = status;

    const [total, notifications] = await Promise.all([
      prisma.notificationDelivery.count({ where }),
      prisma.notificationDelivery.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true, recipientId: true, type: true,
          status: true, sentAt: true, error: true,
          createdAt: true, body: true,
        },
      }),
    ]);

    // Stats
    const stats = await prisma.notificationDelivery.groupBy({
      by: ["status"],
      where: { channel: "WHATSAPP" },
      _count: true,
    });

    return successResponse({
      notifications,
      total,
      stats: {
        sent:    stats.find(s => s.status === "SENT")?._count    || 0,
        failed:  stats.find(s => s.status === "FAILED")?._count  || 0,
        pending: stats.find(s => s.status === "PENDING")?._count || 0,
      },
    });
  } catch (error) {
    console.error("WhatsApp log error:", error);
    return serverErrorResponse();
  }
}
