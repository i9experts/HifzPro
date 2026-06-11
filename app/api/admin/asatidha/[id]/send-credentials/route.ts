// app/api/admin/asatidha/[id]/send-credentials/route.ts
// Resets Ustadh password and sends login details via WhatsApp
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import { sendWhatsApp, normalizePhone } from "@/lib/whatsapp";

type Params = { params: Promise<{ id: string }> };

function generatePassword(): string {
  const words    = ["Hifz","Quran","Ustadh","Islam","Noor","Ilm","Barakah"];
  const word     = words[Math.floor(Math.random() * words.length)];
  const numbers  = Math.floor(1000 + Math.random() * 9000);
  const specials = ["@","#","!","$"][Math.floor(Math.random() * 4)];
  return `${word}${specials}${numbers}`;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { id } = await params;

    // Get Ustadh with user account
    const ustadh = await prisma.ustadh.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!ustadh) return errorResponse("Ustadh not found");

    // Check they belong to this institution
    const user = await prisma.user.findUnique({
      where: { id: ustadh.userId },
      select: { institutionId: true, phone: true },
    });
    if (!user) return errorResponse("User account not found");
    if (payload.role !== "SUPER_ADMIN" && user.institutionId !== payload.institutionId) {
      return unauthorizedResponse();
    }

    // Get WhatsApp number — from ustadh record or user phone
    const phone = (ustadh as any).whatsapp || (ustadh as any).phone || user.phone;
    if (!phone) return errorResponse("No WhatsApp number found for this Ustadh. Please add their phone number first.");

    // Generate and save new password
    const newPassword  = generatePassword();
    const hashedPw     = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: ustadh.userId },
      data:  { passwordHash: hashedPw },
    });

    // Send via WhatsApp
    const instName = payload.institutionId
      ? (await prisma.institution.findUnique({ where: { id: payload.institutionId }, select: { name: true } }))?.name || "HifzPro"
      : "HifzPro";

    const message = `*السلام عليكم ${ustadh.user.name}* 🕌

آپ کو *${instName}* میں بطور استاذ شامل کر لیا گیا ہے۔

━━━━━━━━━━━━━━━
📱 *HifzPro لاگ ان تفصیلات*
━━━━━━━━━━━━━━━
🌐 ویب سائٹ: hifzpro.com/signin
📧 ای میل: ${ustadh.user.email}
🔑 پاسورڈ: ${newPassword}
👤 رول: Ustadh

━━━━━━━━━━━━━━━
*Login Details (English)*
🌐 Website: hifzpro.com/signin
📧 Email: ${ustadh.user.email}
🔑 Password: ${newPassword}

پہلی بار لاگ ان کے بعد پاسورڈ تبدیل کریں۔
_Please change your password after first login._

جزاك اللهُ خيراً 🤲
_HifzPro — Memorize · Protect · Excel_`;

    const result = await sendWhatsApp(normalizePhone(phone), message);

    if (!result.success) {
      // Password was reset but WhatsApp failed — still return success with warning
      return successResponse({
        sent:     false,
        password: newPassword,
        warning:  "Password reset successfully but WhatsApp delivery failed. Share credentials manually.",
        error:    result.error,
      });
    }

    return successResponse({
      sent:    true,
      message: `Login credentials sent to ${ustadh.user.name} via WhatsApp`,
    });

  } catch (error) {
    console.error("[send-credentials]", error);
    return serverErrorResponse();
  }
}
