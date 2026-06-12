// ============================================================
// app/api/admin/whatsapp/test/route.ts
// POST -> sends a test WhatsApp message using the institution's
//         saved config, updates lastTestedAt on success.
// Body: { to: "+923001234567" }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";

// ---- Replace with your real auth helper (same as the config route) ----
import { verifyAuth } from "@/lib/auth"; // <- adjust import
// -----------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req); // <- adjust call
  if (!auth?.institutionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const to = String(body?.to || "").trim();
  if (!to) {
    return NextResponse.json(
      { error: "Recipient number is required" },
      { status: 400 }
    );
  }

  const result = await sendWhatsApp({
    institutionId: auth.institutionId,
    to,
    message:
      "✅ HifzPro test message\n\nAssalamualaikum! This is a test message confirming your institute's WhatsApp number is connected to HifzPro successfully.\n\n— HifzPro (hifzpro.com)",
  });

  if (result.ok) {
    await prisma.whatsAppConfig
      .update({
        where: { institutionId: auth.institutionId },
        data: { lastTestedAt: new Date(), status: "connected" },
      })
      .catch(() => null);
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
