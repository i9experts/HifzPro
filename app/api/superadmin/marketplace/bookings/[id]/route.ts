// app/api/superadmin/marketplace/bookings/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";

const actionSchema = z.object({
  action: z.enum(["CONFIRM_PAYMENT", "CANCEL"]),
  adminNotes: z.string().max(2000).optional(),
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
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Booking not found");

    const body = await req.json();
    const result = actionSchema.safeParse(body);
    if (!result.success) return errorResponse(result.error.errors[0].message);

    if (result.data.action === "CONFIRM_PAYMENT") {
      if (existing.status !== "ACCEPTED") return errorResponse("Only an accepted booking can have payment confirmed");
      const booking = await prisma.booking.update({
        where: { id },
        data: {
          status: "PAYMENT_CONFIRMED",
          paymentConfirmedAt: new Date(),
          paymentConfirmedById: payload.userId,
          adminNotes: result.data.adminNotes,
        },
      });
      return successResponse({ booking });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED", adminNotes: result.data.adminNotes },
    });
    return successResponse({ booking });
  } catch (error) {
    console.error("Admin update booking error:", error);
    return serverErrorResponse();
  }
}
