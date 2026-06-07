// app/api/onboarding/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

async function getCampusAndInstitution(userId: string, jwtCampusId?: string | null, jwtInstitutionId?: string | null) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { campusId: true, institutionId: true },
  });
  return {
    campusId:      jwtCampusId      || user?.campusId,
    institutionId: jwtInstitutionId || user?.institutionId,
  };
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN","SUPER_ADMIN"].includes(payload.role)) return unauthorizedResponse();

    const { campusId, institutionId } = await getCampusAndInstitution(payload.userId, payload.campusId, payload.institutionId);
    if (!campusId || !institutionId) return errorResponse("Campus or Institution not found");

    const body = await req.json();
    const { step } = body;

    // ── STEP 1: Update institution profile ──
    if (step === 1) {
      const schema = z.object({
        name:      z.string().min(2),
        nameArabic:z.string().optional(),
        city:      z.string().optional(),
        address:   z.string().optional(),
        phone:     z.string().optional(),
        email:     z.string().email().optional(),
        website:   z.string().optional(),
        logo:      z.string().optional(),
        mushaf:    z.string().optional(),
      });
      const r = schema.safeParse(body);
      if (!r.success) return errorResponse(r.error.errors[0].message);
      await prisma.institution.update({ where: { id: institutionId }, data: r.data });
      return successResponse({ step: 1, done: true });
    }

    // ── STEP 2: Update campus ──
    if (step === 2) {
      const schema = z.object({
        campusName:  z.string().min(2),
        address:     z.string().optional(),
        city:        z.string().optional(),
        phone:       z.string().optional(),
        sessionTime: z.string().optional(),
      });
      const r = schema.safeParse(body);
      if (!r.success) return errorResponse(r.error.errors[0].message);
      await prisma.campus.update({
        where: { id: campusId },
        data: {
          name:    r.data.campusName,
          address: r.data.address,
          city:    r.data.city,
          phone:   r.data.phone,
        },
      });
      return successResponse({ step: 2, done: true });
    }

    // ── STEP 3: Create first Ustadh ──
    if (step === 3) {
      const schema = z.object({
        ustadhName:     z.string().min(2),
        ustadhEmail:    z.string().email(),
        ustadhPassword: z.string().min(6),
        ustadhPhone:    z.string().optional(),
        qualification:  z.string().optional(),
      });
      const r = schema.safeParse(body);
      if (!r.success) return errorResponse(r.error.errors[0].message);
      const d = r.data;

      const existing = await prisma.user.findUnique({ where: { email: d.ustadhEmail } });
      if (existing) return errorResponse("An account with this email already exists");

      const hash    = await bcrypt.hash(d.ustadhPassword, 12);
      const uUser   = await prisma.user.create({
        data: {
          name:         d.ustadhName,
          email:        d.ustadhEmail,
          phone:        d.ustadhPhone || null,
          passwordHash: hash,
          role:         "USTADH",
          institutionId,
          campusId,
          isActive:     true,
        },
      });
      const ustadh = await prisma.ustadh.create({
        data: { userId: uUser.id, qualification: d.qualification || null },
      });
      return successResponse({ step: 3, done: true, ustadhId: ustadh.id, userId: uUser.id });
    }

    // ── STEP 4: Create first Batch ──
    if (step === 4) {
      const schema = z.object({
        batchName:   z.string().min(2),
        program:     z.enum(["HIFZ","NAZRA","TAJWEED","GIRDAAN"]),
        ustadhId:    z.string().optional(),
        sessionTime: z.string().optional(),
        maxStudents: z.number().default(20),
      });
      const r = schema.safeParse(body);
      if (!r.success) return errorResponse(r.error.errors[0].message);
      const d = r.data;

      // Find ustadh if not provided
      let ustadhId = d.ustadhId;
      if (!ustadhId) {
        const u = await prisma.ustadh.findFirst({ where: { user: { campusId } } });
        ustadhId = u?.id;
      }

      const batch = await prisma.batch.create({
        data: {
          campusId,
          ustadhId:    ustadhId || null,
          name:        d.batchName,
          program:     d.program,
          sessionTime: d.sessionTime || null,
          maxStudents: d.maxStudents,
          isActive:    true,
        },
      });
      return successResponse({ step: 4, done: true, batchId: batch.id });
    }

    // ── STEP 5: Enroll first student ──
    if (step === 5) {
      const schema = z.object({
        studentName:    z.string().min(2),
        guardianName:   z.string().min(2),
        guardianPhone:  z.string().min(10),
        program:        z.enum(["HIFZ","NAZRA","TAJWEED","GIRDAAN"]),
        batchId:        z.string().optional(),
        dateOfBirth:    z.string().optional(),
      });
      const r = schema.safeParse(body);
      if (!r.success) return errorResponse(r.error.errors[0].message);
      const d = r.data;

      // Find batch if not provided
      let batchId = d.batchId;
      if (!batchId) {
        const b = await prisma.batch.findFirst({ where: { campusId, isActive: true } });
        batchId = b?.id;
      }

      // Generate enrollment number
      const count = await prisma.student.count({ where: { campusId } });
      const campus = await prisma.campus.findUnique({ where: { id: campusId }, include: { institution: true } });
      const prefix = (campus?.institution?.name || "HP").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,3);
      const enrollmentNumber = `${prefix}-${String(count+1).padStart(4,"0")}`;

      const student = await prisma.student.create({
        data: {
          campusId,
          batchId:    batchId || null,
          name:       d.studentName,
          program:    d.program,
          enrollmentNumber,
          enrolledAt: new Date(),
          dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : null,
          status:     "ACTIVE",
        },
      });

      await prisma.guardian.create({
        data: {
          studentId:      student.id,
          name:           d.guardianName,
          relation:       "Parent",
          phone:          d.guardianPhone,
          whatsapp:       d.guardianPhone,
          receiveUpdates: true,
        },
      });

      await prisma.studentProgress.create({
        data: {
          studentId:      student.id,
          currentJuz:     1,
          percentComplete:0,
        },
      });

      return successResponse({ step: 5, done: true, studentId: student.id });
    }

    // ── STEP 6: Mark onboarding complete ──
    if (step === 6) {
      await prisma.institution.update({
        where: { id: institutionId },
        data:  { isOnboarded: true },
      });
      return successResponse({ step: 6, done: true, message: "Onboarding complete!" });
    }

    return errorResponse("Invalid step");
  } catch (error: any) {
    if (error?.code === "P2002") return errorResponse("This email already exists");
    console.error("Onboarding error:", error);
    return serverErrorResponse();
  }
}
