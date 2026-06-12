// app/api/admin/whatsapp/test/route.ts
// POST -> sends a test WhatsApp message using the institution's saved
//         config (or global env fallback), updates lastTestedAt on success.
// Body: { to: "+923001234567" }
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import { sendWhatsApp } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN", "SUPER_ADMIN"].includes(payload.role)) {
      return unauthorizedResponse();
    }
    if (!payload.institutionId) return unauthorizedResponse();

    const body = await req.json().catch(() => null);
    const to = String(body?.to || "").trim();
    if (!to) return errorResponse("Recipient number is required");

    const result = await sendWhatsApp({
      institutionId: payload.institutionId,
      to,
      message:
        "✅ HifzPro test message\n\nAssalamualaikum! This is a test message confirming your institute's WhatsApp number is connected to HifzPro successfully.\n\n— HifzPro (hifzpro.com)",
    });

    if (result.ok) {
      await prisma.whatsAppConfig
        .update({
          where: { institutionId: payload.institutionId },
          data: { lastTestedAt: new Date(), status: "connected" },
        })
        .catch(() => null);
      return successResponse(result);
    }

    return errorResponse(result.error || "Test message failed");
  } catch (error) {
    console.error("WhatsApp test send error:", error);
    return serverErrorResponse();
  }
}
