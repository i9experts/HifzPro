// app/api/superadmin/institutions/[id]/resend-credentials/route.ts
// Super-admin support tool: resets a subscriber institution's admin
// password and resends login details via email + WhatsApp. Exists so
// support can help a subscriber who never received (or lost) their
// original signup credentials without touching the database directly.
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendEmail, renderCredentialsEmail } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("") + "!";
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") return unauthorizedResponse();

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const userId: string | undefined = body.userId;
    if (!userId) return errorResponse("userId is required");

    const institution = await prisma.institution.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!institution) return notFoundResponse("Institution not found");

    const admin = await prisma.user.findFirst({
      where: { id: userId, institutionId: id, role: "CAMPUS_ADMIN" },
      select: { id: true, name: true, email: true, phone: true, whatsapp: true },
    });
    if (!admin) return notFoundResponse("Admin account not found for this institution");

    const newPassword = generatePassword();
    const hashedPw = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: admin.id }, data: { passwordHash: hashedPw } });

    const loginUrl = "https://www.hifzpro.com/signin";
    const whatsappNum = admin.whatsapp || admin.phone;

    const [waResult, emailResult] = await Promise.all([
      whatsappNum
        ? sendWhatsApp({
            institutionId: id,
            to: whatsappNum,
            message: `🕌 *HifzPro — Login Details Resent*\nالسلام علیکم ${admin.name} صاحب،\n\nآپ کی درخواست پر نیا پاسورڈ جاری کر دیا گیا ہے۔\n\n🌐 ${loginUrl}\n📧 ${admin.email}\n🔑 ${newPassword}\n\n_Support requested this reset on your behalf._`,
          })
        : Promise.resolve({ ok: false, provider: "ultramsg" as const, error: "No WhatsApp/phone on file" }),
      admin.email
        ? sendEmail({
            to: admin.email,
            subject: `Your ${institution.name} login details — HifzPro`,
            html: renderCredentialsEmail({
              recipientName: admin.name,
              roleLabel: "Campus Admin",
              institutionName: institution.name,
              loginUrl,
              email: admin.email,
              password: newPassword,
              note: "Requested by HifzPro support on your behalf.",
            }),
          })
        : Promise.resolve({ ok: false, error: "No email on file" }),
    ]);

    if (!waResult.ok && !emailResult.ok) {
      // Password was reset but neither channel delivered — surface it so
      // support can still relay it manually.
      return successResponse({
        sent: false,
        password: newPassword,
        warning: "Password reset but delivery failed on both WhatsApp and email. Share credentials manually.",
        error: waResult.error || emailResult.error,
      });
    }

    const via = [waResult.ok && "WhatsApp", emailResult.ok && "email"].filter(Boolean).join(" and ");
    return successResponse({
      sent: true,
      message: `Login credentials resent to ${admin.name} via ${via}`,
    });
  } catch (error) {
    console.error("[superadmin resend-credentials]", error);
    return serverErrorResponse();
  }
}
