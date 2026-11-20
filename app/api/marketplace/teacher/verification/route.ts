// app/api/marketplace/teacher/verification/route.ts
// The comprehensive onboarding application — identity, education,
// ijazah/sanad, references, and a video introduction, submitted in one
// go. This is mandatory: app/api/marketplace/teacher/profile/route.ts
// refuses to set isListed until verificationStatus is APPROVED. An
// admin reviews the whole thing from the superadmin verification queue
// (app/api/superadmin/marketplace/verification-requests) and either
// grants a verificationTier (APPROVED) or leaves it with a reason
// (REJECTED) — the teacher can then edit and resubmit.
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";

const referenceSchema = z.object({
  name: z.string().trim().min(2),
  relationship: z.string().trim().min(2),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
}).refine(r => r.phone || r.email, { message: "Each reference needs a phone or an email" });

const schema = z.object({
  dateOfBirth: z.string().min(1), // ISO date
  nationality: z.string().trim().min(2),
  govIdType: z.string().trim().min(2),
  govIdDocumentUrl: z.string().min(1),
  qualification: z.string().trim().min(5, "Describe your education/qualifications in a bit more detail"),
  educationDocumentUrl: z.string().min(1),
  ijazahChain: z.string().trim().min(5, "Describe your sanad/chain of narration in a bit more detail"),
  ijazahIssuer: z.string().trim().min(2),
  ijazahDocumentUrl: z.string().min(1),
  videoIntroUrl: z.string().min(1),
  references: z.array(referenceSchema).min(1, "At least one reference is required").max(2),
});

export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "MARKETPLACE_TEACHER") return unauthorizedResponse();

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const existing = await prisma.teacherProfile.findUnique({ where: { userId: payload.userId } });
    if (!existing) return notFoundResponse("Teacher profile not found");
    if (existing.verificationStatus === "PENDING") return errorResponse("Your application is already under review");
    if (existing.verificationStatus === "APPROVED") return errorResponse("Your application has already been approved");

    const { references, ...rest } = result.data;

    const profile = await prisma.$transaction(async (tx) => {
      await tx.teacherReference.deleteMany({ where: { teacherId: existing.id } });
      return tx.teacherProfile.update({
        where: { userId: payload.userId },
        data: {
          ...rest,
          dateOfBirth: new Date(rest.dateOfBirth),
          verificationStatus: "PENDING",
          applicationSubmittedAt: new Date(),
          verificationRejectionReason: null,
          references: {
            create: references.map(r => ({
              name: r.name, relationship: r.relationship,
              phone: r.phone || null, email: r.email || null,
            })),
          },
        },
        include: { references: true },
      });
    });

    return successResponse({ profile });
  } catch (error) {
    console.error("Submit teacher application error:", error);
    return serverErrorResponse();
  }
}
