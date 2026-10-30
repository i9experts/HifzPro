// app/api/superadmin/marketplace/bookings/[id]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from "@/lib/api";
import { refundBookingPayment } from "@/lib/stripe-connect";

const actionSchema = z.object({
  action: z.enum(["CONFIRM_PAYMENT", "CANCEL", "REFUND"]),
  adminNotes: z.string().max(2000).optional(),
  // Required to refund once the booking is inside (or past) its 24h
  // full-refund window — an explicit admin override, not an automatic entitlement.
  force: z.boolean().optional(),
});

// Full refund if cancelled more than 24h before the booking's first
// session; past that window a refund is still possible here but is an
// admin judgment call rather than an automatic entitlement.
function isWithinFullRefundWindow(booking: { dayOfWeek: number; startTime: string; paymentConfirmedAt: Date | null }): boolean {
  if (!booking.paymentConfirmedAt) return true;
  const now = new Date();
  const nextOccurrence = new Date(now);
  const daysUntil = (booking.dayOfWeek - now.getDay() + 7) % 7;
  nextOccurrence.setDate(now.getDate() + daysUntil);
  const [h, m] = booking.startTime.split(":").map(Number);
  nextOccurrence.setHours(h, m, 0, 0);
  if (daysUntil === 0 && nextOccurrence < now) nextOccurrence.setDate(nextOccurrence.getDate() + 7);
  return nextOccurrence.getTime() - now.getTime() > 24 * 60 * 60 * 1000;
}

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
      // Manual fallback for payment paths Stripe Connect doesn't cover
      // (e.g. a country Connect doesn't support, or a wire transfer) —
      // the real path is the parent's "Pay Now" button, confirmed
      // automatically by the webhook once Stripe reports success.
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

    if (result.data.action === "REFUND") {
      if (existing.status !== "PAYMENT_CONFIRMED") return errorResponse("Only a paid booking can be refunded");
      if (!isWithinFullRefundWindow(existing) && !result.data.force) {
        return errorResponse(
          "This booking's first session is less than 24h away (or has passed) — full-refund eligibility has lapsed. Resend with force:true to refund anyway as an admin judgment call.",
          409,
        );
      }
      if (existing.stripePaymentIntentId) {
        try {
          await refundBookingPayment(existing.stripePaymentIntentId);
        } catch (err: any) {
          return errorResponse(`Stripe refund failed: ${err?.message || "unknown error"}`);
        }
        // charge.refunded webhook will flip status to REFUNDED once Stripe confirms it;
        // adminNotes is saved now so the reason isn't lost if that arrives later.
        const booking = await prisma.booking.update({
          where: { id },
          data: { adminNotes: result.data.adminNotes },
        });
        return successResponse({ booking, note: "Refund requested — status will update once Stripe confirms it" });
      }
      // Manually-confirmed booking (no real Stripe charge to refund) — just record it.
      const booking = await prisma.booking.update({
        where: { id },
        data: { status: "REFUNDED", refundedAt: new Date(), adminNotes: result.data.adminNotes },
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
