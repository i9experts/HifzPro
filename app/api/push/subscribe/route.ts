// app/api/push/subscribe/route.ts
// Saves / removes a browser push subscription for the logged-in user (any role)
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload?.userId) return unauthorizedResponse();

    const body = await req.json();
    const sub  = body.subscription;
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return errorResponse("Invalid subscription object");
    }

    await prisma.pushSubscription.upsert({
      where:  { endpoint: sub.endpoint },
      update: { userId: payload.userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth, userAgent: req.headers.get("user-agent") || null },
      create: {
        userId:    payload.userId,
        endpoint:  sub.endpoint,
        p256dh:    sub.keys.p256dh,
        auth:      sub.keys.auth,
        userAgent: req.headers.get("user-agent") || null,
      },
    });

    return successResponse({ subscribed: true });
  } catch (error) {
    console.error("[push/subscribe]", error);
    return serverErrorResponse();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload?.userId) return unauthorizedResponse();

    const body = await req.json().catch(() => ({}));
    if (body.endpoint) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint: body.endpoint, userId: payload.userId } });
    } else {
      await prisma.pushSubscription.deleteMany({ where: { userId: payload.userId } });
    }

    return successResponse({ subscribed: false });
  } catch (error) {
    console.error("[push/unsubscribe]", error);
    return serverErrorResponse();
  }
}
