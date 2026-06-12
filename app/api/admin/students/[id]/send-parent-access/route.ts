// app/api/admin/students/[id]/send-parent-access/route.ts
// Sends parent portal access instructions via WhatsApp
// Parents log in with phone OTP — no password needed
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import { sendWhatsApp, normalizePhone } from "@/lib/whatsapp";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { id } = await params;

    // Get student with guardians and institution
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        guardians: {
          where:   { receiveUpdates: true },
          orderBy: { isEmergency: "desc" },
          take:    3,
        },
        campus: {
          include: {
            institution: { select: { name: true, nameArabic: true } },
          },
        },
        batch: { select: { name: true } },
      },
    });

    if (!student) return errorResponse("Student not found");

    const guardians = student.guardians;
    if (!guardians.length) return errorResponse("No guardian found for this student");

    const instName = student.campus?.institution?.name || "HifzPro Institute";
    let sentCount  = 0;
    const errors: string[] = [];

    for (const guardian of guardians) {
      const phone = guardian.whatsapp || guardian.phone;
      if (!phone) continue;

      const message = `*السلام عليكم ${guardian.name}* 🕌

آپ کے بچے *${student.name}* کو *${instName}* میں داخل کر لیا گیا ہے۔

اب آپ ہمارے *پیرنٹ پورٹل* سے اپنے بچے کی روزانہ تعلیمی ترقی دیکھ سکتے ہیں۔

━━━━━━━━━━━━━━━
📱 *Parent Portal — والدین پورٹل*
━━━━━━━━━━━━━━━
🌐 ویب سائٹ: *hifzpro.com/signin*
👤 رول: *Parent* منتخب کریں
📞 اپنا یہ نمبر درج کریں: *${phone}*
🔐 WhatsApp پر OTP آئے گا
━━━━━━━━━━━━━━━

*پورٹل پر کیا دیکھ سکتے ہیں:*
📖 روزانہ سبق کی تفصیل
✅ حاضری کا ریکارڈ
📊 حفظ کی ترقی
📝 امتحانات کے نتائج
💰 فیس کی تفصیل

━━━━━━━━━━━━━━━
*How to Login (English)*
1. Go to: hifzpro.com/signin
2. Select "Parent" tab
3. Enter your WhatsApp number: ${phone}
4. Enter the OTP sent to your WhatsApp
5. Select your child: ${student.name}

جزاك اللهُ خيراً 🤲
_${instName} — Powered by HifzPro_`;

      const result = await sendWhatsApp({ institutionId: payload.institutionId, to: normalizePhone(phone), message });
      if (result.ok) {
        sentCount++;
      } else {
        errors.push(`${guardian.name}: ${result.error}`);
      }
    }

    if (sentCount === 0) {
      return errorResponse(errors.length ? errors[0] : "Failed to send to any guardian");
    }

    return successResponse({
      sent:    sentCount,
      message: `Portal access sent to ${sentCount} guardian(s) of ${student.name}`,
    });

  } catch (error) {
    console.error("[send-parent-access]", error);
    return serverErrorResponse();
  }
}
