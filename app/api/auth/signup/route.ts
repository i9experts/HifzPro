// app/api/auth/signup/route.ts  — TEMP DEBUG VERSION
import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
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
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);
}
function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("") + "!";
}

export async function POST(req: NextRequest) {
  // ── 1. Parse ──
  let data: z.infer<typeof schema>;
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    data = result.data;
  } catch (e: any) {
    return errorResponse("STEP 1 PARSE ERROR: " + e.message);
  }

  // ── 2. Email check ──
  try {
    const emailExists = await prisma.user.findUnique({ where: { email: data.email } });
    if (emailExists) return errorResponse("An account with this email already exists.");
  } catch (e: any) {
    return errorResponse("STEP 2 EMAIL CHECK ERROR: " + e.message);
  }

  // ── 3. Phone check ──
  try {
    const phoneExists = await prisma.user.findFirst({ where: { phone: data.phone } });
    if (phoneExists) return errorResponse("An account with this phone number already exists.");
  } catch (e: any) {
    return errorResponse("STEP 3 PHONE CHECK ERROR: " + e.message);
  }

  const slug     = generateSlug(data.institutionName);
  const password = generatePassword();
  const hashedPw = await bcrypt.hash(password, 12);
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);

  // ── 4. Institution ──
  let institution: any;
  try {
    institution = await prisma.institution.create({
      data: { name: data.institutionName, slug, city: data.city, country: data.country, email: data.email, phone: data.phone, isActive: true, isOnboarded: false },
    });
  } catch (e: any) {
    return errorResponse("STEP 4 INSTITUTION ERROR: " + (e.code || "") + " " + e.message);
  }

  // ── 5. Campus ──
  let campus: any;
  try {
    campus = await prisma.campus.create({
      data: { institutionId: institution.id, name: `${data.institutionName} — Main Campus`, city: data.city, phone: data.phone, isActive: true },
    });
  } catch (e: any) {
    await prisma.institution.delete({ where: { id: institution.id } }).catch(() => {});
    return errorResponse("STEP 5 CAMPUS ERROR: " + (e.code || "") + " " + e.message);
  }

  // ── 6. Admin user ──
  let admin: any;
  try {
    admin = await prisma.user.create({
      data: { name: data.adminName, email: data.email, phone: data.phone, whatsapp: data.whatsapp || data.phone, passwordHash: hashedPw, role: "CAMPUS_ADMIN", institutionId: institution.id, campusId: campus.id, isActive: true },
    });
  } catch (e: any) {
    await prisma.campus.delete({ where: { id: campus.id } }).catch(() => {});
    await prisma.institution.delete({ where: { id: institution.id } }).catch(() => {});
    return errorResponse("STEP 6 USER ERROR: " + (e.code || "") + " " + e.message);
  }

  // ── 7. Subscription ──
  try {
    await prisma.subscription.create({
      data: { institutionId: institution.id, plan: "TRIAL", status: "TRIAL", amount: 0, trialEndsAt: trialEnd },
    });
  } catch (e: any) {
    await prisma.user.delete({ where: { id: admin.id } }).catch(() => {});
    await prisma.campus.delete({ where: { id: campus.id } }).catch(() => {});
    await prisma.institution.delete({ where: { id: institution.id } }).catch(() => {});
    return errorResponse("STEP 7 SUBSCRIPTION ERROR: " + (e.code || "") + " " + e.message);
  }

  // ── 8. WhatsApp (non-blocking) ──
  const whatsappNum = data.whatsapp || data.phone;
  const welcomeMsg = `🕌 *HifzPro میں خوش آمدید!*\nالسلام علیکم ${data.adminName} صاحب،\n\n🌐 www.hifzpro.com/signin\n📧 ${data.email}\n🔑 ${password}\n\n14 دن کا مفت ٹرائل شروع ہو گیا ہے`;
  sendWhatsApp(whatsappNum, welcomeMsg).catch(e => console.error("[signup] WA failed:", e));

  prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
    .then(sa => { if (sa?.whatsapp || sa?.phone) sendWhatsApp((sa.whatsapp || sa.phone)!, `🆕 نیا ادارہ: ${data.institutionName} — ${data.city}`).catch(() => {}); })
    .catch(() => {});

  return successResponse({ message: "Account created successfully", email: data.email, password, institutionId: institution.id, campusId: campus.id }, 201);
}
