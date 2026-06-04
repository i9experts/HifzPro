// app/api/whatsapp/test/route.ts
import { NextRequest } from "next/server";
import { sendWhatsApp } from "@/lib/whatsapp";
import { testConnectionMessage } from "@/lib/whatsapp-templates";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { phone } = await req.json();
    if (!phone) return errorResponse("Phone number is required");

    // Get institution name
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { institution: true },
    });

    const instituteName = user?.institution?.name || "HifzPro Institute";
    const message       = testConnectionMessage(instituteName);
    const result        = await sendWhatsApp(phone, message);

    if (result.success) {
      return successResponse({
        message:  "Test message sent successfully!",
        provider: result.provider,
        to:       phone,
      });
    }

    return errorResponse(`Failed to send: ${result.error}. Check your UltraMsg credentials.`);
  } catch (error) {
    console.error("WhatsApp test error:", error);
    return serverErrorResponse();
  }
}
