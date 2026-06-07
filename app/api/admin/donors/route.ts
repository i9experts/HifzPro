// app/api/admin/donors/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";
import { sendWhatsApp } from "@/lib/whatsapp";

const schema = z.object({
  name:        z.string().min(2),
  email:       z.string().email().optional(),
  phone:       z.string().optional(),
  isAnonymous: z.boolean().default(false),
  password:    z.string().min(6).optional(),
  studentIds:  z.array(z.string()).optional(),
  scholarshipName:    z.string().optional(),
  scholarshipType:    z.enum(["FULL","PARTIAL_PERCENT","PARTIAL_AMOUNT"]).default("FULL"),
  scholarshipPercent: z.number().optional(),
  scholarshipAmount:  z.number().optional(),
  sendInvite:  z.boolean().default(true),
});

async function getIds(userId: string, payload: any) {
  if (payload.campusId && payload.institutionId) return payload;
  const u = await prisma.user.findUnique({ where:{ id:userId }, select:{ campusId:true, institutionId:true } });
  return { campusId: payload.campusId||u?.campusId, institutionId: payload.institutionId||u?.institutionId };
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { institutionId } = await getIds(payload.userId, payload);

    const donors = await prisma.donor.findMany({
      where:   { institutionId: institutionId || undefined },
      orderBy: { createdAt:"desc" },
      include: {
        scholarships: {
          include: {
            student: { select:{ id:true, name:true, enrollmentNumber:true, photo:true, status:true, progress:{ select:{ currentJuz:true, percentComplete:true } } } },
          },
        },
      },
    });

    const stats = {
      total:      donors.length,
      active:     donors.filter(d=>d.scholarships.some(s=>s.isActive)).length,
      anonymous:  donors.filter(d=>d.isAnonymous).length,
      totalStudentsSponsored: donors.reduce((acc,d)=>acc+d.scholarships.filter(s=>s.isActive).length,0),
    };

    return successResponse({ donors, stats });
  } catch (error) {
    console.error("Get donors error:", error);
    return serverErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { institutionId } = await getIds(payload.userId, payload);
    if (!institutionId) return errorResponse("Institution not found");

    const body   = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);
    const data = result.data;

    // Generate password if not provided
    const rawPassword = data.password || `Donor${Math.random().toString(36).slice(-6).toUpperCase()}!`;
    const passwordHash= await bcrypt.hash(rawPassword, 12);

    // Create donor
    const donor = await prisma.donor.create({
      data: {
        institutionId,
        name:         data.name,
        email:        data.email || null,
        phone:        data.phone || null,
        isAnonymous:  data.isAnonymous,
        passwordHash,
      },
    });

    // Link scholarships to selected students
    if (data.studentIds && data.studentIds.length > 0) {
      for (const studentId of data.studentIds) {
        // Deactivate existing donor scholarships for this student
        await prisma.scholarship.updateMany({
          where: { studentId, donorId: { not: null }, isActive: true },
          data:  { isActive: false, endDate: new Date() },
        });
        // Create new scholarship linked to this donor
        await prisma.scholarship.create({
          data: {
            studentId,
            donorId:     donor.id,
            name:        data.scholarshipName || `${data.name} Scholarship`,
            type:        data.scholarshipType,
            percentage:  data.scholarshipPercent || null,
            fixedAmount: data.scholarshipAmount  || null,
            isActive:    true,
            grantedById: payload.userId,
          },
        });
      }
    }

    // Send WhatsApp invite to donor
    if (data.sendInvite && data.phone) {
      const institution = await prisma.institution.findUnique({ where:{ id:institutionId }, select:{ name:true } });
      const msg = `🕌 *HifzPro Donor Portal*\nالسلام علیکم ${data.name} صاحب/صاحبہ،\n\nآپ کو ${institution?.name||"ہمارے ادارے"} کے طلبہ کی مالی معاونت کرنے پر جزاک اللہ خیراً۔\n\n*آپ کا Donor اکاؤنٹ تیار ہے:*\n🌐 portal.hifzpro.com/donor\n📧 ${data.email||"—"}\n🔑 ${rawPassword}\n\nلاگ ان کریں اور اپنے طلبہ کی ترقی دیکھیں۔\n_HifzPro — حفظ القرآن کی ڈیجیٹل خدمت_`;
      await sendWhatsApp(data.phone, msg).catch(console.error);
    }

    return successResponse({ donor, password: rawPassword }, 201);
  } catch (error: any) {
    console.error("Create donor error:", error);
    return serverErrorResponse();
  }
}
