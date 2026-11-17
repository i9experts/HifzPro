// app/api/marketplace/teacher/verification/route.ts
// A teacher submits a credential/ID document and the tier they're
// requesting; an admin reviews it from the superadmin verification
// queue (app/api/superadmin/marketplace/verification-requests). This is
// deliberately separate from verificationTier itself, which stays the
// public badge until an admin actually approves a request.
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";

const TIERS = ["ID_VERIFIED", "CREDENTIAL_VERIFIED", "BACKGROUND_CHECKED"] as const;

const schema = z.object({
  documentUrl:   z.string().min(1),
  requestedTier: z.enum(TIERS),
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

    const profile = await prisma.teacherProfile.update({
      where: { userId: payload.userId },
      data: {
        verificationDocumentUrl: result.data.documentUrl,
        verificationRequestedTier: result.data.requestedTier,
        verificationStatus: "PENDING",
        verificationRequestedAt: new Date(),
        verificationRejectionReason: null,
      },
    });

    return successResponse({ profile });
  } catch (error) {
    console.error("Submit verification request error:", error);
    return serverErrorResponse();
  }
}
