// app/api/auth/signup/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api";
import { sendWhatsApp } from "@/lib/whatsapp";

const schema = z.object({
  institutionName:   z.string().min(3),
  city:              z.string().min(2),
  country:           z.string().default("Pakistan"),
  adminName:         z.string().min(2),
  email:             z.string().email(),
  phone:             z.string().min(10),
  whatsapp:          z.string().optional(),
  estimatedStudents: z.number().optional(),
  programs:          z.array(z.string()).optional(),
  referral:          z.string().optional(),
});

function generateSlug(name: string): string {
  return (
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString(36)
  );
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return (
    Array.from({ length: 10 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("") + "!"
  );
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse & validate ──
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success)
      return errorResponse(result.error.errors[0].message);
    const data = result.data;

    // ── 2. Email uniqueness ──
    const emailExists = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (emailExists)
      return errorResponse(
        "An account with this email already exists. Please sign in instead."
      );

    // ── 3. Phone uniqueness ──
    const phoneExists = await prisma.user.findFirst({
      where: { phone: data.phone },
    });
    if (phoneExists)
      return errorResponse(
        "An account with this phone number already exists. Please sign in instead."
      );

    const slug      = generateSlug(data.institutionName);
    const password  = generatePassword();
    const hashedPw  = await bcrypt.hash(password, 12);
    const trialEnd  = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    // ── 4. Transaction ──
    console.log("[signup] starting transaction for:", data.email);
    const txResult = await prisma.$transaction(async (tx) => {

      const institution = await tx.institution.create({
        data: {
          name:        data.institutionName,
          slug,
          city:        data.city,
          country:     data.country,
          email:       data.email,
          phone:       data.phone,
          isActive:    true,
          isOnboarded: false,
        },
      });
      console.log("[signup] institution created:", institution.id);

      const campus = await tx.campus.create({
        data: {
          institutionId: institution.id,
          name:          `${data.institutionName} — Main Campus`,
          city:          data.city,
          phone:         data.phone,
          isActive:      true,
        },
      });
      console.log("[signup] campus created:", campus.id);

      const admin = await tx.user.create({
        data: {
          name:          data.adminName,
          email:         data.email,
          phone:         data.phone,
          whatsapp:      data.whatsapp || data.phone,
          passwordHash:  hashedPw,
          role:          "CAMPUS_ADMIN",
          institutionId: institution.id,
          campusId:      campus.id,
          isActive:      true,
        },
      });
      console.log("[signup] admin user created:", admin.id);

      await tx.subscription.create({
        data: {
          institutionId: institution.id,
          plan:          "TRIAL",
          status:        "TRIAL",
          amount:        0,
          trialEndsAt:   trialEnd,
        },
      });
      console.log("[signup] subscription created");

      return { institution, campus, admin };
    });

    // ── 5. WhatsApp welcome message (non-blocking) ──
    const whatsappNum = data.whatsapp || data.phone;
    const welcomeMsg = `🕌 *HifzPro میں خوش آمدید!*
━━━━━━━━━━━━━━━
السلام علیکم ${data.adminName} صاحب،

آپ کا HifzPro اکاؤنٹ تیار ہے۔ 🎉

*لاگ ان تفصیلات:*
🌐 ویب سائٹ: www.hifzpro.com/signin
📧 ای میل: ${data.email}
🔑 پاس ورڈ: ${password}

*14 دن کا مفت ٹرائل شروع ہو گیا ہے*
━━━━━━━━━━━━━━━
_HifzPro — پاکستان کا پہلا انٹیلیجینٹ حفظ مینجمنٹ سسٹم_`;

    sendWhatsApp(whatsappNum, welcomeMsg).catch((e) =>
      console.error("[signup] WhatsApp welcome failed:", e)
    );

    // ── 6. Notify super admin (non-blocking) ──
    prisma.user
      .findFirst({ where: { role: "SUPER_ADMIN" } })
      .then((superAdmin) => {
        const notifyNum = superAdmin?.whatsapp || superAdmin?.phone;
        if (notifyNum) {
          const msg = `🆕 *نیا ادارہ رجسٹر ہوا*\n🏫 ${data.institutionName}\n📍 ${data.city}\n👤 ${data.adminName}\n📞 ${data.phone}`;
          sendWhatsApp(notifyNum, msg).catch((e) =>
            console.error("[signup] super admin notify failed:", e)
          );
        }
      })
      .catch((e) => console.error("[signup] super admin lookup failed:", e));

    console.log("[signup] success for:", data.email);

    return successResponse(
      {
        message:       "Account created successfully",
        email:         data.email,
        password,
        institutionId: txResult.institution.id,
        campusId:      txResult.campus.id,
      },
      201
    );
  } catch (error: any) {
    console.error("[signup] FATAL ERROR:", error?.code, error?.message, error);
    if (error?.code === "P2002") {
      const field = error?.meta?.target?.[0] || "field";
      return errorResponse(`This ${field} is already registered. Please sign in.`);
    }
    return serverErrorResponse(
      "Something went wrong creating your account. Please try again."
    );
  }
}
