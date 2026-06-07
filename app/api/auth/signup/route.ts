// app/api/auth/signup/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api";
import { sendWhatsApp } from "@/lib/whatsapp";

const schema = z.object({
  // Institution
  institutionName: z.string().min(3),
  city:            z.string().min(2),
  country:         z.string().default("Pakistan"),
  // Admin contact
  adminName:       z.string().min(2),
  email:           z.string().email(),
  phone:           z.string().min(10),
  whatsapp:        z.string().optional(),
  // Info
  estimatedStudents: z.number().optional(),
  programs:          z.array(z.string()).optional(),
  referral:          z.string().optional(),
});

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({length:10}, ()=>chars[Math.floor(Math.random()*chars.length)]).join("") + "!";
}

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;

    // Check email not already used
    const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
    if (emailExists) return errorResponse("An account with this email already exists. Please sign in instead.");

    const slug     = generateSlug(data.institutionName);
    const password = generatePassword();
    const hashedPw = await bcrypt.hash(password, 12);

    // Trial end date — 14 days
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    // Create everything in a transaction
    const result2 = await prisma.$transaction(async tx => {
      // 1. Institution
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

      // 2. Default campus
      const campus = await tx.campus.create({
        data: {
          institutionId: institution.id,
          name:          `${data.institutionName} — Main Campus`,
          city:          data.city,
          phone:         data.phone,
          isActive:      true,
        },
      });

      // 3. Admin user
      const admin = await tx.user.create({
        data: {
          name:         data.adminName,
          email:        data.email,
          phone:        data.phone,
          whatsapp:     data.whatsapp || data.phone,
          passwordHash: hashedPw,
          role:         "CAMPUS_ADMIN",
          institutionId:institution.id,
          campusId:     campus.id,
          isActive:     true,
        },
      });

      // 4. Trial subscription
      await tx.subscription.create({
        data: {
          institutionId: institution.id,
          plan:          "TRIAL",
          status:        "TRIAL",
          amount:        0,
          trialEndsAt:   trialEnd,
        },
      });

      return { institution, campus, admin };
    });

    // Send WhatsApp credentials to admin
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
_HifzPro — پاکستان کا پہلا ذہین حفظ مینجمنٹ سسٹم_`;

    await sendWhatsApp(whatsappNum, welcomeMsg).catch(console.error);

    // Notify super admin
    const superAdminMsg = `🆕 *نیا ادارہ رجسٹر ہوا*\n🏫 ${data.institutionName}\n📍 ${data.city}\n👤 ${data.adminName}\n📞 ${data.phone}`;
    const superAdmin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
    if (superAdmin?.whatsapp || superAdmin?.phone) {
      await sendWhatsApp((superAdmin.whatsapp || superAdmin.phone)!, superAdminMsg).catch(console.error);
    }

    return successResponse({
      message:     "Account created successfully",
      email:       data.email,
      password,
      institutionId: result2.institution.id,
      campusId:    result2.campus.id,
    }, 201);
  } catch (error: any) {
    if (error?.code === "P2002") return errorResponse("Email or institution name already exists");
    console.error("Signup error:", error);
    return serverErrorResponse();
  }
}
