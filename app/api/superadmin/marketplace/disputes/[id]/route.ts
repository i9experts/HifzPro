// app/api/superadmin/marketplace/disputes/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";
import { notifyDisputeResolved, inquiryUrlFor } from "@/lib/marketplace-notify";

const schema = z.object({
  action: z.enum(["RESOLVE", "DISMISS"]),
  resolution: z.string().trim().min(5).max(2000),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") return unauthorizedResponse();

    const { id } = await params;
    const existing = await prisma.bookingDispute.findUnique({
      where: { id },
      include: { raisedBy: { select: { name: true, email: true, whatsapp: true, role: true } }, booking: { select: { inquiryId: true } } },
    });
    if (!existing) return notFoundResponse("Dispute not found");
    if (existing.status !== "OPEN") return errorResponse("This dispute has already been closed");

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const dispute = await prisma.bookingDispute.update({
      where: { id },
      data: {
        status: result.data.action === "RESOLVE" ? "RESOLVED" : "DISMISSED",
        resolution: result.data.resolution,
        resolvedById: payload.userId,
        resolvedAt: new Date(),
      },
    });

    await notifyDisputeResolved(existing.raisedBy, {
      resolution: result.data.resolution,
      dismissed: result.data.action === "DISMISS",
      inquiryUrl: inquiryUrlFor(existing.raisedBy.role === "MARKETPLACE_TEACHER" ? "teacher" : "parent", existing.booking.inquiryId),
    }).catch((err) => console.error("[dispute] notify failed:", err));

    return successResponse({ dispute });
  } catch (error) {
    console.error("Resolve dispute error:", error);
    return serverErrorResponse();
  }
}
