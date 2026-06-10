// app/api/whatsapp/send/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { sendWhatsApp } from "@/lib/whatsapp";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import prisma from "@/lib/prisma";

const schema = z.object({
  to:       z.string().min(10),
  message:  z.string().min(1),
  type:     z.enum(["manual","sabaq","absence","test","health","welcome","weekly"]).optional(),
  studentId:z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const body   = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const { to, message, type, studentId } = result.data;

    // Send message
    const sendResult = await sendWhatsApp(to, message);

    // Log to database
    await prisma.notificationDelivery.create({
      data: {
        recipientId: to,
        channel:     "WHATSAPP",
        type:        type || "manual",
        body:        message,
        status:      sendResult.success ? "SENT" : "FAILED",
        sentAt:      sendResult.success ? new Date() : null,
        error:       sendResult.error || null,
        metadata:    studentId ? { studentId } : undefined,
      },
    });

    if (sendResult.success) return successResponse({ messageId: sendResult.messageId, provider: sendResult.provider });
    return errorResponse(`WhatsApp send failed: ${sendResult.error}`);
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return serverErrorResponse();
  }
}
