// app/api/superadmin/marketplace/verification-requests/[teacherId]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";
import { notifyVerificationApproved, notifyVerificationRejected } from "@/lib/marketplace-notify";

const TIERS = ["ID_VERIFIED", "CREDENTIAL_VERIFIED", "BACKGROUND_CHECKED"] as const;
const TIER_LABELS: Record<string, string> = {
  ID_VERIFIED: "ID Verified",
  CREDENTIAL_VERIFIED: "Credential Verified",
  BACKGROUND_CHECKED: "Background Checked",
};

const schema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  tier: z.enum(TIERS).optional(), // required for APPROVE — the admin decides, based on what the application actually supports
  rejectionReason: z.string().trim().max(1000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") return unauthorizedResponse();

    const { teacherId } = await params;
    const existing = await prisma.teacherProfile.findUnique({
      where: { id: teacherId },
      include: { user: { select: { name: true, email: true, whatsapp: true } } },
    });
    if (!existing) return notFoundResponse("Teacher not found");
    if (existing.verificationStatus !== "PENDING") return errorResponse("This teacher has no pending application");

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    if (result.data.action === "APPROVE") {
      if (!result.data.tier) return errorResponse("Pick a verification tier to grant before approving");
      const tier = result.data.tier;
      const profile = await prisma.teacherProfile.update({
        where: { id: teacherId },
        data: { verificationTier: tier, verificationStatus: "APPROVED" },
      });
      await notifyVerificationApproved(existing.user, { tierLabel: TIER_LABELS[tier] || tier })
        .catch((err) => console.error("[verification] notify failed:", err));
      return successResponse({ profile });
    }

    if (!result.data.rejectionReason) return errorResponse("A rejection reason is required");
    const profile = await prisma.teacherProfile.update({
      where: { id: teacherId },
      data: { verificationStatus: "REJECTED", verificationRejectionReason: result.data.rejectionReason },
    });
    await notifyVerificationRejected(existing.user, { reason: result.data.rejectionReason })
      .catch((err) => console.error("[verification] notify failed:", err));
    return successResponse({ profile });
  } catch (error) {
    console.error("Review verification request error:", error);
    return serverErrorResponse();
  }
}
