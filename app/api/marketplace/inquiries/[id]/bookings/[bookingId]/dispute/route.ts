// app/api/marketplace/inquiries/[id]/bookings/[bookingId]/dispute/route.ts
// Either side of an agreed-on booking can flag a problem for HifzPro
// support — separate from REFUND/CANCEL, which move money
// (app/api/superadmin/marketplace/bookings/[id]/route.ts). Raising one
// notifies every SUPER_ADMIN; resolving it is handled from
// app/api/superadmin/marketplace/disputes/[id]/route.ts.
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";
import { notifyDisputeRaised } from "@/lib/marketplace-notify";

const schema = z.object({ reason: z.string().trim().min(10, "Please describe the problem in a bit more detail").max(2000) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; bookingId: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { id, bookingId } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        teacher: { select: { userId: true } },
        parent: { select: { userId: true } },
        disputes: { where: { status: "OPEN" }, take: 1 },
      },
    });
    if (!booking || booking.inquiryId !== id) return notFoundResponse("Booking not found");
    const isTeacher = booking.teacher.userId === payload.userId;
    const isParent = booking.parent.userId === payload.userId;
    if (!isTeacher && !isParent) return unauthorizedResponse();
    if (!["ACCEPTED", "PAYMENT_CONFIRMED"].includes(booking.status)) {
      return errorResponse("A dispute can only be raised on an agreed-on booking");
    }
    if (booking.disputes.length > 0) return errorResponse("There's already an open dispute on this booking");

    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const dispute = await prisma.bookingDispute.create({
      data: { bookingId, raisedById: payload.userId, reason: result.data.reason },
    });

    const admins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      select: { name: true, email: true, whatsapp: true },
    });
    await notifyDisputeRaised(admins, {
      raisedByName: payload.name,
      reason: result.data.reason,
      bookingUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://hifzpro.com"}/superadmin/marketplace`,
    }).catch((err) => console.error("[dispute] notify failed:", err));

    return successResponse({ dispute }, 201);
  } catch (error) {
    console.error("Raise dispute error:", error);
    return serverErrorResponse();
  }
}
