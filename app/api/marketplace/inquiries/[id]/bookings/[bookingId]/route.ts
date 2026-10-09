// app/api/marketplace/inquiries/[id]/bookings/[bookingId]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";

const respondSchema = z.object({ action: z.enum(["ACCEPT", "DECLINE"]) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; bookingId: string }> }
) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload) return unauthorizedResponse();

    const { id, bookingId } = await params;
    const inquiry = await prisma.teacherInquiry.findUnique({
      where: { id },
      include: { teacher: { select: { userId: true } }, parent: { select: { userId: true } } },
    });
    if (!inquiry) return notFoundResponse("Inquiry not found");
    const isTeacher = inquiry.teacher.userId === payload.userId;
    const isParent  = inquiry.parent.userId === payload.userId;
    if (!isTeacher && !isParent) return notFoundResponse("Inquiry not found");

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.inquiryId !== id) return notFoundResponse("Booking not found");
    if (booking.status !== "PROPOSED") return errorResponse("This proposal has already been responded to");
    if (booking.proposedById === payload.userId) return errorResponse("You can't respond to your own proposal — waiting on the other side");

    const body = await req.json();
    const result = respondSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: result.data.action === "ACCEPT" ? "ACCEPTED" : "DECLINED", respondedAt: new Date() },
    });

    return successResponse({ booking: updated });
  } catch (error) {
    console.error("Respond to booking error:", error);
    return serverErrorResponse();
  }
}
